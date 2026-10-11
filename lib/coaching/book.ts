/** Shared paging for the day-by-day books: Kelime destem and the hata defteri. */

/** A book page: the items of one day. A busy day continues over several pages. */
export type DayPage<T> = { day: string; items: T[]; part: number; parts: number };

/** Pages in reading order: oldest day first; items keep their given order within a day. */
export function paginateByDay<T>(items: T[], dayOf: (item: T) => string, perPage: number): DayPage<T>[] {
  const byDay = new Map<string, T[]>();
  for (const item of items) {
    const day = dayOf(item);
    const list = byDay.get(day);
    if (list) list.push(item);
    else byDay.set(day, [item]);
  }
  const pages: DayPage<T>[] = [];
  for (const day of [...byDay.keys()].sort()) {
    const list = byDay.get(day)!;
    const parts = Math.ceil(list.length / perPage);
    for (let p = 0; p < parts; p++) pages.push({ day, items: list.slice(p * perPage, (p + 1) * perPage), part: p + 1, parts });
  }
  return pages;
}

/**
 * The page to open for a searched date: that day's first page, or, when the day has no page,
 * the closest day (an earlier one wins a tie). `exact` says which case it was.
 */
export function findPageForDay(pages: { day: string; part: number }[], day: string): { index: number; exact: boolean } | null {
  if (!pages.length || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const exact = pages.findIndex((p) => p.day === day);
  if (exact >= 0) return { index: exact, exact: true };
  const target = Date.parse(`${day}T00:00:00Z`);
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  pages.forEach((p, i) => {
    if (p.part !== 1) return;
    const dist = Math.abs(Date.parse(`${p.day}T00:00:00Z`) - target);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  });
  return { index: best, exact: false };
}
