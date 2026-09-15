import type { Metadata } from "next";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Yönetim Paneli" };

export default async function AdminOverviewPage() {
  const [orderCount, leadCount, newLeadCount, productCount] = await Promise.all([
    db.order.count(),
    db.callbackRequest.count(),
    db.callbackRequest.count({ where: { status: "NEW" } }),
    db.product.count({ where: { isPublished: true } }),
  ]);

  const metrics = [
    { label: "Toplam Sipariş", value: orderCount },
    { label: "Yayında Ürün", value: productCount },
    { label: "Toplam Talep", value: leadCount },
    { label: "Yeni Talep", value: newLeadCount },
  ];

  return (
    <div>
      <p className="eyebrow">Yönetim Paneli</p>
      <h1 className="page-title">Genel Bakış</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="dashboard-metric-card">
            <p className="text-3xl font-black text-[color:var(--brand)]">{metric.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
