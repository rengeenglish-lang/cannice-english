"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CalendarDays, ClipboardCheck, CreditCard, LayoutGrid, Layers, RotateCcw, Search, UserRound, Wrench, X, type LucideIcon } from "lucide-react";
import type { FaqCategory } from "@/content/help-faq";

const ICONS: Record<string, LucideIcon> = {
  hesap: UserRound,
  planlar: Layers,
  odemeler: CreditCard,
  iadeler: RotateCcw,
  "canli-dersler": CalendarDays,
  "seviye-tespit": ClipboardCheck,
  teknik: Wrench,
};

const fold = (s: string) =>
  s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

const HASH_EVENT = "help-hash";
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(HASH_EVENT, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(HASH_EVENT, onChange);
  };
}
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * Yardım Masası as a gallery: one card per FAQ section (icon, question count, first questions).
 * A card zooms up into a centred panel holding that section's questions; the search box looks
 * through every question and answer. Without
 * JavaScript, or before it loads, every section is listed in full (the server-rendered fallback),
 * so nothing is hidden from search engines either.
 */
export function HelpGallery({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = useState("");
  // The open section lives in the URL hash (#iadeler), so links to a section work. The server
  // snapshot is null: before hydration every section renders in full.
  const hash = useSyncExternalStore(subscribeHash, readHash, () => null);
  const ready = hash !== null;
  const selected = hash && categories.some((c) => c.key === hash) ? hash : null;

  // The card the panel grows out of (and shrinks back into); none for a #link opened directly.
  const originRef = useRef<HTMLElement | null>(null);
  const open = (key: string | null, from?: HTMLElement) => {
    setQuery("");
    if (from) originRef.current = from;
    history.replaceState(null, "", key ? `#${key}` : window.location.pathname + window.location.search);
    window.dispatchEvent(new Event(HASH_EVENT));
  };

  const q = fold(query.trim());
  const results = useMemo(
    () =>
      q.length < 2
        ? []
        : categories.flatMap((c) => c.items.filter((i) => fold(`${i.q} ${i.a}`).includes(q)).map((i) => ({ ...i, category: c }))),
    [q, categories],
  );

  const current = categories.find((c) => c.key === selected) ?? null;
  const shown = !ready ? categories : [];

  return (
    <div className="mt-10">
      <label className="relative block">
        <span className="sr-only">Sorularda ara</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sorunu yaz: şifre, iade, fatura, canlı ders…"
          className="auth-input !pl-11"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Aramayı temizle" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[color:var(--muted)] hover:bg-slate-100">
            <X size={16} />
          </button>
        ) : null}
      </label>

      {q.length >= 2 ? (
        <section aria-live="polite" className="mt-6">
          <h2 className="section-title !text-lg">{results.length ? `${results.length} sonuç` : "Sonuç bulunamadı"}</h2>
          {results.length ? (
            <div className="mt-4 space-y-3">
              {results.map((item) => (
                <QuestionCard key={`${item.category.key}-${item.q}`} q={item.q} a={item.a} tag={item.category.title} />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--muted)]">Başka bir kelimeyle dene ya da yukarıdan canlı destekle bize yaz.</p>
          )}
        </section>
      ) : (
        <>
          <ul aria-label="SSS kategorileri" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = ICONS[category.key] ?? LayoutGrid;
              const active = category.key === selected;
              return (
                <li key={category.key} className="min-w-0">
                  <a
                    href={`#${category.key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      open(category.key, e.currentTarget);
                    }}
                    aria-current={active ? "true" : undefined}
                    className={`panel flex h-full min-w-0 flex-col gap-3 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)] ${active ? "!border-2 !border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : ""}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{category.items.length} soru</span>
                    </span>
                    <span className="text-lg font-extrabold text-[color:var(--foreground)]">{category.title}</span>
                    <span className="min-w-0 space-y-1 text-sm text-[color:var(--muted)]">
                      {category.items.slice(0, 2).map((item) => (
                        <span key={item.q} className="block truncate">· {item.q}</span>
                      ))}
                    </span>
                    <span className="mt-auto text-sm font-bold text-[color:var(--accent)]">Soruları gör →</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Before JavaScript loads: every section in full, so the answers are in the HTML. */}
          {shown.length ? (
            <div className="mt-10 space-y-10">
              {shown.map((category) => (
                <section key={category.key} id={category.key} aria-labelledby={`${category.key}-title`}>
                  <h2 id={`${category.key}-title`} className="section-title !text-xl">{category.title}</h2>
                  <div className="mt-4 space-y-3">
                    {category.items.map((item) => (
                      <QuestionCard key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}
          {current ? <CategoryPanel key={current.key} category={current} origin={originRef} onClose={() => open(null)} /> : null}
        </>
      )}
    </div>
  );
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Transform that lays the panel exactly over the card it came from (FLIP "first" frame). */
function fromCard(card: DOMRect, panel: DOMRect) {
  const dx = card.left + card.width / 2 - (panel.left + panel.width / 2);
  const dy = card.top + card.height / 2 - (panel.top + panel.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${card.width / panel.width}, ${card.height / panel.height})`;
}

/**
 * One section's questions in a centred panel that zooms out of its card and back into it on
 * close (Esc, the X, or a click on the dimmed page). Focus moves into the panel and returns to
 * the card; the page behind doesn't scroll while it is open.
 */
function CategoryPanel({ category, origin, onClose }: { category: FaqCategory; origin: React.RefObject<HTMLElement | null>; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const Icon = ICONS[category.key] ?? LayoutGrid;

  useLayoutEffect(() => {
    const panel = panelRef.current!;
    // Measure the panel at rest: a zoom already running (React re-runs effects in development)
    // would make the card and the panel look the same size.
    panel.getAnimations().forEach((a) => a.cancel());
    const card = origin.current;
    const still = reducedMotion();
    const first = card && !still ? fromCard(card.getBoundingClientRect(), panel.getBoundingClientRect()) : "scale(0.96)";
    panel.animate([{ transform: first, opacity: card && !still ? 0.6 : 0 }, { transform: "none", opacity: 1 }], { duration: still ? 120 : 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    closeRef.current?.focus({ preventScroll: true });
  }, [origin]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    const card = origin.current;
    const still = reducedMotion();
    if (!panel) return onClose();
    const last = card && !still ? fromCard(card.getBoundingClientRect(), panel.getBoundingClientRect()) : "scale(0.96)";
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
    const anim = panel.animate([{ transform: "none", opacity: 1 }, { transform: last, opacity: card && !still ? 0.4 : 0 }], { duration: still ? 100 : 260, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" });
    anim.onfinish = () => {
      onClose();
      card?.focus({ preventScroll: true });
    };
  };

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Keep Tab inside the panel.
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("button, summary, a[href]");
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem?.focus(); }
        else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <div ref={backdropRef} className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${category.key}-panel-title`}
        className="relative flex max-h-[min(88vh,820px)] w-full max-w-3xl origin-center flex-col overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4 sm:px-7">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
            <Icon size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={`${category.key}-panel-title`} className="truncate text-xl font-extrabold">{category.title}</h2>
            <p className="text-xs font-bold text-[color:var(--muted)]">{category.items.length} soru</p>
          </div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Kapat" className="rounded-full p-2 text-[color:var(--muted)] transition hover:bg-slate-100 hover:text-[color:var(--foreground)]">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          {category.items.map((item, i) => (
            <QuestionCard key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ q, a, tag, defaultOpen = false }: { q: string; a: string; tag?: string; defaultOpen?: boolean }) {
  return (
    <details className="panel group" open={defaultOpen || undefined}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold">
        <span>
          {tag ? <span className="mb-1 block text-[11px] font-black uppercase tracking-wide text-[color:var(--muted)]">{tag}</span> : null}
          {q}
        </span>
        <span className="text-xl text-[color:var(--accent)] transition group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{a}</p>
    </details>
  );
}
