import type { ExamCode } from "@/lib/generated/prisma/enums";

type AttemptConfig = {
  /** How many active questions to pull per topic when building a full diagnostic. */
  questionsPerTopic: number;
  /** How many questions to pull for a single-topic mastery check. */
  masteryCheckQuestions: number;
  /** Fraction of questionsAnswered/masteryCheckQuestions needed to pass a mastery check. */
  masteryPassThreshold: number;
};

const DEFAULT_CONFIG: AttemptConfig = {
  questionsPerTopic: 3,
  masteryCheckQuestions: 6,
  masteryPassThreshold: 0.7,
};

const CONFIG_BY_EXAM_CODE: Partial<Record<ExamCode, AttemptConfig>> = {
  YDS: DEFAULT_CONFIG,
};

export function attemptConfigForExam(code: ExamCode): AttemptConfig {
  return CONFIG_BY_EXAM_CODE[code] ?? DEFAULT_CONFIG;
}

/** Minimum answered questions on a topic before severity can be judged CRITICAL (vs capped at DEVELOPING). */
export const MIN_EVIDENCE_FOR_CRITICAL = 2;
