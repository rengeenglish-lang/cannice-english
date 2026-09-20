import type { ExamCode } from "@/lib/generated/prisma/enums";
import { ExamFamily } from "@/lib/generated/prisma/enums";

const FAMILY_BY_EXAM_CODE: Record<ExamCode, ExamFamily> = {
  IELTS: ExamFamily.ACADEMIC_SKILLS,
  TOEFL: ExamFamily.ACADEMIC_SKILLS,
  PTE: ExamFamily.ACADEMIC_SKILLS,
  YDS: ExamFamily.TRANSLATION_GRAMMAR,
  YOKDIL_SOSYAL: ExamFamily.TRANSLATION_GRAMMAR,
  YOKDIL_SAGLIK: ExamFamily.TRANSLATION_GRAMMAR,
  YOKDIL_FEN: ExamFamily.TRANSLATION_GRAMMAR,
};

export function examFamilyForCode(code: ExamCode): ExamFamily {
  return FAMILY_BY_EXAM_CODE[code];
}

/** Exams with a live, seeded diagnostic in the current build. Others show a "yakında" bridge state. */
export const DIAGNOSTIC_LIVE_EXAM_CODES: ExamCode[] = ["YDS", "YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN"];

export function hasLiveDiagnostic(code: ExamCode): boolean {
  return DIAGNOSTIC_LIVE_EXAM_CODES.includes(code);
}
