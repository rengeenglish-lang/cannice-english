import type { Deneme, Q } from "./types";
import { SECTIONS } from "./types";
import { DENEME_01 } from "./deneme-01";
import { DENEME_02 } from "./deneme-02";
import { DENEME_03 } from "./deneme-03";
import { DENEME_04 } from "./deneme-04";
import { DENEME_05 } from "./deneme-05";
import { DENEME_06 } from "./deneme-06";
import { DENEME_07 } from "./deneme-07";
import { DENEME_08 } from "./deneme-08";
import { DENEME_09 } from "./deneme-09";
import { DENEME_10 } from "./deneme-10";

/** Set 1 = Deneme 1–5, Set 2 = Deneme 6–10. */
export const DENEMELER: Deneme[] = [DENEME_01, DENEME_02, DENEME_03, DENEME_04, DENEME_05, DENEME_06, DENEME_07, DENEME_08, DENEME_09, DENEME_10];

export const SETS = [
  { slug: "yds-denemeleri-set-1", set: 1, denemeler: DENEMELER.slice(0, 5) },
  { slug: "yds-denemeleri-set-2", set: 2, denemeler: DENEMELER.slice(5, 10) },
] as const;

export const LETTERS = ["A", "B", "C", "D", "E"] as const;
export const ROMAN = ["I", "II", "III", "IV", "V"] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

/** A printed question: number, options in their final order, and the correct letter index. */
export type Printed = {
  n: number;
  section: SectionKey;
  stem: string;
  options: string[];
  answer: number;
  why: string;
  /** Cloze/reading questions point at their passage (index within the section). */
  passage?: number;
  /** Anlam bütünlüğü: the five sentences (stem is empty). */
  sentences?: string[];
};

/** Deterministic LCG so every build prints the same order. */
function rng(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}

/**
 * Which letter is correct for each of the 75 shuffled questions: together with the five fixed
 * anlam bütünlüğü answers every letter is correct exactly 16 times, and never 3 times in a row.
 */
function answerPlan(no: number, fixed: number[]) {
  const need = [16, 16, 16, 16, 16];
  for (const f of fixed) need[f]--;
  const pool = need.flatMap((c, l) => Array<number>(c).fill(l));
  const r = rng(no * 7919 + 13);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (let i = 2; i < pool.length; i++) {
    if (pool[i] === pool[i - 1] && pool[i] === pool[i - 2]) {
      const k = pool.findIndex((v, j) => j > i && v !== pool[i]);
      if (k > 0) [pool[i], pool[k]] = [pool[k], pool[i]];
    }
  }
  return pool;
}

/** Place the correct option (written first) at `target`, keeping the distractors' written order. */
function place(q: Q, target: number) {
  const [correct, ...rest] = q[1];
  const options = [...rest];
  options.splice(target, 0, correct);
  return options;
}

/** All 80 questions of a test in exam order with final option order. */
export function printed(d: Deneme): Printed[] {
  const plan = answerPlan(d.no, d.irrelevant.map((x) => x.odd));
  let k = 0;
  const out: Printed[] = [];
  const push = (section: SectionKey, q: Q, passage?: number) => {
    const target = plan[k++];
    out.push({ n: out.length + 1, section, stem: q[0], options: place(q, target), answer: target, why: q[2], passage });
  };
  d.vocab.forEach((q) => push("vocab", q));
  d.grammar.forEach((q) => push("grammar", q));
  d.cloze.forEach((c, i) => c.blanks.forEach((q) => push("cloze", q, i)));
  d.completion.forEach((q) => push("completion", q));
  d.enTr.forEach((q) => push("enTr", q));
  d.trEn.forEach((q) => push("trEn", q));
  d.reading.forEach((r, i) => r.questions.forEach((q) => push("reading", q, i)));
  d.dialogue.forEach((q) => push("dialogue", q));
  d.restatement.forEach((q) => push("restatement", q));
  d.paragraph.forEach((q) => push("paragraph", q));
  d.irrelevant.forEach((x) => out.push({ n: out.length + 1, section: "irrelevant", stem: "", options: [...ROMAN], answer: x.odd, why: x.why, sentences: x.sentences }));
  return out;
}
