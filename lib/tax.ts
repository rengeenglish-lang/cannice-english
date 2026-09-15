const KDV_RATE = 0.20;

/** Prices are stored tax-inclusive (standard Turkish e-commerce practice).
 * Returns the KDV (VAT) portion already included in a given amount. */
export function kdvIncludedIn(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return Math.round((value - value / (1 + KDV_RATE)) * 100) / 100;
}

export const KDV_RATE_PERCENT = KDV_RATE * 100;
