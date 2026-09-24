import { z } from "zod";

export const studyGoalPeriodEnum = z.enum(["DAY", "WEEK", "MONTH"]);

export const studyGoalItemSchema = z.union([
  z.object({ kind: z.literal("TOPIC"), examTopicId: z.string().trim().min(1) }),
  z.object({ kind: z.literal("PRACTICE"), quantity: z.coerce.number().int().min(1).max(50) }),
  z.object({ kind: z.literal("MOCK_EXAM"), quantity: z.coerce.number().int().min(1).max(20) }),
  z.object({ kind: z.literal("CUSTOM"), label: z.string().trim().min(1).max(200) }),
]);

export const createStudyGoalSchema = z.object({
  period: studyGoalPeriodEnum,
  items: z.array(studyGoalItemSchema).min(1).max(20),
});

export const reportStudyGoalFailureSchema = z.object({
  goalId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(500),
});
