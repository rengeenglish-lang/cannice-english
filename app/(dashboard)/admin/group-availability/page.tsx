import Link from "next/link";
import { db } from "@/server/db";
import { listGroupSlots } from "@/server/services/group-availability.service";
import { weekRange } from "@/lib/availability";
import { WeekView } from "@/components/availability/WeekView";
import { DemoSlotsForm } from "@/components/availability/AdminSlotActions";
import { AvailabilityRefresh } from "@/components/availability/AvailabilityRefresh";
export const dynamic = "force-dynamic";
export default async function GroupAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const { start, end } = weekRange(week);
  const [slots, courses] = await Promise.all([
    listGroupSlots(start, end, true),
    db.course.findMany({ include: { product: true } }),
  ]);
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
      <DemoSlotsForm
        courses={courses.map((c) => ({ id: c.id, title: c.product.title }))}
      />
      <WeekView week={week} slots={slots} admin />
    </>
  );
}
