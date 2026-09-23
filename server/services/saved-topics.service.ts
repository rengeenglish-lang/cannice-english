import "server-only";
import { db } from "@/server/db";

export async function saveExamTopic(userId: string, examTopicId: string) {
  const topic = await db.examTopic.findUnique({ where: { id: examTopicId } });
  if (!topic) throw new Error("Konu bulunamadı.");
  return db.savedExamTopic.upsert({
    where: { userId_examTopicId: { userId, examTopicId } },
    update: {},
    create: { userId, examTopicId },
  });
}

export function removeSavedExamTopic(userId: string, examTopicId: string) {
  return db.savedExamTopic.deleteMany({ where: { userId, examTopicId } });
}

/** Derslerim's Konu Anlatımı list, with per-topic lesson progress. */
export async function listSavedTopicsWithProgress(userId: string) {
  const saved = await db.savedExamTopic.findMany({
    where: { userId },
    include: { topic: { include: { examType: true, lessons: { select: { id: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const lessonIds = saved.flatMap((s) => s.topic.lessons.map((l) => l.id));
  const done = lessonIds.length
    ? await db.topicLessonProgress.findMany({ where: { userId, topicLessonId: { in: lessonIds }, completedAt: { not: null } }, select: { topicLessonId: true } })
    : [];
  const doneIds = new Set(done.map((d) => d.topicLessonId));
  return saved.map((s) => {
    const total = s.topic.lessons.length;
    const completed = s.topic.lessons.filter((l) => doneIds.has(l.id)).length;
    return {
      topicId: s.topic.id,
      topicName: s.topic.name,
      topicSlug: s.topic.slug,
      examName: s.topic.examType.name,
      examSlug: s.topic.examType.slug,
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0,
    };
  });
}

export async function savedTopicIdsForUser(userId: string) {
  const rows = await db.savedExamTopic.findMany({ where: { userId }, select: { examTopicId: true } });
  return new Set(rows.map((r) => r.examTopicId));
}
