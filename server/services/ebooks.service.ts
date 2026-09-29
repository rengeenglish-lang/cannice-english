import "server-only";
import { db } from "@/server/db";
import { NETFENER_EBOOKS, findNetfenerEbook } from "@/lib/netfener-ebooks";
import { NETFENER_BUNDLES, bundlesContainingEbook } from "@/lib/netfener-bundles";
import { EBOOK_EDITIONS, editionSlug, slugsGranting, type EbookEdition } from "@/lib/netfener-ebook-editions";

/** An active plan is deliberately not an entitlement to these individually sold books. */
export async function hasEbookAccess(userId: string, slug: string, edition: EbookEdition): Promise<boolean> {
  if (!userId || !findNetfenerEbook(slug)) return false;
  // A bundle grants the PDF, and the PDF grants online reading, so a bundle reads online too.
  const slugs = [...slugsGranting(slug, edition), ...(edition === "print" ? [] : bundlesContainingEbook(slug))];
  return Boolean(await db.orderItem.findFirst({
    where: { order: { userId, status: "PAID" }, product: { slug: { in: slugs }, category: "BOOK" } },
    select: { id: true },
  }));
}

/** Entitlement to the downloadable PDF, which is what the download route guards. */
export async function hasPurchasedEbook(userId: string, slug: string): Promise<boolean> {
  return hasEbookAccess(userId, slug, "pdf");
}

export type EbookEditionOffer = { productId: string; price: string };
export type EbookOffer = {
  /** Only editions with a published, priced product row appear here. */
  editions: Partial<Record<EbookEdition, EbookEditionOffer>>;
  ownsPdf: boolean;
  ownsOnline: boolean;
};

export async function getEbookOffers(userId?: string): Promise<Record<string, EbookOffer>> {
  const wanted = NETFENER_EBOOKS.flatMap((book) => EBOOK_EDITIONS.map((edition) => editionSlug(book.slug, edition)));
  const products = await db.product.findMany({
    where: { slug: { in: wanted }, category: "BOOK", isPublished: true },
    select: { id: true, slug: true, salePrice: true, currency: true },
  });
  const entries = await Promise.all(NETFENER_EBOOKS.map(async (book) => {
    const editions: Partial<Record<EbookEdition, EbookEditionOffer>> = {};
    for (const edition of EBOOK_EDITIONS) {
      const product = products.find((item) => item.slug === editionSlug(book.slug, edition));
      // Missing or zero prices must never accidentally offer a paid book for nothing.
      if (!product || Number(product.salePrice) <= 0) continue;
      editions[edition] = {
        productId: product.id,
        price: new Intl.NumberFormat("tr-TR", { style: "currency", currency: product.currency }).format(Number(product.salePrice)),
      };
    }
    const ownsPdf = userId ? await hasEbookAccess(userId, book.slug, "pdf") : false;
    const ownsOnline = ownsPdf || (userId ? await hasEbookAccess(userId, book.slug, "online") : false);
    if (!ownsPdf && !ownsOnline && Object.keys(editions).length === 0) return null;
    return [book.slug, { editions, ownsPdf, ownsOnline }] as const;
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
