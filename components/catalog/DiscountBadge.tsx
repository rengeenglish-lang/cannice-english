import { discountPercent } from "@/lib/pricing";

export function DiscountBadge({ basePrice, salePrice }: { basePrice: number | string; salePrice: number | string }) {
  const percent = discountPercent(basePrice, salePrice);
  if (percent <= 0) return null;
  return <span className="discount-badge bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">%{percent} İndirim 🔥</span>;
}
