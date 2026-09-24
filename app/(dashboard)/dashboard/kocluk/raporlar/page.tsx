import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { requireCoaching } from "@/server/services/coaching/context";
import { listReports } from "@/server/services/coaching/reports.service";
import { dateToDayKey } from "@/lib/coaching/time";
import { dayLabel } from "@/server/services/coaching/views";

export const metadata: Metadata = { title: "İlerleme raporları" };

export default async function ReportsPage() {
  const { user, t } = await requireCoaching();
  const reports = await listReports(user.id);
  const label = (d: Date) => dayLabel(dateToDayKey(d), t.locale, { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">{t.reports.title}</h1>
        <p className="page-copy mt-2">{t.reports.lead}</p>
      </header>
      {reports.length ? (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <Link href={`/dashboard/kocluk/raporlar/${r.id}`} className="dashboard-panel flex items-center justify-between gap-4 transition hover:border-[color:var(--accent)]">
                <span className="flex items-center gap-3">
                  <FileText size={20} className="text-[color:var(--accent)]" aria-hidden="true" />
                  <span>
                    <strong className="block">{r.kind === "WEEKLY" ? t.reports.weekly : t.reports.monthly}</strong>
                    <span className="text-sm text-[color:var(--muted)]">{t.reports.period(label(r.periodStart), label(r.periodEnd))}</span>
                  </span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="learning-empty">{t.reports.empty}</p>
      )}
    </div>
  );
}
