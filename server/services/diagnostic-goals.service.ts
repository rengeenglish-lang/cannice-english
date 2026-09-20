import "server-only";
import { db } from "@/server/db";
import { examGoalSchema } from "@/lib/validation/diagnostics";

export function getActiveGoal(userId: string) {
  return db.examGoal.findFirst({
    where: { userId, isActive: true },
    include: { examType: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getGoalHistory(userId: string) {
  return db.examGoal.findMany({
    where: { userId },
    include: { examType: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Setting a new goal supersedes any other active goal for this user — one journey at a time. */
export async function setActiveGoal(userId: string, raw: Record<string, unknown>) {
  const input = examGoalSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await tx.examGoal.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
    return tx.examGoal.create({
      data: {
        userId,
        examTypeId: input.examTypeId,
        currentScoreKnown: input.currentScoreKnown,
        currentScoreRaw: input.currentScoreRaw || null,
        targetScoreRaw: input.targetScoreRaw,
        targetTimeframe: input.targetTimeframe,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        isActive: true,
      },
    });
  });
}
