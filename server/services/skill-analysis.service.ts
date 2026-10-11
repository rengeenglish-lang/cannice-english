import "server-only";
import { db } from "@/server/db";
import { KONU_SLUG_CANDIDATES, konuAnlatimHref } from "@/lib/konu-links";
import { creditSeconds } from "@/lib/diagnostics/skill-analysis";

/** Adds one reading-timer report to the student's time on a Konu Anlatımı topic. */
export async function recordTopicStudy(userId: string, examTopicId: string, reported: number, now = new Date()) {
  const topic = await db.examTopic.findUnique({ where: { id: examTopicId }, select: { id: true } });
  if (!topic) return 0;
  return db.$transaction(async (tx) => {
    // Lock the row so two tabs reporting at once are credited one after the other.
    const [row] = await tx.$queryRaw<{ lastPingAt: Date }[]>`SELECT "lastPingAt" FROM topic_study_times WHERE "userId" = ${userId} AND "examTopicId" = ${examTopicId} FOR UPDATE`;
    const credit = creditSeconds(reported, row?.lastPingAt ?? null, now);
    if (!row) {
      await tx.topicStudyTime.upsert({
        where: { userId_examTopicId: { userId, examTopicId } },
        create: { userId, examTopicId, seconds: credit, lastPingAt: now },
        update: { seconds: { increment: credit }, lastPingAt: now },
      });
    } else if (credit > 0) {
      await tx.topicStudyTime.update({ where: { userId_examTopicId: { userId, examTopicId } }, data: { seconds: { increment: credit }, lastPingAt: now } });
    }
    return credit;
  });
}

export type SkillRow = {
  topicId: string;
  /** The matching Konu Anlatımı topics of this exam (a skill can span several). */
  lessonHref: string | null;
  lessonLabel: string | null;
  questionsSolved: number;
  questionsCorrect: number;
  studiedMinutes: number;
};

/**
 * For each diagnostic topic: its Konu Anlatımı topic(s) in this exam (explicitly tagged lessons
 * first, then the slug fallback map), the questions the student has answered on it anywhere on
 * the site, and the reading time recorded on those Konu Anlatımı topics.
 */
export async function skillAnalysis(userId: string, examTypeId: string, examSlug: string, topics: { id: string; slug: string }[]) {
  const ids = topics.map((t) => t.id);
  const [tagged, examTopics, answered, times] = await Promise.all([
    db.topicLesson.findMany({ where: { diagnosticTopicIds: { hasSome: ids }, topic: { examTypeId } }, select: { diagnosticTopicIds: true, topic: { select: { id: true, slug: true, name: true, displayOrder: true } } } }),
    db.examTopic.findMany({ where: { examTypeId }, select: { id: true, slug: true, name: true, displayOrder: true } }),
    db.diagnosticResponse.groupBy({
      by: ["questionId", "isCorrect"],
      where: { attempt: { userId }, question: { topicId: { in: ids } }, answerRaw: { not: null } },
      _count: { _all: true },
    }),
    db.topicStudyTime.findMany({ where: { userId, topic: { examTypeId } }, select: { examTopicId: true, seconds: true } }),
  ]);
  const questionTopic = new Map(
    (await db.diagnosticQuestion.findMany({ where: { id: { in: [...new Set(answered.map((a) => a.questionId))] } }, select: { id: true, topicId: true } })).map((q) => [q.id, q.topicId]),
  );
  const secondsByTopic = new Map(times.map((t) => [t.examTopicId, t.seconds]));
  const bySlug = new Map(examTopics.map((t) => [t.slug, t]));

  return new Map(
    topics.map((t) => {
      const linked = new Map<string, { id: string; slug: string; name: string; displayOrder: number }>();
      for (const l of tagged) if (l.diagnosticTopicIds.includes(t.id)) linked.set(l.topic.id, l.topic);
      if (!linked.size) {
        const fallback = (KONU_SLUG_CANDIDATES[t.slug] ?? []).map((s) => bySlug.get(s)).find(Boolean);
        if (fallback) linked.set(fallback.id, fallback);
      }
      const konu = [...linked.values()].sort((a, b) => a.displayOrder - b.displayOrder);
      let solved = 0;
      let correct = 0;
      for (const a of answered) {
        if (questionTopic.get(a.questionId) !== t.id) continue;
        solved += a._count._all;
        if (a.isCorrect === true) correct += a._count._all;
      }
      const seconds = konu.reduce((n, k) => n + (secondsByTopic.get(k.id) ?? 0), 0);
      const row: SkillRow = {
        topicId: t.id,
        lessonHref: konu[0] ? konuAnlatimHref(examSlug, konu[0].slug) : null,
        lessonLabel: konu[0]?.name ?? null,
        questionsSolved: solved,
        questionsCorrect: correct,
        studiedMinutes: Math.round(seconds / 60),
      };
      return [t.id, row] as const;
    }),
  );
}
