import { Check, Crown } from "lucide-react";
import { formatTRY } from "@/lib/pricing";
import { PLAN_CARD_COPY, PLAN_NAMES, PLAN_RANK, type PlanTierCode } from "@/lib/plans";
import { buyPlanAction } from "@/app/actions/plans";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

type PlanProduct = { id: string; title: string; planTier: PlanTierCode | null; basePrice: unknown; salePrice: unknown };

/**
 * The three Deneme Sınavı plan cards, each with its own payment button. Shared by
 * /dashboard/mock-exam (where every student lands first) and the public /planlar page.
 */
export function PlanCards({
  products,
  currentTier,
  currentExpiresAt,
  favoriteIds = new Set<string>(),
}: {
  products: PlanProduct[];
  currentTier: PlanTierCode | null;
  currentExpiresAt?: Date | null;
  favoriteIds?: Set<string>;
}) {
  const byTier = new Map(products.filter((p) => p.planTier).map((p) => [p.planTier!, p]));
  const tiers = (["BASLANGIC", "CIRAK", "UZMAN"] as const).filter((tier) => byTier.has(tier));

  if (tiers.length === 0) {
    return <p className="page-copy">Planlar çok yakında satışta olacak.</p>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {tiers.map((tier) => {
        const product = byTier.get(tier)!;
        const copy = PLAN_CARD_COPY[tier];
        const isCurrent = currentTier === tier;
        const isLower = currentTier ? PLAN_RANK[tier] < PLAN_RANK[currentTier] : false;
        const featured = tier === "CIRAK";
        const base = Number(product.basePrice);
        const sale = Number(product.salePrice);
        return (
          <article
            key={tier}
            className={`relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_12px_35px_rgba(12,46,30,.07)] ${
              isCurrent ? "border-2 border-emerald-500" : featured ? "border-2 border-[color:var(--brand)]" : "border-slate-200"
            }`}
          >
            {featured && !isCurrent ? (
              <span className="absolute -top-3 left-6 rounded-full bg-[color:var(--brand)] px-3 py-1 text-[11px] font-black tracking-wide text-white">EN ÇOK TERCİH EDİLEN</span>
            ) : null}
            {isCurrent ? (
              <span className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black tracking-wide text-white">MEVCUT PLANIN</span>
            ) : null}
            <div className="absolute right-4 top-4">
              <FavoriteButton productId={product.id} initial={favoriteIds.has(product.id)} title={`${PLAN_NAMES[tier]} planı`} />
            </div>
            <div className="flex items-center gap-2 pr-12">
              {tier === "UZMAN" ? <Crown size={20} className="text-amber-500" aria-hidden="true" /> : null}
              <h3 className="text-2xl font-black">{PLAN_NAMES[tier]}</h3>
            </div>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{copy.tagline}</p>
            <div className="mt-5">
              {base > sale ? <p className="text-sm font-bold text-slate-400 line-through">{formatTRY(base)}</p> : null}
              <p className="text-3xl font-black text-[color:var(--brand)]">{formatTRY(sale)}</p>
              <p className="text-xs text-[color:var(--muted)]">KDV dahil · tek seferlik ödeme</p>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {copy.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
              {isCurrent && currentExpiresAt ? (
                <p className="mb-3 text-xs font-semibold text-emerald-700">
                  {currentExpiresAt.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })} tarihine kadar aktif
                </p>
              ) : null}
              <form action={buyPlanAction.bind(null, product.id)}>
                <button type="submit" className={`${featured || isCurrent ? "primary-button" : "secondary-button"} w-full justify-center`} disabled={isLower}>
                  {isCurrent ? "Süreyi Uzat" : isLower ? "Daha üst bir plana sahipsin" : currentTier ? "Planı Yükselt" : "Satın Al"}
                </button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
