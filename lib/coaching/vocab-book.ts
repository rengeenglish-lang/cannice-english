import { dayKey } from "@/lib/coaching/time";
import { paginateByDay } from "@/lib/coaching/book";

/** One card as the deck book shows it. Dates are serialised so the book can be a client component. */
export type BookCard = {
  id: string;
  term: string;
  meaning: string;
  example: string | null;
  source: string;
  /** Local day the card was added, "YYYY-MM-DD". */
  addedDay: string;
  /** Local day of the next review, or null once learned. */
  nextReviewDay: string | null;
};

export const WORDS_PER_PAGE = 8;

export function toBookCard(
  c: { id: string; term: string; meaning: string; example: string | null; source: string; createdAt: Date; dueAt: Date; masteredAt: Date | null },
  tz: string,
): BookCard {
  return {
    id: c.id,
    term: c.term,
    meaning: c.meaning,
    example: c.example,
    source: c.source,
    addedDay: dayKey(c.createdAt, tz),
    nextReviewDay: c.masteredAt ? null : dayKey(c.dueAt, tz),
  };
}

/** The deck as book pages, one day per page, oldest first. */
export function buildBookPages(cards: BookCard[], perPage = WORDS_PER_PAGE) {
  return paginateByDay(cards, (c) => c.addedDay, perPage);
}
