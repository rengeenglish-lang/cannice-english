import "server-only";
import { db } from "@/server/db";
import { NETFENER_EBOOKS, findNetfenerEbook } from "@/lib/netfener-ebooks";
import { NETFENER_BUNDLES, bundlesContainingEbook } from "@/lib/netfener-bundles";

/** An active plan is deliberately not an entitlement to these individually sold books. */
export async function hasPurchasedEbook(userId: string, slug: string): Promise<boolean> {
  if (!userId || !findNetfenerEbook(slug)) return false;
  // A bundle purchase entitles the buyer to every book inside it, not just to the bundle row.
  const slugs = [slug, ...bundlesContainingEbook(slug)];
  return Boolean(await db.orderItem.findFirst({
    where: { order: { userId, status: "PAID" }, product: { slug: { in: slugs }, category: "BOOK" } },
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

export type BundleOffer = { productId: string; price: string; listPrice: string; discountPercent: number };

/** Bundles that are on sale right now, keyed by slug. Unpriced bundles are simply not offered. */
export async function getBundleOffers(): Promise<Record<string, BundleOffer>> {
  const products = await db.product.findMany({
    where: { slug: { in: NETFENER_BUNDLES.map((bundle) => bundle.slug) }, category: "BOOK", isPublished: true },
    select: { id: true, slug: true, basePrice: true, salePrice: true, currency: true },
  });
  const money = (value: number, currency: string) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(value);
  return Object.fromEntries(products.flatMap((product) => {
    const sale = Number(product.salePrice);
    const list = Number(product.basePrice);
    if (sale <= 0) return [];
    return [[product.slug, {
      productId: product.id,
      price: money(sale, product.currency),
      listPrice: money(list, product.currency),
      discountPercent: list > sale ? Math.round(((list - sale) / list) * 100) : 0,
    }]];
  }));
}
