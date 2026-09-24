import "server-only";
import { db } from "@/server/db";
import { reviewVocab } from "@/lib/coaching/srs";
import type { CoachingProfileRow } from "@/server/services/coaching/profile.service";

/** New site words introduced per week — enough to keep the deck growing without flooding reviews. */
export const WEEKLY_NEW_WORDS = 10;

type SourceEntry = { term: string; meaning: string; example: string | null; ref: string };

/**
 * Words from the exam's Konu Anlatımı glossary lessons ("… Sözlüğü" / "… Referansı"), each written
 * as "term – meaning" with an optional "Örnek: …" line — the same format the lesson page parses.
 */
async function siteVocabulary(examSlug: string): Promise<SourceEntry[]> {
  const lessons = await db.topicLesson.findMany({
    where: { topic: { examType: { slug: examSlug } }, title: { contains: "Sözlüğü" }, contentBody: { not: null } },
    include: { topic: { select: { displayOrder: true } } },
    orderBy: [{ topic: { displayOrder: "asc" } }, { position: "asc" }],
  });
  const out: SourceEntry[] = [];
  for (const lesson of lessons) {
    for (const block of lesson.contentBody!.split(/\n\n+/)) {
      const [head, ...rest] = block.trim().split("\n");
      const m = head?.match(/^(.{2,80}?)\s+[–-]\s+(.{2,200})$/);
      if (!m) continue;
      const example = rest.find((l) => /^Örnek:/i.test(l))?.replace(/^Örnek:\s*/i, "") ?? null;
      out.push({ term: m[1].trim(), meaning: m[2].trim(), example, ref: lesson.id });
    }
  }
  return out;
}

/** Adds this week's new site words (up to WEEKLY_NEW_WORDS) from where the student left off. */
export async function ensureVocabIntake(profile: CoachingProfileRow, weekStart: Date) {
  if (!profile.contentExamSlug) return 0;
  const addedThisWeek = await db.vocabCard.count({ where: { userId: profile.userId, source: "SITE", createdAt: { gte: weekStart } } });
  if (addedThisWeek >= WEEKLY_NEW_WORDS) return 0;
  const source = await siteVocabulary(profile.contentExamSlug);
  let cursor = profile.vocabSourceCursor;
  let added = 0;
  while (added < WEEKLY_NEW_WORDS - addedThisWeek && cursor < source.length) {
    const entry = source[cursor++];
    const created = await db.vocabCard.createMany({
      data: [{ userId: profile.userId, term: entry.term, meaning: entry.meaning, example: entry.example, source: "SITE", sourceRef: entry.ref, dueAt: new Date() }],
      skipDuplicates: true,
    });
    added += created.count;
  }
  await db.coachingProfile.update({ where: { id: profile.id }, data: { vocabSourceCursor: cursor } });
  return added;
}

export async function hasSiteVocabulary(examSlug: string | null) {
  if (!examSlug) return false;
  return (await db.topicLesson.count({ where: { topic: { examType: { slug: examSlug } }, title: { contains: "Sözlüğü" } } })) > 0;
}

export function dueVocab(userId: string, now = new Date(), take = 20) {
  return db.vocabCard.findMany({ where: { userId, masteredAt: null, dueAt: { lte: now } }, orderBy: { dueAt: "asc" }, take });
}

export function countDueVocab(userId: string, now = new Date()) {
  return db.vocabCard.count({ where: { userId, masteredAt: null, dueAt: { lte: now } } });
}

export async function vocabSummary(userId: string) {
  const [total, mastered] = await Promise.all([db.vocabCard.count({ where: { userId } }), db.vocabCard.count({ where: { userId, masteredAt: { not: null } } })]);
  return { total, mastered };
}

export async function reviewCard(userId: string, cardId: string, knewIt: boolean) {
  const card = await db.vocabCard.findFirst({ where: { id: cardId, userId } });
  if (!card) return null;
  const now = new Date();
  const next = reviewVocab({ box: card.box, reviews: card.reviews, lapses: card.lapses }, knewIt, now);
  return db.vocabCard.update({
    where: { id: card.id },
    data: { box: next.box, reviews: next.reviews, lapses: next.lapses, dueAt: next.dueAt, lastReviewedAt: now, masteredAt: next.mastered ? now : null },
  });
}

export function addStudentCard(userId: string, input: { term: string; meaning: string; example?: string }) {
  return db.vocabCard.upsert({
    where: { userId_term: { userId, term: input.term } },
    update: { meaning: input.meaning, example: input.example || null },
    create: { userId, term: input.term, meaning: input.meaning, example: input.example || null, source: "STUDENT", dueAt: new Date() },
  });
}

export function deleteCard(userId: string, cardId: string) {
  return db.vocabCard.deleteMany({ where: { id: cardId, userId } });
}
