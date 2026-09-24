import "server-only";
import { db } from "@/server/db";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { cefrFromPercentage } from "@/lib/diagnostics/cefr";
import type { PathwayConfig, SkillKey } from "@/lib/coaching/exams";
import { skillForDiagnosticTopic } from "@/server/services/coaching/catalog.service";

export type SkillStat = { skill: SkillKey; answered: number; correct: number; wrong: number; blank: number; accuracy: number | null };
export type TopicStat = { topicId: string; name: string; skill: SkillKey; questionType: string; answered: number; correct: number; accuracy: number | null };
export type MockResult = { attemptId: string; date: Date; setNumber: number | null; correct: number; total: number; blank: number; percent: number; estimate: number | null; usedMinutes: number | null; limitMinutes: number; timedOut: boolean };

const MIN_FOR_VERDICT = 5;

/**
 * Real results only: every answered question in attempts for the coaching exam (any kind —
 * level test, practice, mastery check, mock), grouped by coaching skill, topic and question type.
 * Questions left blank in finished attempts count as blank. `since`/`until` bound the period.
 */
export async function examPerformance(userId: string, config: PathwayConfig, examTypeId: string | null, since?: Date, until?: Date) {
  const empty = { skills: [] as SkillStat[], topics: [] as TopicStat[], answered: 0 };
  if (!examTypeId) return empty;
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId, examTypeId, ...(since || until ? { startedAt: { ...(since ? { gte: since } : {}), ...(until ? { lt: until } : {}) } } : {}) },
    select: { status: true, questionOrder: true, responses: { select: { questionId: true, isCorrect: true, answerRaw: true } } },
  });
  if (!attempts.length) return empty;
  const questionIds = [...new Set(attempts.flatMap((a) => a.questionOrder))];
  const questions = await db.diagnosticQuestion.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, questionType: true, topic: { select: { id: true, slug: true, name: true, parent: { select: { slug: true } } } } },
  });
  const qById = new Map(questions.map((q) => [q.id, q]));
  const skills = new Map<SkillKey, SkillStat>();
  const topics = new Map<string, TopicStat>();
  let answered = 0;
  const bump = (qid: string, outcome: "correct" | "wrong" | "blank") => {
    const q = qById.get(qid);
    if (!q) return;
    const skill = skillForDiagnosticTopic(config, q.topic.slug, q.topic.parent?.slug);
    const s = skills.get(skill) ?? { skill, answered: 0, correct: 0, wrong: 0, blank: 0, accuracy: null };
    s[outcome] += 1;
    if (outcome !== "blank") s.answered += 1;
    skills.set(skill, s);
    if (outcome === "blank") return;
    const key = `${q.topic.id}:${q.questionType}`;
    const tStat = topics.get(key) ?? { topicId: q.topic.id, name: q.topic.name, skill, questionType: q.questionType, answered: 0, correct: 0, accuracy: null };
    tStat.answered += 1;
    if (outcome === "correct") tStat.correct += 1;
    topics.set(key, tStat);
  };
  for (const a of attempts) {
    const seen = new Set<string>();
    for (const r of a.responses) {
      if (r.answerRaw === null || r.isCorrect === null) continue; // ungraded writing/speaking is never auto-scored
      seen.add(r.questionId);
      answered += 1;
      bump(r.questionId, r.isCorrect ? "correct" : "wrong");
    }
    if (a.status === "COMPLETED") for (const qid of a.questionOrder) if (!seen.has(qid) && !a.responses.some((r) => r.questionId === qid)) bump(qid, "blank");
  }
  const acc = (c: number, n: number) => (n >= 1 ? Math.round((c / n) * 100) : null);
  return {
    skills: [...skills.values()].map((s) => ({ ...s, accuracy: acc(s.correct, s.answered) })),
    topics: [...topics.values()].map((x) => ({ ...x, accuracy: acc(x.correct, x.answered) })).sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101)),
    answered,
  };
}

/** Skills with enough answers and low accuracy — used to steer plans toward weaknesses. */
export function weakSkillsFrom(stats: SkillStat[]): SkillKey[] {
  return stats.filter((s) => s.answered >= MIN_FOR_VERDICT && (s.accuracy ?? 100) < 60).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0)).map((s) => s.skill);
}

export function strongSkillsFrom(stats: SkillStat[]): SkillKey[] {
  return stats.filter((s) => s.answered >= MIN_FOR_VERDICT && (s.accuracy ?? 0) >= 75).map((s) => s.skill);
}

/**
 * Mock (Deneme Sınavı) history with an estimate on the exam's own scale only where an official
 * linear rule exists and the paper matches the real exam length (YDS / e-YDS / YÖKDİL: 80
 * questions × 1.25). Everything else stays raw accuracy.
 */
export async function mockHistory(userId: string, config: PathwayConfig, examTypeId: string | null, since?: Date, until?: Date): Promise<MockResult[]> {
  if (!examTypeId) return [];
  const examType = await db.examType.findUnique({ where: { id: examTypeId } });
  if (!examType) return [];
  const limit = attemptConfigForExam(examType.code).mockExamTimeLimitMinutes;
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId, examTypeId, kind: "MOCK_EXAM", status: "COMPLETED", ...(since || until ? { completedAt: { ...(since ? { gte: since } : {}), ...(until ? { lt: until } : {}) } } : {}) },
    include: { responses: { select: { isCorrect: true, answerRaw: true } } },
    orderBy: { completedAt: "asc" },
  });
  return attempts.map((a) => {
    const total = a.questionOrder.length;
    const correct = a.responses.filter((r) => r.isCorrect === true).length;
    const answered = a.responses.filter((r) => r.answerRaw !== null).length;
    const used = a.completedAt ? Math.round((a.completedAt.getTime() - a.startedAt.getTime()) / 60000) : null;
    const estimate = config.estimate && total === config.estimate.totalQuestions ? Math.round(correct * config.estimate.perCorrect * 100) / 100 : null;
    return {
      attemptId: a.id,
      date: a.completedAt ?? a.startedAt,
      setNumber: a.mockSetNumber,
      correct,
      total,
      blank: total - answered,
      percent: total ? Math.round((correct / total) * 100) : 0,
      estimate,
      usedMinutes: used,
      limitMinutes: limit,
      timedOut: used !== null && used >= limit,
    };
  });
}

/** Latest level test for the coaching exam — an estimate, labelled as such wherever it's shown. */
export async function latestLevelEstimate(userId: string, examTypeId: string | null, academic: boolean) {
  if (!examTypeId) return null;
  const attempt = await db.diagnosticAttempt.findFirst({
    where: { userId, examTypeId, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" },
    include: { responses: { select: { isCorrect: true } } },
    orderBy: { completedAt: "desc" },
  });
  if (!attempt) return null;
  const total = attempt.questionOrder.length;
  const percent = total ? Math.round((attempt.responses.filter((r) => r.isCorrect === true).length / total) * 100) : 0;
  return { attemptId: attempt.id, date: attempt.completedAt, percent, cefr: academic ? cefrFromPercentage(percent) : null };
}

/**
 * Minutes of recorded activity: time between start and finish of tests and practice sets the
 * student completed on the site in the period (capped per attempt so an attempt left open
 * overnight doesn't count as hours of study).
 */
export async function recordedMinutes(userId: string, since: Date, until: Date) {
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId, status: "COMPLETED", completedAt: { gte: since, lt: until } },
    select: { startedAt: true, completedAt: true, kind: true },
  });
  return attempts.reduce((sum, a) => {
    const mins = (a.completedAt!.getTime() - a.startedAt.getTime()) / 60000;
    const cap = a.kind === "MOCK_EXAM" ? 180 : 60;
    return sum + Math.max(0, Math.min(cap, Math.round(mins)));
  }, 0);
}
