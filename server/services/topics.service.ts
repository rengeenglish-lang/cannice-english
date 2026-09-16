import "server-only";
import { db } from "@/server/db";

export function listExamTopicsWithLessons(examTypeId: string) {
  return db.examTopic.findMany({
    where: { examTypeId },
    orderBy: { displayOrder: "asc" },
    include: { lessons: { orderBy: { position: "asc" } } },
  });
}

export async function getCompletedTopicLessonIdsForUser(userId: string) {
  const progresses = await db.topicLessonProgress.findMany({
    where: { userId, completedAt: { not: null } },
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

export async function getTopicNotesForUser(userId: string, examTypeId: string) {
  const notes = await db.topicNote.findMany({
    where: { userId, topic: { examTypeId } },
    select: { examTopicId: true, content: true },
  });
  return Object.fromEntries(notes.map((note) => [note.examTopicId, note.content]));
}

export function saveTopicNote(userId: string, examTopicId: string, content: string) {
  return db.topicNote.upsert({
    where: { userId_examTopicId: { userId, examTopicId } },
    update: { content },
    create: { userId, examTopicId, content },
  });
}
