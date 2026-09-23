import "server-only";
import { db } from "@/server/db";

export async function addFavorite(userId: string, productId: string) {
  await db.favoriteProduct.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

/** Flips the heart; returns the new state. */
export async function toggleFavorite(userId: string, productId: string) {
  const existing = await db.favoriteProduct.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    await db.favoriteProduct.delete({ where: { id: existing.id } });
    return false;
  }
  const product = await db.product.findFirst({ where: { id: productId, isPublished: true } });
  if (!product) throw new Error("Ürün bulunamadı.");
  await db.favoriteProduct.create({ data: { userId, productId } });
  return true;
}

export async function favoriteProductIds(userId: string | null | undefined) {
  if (!userId) return new Set<string>();
  const rows = await db.favoriteProduct.findMany({ where: { userId }, select: { productId: true } });
  return new Set(rows.map((r) => r.productId));
}

export function listFavorites(userId: string) {
  return db.favoriteProduct.findMany({
    where: { userId },
    include: { product: { include: { examType: true, book: true } } },
    orderBy: { createdAt: "desc" },
  });
}
