import type { Metadata } from "next";
import { db } from "@/server/db";
import { countPendingSubmissions } from "@/server/services/submissions.service";
import { countPendingDiagnosticResponses } from "@/server/services/admin-diagnostic-grading.service";

export const metadata: Metadata = { title: "Yönetim Paneli" };

export default async function AdminOverviewPage() {
  const [orderCount, newLeadCount, productCount, pendingSubmissionCount, pendingDiagnosticCount] = await Promise.all([
    db.order.count(),
    db.callbackRequest.count({ where: { status: "NEW" } }),
    db.product.count({ where: { isPublished: true } }),
    countPendingSubmissions(),
    countPendingDiagnosticResponses(),
  ]);

  const metrics = [
    { label: "Toplam Sipariş", value: orderCount },
    { label: "Yayında Ürün", value: productCount },
    { label: "Yeni Talep", value: newLeadCount },
    { label: "Bekleyen Değerlendirme", value: pendingSubmissionCount + pendingDiagnosticCount },
  ];

  return (
    <div>
      <p className="eyebrow">Yönetim Paneli</p>
      <h1 className="page-title">Genel Bakış</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
            <p className="text-3xl font-extrabold text-[color:var(--brand)]">{metric.value}</p>
            <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
