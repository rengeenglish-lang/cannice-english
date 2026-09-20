import "server-only";
import { db, type TransactionClient } from "@/server/db";
import { rankRoadmapTopics, severityFromAccuracy } from "@/lib/diagnostics/priority";

/**
 * Single entry point every completion trigger (full diagnostic, mastery check, future
 * manual-grade arrival) calls to keep the roadmap in sync. Upsert-only — never deletes or
 * downgrades the status of an item the student has already started or finished; only
 * priorityRank/severityAtCreation/sourceAttemptId are ever touched on an existing item.
 */
export async function regenerateRoadmap(userId: string, goalId: string) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId} || ${goalId}))::text`;

    const latestAttempt = await tx.diagnosticAttempt.findFirst({
      where: { userId, goalId, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: { topicResults: true },
    });
    if (!latestAttempt) return;

    const topicIds = latestAttempt.topicResults.map((r) => r.topicId);
    const [topics, dependencies] = await Promise.all([
      tx.diagnosticTopic.findMany({ where: { id: { in: topicIds } } }),
      tx.topicDependency.findMany({ where: { topicId: { in: topicIds } } }),
    ]);
    const weightById = new Map(topics.map((t) => [t.id, t.importanceWeight]));

    const ranked = rankRoadmapTopics(
      latestAttempt.topicResults.map((r) => ({ topicId: r.topicId, severity: r.severity, importanceWeight: weightById.get(r.topicId) ?? 1 })),
      dependencies.map((d) => ({ topicId: d.topicId, dependsOnTopicId: d.dependsOnTopicId })),
    );

    for (const item of ranked) {
      await tx.studyRoadmapItem.upsert({
        where: { userId_goalId_topicId: { userId, goalId, topicId: item.topicId } },
        create: {
          userId,
          goalId,
          topicId: item.topicId,
          priorityRank: item.priorityRank,
          severityAtCreation: item.severity,
          status: "NOT_STARTED",
          sourceAttemptId: latestAttempt.id,
        },
        update: {
          priorityRank: item.priorityRank,
          severityAtCreation: item.severity,
          sourceAttemptId: latestAttempt.id,
        },
      });
    }

    const stillWeakIds = new Set(ranked.map((r) => r.topicId));
    await tx.studyRoadmapItem.deleteMany({
      where: { userId, goalId, status: "NOT_STARTED", topicId: { notIn: [...stillWeakIds] } },
    });
  });
}

export function getRoadmap(userId: string, goalId: string) {
  return db.studyRoadmapItem.findMany({
    where: { userId, goalId },
    include: { topic: true },
    orderBy: { priorityRank: "asc" },
  });
}

export function getTodayItem(userId: string, goalId: string) {
  return db.studyRoadmapItem.findFirst({
    where: { userId, goalId, status: { in: ["NOT_STARTED", "IN_PROGRESS", "MASTERY_CHECK_REQUIRED"] } },
    include: { topic: true },
    orderBy: { priorityRank: "asc" },
  });
}

export async function startRoadmapItem(userId: string, itemId: string) {
  const item = await db.studyRoadmapItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) throw new Error("Plan öğesi bulunamadı.");
  if (item.status === "NOT_STARTED") {
    return db.studyRoadmapItem.update({ where: { id: itemId }, data: { status: "IN_PROGRESS", startedAt: new Date() } });
  }
  return item;
}

export async function applyMasteryCheckResult(tx: TransactionClient, userId: string, topicId: string, goalId: string, passed: boolean) {
  const item = await tx.studyRoadmapItem.findUnique({ where: { userId_goalId_topicId: { userId, goalId, topicId } } });
  if (!item) return;
  if (passed) {
    await tx.studyRoadmapItem.update({ where: { id: item.id }, data: { status: "COMPLETED", completedAt: new Date() } });
  } else if (item.status !== "COMPLETED") {
    await tx.studyRoadmapItem.update({ where: { id: item.id }, data: { status: "MASTERY_CHECK_REQUIRED" } });
  }
}

export { severityFromAccuracy };
