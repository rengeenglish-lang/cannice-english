import "server-only";
import { cookies } from "next/headers";
import { db } from "@/server/db";

const CART_COOKIE = "cannice_cart_token";

const cartInclude = {
  items: {
    include: { product: { include: { examType: true, book: true, course: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

async function guestToken() {
  return (await cookies()).get(CART_COOKIE)?.value;
}

async function getOrCreateCartToken() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const token = crypto.randomUUID();
  store.set(CART_COOKIE, token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return token;
}

/**
 * Plans and group lessons require an account, so students are routinely sent to log in with
 * items already in their guest cart. This moves those items into the account cart the first time
 * the account cart is read after login. DB-only (the guest cookie is left alone), so it is safe to
 * run while rendering a page; the emptied guest cart is simply never read again.
 */
async function absorbGuestCart(userId: string, userCartId: string) {
  const token = await guestToken();
  if (!token) return;
  const guest = await db.cart.findUnique({ where: { sessionToken: token }, include: { items: true } });
  if (!guest || guest.userId || guest.items.length === 0) return;
  await db.$transaction(async (tx) => {
    for (const item of guest.items) {
      const existing = await tx.cartItem.findUnique({ where: { cartId_productId: { cartId: userCartId, productId: item.productId } } });
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.max(existing.quantity, item.quantity), groupSlotId: item.groupSlotId ?? existing.groupSlotId },
        });
      } else {
        await tx.cartItem.create({
          data: { cartId: userCartId, productId: item.productId, quantity: item.quantity, unitPriceSnapshot: item.unitPriceSnapshot, groupSlotId: item.groupSlotId },
        });
      }
    }
    await tx.cartItem.deleteMany({ where: { cartId: guest.id } });
  });
}

/** Cart for server actions — creates the guest cart (and its cookie) when needed. */
export async function getOrCreateCart(userId?: string) {
  if (userId) {
    const cart = await db.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await absorbGuestCart(userId, cart.id);
    return db.cart.findUniqueOrThrow({ where: { id: cart.id }, include: cartInclude });
  }
  const token = await getOrCreateCartToken();
  return db.cart.upsert({ where: { sessionToken: token }, update: {}, create: { sessionToken: token }, include: cartInclude });
}

/** Cart for rendering pages — never sets a cookie, so a guest with no cart gets `null`. */
export async function findCart(userId?: string) {
  if (userId) {
    const cart = await db.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await absorbGuestCart(userId, cart.id);
    return db.cart.findUniqueOrThrow({ where: { id: cart.id }, include: cartInclude });
  }
  const token = await guestToken();
  return token ? db.cart.findUnique({ where: { sessionToken: token }, include: cartInclude }) : null;
}

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof findCart>>>;

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

/** Removes an item from the caller's own cart only; returns what was removed (for "Geri al"). */
export async function removeFromCart(cartItemId: string, userId?: string) {
  const cart = await findCart(userId);
  if (!cart) return null;
  const item = cart.items.find((i) => i.id === cartItemId);
  if (!item) return null;
  await db.cartItem.delete({ where: { id: item.id } });
  return item;
}

export async function clearCart(userId?: string) {
  const cart = await findCart(userId);
  if (cart) await db.cartItem.deleteMany({ where: { cartId: cart.id } });
}

/**
 * Brings every cart line up to the product's current sale price. The snapshot is taken when the
 * item is added, so without this a price change in the admin panel would silently charge the old
 * price. Returns the lines whose price changed so the cart can tell the student.
 */
export async function refreshCartPrices(cart: CartWithItems) {
  const changed: { title: string; oldPrice: number; newPrice: number }[] = [];
  for (const item of cart.items) {
    const current = Number(item.product.salePrice);
    const snapshot = Number(item.unitPriceSnapshot);
    if (current !== snapshot) {
      await db.cartItem.update({ where: { id: item.id }, data: { unitPriceSnapshot: item.product.salePrice } });
      item.unitPriceSnapshot = item.product.salePrice;
      changed.push({ title: item.product.title, oldPrice: snapshot, newPrice: current });
    }
  }
  return changed;
}

export async function cartItemCount(userId?: string) {
  if (userId) return db.cartItem.count({ where: { cart: { userId } } });
  const token = await guestToken();
  return token ? db.cartItem.count({ where: { cart: { sessionToken: token } } }) : 0;
}
