"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeft, CalendarDays, ClipboardCheck, CreditCard, LayoutGrid, Layers, RotateCcw, Search, UserRound, Wrench, X, type LucideIcon } from "lucide-react";
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
 * A card opens that section; the search box looks through every question and answer. Without
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

  const open = (key: string | null) => {
    setQuery("");
    history.replaceState(null, "", key ? `#${key}` : window.location.pathname + window.location.search);
    window.dispatchEvent(new Event(HASH_EVENT));
    document.getElementById("sss-cevaplar")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const shown = !ready ? categories : current ? [current] : [];

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
                      open(active ? null : category.key);
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
                    <span className="mt-auto text-sm font-bold text-[color:var(--accent)]">{active ? "Kapat" : "Soruları gör →"}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div id="sss-cevaplar" className="scroll-mt-24">
            {ready && current ? (
              <button type="button" onClick={() => open(null)} className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--accent)]">
                <ArrowLeft size={16} aria-hidden="true" /> Tüm kategoriler
              </button>
            ) : null}
            <div className="mt-6 space-y-10">
              {shown.map((category) => (
                <section key={category.key} id={ready ? undefined : category.key} aria-labelledby={`${category.key}-title`}>
                  <h2 id={`${category.key}-title`} className="section-title !text-xl">{category.title}</h2>
                  <div className="mt-4 space-y-3">
                    {category.items.map((item) => (
                      <QuestionCard key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {ready && !current ? <p className="mt-6 text-center text-sm text-[color:var(--muted)]">Bir kategori seç ya da sorunu yukarıya yaz.</p> : null}
          </div>
        </>
      )}
    </div>
  );
}

function QuestionCard({ q, a, tag }: { q: string; a: string; tag?: string }) {
  return (
    <details className="panel group">
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
