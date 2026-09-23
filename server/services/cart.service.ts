import "server-only";
import { cookies } from "next/headers";
import { db } from "@/server/db";

const CART_COOKIE = "cannice_cart_token";

async function getOrCreateCartToken() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const token = crypto.randomUUID();
  store.set(CART_COOKIE, token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return token;
}

export async function getOrCreateCart(userId?: string) {
  if (userId) {
    return db.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: { include: { product: true } } },
    });
  }
  const token = await getOrCreateCartToken();
  return db.cart.upsert({
    where: { sessionToken: token },
    update: {},
    create: { sessionToken: token },
    include: { items: { include: { product: true } } },
  });
}

/** Plans and monthly group lessons are one-per-order — re-adding them never bumps the quantity. */
const SINGLE_QUANTITY_CATEGORIES = new Set(["PLAN", "PREP_GROUP"]);

export async function addToCart(productId: string, userId?: string, opts: { groupSlotId?: string } = {}) {
  const cart = await getOrCreateCart(userId);
  const product = await db.product.findUniqueOrThrow({ where: { id: productId } });
  const single = SINGLE_QUANTITY_CATEGORIES.has(product.category);
  return db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: single
      ? { quantity: 1, unitPriceSnapshot: product.salePrice, ...(opts.groupSlotId ? { groupSlotId: opts.groupSlotId } : {}) }
      : { quantity: { increment: 1 } },
    create: { cartId: cart.id, productId, unitPriceSnapshot: product.salePrice, groupSlotId: opts.groupSlotId ?? null },
  });
}

export async function removeFromCart(cartItemId: string) {
  return db.cartItem.delete({ where: { id: cartItemId } });
}
