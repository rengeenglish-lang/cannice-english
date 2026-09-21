/**
 * Packs a run of questions into two side-by-side "A4 page" columns, mimicking a real printed
 * YDS/YÖKDİL exam booklet: short items (vocab, grammar, cloze, translation) pack up to 4 to a
 * column, but a question carrying a long reading passage gets a column mostly or entirely to
 * itself — matching how a real booklet gives a passage its own space rather than cramming it
 * next to unrelated short items.
 */

const SLOTS_PER_COLUMN = 4;
const LONG_PASSAGE_THRESHOLD = 200;

function isLongPassage(q: { passageText: string | null }): boolean {
  return Boolean(q.passageText && q.passageText.length > LONG_PASSAGE_THRESHOLD);
}

function fillColumn<T extends { passageText: string | null }>(pool: T[]): T[] {
  const col: T[] = [];
  let i = 0;
  while (i < pool.length && col.length < SLOTS_PER_COLUMN) {
    const q = pool[i];
    if (isLongPassage(q)) {
      if (col.length === 0) {
        // Group this passage with any immediately-following questions sharing the exact same
        // passage, so the reading text is shown once with all of its questions beneath it.
        col.push(q);
        i++;
        while (i < pool.length && pool[i].passageText === q.passageText && col.length < SLOTS_PER_COLUMN) {
          col.push(pool[i]);
          i++;
        }
      }
      break;
    }
    col.push(q);
    i++;
  }
  return col;
}

export function packBookletPage<T extends { passageText: string | null }>(pool: T[]): { left: T[]; right: T[] } {
  const left = fillColumn(pool);
  const right = fillColumn(pool.slice(left.length));
  return { left, right };
}

/** Groups consecutive same-passage questions within a rendered column so the passage text isn't repeated. */
export function groupByPassage<T extends { passageText: string | null }>(column: T[]): { passageText: string | null; items: T[] }[] {
  const groups: { passageText: string | null; items: T[] }[] = [];
  for (const q of column) {
    const last = groups[groups.length - 1];
    if (last && q.passageText && last.passageText === q.passageText) {
      last.items.push(q);
    } else {
      groups.push({ passageText: q.passageText, items: [q] });
    }
  }
  return groups;
}
