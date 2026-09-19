import Link from "next/link";
import { listGroupSlots } from "@/server/services/group-availability.service";
import { weekRange } from "@/lib/availability";
import { WeekView } from "@/components/availability/WeekView";
import { AvailabilityRefresh } from "@/components/availability/AvailabilityRefresh";
export const dynamic = "force-dynamic";
export default async function GroupAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const { start, end } = weekRange(week);
  const slots = await listGroupSlots(start, end, true);
  return (
    <>
      <AvailabilityRefresh />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Group Availability</p>
          <h1 className="page-title">Grup uygunluğu</h1>
        </div>
        <Link href="/admin/group-availability/new" className="primary-button">
          + Ders ekle
        </Link>
      </div>
      <WeekView week={week} slots={slots} admin />
    </>
  );
}
