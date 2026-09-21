import type { PrismaClient } from "../lib/generated/prisma/client";
import type { ExamCode } from "../lib/generated/prisma/enums";
import { DIAGNOSTIC_TOPICS } from "./seed-data/diagnostic-topics";
import { DIAGNOSTIC_QUESTIONS } from "./seed-data/diagnostic-questions";
import { MOCK_GRAMMAR_SHARED } from "./seed-data/mock-exams/grammar-shared";
import { MOCK_YDS } from "./seed-data/mock-exams/yds";
import { MOCK_YOKDIL_SAGLIK } from "./seed-data/mock-exams/yokdil-saglik";
import { MOCK_YOKDIL_FEN } from "./seed-data/mock-exams/yokdil-fen";
import { MOCK_YOKDIL_SOSYAL } from "./seed-data/mock-exams/yokdil-sosyal";
import { MOCK_IELTS } from "./seed-data/mock-exams/ielts";
import { MOCK_TOEFL } from "./seed-data/mock-exams/toefl";
import { MOCK_PTE } from "./seed-data/mock-exams/pte";

/**
 * Every DIAGNOSTIC_QUESTIONS-shaped array is concatenated in this fixed order before seeding.
 * New arrays must be APPENDED here, never spliced earlier — seedKey is `topicSlug:<Nth
 * occurrence of that topicSlug in the merged array>`, so inserting rows before existing
 * same-topic rows would renumber (and duplicate) everything after them.
 */
const ALL_DIAGNOSTIC_QUESTIONS = [
  ...DIAGNOSTIC_QUESTIONS,
  ...MOCK_GRAMMAR_SHARED,
  ...MOCK_YDS,
  ...MOCK_YOKDIL_SAGLIK,
  ...MOCK_YOKDIL_FEN,
  ...MOCK_YOKDIL_SOSYAL,
  ...MOCK_IELTS,
  ...MOCK_TOEFL,
  ...MOCK_PTE,
];

/**
 * Seeds the diagnostic topic tree, prerequisite edges, and question bank.
 * Idempotent: topics upsert by slug; questions upsert by a synthetic seed key stashed in
 * `tags` (there's no natural unique key on DiagnosticQuestion) so re-running this never
 * duplicates rows or breaks a DiagnosticResponse FK by deleting a question a student already
 * answered in this environment.
 */
export async function seedDiagnosticJourney(db: PrismaClient, examTypes: Record<string, { id: string }>) {
  console.log("Seeding diagnostic journey (topics, dependencies, questions)…");

  const topicIdBySlug = new Map<string, string>();

  // Pass 1: create/update every topic without parent linkage yet (parents may not exist until this loop finishes).
  for (const t of DIAGNOSTIC_TOPICS) {
    const examTypeId = t.examTypeCode ? (examTypes[t.examTypeCode as ExamCode]?.id ?? null) : null;
    const topic = await db.diagnosticTopic.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        kind: t.kind,
        examFamilies: t.examFamilies,
        examTypeId,
        importanceWeight: t.importanceWeight ?? 1,
        estimatedMinutes: t.estimatedMinutes ?? null,
        description: t.description ?? null,
        displayOrder: t.displayOrder ?? 0,
        isActive: true,
      },
      create: {
        slug: t.slug,
        name: t.name,
        kind: t.kind,
        examFamilies: t.examFamilies,
        examTypeId,
        importanceWeight: t.importanceWeight ?? 1,
        estimatedMinutes: t.estimatedMinutes ?? null,
        description: t.description ?? null,
        displayOrder: t.displayOrder ?? 0,
      },
    });
    topicIdBySlug.set(t.slug, topic.id);
  }

  // Pass 2: resolve parentSlug now that every topic exists.
  for (const t of DIAGNOSTIC_TOPICS) {
    if (!t.parentSlug) continue;
    const parentId = topicIdBySlug.get(t.parentSlug);
    if (!parentId) throw new Error(`Unknown parentSlug "${t.parentSlug}" for topic "${t.slug}"`);
    await db.diagnosticTopic.update({ where: { slug: t.slug }, data: { parentTopicId: parentId } });
  }

  // Pass 3: prerequisite edges.
  for (const t of DIAGNOSTIC_TOPICS) {
    if (!t.dependsOnSlugs?.length) continue;
    const topicId = topicIdBySlug.get(t.slug)!;
    for (const depSlug of t.dependsOnSlugs) {
      const dependsOnTopicId = topicIdBySlug.get(depSlug);
      if (!dependsOnTopicId) throw new Error(`Unknown dependsOnSlugs entry "${depSlug}" for topic "${t.slug}"`);
      await db.topicDependency.upsert({
        where: { topicId_dependsOnTopicId: { topicId, dependsOnTopicId } },
        update: {},
        create: { topicId, dependsOnTopicId },
      });
    }
  }

  let created = 0;
  let updated = 0;
  // Keyed per-topic, not by the question's position in the merged array — a global array index
  // would shift (and silently break idempotency, creating duplicates) whenever a new question
  // is inserted anywhere earlier for a different topic. New arrays must only ever be APPENDED
  // to ALL_DIAGNOSTIC_QUESTIONS above, never spliced in earlier.
  const localIndexByTopic = new Map<string, number>();
  for (const q of ALL_DIAGNOSTIC_QUESTIONS) {
    const topicId = topicIdBySlug.get(q.topicSlug);
    if (!topicId) throw new Error(`Unknown topicSlug "${q.topicSlug}"`);
    const localIndex = localIndexByTopic.get(q.topicSlug) ?? 0;
    localIndexByTopic.set(q.topicSlug, localIndex + 1);

    const secondaryTopicIds = (q.secondaryTopicSlugs ?? []).map((slug) => {
      const id = topicIdBySlug.get(slug);
      if (!id) throw new Error(`Unknown secondaryTopicSlugs entry "${slug}" on topic "${q.topicSlug}" #${localIndex}`);
      return id;
    });
    const examTypeId = q.examTypeCode ? (examTypes[q.examTypeCode as ExamCode]?.id ?? null) : null;
    const seedKey = `seed:${q.topicSlug}:${localIndex}`;

    const data = {
      examFamily: q.examFamily,
      examTypeId,
      topicId,
      secondaryTopicIds,
      questionType: q.questionType,
      difficulty: q.difficulty,
      prompt: q.prompt,
      passageText: q.passageText ?? null,
      options: q.options,
      correctAnswer: String(q.correctIndex),
      explanation: q.explanation ?? null,
      tags: [...(q.tags ?? []), seedKey],
      mockSetNumber: q.mockSetNumber ?? null,
      isActive: true,
    };

    const existing = await db.diagnosticQuestion.findFirst({ where: { tags: { has: seedKey } } });
    if (existing) {
      await db.diagnosticQuestion.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await db.diagnosticQuestion.create({ data });
      created++;
    }
  }

  console.log(`Diagnostic journey seeded: ${DIAGNOSTIC_TOPICS.length} topics, ${created} questions created, ${updated} updated.`);
}
