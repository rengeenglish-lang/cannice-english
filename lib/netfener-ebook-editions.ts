/**
 * A book is sold in three editions, each its own product row. The PDF edition keeps the bare
 * slug the catalogue has always used, so existing orders and bundles keep working untouched.
 */
export const EBOOK_EDITIONS = ["online", "pdf", "print"] as const;
export type EbookEdition = (typeof EBOOK_EDITIONS)[number];

export const EDITION_COPY: Record<EbookEdition, { label: string; note: string }> = {
  online: { label: "Online oku", note: "Tarayıcıda, sayfa çevirerek. İndirme yok." },
  pdf: { label: "PDF indir", note: "Tam kitap, kendi cihazında saklanır." },
  print: { label: "Basılı kitap", note: "Siparişe özel basılır ve adresine gönderilir." },
};

const SUFFIX: Record<Exclude<EbookEdition, "pdf">, string> = { online: "online", print: "basili" };

/** The product slug that sells this edition of this book. */
export function editionSlug(bookSlug: string, edition: EbookEdition): string {
  return edition === "pdf" ? bookSlug : `${bookSlug}-${SUFFIX[edition]}`;
}

/** Product slugs whose purchase grants this edition, strongest entitlement first.
 *  Paying for a heavier edition always covers the lighter one: PDF and print both read online. */
export function slugsGranting(bookSlug: string, edition: EbookEdition): string[] {
  if (edition === "online") {
    return [editionSlug(bookSlug, "online"), bookSlug, editionSlug(bookSlug, "print")];
  }
  if (edition === "pdf") return [bookSlug];
  return [editionSlug(bookSlug, "print")];
}
