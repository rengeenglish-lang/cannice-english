"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { BarChart3, CheckCircle2, Hash, XCircle } from "lucide-react";

/** `day` = the week's Monday (day of month); `month` is set on the first week and where the month changes. */
export type WeekPoint = { day: string; month: string | null; range: string; correct: number; wrong: number };
export type ReportData = {
  /** null when the student has no hazırlık planı yet. */
  planProgress: number | null;
  accuracy: number;
  answered: number;
  activities: { label: string; value: number }[];
  weeks: WeekPoint[];
};

const KEY = "progress-report-view";
const VIEW_EVENT = "progress-report-view";
const subscribe = (cb: () => void) => {
  window.addEventListener(VIEW_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(VIEW_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
const readView = () => {
  try {
    return localStorage.getItem(KEY) === "charts" ? "charts" : "numbers";
  } catch {
    return "numbers";
  }
};

/* Outcome colours shared with the "Çözdüğün sorular" donut (reserved status palette, always with an icon). */
const CORRECT = "#0ca30c";
const WRONG = "#d03b3b";

/**
 * Genel İlerleme's numbers, with a Sayılar / Grafikler switch (remembered on this device).
 * Grafikler draws the same figures: the two percentages as meters, the finished-activity counts
 * as one bar chart (one hue, same unit), and answered questions per week as stacked columns —
 * questions run in the hundreds, so they get their own axis instead of sharing the counts' one.
 */
export function ReportView({ data, numbers }: { data: ReportData; numbers: ReactNode }) {
  const view = useSyncExternalStore(subscribe, readView, () => "numbers" as const);
  const set = (v: "numbers" | "charts") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    window.dispatchEvent(new Event(VIEW_EVENT));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold">Özet</p>
        <div role="group" aria-label="Rapor görünümü" className="inline-flex rounded-xl bg-slate-100 p-1">
          {([
            ["numbers", "Sayılar", Hash],
            ["charts", "Grafikler", BarChart3],
          ] as const).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => set(v)}
              aria-pressed={view === v}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${view === v ? "bg-[color:var(--surface)] text-[color:var(--accent-strong)] shadow-sm" : "text-slate-600 hover:text-[color:var(--foreground)]"}`}
            >
              <Icon size={14} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>
      {view === "numbers" ? numbers : <Charts data={data} />}
    </div>
  );
}

function Charts({ data }: { data: ReportData }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Meter label="Hazırlık Planı İlerlemesi" value={data.planProgress} empty="Hedef belirleyince plan ilerlemen burada görünür." />
        <Meter label="Ortalama Doğruluk" value={data.answered ? data.accuracy : null} empty="Soru çözdükçe doğruluk oranın burada görünür." note={data.answered ? `${data.answered} soru üzerinden` : undefined} />
      </div>
      <ActivityBars items={data.activities} />
      <WeeklyColumns weeks={data.weeks} />
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <figure className="rounded-2xl border border-[color:var(--border)] p-4 sm:p-5">
      <figcaption>
        <p className="text-sm font-extrabold">{title}</p>
        {sub ? <p className="text-xs text-[color:var(--muted)]">{sub}</p> : null}
      </figcaption>
      <div className="mt-3">{children}</div>
    </figure>
  );
}

function Meter({ label, value, empty, note }: { label: string; value: number | null; empty: string; note?: string }) {
  return (
    <Panel title={label} sub={note}>
      {value === null ? (
        <p className="text-sm text-[color:var(--muted)]">{empty}</p>
      ) : (
        <div>
          <p className="text-3xl font-black">%{value}</p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}>
            <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${Math.max(value ? 2 : 0, value)}%` }} />
          </div>
        </div>
      )}
    </Panel>
  );
}

/** One bar per finished-activity type: same unit (things completed), one hue, value at the bar end. */
function ActivityBars({ items }: { items: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((n, i) => n + i.value, 0);
  return (
    <Panel title="Tamamladıkların" sub={total ? `Toplam ${total} çalışma` : "Henüz tamamlanmış çalışma yok"}>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={item.label}
            className="relative grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr]"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="truncate text-xs font-bold text-[color:var(--muted)]">{item.label}</span>
            <span className="flex items-center gap-2">
              <span className="h-5 flex-1">
                <span
                  className={`block h-full rounded-r-[4px] transition-opacity ${item.value ? "bg-[color:var(--accent)]" : "bg-slate-200"} ${hover !== null && hover !== i ? "opacity-50" : ""}`}
                  style={{ width: item.value ? `${(item.value / max) * 100}%` : "3px" }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-sm font-black tabular-nums">{item.value}</span>
            </span>
          </li>
        ))}
      </ul>
      <DataTable head={["Çalışma", "Adet"]} rows={items.map((i) => [i.label, String(i.value)])} />
    </Panel>
  );
}

/** Answered questions per week, correct stacked under wrong (they sum to the week's total). */
function WeeklyColumns({ weeks }: { weeks: WeekPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const totals = weeks.map((w) => w.correct + w.wrong);
  const sum = totals.reduce((a, b) => a + b, 0);
  const niceMax = (() => {
    const m = Math.max(1, ...totals);
    const step = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / step) * step;
  })();
  const H = 160;
  const ticks = [0, niceMax / 2, niceMax];
  const w = hover !== null ? weeks[hover] : null;

  return (
    <Panel title="Haftalık çözülen sorular" sub={sum ? `Son ${weeks.length} haftada ${sum} soru` : `Son ${weeks.length} haftada çözülen soru yok`}>
      <div className="flex flex-wrap gap-4 text-xs font-bold text-[color:var(--muted)]">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: CORRECT }} /><CheckCircle2 size={13} aria-hidden="true" /> Doğru</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: WRONG }} /><XCircle size={13} aria-hidden="true" /> Yanlış</span>
      </div>
      <div className="relative mt-3 pl-8">
        {/* recessive grid */}
        <div className="absolute inset-x-0 top-0 pl-8" style={{ height: H }} aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 flex items-center" style={{ bottom: `${(t / niceMax) * 100}%` }}>
              <span className="absolute -left-0 w-7 -translate-y-1/2 pr-1 text-right text-[10px] tabular-nums text-[color:var(--muted)]">{Math.round(t)}</span>
              <span className="ml-8 h-px flex-1 bg-[color:var(--border)]" />
            </div>
          ))}
        </div>
        <div className="relative flex items-end gap-2 sm:gap-3" style={{ height: H }} onMouseLeave={() => setHover(null)}>
          {weeks.map((week, i) => {
            const total = week.correct + week.wrong;
            const hC = (week.correct / niceMax) * H;
            const hW = (week.wrong / niceMax) * H;
            return (
              <button
                key={week.range}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${week.range}: ${week.correct} doğru, ${week.wrong} yanlış`}
                className={`flex h-full flex-1 flex-col justify-end rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${hover === i ? "bg-slate-100/70" : ""}`}
              >
                {total ? (
                  <span className={`mx-auto flex w-full max-w-[36px] flex-col transition-opacity ${hover !== null && hover !== i ? "opacity-60" : ""}`}>
                    {week.wrong ? <span className="block rounded-t-[4px]" style={{ height: hW, background: WRONG }} /> : null}
                    {week.wrong && week.correct ? <span className="block h-[2px] bg-[color:var(--surface)]" /> : null}
                    {week.correct ? <span className={`block ${week.wrong ? "" : "rounded-t-[4px]"}`} style={{ height: hC, background: CORRECT }} /> : null}
                  </span>
                ) : (
                  <span className="mx-auto block h-[3px] w-full max-w-[36px] rounded-full bg-slate-200" />
                )}
              </button>
            );
          })}
            {w ? (
              <div
                role="status"
                className="pointer-events-none absolute -top-2 z-10 w-44 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2.5 text-xs shadow-lg"
                style={{ left: `${((hover! + 0.5) / weeks.length) * 100}%`, transform: `translateX(${hover! < 2 ? "-15%" : hover! > weeks.length - 3 ? "-85%" : "-50%"})` }}
              >
                <p className="font-extrabold">{w.range}</p>
                <p className="mt-1 flex justify-between"><span className="inline-flex items-center gap-1"><CheckCircle2 size={12} style={{ color: CORRECT }} aria-hidden="true" /> Doğru</span><strong>{w.correct}</strong></p>
                <p className="flex justify-between"><span className="inline-flex items-center gap-1"><XCircle size={12} style={{ color: WRONG }} aria-hidden="true" /> Yanlış</span><strong>{w.wrong}</strong></p>
                <p className="mt-1 flex justify-between border-t border-[color:var(--border)] pt-1 text-[color:var(--muted)]"><span>Doğruluk</span><strong>{w.correct + w.wrong ? `%${Math.round((w.correct / (w.correct + w.wrong)) * 100)}` : "—"}</strong></p>
              </div>
            ) : null}
        </div>
        <div className="mt-1.5 flex gap-2 sm:gap-3">
          {weeks.map((week) => (
            <span key={week.range} className="flex-1 text-center text-[10px] font-semibold leading-tight text-[color:var(--muted)]">
              <span className="block tabular-nums">{week.day}</span>
              <span className="block h-3">{week.month ?? ""}</span>
            </span>
          ))}
        </div>
      </div>
      <DataTable head={["Hafta", "Doğru", "Yanlış", "Doğruluk"]} rows={weeks.map((x) => [x.range, String(x.correct), String(x.wrong), x.correct + x.wrong ? `%${Math.round((x.correct / (x.correct + x.wrong)) * 100)}` : "—"])} />
    </Panel>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <details className="mt-3 text-xs">
      <summary className="cursor-pointer font-bold text-[color:var(--accent)]">Tablo olarak gör</summary>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr className="text-[color:var(--muted)]">{head.map((h) => <th key={h} className="py-1 pr-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-[color:var(--border)]">{r.map((c, i) => <td key={i} className="py-1 pr-3 tabular-nums">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
