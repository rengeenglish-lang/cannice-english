import "server-only";
import { db } from "@/server/db";
import { gradeAutoAnswer, isAutoGraded } from "@/lib/diagnostics/grading";
import { retryMistake } from "@/lib/coaching/srs";
import { KONU_SLUG_CANDIDATES, konuAnlatimHref } from "@/lib/konu-links";

const DAY = 86_400_000;

/**
 * Collects wrong answers into the notebook automatically. Only answers newer than the last sync
 * are read, so this is cheap to run on every coaching page load. A question already in the
 * notebook counts one more miss and is due again tomorrow.
 */
export async function syncMistakes(userId: string, since: Date | null) {
  const wrong = await db.diagnosticResponse.findMany({
    where: { isCorrect: false, attempt: { userId }, ...(since ? { answeredAt: { gt: since } } : {}) },
    select: { questionId: true, answeredAt: true, question: { select: { topic: { select: { slug: true, name: true } } } } },
    orderBy: { answeredAt: "asc" },
    take: 500,
  });
  for (const r of wrong) {
    const due = new Date(r.answeredAt.getTime() + DAY);
    await db.mistakeEntry.upsert({
      where: { userId_questionId: { userId, questionId: r.questionId } },
      update: { timesWrong: { increment: 1 }, correctStreak: 0, lastWrongAt: r.answeredAt, dueAt: due, masteredAt: null },
      create: { userId, questionId: r.questionId, source: "AUTO", topicTags: [r.question.topic.name], lastWrongAt: r.answeredAt, dueAt: due },
    });
  }
  return wrong.length;
}

export function countDueMistakes(userId: string, now = new Date()) {
  return db.mistakeEntry.count({ where: { userId, masteredAt: null, questionId: { not: null }, dueAt: { lte: now } } });
}

export async function listNotebook(userId: string) {
  const entries = await db.mistakeEntry.findMany({ where: { userId }, orderBy: [{ masteredAt: { sort: "asc", nulls: "first" } }, { timesWrong: "desc" }, { lastWrongAt: "desc" }], take: 200 });
  const questionIds = entries.map((e) => e.questionId).filter((id): id is string => Boolean(id));
  const questions = questionIds.length
    ? await db.diagnosticQuestion.findMany({ where: { id: { in: questionIds } }, include: { topic: true, examType: true } })
    : [];
  const byId = new Map(questions.map((q) => [q.id, q]));
  return entries.map((e) => ({ entry: e, question: e.questionId ? (byId.get(e.questionId) ?? null) : null }));
}

/** Link back to the exact Konu Anlatımı topic for a question, using the same fallback map as Hatalarım. */
export async function lessonLinkFor(topic: { id: string; slug: string }, examSlug: string | null) {
  if (!examSlug) return null;
  const topicSlug = topic.slug;
  const tagged = await db.topicLesson.findFirst({ where: { diagnosticTopicIds: { has: topic.id }, topic: { examType: { slug: examSlug } } }, include: { topic: true } });
  if (tagged) return { href: konuAnlatimHref(examSlug, tagged.topic.slug), label: tagged.topic.name };
  for (const slug of KONU_SLUG_CANDIDATES[topicSlug] ?? []) {
    const topic = await db.examTopic.findFirst({ where: { slug, examType: { slug: examSlug } } });
    if (topic) return { href: konuAnlatimHref(examSlug, topic.slug), label: topic.name };
  }
  return null;
}

export async function nextDueMistake(userId: string, now = new Date()) {
  const entry = await db.mistakeEntry.findFirst({ where: { userId, masteredAt: null, questionId: { not: null }, dueAt: { lte: now } }, orderBy: [{ timesWrong: "desc" }, { dueAt: "asc" }] });
  if (!entry) return null;
  const question = await db.diagnosticQuestion.findUnique({ where: { id: entry.questionId! }, include: { topic: true } });
  return question ? { entry, question } : null;
}

/** Grades a notebook retry and reschedules it. Returns null if the entry isn't the student's. */
export async function retryNotebookQuestion(userId: string, entryId: string, answerRaw: string, todayKey: string) {
  const entry = await db.mistakeEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry?.questionId) return null;
  const question = await db.diagnosticQuestion.findUnique({ where: { id: entry.questionId } });
  if (!question || !isAutoGraded(question.questionType)) return null;
  const correct = gradeAutoAnswer(question.correctAnswer, answerRaw) === true;
  const now = new Date();
  const next = retryMistake({ correctStreak: entry.correctStreak, timesWrong: entry.timesWrong, lastRetryDay: entry.lastRetryDay }, correct, now, todayKey);
  await db.mistakeEntry.update({
    where: { id: entry.id },
    data: {
      correctStreak: next.correctStreak,
      timesWrong: next.timesWrong,
      lastRetryDay: next.lastRetryDay,
      dueAt: next.dueAt,
      masteredAt: next.mastered ? now : null,
      ...(next.lastWrongAt ? { lastWrongAt: next.lastWrongAt } : {}),
    },
  });
  return { correct, question, mastered: next.mastered };
}

export function addManualMistake(userId: string, note: string, tags: string[]) {
  return db.mistakeEntry.create({ data: { userId, note, topicTags: tags, source: "MANUAL", dueAt: new Date(Date.now() + DAY) } });
}

export function updateMistakeNote(userId: string, entryId: string, note: string, tags: string[]) {
  return db.mistakeEntry.updateMany({ where: { id: entryId, userId }, data: { note: note || null, topicTags: tags } });
}

export function deleteMistake(userId: string, entryId: string) {
  return db.mistakeEntry.deleteMany({ where: { id: entryId, userId } });
}

/** Topics the student keeps getting wrong — fed back into plan priorities and reports. */
export async function recurringMistakeTopics(userId: string, limit = 5) {
  const rows = await db.mistakeEntry.findMany({ where: { userId, masteredAt: null, timesWrong: { gte: 2 } }, select: { topicTags: true, timesWrong: true } });
  const counts = new Map<string, number>();
  for (const r of rows) for (const tag of r.topicTags) counts.set(tag, (counts.get(tag) ?? 0) + r.timesWrong);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag, times]) => ({ tag, times }));
}
