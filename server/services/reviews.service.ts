import "server-only";
import { db } from "@/server/db";
import { listEnrollmentsForUser, getPurchasedMaterials } from "@/server/services/learning.service";

/** Every product a student has actually bought (course enrollments + standalone book purchases) — a review can only be left on these. */
export async function listPurchasedProductsForUser(userId: string) {
  const [enrollments, materials] = await Promise.all([listEnrollmentsForUser(userId), getPurchasedMaterials(userId)]);
  const fromCourses = enrollments.map((e) => ({ id: e.course.product.id, title: e.course.product.title }));
  const fromBooks = materials.map((m) => ({ id: m.product.id, title: m.product.title }));
  const byId = new Map([...fromCourses, ...fromBooks].map((p) => [p.id, p]));
  return [...byId.values()];
}

export function listMyReviews(userId: string) {
  return db.review.findMany({ where: { userId }, include: { product: true }, orderBy: { createdAt: "desc" } });
}

export async function upsertReview(userId: string, productId: string, data: { rating: number; comment?: string }) {
  return db.review.upsert({
    where: { userId_productId: { userId, productId } },
    update: { rating: data.rating, comment: data.comment || null },
    create: { userId, productId, rating: data.rating, comment: data.comment || null },
  });
}

export async function deleteReview(id: string, userId: string) {
  return db.review.deleteMany({ where: { id, userId } });
}
