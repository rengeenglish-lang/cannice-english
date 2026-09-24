import type { Metadata } from "next";
import { db } from "@/server/db";
import { requireCoaching } from "@/server/services/coaching/context";
import { dueVocab, hasSiteVocabulary, vocabSummary } from "@/server/services/coaching/vocab.service";
import { AddCardForm, DeleteCardButton, VocabReview } from "@/components/coaching/VocabReview";
import { dayLabel } from "@/server/services/coaching/views";
import { dayKey } from "@/lib/coaching/time";

export const metadata: Metadata = { title: "Kelime tekrarı" };

export default async function CoachingVocabPage() {
  const { user, profile, t } = await requireCoaching();
  const locale = t.locale;
  const [due, summary, hasSite, cards] = await Promise.all([
    dueVocab(user.id),
    vocabSummary(user.id),
    hasSiteVocabulary(profile.contentExamSlug),
    db.vocabCard.findMany({ where: { userId: user.id }, orderBy: [{ masteredAt: { sort: "asc", nulls: "first" } }, { dueAt: "asc" }], take: 60 }),
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

      {cards.length ? (
        <section className="dashboard-panel" aria-labelledby="deck">
          <h2 id="deck" className="section-title !text-lg">{t.vocab.deck}</h2>
          <ul className="mt-3 divide-y divide-[color:var(--border)]">
            {cards.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0"><strong lang="en">{c.term}</strong> — {c.meaning}</span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-[color:var(--muted)]">
                  {c.masteredAt ? <span className="font-bold text-emerald-700">{t.vocab.learned}</span> : <span>{t.vocab.nextReview}: {dayLabel(dayKey(c.dueAt, profile.timezone), locale, { day: "numeric", month: "short" })}</span>}
                  <DeleteCardButton locale={locale} id={c.id} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
