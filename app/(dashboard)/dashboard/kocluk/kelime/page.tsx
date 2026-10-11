import type { Metadata } from "next";
import { db } from "@/server/db";
import { requireCoaching } from "@/server/services/coaching/context";
import { dueVocab, hasSiteVocabulary, vocabSummary } from "@/server/services/coaching/vocab.service";
import { AddCardForm, VocabReview } from "@/components/coaching/VocabReview";
import { VocabBook } from "@/components/coaching/VocabBook";
import { toBookCard } from "@/lib/coaching/vocab-book";

export const metadata: Metadata = { title: "Kelime tekrarı" };

export default async function CoachingVocabPage() {
  const { user, profile, t } = await requireCoaching();
  const locale = t.locale;
  const [due, summary, hasSite, cards] = await Promise.all([
    dueVocab(user.id),
    vocabSummary(user.id),
    hasSiteVocabulary(profile.contentExamSlug),
    // The whole deck, oldest first: the book is paged by the day each word was added.
    db.vocabCard.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 2000 }),
  ]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">{t.vocab.title}</h1>
        <p className="page-copy mt-2">{t.vocab.lead}</p>
        <p className="mt-3 text-sm font-bold text-[color:var(--muted)]">{t.vocab.due(due.length)} · {t.vocab.total(summary.total)} · {t.vocab.mastered(summary.mastered)}</p>
      </header>

      <VocabReview locale={locale} cards={due.map((c) => ({ id: c.id, term: c.term, meaning: c.meaning, example: c.example, source: c.source }))} />
      <p className="text-xs text-[color:var(--muted)]">{t.vocab.masteryNote}</p>
      {!hasSite ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{t.vocab.noSiteList}</p> : null}

      <section className="dashboard-panel" aria-labelledby="add-card">
        <h2 id="add-card" className="section-title !text-lg">{t.vocab.add}</h2>
        <div className="mt-4"><AddCardForm locale={locale} /></div>
      </section>

      <VocabBook locale={locale} cards={cards.map((c) => toBookCard(c, profile.timezone))} />
    </div>
  );
}
