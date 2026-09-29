/** One flat shipping fee per order that holds a printed book, however many books that is. */
export const FLAT_SHIPPING_TRY = 79;

export function formatTRY(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " TL";
}

export function discountPercent(basePrice: number | string, salePrice: number | string) {
  const base = typeof basePrice === "string" ? Number(basePrice) : basePrice;
  const sale = typeof salePrice === "string" ? Number(salePrice) : salePrice;
  if (!base || base <= sale) return 0;
  return Math.round(((base - sale) / base) * 100);
}
