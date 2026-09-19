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
  return (
    <section
      id="group-availability"
      className="mx-auto my-12 w-[calc(100%-40px)] max-w-[1536px] rounded-3xl bg-blue-50/70 p-5 sm:p-8"
      aria-labelledby="availability-title"
    >
      <AvailabilityRefresh />
      <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
        Bu hafta · Canlı grup dersleri
      </p>
      <h2
        id="availability-title"
        className="mt-3 text-3xl font-extrabold text-slate-900"
      >
        Programına uygun bir grup dersi bul
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Bu haftanın uygun derslerini incele, grubun kontenjanı dolmadan yerini
        ayır. Saatler Türkiye saatidir.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {slots.map((slot) => (
          <SlotCard slot={slot} key={slot.id} />
        ))}
      </div>
      {!slots.length && (
        <p className="my-6 rounded-xl bg-white p-5 text-slate-600">
          Bu hafta için yeni dersler planlanıyor. Diğer haftaları
          inceleyebilirsin.
        </p>
      )}
      <Link
        className="mt-6 inline-flex min-h-11 items-center font-bold text-blue-700"
        href="/group-lessons"
      >
        Tüm haftalık uygunluğu gör →
      </Link>
    </section>
  );
}
