"use client";
import { useRef, useState, type ReactNode } from "react";
import { CalendarSearch, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { coachingCopy } from "@/lib/coaching/i18n";
import { findPageForDay } from "@/lib/coaching/book";

export type FlipPage = { day: string; part: number; count: number; content: ReactNode };

export function formatBookDay(day: string, locale: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", { ...opts, timeZone: "UTC" });
}

const isField = (el: EventTarget) => el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

/**
 * A day-by-day book: one page per day (busy days continue over pages), opened at the newest page.
 * Pages turn with the buttons, the arrow keys or a swipe; a date field and a contents list jump to a day.
 * `variant` picks the look: a bound "book" or a ruled spiral "notebook".
 */
export function FlipBook({ locale, title, titleId, variant, unit, pages }: {
  locale: string;
  title: ReactNode;
  titleId: string;
  variant: "book" | "notebook";
  unit: "words" | "entries";
  pages: FlipPage[];
}) {
  const t = coachingCopy(locale).book;
  const [index, setIndex] = useState(() => Math.max(pages.length - 1, 0));
  const [turn, setTurn] = useState<{ dir: "next" | "prev"; from: number; id: number } | null>(null);
  const [searched, setSearched] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);
  const turns = useRef(0);

  if (!pages.length) return null;
  // A deleted entry can remove the page being read.
  const current = Math.min(index, pages.length - 1);
  const page = pages[current];
  const countLabel = (n: number) => (unit === "words" ? t.words(n) : t.entries(n));
  const days = new Map<string, number>();
  for (const p of pages) days.set(p.day, (days.get(p.day) ?? 0) + p.count);

  const renderPage = (i: number, extra: string, key: number) => {
    const p = pages[i];
    return (
      <article key={key} className={`flip-page ${variant === "book" ? "flip-bound" : "flip-notebook"} ${extra}`} aria-live={extra.includes("leaf") ? undefined : "polite"} onAnimationEnd={extra ? () => setTurn(null) : undefined}>
        <header className="flip-page-head flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-extrabold capitalize">
            {formatBookDay(p.day, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {p.part > 1 ? <span className="ml-1 text-sm font-semibold normal-case text-[color:var(--muted)]">{t.continued}</span> : null}
          </h3>
          <span className="shrink-0 text-xs font-bold text-[color:var(--muted)]">{countLabel(p.count)}</span>
        </header>
        {p.content}
        <footer className="mt-4 text-center text-xs font-bold text-[color:var(--muted)]">{t.page(i + 1, pages.length)}</footer>
      </article>
    );
  };

  const go = (to: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, to));
    setNotice(null);
    if (next === current) return;
    setTurn({ dir: next > current ? "next" : "prev", from: current, id: ++turns.current });
    setIndex(next);
  };
  const search = (day: string) => {
    setSearched(day);
    const hit = findPageForDay(pages, day);
    if (!hit) return;
    go(hit.index);
    if (!hit.exact) setNotice(t.nothingThatDay(formatBookDay(pages[hit.index].day, locale, { day: "numeric", month: "long", year: "numeric" })));
  };

  return (
    <section className="dashboard-panel" aria-labelledby={titleId}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id={titleId} className="section-title flex items-center gap-2 !text-lg">{title}</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold text-[color:var(--muted)]">
            <span className="flex items-center gap-1"><CalendarSearch size={14} aria-hidden="true" /> {t.search}</span>
            <input type="date" className="auth-input mt-1 !py-1.5" value={searched} min={pages[0].day} max={pages[pages.length - 1].day} onChange={(e) => search(e.target.value)} />
          </label>
          <label className="text-xs font-bold text-[color:var(--muted)]">
            {t.contents}
            <select className="auth-input mt-1 !py-1.5" value={page.day} onChange={(e) => search(e.target.value)}>
              {[...days].map(([d, n]) => (
                <option key={d} value={d}>{formatBookDay(d, locale, { day: "numeric", month: "short", year: "numeric" })} · {countLabel(n)}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {notice ? <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{notice}</p> : null}

      <div
        className="flip-book mt-5"
        tabIndex={0}
        aria-roledescription={variant === "book" ? t.deckRole : t.notebookRole}
        aria-label={t.page(current + 1, pages.length)}
        onKeyDown={(e) => {
          if (isField(e.target)) return;
          if (e.key === "ArrowRight") go(current + 1);
          if (e.key === "ArrowLeft") go(current - 1);
        }}
        onTouchStart={(e) => { touchX.current = isField(e.target) ? null : e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 60) go(dx < 0 ? current + 1 : current - 1);
        }}
      >
        {/* Forward: the current page lifts at its right edge and turns over to the left, showing the
            next page underneath. Back: the previous page turns back from the left onto the stack. */}
        <div className="flip-stage">
          {renderPage(current, turn?.dir === "prev" ? `flip-leaf flip-leaf-in` : "", turn?.dir === "prev" ? turn.id : current)}
          {turn?.dir === "next" && turn.from < pages.length ? (
            <div className="flip-leaf flip-leaf-out" key={turn.id} aria-hidden="true" inert onAnimationEnd={() => setTurn(null)}>
              {renderPage(turn.from, "", turn.id)}
            </div>
          ) : null}
        </div>
      </div>

      <nav className="mt-4 flex items-center justify-center gap-2" aria-label={t.contents}>
        <button type="button" className="secondary-button !px-3" disabled={current === 0} onClick={() => go(0)} aria-label={t.first}><ChevronsLeft size={16} aria-hidden="true" /></button>
        <button type="button" className="secondary-button" disabled={current === 0} onClick={() => go(current - 1)}><ChevronLeft size={16} aria-hidden="true" /> <span className="hidden sm:inline">{t.prev}</span></button>
        <button type="button" className="secondary-button" disabled={current === pages.length - 1} onClick={() => go(current + 1)}><span className="hidden sm:inline">{t.next}</span> <ChevronRight size={16} aria-hidden="true" /></button>
        <button type="button" className="secondary-button !px-3" disabled={current === pages.length - 1} onClick={() => go(pages.length - 1)} aria-label={t.last}><ChevronsRight size={16} aria-hidden="true" /></button>
      </nav>
    </section>
  );
}
