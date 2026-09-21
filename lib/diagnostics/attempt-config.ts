import type { ExamCode } from "@/lib/generated/prisma/enums";

type AttemptConfig = {
  /** How many active questions to pull per topic when building a full diagnostic. */
  questionsPerTopic: number;
  /** How many questions to pull for a single-topic mastery check. */
  masteryCheckQuestions: number;
  /** Fraction of questionsAnswered/masteryCheckQuestions needed to pass a mastery check. */
  masteryPassThreshold: number;
  /** How many questions in a free-practice set (single topic or "karma" mixed). */
  practiceSetSize: number;
  /** Full mock exam length and time limit — matches the real YDS/YÖKDİL paper (80 questions, 180 minutes). */
  mockExamQuestionCount: number;
  mockExamTimeLimitMinutes: number;
};

const DEFAULT_CONFIG: AttemptConfig = {
  questionsPerTopic: 3,
  masteryCheckQuestions: 6,
  masteryPassThreshold: 0.7,
  practiceSetSize: 10,
  mockExamQuestionCount: 80,
  mockExamTimeLimitMinutes: 180,
};

/**
 * ACADEMIC_SKILLS starter content covers Reading only (no Listening audio pipeline, no
 * Writing/Speaking grading UI — Speaking already has its own AI Speaking Tutor). So unlike YDS/
 * YÖKDİL's mock exam, which matches the real *whole paper*, these three match each exam's real
 * *Reading section* only — mockExamQuestionCount is deliberately not the full 40-question bank,
 * to leave some shuffle variety across repeated attempts.
 */
const IELTS_CONFIG: AttemptConfig = {
  questionsPerTopic: 3,
  masteryCheckQuestions: 6,
  masteryPassThreshold: 0.7,
  practiceSetSize: 10,
  mockExamQuestionCount: 30, // real IELTS Academic Reading: 40 questions / 60 minutes
  mockExamTimeLimitMinutes: 60,
};

const TOEFL_CONFIG: AttemptConfig = {
  questionsPerTopic: 3,
  masteryCheckQuestions: 6,
  masteryPassThreshold: 0.7,
  practiceSetSize: 10,
  mockExamQuestionCount: 20, // real TOEFL iBT Reading (current shortened format): ~20 questions / ~35 minutes
  mockExamTimeLimitMinutes: 35,
};

const PTE_CONFIG: AttemptConfig = {
  questionsPerTopic: 3,
  masteryCheckQuestions: 6,
  masteryPassThreshold: 0.7,
  practiceSetSize: 10,
  mockExamQuestionCount: 15, // real PTE Academic Reading: ~15-18 discrete reading items / ~30 minutes
  mockExamTimeLimitMinutes: 30,
};

const CONFIG_BY_EXAM_CODE: Partial<Record<ExamCode, AttemptConfig>> = {
  YDS: DEFAULT_CONFIG,
  IELTS: IELTS_CONFIG,
  TOEFL: TOEFL_CONFIG,
  PTE: PTE_CONFIG,
};

export function attemptConfigForExam(code: ExamCode): AttemptConfig {
  return CONFIG_BY_EXAM_CODE[code] ?? DEFAULT_CONFIG;
}

/** Minimum answered questions on a topic before severity can be judged CRITICAL (vs capped at DEVELOPING). */
export const MIN_EVIDENCE_FOR_CRITICAL = 2;
