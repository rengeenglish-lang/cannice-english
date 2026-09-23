"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";

type Counts = { correct: number; wrong: number; pending: number; blank: number };
type Section = { key: string; label: string; counts: Counts };
type Slice = {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Status slices carry an icon so meaning is never colour alone. */
  icon?: typeof CheckCircle2;
  detail: { lines: string[]; actions: { href: string; label: string }[] };
};

/*
 * Colours: categorical slots 1–5 of the dataviz reference palette in fixed order, one per skill
 * (so a skill keeps its colour even when others have no data), and the reserved status palette for
 * outcomes. Validated on the white panel surface; three skill colours sit below 3:1 contrast, so the
 * legend is an always-visible table with counts and percentages.
 */
const SKILL_COLORS: Record<string, string> = { grammar: "#2a78d6", reading: "#eb6834", listening: "#1baf7a", speaking: "#eda100", writing: "#e87ba4" };
const OUTCOMES = [
  { key: "correct", label: "Doğru", color: "#0ca30c", icon: CheckCircle2 },
  { key: "wrong", label: "Yanlış", color: "#d03b3b", icon: XCircle },
  { key: "pending", label: "Değerlendirmede", color: "#fab219", icon: Clock },
  { key: "blank", label: "Boş", color: "#b4b2a9", icon: MinusCircle },
] as const;

const SIZE = 240;
const R_OUTER = 110;
const R_INNER = 72;

function arcPath(start: number, end: number, rOuter: number, rInner: number) {
  const c = SIZE / 2;
  // A full circle can't be drawn as one arc; nudge it just under 2π.
  const sweep = Math.min(end - start, Math.PI * 2 - 0.0001);
  const e = start + sweep;
  const large = sweep > Math.PI ? 1 : 0;
  // Rounded so the server- and browser-rendered paths match exactly (trig differs in the last digit).
  const p = (r: number, a: number) => `${(c + r * Math.sin(a)).toFixed(2)} ${(c - r * Math.cos(a)).toFixed(2)}`;
  return `M ${p(rOuter, start)} A ${rOuter} ${rOuter} 0 ${large} 1 ${p(rOuter, e)} L ${p(rInner, e)} A ${rInner} ${rInner} 0 ${large} 0 ${p(rInner, start)} Z`;
}

const pct = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0);
const accuracy = (c: Counts) => (c.correct + c.wrong ? Math.round((c.correct / (c.correct + c.wrong)) * 100) : null);

export function ProgressDonut({ sections }: { sections: Section[] }) {
  const [view, setView] = useState<"skill" | "result">("skill");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ key: string; x: number; y: number } | null>(null);
  const titleId = useId();

  const slices: Slice[] = useMemo(() => {
    if (view === "skill") {
      return sections
        .map((s) => {
          const total = s.counts.correct + s.counts.wrong + s.counts.pending + s.counts.blank;
          const acc = accuracy(s.counts);
          return {
            key: s.key,
            label: s.label,
            value: total,
            color: SKILL_COLORS[s.key] ?? "#898781",
            detail: {
              lines: [
                `${total} soru · ${s.counts.correct} doğru · ${s.counts.wrong} yanlış${s.counts.blank ? ` · ${s.counts.blank} boş` : ""}${s.counts.pending ? ` · ${s.counts.pending} değerlendirmede` : ""}`,
                acc === null ? "Henüz puanlanmış soru yok." : `Doğruluk oranın: %${acc}`,
              ],
              actions: [
                { href: `/dashboard/practice?bolum=${s.key}`, label: `${s.label} pratiği yap` },
                ...(s.counts.wrong ? [{ href: "/dashboard/hatalarim", label: "Yanlışlarımı gör" }] : []),
              ],
            },
          };
        })
        .filter((s) => s.value > 0);
    }
    return OUTCOMES.map((o) => {
      const value = sections.reduce((n, s) => n + s.counts[o.key], 0);
      const bySkill = sections.filter((s) => s.counts[o.key] > 0).map((s) => `${s.label}: ${s.counts[o.key]}`);
      const actions =
        o.key === "wrong"
          ? [{ href: "/dashboard/hatalarim", label: "Hatalarım'a git" }]
          : o.key === "blank"
            ? [{ href: "/dashboard/practice", label: "Pratik yap" }]
            : o.key === "pending"
              ? [{ href: "/dashboard/progress?bolum=odevler", label: "Değerlendirmeleri gör" }]
              : [{ href: "/dashboard/mock-exam", label: "Deneme çöz" }];
      return { key: o.key, label: o.label, value, color: o.color, icon: o.icon, detail: { lines: [bySkill.join(" · ") || "—"], actions } };
    }).filter((s) => s.value > 0);
  }, [view, sections]);

  const total = slices.reduce((n, s) => n + s.value, 0);
  const active = slices.find((s) => s.key === selected) ?? null;
  const hovered = slices.find((s) => s.key === hover?.key) ?? null;

  const arcs = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((n, x) => n + x.value, 0);
    return { slice: s, start: (before / total) * Math.PI * 2, end: ((before + s.value) / total) * Math.PI * 2 };
  });

  const switchView = (next: "skill" | "result") => {
    setView(next);
    setSelected(null);
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={titleId} className="font-extrabold">Çözdüğün sorular</h3>
        <div role="group" aria-label="Grafik görünümü" className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          {(["skill", "result"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => switchView(v)}
              className={`rounded-lg px-3 py-1.5 transition ${view === v ? "bg-white text-[color:var(--brand)] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {v === "skill" ? "Becerilere göre" : "Sonuca göre"}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          Henüz soru çözmedin. Seviye tespit, deneme veya pratik sorular çözdükçe grafik burada oluşur.{" "}
          <Link href="/seviye-tespit/yeni" className="font-bold underline">Seviye testine başla</Link>
        </p>
      ) : (
        <div className="mt-4 grid items-center gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              role="group"
              aria-labelledby={titleId}
              onMouseLeave={() => setHover(null)}
            >
              {arcs.map(({ slice, start, end }) => {
                const isActive = selected === slice.key;
                const dimmed = selected !== null && !isActive;
                return (
                  <path
                    key={slice.key}
                    d={arcPath(start, end, isActive ? R_OUTER + 6 : R_OUTER, R_INNER)}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={dimmed ? 0.35 : 1}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`${slice.label}: ${slice.value} soru, yüzde ${pct(slice.value, total)}`}
                    className="cursor-pointer outline-none transition-opacity focus-visible:opacity-80"
                    onClick={() => setSelected(isActive ? null : slice.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(isActive ? null : slice.key);
                      }
                    }}
                    onMouseMove={(e) => {
                      const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                      setHover({ key: slice.key, x: e.clientX - box.left, y: e.clientY - box.top });
                    }}
                  />
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-3xl font-black text-[color:var(--foreground)]">{active ? active.value : total}</p>
                <p className="text-xs font-semibold text-[color:var(--muted)]">{active ? `${active.label} · %${pct(active.value, total)}` : "toplam soru"}</p>
              </div>
            </div>
            {hover && hovered ? (
              <div
                role="tooltip"
                className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-[#0b0b0b] px-3 py-2 text-xs text-white shadow-lg"
                style={{ left: Math.min(Math.max(hover.x, 70), SIZE - 70), top: hover.y - 12, transform: "translate(-50%, -100%)" }}
              >
                <span className="mr-1.5 inline-block size-2.5 rounded-sm align-middle" style={{ background: hovered.color }} aria-hidden="true" />
                <strong>{hovered.label}</strong> · {hovered.value} soru · %{pct(hovered.value, total)}
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            {/* Legend + table view in one: always visible, every value in text. */}
            <table className="w-full text-sm">
              <caption className="sr-only">Çözülen soruların dağılımı</caption>
              <thead className="sr-only">
                <tr><th scope="col">Kategori</th><th scope="col">Soru</th><th scope="col">Yüzde</th></tr>
              </thead>
              <tbody>
                {slices.map((s) => {
                  const Icon = s.icon;
                  const isActive = selected === s.key;
                  return (
                    <tr key={s.key} className={isActive ? "bg-[color:var(--brand-soft)]" : ""}>
                      <th scope="row" className="py-1.5 pr-3 text-left font-semibold">
                        <button type="button" onClick={() => setSelected(isActive ? null : s.key)} aria-pressed={isActive} className="flex items-center gap-2 rounded-md px-1 text-left hover:underline">
                          <span className="inline-block size-3 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
                          {Icon ? <Icon size={15} className="shrink-0 text-slate-500" aria-hidden="true" /> : null}
                          {s.label}
                        </button>
                      </th>
                      <td className="py-1.5 pr-3 text-right tabular-nums">{s.value}</td>
                      <td className="py-1.5 text-right tabular-nums text-[color:var(--muted)]">%{pct(s.value, total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div aria-live="polite" className="mt-4">
              {active ? (
                <div className="rounded-xl border border-[color:var(--border)] p-4">
                  <p className="font-extrabold">{active.label}</p>
                  {active.detail.lines.map((line) => (
                    <p key={line} className="mt-1 text-sm text-[color:var(--muted)]">{line}</p>
                  ))}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {active.detail.actions.map((a) => (
                      <Link key={a.href} href={a.href} className="secondary-button !min-h-9 !px-4 !py-1.5 text-xs">{a.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[color:var(--muted)]">Ayrıntıları görmek için grafikte veya listede bir dilime tıkla.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
