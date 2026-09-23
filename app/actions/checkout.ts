"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { getOrCreateCart } from "@/server/services/cart.service";
import { guestCheckoutSchema } from "@/lib/validation/checkout";
import { validateCouponForOrder, redeemCoupon } from "@/server/services/coupons.service";

export type CheckoutFormState = { status: "idle" | "error"; message?: string };

export async function placeOrderAction(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  if (cart.items.length === 0) return { status: "error" as const, message: "Sepetiniz boş." };

  let guest: { guestName: string; guestEmail: string; guestPhone: string } | null = null;
  if (!session?.user?.id) {
    const parsed = guestCheckoutSchema.safeParse({
      guestName: formData.get("guestName"),
      guestEmail: formData.get("guestEmail"),
      guestPhone: formData.get("guestPhone"),
    });
    if (!parsed.success) return { status: "error" as const, message: "Lütfen bilgilerinizi kontrol edin." };
    guest = parsed.data;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0);

  const rawCouponCode = String(formData.get("couponCode") ?? "").trim();
  let discountTotal = 0;
  let appliedCouponId: string | null = null;
  let couponCode: string | null = null;

  if (rawCouponCode) {
    const result = await validateCouponForOrder(rawCouponCode, subtotal);
    if (!result.ok) return { status: "error" as const, message: result.message };
    discountTotal = result.discount;
    appliedCouponId = result.coupon.id;
    couponCode = result.coupon.code;
  }

  const total = Math.max(0, subtotal - discountTotal);
  const paymentMethod = formData.get("paymentMethod") === "PAYPAL" ? "PAYPAL" : "MANUAL";

  const order = await db.order.create({
    data: {
      userId: session?.user?.id,
      guestName: guest?.guestName,
      guestEmail: guest?.guestEmail,
      guestPhone: guest?.guestPhone,
      status: "AWAITING_PAYMENT",
      subtotal,
      discountTotal,
      total,
      couponCode,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          titleSnapshot: item.product.title,
          unitPrice: item.unitPriceSnapshot,
          quantity: item.quantity,
          lineTotal: Number(item.unitPriceSnapshot) * item.quantity,
        })),
      },
      payment: { create: { provider: paymentMethod, amount: total, status: "PENDING" } },
    },
  });

  if (appliedCouponId) await redeemCoupon(appliedCouponId);
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  redirect(paymentMethod === "PAYPAL" ? `/checkout/pay/${order.id}` : `/checkout/received?order=${order.id}`);
}
