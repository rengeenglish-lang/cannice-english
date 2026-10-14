"use client";

import { useState } from "react";

type Mode = "KLASIK" | "OPTIK";

function KlasikSketch() {
  return (
    <div aria-hidden="true" className="grid h-28 grid-cols-[64px_minmax(0,1fr)] gap-2.5 rounded-2xl bg-[color:var(--brand-soft)] p-3">
      <div className="grid grid-cols-3 content-start gap-1">
        {["a", "a", "e", "a", "f", "e", "e", "e", "e"].map((k, i) => (
          <span key={i} className={`h-3 rounded ${k === "a" ? "bg-[color:var(--accent)]" : k === "f" ? "bg-[color:var(--gold)]" : "bg-[color:var(--border)]"}`} />
        ))}
      </div>
      <div className="flex flex-col gap-1.5 rounded-xl bg-[color:var(--surface)] p-2.5">
        <span className="h-2 w-11/12 rounded bg-[color:var(--border)]" />
        <span className="h-2 w-2/3 rounded bg-[color:var(--border)]" />
        <span className="h-3.5 rounded-md border border-[color:var(--border)]" />
        <span className="h-3.5 rounded-md border-2 border-[color:var(--accent)] bg-[color:var(--accent-soft)]" />
        <span className="h-3.5 rounded-md border border-[color:var(--border)]" />
      </div>
    </div>
  );
}

function OptikSketch() {
  const rows = [1, 3, 0, 4];
  return (
    <div aria-hidden="true" className="grid h-28 grid-cols-[minmax(0,1fr)_100px] gap-2.5 rounded-2xl bg-[color:var(--brand-soft)] p-3">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[color:var(--surface)] p-2.5">
        {[0, 1].map((c) => (
          <div key={c} className="flex flex-col gap-1">
            <span className="h-1.5 rounded bg-[color:var(--border)]" />
            <span className="h-1.5 w-4/5 rounded bg-[color:var(--border)]" />
            <span className="h-1.5 rounded bg-[color:var(--border)]" />
            <span className="h-1.5 w-3/5 rounded bg-[color:var(--border)]" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 rounded-xl border-2 border-[color:var(--foreground)] bg-[color:var(--surface)] p-2">
        {rows.map((on, r) => (
          <div key={r} className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`size-2.5 rounded-full ${i === on ? "bg-[color:var(--foreground)]" : "border border-[color:var(--muted)]"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The two ways to sit a deneme. The choice is sent with the start form and can be changed mid-test. */
export function ModePicker({ initial = "KLASIK" }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const cards: { key: Mode; title: string; text: string; sketch: React.ReactNode }[] = [
    {
      key: "KLASIK",
      title: "Klasik görünüm",
      text: "Her ekranda tek soru; okuma ve cloze parçası sorunun yanında durur. Soldaki haritada boş, cevaplı ve işaretli soruları görürsün. Telefon ve tablet için en rahat mod.",
      sketch: <KlasikSketch />,
    },
    {
      key: "OPTIK",
      title: "ÖSYM cevap kâğıdı",
      text: "Gerçek sınavdaki gibi: solda iki sütunlu soru kitapçığı, sağda optik form. Form, ekranda gördüğün sorulara göre kendini kaydırır. Masaüstü için önerilir.",
      sketch: <OptikSketch />,
    },
  ];
  return (
    <fieldset>
      <legend className="text-lg font-extrabold text-[color:var(--foreground)]">Nasıl çözmek istersin?</legend>
      <p className="mt-1 text-sm text-[color:var(--muted)]">Modu sınav sırasında da değiştirebilirsin; cevapların kaybolmaz.</p>
      <input type="hidden" name="mode" value={mode} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {cards.map((c) => {
          const on = mode === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={on}
              onClick={() => setMode(c.key)}
              className={`flex flex-col gap-4 rounded-3xl bg-[color:var(--surface)] p-5 text-left transition ${
                on ? "border-[3px] border-[color:var(--accent)] shadow-lg" : "border border-[color:var(--border)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-lg font-extrabold text-[color:var(--foreground)]">{c.title}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${on ? "bg-[color:var(--accent)] text-[color:var(--on-accent)]" : "bg-[color:var(--brand-soft)] text-[color:var(--muted)]"}`}
                >
                  {on ? "Seçildi" : "Seç"}
                </span>
              </span>
              {c.sketch}
              <span className="text-sm leading-6 text-[color:var(--muted)]">{c.text}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
