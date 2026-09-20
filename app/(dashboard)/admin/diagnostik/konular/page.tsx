import Link from "next/link";
import type { Metadata } from "next";
import { listTopicsForAdmin } from "@/server/services/admin-diagnostic-topics.service";
import { topicsMissingContent } from "@/server/services/diagnostic-coverage.service";
import { deactivateDiagnosticTopicAction, reactivateDiagnosticTopicAction } from "@/app/actions/admin-diagnostic-topics";

export const metadata: Metadata = { title: "Seviye Tespit Konuları" };

export default async function DiagnosticTopicsPage() {
  const [topics, missing] = await Promise.all([listTopicsForAdmin(), topicsMissingContent()]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Seviye Tespit</p>
          <h1 className="page-title">Konular</h1>
        </div>
        <Link href="/admin/diagnostik/konular/new" className="primary-button">+ Yeni Konu</Link>
      </div>
      <div className="dashboard-panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-left text-xs font-bold uppercase text-[color:var(--muted)]">
              <th className="py-2">Konu</th>
              <th className="py-2">Tür</th>
              <th className="py-2">Aile</th>
              <th className="py-2">Durum</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {topics.map((topic) => (
              <tr key={topic.id}>
                <td className="py-3">
                  <Link href={`/admin/diagnostik/konular/${topic.id}`} className="font-bold text-[color:var(--accent-strong)] hover:underline">
                    {topic.parent ? `${topic.parent.name} › ` : ""}{topic.name}
                  </Link>
                  {missing.has(topic.id) ? <span className="ml-2 text-xs font-bold text-[color:var(--warning)]">⚠ İçerik eksik</span> : null}
                </td>
                <td className="py-3 text-xs font-semibold text-[color:var(--muted)]">{topic.kind}</td>
                <td className="py-3 text-xs font-semibold text-[color:var(--muted)]">{topic.examFamilies.join(", ")}</td>
                <td className="py-3 text-xs font-bold">{topic.isActive ? <span className="text-[color:var(--success)]">Aktif</span> : <span className="text-[color:var(--muted)]">Pasif</span>}</td>
                <td className="py-3 text-right">
                  <form action={(topic.isActive ? deactivateDiagnosticTopicAction : reactivateDiagnosticTopicAction).bind(null, topic.id)}>
                    <button type="submit" className="text-xs font-bold text-[color:var(--danger)]">{topic.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
