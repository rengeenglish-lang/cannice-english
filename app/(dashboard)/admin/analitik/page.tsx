import type { Metadata } from "next";
import { getRevenueSummary, getOrderStatusBreakdown, getWeakestTopicsPlatformWide, getTopProductsByRevenue } from "@/server/services/admin-analytics.service";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Analitik" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Beklemede",
  AWAITING_PAYMENT: "Ödeme Bekleniyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  CANCELLED: "İptal",
  REFUNDED: "İade Edildi",
};

export default async function AdminAnalyticsPage() {
  const [revenue, statusBreakdown, weakestTopics, topProducts] = await Promise.all([
    getRevenueSummary(30),
    getOrderStatusBreakdown(),
    getWeakestTopicsPlatformWide(5),
    getTopProductsByRevenue(5),
  ]);

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Analitik</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
          <p className="text-3xl font-extrabold text-[color:var(--brand)]">{formatTRY(String(revenue.recentRevenue))}</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">Son {revenue.days} Gün Gelir</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
          <p className="text-3xl font-extrabold text-[color:var(--brand)]">{revenue.recentOrderCount}</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">Son {revenue.days} Gün Ödenen Sipariş</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
          <p className="text-3xl font-extrabold text-[color:var(--brand)]">{formatTRY(String(revenue.allTimeRevenue))}</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">Toplam Gelir</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
          <p className="text-3xl font-extrabold text-[color:var(--brand)]">{revenue.allTimeOrderCount}</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">Toplam Ödenen Sipariş</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="dashboard-panel">
          <h2 className="section-title !text-lg">Sipariş Durumu Dağılımı</h2>
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {statusBreakdown.map((row) => (
              <li key={row.status} className="flex items-center justify-between py-3 text-sm">
                <span className="font-semibold">{STATUS_LABEL[row.status] ?? row.status}</span>
                <span className="font-bold text-[color:var(--foreground)]">{row.count}</span>
              </li>
            ))}
            {statusBreakdown.length === 0 ? <li className="py-3 text-sm text-[color:var(--muted)]">Henüz sipariş yok.</li> : null}
          </ul>
        </section>

        <section className="dashboard-panel">
          <h2 className="section-title !text-lg">En Çok Kazandıran Ürünler</h2>
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {topProducts.map((product) => (
              <li key={product.title} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="max-w-[60%] truncate font-semibold">{product.title}</span>
                <span className="text-right">
                  <span className="block font-bold text-[color:var(--foreground)]">{formatTRY(String(product.revenue))}</span>
                  <span className="block text-xs text-[color:var(--muted)]">{product.orderCount} sipariş</span>
                </span>
              </li>
            ))}
            {topProducts.length === 0 ? <li className="py-3 text-sm text-[color:var(--muted)]">Henüz ödenmiş sipariş yok.</li> : null}
          </ul>
        </section>
      </div>

      <section className="dashboard-panel mt-6">
        <h2 className="section-title !text-lg">En Çok Zorlanılan Konular (Platform Geneli)</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">En az 3 sonucu olan konular arasından, en düşük ortalama doğruluğa sahip olanlar.</p>
        <ul className="mt-4 divide-y divide-[color:var(--border)]">
          {weakestTopics.map((row) => (
            <li key={row.topic.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="font-semibold">{row.topic.name}</span>
              <span className="text-right">
                <span className="block font-bold text-[color:var(--danger)]">%{Math.round(row.avgAccuracy * 100)}</span>
                <span className="block text-xs text-[color:var(--muted)]">{row.sampleSize} sonuç</span>
              </span>
            </li>
          ))}
          {weakestTopics.length === 0 ? <li className="py-3 text-sm text-[color:var(--muted)]">Henüz yeterli veri yok.</li> : null}
        </ul>
      </section>
    </div>
  );
}
