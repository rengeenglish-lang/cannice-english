import Link from "next/link";
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { listExamTypes, getExamTypeBySlug } from "@/server/services/catalog.service";
import { listExamTopicsWithLessons, getCompletedTopicLessonIdsForUser, getTopicNotesForUser } from "@/server/services/topics.service";
import { getAuthContext } from "@/server/auth/context";
import { KonuAnlatimDashboard } from "@/components/topics/KonuAnlatimDashboard";

export const metadata: Metadata = { title: "Konu Anlatım" };

const topicsFont = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-topics",
  weight: ["400", "500", "600", "700", "800"],
});

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
  const [completedLessonIds, notes] = await Promise.all([
    user ? getCompletedTopicLessonIdsForUser(user.id) : Promise.resolve(new Set<string>()),
    user && activeExam ? getTopicNotesForUser(user.id, activeExam.id) : Promise.resolve({}),
  ]);
  const totalQuestions = topics.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0);

  return (
    <main className={`${topicsFont.variable} mx-auto w-full max-w-[1680px] px-4 py-14 [font-family:var(--font-topics)] sm:px-6 lg:px-8`}>
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">Konu Anlatım</p>
      <h1 className="mt-2 text-3xl font-extrabold leading-[1.08] tracking-[-.02em] text-slate-900 sm:text-4xl">
        Sınavınıza konu konu, sıfırdan hazırlanın
      </h1>
      <p className="mt-3 max-w-2xl text-lg font-semibold text-slate-700">Her konunun sınavda kaç soru olarak karşınıza çıktığını görün, dersleri sırayla tamamlayın.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {exams.map((item) => (
          <Link
            key={item.id}
            href={`/konu-anlatim?exam=${item.slug}`}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              examSlug === item.slug
                ? "border-blue-900 bg-blue-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {topics.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center">
          <p className="font-bold text-slate-900">{activeExam?.name ?? "Bu sınav"} için konu anlatımları yakında burada olacak</p>
          <p className="mt-2 text-sm text-slate-500">Şu an için YDS, YÖKDİL ve PTE konu anlatımlarını inceleyebilirsiniz.</p>
        </div>
      ) : (
        <>
          <details className="relative isolate mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/80 before:via-white/0 before:content-[''] sm:p-6">
            <summary className="cursor-pointer list-none">
              <span className="text-lg font-extrabold tracking-[-.01em] text-slate-900">{activeExam?.name} Soru Dağılımı</span>
              <span className="ml-2 text-sm font-semibold text-slate-500">(görmek için tıklayın)</span>
            </summary>
            <p className="mt-3 text-xs font-semibold text-slate-500 sm:hidden">← Tüm sütunları görmek için tabloyu yana kaydırın →</p>
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
                    <td className="font-semibold text-slate-900">{topic.name}</td>
                    <td className="text-right font-bold">{topic.questionCount ?? "—"}</td>
                    <td className="text-right">{formatWeightPercent(topic.questionCount ?? 0, totalQuestions)}</td>
                    <td className="text-right">{topic.lessons.length}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-extrabold text-slate-900">Toplam</td>
                  <td className="text-right font-extrabold text-blue-700">{totalQuestions}</td>
                  <td className="text-right font-extrabold text-blue-700">%100</td>
                  <td className="text-right font-extrabold text-blue-700">
                    {topics.reduce((sum, topic) => sum + topic.lessons.length, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </details>

          <div className="mt-8">
            <KonuAnlatimDashboard
              examName={activeExam?.name ?? ""}
              topics={topics}
              initialCompletedLessonIds={[...completedLessonIds]}
              initialNotes={notes}
              isSignedIn={Boolean(user)}
            />
          </div>
        </>
      )}
    </main>
  );
}
