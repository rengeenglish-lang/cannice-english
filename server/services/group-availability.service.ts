import "server-only";
import { db, type TransactionClient } from "@/server/db";
import {
  availability,
  addDays,
  dateAt,
  localDate,
  DEFAULT_CAPACITY,
  LESSON_TIMEZONE,
} from "@/lib/availability";
import { z } from "zod";
const include = {
  course: { include: { product: true } },
  instructor: { select: { name: true } },
  _count: { select: { bookings: { where: { status: "ACTIVE" as const } } } },
};
export async function listGroupSlots(start: Date, end: Date, admin = false) {
  const slots = await db.liveSession.findMany({
    where: {
      availabilityEnabled: true,
      startsAt: { gte: start, lt: end },
      ...(!admin ? { course: { product: { isPublished: true } } } : {}),
    },
    include,
    orderBy: { startsAt: "asc" },
  });
  return slots.map((slot) => ({
    ...slot,
    availability: availability(slot, slot._count.bookings),
  }));
}
export async function getGroupSlot(id: string, admin = false) {
  const slot = await db.liveSession.findFirst({
    where: {
      id,
      availabilityEnabled: true,
      ...(!admin ? { course: { product: { isPublished: true } } } : {}),
    },
    include,
  });
  return slot
    ? { ...slot, availability: availability(slot, slot._count.bookings) }
    : null;
}
export type GroupSlot = NonNullable<Awaited<ReturnType<typeof getGroupSlot>>>;
export async function nearestGroupSlots(id: string) {
  return (await listGroupSlots(new Date(), addDays(new Date(), 366)))
    .filter((s) => s.id !== id && s.availability.canEnroll)
    .slice(0, 3);
}
async function lockSlot(tx: TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM live_sessions WHERE id = ${id} FOR UPDATE`;
  return tx.liveSession.findUnique({
    where: { id },
    include: { course: { include: { product: true } } },
  });
}
// All booking/capacity mutations use the same PostgreSQL row lock. Actual
// enrollment rows are authoritative; demo occupancy never consumes a seat.
export async function enrollGroupSlot(slotId: string, studentId: string) {
  return db.$transaction(async (tx) => {
    const slot = await lockSlot(tx, slotId);
    if (!slot || !slot.availabilityEnabled || !slot.course.product.isPublished)
      throw new Error("Ders bulunamadı.");
    const student = await tx.user.findUnique({ where: { id: studentId } });
    if (!student?.isActive) throw new Error("Aktif bir hesap gerekiyor.");
    const existing = await tx.groupLessonEnrollment.findUnique({
      where: { slotId_studentId: { slotId, studentId } },
    });
    if (existing?.status === "ACTIVE") return existing;
    const actual = await tx.groupLessonEnrollment.count({
      where: { slotId, status: "ACTIVE" },
    });
    if (!availability(slot, actual).canEnroll)
      throw new Error(
        "Bu derse kayıt kapalı veya kontenjan dolu. Başka bir saat seçin.",
      );
    const access = await tx.enrollment.findUnique({
      where: {
        userId_courseId: { userId: studentId, courseId: slot.courseId },
      },
    });
    if (
      !access ||
      access.status !== "ACTIVE" ||
      (access.expiresAt && access.expiresAt <= new Date())
    )
      throw new Error("Önce bu dersin paketine kayıt olmalısınız.");
    return tx.groupLessonEnrollment.upsert({
      where: { slotId_studentId: { slotId, studentId } },
      create: { slotId, studentId },
      update: { status: "ACTIVE", cancelledAt: null, enrolledAt: new Date() },
    });
  });
}
export async function cancelGroupBooking(slotId: string, studentId: string) {
  return db.$transaction(async (tx) => {
    await lockSlot(tx, slotId);
    await tx.groupLessonEnrollment.updateMany({
      where: { slotId, studentId, status: "ACTIVE" },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  });
}
const schema = z.object({
  title: z.string().trim().min(2).max(160),
  courseId: z.string().min(1),
  date: z.string(),
  time: z.string(),
  duration: z.coerce.number().int().min(15).max(480),
  capacity: z.coerce.number().int().min(1).max(200).default(DEFAULT_CAPACITY),
  instructorId: z.string().optional(),
  adminNotes: z.string().max(4000).optional(),
  displayedOccupancy: z.coerce.number().int().min(0).max(200).optional(),
  useDisplayedOccupancy: z.boolean(),
  enrollmentOpen: z.boolean(),
  repeatWeeks: z.coerce.number().int().min(1).max(52).default(1),
});
export async function saveGroupSlot(raw: unknown, id?: string, future = false) {
  const input = schema.parse(raw);
  if (
    input.useDisplayedOccupancy &&
    (input.displayedOccupancy === undefined ||
      input.displayedOccupancy > input.capacity)
  )
    throw new Error("Gösterim doluluğu kapasiteyi aşamaz.");
  const startsAt = dateAt(input.date, input.time);
  if (startsAt <= new Date())
    throw new Error("Gelecekte bir ders saati seçin.");
  if (
    input.instructorId &&
    !(await db.user.findFirst({
      where: {
        id: input.instructorId,
        isActive: true,
        role: { in: ["ADMIN", "TEACHER"] },
      },
    }))
  )
    throw new Error("Geçerli bir eğitmen seçin.");
  if (!(await db.course.findUnique({ where: { id: input.courseId } })))
    throw new Error("Ders paketi bulunamadı.");
  const fields = {
    title: input.title,
    capacity: input.capacity,
    enrollmentOpen: input.enrollmentOpen,
    instructorId: input.instructorId || null,
    adminNotes: input.adminNotes || null,
    displayedOccupancy: input.displayedOccupancy ?? null,
    useDisplayedOccupancy: input.useDisplayedOccupancy,
    timezone: LESSON_TIMEZONE,
  };
  return db.$transaction(
    async (tx) => {
      if (id) {
        const original = await tx.liveSession.findUniqueOrThrow({
          where: { id },
        });
        if (!original.availabilityEnabled)
          throw new Error("Bu ders uygunluk takviminde değil.");
        if (original.courseId !== input.courseId)
          throw new Error(
            "Mevcut dersin paketi değiştirilemez; yeni ders oluşturun.",
          );
        const ids = (
          await tx.liveSession.findMany({
            where:
              future && original.recurringSeriesId
                ? {
                    recurringSeriesId: original.recurringSeriesId,
                    startsAt: { gte: original.startsAt },
                  }
                : { id },
            orderBy: { id: "asc" },
            select: { id: true },
          })
        ).map((s) => s.id);
        const delta = startsAt.getTime() - original.startsAt.getTime();
        for (const slotId of ids) {
          const slot = await lockSlot(tx, slotId);
          if (!slot) throw new Error("Ders silinmiş; sayfayı yenileyin.");
          const actual = await tx.groupLessonEnrollment.count({
            where: { slotId, status: "ACTIVE" },
          });
          if (input.capacity < actual)
            throw new Error("Kapasite gerçek öğrenci sayısından küçük olamaz.");
          const start = new Date(slot.startsAt.getTime() + delta);
          await tx.liveSession.update({
            where: { id: slotId },
            data: {
              ...fields,
              startsAt: start,
              endsAt: new Date(start.getTime() + input.duration * 60000),
            },
          });
        }
        if (original.recurringSeriesId) {
          const last = await tx.liveSession.findFirst({
            where: { recurringSeriesId: original.recurringSeriesId },
            orderBy: { startsAt: "desc" },
          });
          if (last)
            await tx.groupLessonSeries.update({
              where: { id: original.recurringSeriesId },
              data: { repeatUntil: last.startsAt },
            });
        }
        return id;
      }
      const series =
        input.repeatWeeks > 1
          ? await tx.groupLessonSeries.create({
              data: {
                repeatUntil: addDays(startsAt, (input.repeatWeeks - 1) * 7),
              },
            })
          : null;
      let first = "";
      for (let n = 0; n < input.repeatWeeks; n++) {
        const start = addDays(startsAt, n * 7);
        const slot = await tx.liveSession.create({
          data: {
            ...fields,
            courseId: input.courseId,
            startsAt: start,
            endsAt: new Date(start.getTime() + input.duration * 60000),
            availabilityEnabled: true,
            recurringSeriesId: series?.id,
          },
        });
        first ||= slot.id;
      }
      return first;
    },
    { timeout: 15000 },
  );
}
export async function manageGroupSlot(
  id: string,
  operation: "close" | "open" | "cancel" | "duplicate" | "delete",
) {
  return db.$transaction(async (tx) => {
    const slot = await lockSlot(tx, id);
    if (!slot?.availabilityEnabled) throw new Error("Ders bulunamadı.");
    if (operation === "delete") {
      if (await tx.groupLessonEnrollment.count({ where: { slotId: id } }))
        throw new Error("Öğrenci kaydı olan ders silinemez; dersi iptal edin.");
      await tx.liveSession.delete({ where: { id } });
      return null;
    }
    if (operation === "duplicate") {
      const copy = await tx.liveSession.create({
        data: {
          courseId: slot.courseId,
          title: slot.title,
          startsAt: addDays(slot.startsAt, 7),
          endsAt: addDays(slot.endsAt, 7),
          timezone: slot.timezone,
          capacity: slot.capacity,
          availabilityEnabled: true,
          enrollmentOpen: false,
          instructorId: slot.instructorId,
          adminNotes: slot.adminNotes,
        },
      });
      return copy.id;
    }
    await tx.liveSession.update({
      where: { id },
      data:
        operation === "cancel"
          ? { cancelled: true, enrollmentOpen: false }
          : operation === "open"
            ? { cancelled: false, enrollmentOpen: true }
            : { enrollmentOpen: false },
    });
    return id;
  });
}
export async function createDemoGroupSlots(courseId: string) {
  const start = dateAt(localDate(addDays(new Date(), 1)), "18:00");
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(72819534)::text`;
    if (
      await tx.groupLessonSeries.findUnique({
        where: { id: "availability-demo" },
      })
    )
      return;
    await tx.groupLessonSeries.create({
      data: { id: "availability-demo", repeatUntil: addDays(start, 6) },
    });
    for (const [n, count] of [0, 2, 4, 7, 8, 9, 10].entries()) {
      const startsAt = addDays(start, n);
      await tx.liveSession.create({
        data: {
          title: "Grup dersi · demo",
          courseId,
          startsAt,
          endsAt: new Date(startsAt.getTime() + 3600000),
          capacity: DEFAULT_CAPACITY,
          availabilityEnabled: true,
          displayedOccupancy: count,
          useDisplayedOccupancy: true,
          recurringSeriesId: "availability-demo",
          adminNotes: "DEMO: yalnızca gösterim; gerçek öğrenci değildir.",
        },
      });
    }
  });
}
