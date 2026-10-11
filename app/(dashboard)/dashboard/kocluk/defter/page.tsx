import type { Metadata } from "next";
import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { requireCoaching } from "@/server/services/coaching/context";
import { countDueMistakes, lessonLinkFor, notebookTimeline, recurringMistakeTopics, type NotebookItem } from "@/server/services/coaching/notebook.service";
import { AddMistakeForm, MistakeNoteEditor } from "@/components/coaching/Notebook";
import { FlipBook } from "@/components/coaching/FlipBook";
import { dayLabel } from "@/server/services/coaching/views";
import { dayKey } from "@/lib/coaching/time";
import { paginateByDay } from "@/lib/coaching/book";
import type { CoachingCopy } from "@/lib/coaching/i18n";

export const metadata: Metadata = { title: "Kişisel hata defteri" };

const ENTRIES_PER_PAGE = 5;
const WRITING_SHOWN = 3;

type Lessons = Map<string, { href: string; label: string } | null>;

function Entry({ item, t, locale, tz, lessons }: { item: NotebookItem; t: CoachingCopy; locale: string; tz: string; lessons: Lessons }) {
  const kicker = "text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]";
  const link = "font-bold text-[color:var(--accent)]";
  if (item.kind === "ENTRY") {
    const { entry, question } = item;
    const lesson = question ? lessons.get(question.topic.id) : null;
    return (
      <>
        <div className={`flex flex-wrap items-center justify-between gap-2 ${kicker}`}>
          <span>{entry.topicTags.join(" · ") || (item.manual ? t.notebook.manual : t.notebook.wrongAnswer)}</span>
          <span className={`normal-case tracking-normal ${entry.masteredAt ? "text-emerald-700" : ""}`}>
            {entry.masteredAt ? t.notebook.mastered : `${t.notebook.timesWrong(entry.timesWrong)}${entry.correctStreak ? ` · ${t.notebook.streak(entry.correctStreak)}` : ""} · ${t.notebook.nextRetry}: ${dayLabel(dayKey(entry.dueAt, tz), locale, { day: "numeric", month: "short" })}`}
          </span>
        </div>
        {question ? <p lang="en" className="line-clamp-3 whitespace-pre-wrap font-semibold">{question.prompt}</p> : <p className="text-sm text-[color:var(--muted)]">{t.notebook.noQuestion}</p>}
        {entry.note ? <p className="rounded-lg bg-[color:var(--brand-soft)] px-3 text-sm">{entry.note}</p> : null}
        <div className="flex flex-wrap items-center gap-x-4 text-sm">
          {lesson ? <Link href={lesson.href} className={link}>{t.notebook.lesson}: {lesson.label}</Link> : null}
          {question ? <Link href="/dashboard/practice" className={link}>{t.notebook.practice}</Link> : null}
        </div>
        <MistakeNoteEditor locale={locale} id={entry.id} note={entry.note ?? ""} tags={entry.topicTags} />
      </>
    );
  }
  if (item.kind === "VOCAB") {
    const c = item.card;
    return (
      <>
        <div className={`flex flex-wrap items-center justify-between gap-2 ${kicker}`}>
          <span>{t.notebook.vocabMissed(c.lapses)}</span>
          {c.masteredAt ? <span className="normal-case tracking-normal text-emerald-700">{t.vocab.learned}</span> : null}
        </div>
        <p><strong lang="en" className="text-base">{c.term}</strong> — {c.meaning}</p>
        <Link href="/dashboard/kocluk/kelime" className={`text-sm ${link}`}>{t.notebook.reviewWords}</Link>
      </>
    );
  }
  if (item.kind === "LEXICON") {
    return (
      <>
        <p className={kicker}>{t.notebook.lexiconTest(item.level, item.setNumber, item.score, item.total)}</p>
        <ul className="flex flex-wrap gap-x-4">
          {item.words.map((w) => <li key={w.word}><strong lang="en">{w.word}</strong> — {w.tr}</li>)}
        </ul>
        <Link href={`/dashboard/kelime-motoru/${item.level.toLowerCase()}/${item.setNumber}`} className={`text-sm ${link}`}>{t.notebook.studySet}</Link>
      </>
    );
  }
  return (
    <>
      <p className={kicker}>{t.notebook.writing(item.taskName)}</p>
      <ul>
        {item.mistakes.slice(0, WRITING_SHOWN).map((m, i) => (
          <li key={i} className="text-sm">
            <span lang="en" className="text-rose-700 line-through">{m.original}</span> → <strong lang="en" className="text-emerald-700">{m.correction}</strong>
            <span className="text-[color:var(--muted)]"> · {m.explanation}</span>
          </li>
        ))}
      </ul>
      <Link href={`/dashboard/yazma-geri-bildirim/${item.feedbackId}`} className={`text-sm ${link}`}>
        {t.notebook.openFeedback}{item.mistakes.length > WRITING_SHOWN ? ` (${t.notebook.moreMistakes(item.mistakes.length - WRITING_SHOWN)})` : ""}
      </Link>
    </>
  );
}

export default async function NotebookPage() {
  const { user, profile, t } = await requireCoaching();
  const locale = t.locale;
  const tz = profile.timezone;
  const [items, due, recurring] = await Promise.all([notebookTimeline(user.id), countDueMistakes(user.id), recurringMistakeTopics(user.id)]);
  // One lesson lookup per topic, not per question.
  const topics = new Map<string, { id: string; slug: string }>();
  for (const i of items) if (i.kind === "ENTRY" && i.question) topics.set(i.question.topic.id, { id: i.question.topic.id, slug: i.question.topic.slug });
  const lessons: Lessons = new Map(await Promise.all([...topics.values()].map(async (tp) => [tp.id, await lessonLinkFor(tp, profile.contentExamSlug)] as const)));

  const pages = paginateByDay(items, (i) => dayKey(i.at, tz), ENTRIES_PER_PAGE).map((p) => ({
    day: p.day,
    part: p.part,
    count: p.items.length,
    content: (
      <ol className="flip-entries">
        {p.items.map((item) => (
          <li key={item.key}><Entry item={item} t={t} locale={locale} tz={tz} lessons={lessons} /></li>
        ))}
      </ol>
    ),
  }));

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

      {pages.length ? (
        <>
          <p className="text-sm text-[color:var(--muted)]">{t.notebook.pagesHelp}</p>
          <FlipBook locale={locale} title={<><NotebookPen size={20} aria-hidden="true" /> {t.notebook.pages}</>} titleId="notebook-pages" variant="notebook" unit="entries" pages={pages} />
        </>
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
