import type { SectionKey } from "./types";
import { POINTS_PER_CORRECT } from "./types";

export type GradeInput = { n: number; section: SectionKey; answer: number }[];

export type SectionResult = { key: SectionKey; correct: number; wrong: number; blank: number; total: number };

export type Grade = { correct: number; wrong: number; blank: number; score: number; sections: SectionResult[] };

/** YDS rules: 1.25 points per correct answer, wrong and blank answers score nothing. */
export function gradeDeneme(questions: GradeInput, choices: Map<number, number | null>): Grade {
  const sections = new Map<SectionKey, SectionResult>();
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  for (const q of questions) {
    const s = sections.get(q.section) ?? { key: q.section, correct: 0, wrong: 0, blank: 0, total: 0 };
    s.total++;
    const choice = choices.get(q.n);
    if (choice === undefined || choice === null) {
      blank++;
      s.blank++;
    } else if (choice === q.answer) {
      correct++;
      s.correct++;
    } else {
      wrong++;
      s.wrong++;
    }
    sections.set(q.section, s);
  }
  return { correct, wrong, blank, score: correct * POINTS_PER_CORRECT, sections: [...sections.values()] };
}
