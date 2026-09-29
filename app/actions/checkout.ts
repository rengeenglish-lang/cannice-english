"use server";

import { acceptCheckoutConsents } from "@/lib/checkout-consent";
import { getPublishedLegalContent } from "@/server/services/legal-content.service";
import { getCheckoutConsentRequirements } from "@/server/services/checkout-consent.service";
import { findNetfenerEdition } from "@/lib/netfener-ebook-editions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { cookies } from "next/headers";
import { getOrCreateCart, refreshCartPrices } from "@/server/services/cart.service";
import { inspectCart } from "@/server/services/cart-checks.service";
import { getAuthContext } from "@/server/auth/context";
import { CART_COUPON_COOKIE } from "@/lib/cart";
import { guestCheckoutSchema } from "@/lib/validation/checkout";
import { validateCouponForOrder, redeemCoupon } from "@/server/services/coupons.service";

export type CheckoutFormState = { status: "idle" | "error"; message?: string };

export async function placeOrderAction(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  if (cart.items.length === 0) return { status: "error" as const, message: "Sepetiniz boş." };
  if (!session?.user?.id && cart.items.some((item) => findNetfenerEdition(item.product.slug))) {
    return { status: "error", message: "E-kitap satın almak için lütfen giriş yapın veya üye olun." };
  }
  // Same checks the cart page shows (unpublished product, full group time, plan below the one the
  // student holds, already-owned item...) — enforced here too, and always at today's prices.
  await refreshCartPrices(cart);
  const { issues, blocking } = await inspectCart(cart, await getAuthContext());
  if (blocking) return { status: "error" as const, message: issues.find((i) => i.level === "error")!.message };

  let checkoutConsent;
  try {
    const legal = await getPublishedLegalContent();
    const now = new Date();
    const { requirements, deliveries } = await getCheckoutConsentRequirements(cart.items, now);
    checkoutConsent = { ...acceptCheckoutConsents(requirements, formData, now, legal.configuration),
      deliveries: deliveries.map((item) => ({ ...item, liveStartsAt: item.liveStartsAt?.toISOString() ?? null })),
      documents: ["mesafeli-satis-sozlesmesi", "on-bilgilendirme-formu", "iade-politikasi"].map((key) => ({ key, title: legal.documents[key].title, body: legal.documents[key].body, sections: legal.documents[key].sections ?? [], draft: legal.documents[key].draft !== false })),
    };
  } catch (error) { return { status: "error", message: error instanceof Error ? error.message : "Sipariş onaylarını kontrol edin." }; }

  let guest: { guestName: string; guestEmail: string; guestPhone: string } | null = null;
  if (!session?.user?.id) {
    // Plans and group lessons attach to a student account (Canlı Derslerim, plan access), which
    // a guest order has nowhere to deliver to.
    if (cart.items.some((item) => item.product.category === "PLAN" || item.product.category === "PREP_GROUP")) {
      return { status: "error" as const, message: "Plan ve canlı grup dersi satın almak için lütfen önce giriş yapın veya üye olun." };
    }
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
      checkoutConsent,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          titleSnapshot: item.product.title,
          unitPrice: item.unitPriceSnapshot,
          quantity: item.quantity,
          lineTotal: Number(item.unitPriceSnapshot) * item.quantity,
          groupSlotId: item.groupSlotId,
        })),
      },
      payment: { create: { provider: paymentMethod, amount: total, status: "PENDING" } },
    },
  });

  if (appliedCouponId) await redeemCoupon(appliedCouponId);
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  (await cookies()).delete(CART_COUPON_COOKIE);

  redirect(paymentMethod === "PAYPAL" ? `/checkout/pay/${order.id}` : `/checkout/received?order=${order.id}`);
}
