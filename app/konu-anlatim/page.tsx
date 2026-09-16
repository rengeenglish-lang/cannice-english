import Link from "next/link";
import type { Metadata } from "next";
import { listExamTypes, getExamTypeBySlug } from "@/server/services/catalog.service";
import { listExamTopicsWithLessons, getCompletedTopicLessonIdsForUser } from "@/server/services/topics.service";
import { getAuthContext } from "@/server/auth/context";
import { KonuAnlatimDashboard } from "@/components/topics/KonuAnlatimDashboard";

export const metadata: Metadata = { title: "Konu Anlatım" };

function formatWeightPercent(questionCount: number, totalQuestions: number) {
  if (totalQuestions === 0) return "—";
  const percent = (questionCount / totalQuestions) * 100;
  const rounded = Math.round(percent * 100) / 100;
  return `%${rounded.toString().replace(".", ",")}`;
}

type Props = { searchParams: Promise<{ exam?: string }> };

export default async function TopicsIndexPage({ searchParams }: Props) {
  const { exam } = await searchParams;
  const examSlug = exam ?? "yds";
  const [exams, activeExam, user] = await Promise.all([listExamTypes(), getExamTypeBySlug(examSlug), getAuthContext()]);
  const topics = activeExam ? await listExamTopicsWithLessons(activeExam.id) : [];
  const completedLessonIds = user ? await getCompletedTopicLessonIdsForUser(user.id) : new Set<string>();
  const totalQuestions = topics.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
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
          <p className="mt-2 text-sm text-[color:var(--muted)]">Şu an için YDS ve YÖKDİL konu anlatımlarını inceleyebilirsiniz.</p>
        </div>
      ) : (
        <>
          <details className="panel mt-10 overflow-x-auto">
            <summary className="cursor-pointer list-none">
              <span className="section-title text-lg">{activeExam?.name} Soru Dağılımı</span>
              <span className="ml-2 text-sm font-semibold text-[color:var(--muted)]">(görmek için tıklayın)</span>
            </summary>
            <p className="mt-3 text-xs font-semibold text-[color:var(--muted)] sm:hidden">← Tüm sütunları görmek için tabloyu yana kaydırın →</p>
            <table className="dashboard-table mt-4">
              <thead>
                <tr>
                  <th>Konu Adı</th>
                  <th className="text-right">Soru Sayısı</th>
                  <th className="text-right">Ağırlık (%)</th>
                  <th className="text-right">Konu Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id}>
                    <td className="font-semibold text-[color:var(--foreground)]">{topic.name}</td>
                    <td className="text-right font-bold">{topic.questionCount ?? "—"}</td>
                    <td className="text-right">{formatWeightPercent(topic.questionCount ?? 0, totalQuestions)}</td>
                    <td className="text-right">{topic.lessons.length}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-extrabold text-[color:var(--foreground)]">Toplam</td>
                  <td className="text-right font-extrabold text-[color:var(--accent-strong)]">{totalQuestions}</td>
                  <td className="text-right font-extrabold text-[color:var(--accent-strong)]">%100</td>
                  <td className="text-right font-extrabold text-[color:var(--accent-strong)]">
                    {topics.reduce((sum, topic) => sum + topic.lessons.length, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </details>

          <div className="mt-8">
            <KonuAnlatimDashboard
              topics={topics}
              initialCompletedLessonIds={[...completedLessonIds]}
              isSignedIn={Boolean(user)}
            />
          </div>
        </>
      )}
    </main>
  );
}
