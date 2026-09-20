import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getExamTypeBySlug } from "@/server/services/catalog.service";
import { getExamTypeWithTopics } from "@/server/services/admin-topics.service";
import { deleteTopicAction } from "@/app/actions/admin-topics";

type Props = { params: Promise<{ examSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = await getExamTypeBySlug(examSlug);
  return { title: exam ? `${exam.name} — Konu Anlatım` : "Konu Anlatım" };
}

export default async function AdminExamTopicsPage({ params }: Props) {
  const { examSlug } = await params;
  const exam = await getExamTypeBySlug(examSlug);
  if (!exam) notFound();

  const full = await getExamTypeWithTopics(exam.id);
  const topics = full?.topics ?? [];

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/konu-anlatim" className="hover:underline">Konu Anlatım</Link> › {exam.name}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">{exam.name} Konuları</h1>
        <Link href={`/admin/konu-anlatim/${examSlug}/new`} className="primary-button">+ Yeni Konu</Link>
      </div>

      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Sıra</th><th>Konu Adı</th><th>Kategori</th><th>Soru Sayısı</th><th>Ders Sayısı</th><th></th></tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id}>
                <td>{topic.displayOrder}</td>
                <td className="font-bold text-[color:var(--foreground)]">
                  {topic.name}
                  {topic.lessons.length === 0 ? <span className="ml-2 text-xs font-bold text-[color:var(--warning)]">⚠ İçerik yok</span> : null}
                </td>
                <td>{topic.category ?? "—"}</td>
                <td>{topic.questionCount ?? "—"}</td>
                <td>{topic.lessons.length}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/konu-anlatim/${examSlug}/${topic.id}`} className="ghost-button">Düzenle</Link>
                  <form action={deleteTopicAction.bind(null, examSlug, topic.id)} className="inline">
                    <button type="submit" className="ghost-button text-[color:var(--danger)]">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {topics.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">Bu sınav için henüz konu eklenmedi.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
