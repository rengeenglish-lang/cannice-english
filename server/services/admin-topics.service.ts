import "server-only";
import { db } from "@/server/db";
import { examTopicSchema, topicLessonSchema } from "@/lib/validation/admin";

export function listExamTypesForAdmin() {
  return db.examType.findMany({ orderBy: { displayOrder: "asc" } });
}

export function getExamTypeWithTopics(examTypeId: string) {
  return db.examType.findUnique({
    where: { id: examTypeId },
    include: {
      topics: { orderBy: { displayOrder: "asc" }, include: { lessons: { select: { id: true } } } },
    },
  });
}

export function getTopicForEdit(topicId: string) {
  return db.examTopic.findUnique({
    where: { id: topicId },
    include: { examType: true, lessons: { orderBy: { position: "asc" } } },
  });
}

function topicData(input: ReturnType<typeof examTopicSchema.parse>) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    questionCount: input.questionCount === "" || input.questionCount === undefined ? null : Number(input.questionCount),
    category: input.category || null,
    skillsTested: input.skillsTested || null,
    difficulty: input.difficulty || null,
    displayOrder: input.displayOrder,
  };
}

export async function createTopic(examTypeId: string, raw: Record<string, unknown>) {
  const input = examTopicSchema.parse(raw);
  return db.examTopic.create({ data: { examTypeId, ...topicData(input) } });
}

export async function updateTopic(topicId: string, raw: Record<string, unknown>) {
  const input = examTopicSchema.parse(raw);
  return db.examTopic.update({ where: { id: topicId }, data: topicData(input) });
}

export async function deleteTopic(topicId: string) {
  return db.examTopic.delete({ where: { id: topicId } });
}

export async function createLesson(topicId: string, raw: Record<string, unknown>) {
  const input = topicLessonSchema.parse(raw);
  const last = await db.topicLesson.findFirst({ where: { topicId }, orderBy: { position: "desc" } });
  return db.topicLesson.create({
    data: {
      topicId,
      title: input.title,
      position: (last?.position ?? -1) + 1,
      durationMinutes: input.durationMinutes === "" || input.durationMinutes === undefined ? null : Number(input.durationMinutes),
      videoUrl: input.videoUrl || null,
      contentBody: input.contentBody || null,
    },
  });
}

export async function updateLesson(lessonId: string, raw: Record<string, unknown>) {
  const input = topicLessonSchema.parse(raw);
  return db.topicLesson.update({
    where: { id: lessonId },
    data: {
      title: input.title,
      durationMinutes: input.durationMinutes === "" || input.durationMinutes === undefined ? null : Number(input.durationMinutes),
      videoUrl: input.videoUrl || null,
      contentBody: input.contentBody || null,
    },
  });
}

export async function deleteLesson(lessonId: string) {
  return db.topicLesson.delete({ where: { id: lessonId } });
}
