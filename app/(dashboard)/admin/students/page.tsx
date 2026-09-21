import Link from "next/link";
import type { Metadata } from "next";
import { listStudentsForAdmin } from "@/server/services/admin-students.service";

export const metadata: Metadata = { title: "Öğrenciler" };

export default async function AdminStudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const students = await listStudentsForAdmin(q);

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Öğrenciler</h1>

      <form className="mt-6 max-w-sm">
        <input type="search" name="q" defaultValue={q ?? ""} placeholder="İsim veya e-posta ara…" className="auth-input" />
      </form>

      <div className="dashboard-panel mt-6 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Ad Soyad</th><th>E-posta</th><th>Kayıt Tarihi</th><th></th></tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="font-bold text-[color:var(--foreground)]">{student.name}</td>
                <td>{student.email}</td>
                <td>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(student.createdAt)}</td>
                <td><Link href={`/admin/students/${student.id}`} className="ghost-button">Görüntüle</Link></td>
              </tr>
            ))}
            {students.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Öğrenci bulunamadı.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
