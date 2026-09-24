/**
 * Builds the test that follows a flashcard set. Pure (no server imports) so it can be unit
 * tested: every word gets one question, rotating through three kinds —
 *   MEANING  English word → pick the Turkish meaning
 *   WORD     Turkish meaning → pick the English word
 *   BLANK    the card's own example sentence with the word blanked out
 * Wrong options come from the same set first, then from the rest of the level.
 */
export type QuizWord = { id: string; word: string; pos: string; tr: string; exampleEn: string; exampleTr: string };
export type QuizKind = "MEANING" | "WORD" | "BLANK";
export type QuizQuestion = { wordId: string; kind: QuizKind; prompt: string; hint: string | null; options: string[]; answer: number };

type Rand = () => number;

function shuffle<T>(items: T[], rand: Rand): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The example with the word replaced by a blank, or null if the word doesn't appear as-is. */
export function blankOut(example: string, word: string): string | null {
  const core = word.replace(/\s*\(.*?\)\s*/g, "").trim();
  if (!core) return null;
  const re = new RegExp(`\\b${escape(core)}\\b`, "i");
  return re.test(example) ? example.replace(re, "_____") : null;
}

function pickDistractors(correct: string, pool: string[], rand: Rand, n = 3) {
  const seen = new Set([correct.toLowerCase()]);
  const out: string[] = [];
  for (const option of shuffle(pool, rand)) {
    const key = option.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(option);
    if (out.length === n) break;
  }
  return out;
}

export function buildQuiz(setWords: QuizWord[], levelWords: QuizWord[], rand: Rand = Math.random): QuizQuestion[] {
  const order = shuffle(setWords, rand);
  const others = (w: QuizWord) => {
    const inSet = setWords.filter((x) => x.id !== w.id);
    const rest = levelWords.filter((x) => x.id !== w.id && !setWords.some((s) => s.id === x.id));
    return { inSet, rest };
  };
  return order.map((w, i) => {
    const { inSet, rest } = others(w);
    let kind: QuizKind = (["MEANING", "WORD", "BLANK"] as const)[i % 3];
    const blanked = kind === "BLANK" ? blankOut(w.exampleEn, w.word) : null;
    if (kind === "BLANK" && !blanked) kind = "MEANING";

    let prompt: string;
    let hint: string | null = null;
    let correct: string;
    let pool: string[];
    if (kind === "MEANING") {
      prompt = w.word;
      correct = w.tr;
      pool = [...inSet.map((x) => x.tr), ...rest.map((x) => x.tr)];
    } else if (kind === "WORD") {
      prompt = w.tr;
      correct = w.word;
      pool = [...inSet.map((x) => x.word), ...rest.map((x) => x.word)];
    } else {
      prompt = blanked!;
      hint = w.exampleTr;
      correct = w.word;
      // Same part of speech first, so the blank can't be solved by grammar alone.
      const samePos = [...inSet, ...rest].filter((x) => x.pos === w.pos).map((x) => x.word);
      pool = [...samePos, ...inSet.map((x) => x.word)];
    }
    // Prefer options from the set; fall back to the level for small sets.
    const fromSet = pickDistractors(correct, pool.slice(0, kind === "BLANK" ? pool.length : inSet.length), rand);
    const distractors = fromSet.length === 3 ? fromSet : [...fromSet, ...pickDistractors(correct, pool, rand, 3 - fromSet.length).filter((d) => !fromSet.includes(d))].slice(0, 3);
    const options = shuffle([correct, ...distractors], rand);
    return { wordId: w.id, kind, prompt, hint, options, answer: options.indexOf(correct) };
  });
}

/** Share of correct answers counted as passing a set. */
export const PASS_RATIO = 0.7;
