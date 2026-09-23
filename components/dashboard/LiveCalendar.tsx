"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
export type CalendarSession = {
  id: string;
  title: string;
  courseTitle: string;
  courseId: string;
  startsAt: string;
};
const dateKey = (date: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
export function LiveCalendar({
  sessions,
  today,
}: {
  sessions: CalendarSession[];
  today: string;
}) {
  const current = dateKey(today);
  const [month, setMonth] = useState(current.slice(0, 7));
  const [year, number] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const cells = Array.from(
    { length: Math.ceil((offset + days) / 7) * 7 },
    (_, i) => i - offset + 1,
  );
  const visible = sessions.filter((s) => dateKey(s.startsAt).startsWith(month));
  const change = (delta: number) => {
    const d = new Date(Date.UTC(year, number - 1 + delta, 1));
    setMonth(d.toISOString().slice(0, 7));
  };
  return (
    <div className="dashboard-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">BİRLİKTE ÖĞRENELİM</p>
          <h2 className="section-title !text-xl">Canlı Derslerim takvimi</h2>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Kayıtlı olduğunuz gruplar · Türkiye saati (Europe/Istanbul)
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="ghost-button px-3"
            onClick={() => change(-1)}
            aria-label="Önceki ay"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="ghost-button text-xs"
            onClick={() => setMonth(current.slice(0, 7))}
          >
            Bu ay
          </button>
          <button
            className="ghost-button px-3"
            onClick={() => change(1)}
            aria-label="Sonraki ay"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div>
          <h3 aria-live="polite" className="mb-4 text-sm font-bold capitalize">
            {new Intl.DateTimeFormat("tr-TR", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(first)}
          </h3>
          <table className="w-full table-fixed text-center text-xs">
            <caption className="sr-only">
              Canlı ders günleri, Türkiye saati
            </caption>
            <thead>
              <tr>
                {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                  <th
                    key={d}
                    scope="col"
                    className="pb-3 font-medium text-[color:var(--muted)]"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: cells.length / 7 }, (_, r) => (
                <tr key={r}>
                  {cells.slice(r * 7, r * 7 + 7).map((day, c) => {
                    const key = month + "-" + String(day).padStart(2, "0");
                    const count = visible.filter(
                      (s) => dateKey(s.startsAt) === key,
                    ).length;
                    return (
                      <td key={c} className="p-1">
                        {day > 0 && day <= days ? (
                          <div
                            className={
                              "flex h-11 flex-col items-center justify-center rounded-lg " +
                              (key === current
                                ? "bg-[color:var(--brand)] text-white"
                                : count
                                  ? "bg-[color:var(--accent-soft)] font-bold text-[color:var(--accent-strong)]"
                                  : "text-[color:var(--muted)]")
                            }
                          >
                            <span>{day}</span>
                            {count ? (
                              <span className="text-[8px]">{count} ders</span>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          {visible.length ? (
            <ul className="space-y-3">
              {visible.map((s) => (
                <li key={s.id}>
                  <Link
                    href={"/dashboard/courses/" + s.courseId + "#live-schedule"}
                    className="focus-ring block rounded-xl border border-[color:var(--border)] p-4 transition hover:border-[color:var(--accent)]"
                  >
                    <p className="text-xs font-bold text-[color:var(--accent-strong)]">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Istanbul",
                      }).format(new Date(s.startsAt))}
                    </p>
                    <h3 className="mt-2 text-sm font-bold">{s.title}</h3>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      {s.courseTitle}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="learning-empty">
              <CalendarDays
                size={28}
                className="mx-auto mb-4 text-[color:var(--accent)]"
                aria-hidden="true"
              />
              <p className="text-sm font-bold">Bu ay için yaklaşan ders yok.</p>
              <p className="mt-3 text-xs leading-6 text-[color:var(--muted)]">
                Grubunuza ders eklendiğinde burada görünür. Diğer ayları da
                inceleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
