import Link from "next/link";
import type { Metadata } from "next";
import { listSubmissionsForAdmin } from "@/server/services/submissions.service";

export const metadata: Metadata = { title: "Değerlendirmeler" };

export default async function AdminSubmissionsPage() {
  const submissions = await listSubmissionsForAdmin();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Deneme Sınavı Değerlendirmeleri</h1>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Öğrenci</th><th>Kurs</th><th>Başlık</th><th>Gönderim</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="font-bold text-[color:var(--foreground)]">{submission.enrollment.user.name}</td>
                <td className="max-w-xs">{submission.enrollment.course.product.title}</td>
                <td className="max-w-xs">{submission.title}</td>
                <td>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(submission.submittedAt)}</td>
                <td>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${submission.status === "REVIEWED" ? "bg-[color:var(--success-soft)] text-[color:var(--success)]" : "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"}`}>
                    {submission.status === "REVIEWED" ? "Değerlendirildi" : "Beklemede"}
                  </span>
                </td>
                <td><Link href={`/admin/submissions/${submission.id}`} className="ghost-button">{submission.status === "REVIEWED" ? "Görüntüle" : "Değerlendir"}</Link></td>
              </tr>
            ))}
            {submissions.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">Henüz gönderim yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
