import type { BookletPage, PaperPassage, PaperQuestion } from "./types";

/** Roughly what fits on one two-column booklet page on a laptop screen, in characters. */
const PAGE_BUDGET = 3400;
const QUESTION_OVERHEAD = 140;

/**
 * Splits the 80 questions into booklet pages. A cloze or reading passage always stays on the same
 * page as all of its questions, like a real ÖSYM booklet; other questions fill pages in order.
 */
export function packBooklet(questions: PaperQuestion[], passages: PaperPassage[]): BookletPage[] {
  type Unit = { from: number; to: number; weight: number };
  const units: Unit[] = [];
  const weightOf = (q: PaperQuestion) =>
    QUESTION_OVERHEAD + q.stem.length + q.options.reduce((s, o) => s + o.length + 12, 0) + (q.sentences?.reduce((s, x) => s + x.length, 0) ?? 0);

  for (let i = 0; i < questions.length; ) {
    const q = questions[i];
    if (q.passage !== undefined) {
      const p = passages[q.passage];
      const group = questions.filter((x) => x.n >= p.from && x.n <= p.to);
      units.push({ from: p.from, to: p.to, weight: p.text.length + group.reduce((s, x) => s + weightOf(x), 0) });
      i += group.length;
    } else {
      units.push({ from: q.n, to: q.n, weight: weightOf(q) });
      i++;
    }
  }

  const pages: (BookletPage & { weight: number })[] = [];
  for (const u of units) {
    const last = pages[pages.length - 1];
    if (last && last.weight + u.weight <= PAGE_BUDGET) {
      last.to = u.to;
      last.weight += u.weight;
    } else {
      pages.push({ ...u });
    }
  }
  // A last page with only a question or two is folded into the one before it.
  const tail = pages[pages.length - 1];
  if (pages.length > 1 && tail.weight < PAGE_BUDGET * 0.35) {
    pages[pages.length - 2].to = tail.to;
    pages.pop();
  }
  return pages.map(({ from, to }) => ({ from, to }));
}
