import { weekRange } from "@/lib/availability";
import { listGroupSlots } from "@/server/services/group-availability.service";
import { WeekView } from "@/components/availability/WeekView";
import { AvailabilityRefresh } from "@/components/availability/AvailabilityRefresh";
export const dynamic = "force-dynamic";
export const metadata = { title: "Haftalık Grup Dersleri" };
export default async function GroupLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const { start, end } = weekRange(week);
  const slots = await listGroupSlots(start, end);
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <AvailabilityRefresh />
      <p className="eyebrow">Birlikte öğrenelim</p>
      <h1 className="page-title">Haftalık grup dersleri</h1>
      <p className="mt-3 text-slate-600">
        Programına uygun saati seç, kontenjanı kontrol et ve yerini ayır.
      </p>
      <WeekView week={week} slots={slots} />
    </main>
  );
}
