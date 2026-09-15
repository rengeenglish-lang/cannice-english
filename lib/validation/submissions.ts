import { z } from "zod";

export const submitPracticeExamSchema = z.object({
  title: z.string().trim().min(3).max(160),
  studentAnswer: z.string().trim().min(20).max(10000),
});

export const reviewSubmissionSchema = z.object({
  teacherFeedback: z.string().trim().min(5).max(5000),
  score: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
});
