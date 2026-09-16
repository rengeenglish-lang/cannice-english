import "server-only";
import { db } from "@/server/db";

export function listExamTopics(examTypeId: string) {
  return db.examTopic.findMany({
    where: { examTypeId },
    orderBy: { displayOrder: "asc" },
    include: { lessons: { select: { id: true } } },
  });
}

export function getTopicBySlug(examSlug: string, topicSlug: string) {
  return db.examTopic.findFirst({
    where: { slug: topicSlug, examType: { slug: examSlug } },
    include: {
      examType: true,
      lessons: { orderBy: { position: "asc" } },
    },
  });
}

export async function getCompletedLessonIdsForUser(userId: string, topicId: string) {
  const progresses = await db.topicLessonProgress.findMany({
    where: { userId, completedAt: { not: null }, topicLesson: { topicId } },
    select: { topicLessonId: true },
  });
  return new Set(progresses.map((progress) => progress.topicLessonId));
}

export async function toggleTopicLessonProgress(userId: string, topicLessonId: string) {
  const existing = await db.topicLessonProgress.findUnique({
    where: { userId_topicLessonId: { userId, topicLessonId } },
  });
  if (existing) {
    return db.topicLessonProgress.update({
      where: { id: existing.id },
      data: { completedAt: existing.completedAt ? null : new Date() },
    });
  }
  return db.topicLessonProgress.create({ data: { userId, topicLessonId, completedAt: new Date() } });
}
