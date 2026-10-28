/** Promotional digital books are available to verified accounts until this date.
 * One first PDF is free; an honest review unlocks the rest and a one-time seven-day digital trial.
 * Printed copies are paid separately. Purchases remain valid after the promotion ends.
 * Override the end date with EBOOK_FREE_PROMO_ENDS_AT (ISO 8601).
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
