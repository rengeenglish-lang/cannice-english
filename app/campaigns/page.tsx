import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { listPublicActiveCoupons } from "@/server/services/coupons.service";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Kampanyalar" };

export default async function CampaignsPage() {
  const coupons = await listPublicActiveCoupons();

  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Kampanyalar</p>
        <h1 className="page-title">Eğitim ve Kitaplara Özel Fırsatlar</h1>
        <p className="page-copy">
          Aşağıdaki kupon kodlarını ödeme adımında girerek indirimden
          faydalanabilirsin.
        </p>
      </PageHero>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="poster-card">
            <div className="poster-art bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-strong)]">
              <p className="text-sm font-bold uppercase tracking-wide text-white/80">
                Özel Kampanya
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {coupon.type === "PERCENT"
                  ? `%${coupon.value}`
                  : formatTRY(String(coupon.value))}{" "}
                İndirim
              </p>
            </div>
            <div className="p-5">
              {coupon.description ? (
                <p className="text-sm text-[color:var(--muted)]">
                  {coupon.description}
                </p>
              ) : null}
              <div className="mt-3 rounded-xl border-2 border-dashed border-[color:var(--border-strong)] px-4 py-3 text-center font-mono text-lg font-extrabold tracking-wide text-[color:var(--foreground)]">
                {coupon.code}
              </div>
              {coupon.minOrderAmount ? (
                <p className="mt-2 text-xs text-[color:var(--muted)]">
                  Min. sepet tutarı: {formatTRY(String(coupon.minOrderAmount))}
                </p>
              ) : null}
            </div>
          </div>
        ))}
        {coupons.length === 0 ? (
          <p className="text-[color:var(--muted)]">
            Şu anda aktif bir kampanya bulunmuyor.
          </p>
        ) : null}
      </div>
    </main>
  );
}
