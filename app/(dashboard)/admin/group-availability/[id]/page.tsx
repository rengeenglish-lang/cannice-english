import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { getGroupSlot } from "@/server/services/group-availability.service";
import {
  localDate,
  lessonTime,
  STATUS_LABELS,
  DEFAULT_CAPACITY,
} from "@/lib/availability";
import { AdminSlotForm } from "@/components/availability/AdminSlotForm";
import { AdminSlotActions } from "@/components/availability/AdminSlotActions";
export default async function EditGroupSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const slot = await getGroupSlot(id, true);
  if (!slot) notFound();
  const [courses, teachers, bookings, series] = await Promise.all([
    db.course.findMany({ include: { product: true } }),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "TEACHER"] }, isActive: true },
      select: { id: true, name: true },
    }),
    db.groupLessonEnrollment.findMany({
      where: { slotId: id },
      include: { student: { select: { name: true, email: true } } },
      orderBy: { enrolledAt: "asc" },
    }),
    slot.recurringSeriesId
      ? db.groupLessonSeries.findUnique({
          where: { id: slot.recurringSeriesId },
          include: { _count: { select: { sessions: true } } },
        })
      : null,
  ]);
  return (
    <>
      <Link href="/admin/group-availability" className="text-blue-700">
        ← Grup uygunluğu
      </Link>
      <h1 className="page-title my-6">Ders yönetimi</h1>
      {saved && (
        <p role="status" className="mb-4 font-bold text-emerald-700">
          Ders kaydedildi.
        </p>
      )}
      <div className="mb-6 rounded-xl bg-blue-50 p-5">
        <p className="font-bold">
          {STATUS_LABELS[slot.availability.status]} · {slot.availability.actual}{" "}
          gerçek öğrenci · {slot.availability.remaining} gerçek yer
        </p>
        <p className="mt-2">
          Kayıt {slot.enrollmentOpen ? "açık" : "kapalı"}
          {slot.cancelled ? " · DERS İPTAL EDİLDİ" : ""}
        </p>
        {series && (
          <p className="mt-2 text-sm">
            Haftalık seri: {series._count.sessions} ders · Son tarih{" "}
            {localDate(series.repeatUntil)}. Tek ders veya bu dersten sonrasını
            düzenleyebilirsiniz.
          </p>
        )}
      </div>
      <AdminSlotForm
        key={slot.updatedAt.toISOString()}
        actual={slot.availability.actual}
        courses={courses.map((c) => ({ id: c.id, title: c.product.title }))}
        teachers={teachers}
        slot={{
          id,
          title: slot.title,
          courseId: slot.courseId,
          date: localDate(slot.startsAt),
          time: lessonTime(slot.startsAt),
          duration: Math.round(
            (slot.endsAt.getTime() - slot.startsAt.getTime()) / 60000,
          ),
          capacity: slot.capacity ?? DEFAULT_CAPACITY,
          instructorId: slot.instructorId ?? undefined,
          adminNotes: slot.adminNotes ?? undefined,
          displayedOccupancy: slot.displayedOccupancy ?? undefined,
          useDisplayedOccupancy: slot.useDisplayedOccupancy,
          enrollmentOpen: slot.enrollmentOpen,
          recurringSeriesId: slot.recurringSeriesId ?? undefined,
        }}
      />
      <AdminSlotActions id={id} />
      <section className="mt-8">
        <h2 className="text-xl font-bold">Gerçek öğrenci kayıtları</h2>
        {!bookings.length ? (
          <p className="mt-3">
            Henüz gerçek öğrenci kaydı yok. Demo doluluğu bu listede görünmez.
          </p>
        ) : (
          <ul className="mt-4 divide-y rounded-xl border bg-white">
            {bookings.map((b) => (
              <li key={b.id} className="p-4">
                <strong>{b.student.name}</strong>
                <p className="break-all text-sm text-slate-600">
                  {b.student.email}
                </p>
                <p className="text-sm">
                  {b.status === "ACTIVE" ? "Aktif" : "İptal"} ·{" "}
                  {localDate(b.enrolledAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
