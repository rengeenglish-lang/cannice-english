import Link from "next/link";
import type { Metadata } from "next";
import { listPendingDiagnosticResponses } from "@/server/services/admin-diagnostic-grading.service";

export const metadata: Metadata = { title: "Seviye Tespit Değerlendirmeleri" };

const TYPE_LABEL: Record<string, string> = { WRITING_TASK: "Yazma", SPEAKING_TASK: "Konuşma" };

export default async function AdminDiagnosticGradingPage() {
  const responses = await listPendingDiagnosticResponses();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Seviye Tespit Değerlendirmeleri</h1>
      <p className="page-copy">Yazma ve konuşma sorularına verilen serbest metin cevapları burada değerlendirilir.</p>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Öğrenci</th><th>Sınav</th><th>Tür</th><th>Konu</th><th>Gönderim</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr key={response.id}>
                <td className="font-bold text-[color:var(--foreground)]">{response.attempt.user.name}</td>
                <td>{response.question.examType?.name ?? "—"}</td>
                <td>{TYPE_LABEL[response.question.questionType] ?? response.question.questionType}</td>
                <td className="max-w-xs">{response.question.topic.name}</td>
                <td>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(response.answeredAt)}</td>
                <td>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${response.gradingStatus === "REVIEWED" ? "bg-[color:var(--success-soft)] text-[color:var(--success)]" : "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"}`}>
                    {response.gradingStatus === "REVIEWED" ? "Değerlendirildi" : "Beklemede"}
                  </span>
                </td>
                <td><Link href={`/admin/diagnostik/degerlendirmeler/${response.id}`} className="ghost-button">{response.gradingStatus === "REVIEWED" ? "Görüntüle" : "Değerlendir"}</Link></td>
              </tr>
            ))}
            {responses.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-slate-400">Henüz gönderim yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
