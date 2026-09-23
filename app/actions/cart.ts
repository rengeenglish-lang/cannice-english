"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { addToCart, clearCart, findCart, removeFromCart } from "@/server/services/cart.service";
import { addFavorite } from "@/server/services/favorites.service";
import { validateCouponForOrder } from "@/server/services/coupons.service";
import { CART_COUPON_COOKIE } from "@/lib/cart";

async function currentUserId() {
  return (await auth())?.user?.id;
}

function refreshCart() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function addToCartAction(productId: string) {
  await addToCart(productId, await currentUserId());
  refreshCart();
}

/** Removes a line and returns to the cart with a "Geri al" banner for that product. */
export async function removeCartItemAction(cartItemId: string) {
  const removed = await removeFromCart(cartItemId, await currentUserId());
  refreshCart();
  if (!removed) redirect("/cart");
  const params = new URLSearchParams({ kaldirildi: removed.productId });
  if (removed.groupSlotId) params.set("saat", removed.groupSlotId);
  redirect(`/cart?${params}`);
}

/** "Geri al" — puts a just-removed product back, with its chosen group time if it still belongs to it. */
export async function restoreCartItemAction(productId: string, groupSlotId: string | null) {
  const product = await db.product.findUnique({ where: { id: productId }, include: { course: true } });
  if (!product) redirect("/cart");
  let slotId: string | undefined;
  if (groupSlotId && product.course) {
    const slot = await db.liveSession.findFirst({ where: { id: groupSlotId, courseId: product.course.id } });
    slotId = slot?.id;
  }
  await addToCart(product.id, await currentUserId(), { groupSlotId: slotId });
  refreshCart();
  redirect("/cart");
}

export async function clearCartAction() {
  await clearCart(await currentUserId());
  (await cookies()).delete(CART_COUPON_COOKIE);
  refreshCart();
  redirect("/cart");
}

/** "Favorilere taşı" — saves the product to Favorilerim and takes it out of the cart. */
export async function moveToFavoritesAction(cartItemId: string) {
  const userId = await currentUserId();
  if (!userId) redirect(`/sign-in?next=${encodeURIComponent("/cart")}`);
  const cart = await findCart(userId);
  const item = cart?.items.find((i) => i.id === cartItemId);
  if (!item) redirect("/cart");
  await addFavorite(userId, item.productId);
  await removeFromCart(item.id, userId);
  refreshCart();
  revalidatePath("/dashboard/favoriler");
  redirect(`/cart?favori=${encodeURIComponent(item.product.title)}`);
}

export type CouponFormState = { status: "idle" | "error"; message?: string };

/** Applies a coupon in the cart so the discounted total is visible before checkout; the code is carried into the checkout form. */
export async function applyCartCouponAction(_state: CouponFormState, formData: FormData): Promise<CouponFormState> {
  const code = String(formData.get("couponCode") ?? "").trim().toUpperCase();
  if (!code) return { status: "error", message: "Lütfen bir kupon kodu girin." };
  const cart = await findCart(await currentUserId());
  const subtotal = (cart?.items ?? []).reduce((sum, i) => sum + Number(i.product.salePrice) * i.quantity, 0);
  const result = await validateCouponForOrder(code, subtotal);
  if (!result.ok) return { status: "error", message: result.message };
  (await cookies()).set(CART_COUPON_COOKIE, result.coupon.code, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
  refreshCart();
  return { status: "idle" };
}

export async function removeCartCouponAction() {
  (await cookies()).delete(CART_COUPON_COOKIE);
  refreshCart();
}
