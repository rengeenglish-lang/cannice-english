"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import type { Countdown } from "@/lib/exam-interests";

const SETTINGS_HREF = "/dashboard/sinavlarim";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Ticks every second once mounted; the server render shows whole days so the first paint matches. */
function Remaining({ target, initialDays }: { target: string; initialDays: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return <strong>{initialDays} gün</strong>;
  const ms = new Date(target).getTime() - now;
  if (ms <= 0) return <strong>Sınav günü — başarılar!</strong>;
  const p = parts(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <strong className="tabular-nums">
      {p.d} gün {pad(p.h)}:{pad(p.m)}:{pad(p.s)}
    </strong>
  );
}

const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function ExamCountdownBar({ items, initialDays }: { items: Countdown[]; initialDays: Record<string, number> }) {
  return (
    <div className="border-t border-[color:var(--border)] bg-[color:var(--brand)]/5" role="region" aria-label="Sınav geri sayımı">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-1 px-4 py-1.5 text-xs sm:px-6 sm:text-sm lg:px-8">
        <Hourglass size={15} aria-hidden="true" className="shrink-0 text-[color:var(--brand)]" />
        {items.map((c) => (
          <span key={c.code} className="flex flex-wrap items-center gap-x-1.5">
            <span className="font-extrabold text-[color:var(--brand)]">{c.label}</span>
            {c.state === "DATE" ? (
              <>
                <span className="text-[color:var(--muted)]">
                  {c.source === "OSYM" ? c.examName : "Sınavın"} · {fmt.format(new Date(`${c.dateKey}T00:00:00Z`))}:
                </span>
                <Remaining target={c.target} initialDays={initialDays[c.code] ?? 0} />
              </>
            ) : c.state === "AWAITING_CALENDAR" ? (
              <Link href="/tools/exam-calendar" className="text-[color:var(--muted)] underline">Yeni ÖSYM takvimi bekleniyor</Link>
            ) : (
              <Link href={SETTINGS_HREF} className="font-semibold underline">Sınav tarihini ekle</Link>
            )}
          </span>
        ))}
        <Link href={SETTINGS_HREF} className="ml-auto text-xs font-semibold text-[color:var(--muted)] underline">Sınavlarımı düzenle</Link>
      </div>
    </div>
  );
}
