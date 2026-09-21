import "server-only";
import { cookies } from "next/headers";

export type ExamViewMode = "single" | "booklet";

const COOKIE_NAME = "examViewMode";

/** Per-student display preference for TRANSLATION_GRAMMAR attempts — one question per screen, or a booklet-style page. */
export async function getExamViewMode(): Promise<ExamViewMode> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === "booklet" ? "booklet" : "single";
}
