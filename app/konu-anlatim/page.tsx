import Link from "next/link";
import type { Metadata } from "next";
import { listExamTypes, getExamTypeBySlug } from "@/server/services/catalog.service";
import { listExamTopics } from "@/server/services/topics.service";

export const metadata: Metadata = { title: "Konu Anlatım" };

type Props = { searchParams: Promise<{ exam?: string }> };

export default async function TopicsIndexPage({ searchParams }: Props) {
  const { exam } = await searchParams;
  const examSlug = exam ?? "yds";
  const [exams, activeExam] = await Promise.all([listExamTypes(), getExamTypeBySlug(examSlug)]);
  const topics = activeExam ? await listExamTopics(activeExam.id) : [];
  const totalQuestions = topics.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Konu Anlatım</p>
      <h1 className="page-title">Sınavınıza konu konu, sıfırdan hazırlanın</h1>
      <p className="page-copy">Her konunun sınavda kaç soru olarak karşınıza çıktığını görün, dersleri sırayla tamamlayın.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {exams.map((item) => (
          <Link
            key={item.id}
            href={`/konu-anlatim?exam=${item.slug}`}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              examSlug === item.slug
                ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                : "border-[color:var(--border-strong)] bg-white text-slate-600 hover:border-[color:var(--brand)]"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {topics.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
          <p className="font-bold text-[color:var(--foreground)]">{activeExam?.name ?? "Bu sınav"} için konu anlatımları yakında burada olacak</p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Şu an için YDS konu anlatımlarını inceleyebilirsiniz.</p>
        </div>
      ) : (
        <>
          <div className="panel mt-10 overflow-x-auto">
            <h2 className="section-title text-lg">{activeExam?.name} Soru Dağılımı</h2>
            <table className="dashboard-table mt-4">
              <thead>
                <tr>
                  <th>Konu Adı</th>
                  <th className="text-right">Soru Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id}>
                    <td className="font-semibold text-[color:var(--foreground)]">{topic.name}</td>
                    <td className="text-right font-bold">{topic.questionCount ?? "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-extrabold text-[color:var(--foreground)]">Toplam</td>
                  <td className="text-right font-extrabold text-[color:var(--accent-strong)]">{totalQuestions}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/konu-anlatim/${topic.slug}?exam=${examSlug}`}
                className="panel flex items-center justify-between gap-4 transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.1em] text-[color:var(--muted)]">Konu {index + 1}</p>
                  <p className="mt-1 font-bold text-[color:var(--foreground)]">{topic.name}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{topic.lessons.length} ders {topic.questionCount ? `· Sınavda ${topic.questionCount} soru` : ""}</p>
                </div>
                <span className="shrink-0 text-[color:var(--accent-strong)]">→</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
