import Link from "next/link";
import { weekRange } from "@/lib/availability";
import { listGroupSlots } from "@/server/services/group-availability.service";
import { SlotCard } from "./SlotCard";
import { AvailabilityRefresh } from "./AvailabilityRefresh";
export async function AvailabilityHome() {
  const { start, end } = weekRange();
  const slots = (await listGroupSlots(start, end))
    .filter((s) => s.startsAt > new Date() && !s.cancelled)
    .slice(0, 3);
  if (!slots.length) {
    return (
      <section
        id="group-availability"
        className="mx-auto my-12 flex w-[calc(100%-32px)] max-w-[1320px] flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4 sm:w-[calc(100%-48px)] lg:w-[calc(100%-64px)]"
        aria-label="Bu haftanın grup dersleri"
      >
        <AvailabilityRefresh />
        <p className="text-sm text-slate-700">
          <span className="font-extrabold text-blue-700">Grup dersleri:</span>{" "}
          Bu hafta için yeni dersler planlanıyor.
        </p>
        <Link className="text-sm font-extrabold text-blue-700 hover:underline" href="/group-lessons">
          Tüm haftalık uygunluğu gör →
        </Link>
      </section>
    );
  }
  return (
    <section
      id="group-availability"
      className="mx-auto my-16 w-[calc(100%-32px)] max-w-[1320px] overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-[0_12px_35px_rgba(12,46,30,.07)] sm:w-[calc(100%-48px)] sm:p-10 lg:w-[calc(100%-64px)]"
      aria-labelledby="availability-title"
    >
      <AvailabilityRefresh />
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">GRUP DERSİ</span>
        <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">Bu haftanın programı</p>
      </div>
      <h2
        id="availability-title"
        className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"
      >
        Programına uygun bir grup dersi bul
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Bu haftanın uygun derslerini incele, grubun kontenjanı dolmadan yerini
        ayır. Gruplar en fazla 10 öğrencidir; saatler Türkiye saatidir.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {slots.map((slot) => (
          <SlotCard slot={slot} key={slot.id} />
        ))}
      </div>
      <Link
        className="secondary-button mt-7"
        href="/group-lessons"
      >
        Tüm haftalık uygunluğu gör →
      </Link>
    </section>
  );
}
