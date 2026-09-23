import { addMonths } from "@/lib/plans";

/**
 * Monthly group-lesson billing rules (Canlı Derslerim):
 *   paidThrough reached          → "PAYMENT_DUE": student is notified, lessons still open
 *   paidThrough + 1 day, unpaid  → "LOCKED": the live-lesson button is replaced by "Devam etmek için öde"
 */
export const RENEWAL_GRACE_MS = 24 * 60 * 60 * 1000;

export type BillingState = "ACTIVE" | "PAYMENT_DUE" | "LOCKED";

/** Only hazırlık grupları are billed monthly; every other course keeps its one-off purchase model. */
export function isMonthlyBilledCategory(category: string): boolean {
  return category === "PREP_GROUP";
}

export function billingState(paidThrough: Date | null | undefined, now: Date = new Date()): BillingState {
  if (!paidThrough) return "ACTIVE";
  if (now < paidThrough) return "ACTIVE";
  if (now.getTime() < paidThrough.getTime() + RENEWAL_GRACE_MS) return "PAYMENT_DUE";
  return "LOCKED";
}

/**
 * The new paidThrough after a month is paid. Paying on time (or within the 1-day grace) continues
 * seamlessly from the old date so the student never loses days; paying after the lock starts a
 * fresh month from today, since the locked days weren't usable.
 */
export function nextPaidThrough(current: Date | null | undefined, now: Date = new Date()): Date {
  const base = current && billingState(current, now) !== "LOCKED" ? current : now;
  return addMonths(base, 1);
}
