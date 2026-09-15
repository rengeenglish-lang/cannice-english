import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";
import { listEnrollmentsForUser } from "@/server/services/learning.service";

export const metadata: Metadata = { title: "Panelim" };

const ORDER_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Beklemede", className: "bg-slate-100 text-slate-600" },
  AWAITING_PAYMENT: { label: "Ödeme Bekleniyor", className: "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" },
  PAID: { label: "Ödendi", className: "bg-[color:var(--success-soft)] text-[color:var(--success)]" },
  FAILED: { label: "Başarısız", className: "bg-[color:var(--danger-soft)] text-[color:var(--danger)]" },
  CANCELLED: { label: "İptal", className: "bg-slate-100 text-slate-500" },
  REFUNDED: { label: "İade Edildi", className: "bg-slate-100 text-slate-500" },
};

export default async function StudentDashboardPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const [enrollments, orders] = await Promise.all([
    listEnrollmentsForUser(user.id),
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Panelim</p>
          <h1 className="page-title">Merhaba, {user.name}</h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="dashboard-panel">
          <h2 className="section-title text-lg">Kurslarım</h2>
          {enrollments.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-8 text-center text-sm text-[color:var(--muted)]">
              Henüz bir kursa kayıtlı değilsiniz. Bir paket satın aldıktan sonra ödemeniz onaylandığında dersleriniz burada görünecek.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {enrollments.map((enrollment) => {
                const totalLessons = enrollment.course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
                const completed = enrollment.lessonProgresses.filter((progress) => progress.completedAt).length;
                const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
                return (
                  <li key={enrollment.id}>
                    <Link href={`/dashboard/courses/${enrollment.courseId}`} className="block rounded-2xl border border-[color:var(--border)] px-4 py-3 transition hover:border-[color:var(--accent)]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-[color:var(--foreground)]">{enrollment.course.product.title}</span>
                        <span className="text-xs font-bold text-[color:var(--accent-strong)]">%{percent}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--canvas)]">
                        <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${percent}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="dashboard-panel">
          <h2 className="section-title text-lg">Siparişlerim</h2>
          {orders.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-8 text-center text-sm text-[color:var(--muted)]">
              Henüz bir siparişiniz yok.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {orders.map((order) => {
                const status = ORDER_STATUS_LABEL[order.status] ?? ORDER_STATUS_LABEL.PENDING;
                return (
                  <li key={order.id} className="rounded-xl border border-[color:var(--border)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[color:var(--foreground)]">{order.items.map((item) => item.titleSnapshot).join(", ")}</span>
                      <span className="font-extrabold text-[color:var(--foreground)]">{formatTRY(String(order.total))}</span>
                    </div>
                    <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
