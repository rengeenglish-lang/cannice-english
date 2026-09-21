/** A "run" is a stretch of consecutive same-passage questions in questionOrder — one screen's worth in a split-screen reading view. */
export type PassageRun = { start: number; end: number; passageText: string | null };

export function buildPassageRuns<T extends { passageText: string | null }>(ordered: T[]): PassageRun[] {
  const runs: PassageRun[] = [];
  let i = 0;
  while (i < ordered.length) {
    const start = i;
    const passageText = ordered[i].passageText;
    let j = i + 1;
    while (passageText !== null && j < ordered.length && ordered[j].passageText === passageText) j++;
    runs.push({ start, end: j - 1, passageText });
    i = j;
  }
  return runs;
}

export function locateRun(runs: PassageRun[], index: number): { run: PassageRun; runIndex: number } | null {
  const runIndex = runs.findIndex((r) => index >= r.start && index <= r.end);
  if (runIndex === -1) return null;
  return { run: runs[runIndex], runIndex };
}
