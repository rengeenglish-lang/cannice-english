/**
 * Display order for multiple-choice options.
 *
 * Seeded questions were authored with the correct option almost always first, so showing them in
 * stored order would let a student pass by always picking A. Instead every screen shows a question's
 * options in a fixed, question-specific order derived from its id. Only the display changes:
 * answers are still submitted, stored and graded as the original option index, so past attempts and
 * `correctAnswer` stay valid, and the exam, the review and "Hatalarım" always agree on the letters.
 */

export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

function hash(seed: string): number {
  // FNV-1a, 32-bit.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  // mulberry32
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `order[displayPosition] = originalIndex`. */
export function optionOrder(questionId: string, count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  const next = rng(hash(`options:${questionId}`));
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Options in display order, each with the original index to submit. */
export function displayOptions(questionId: string, options: string[]): { option: string; index: number; letter: string }[] {
  return optionOrder(questionId, options.length).map((index, position) => ({
    option: options[index],
    index,
    letter: OPTION_LETTERS[position] ?? String(position + 1),
  }));
}

/** The letter a student sees for the option stored at `originalIndex`. */
export function displayLetter(questionId: string, count: number, originalIndex: number): string {
  const position = optionOrder(questionId, count).indexOf(originalIndex);
  return position < 0 ? String(originalIndex + 1) : (OPTION_LETTERS[position] ?? String(position + 1));
}

const BACK_VOWELS = /[aıou]/;

/** Turkish suffixes after a letter follow its name's vowel: A ("a") takes back vowels, B–E ("be", "ce", "de", "e") front ones. */
function harmonise(suffix: string, letter: string): string {
  const back = letter === "A";
  const first = suffix.match(/[aeıioöuü]/);
  if (!first || BACK_VOWELS.test(first[0]) === back) return suffix;
  const swap: Record<string, string> = back ? { e: "a", i: "ı", ü: "u", ö: "o" } : { a: "e", ı: "i", u: "ü", o: "ö" };
  return suffix.replace(/[aeıioöuü]/g, (v) => swap[v] ?? v);
}

/**
 * Rewrites option letters in an authored explanation ("tek seçenek A'dır. B yanlış zaman…") so they
 * match the displayed order. Every standalone A–E in the seeded explanations is an option letter.
 */
export function relabelExplanation(questionId: string, count: number, text: string): string {
  if (count < 2) return text;
  const order = optionOrder(questionId, count);
  const positionOf = new Map(order.map((original, position) => [original, position]));
  const maxLetter = OPTION_LETTERS[count - 1];
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}'’-])([A-${maxLetter}])(?![\\p{L}\\p{N}-])(['’]([a-zçğıöşü]+))?`, "gu");
  return text.replace(pattern, (_match, letter: string, apostrophe: string | undefined, suffix: string | undefined) => {
    const position = positionOf.get(OPTION_LETTERS.indexOf(letter as (typeof OPTION_LETTERS)[number]));
    const shown = position === undefined ? letter : OPTION_LETTERS[position];
    if (!apostrophe || !suffix) return shown;
    return `${shown}${apostrophe[0]}${harmonise(suffix, shown)}`;
  });
}
