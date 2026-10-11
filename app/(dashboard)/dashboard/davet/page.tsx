import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { REFERRAL_PERCENT, referralOverview } from "@/server/services/referrals.service";
import { InviteShare } from "@/components/referrals/InviteShare";

export const metadata: Metadata = { title: "Arkadaşını Davet Et" };

export default async function InvitePage() {
  const user = await getAuthContext();
  if (!user) return null;
  const { url, invited, rewarded, coupons } = await referralOverview(user.id);
  const now = new Date();
  const usable = coupons.filter((c) => c.isActive && c.redemptionCount < (c.maxRedemptions ?? 1) && (!c.expiresAt || c.expiresAt > now));
  const date = (d: Date) => d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Gift size={28} aria-hidden="true" /></span>
        <div>
          <p className="eyebrow">Davet programı</p>
          <h1 className="page-title">Arkadaşını davet et, ikiniz de %{REFERRAL_PERCENT} indirim kazanın</h1>
          <p className="page-copy">
            Arkadaşın bağlantınla üye olduğunda ilk siparişi için %{REFERRAL_PERCENT} indirim kuponu kazanır. İlk siparişini verdiğinde sen de %{REFERRAL_PERCENT} indirim kuponu kazanırsın. Kuponlar kişiseldir, bir kez kullanılır ve 90 gün geçerlidir.
          </p>
        </div>
      </div>

      <section className="dashboard-panel space-y-3">
        <h2 className="font-extrabold">Davet bağlantın</h2>
        <InviteShare url={url} percent={REFERRAL_PERCENT} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="dashboard-panel"><p className="text-3xl font-black">{invited}</p><p className="text-sm text-[color:var(--muted)]">bağlantınla üye olan arkadaş</p></div>
        <div className="dashboard-panel"><p className="text-3xl font-black">{rewarded}</p><p className="text-sm text-[color:var(--muted)]">ilk siparişini veren (sana kupon kazandıran)</p></div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title !text-lg">Kişisel kuponların</h2>
        {usable.length ? (
          <ul className="space-y-2">
            {usable.map((c) => (
              <li key={c.id} className="dashboard-panel flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-black tracking-wider">{c.code}</p>
                  <p className="text-xs text-[color:var(--muted)]">{c.description} · %{Number(c.value)} indirim{c.expiresAt ? ` · ${date(c.expiresAt)} tarihine kadar` : ""}</p>
                </div>
                <p className="text-xs text-[color:var(--muted)]">Sepette “Kupon kodu” alanına yaz.</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[color:var(--muted)]">Şu anda kullanılabilir kuponun yok. Davet ettiğin bir arkadaşın ilk siparişini verdiğinde kuponun burada görünür.</p>
        )}
      </section>
    </div>
  );
}
