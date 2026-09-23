import "server-only";
import { db } from "@/server/db";
import { recommendationsForTopics } from "@/lib/diagnostics/recommendations";
import { cefrFromPercentage } from "@/lib/diagnostics/cefr";
import { PRACTICE_SECTIONS, practiceSectionForTopic, type PracticeSectionKey } from "@/lib/practice-sections";

export async function getResultsForAttempt(attemptId: string, userId: string) {
  const attempt = await db.diagnosticAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      examType: true,
      goal: true,
      topicResults: { include: { topic: true }, orderBy: { accuracy: "asc" } },
      responses: true,
    },
  });
  if (!attempt || attempt.status !== "COMPLETED") return null;

  const weakResults = attempt.topicResults.filter((r) => r.severity !== "STRONG");
  const topPriority = attempt.goal
    ? await db.studyRoadmapItem.findFirst({
        where: { userId, goalId: attempt.goal.id, status: { in: ["NOT_STARTED", "IN_PROGRESS", "MASTERY_CHECK_REQUIRED"] } },
        include: { topic: true },
        orderBy: { priorityRank: "asc" },
      })
    : null;

  const recommendations = await recommendationsForTopics(userId, weakResults.map((r) => r.topicId));
  const recommendationsByTopic = new Map(recommendations.map((r) => [r.topicId, r]));

  const total = attempt.questionOrder.length;
  const correct = attempt.responses.filter((r) => r.isCorrect === true).length;
  const incorrect = attempt.responses.filter((r) => r.isCorrect === false).length;
  // A Writing/Speaking answer's isCorrect stays null forever (auto-grading doesn't apply), both
  // before AND after a teacher reviews it — so "unanswered" must key off whether the student
  // actually submitted something, not off isCorrect, or a reviewed essay would wrongly count as
  // never answered once it drops out of the "pending" bucket.
  const pendingReview = attempt.responses.filter((r) => r.gradingStatus === "PENDING").length;
  const answered = attempt.responses.filter((r) => r.answerRaw !== null).length;
  const overall = { total, correct, incorrect, pendingReview, unanswered: total - answered, percentage: total ? Math.round((correct / total) * 100) : 0 };

  return { attempt, weakResults, topPriority, recommendationsByTopic, overall };
}

/** Every completed attempt (any kind), with totals from the attempt's own responses — not DiagnosticTopicResult, which double-counts via secondaryTopicIds fan-out. */
export async function getAttemptHistory(userId: string) {
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId, status: "COMPLETED" },
    include: { examType: true, responses: true },
    orderBy: { completedAt: "desc" },
  });
  const topicIds = attempts.map((a) => a.scopeTopicId).filter((id): id is string => Boolean(id));
  const topics = topicIds.length ? await db.diagnosticTopic.findMany({ where: { id: { in: topicIds } } }) : [];
  const topicNameById = new Map(topics.map((t) => [t.id, t.name]));

  return attempts.map((a) => {
    // Total question count, not just answered count — matters for a mock exam auto-submitted by the timer.
    const total = a.questionOrder.length;
    const correct = a.responses.filter((r) => r.isCorrect === true).length;
    return {
      id: a.id,
      kind: a.kind,
      mockSetNumber: a.mockSetNumber,
      examName: a.examType.name,
      topicName: a.scopeTopicId ? (topicNameById.get(a.scopeTopicId) ?? null) : null,
      completedAt: a.completedAt,
      total,
      correct,
      percentage: total ? Math.round((correct / total) * 100) : 0,
    };
  });
}

/** Practice results are a plain scored review (§14), not the weakness/roadmap-oriented diagnostic summary. */
export async function getPracticeResults(attemptId: string, userId: string) {
  const attempt = await db.diagnosticAttempt.findFirst({
    where: { id: attemptId, userId, kind: "PRACTICE" },
    include: { examType: true, responses: true },
  });
  if (!attempt || attempt.status !== "COMPLETED") return null;

  const [questions, topic] = await Promise.all([
    db.diagnosticQuestion.findMany({ where: { id: { in: attempt.questionOrder } } }),
    attempt.scopeTopicId ? db.diagnosticTopic.findUnique({ where: { id: attempt.scopeTopicId } }) : null,
  ]);
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const responseByQuestion = new Map(attempt.responses.map((r) => [r.questionId, r]));

  const items = attempt.questionOrder
    .map((qid) => ({ question: questionById.get(qid), response: responseByQuestion.get(qid) ?? null }))
    .filter((item): item is { question: NonNullable<typeof item.question>; response: (typeof item)["response"] } => Boolean(item.question));

  const total = items.length;
  const correct = items.filter((i) => i.response?.isCorrect === true).length;
  const incorrect = items.filter((i) => i.response && i.response.isCorrect === false).length;
  const pendingReview = items.filter((i) => i.response?.gradingStatus === "PENDING").length;
  const answered = items.filter((i) => i.response?.answerRaw !== null && i.response?.answerRaw !== undefined).length;
  const unanswered = total - answered;

  return {
    attempt,
    topicName: topic?.name ?? null,
    items,
    total,
    correct,
    pendingReview,
    incorrect,
    unanswered,
    percentage: total ? Math.round((correct / total) * 100) : 0,
  };
}

/** Completed seviye tespit (FULL_DIAGNOSTIC) attempts, newest first, with score, CEFR band and per-topic results. */
export async function getLevelTestHistory(userId: string) {
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" },
    include: { examType: true, responses: { select: { isCorrect: true } }, topicResults: { include: { topic: true }, orderBy: { accuracy: "asc" } } },
    orderBy: { completedAt: "desc" },
  });
  return attempts.map((a) => {
    const total = a.questionOrder.length;
    const correct = a.responses.filter((r) => r.isCorrect === true).length;
    const percentage = total ? Math.round((correct / total) * 100) : 0;
    const academic = a.examFamily === "ACADEMIC_SKILLS";
    return {
      id: a.id,
      examTypeId: a.examTypeId,
      examName: a.examType.name,
      academic,
      completedAt: a.completedAt,
      total,
      correct,
      percentage,
      cefr: academic ? cefrFromPercentage(percentage) : null,
      topicResults: a.topicResults.map((r) => ({ name: r.topic.name, accuracy: r.accuracy, severity: r.severity, answered: r.questionsAnswered })),
    };
  });
}

export type SkillResultCounts = { correct: number; wrong: number; pending: number; blank: number };

/**
 * İlerleme Raporu donut: every question the student has met (any test kind), bucketed by Pratik
 * Bankası skill section and by outcome. "Boş" counts questions left unanswered in completed tests
 * (they have no response row), so a timed-out deneme still shows its gaps.
 */
export async function getSkillBreakdown(userId: string): Promise<Record<PracticeSectionKey, SkillResultCounts>> {
  const empty = (): SkillResultCounts => ({ correct: 0, wrong: 0, pending: 0, blank: 0 });
  const result = Object.fromEntries(PRACTICE_SECTIONS.map((s) => [s.key, empty()])) as Record<PracticeSectionKey, SkillResultCounts>;
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId },
    select: { status: true, questionOrder: true, responses: { select: { questionId: true, isCorrect: true, gradingStatus: true, answerRaw: true } } },
  });
  const outcomes: { questionId: string; bucket: keyof SkillResultCounts }[] = [];
  for (const a of attempts) {
    const answered = new Set<string>();
    for (const r of a.responses) {
      if (r.answerRaw === null) continue;
      answered.add(r.questionId);
      outcomes.push({ questionId: r.questionId, bucket: r.isCorrect === true ? "correct" : r.isCorrect === false ? "wrong" : "pending" });
    }
    if (a.status === "COMPLETED") {
      for (const qid of a.questionOrder) if (!answered.has(qid)) outcomes.push({ questionId: qid, bucket: "blank" });
    }
  }
  if (outcomes.length === 0) return result;
  const questions = await db.diagnosticQuestion.findMany({
    where: { id: { in: [...new Set(outcomes.map((o) => o.questionId))] } },
    select: { id: true, topic: { select: { slug: true, parent: { select: { slug: true } } } } },
  });
  const sectionByQuestion = new Map(questions.map((q) => [q.id, practiceSectionForTopic({ slug: q.topic.slug, parentSlug: q.topic.parent?.slug })]));
  for (const o of outcomes) {
    const section = sectionByQuestion.get(o.questionId);
    if (section) result[section][o.bucket] += 1;
  }
  return result;
}
