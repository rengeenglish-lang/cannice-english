import Link from "next/link";
import type { Metadata } from "next";
import { listExamTypesForAdmin, getExamTypeWithTopics } from "@/server/services/admin-topics.service";

export const metadata: Metadata = { title: "Konu Anlatım Yönetimi" };

export default async function AdminKonuAnlatimPage() {
  const exams = await listExamTypesForAdmin();
  const examsWithTopics = await Promise.all(
    exams.map(async (exam) => ({ exam, full: await getExamTypeWithTopics(exam.id) }))
  );

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Konu Anlatım</h1>
      <p className="page-copy">Bir sınav seçerek konularını ve derslerini düzenleyin, ekleyin veya silin.</p>

      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Sınav</th><th>Konu Sayısı</th><th>Ders Sayısı</th><th></th></tr>
          </thead>
          <tbody>
            {examsWithTopics.map(({ exam, full }) => {
              const topics = full?.topics ?? [];
              const lessonCount = topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
              return (
                <tr key={exam.id}>
                  <td className="font-bold text-[color:var(--foreground)]">{exam.name}</td>
                  <td>{topics.length}</td>
                  <td>{lessonCount}</td>
                  <td className="whitespace-nowrap">
                    <Link href={`/admin/konu-anlatim/${exam.slug}`} className="ghost-button">Yönet</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
