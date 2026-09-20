import "server-only";
import { db } from "@/server/db";
import { diagnosticQuestionSchema, parseSlugList } from "@/lib/validation/admin";

export function listQuestionsForAdmin(filters: { examFamily?: string; topicId?: string; isActive?: boolean } = {}) {
  return db.diagnosticQuestion.findMany({
    where: {
      examFamily: filters.examFamily as never,
      topicId: filters.topicId,
      isActive: filters.isActive,
    },
    include: { topic: true, examType: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getQuestionForEdit(id: string) {
  return db.diagnosticQuestion.findUnique({ where: { id }, include: { topic: true } });
}

export function listTopicsForPicker() {
  return db.diagnosticTopic.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

function optionsFromRaw(optionsRaw: string): string[] {
  const options = optionsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (options.length !== 4) throw new Error("Tam olarak 4 seçenek girin (her satıra bir tane).");
  return options;
}

async function questionData(raw: Record<string, unknown>) {
  const input = diagnosticQuestionSchema.parse(raw);
  const topic = await db.diagnosticTopic.findUnique({ where: { slug: input.topicSlug } });
  if (!topic) throw new Error("Geçerli bir konu seçin.");
  const secondarySlugs = parseSlugList(input.secondaryTopicSlugs);
  const secondaryTopics = secondarySlugs.length ? await db.diagnosticTopic.findMany({ where: { slug: { in: secondarySlugs } } }) : [];
  const options = optionsFromRaw(input.optionsRaw);

  return {
    examFamily: input.examFamily,
    examTypeId: input.examTypeId || null,
    topicId: topic.id,
    secondaryTopicIds: secondaryTopics.map((t) => t.id),
    questionType: input.questionType,
    difficulty: input.difficulty,
    prompt: input.prompt,
    passageText: input.passageText || null,
    audioUrl: input.audioUrl || null,
    options,
    correctAnswer: String(input.correctIndex),
    explanation: input.explanation || null,
    tags: parseSlugList(input.tags),
    isActive: input.isActive,
  };
}

export async function createQuestion(raw: Record<string, unknown>) {
  return db.diagnosticQuestion.create({ data: await questionData(raw) });
}

export async function updateQuestion(id: string, raw: Record<string, unknown>) {
  return db.diagnosticQuestion.update({ where: { id }, data: await questionData(raw) });
}

/** Never hard-deleted — a frozen attempt's questionOrder may still reference it. */
export async function deactivateQuestion(id: string) {
  return db.diagnosticQuestion.update({ where: { id }, data: { isActive: false } });
}

export async function reactivateQuestion(id: string) {
  return db.diagnosticQuestion.update({ where: { id }, data: { isActive: true } });
}
