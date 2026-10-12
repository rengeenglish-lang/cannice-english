"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { termSlug } from "@/lib/dictionary/text";

type Suggestion = { term: string; lang: "en" | "tr" };

const RECENT_KEY = "netfener-sozluk-son";

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function rememberSearch(term: string) {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

/** Tureng-style search: type English or Turkish, pick a suggestion or press Enter. */
export function SearchBox({ initial = "", autoFocus = false }: { initial?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const term = q.trim();
    if (!term || term === initial) return;
    const ctrl = new AbortController();
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sozluk/oneri?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (res.ok) {
          setItems((await res.json()).items ?? []);
          setActive(-1);
        }
      } catch {}
    }, 120);
    return () => ctrl.abort();
  }, [q, initial]);

  function go(term: string) {
    const t = term.trim();
    if (!t) return;
    rememberSearch(t);
    setOpen(false);
    router.push(`/sozluk/${encodeURIComponent(termSlug(t))}`);
  }

  const typed = q.trim() && q.trim() !== initial;
  const shown = typed ? items : !q.trim() ? recent.map((term) => ({ term, lang: "en" as const })) : [];

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go(active >= 0 && shown[active] ? shown[active].term : q);
      }}
      className="relative w-full"
    >
      <label htmlFor={`${listId}-input`} className="sr-only">İngilizce veya Türkçe kelime ara</label>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[color:var(--brand)] bg-white px-4 py-2 shadow-sm focus-within:ring-4 focus-within:ring-[color:var(--brand-soft)]">
        <Search size={20} className="shrink-0 text-[color:var(--muted)]" aria-hidden="true" />
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={open && shown.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          maxLength={80}
          value={q}
          placeholder="Kelime ya da ifade yaz: carry out, teşhis, hypothesis…"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setRecent(readRecent());
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(shown.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          className="min-w-0 flex-1 bg-transparent py-2 text-lg font-semibold outline-none"
        />
        {q ? (
          <button type="button" aria-label="Temizle" onClick={() => setQ("")} className="rounded-full p-1 text-[color:var(--muted)] hover:bg-slate-100">
            <X size={18} />
          </button>
        ) : null}
        <button type="submit" className="primary-button !min-h-0 !px-4 !py-2">Ara</button>
      </div>
      {open && shown.length > 0 ? (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-lg">
          {!q.trim() ? <li className="px-4 pt-3 text-xs font-black uppercase tracking-wide text-[color:var(--muted)]">Son aramaların</li> : null}
          {shown.map((s, i) => (
            <li
              key={`${s.lang}-${s.term}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(s.term);
              }}
              className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ${i === active ? "bg-[color:var(--brand-soft)]" : "hover:bg-slate-50"}`}
            >
              <span className="font-semibold">{s.term}</span>
              {q.trim() ? <span className="text-[11px] font-black uppercase text-[color:var(--muted)]">{s.lang === "en" ? "EN" : "TR"}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
