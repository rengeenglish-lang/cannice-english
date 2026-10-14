"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { OPTION_LETTERS } from "@/lib/online-denemeler/types";

export type ReviewItem = {
  n: number;
  sectionTitle: string;
  stem: string;
  sentences?: string[];
  passage?: { kind: "cloze" | "reading"; text: string; from: number; to: number };
  options: string[];
  answer: number;
  choice: number | null;
  why: string;
};

type Filter = "wrong" | "blank" | "all";

const ROMAN = ["I", "II", "III", "IV", "V"];

/** Question-by-question review after a deneme: the student's answer, the key and the explanation. */
export function ReviewList({ items }: { items: ReviewItem[] }) {
  const wrong = items.filter((i) => i.choice !== null && i.choice !== i.answer);
  const blank = items.filter((i) => i.choice === null);
  const [filter, setFilter] = useState<Filter>(wrong.length ? "wrong" : blank.length ? "blank" : "all");
  const shown = filter === "wrong" ? wrong : filter === "blank" ? blank : items;
  const tabs: [Filter, string][] = [
    ["wrong", `Yanlışlar (${wrong.length})`],
    ["blank", `Boşlar (${blank.length})`],
    ["all", `Tümü (${items.length})`],
  ];

  return (
    <section className="dashboard-panel space-y-4" aria-labelledby="review-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="review-title" className="text-lg font-extrabold text-[color:var(--foreground)]">Soruları incele</h2>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtre">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === key ? "bg-[color:var(--foreground)] text-[color:var(--surface)]" : "border border-[color:var(--border)] text-[color:var(--foreground)]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? <p className="page-copy">Bu listede soru yok.</p> : null}

      <ol className="space-y-4">
        {shown.map((q) => {
          const state = q.choice === null ? "blank" : q.choice === q.answer ? "right" : "wrong";
          return (
            <li key={q.n} className="rounded-2xl border border-[color:var(--border)] p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <strong className="text-[color:var(--foreground)]">Soru {q.n}</strong>
                <span className="text-xs text-[color:var(--muted)]">{q.sectionTitle}</span>
                {state === "wrong" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--danger)]">
                    <X size={14} aria-hidden="true" /> Senin cevabın: {OPTION_LETTERS[q.choice!]}
                  </span>
                ) : state === "blank" ? (
                  <span className="text-xs font-bold text-[color:var(--muted)]">Boş bıraktın</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--success)]">
                    <Check size={14} aria-hidden="true" /> Doğru cevapladın
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--success)]">
                  <Check size={14} aria-hidden="true" /> Doğru: {OPTION_LETTERS[q.answer]}
                </span>
              </div>

              {q.passage ? (
                <details className="mt-3 rounded-xl bg-[color:var(--brand-soft)] px-4 py-2 text-sm">
                  <summary className="cursor-pointer font-bold text-[color:var(--foreground)]">
                    {q.passage.kind === "cloze" ? "Cloze metni" : "Okuma parçası"} (Soru {q.passage.from}–{q.passage.to})
                  </summary>
                  <p className="mt-2 whitespace-pre-line font-serif leading-7 text-[color:var(--foreground)]">{q.passage.text}</p>
                </details>
              ) : null}

              {q.sentences ? (
                <p className="mt-3 font-serif leading-7 text-[color:var(--foreground)]">
                  {q.sentences.map((s, i) => (
                    <span key={i}>
                      <strong>({ROMAN[i]})</strong> {s}{" "}
                    </span>
                  ))}
                </p>
              ) : q.stem ? (
                <p className="mt-3 whitespace-pre-line font-serif text-[1.02rem] leading-7 text-[color:var(--foreground)]">{q.stem}</p>
              ) : null}

              <ul className="mt-3 space-y-1 text-sm">
                {q.options.map((o, i) => (
                  <li
                    key={i}
                    className={`flex gap-2 rounded-lg px-2 py-1 ${
                      i === q.answer ? "bg-[color:var(--success-soft)] font-semibold" : i === q.choice ? "bg-[color:var(--danger-soft)]" : ""
                    } text-[color:var(--foreground)]`}
                  >
                    <span className="font-black">{OPTION_LETTERS[i]})</span> {o}
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-xl bg-[color:var(--brand-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--foreground)]">{q.why}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
