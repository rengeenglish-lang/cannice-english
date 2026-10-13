import "server-only";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { cohortAvailability } from "@/lib/cohorts";
import type { ExamCode } from "@/lib/generated/prisma/client";

async function activeUser(tx: TransactionClient, actorId: string) {
  const actor = await tx.user.findUnique({ where: { id: actorId } });
  if (!actor?.isActive) throw new Error("Aktif hesap gerekli.");
  return actor;
}
async function administrator(tx: TransactionClient, actorId: string) {
  const actor = await activeUser(tx, actorId);
  if (!["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Yönetici yetkisi gerekli.");
}
async function lockCohort(tx: TransactionClient, cohortId: string) {
  await tx.$queryRaw`SELECT id FROM programme_cohorts WHERE id = ${cohortId} FOR UPDATE`;
  return tx.programmeCohort.findUniqueOrThrow({ where: { id: cohortId }, include: { course: true } });
}
async function countSeats(tx: TransactionClient, cohortId: string) {
  return tx.cohortEnrollment.count({ where: { cohortId, status: "CONFIRMED" } });
}
async function audit(tx: TransactionClient, actorId: string, cohortId: string, action: string) {
  await tx.commercialAudit.create({ data: { actorId, targetId: cohortId, action, details: {} } });
}
function requireOpen(cohort: Awaited<ReturnType<typeof lockCohort>>) {
  if (cohort.status !== "OPEN" || !cohort.course.curriculumPublishedAt || cohort.expectedEndsAt <= new Date()) throw new Error("Grup kayda açık değil.");
}
const scheduleInput = z.object({ weekday: z.number().int().min(1).max(7), startMinute: z.number().int().min(0).max(1439), endMinute: z.number().int().min(1).max(1440) }).refine((s) => s.endMinute > s.startMinute, "Ders bitişi başlangıçtan sonra olmalı.");
const cohortInput = z.object({
  courseId: z.string().min(1), teacherId: z.string().min(1), title: z.string().trim().min(2).max(160),
  startsAt: z.coerce.date(), expectedEndsAt: z.coerce.date(),
  timezone: z.string().refine((v) => { try { new Intl.DateTimeFormat("en", { timeZone: v }); return true; } catch { return false; } }, "Geçerli saat dilimi gerekli.").default("Europe/Istanbul"),
  minimumCapacity: z.number().int().min(1).max(200).default(5), maximumCapacity: z.number().int().min(1).max(200).default(10),
  schedule: z.array(scheduleInput).min(1).max(14),
}).refine((c) => c.maximumCapacity >= c.minimumCapacity && c.expectedEndsAt > c.startsAt, "Kapasite veya program tarihleri geçersiz.");
export async function createCohort(actorId: string, raw: unknown) {
  const input = cohortInput.parse(raw);
  for (let i = 0; i < input.schedule.length; i++) for (let j = i + 1; j < input.schedule.length; j++) {
    const a = input.schedule[i], b = input.schedule[j];
    if (a.weekday === b.weekday && a.startMinute < b.endMinute && b.startMinute < a.endMinute) throw new Error("Ders saatleri çakışıyor.");
  }
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const teacher = await activeUser(tx, input.teacherId);
    if (!["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(teacher.role)) throw new Error("Geçerli öğretmen gerekli.");
    const course = await tx.course.findUniqueOrThrow({ where: { id: input.courseId } });
    if (!course.curriculumKey) throw new Error("Yapılandırılmış program gerekli.");
    const { schedule, ...data } = input;
    const cohort = await tx.programmeCohort.create({ data: { ...data, schedule: { create: schedule } } });
    await audit(tx, actorId, cohort.id, "COHORT_CREATED");
    return cohort;
  });
}
export async function changeCohortCapacity(actorId: string, cohortId: string, minimumCapacity: number, maximumCapacity: number) {
  z.number().int().min(1).max(200).parse(minimumCapacity);
  z.number().int().min(minimumCapacity).max(200).parse(maximumCapacity);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    await lockCohort(tx, cohortId);
    const confirmed = await countSeats(tx, cohortId);
    if (maximumCapacity < confirmed) throw new Error("Kapasite onaylı öğrenci sayısından küçük olamaz.");
    const cohort = await tx.programmeCohort.update({ where: { id: cohortId }, data: { minimumCapacity, maximumCapacity } });
    await audit(tx, actorId, cohortId, "COHORT_CAPACITY_CHANGED");
    return cohort;
  });
}
export async function changeCohortStatus(actorId: string, cohortId: string, raw: unknown) {
  const status = z.enum(["OPEN", "CLOSED", "CANCELLED", "ARCHIVED"]).parse(raw);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const cohort = await lockCohort(tx, cohortId);
    if (["CANCELLED", "ARCHIVED"].includes(cohort.status)) throw new Error("İptal veya arşivlenmiş grup yeniden açılamaz.");
    if (status === "OPEN" && (!cohort.course.curriculumPublishedAt || cohort.expectedEndsAt <= new Date())) throw new Error("Yayımlanmış müfredat ve geçerli tarihler gerekli.");
    if (["CANCELLED", "ARCHIVED"].includes(status) && await countSeats(tx, cohortId)) throw new Error("Önce onaylı öğrenci kayıtlarını ve ödeme durumlarını yönetin.");
    await tx.programmeCohort.update({ where: { id: cohortId }, data: { status } });
    if (["CANCELLED", "ARCHIVED"].includes(status)) {
      await tx.cohortEnrollment.updateMany({ where: { cohortId, status: "PENDING" }, data: { status: "CANCELLED", cancelledAt: new Date() } });
      await tx.cohortWaitlist.updateMany({ where: { cohortId, status: "WAITING" }, data: { status: "CANCELLED" } });
    }
    await audit(tx, actorId, cohortId, `COHORT_${status}`);
  });
}

/** Registration expresses interest; it grants neither a seat nor learning access. */
export async function requestCohortEnrollment(studentId: string, cohortId: string) {
  return db.$transaction(async (tx) => {
    await activeUser(tx, studentId);
    const cohort = await lockCohort(tx, cohortId);
    requireOpen(cohort);
    const existing = await tx.cohortEnrollment.findUnique({ where: { cohortId_studentId: { cohortId, studentId } } });
    if (existing?.status === "CONFIRMED") return existing;
    if (await countSeats(tx, cohortId) >= cohort.maximumCapacity) throw new Error("Kontenjan doldu. Bekleme listesine katılın.");
    if (existing?.status === "CANCELLED") throw new Error("İptal edilmiş kayıt için yönetici incelemesi gerekli.");
    return tx.cohortEnrollment.upsert({ where: { cohortId_studentId: { cohortId, studentId } }, create: { cohortId, studentId }, update: {} });
  });
}

/** Phase 4 must call seat confirmation within its payment transaction, before granting access.
 * This phase's admin path consumes only an already successful, matching supported payment.
 * Lock order for future checkout: order -> cohort -> academic enrollment.
 */
export async function confirmPaidCohortEnrollment(actorId: string, cohortId: string, studentId: string, orderItemId: string) {
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    await activeUser(tx, studentId);
    const item = await tx.orderItem.findUniqueOrThrow({ where: { id: orderItemId } });
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${item.orderId} FOR UPDATE`;
    const cohort = await lockCohort(tx, cohortId);
    const order = await tx.order.findUniqueOrThrow({ where: { id: item.orderId }, include: { payment: true } });
    if (order.userId !== studentId || item.productId !== cohort.course.productId || item.quantity !== 1 || order.status !== "PAID" || order.payment?.status !== "SUCCEEDED" || !order.payment.paidAt || !order.payment.amount.equals(order.total) || order.payment.currency !== order.currency) throw new Error("Bu öğrenci ve program için doğrulanmış başarılı ödeme gerekli.");
    const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: studentId, courseId: cohort.courseId } } });
    await tx.$queryRaw`SELECT id FROM enrollments WHERE id = ${enrollment.id} FOR UPDATE`;
    const access = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollment.id } });
    if (access.status !== "ACTIVE" || access.orderItemId !== orderItemId || (access.expiresAt && access.expiresAt <= new Date())) throw new Error("Ödemeye bağlı aktif program kaydı gerekli.");
    const existing = await tx.cohortEnrollment.findUnique({ where: { cohortId_studentId: { cohortId, studentId } } });
    if (existing?.status === "CONFIRMED" && existing.orderItemId === orderItemId) return existing;
    requireOpen(cohort);
    if (existing?.status !== "PENDING") throw new Error("Bekleyen grup kaydı gerekli.");
    if (await tx.cohortEnrollment.count({ where: { studentId, status: "CONFIRMED", cohort: { courseId: cohort.courseId } } })) throw new Error("Öğrenci bu programın başka grubuna kayıtlı.");
    const count = await countSeats(tx, cohortId);
    if (count >= cohort.maximumCapacity) throw new Error("Kontenjan doldu; ödeme incelemesi veya uygun gruba taşıma gerekli.");
    const confirmed = await tx.cohortEnrollment.update({ where: { id: existing.id }, data: { status: "CONFIRMED", orderItemId, confirmedAt: new Date() } });
    await tx.cohortWaitlist.updateMany({ where: { cohortId, studentId, status: "WAITING" }, data: { status: "ENROLLED" } });
    if (count + 1 === cohort.minimumCapacity) await tx.cohortEvent.create({ data: { cohortId, type: "GROUP_CONFIRMED" } });
    await audit(tx, actorId, cohortId, "COHORT_ENROLLMENT_CONFIRMED");
    return confirmed;
  });
}
export async function cancelCohortEnrollment(actorId: string, cohortId: string, studentId: string) {
  return db.$transaction(async (tx) => {
    const actor = await activeUser(tx, actorId);
    const cohort = await lockCohort(tx, cohortId);
    const membership = await tx.cohortEnrollment.findUniqueOrThrow({ where: { cohortId_studentId: { cohortId, studentId } } });
    if (actorId !== studentId && !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Bu kayıt için yetkiniz yok.");
    if (membership.status === "CONFIRMED" && !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Ücretli kaydın iptali için yönetici incelemesi gerekli.");
    if (membership.status === "CANCELLED") return;
    await tx.cohortEnrollment.update({ where: { id: membership.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    await tx.cohortWaitlist.updateMany({ where: { cohortId, studentId, status: "WAITING" }, data: { status: "CANCELLED" } });
    if (membership.status === "CONFIRMED" && cohort.status === "OPEN") await tx.cohortEvent.create({ data: { cohortId, type: "SEAT_AVAILABLE" } });
    await audit(tx, actorId, cohortId, "COHORT_ENROLLMENT_CANCELLED");
    // No automatic refund or deletion of academic history. Payment reconciliation is phase 4.
  });
}
export async function joinCohortWaitlist(studentId: string, cohortId: string) {
  return db.$transaction(async (tx) => {
    await activeUser(tx, studentId);
    const cohort = await lockCohort(tx, cohortId);
    requireOpen(cohort);
    const membership = await tx.cohortEnrollment.findUnique({ where: { cohortId_studentId: { cohortId, studentId } } });
    if (membership?.status === "CONFIRMED") throw new Error("Zaten bu gruba kayıtlısınız.");
    const existing = await tx.cohortWaitlist.findUnique({ where: { cohortId_studentId: { cohortId, studentId } } });
    if (existing?.status === "WAITING") return existing;
    if (await countSeats(tx, cohortId) < cohort.maximumCapacity) throw new Error("Kontenjan açık; normal kayıt yolunu kullanın.");
    return tx.cohortWaitlist.upsert({ where: { cohortId_studentId: { cohortId, studentId } }, create: { cohortId, studentId }, update: { status: "WAITING", joinedAt: new Date() } });
  });
}
export async function leaveCohortWaitlist(studentId: string, cohortId: string) {
  return db.$transaction(async (tx) => {
    await activeUser(tx, studentId);
    await lockCohort(tx, cohortId);
    await tx.cohortWaitlist.updateMany({ where: { cohortId, studentId, status: "WAITING" }, data: { status: "CANCELLED" } });
  });
}
export async function listProgrammeCohorts(examCode?: ExamCode) {
  const cohorts = await db.programmeCohort.findMany({
    where: { status: "OPEN", expectedEndsAt: { gt: new Date() }, teacher: { isActive: true }, course: { curriculumPublishedAt: { not: null }, ...(examCode ? { product: { examType: { code: examCode } } } : {}) } },
    select: { id: true, title: true, startsAt: true, expectedEndsAt: true, timezone: true, minimumCapacity: true, maximumCapacity: true, status: true,
      teacher: { select: { id: true, name: true } }, course: { select: { id: true, curriculumTargetMinutes: true, product: { select: { title: true, examType: { select: { code: true, name: true } } } } } },
      schedule: { orderBy: [{ weekday: "asc" }, { startMinute: "asc" }] }, _count: { select: { enrollments: { where: { status: "CONFIRMED" } } } } },
    orderBy: { startsAt: "asc" }, take: 100,
  });
  return cohorts.map(({ _count, ...cohort }) => ({ ...cohort, availability: cohortAvailability(cohort, _count.enrollments) }));
}
export async function getCohortRoster(actorId: string, cohortId: string) {
  const actor = await activeUser(db, actorId);
  const cohort = await db.programmeCohort.findUniqueOrThrow({ where: { id: cohortId }, select: { teacherId: true } });
  if (!["ADMIN", "SUPER_ADMIN"].includes(actor.role) && !(actor.role === "TEACHER" && cohort.teacherId === actor.id)) throw new Error("Bu gruba atanmış öğretmen veya yönetici olmalısınız.");
  const enrollments = await db.cohortEnrollment.findMany({ where: { cohortId }, select: { id: true, status: true, requestedAt: true, confirmedAt: true, student: { select: { id: true, name: true } } }, orderBy: { requestedAt: "asc" } });
  return { enrollments, confirmed: enrollments.filter((e) => e.status === "CONFIRMED").length, pending: enrollments.filter((e) => e.status === "PENDING").length, cancelled: enrollments.filter((e) => e.status === "CANCELLED").length };
}
export async function getCohortWaitlist(actorId: string, cohortId: string) {
  await administrator(db, actorId);
  return db.cohortWaitlist.findMany({ where: { cohortId, status: "WAITING", student: { isActive: true } }, select: { id: true, studentId: true, joinedAt: true }, orderBy: [{ joinedAt: "asc" }, { id: "asc" }] });
}


export async function attachCohortSession(actorId: string, cohortId: string, sessionId: string) {
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const cohort = await lockCohort(tx, cohortId);
    if (["CANCELLED", "ARCHIVED"].includes(cohort.status)) throw new Error("Bu gruba ders eklenemez.");
    await tx.$queryRaw`SELECT id FROM live_sessions WHERE id = ${sessionId} FOR UPDATE`;
    const session = await tx.liveSession.findUniqueOrThrow({ where: { id: sessionId } });
    if (session.courseId !== cohort.courseId || (session.cohortId && session.cohortId !== cohortId) || session.startsAt < cohort.startsAt || session.endsAt > cohort.expectedEndsAt) throw new Error("Ders program ve grup tarihleriyle eşleşmeli.");
    if (await tx.groupLessonEnrollment.count({ where: { slotId: sessionId } })) throw new Error("Bireysel rezervasyon geçmişi olan ders gruba taşınamaz.");
    await tx.liveSession.update({ where: { id: sessionId }, data: { cohortId, availabilityEnabled: false, enrollmentOpen: false, instructorId: cohort.teacherId, timezone: cohort.timezone } });
    await audit(tx, actorId, cohortId, "COHORT_SESSION_ATTACHED");
  });
}
