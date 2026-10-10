import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";
import {
  listExamTypes,
  getExamTypeBySlug,
} from "@/server/services/catalog.service";
import {
  listExamTopicsWithLessons,
  getCompletedTopicLessonIdsForUser,
  getTopicNotesForUser,
} from "@/server/services/topics.service";
import { getAuthContext } from "@/server/auth/context";
import { getPlanAccess } from "@/server/services/plans.service";
import { KonuAnlatimDashboard } from "@/components/topics/KonuAnlatimDashboard";
import { ArrowRight, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Konu Anlatım" };

/** The seven subject buttons, in the order the brief lists them. */
const SUBJECTS = [
  { slug: "ielts", name: "IELTS", copy: "Reading, Listening, Writing ve Speaking" },
  { slug: "toefl", name: "TOEFL", copy: "Güncel iBT formatının tüm bölümleri" },
  { slug: "pte", name: "PTE", copy: "Speaking, Writing, Reading ve Listening görevleri" },
  { slug: "yds", name: "YDS", copy: "Kelime, gramer, çeviri ve paragraf" },
  { slug: "yokdil-sosyal-bilimler", name: "YÖKDİL Sosyal Bilimler", copy: "Sosyal bilimler metinleriyle gramer ve okuma" },
  { slug: "yokdil-saglik-bilimleri", name: "YÖKDİL Sağlık Bilimleri", copy: "Sağlık bilimleri metinleriyle gramer ve okuma" },
  { slug: "yokdil-fen-bilimleri", name: "YÖKDİL Fen Bilimleri", copy: "Fen bilimleri metinleriyle gramer ve okuma" },
] as const;

function formatWeightPercent(questionCount: number, totalQuestions: number) {
  if (totalQuestions === 0) return "—";
  const percent = (questionCount / totalQuestions) * 100;
  const rounded = Math.round(percent * 100) / 100;
  return `%${rounded.toString().replace(".", ",")}`;
}

type Props = { searchParams: Promise<{ exam?: string; topic?: string }> };

export default async function TopicsIndexPage({ searchParams }: Props) {
  const { exam, topic: topicSlug } = await searchParams;
  const user = await getAuthContext();
  const access = await getPlanAccess(user);
  const hasAccess = access.can("KONU_ANLATIMI");

  if (!exam) {
    return (
      <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
        <PageHero>
          <p className="eyebrow">Konu Anlatım</p>
          <h1 className="page-title">Sınavına konu konu, sıfırdan hazırlan</h1>
          <p className="page-copy !text-lg !font-semibold">
            Bir sınav seç ve içeriği aç. Her sınavın ilk konusu ücretsiz önizlemedir; tüm konulara erişim planına dahildir.
          </p>
        </PageHero>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.slug}
              href={`/konu-anlatim?exam=${subject.slug}`}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgb(var(--shadow-rgb)/.07)] transition hover:-translate-y-1 hover:border-blue-300"
            >
              <h2 className="text-xl font-black text-slate-900">{subject.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{subject.copy}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3.5 py-1.5 text-xs font-bold text-white transition group-hover:bg-[color:var(--accent-strong)]">
                {hasAccess ? null : <Lock size={13} aria-hidden="true" />}
                İçeriği Aç <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        {!hasAccess ? (
          <p className="mt-8 text-center text-sm text-slate-600">
            Tüm konu anlatımlarına erişim Başlangıç, Çırak ve Uzman planlarına dahildir.{" "}
            <Link href="/planlar" className="font-bold text-[color:var(--accent-strong)] underline">Planları incele</Link>
          </p>
        ) : null}
      </main>
    );
  }

  const examSlug = exam;
  const [exams, activeExam] = await Promise.all([
    listExamTypes(),
    getExamTypeBySlug(examSlug),
  ]);
  const allTopics = activeExam
    ? await listExamTopicsWithLessons(activeExam.id)
    : [];
  // Without a plan only the first topic is a free preview; the rest are sent without their lesson
  // bodies/videos so the paid content never reaches the browser.
  const lockedTopicIds = hasAccess ? [] : allTopics.slice(1).map((t) => t.id);
  const topics = hasAccess
    ? allTopics
    : allTopics.map((t, i) => (i === 0 ? t : { ...t, lessons: t.lessons.map((l) => ({ ...l, contentBody: null, videoUrl: null })) }));
  const initialTopicId = topics.find((t) => t.slug === topicSlug)?.id;
  const [completedLessonIds, notes] = await Promise.all([
    user
      ? getCompletedTopicLessonIdsForUser(user.id)
      : Promise.resolve(new Set<string>()),
    user && activeExam
      ? getTopicNotesForUser(user.id, activeExam.id)
      : Promise.resolve({}),
  ]);
  const totalQuestions = topics.reduce(
    (sum, topic) => sum + (topic.questionCount ?? 0),
    0,
  );

  return (
    <main className="inner-page mx-auto w-full max-w-[1680px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">
          Konu Anlatım
        </p>
        <h1 className="page-title">
          Sınavına konu konu, sıfırdan hazırlan
        </h1>
        <p className="page-copy !text-lg !font-semibold">
          Her konunun sınavda kaç soru olarak karşına çıktığını gör,
          dersleri sırayla tamamla.
        </p>
      </PageHero>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href="/konu-anlatim" className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 hover:text-blue-700">← Tüm sınavlar</Link>
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
          <p className="font-bold text-slate-900">
            {activeExam?.name ?? "Bu sınav"} için konu anlatımları yakında
            burada olacak
          </p>
          <p className="mt-2 text-sm text-slate-500">
            <Link href="/konu-anlatim" className="underline">Diğer sınavların</Link> konu anlatımlarını inceleyebilirsin.
          </p>
        </div>
      ) : (
        <>
          <details className="relative mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgb(var(--shadow-rgb)/.07)] sm:p-6">
            <summary className="cursor-pointer list-none">
              <span className="text-lg font-extrabold tracking-[-.01em] text-slate-900">
                {activeExam?.name} Soru Dağılımı
              </span>
              <span className="ml-2 text-sm font-semibold text-slate-500">
                (görmek için tıkla)
              </span>
            </summary>
            <p className="mt-3 text-xs font-semibold text-slate-500 sm:hidden">
              ← Tüm sütunları görmek için tabloyu yana kaydırın →
            </p>
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
                    <td className="font-semibold text-slate-900">
                      {topic.name}
                    </td>
                    <td className="text-right font-bold">
                      {topic.questionCount ?? "—"}
                    </td>
                    <td className="text-right">
                      {formatWeightPercent(
                        topic.questionCount ?? 0,
                        totalQuestions,
                      )}
                    </td>
                    <td className="text-right">{topic.lessons.length}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-extrabold text-slate-900">Toplam</td>
                  <td className="text-right font-extrabold text-blue-700">
                    {totalQuestions}
                  </td>
                  <td className="text-right font-extrabold text-blue-700">
                    %100
                  </td>
                  <td className="text-right font-extrabold text-blue-700">
                    {topics.reduce(
                      (sum, topic) => sum + topic.lessons.length,
                      0,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </details>

          <div className="mt-8">
            <KonuAnlatimDashboard
              key={`${activeExam?.id ?? examSlug}-${topicSlug ?? ""}`}
              examName={activeExam?.name ?? ""}
              topics={topics}
              initialCompletedLessonIds={[...completedLessonIds]}
              initialNotes={notes}
              isSignedIn={Boolean(user)}
              initialTopicId={initialTopicId}
              lockedTopicIds={lockedTopicIds}
            />
          </div>
        </>
      )}
    </main>
  );
}
