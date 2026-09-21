import { z } from "zod";

export const testimonialSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  studentPhotoUrl: z.string().trim().url().optional().or(z.literal("")),
  examTypeId: z.string().trim().optional().or(z.literal("")),
  resultSummary: z.string().trim().max(60).optional().or(z.literal("")),
  quote: z.string().trim().min(10).max(600),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  isPublished: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanın"),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().trim().min(20),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export const blogCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanın"),
});

export const productCategoryEnum = z.enum(["PREP_GROUP", "MOCK_CAMP", "STUDY_PACKAGE", "TRANSLATION_SUPPORT", "BOOK"]);
export const productLevelEnum = z.enum(["BEGINNER_TO_ADVANCED", "INTERMEDIATE_ADVANCED", "JUNIOR", "SENIOR"]);
export const deliveryFormatEnum = z.enum(["HYBRID", "RECORDED_ONLY", "LIVE_ONLY"]);
export const bookFormatEnum = z.enum(["PDF", "PRINT", "PRINT_AND_PDF"]);

export const productSchema = z.object({
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanın"),
  title: z.string().trim().min(3).max(160),
  subtitle: z.string().trim().max(160).optional().or(z.literal("")),
  category: productCategoryEnum,
  examTypeId: z.string().trim().optional().or(z.literal("")),
  level: z.union([productLevelEnum, z.literal("")]).optional(),
  posterImageUrl: z.string().trim().url().optional().or(z.literal("")),
  badgeLabel: z.string().trim().max(60).optional().or(z.literal("")),
  basePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  isPublished: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  // Course-only
  deliveryFormat: z.union([deliveryFormatEnum, z.literal("")]).optional(),
  syllabusSummary: z.string().trim().max(500).optional().or(z.literal("")),
  // Book-only
  author: z.string().trim().max(120).optional().or(z.literal("")),
  format: z.union([bookFormatEnum, z.literal("")]).optional(),
  pageCount: z.coerce.number().int().min(0).optional().or(z.literal("")),
  isbn: z.string().trim().max(40).optional().or(z.literal("")),
  digitalFileUrl: z.string().trim().url().optional().or(z.literal("")),
  // Diagnostic content tagging — comma-separated DiagnosticTopic slugs, matching the
  // existing BlogPost.tags convention (formDataToObject can't carry a repeated field name).
  diagnosticTopicSlugs: z.string().trim().max(500).optional().or(z.literal("")),
});

export const moduleSchema = z.object({ title: z.string().trim().min(2).max(160) });

export const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  durationMinutes: z.coerce.number().int().min(0).optional().or(z.literal("")),
  isPreviewable: z.coerce.boolean().default(false),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const topicCategoryEnum = z.enum(["SPEAKING", "WRITING", "READING", "LISTENING"]);
export const topicDifficultyEnum = z.enum(["Kolay", "Orta", "Zor"]);

export const examTopicSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanın"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  questionCount: z.coerce.number().int().min(0).optional().or(z.literal("")),
  category: z.union([topicCategoryEnum, z.literal("")]).optional(),
  skillsTested: z.string().trim().max(200).optional().or(z.literal("")),
  difficulty: z.union([topicDifficultyEnum, z.literal("")]).optional(),
  displayOrder: z.coerce.number().int().default(0),
});

export const topicLessonSchema = z.object({
  title: z.string().trim().min(2).max(200),
  durationMinutes: z.coerce.number().int().min(0).optional().or(z.literal("")),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  contentBody: z.string().trim().max(60000).optional().or(z.literal("")),
  diagnosticTopicSlugs: z.string().trim().max(500).optional().or(z.literal("")),
});

export function parseSlugList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const diagnosticTopicKindEnum = z.enum(["SKILL", "SUBSKILL", "TOPIC"]);
export const examFamilyEnum = z.enum(["ACADEMIC_SKILLS", "TRANSLATION_GRAMMAR"]);

export const diagnosticTopicSchema = z.object({
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanın"),
  name: z.string().trim().min(2).max(160),
  kind: diagnosticTopicKindEnum,
  examFamilies: z.array(examFamilyEnum).min(1),
  parentSlug: z.string().trim().optional().or(z.literal("")),
  importanceWeight: z.coerce.number().int().min(1).max(5).default(1),
  estimatedMinutes: z.coerce.number().int().min(0).optional().or(z.literal("")),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0),
  dependsOnSlugs: z.string().trim().max(500).optional().or(z.literal("")),
});

export const diagnosticQuestionTypeEnum = z.enum([
  "MCQ",
  "LISTENING_MCQ",
  "CLOZE",
  "TRANSLATION_EN_TR",
  "TRANSLATION_TR_EN",
  "SENTENCE_COMPLETION",
  "PARAGRAPH_COMPLETION",
  "READING_COMPREHENSION",
  "RESTATEMENT",
  "WRITING_TASK",
]); // SPEAKING_TASK intentionally omitted — would need its own audio-recording pipeline, which
// would just duplicate the existing, separate AI Speaking Tutor feature.

export const diagnosticDifficultyEnum = z.enum(["KOLAY", "ORTA", "ZOR"]);

const MANUAL_GRADING_QUESTION_TYPES = ["WRITING_TASK"];

export const diagnosticQuestionSchema = z
  .object({
    examFamily: examFamilyEnum,
    examTypeId: z.string().trim().optional().or(z.literal("")),
    topicSlug: z.string().trim().min(1),
    secondaryTopicSlugs: z.string().trim().max(500).optional().or(z.literal("")),
    questionType: diagnosticQuestionTypeEnum,
    difficulty: diagnosticDifficultyEnum.default("ORTA"),
    prompt: z.string().trim().min(3).max(2000),
    passageText: z.string().trim().max(4000).optional().or(z.literal("")),
    audioUrl: z.string().trim().url().optional().or(z.literal("")),
    // One option per line, exactly 4 lines — required for every type except free-response ones
    // (Writing has no fixed answer to pick from, so there's nothing to validate here).
    optionsRaw: z.string().trim().optional().or(z.literal("")),
    correctIndex: z.coerce.number().int().min(0).max(3).optional(),
    explanation: z.string().trim().max(2000).optional().or(z.literal("")),
    tags: z.string().trim().max(300).optional().or(z.literal("")),
    isActive: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (MANUAL_GRADING_QUESTION_TYPES.includes(data.questionType)) return;
    if (!data.optionsRaw) {
      ctx.addIssue({ code: "custom", path: ["optionsRaw"], message: "Bu soru türü için 4 seçenek girin." });
    }
    if (data.correctIndex === undefined) {
      ctx.addIssue({ code: "custom", path: ["correctIndex"], message: "Doğru seçeneği belirtin." });
    }
  });

export const liveSessionSchema = z.object({
  title: z.string().trim().min(2).max(160),
  cohortLabel: z.string().trim().max(80).optional().or(z.literal("")),
  startsAt: z.string().trim().min(1),
  endsAt: z.string().trim().min(1),
  meetingUrl: z.string().trim().url().optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(1).optional().or(z.literal("")),
});
