import type { Metadata } from "next";
import Link from "next/link";
import { requireCoaching } from "@/server/services/coaching/context";
import { countDueMistakes, lessonLinkFor, listNotebook, recurringMistakeTopics } from "@/server/services/coaching/notebook.service";
import { AddMistakeForm, MistakeNoteEditor } from "@/components/coaching/Notebook";
import { dayLabel } from "@/server/services/coaching/views";
import { dayKey } from "@/lib/coaching/time";

export const metadata: Metadata = { title: "Kişisel hata defteri" };

export default async function NotebookPage() {
  const { user, profile, t } = await requireCoaching();
  const locale = t.locale;
  const [items, due, recurring] = await Promise.all([listNotebook(user.id), countDueMistakes(user.id), recurringMistakeTopics(user.id)]);
  const shown = items.slice(0, 60);
  // One lesson lookup per topic, not per question.
  const topics = new Map<string, { id: string; slug: string }>();
  for (const i of shown) if (i.question) topics.set(i.question.topic.id, { id: i.question.topic.id, slug: i.question.topic.slug });
  const lessons = new Map(await Promise.all([...topics.values()].map(async (tp) => [tp.id, await lessonLinkFor(tp, profile.contentExamSlug)] as const)));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{t.notebook.title}</h1>
          <p className="page-copy mt-2">{t.notebook.lead}</p>
        </div>
        {due ? <Link href="/dashboard/kocluk/defter/tekrar" className="primary-button">{t.notebook.retry} ({due})</Link> : null}
      </header>

      {recurring.length ? (
        <section className="dashboard-panel" aria-labelledby="recurring">
          <h2 id="recurring" className="section-title !text-lg">{t.notebook.repeated}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recurring.map((r) => <li key={r.tag} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">{r.tag} · {t.notebook.timesWrong(r.times)}</li>)}
          </ul>
        </section>
      ) : null}

      {shown.length ? (
        <ol className="space-y-4">
          {shown.map(({ entry, question }) => {
            const lesson = question ? lessons.get(question.topic.id) : null;
            return (
              <li key={entry.id} className="dashboard-panel">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[color:var(--muted)]">
                  <span>{entry.topicTags.join(" · ") || (entry.source === "MANUAL" ? t.notebook.manual : "")}</span>
                  <span className={entry.masteredAt ? "text-emerald-700" : ""}>
                    {entry.masteredAt ? t.notebook.mastered : `${t.notebook.timesWrong(entry.timesWrong)}${entry.correctStreak ? ` · ${t.notebook.streak(entry.correctStreak)}` : ""} · ${t.notebook.nextRetry}: ${dayLabel(dayKey(entry.dueAt, profile.timezone), locale, { day: "numeric", month: "short" })}`}
                  </span>
                </div>
                {question ? <p lang="en" className="mt-2 line-clamp-3 whitespace-pre-wrap font-semibold leading-7">{question.prompt}</p> : <p className="mt-2 text-sm text-[color:var(--muted)]">{t.notebook.noQuestion}</p>}
                {entry.note ? <p className="mt-2 rounded-xl bg-[color:var(--brand-soft)] p-3 text-sm">{entry.note}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  {lesson ? <Link href={lesson.href} className="font-bold text-[color:var(--accent)]">{t.notebook.lesson}: {lesson.label}</Link> : null}
                  {question ? <Link href="/dashboard/practice" className="font-bold text-[color:var(--accent)]">{t.notebook.practice}</Link> : null}
                </div>
                <div className="mt-3"><MistakeNoteEditor locale={locale} id={entry.id} note={entry.note ?? ""} tags={entry.topicTags} /></div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="learning-empty">{t.notebook.empty}</p>
      )}

      <section className="dashboard-panel" aria-labelledby="add-mistake">
        <h2 id="add-mistake" className="section-title !text-lg">{t.notebook.addManual}</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{t.notebook.manualHelp}</p>
        <div className="mt-4"><AddMistakeForm locale={locale} /></div>
      </section>
    </div>
  );
}
