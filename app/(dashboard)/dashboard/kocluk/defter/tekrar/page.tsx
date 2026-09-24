import type { Metadata } from "next";
import Link from "next/link";
import { requireCoaching } from "@/server/services/coaching/context";
import { countDueMistakes, lessonLinkFor, nextDueMistake } from "@/server/services/coaching/notebook.service";
import { NotebookRetry } from "@/components/coaching/Notebook";

export const metadata: Metadata = { title: "Hata defteri tekrarı" };

export default async function NotebookRetryPage() {
  const { user, profile, t } = await requireCoaching();
  const [next, due] = await Promise.all([nextDueMistake(user.id), countDueMistakes(user.id)]);
  const lesson = next ? await lessonLinkFor({ id: next.question.topic.id, slug: next.question.topic.slug }, profile.contentExamSlug) : null;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">{t.notebook.retry}</h1>
        <p className="page-copy mt-2">{t.notebook.due(due)}</p>
      </header>
      {next ? (
        <NotebookRetry
          key={next.entry.id}
          locale={t.locale}
          lesson={lesson}
          question={{
            entryId: next.entry.id,
            prompt: next.question.prompt,
            passageText: next.question.passageText,
            audioUrl: next.question.audioUrl,
            options: Array.isArray(next.question.options) ? (next.question.options as string[]) : [],
            topic: next.question.topic.name,
            timesWrong: next.entry.timesWrong,
            streak: next.entry.correctStreak,
          }}
        />
      ) : (
        <div className="learning-empty">
          <p className="font-bold">{t.notebook.noneDue}</p>
          <Link href="/dashboard/kocluk/defter" className="secondary-button mt-4">{t.notebook.title}</Link>
        </div>
      )}
    </div>
  );
}
