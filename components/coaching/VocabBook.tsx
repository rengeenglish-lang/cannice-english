"use client";
import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { coachingCopy } from "@/lib/coaching/i18n";
import { buildBookPages, type BookCard } from "@/lib/coaching/vocab-book";
import { FlipBook, formatBookDay } from "@/components/coaching/FlipBook";
import { DeleteCardButton } from "@/components/coaching/VocabReview";

/** "Kelime destem" as a book: one page per day words were added, opened at the newest page, searchable by date. */
export function VocabBook({ locale, cards }: { locale: string; cards: BookCard[] }) {
  const t = coachingCopy(locale);
  const pages = useMemo(
    () =>
      buildBookPages(cards).map((p) => ({
        day: p.day,
        part: p.part,
        count: p.items.length,
        content: (
          <ol className="flip-lines">
            {p.items.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p><strong lang="en" className="text-base">{c.term}</strong> — {c.meaning}</p>
                  {c.example ? <p lang="en" className="text-sm italic text-[color:var(--muted)]">{c.example}</p> : null}
                </div>
                <span className="flex shrink-0 items-center gap-3 pt-0.5 text-xs text-[color:var(--muted)]">
                  {c.nextReviewDay === null ? (
                    <span className="font-bold text-emerald-700">{t.vocab.learned}</span>
                  ) : (
                    <span>{t.vocab.nextReview}: {formatBookDay(c.nextReviewDay, locale, { day: "numeric", month: "short" })}</span>
                  )}
                  <DeleteCardButton locale={locale} id={c.id} />
                </span>
              </li>
            ))}
          </ol>
        ),
      })),
    [cards, locale, t],
  );
  return <FlipBook locale={locale} title={<><BookOpen size={20} aria-hidden="true" /> {t.vocab.deck}</>} titleId="deck" variant="book" unit="words" pages={pages} />;
}
