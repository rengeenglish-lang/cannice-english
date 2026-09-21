import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { listPublicActiveCoupons } from "@/server/services/coupons.service";
import { formatTRY } from "@/lib/pricing";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";

export const metadata: Metadata = { title: "İndirimlerim" };

export default async function DiscountsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const [coupons, usedOrders] = await Promise.all([
    listPublicActiveCoupons(),
    db.order.findMany({
      where: { userId: user.id, couponCode: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { id: true, couponCode: true, discountTotal: true, createdAt: true },
    }),
  ]);

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="İndirimlerim" />
      <AccountTabs active="İndirimlerim" />

      <section className="mt-8">
        <h2 className="section-title !text-lg">Aktif Kampanyalar</h2>
        {coupons.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="dashboard-panel">
                <p className="text-2xl font-black text-[color:var(--accent-strong)]">
                  {coupon.type === "PERCENT" ? `%${coupon.value}` : formatTRY(String(coupon.value))} İndirim
                </p>
                {coupon.description ? <p className="mt-2 text-sm text-[color:var(--muted)]">{coupon.description}</p> : null}
                <div className="mt-3 rounded-xl border-2 border-dashed border-[color:var(--border-strong)] px-4 py-3 text-center font-mono text-lg font-extrabold tracking-wide">
                  {coupon.code}
                </div>
                {coupon.minOrderAmount ? (
                  <p className="mt-2 text-xs text-[color:var(--muted)]">Min. sepet tutarı: {formatTRY(String(coupon.minOrderAmount))}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="page-copy mt-4">Şu anda aktif bir kampanya bulunmuyor.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="section-title !text-lg">Kullandığın Kuponlar</h2>
        {usedOrders.length ? (
          <ul className="mt-4 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)]">
            {usedOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <span className="font-mono text-sm font-bold">{order.couponCode}</span>
                <span className="text-sm text-[color:var(--muted)]">{order.createdAt.toLocaleDateString("tr-TR")}</span>
                <span className="text-sm font-bold text-[color:var(--success)]">-{formatTRY(String(order.discountTotal))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="page-copy mt-4">Henüz bir kupon kullanmadınız.</p>
        )}
      </section>
    </div>
  );
}
