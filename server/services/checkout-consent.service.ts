import "server-only";
import { db } from "@/server/db";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { consentRequirements, type CheckoutDelivery } from "@/lib/checkout-consent";

/** Determine real delivery from the paid plan, protected ebook catalogue and actual course content. */
export async function getCheckoutConsentRequirements(items: { productId: string; groupSlotId: string | null }[], now = new Date()) {
  const products = await db.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    select: { id: true, slug: true, category: true, planTier: true, accessMonths: true,
      book: { select: { format: true } },
      course: { select: { id: true, modules: { select: { lessons: { where: { OR: [{ videoUrl: { not: null } }, { description: { not: null } }] }, select: { videoUrl: true, description: true } } } }, liveSessions: { where: { cancelled: false, startsAt: { gte: now } }, orderBy: { startsAt: "asc" }, select: { id: true, startsAt: true } } } },
    },
  });
  const deliveries: CheckoutDelivery[] = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("Sepetteki ürün bulunamadı.");
    const isPlan = product.category === "PLAN" && Boolean(product.planTier) && (product.accessMonths ?? 0) > 0;
    const isEbook = product.category === "BOOK" && Boolean(product.book) && product.book?.format !== "PRINT" && Boolean(findNetfenerEbook(product.slug));
    const hasLessons = Boolean(product.course?.modules.some((module) => module.lessons.some((lesson) => lesson.videoUrl?.trim() || lesson.description?.trim())));
    const session = item.groupSlotId ? product.course?.liveSessions.find((s) => s.id === item.groupSlotId) : product.course?.liveSessions[0];
    return { productId: item.productId, immediateDigital: isPlan || isEbook || hasLessons, liveStartsAt: session?.startsAt ?? null };
  });
  return { requirements: consentRequirements(deliveries, now), deliveries };
}
