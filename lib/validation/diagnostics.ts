import { z } from "zod";

export const goalTimeframeEnum = z.enum(["EXACT_DATE", "ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "UNKNOWN"]);

export const examGoalSchema = z.object({
  examTypeId: z.string().trim().min(1),
  currentScoreKnown: z.coerce.boolean().default(false),
  currentScoreRaw: z.string().trim().max(40).optional().or(z.literal("")),
  targetScoreRaw: z.string().trim().min(1).max(40),
  targetTimeframe: goalTimeframeEnum.default("UNKNOWN"),
  targetDate: z.string().trim().optional().or(z.literal("")),
});

export const submitAnswerSchema = z.object({
  attemptId: z.string().trim().min(1),
  questionId: z.string().trim().min(1),
  answerRaw: z.string().trim().min(1),
});
