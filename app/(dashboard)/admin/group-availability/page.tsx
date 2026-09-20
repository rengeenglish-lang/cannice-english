import Link from "next/link";
import { db } from "@/server/db";
import { listGroupSlots } from "@/server/services/group-availability.service";
import { weekRange, localDate, lessonTime, DEFAULT_CAPACITY } from "@/lib/availability";
import { WeekView } from "@/components/availability/WeekView";
import { DemoSlotsForm } from "@/components/availability/AdminSlotActions";
import { AvailabilityRefresh } from "@/components/availability/AvailabilityRefresh";
import { AdminSlotDialogProvider, type SlotDetailData } from "@/components/availability/AdminSlotDialogProvider";
export const dynamic = "force-dynamic";
export default async function GroupAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const { start, end } = weekRange(week);
  const [slots, courses, teachers] = await Promise.all([
    listGroupSlots(start, end, true),
    db.course.findMany({ include: { product: true } }),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "TEACHER"] }, isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  const slotIds = slots.map((s) => s.id);
  const seriesIds = [...new Set(slots.map((s) => s.recurringSeriesId).filter((v): v is string => Boolean(v)))];
  const [allBookings, allSeries] = await Promise.all([
    slotIds.length
      ? db.groupLessonEnrollment.findMany({
          where: { slotId: { in: slotIds } },
          include: { student: { select: { name: true, email: true } } },
          orderBy: { enrolledAt: "asc" },
        })
      : Promise.resolve([]),
    seriesIds.length
      ? db.groupLessonSeries.findMany({ where: { id: { in: seriesIds } }, include: { _count: { select: { sessions: true } } } })
      : Promise.resolve([]),
  ]);
  const bookingsBySlot = new Map<string, typeof allBookings>();
  for (const b of allBookings) bookingsBySlot.set(b.slotId, [...(bookingsBySlot.get(b.slotId) ?? []), b]);
  const seriesById = new Map(allSeries.map((s) => [s.id, s]));

  const slotDetails: Record<string, SlotDetailData> = {};
  for (const slot of slots) {
    const series = slot.recurringSeriesId ? seriesById.get(slot.recurringSeriesId) : undefined;
    slotDetails[slot.id] = {
      formValues: {
        id: slot.id,
        title: slot.title,
        courseId: slot.courseId,
        date: localDate(slot.startsAt),
        time: lessonTime(slot.startsAt),
        duration: Math.round((slot.endsAt.getTime() - slot.startsAt.getTime()) / 60000),
        capacity: slot.capacity ?? DEFAULT_CAPACITY,
        instructorId: slot.instructorId ?? undefined,
        adminNotes: slot.adminNotes ?? undefined,
        displayedOccupancy: slot.displayedOccupancy ?? undefined,
        useDisplayedOccupancy: slot.useDisplayedOccupancy,
        enrollmentOpen: slot.enrollmentOpen,
        recurringSeriesId: slot.recurringSeriesId ?? undefined,
      },
      actual: slot.availability.actual,
      status: slot.availability.status,
      enrollmentOpen: slot.enrollmentOpen,
      cancelled: slot.cancelled,
      updatedAt: slot.updatedAt.toISOString(),
      seriesInfo: series ? { sessionCount: series._count.sessions, repeatUntil: series.repeatUntil.toISOString() } : null,
      bookings: (bookingsBySlot.get(slot.id) ?? []).map((b) => ({
        id: b.id,
        status: b.status,
        enrolledAt: b.enrolledAt.toISOString(),
        studentName: b.student.name,
        studentEmail: b.student.email,
      })),
    };
  }

  return (
    <AdminSlotDialogProvider slots={slotDetails} courses={courses.map((c) => ({ id: c.id, title: c.product.title }))} teachers={teachers}>
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
      <p className="mt-2 text-sm text-slate-500">Bir dersi yönetmek için karta tıklayın.</p>
      <DemoSlotsForm
        courses={courses.map((c) => ({ id: c.id, title: c.product.title }))}
      />
      <WeekView week={week} slots={slots} admin />
    </AdminSlotDialogProvider>
  );
}
