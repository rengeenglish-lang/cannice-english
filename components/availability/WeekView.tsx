import Link from "next/link";
import { weekRange, lessonDate, localDate } from "@/lib/availability";
import { SlotCard } from "./SlotCard";
import type { GroupSlot } from "@/server/services/group-availability.service";
export function WeekView({
  week,
  slots,
  admin = false,
}: {
  week?: string;
  slots: GroupSlot[];
  admin?: boolean;
}) {
  const range = weekRange(week),
    base = admin ? "/admin/group-availability" : "/group-lessons";
  return (
    <>
      <nav
        aria-label="Hafta seçimi"
        className="my-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <Link
          className="min-h-11 rounded-lg px-3 py-3 text-sm font-bold hover:bg-slate-100"
          href={`${base}?week=${range.previous}`}
        >
          ‹ Önceki hafta
        </Link>
        <div className="text-center">
          <p className="font-bold">
            {lessonDate(range.start)} –{" "}
            {lessonDate(new Date(range.end.getTime() - 86400000))}
          </p>
          <Link className="text-sm text-blue-700 underline" href={base}>
            Bu hafta
          </Link>
        </div>
        <Link
          className="min-h-11 rounded-lg px-3 py-3 text-sm font-bold hover:bg-slate-100"
          href={`${base}?week=${range.next}`}
        >
          Sonraki hafta ›
        </Link>
        {admin && (
          <form className="flex w-full flex-wrap items-end gap-2">
            <label className="text-sm font-semibold">
              Tarihe git
              <input
                className="auth-input mt-1"
                name="week"
                type="date"
                defaultValue={localDate(range.start)}
              />
            </label>
            <button className="secondary-button">Haftayı göster</button>
          </form>
        )}
      </nav>
      <p className="mb-4 text-sm text-slate-500">
        Tüm saatler Türkiye saatiyle (Europe/Istanbul).
      </p>
      {!slots.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
          Bu hafta planlanmış grup dersi yok. Sonraki haftaya göz atın.
        </div>
      ) : (
        <div className="grid items-start gap-7 md:grid-cols-2 xl:grid-cols-3">
          {Array.from(new Set(slots.map((s) => localDate(s.startsAt)))).map(
            (day) => (
              <section key={day}>
                <h2 className="mb-3 text-lg font-bold">
                  {lessonDate(
                    slots.find((s) => localDate(s.startsAt) === day)!.startsAt,
                  )}
                </h2>
                <div className="space-y-4">
                  {slots
                    .filter((s) => localDate(s.startsAt) === day)
                    .map((slot) => (
                      <SlotCard key={slot.id} slot={slot} admin={admin} />
                    ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </>
  );
}
