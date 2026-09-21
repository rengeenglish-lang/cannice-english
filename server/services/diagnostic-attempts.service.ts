import "server-only";
import { db, type TransactionClient } from "@/server/db";
import type { ExamFamily } from "@/lib/generated/prisma/enums";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { isAutoGraded, gradeAutoAnswer } from "@/lib/diagnostics/grading";
import { severityFromAccuracy } from "@/lib/diagnostics/priority";
import { regenerateRoadmap, applyMasteryCheckResult } from "@/server/services/study-roadmap.service";
import type { ExamCode } from "@/lib/generated/prisma/enums";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles questions while keeping every reading-passage's questions contiguous (in their
 * fetched, i.e. authored, order) — a plain shuffle scatters a passage's questions randomly
 * through the attempt, which breaks any UI (e.g. a split-screen passage view) that expects to
 * show one passage for a stretch of consecutive questions, the way a real reading test does.
 */
function groupedShuffle<T extends { passageText: string | null }>(items: T[]): T[] {
  const byPassage = new Map<string, T[]>();
  const groups: T[][] = [];
  for (const item of items) {
    if (!item.passageText) {
      groups.push([item]);
      continue;
    }
    const existing = byPassage.get(item.passageText);
    if (existing) {
      existing.push(item);
    } else {
      const group: T[] = [item];
      byPassage.set(item.passageText, group);
      groups.push(group);
    }
  }
  return shuffle(groups).flat();
}

async function selectFullDiagnosticQuestions(tx: TransactionClient, examFamily: ExamFamily, examTypeId: string, examCode: ExamCode) {
  const config = attemptConfigForExam(examCode);
  const topics = await tx.diagnosticTopic.findMany({ where: { isActive: true, examFamilies: { has: examFamily }, OR: [{ examTypeId: null }, { examTypeId }] } });
  const selected: { id: string; passageText: string | null }[] = [];
  for (const topic of topics) {
    const questions = await tx.diagnosticQuestion.findMany({
      where: { isActive: true, topicId: topic.id, examFamily, mockSetNumber: null, OR: [{ examTypeId: null }, { examTypeId }] },
      select: { id: true, passageText: true },
      orderBy: { createdAt: "asc" },
    });
    selected.push(...shuffle(questions).slice(0, config.questionsPerTopic));
  }
  return groupedShuffle(selected).map((q) => q.id);
}

async function selectMasteryCheckQuestions(tx: TransactionClient, topicId: string, examFamily: ExamFamily, examTypeId: string, examCode: ExamCode) {
  const config = attemptConfigForExam(examCode);
  const questions = await tx.diagnosticQuestion.findMany({
    where: { isActive: true, topicId, examFamily, mockSetNumber: null, OR: [{ examTypeId: null }, { examTypeId }] },
    select: { id: true, passageText: true },
    orderBy: { createdAt: "asc" },
  });
  return groupedShuffle(shuffle(questions).slice(0, config.masteryCheckQuestions)).map((q) => q.id);
}

/** `topicId: null` means "karma" — a mixed sample across every topic in the family, not one topic's pool. */
async function selectPracticeQuestions(tx: TransactionClient, topicId: string | null, examFamily: ExamFamily, examTypeId: string, examCode: ExamCode) {
  const config = attemptConfigForExam(examCode);
  const questions = await tx.diagnosticQuestion.findMany({
    where: { isActive: true, examFamily, mockSetNumber: null, OR: [{ examTypeId: null }, { examTypeId }], ...(topicId ? { topicId } : {}) },
    select: { id: true, passageText: true },
    orderBy: { createdAt: "asc" },
  });
  return groupedShuffle(shuffle(questions).slice(0, config.practiceSetSize)).map((q) => q.id);
}

/** Pulls the fixed "Deneme N" paper — a curated, non-random question set — rather than a random pool sample. */
async function selectMockExamQuestions(tx: TransactionClient, examFamily: ExamFamily, examTypeId: string, examCode: ExamCode, setNumber: number) {
  const config = attemptConfigForExam(examCode);
  const questions = await tx.diagnosticQuestion.findMany({
    where: { isActive: true, examFamily, mockSetNumber: setNumber, OR: [{ examTypeId: null }, { examTypeId }] },
    select: { id: true, passageText: true },
    orderBy: { createdAt: "asc" },
  });
  return groupedShuffle(questions.slice(0, config.mockExamQuestionCount)).map((q) => q.id);
}

/** Every mock-set number that has at least one active question for this exam (family-shared or exam-specific). */
export async function listMockExamSetNumbers(examTypeId: string, examFamily: ExamFamily): Promise<number[]> {
  const rows = await db.diagnosticQuestion.findMany({
    where: { isActive: true, examFamily, mockSetNumber: { not: null }, OR: [{ examTypeId: null }, { examTypeId }] },
    select: { mockSetNumber: true },
    distinct: ["mockSetNumber"],
  });
  return rows.map((r) => r.mockSetNumber!).sort((a, b) => a - b);
}

/** Per-set status for the mock-exam picker: not started / in progress / best completed score. */
export async function getMockExamSetsOverview(userId: string, examTypeId: string, examFamily: ExamFamily) {
  const setNumbers = await listMockExamSetNumbers(examTypeId, examFamily);
  const attempts = await db.diagnosticAttempt.findMany({
    where: { userId, examTypeId, kind: "MOCK_EXAM", mockSetNumber: { in: setNumbers } },
    orderBy: { startedAt: "desc" },
  });
  return setNumbers.map((setNumber) => {
    const forSet = attempts.filter((a) => a.mockSetNumber === setNumber);
    const inProgress = forSet.find((a) => a.status === "IN_PROGRESS");
    const completed = forSet.filter((a) => a.status === "COMPLETED");
    return { setNumber, inProgressAttemptId: inProgress?.id ?? null, completedCount: completed.length, lastCompletedAttemptId: completed[0]?.id ?? null };
  });
}

export async function findOrCreateFullDiagnosticAttempt(
  userId: string,
  examTypeId: string,
  examCode: ExamCode,
  examFamily: ExamFamily,
  goalId: string,
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId} || ${goalId} || 'full'))::text`;
    const existing = await tx.diagnosticAttempt.findFirst({ where: { userId, goalId, kind: "FULL_DIAGNOSTIC", status: "IN_PROGRESS" } });
    if (existing) return { attempt: existing, resumed: true };
    const questionOrder = await selectFullDiagnosticQuestions(tx, examFamily, examTypeId, examCode);
    if (questionOrder.length === 0) return { attempt: null, resumed: false };
    const attempt = await tx.diagnosticAttempt.create({
      data: { userId, examTypeId, examFamily, kind: "FULL_DIAGNOSTIC", goalId, questionOrder, status: "IN_PROGRESS" },
    });
    return { attempt, resumed: false };
  });
}

export async function findOrCreateMasteryCheckAttempt(
  userId: string,
  examTypeId: string,
  examCode: ExamCode,
  examFamily: ExamFamily,
  goalId: string,
  topicId: string,
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId} || ${goalId} || ${topicId} || 'mastery'))::text`;
    const existing = await tx.diagnosticAttempt.findFirst({
      where: { userId, goalId, kind: "MASTERY_CHECK", scopeTopicId: topicId, status: "IN_PROGRESS" },
    });
    if (existing) return { attempt: existing, resumed: true };
    const questionOrder = await selectMasteryCheckQuestions(tx, topicId, examFamily, examTypeId, examCode);
    if (questionOrder.length === 0) return { attempt: null, resumed: false };
    const attempt = await tx.diagnosticAttempt.create({
      data: { userId, examTypeId, examFamily, kind: "MASTERY_CHECK", scopeTopicId: topicId, goalId, questionOrder, status: "IN_PROGRESS" },
    });
    return { attempt, resumed: false };
  });
}

/** `topicId: null` starts a "karma" (mixed cross-topic) practice set. Practice never touches the roadmap. */
export async function findOrCreatePracticeAttempt(
  userId: string,
  examTypeId: string,
  examCode: ExamCode,
  examFamily: ExamFamily,
  goalId: string,
  topicId: string | null,
) {
  const lockKey = topicId ?? "karma";
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId} || ${lockKey} || 'practice'))::text`;
    const existing = await tx.diagnosticAttempt.findFirst({
      where: { userId, kind: "PRACTICE", scopeTopicId: topicId, status: "IN_PROGRESS", examTypeId },
    });
    if (existing) return { attempt: existing, resumed: true };
    const questionOrder = await selectPracticeQuestions(tx, topicId, examFamily, examTypeId, examCode);
    if (questionOrder.length === 0) return { attempt: null, resumed: false };
    const attempt = await tx.diagnosticAttempt.create({
      data: { userId, examTypeId, examFamily, kind: "PRACTICE", scopeTopicId: topicId, goalId, questionOrder, status: "IN_PROGRESS" },
    });
    return { attempt, resumed: false };
  });
}

/** A timed simulation of one fixed "Deneme N" paper — one in-progress attempt per (exam type, set number) at a time. */
export async function findOrCreateMockExamAttempt(
  userId: string,
  examTypeId: string,
  examCode: ExamCode,
  examFamily: ExamFamily,
  goalId: string,
  setNumber: number,
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId} || ${examTypeId} || 'mock' || ${setNumber}::text))::text`;
    const existing = await tx.diagnosticAttempt.findFirst({ where: { userId, examTypeId, kind: "MOCK_EXAM", mockSetNumber: setNumber, status: "IN_PROGRESS" } });
    if (existing) return { attempt: existing, resumed: true };
    const questionOrder = await selectMockExamQuestions(tx, examFamily, examTypeId, examCode, setNumber);
    if (questionOrder.length === 0) return { attempt: null, resumed: false };
    const attempt = await tx.diagnosticAttempt.create({
      data: { userId, examTypeId, examFamily, kind: "MOCK_EXAM", mockSetNumber: setNumber, goalId, questionOrder, status: "IN_PROGRESS" },
    });
    return { attempt, resumed: false };
  });
}

export function getAttempt(attemptId: string, userId: string) {
  return db.diagnosticAttempt.findFirst({ where: { id: attemptId, userId }, include: { responses: true } });
}

export async function submitAnswer(attemptId: string, userId: string, questionId: string, answerRaw: string) {
  const attempt = await db.diagnosticAttempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) throw new Error("Deneme bulunamadı.");
  if (attempt.status !== "IN_PROGRESS") throw new Error("Bu deneme artık düzenlenemez.");
  if (attempt.kind === "MOCK_EXAM") {
    const examType = await db.examType.findUnique({ where: { id: attempt.examTypeId } });
    const limitMinutes = examType ? attemptConfigForExam(examType.code).mockExamTimeLimitMinutes : 180;
    if (Date.now() - attempt.startedAt.getTime() > limitMinutes * 60_000) {
      throw new Error("Sınav süresi doldu.");
    }
  }
  const question = await db.diagnosticQuestion.findUnique({ where: { id: questionId } });
  if (!question || !attempt.questionOrder.includes(questionId)) throw new Error("Soru bulunamadı.");

  const autoGraded = isAutoGraded(question.questionType);
  const isCorrect = autoGraded ? gradeAutoAnswer(question.correctAnswer, answerRaw) : null;

  await db.diagnosticResponse.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, answerRaw, isCorrect, gradingStatus: autoGraded ? null : "PENDING" },
    update: { answerRaw, isCorrect },
  });

  const idx = attempt.questionOrder.indexOf(questionId);
  if (idx === attempt.currentIndex) {
    await db.diagnosticAttempt.update({
      where: { id: attemptId },
      data: { currentIndex: Math.min(attempt.currentIndex + 1, attempt.questionOrder.length) },
    });
  }
}

/** Completes the attempt, computes per-topic results, and triggers the right downstream update (roadmap regen or mastery-check status). */
export async function finishAttempt(attemptId: string, userId: string) {
  const attempt = await db.$transaction(async (tx) => {
    const current = await tx.diagnosticAttempt.findFirst({ where: { id: attemptId, userId }, include: { responses: true } });
    if (!current) throw new Error("Deneme bulunamadı.");
    if (current.status === "COMPLETED") return current;

    const questions = await tx.diagnosticQuestion.findMany({ where: { id: { in: current.questionOrder } } });
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const stats = new Map<string, { answered: number; correct: number }>();
    for (const response of current.responses) {
      if (response.isCorrect === null) continue; // ungraded manual response — excluded until reviewed
      const q = questionById.get(response.questionId);
      if (!q) continue;
      for (const topicId of [q.topicId, ...q.secondaryTopicIds]) {
        const s = stats.get(topicId) ?? { answered: 0, correct: 0 };
        s.answered += 1;
        if (response.isCorrect) s.correct += 1;
        stats.set(topicId, s);
      }
    }

    for (const [topicId, s] of stats) {
      const accuracy = s.correct / s.answered;
      await tx.diagnosticTopicResult.upsert({
        where: { attemptId_topicId: { attemptId, topicId } },
        create: { attemptId, userId, topicId, questionsAnswered: s.answered, questionsCorrect: s.correct, accuracy, severity: severityFromAccuracy(accuracy, s.answered) },
        update: { questionsAnswered: s.answered, questionsCorrect: s.correct, accuracy, severity: severityFromAccuracy(accuracy, s.answered) },
      });
    }

    return tx.diagnosticAttempt.update({ where: { id: attemptId }, data: { status: "COMPLETED", completedAt: new Date() } });
  });

  if ((attempt.kind === "FULL_DIAGNOSTIC" || attempt.kind === "MOCK_EXAM") && attempt.goalId) {
    await regenerateRoadmap(userId, attempt.goalId);
  } else if (attempt.kind === "MASTERY_CHECK" && attempt.goalId && attempt.scopeTopicId) {
    const result = await db.diagnosticTopicResult.findUnique({ where: { attemptId_topicId: { attemptId, topicId: attempt.scopeTopicId } } });
    const config = await db.examType.findUnique({ where: { id: attempt.examTypeId } });
    const passThreshold = config ? attemptConfigForExam(config.code).masteryPassThreshold : 0.7;
    const passed = Boolean(result && result.accuracy >= passThreshold);
    await db.$transaction((tx) => applyMasteryCheckResult(tx, userId, attempt.scopeTopicId!, attempt.goalId!, passed));
  }

  return attempt;
}
