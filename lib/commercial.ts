/** Integer kuruş avoids floating point checkout arithmetic. Server configuration is authoritative. */
export const LAUNCH_PRICING = {
  PREMIUM: { MONTHLY: 49900, QUARTERLY: 119900, ANNUAL: 299900 },
  GROUP: { MONTHLY: 199000, QUARTERLY: 499000, SIX_MONTH: 849000 },
} as const;
export type CommercialKind = keyof typeof LAUNCH_PRICING;
export type BillingInterval = "MONTHLY" | "QUARTERLY" | "SIX_MONTH" | "ANNUAL";
export const BILLING_MONTHS: Record<BillingInterval, number> = { MONTHLY: 1, QUARTERLY: 3, SIX_MONTH: 6, ANNUAL: 12 };
export function launchPrice(kind: CommercialKind, interval: BillingInterval) {
  const plans: Partial<Record<BillingInterval, number>> = LAUNCH_PRICING[kind];
  const amount = plans[interval];
  if (amount === undefined) throw new Error("Bu ödeme dönemi desteklenmiyor.");
  return amount;
}
export function addBillingPeriod(start: Date, interval: BillingInterval) {
  const end = new Date(start);
  const day = end.getUTCDate();
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() + BILLING_MONTHS[interval]);
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(day, lastDay));
  return end;
}
