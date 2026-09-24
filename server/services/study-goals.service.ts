import "server-only";
import { db } from "@/server/db";
import { currentPeriodBounds } from "@/lib/study-goal-periods";
import { createStudyGoalSchema, reportStudyGoalFailureSchema } from "@/lib/validation/study-goals";

/**
 * Lazily flips any ACTIVE goal whose period has ended into FAILED (no reason yet - the student is
 * prompted for one next time they see it). Same "check on page load" pattern as
 * billing.service.ts's syncBillingNotices, since there's no cron in this app.
 */
export async function syncStudyGoalStatuses(userId: string) {
  await db.studyGoal.updateMany({
    where: { userId, status: "ACTIVE", periodEnd: { lt: new Date() } },
    data: { status: "FAILED", failedAt: new Date() },
  });
}

export async function createStudyGoal(userId: string, raw: Record<string, unknown>) {
  const input = createStudyGoalSchema.parse(raw);
  const { start, end } = currentPeriodBounds(input.period);
  return db.studyGoal.create({
    data: {
      userId,
      period: input.period,
      periodStart: start,
      periodEnd: end,
      items: {
        create: input.items.map((item) => ({
          kind: item.kind,
          examTopicId: item.kind === "TOPIC" ? item.examTopicId : null,
          quantity: item.kind === "PRACTICE" || item.kind === "MOCK_EXAM" ? item.quantity : null,
          label: item.kind === "CUSTOM" ? item.label : null,
        })),
      },
    },
    include: { items: { include: { examTopic: true } } },
  });
}

export async function markStudyGoalReached(userId: string, goalId: string) {
  const goal = await db.studyGoal.findFirst({ where: { id: goalId, userId } });
  if (!goal || goal.status !== "ACTIVE") return null;
  return db.studyGoal.update({ where: { id: goalId }, data: { status: "REACHED", reachedAt: new Date() } });
}

export async function reportStudyGoalFailureReason(userId: string, raw: Record<string, unknown>) {
  const input = reportStudyGoalFailureSchema.parse(raw);
  const goal = await db.studyGoal.findFirst({ where: { id: input.goalId, userId } });
  if (!goal || goal.status !== "FAILED") throw new Error("Bu hedef için sebep belirtilemez.");
  return db.studyGoal.update({ where: { id: input.goalId }, data: { failureReason: input.reason } });
}

export function getStudyGoalHistory(userId: string) {
  return db.studyGoal.findMany({
    where: { userId },
    include: { items: { include: { examTopic: { select: { name: true, examType: { select: { name: true } } } } } } },
    orderBy: { periodStart: "desc" },
  });
}

/** Failed goals the student has explained - what İlerleme Raporu's "Hedefler" tab surfaces. */
export function getStudyGoalFailureReports(userId: string) {
  return db.studyGoal.findMany({
    where: { userId, status: "FAILED", failureReason: { not: null } },
    include: { items: { include: { examTopic: { select: { name: true } } } } },
    orderBy: { failedAt: "desc" },
  });
}

/** Topics for the popup's dropdown, scoped to the student's active ExamGoal exam (if any). */
export async function listTopicsForActiveExamGoal(userId: string) {
  const goal = await db.examGoal.findFirst({ where: { userId, isActive: true }, select: { examTypeId: true } });
  if (!goal) return [];
  return db.examTopic.findMany({ where: { examTypeId: goal.examTypeId }, orderBy: { displayOrder: "asc" }, select: { id: true, name: true } });
}
