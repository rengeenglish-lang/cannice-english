import "server-only";
import { db } from "@/server/db";
import { NETFENER_EBOOKS, findNetfenerEbook } from "@/lib/netfener-ebooks";

/** An active plan is deliberately not an entitlement to these individually sold books. */
export async function hasPurchasedEbook(userId: string, slug: string): Promise<boolean> {
  if (!userId || !findNetfenerEbook(slug)) return false;
  return Boolean(await db.orderItem.findFirst({
    where: { order: { userId, status: "PAID" }, product: { slug, category: "BOOK" } },
    select: { id: true },
  }));
}

export type EbookOffer = { productId: string; price: string; purchased: boolean };

export async function getEbookOffers(userId?: string): Promise<Record<string, EbookOffer>> {
  const products = await db.product.findMany({
    where: { slug: { in: NETFENER_EBOOKS.map((book) => book.slug) }, category: "BOOK", isPublished: true, book: { isNot: null } },
    select: { id: true, slug: true, salePrice: true, currency: true },
  });
  const entries = await Promise.all(NETFENER_EBOOKS.map(async (book) => {
    const product = products.find((item) => item.slug === book.slug);
    const purchased = userId ? await hasPurchasedEbook(userId, book.slug) : false;
    // Missing/zero prices must never accidentally make a paid book free.
    if (!purchased && (!product || Number(product.salePrice) <= 0)) return null;
    return [book.slug, {
      productId: product?.id ?? "",
      price: product ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: product.currency }).format(Number(product.salePrice)) : "",
      purchased,
    }] as const;
  }));
  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
