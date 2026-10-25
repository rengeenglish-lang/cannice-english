/**
 * Launch promotion: every Netfener e-book is free to read online for everyone, and the PDF is free to
 * download for any signed-in account, until this moment. Afterwards the books are back on sale and
 * access falls back to purchases automatically. Printed copies are never part of the promotion.
 * Override with EBOOK_FREE_PROMO_ENDS_AT (ISO 8601) to move the end date without a code change.
 */
const DEFAULT_ENDS_AT = "2026-11-25T23:59:59+03:00";

export function ebookFreePromoEndsAt(): Date {
  const fromEnv = process.env.EBOOK_FREE_PROMO_ENDS_AT;
  const parsed = new Date(fromEnv && fromEnv.trim() ? fromEnv : DEFAULT_ENDS_AT);
  return Number.isNaN(parsed.getTime()) ? new Date(DEFAULT_ENDS_AT) : parsed;
}

export function isEbookFreePromoActive(now: Date = new Date()): boolean {
  return now.getTime() <= ebookFreePromoEndsAt().getTime();
}

export function ebookFreePromoEndLabel(): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(ebookFreePromoEndsAt());
}
