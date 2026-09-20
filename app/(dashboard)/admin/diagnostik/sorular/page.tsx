import Link from "next/link";
import type { Metadata } from "next";
import { listQuestionsForAdmin } from "@/server/services/admin-diagnostic-questions.service";
import { deactivateDiagnosticQuestionAction, reactivateDiagnosticQuestionAction } from "@/app/actions/admin-diagnostic-questions";

export const metadata: Metadata = { title: "Seviye Tespit Soruları" };

export default async function DiagnosticQuestionsPage() {
  const questions = await listQuestionsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Seviye Tespit</p>
          <h1 className="page-title">Sorular ({questions.length})</h1>
        </div>
        <Link href="/admin/diagnostik/sorular/new" className="primary-button">+ Yeni Soru</Link>
      </div>
      <div className="dashboard-panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-left text-xs font-bold uppercase text-[color:var(--muted)]">
              <th className="py-2">Soru</th>
              <th className="py-2">Konu</th>
              <th className="py-2">Tür</th>
              <th className="py-2">Durum</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="max-w-xs truncate py-3">
                  <Link href={`/admin/diagnostik/sorular/${q.id}`} className="font-semibold text-[color:var(--accent-strong)] hover:underline">
                    {q.prompt}
                  </Link>
                </td>
                <td className="py-3 text-xs font-semibold text-[color:var(--muted)]">{q.topic.name}</td>
                <td className="py-3 text-xs font-semibold text-[color:var(--muted)]">{q.questionType}</td>
                <td className="py-3 text-xs font-bold">{q.isActive ? <span className="text-[color:var(--success)]">Aktif</span> : <span className="text-[color:var(--muted)]">Pasif</span>}</td>
                <td className="py-3 text-right">
                  <form action={(q.isActive ? deactivateDiagnosticQuestionAction : reactivateDiagnosticQuestionAction).bind(null, q.id)}>
                    <button type="submit" className="text-xs font-bold text-[color:var(--danger)]">{q.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {questions.length === 0 ? <p className="py-6 text-center text-sm text-[color:var(--muted)]">Henüz soru eklenmedi.</p> : null}
      </div>
    </div>
  );
}
