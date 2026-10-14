/**
 * What the browser gets during an online deneme: stems and options only. Answer keys and
 * explanations stay on the server until the attempt is finalized.
 */

export type SectionKey = "vocab" | "grammar" | "cloze" | "completion" | "enTr" | "trEn" | "reading" | "dialogue" | "restatement" | "paragraph" | "irrelevant";

export type PaperQuestion = {
  n: number;
  section: SectionKey;
  stem: string;
  options: string[];
  /** Cloze / reading questions: index into paper.passages. */
  passage?: number;
  /** Anlam bütünlüğü: the five numbered sentences (stem is empty, options are I–V). */
  sentences?: string[];
};

export type PaperPassage = {
  kind: "cloze" | "reading";
  /** Cloze gaps are written as "(17) ----". */
  text: string;
  /** Question numbers that belong to this passage. */
  from: number;
  to: number;
};

export type PaperSection = { key: SectionKey; from: number; to: number; title: string; instruction: string };

/** One booklet page: question numbers shown on it, in order. */
export type BookletPage = { from: number; to: number };

export type Paper = {
  no: number;
  questions: PaperQuestion[];
  passages: PaperPassage[];
  sections: PaperSection[];
  pages: BookletPage[];
};

/** A saved answer: choice 0–4 (A–E) or null, plus the "sonra bak" flag. */
export type SavedAnswer = { choice: number | null; flagged: boolean };

export const DENEME_MINUTES = 180;
export const DENEME_QUESTIONS = 80;
/** Every correct answer is worth 1.25 points; wrong answers do not cost anything (real YDS rule). */
export const POINTS_PER_CORRECT = 1.25;
export const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;
