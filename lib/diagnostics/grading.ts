import { DiagnosticQuestionType } from "@/lib/generated/prisma/enums";

/** Question types with no automatic grading — captured as free text, graded manually later. */
export const MANUAL_GRADING_TYPES: DiagnosticQuestionType[] = [
  DiagnosticQuestionType.WRITING_TASK,
  DiagnosticQuestionType.SPEAKING_TASK,
];

export function isAutoGraded(questionType: DiagnosticQuestionType): boolean {
  return !MANUAL_GRADING_TYPES.includes(questionType);
}

/**
 * Every auto-graded question type in this build is presented as a 4-option MCQ
 * (including translation/cloze/restatement — real YDS/YÖKDİL present these as MCQ too,
 * which is what makes instant grading and root-cause tagging possible).
 * `answerRaw` and `question.correctAnswer` both hold the selected option's index as a string.
 */
export function gradeAutoAnswer(correctAnswer: string | null, answerRaw: string | null): boolean | null {
  if (correctAnswer === null || answerRaw === null) return null;
  return answerRaw.trim() === correctAnswer.trim();
}
