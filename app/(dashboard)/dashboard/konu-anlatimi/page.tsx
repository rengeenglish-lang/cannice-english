import type { Metadata } from "next";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listExamTypes, getExamTypeBySlug } from "@/server/services/catalog.service";
import { listExamTopicsWithLessons } from "@/server/services/topics.service";
import { savedTopicIdsForUser } from "@/server/services/saved-topics.service";
import { getPlanAccess } from "@/server/services/plans.service";
import { addSavedTopicAction } from "@/app/actions/saved-topics";
import { konuAnlatimHref } from "@/lib/konu-links";

export const metadata: Metadata = { title: "Konu Seçimi" };

/**
 * Konu Anlatımı entry point inside the dashboard: pick a subject (exam), then a topic, then
 * "Ders Ekle" — which adds it to Derslerim and redirects there.
 */
export default async function TopicSelectionPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { exam } = await searchParams;
  const [exams, activeExam, saved, access] = await Promise.all([
    listExamTypes(),
    exam ? getExamTypeBySlug(exam) : Promise.resolve(null),
    savedTopicIdsForUser(user.id),
    getPlanAccess(user),
  ]);
  const topics = activeExam ? await listExamTopicsWithLessons(activeExam.id) : [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Konu Anlatımı</p>
        <h1 className="page-title">{activeExam ? `${activeExam.name} konuları` : "Hangi sınavın konularını çalışmak istersin?"}</h1>
        <p className="page-copy">
          {activeExam
            ? "Çalışmak istediğin konuyu seç ve “Ders Ekle” ile Derslerim bölümüne ekle."
            : "Önce sınavını seç; ardından konuları tek tek derslerine ekleyebilirsin."}
        </p>
      </div>

      {!access.can("KONU_ANLATIMI") ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Konuları derslerine ekleyebilirsin; her sınavın ilk konusu ücretsiz önizlemedir. Tüm konu anlatımlarına erişim Başlangıç, Çırak ve Uzman planlarına dahildir.{" "}
          <Link href="/dashboard/mock-exam#planlar" className="font-bold underline">Planları incele</Link>
        </p>
      ) : null}

      <nav aria-label="Sınav seçimi" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {exams.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/konu-anlatimi?exam=${item.slug}`}
            aria-current={activeExam?.id === item.id ? "page" : undefined}
            className={`rounded-2xl border p-4 text-sm font-extrabold transition ${
              activeExam?.id === item.id ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border)] bg-white hover:border-[color:var(--brand)]"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {activeExam ? (
        topics.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => {
              const isSaved = saved.has(topic.id);
              return (
                <li key={topic.id} className="dashboard-panel flex flex-col gap-3">
                  <div>
                    <p className="font-bold">{topic.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {topic.lessons.length} ders{topic.questionCount ? ` · sınavda ~${topic.questionCount} soru` : ""}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {isSaved ? (
                      <Link href={konuAnlatimHref(activeExam.slug, topic.slug)} className="secondary-button text-xs">
                        <Check size={16} aria-hidden="true" /> Eklendi — Aç
                      </Link>
                    ) : (
                      <form action={addSavedTopicAction.bind(null, topic.id)}>
                        <button type="submit" className="primary-button text-xs">
                          <Plus size={16} aria-hidden="true" /> Ders Ekle
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="learning-empty">{activeExam.name} için konu anlatımları yakında eklenecek.</p>
        )
      ) : null}
    </div>
  );
}
