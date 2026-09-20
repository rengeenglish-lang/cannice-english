import "server-only";
import { db } from "@/server/db";
import { recommendationsForTopics } from "@/lib/diagnostics/recommendations";

export async function getResultsForAttempt(attemptId: string, userId: string) {
  const attempt = await db.diagnosticAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      examType: true,
      goal: true,
      topicResults: { include: { topic: true }, orderBy: { accuracy: "asc" } },
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

  return { attempt, weakResults, topPriority, recommendationsByTopic };
}
