import "server-only";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { ACTIVITY_TYPES, PROGRAMME_MINUTES, approvedProgrammePlans, curriculumReport, programmeProgress } from "@/lib/curriculum";

const text = z.string().trim().min(1).max(20000);
const title = text.max(300);
const id = z.string().min(1).max(200);
const courseInclude = {
  product: { include: { examType: true } },
  modules: { orderBy: { position: "asc" as const }, include: {
    durationBudgets: true, units: { orderBy: { position: "asc" as const } },
    lessons: { orderBy: { position: "asc" as const }, include: { activities: {
      orderBy: { position: "asc" as const }, include: { assessment: true, prerequisites: true },
    } } },
  } },
};
async function administrator(tx: TransactionClient, actorId: string) {
  const actor = await tx.user.findUnique({ where: { id: actorId } });
  if (!actor?.isActive || !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Yalnızca yönetici bu işlemi yapabilir.");
}
async function lockCourse(tx: TransactionClient, courseId: string, draftOnly = true) {
  await tx.$queryRaw`SELECT id FROM courses WHERE id = ${courseId} FOR UPDATE`;
  const course = await tx.course.findUniqueOrThrow({ where: { id: courseId } });
  if (!course.curriculumKey || course.curriculumTargetMinutes !== PROGRAMME_MINUTES) throw new Error("Yapılandırılmış program bulunamadı.");
  if (draftOnly && course.curriculumPublishedAt) throw new Error("Yayımlanmış program değiştirilemez; yeni sürüm gereklidir.");
  return course;
}
async function audit(tx: TransactionClient, actorId: string, targetId: string, action: string) {
  if (["CURRICULUM_UNIT_CREATED", "CURRICULUM_LESSON_CREATED", "CURRICULUM_ACTIVITY_SAVED"].includes(action)) {
    await tx.course.update({ where: { id: targetId }, data: { examFormatVerifiedAt: null } });
  }
  await tx.commercialAudit.create({ data: { actorId, targetId, action, details: {} } });
}

/** Explicit, administrator-only import. Never part of a production migration or the ordinary seed. */
export async function importApprovedProgrammePlans(actorId: string) {
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(25020260919::bigint)`;
    const price = await tx.commercialPrice.findUniqueOrThrow({ where: { kind_interval: { kind: "GROUP", interval: "MONTHLY" } } });
    const courseIds: string[] = [];
    for (const plan of approvedProgrammePlans) {
      const existing = await tx.course.findUnique({ where: { curriculumKey: plan.key } });
      if (existing) { courseIds.push(existing.id); continue; }
      const exam = await tx.examType.findUniqueOrThrow({ where: { code: plan.examCode } });
      const product = await tx.product.create({ data: {
        slug: `programme-${plan.key}`, title: `${plan.name} 250 Saatlik Tam Hazırlık Programı`,
        category: "PREP_GROUP", examTypeId: exam.id, isPublished: false,
        basePrice: price.amountMinor / 100, salePrice: price.amountMinor / 100,
        currency: price.currency, description: "Onaylı modül planı. Etkinlik ve kaynak eşlemesi tamamlanmadan yayımlanamaz.",
        course: { create: { curriculumKey: plan.key, curriculumTargetMinutes: PROGRAMME_MINUTES,
          syllabusSummary: plan.modules.map((m) => m.scope).join("\n"),
          modules: { create: plan.modules.map((module, position) => ({
            title: module.title, description: module.scope, position: position + 1,
            durationBudgets: { create: module.budgets },
          })) },
        } },
      }, include: { course: true } });
      courseIds.push(product.course!.id);
      await audit(tx, actorId, product.course!.id, "CURRICULUM_PLAN_IMPORTED");
    }
    return courseIds;
  }, { timeout: 30000 });
}

export async function listCurriculaForAdmin(actorId: string) {
  await administrator(db, actorId);
  const courses = await db.course.findMany({ where: { curriculumKey: { not: null } }, include: courseInclude, orderBy: { curriculumKey: "asc" } });
  return courses.map((course) => ({ ...course, report: curriculumReport(course.modules, !!course.examFormatVerifiedAt) }));
}

export async function addCurriculumUnit(actorId: string, moduleId: string, raw: unknown) {
  const input = z.object({ title, objective: text }).parse(raw);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const courseModule = await tx.courseModule.findUniqueOrThrow({ where: { id: moduleId } });
    await lockCourse(tx, courseModule.courseId);
    const last = await tx.curriculumUnit.findFirst({ where: { moduleId }, orderBy: { position: "desc" } });
    const unit = await tx.curriculumUnit.create({ data: { ...input, moduleId, position: (last?.position ?? 0) + 1 } });
    await audit(tx, actorId, courseModule.courseId, "CURRICULUM_UNIT_CREATED");
    return unit;
  });
}

export async function addCurriculumLesson(actorId: string, unitId: string, raw: unknown) {
  const input = z.object({ title, description: text }).parse(raw);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const unit = await tx.curriculumUnit.findUniqueOrThrow({ where: { id: unitId }, include: { module: true } });
    await lockCourse(tx, unit.module.courseId);
    const last = await tx.recordedLesson.findFirst({ where: { moduleId: unit.moduleId }, orderBy: { position: "desc" } });
    const lesson = await tx.recordedLesson.create({ data: { ...input, moduleId: unit.moduleId, unitId, position: (last?.position ?? 0) + 1 } });
    await audit(tx, actorId, unit.module.courseId, "CURRICULUM_LESSON_CREATED");
    return lesson;
  });
}

const activityInput = z.object({
  title, type: z.enum(ACTIVITY_TYPES), durationMinutes: z.number().int().min(1).max(480),
  instructions: text, completionCriteria: text,
  topicLessonId: id.nullable().default(null), freeResourceId: id.nullable().default(null),
  prerequisiteIds: z.array(id).max(50).default([]),
  assessment: z.object({ rubric: text, minimumScore: z.number().int().min(0).max(100).nullable().default(null) }).nullable().default(null),
});
export async function saveCurriculumActivity(actorId: string, lessonId: string, raw: unknown, activityId?: string) {
  const input = activityInput.parse(raw);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const lesson = await tx.recordedLesson.findUniqueOrThrow({ where: { id: lessonId }, include: { module: true, unit: true } });
    const course = await lockCourse(tx, lesson.module.courseId);
    if (!lesson.unit || lesson.unit.moduleId !== lesson.moduleId) throw new Error("Ders aynı modüldeki bir üniteye bağlı olmalı.");
    const product = await tx.product.findUniqueOrThrow({ where: { id: course.productId } });
    if (input.topicLessonId) {
      const resource = await tx.topicLesson.findUniqueOrThrow({ where: { id: input.topicLessonId }, include: { topic: true } });
      if (resource.topic.examTypeId !== product.examTypeId) throw new Error("Konu kaynağı program sınavına ait olmalı.");
    }
    if (input.freeResourceId) {
      const resource = await tx.freeResource.findUniqueOrThrow({ where: { id: input.freeResourceId } });
      if (resource.examTypeId && resource.examTypeId !== product.examTypeId) throw new Error("Kaynak farklı sınava ait.");
    }
    const existing = activityId ? await tx.curriculumActivity.findUniqueOrThrow({ where: { id: activityId } }) : null;
    if (existing && existing.lessonId !== lessonId) throw new Error("Etkinlik başka derse ait.");
    const last = await tx.curriculumActivity.findFirst({ where: { lessonId }, orderBy: { position: "desc" } });
    const position = existing?.position ?? (last?.position ?? 0) + 1;
    for (const prerequisiteId of new Set(input.prerequisiteIds)) {
      const prerequisite = await tx.curriculumActivity.findUniqueOrThrow({ where: { id: prerequisiteId }, include: { lesson: { include: { module: true } } } });
      const before = prerequisite.lesson.module.position < lesson.module.position ||
        (prerequisite.lesson.moduleId === lesson.moduleId && (prerequisite.lesson.position < lesson.position || (prerequisite.lessonId === lessonId && prerequisite.position < position)));
      if (prerequisite.lesson.module.courseId !== course.id || !before) throw new Error("Ön koşul aynı programda daha önce gelmeli.");
    }
    const { assessment, prerequisiteIds, ...data } = input;
    const activity = existing
      ? await tx.curriculumActivity.update({ where: { id: existing.id }, data })
      : await tx.curriculumActivity.create({ data: { ...data, lessonId, position } });
    await tx.activityAssessment.deleteMany({ where: { activityId: activity.id } });
    if (assessment) await tx.activityAssessment.create({ data: { ...assessment, activityId: activity.id } });
    await tx.activityPrerequisite.deleteMany({ where: { activityId: activity.id } });
    await tx.activityPrerequisite.createMany({ data: [...new Set(prerequisiteIds)].map((prerequisiteId) => ({ activityId: activity.id, prerequisiteId })) });
    await audit(tx, actorId, course.id, "CURRICULUM_ACTIVITY_SAVED");
    return activity;
  });
}

export async function verifyCurriculumFormat(actorId: string, courseId: string, evidence: string) {
  text.parse(evidence);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    await lockCourse(tx, courseId);
    await tx.course.update({ where: { id: courseId }, data: { examFormatVerifiedAt: new Date() } });
    await tx.commercialAudit.create({ data: { actorId, targetId: courseId, action: "CURRICULUM_FORMAT_VERIFIED", details: { evidence } } });
  });
}
export async function publishCurriculum(actorId: string, courseId: string) {
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    await lockCourse(tx, courseId);
    const course = await tx.course.findUniqueOrThrow({ where: { id: courseId }, include: courseInclude });
    const report = curriculumReport(course.modules, !!course.examFormatVerifiedAt);
    if (!report.publishable) throw new Error(`Program yayımlanamaz: ${report.issues.join(" ")}`);
    // Academic publication does not enable commercial checkout.
    await tx.course.update({ where: { id: courseId }, data: { curriculumPublishedAt: new Date() } });
    await audit(tx, actorId, courseId, "CURRICULUM_PUBLISHED");
  });
}

const completionInput = z.object({
  evidenceNote: text, submissionId: id.optional(), liveSessionId: id.optional(),
}).refine((v) => Boolean(v.submissionId) !== Boolean(v.liveSessionId), "Tam olarak bir kanıt kaynağı gerekli.");
/** Called only with an authenticated administrator ID; teacher assignment support belongs to phase 6. */
export async function verifyActivityCompletion(actorId: string, enrollmentId: string, activityId: string, raw: unknown) {
  const input = completionInput.parse(raw);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    await tx.$queryRaw`SELECT id FROM enrollments WHERE id = ${enrollmentId} FOR UPDATE`;
    const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollmentId }, include: { user: true, course: true } });
    if (!enrollment.user.isActive || enrollment.status !== "ACTIVE" || (enrollment.expiresAt && enrollment.expiresAt <= new Date())) throw new Error("Aktif program kaydı gerekli.");
    if (!enrollment.course.curriculumPublishedAt) throw new Error("Taslak programda ilerleme kaydedilemez.");
    const activity = await tx.curriculumActivity.findUniqueOrThrow({ where: { id: activityId }, include: { lesson: { include: { module: true } }, prerequisites: true, assessment: true } });
    if (activity.lesson.module.courseId !== enrollment.courseId) throw new Error("Etkinlik öğrencinin programına ait değil.");
    const existing = await tx.activityCompletion.findUnique({ where: { enrollmentId_activityId: { enrollmentId, activityId } } });
    if (existing) {
      if (existing.revokedAt) throw new Error("İptal edilen tamamlama yeniden onaylanamaz; inceleme gerekli.");
      return existing;
    }
    const prerequisiteCount = await tx.activityCompletion.count({ where: { enrollmentId, activityId: { in: activity.prerequisites.map((p) => p.prerequisiteId) }, revokedAt: null } });
    if (prerequisiteCount !== activity.prerequisites.length) throw new Error("Ön koşullar tamamlanmalı.");
    if (activity.type === "EXAM_SIMULATION") throw new Error("Sunucu tarafından doğrulanmış simülasyon sonucu gerekli; entegrasyon henüz hazır değil.");
    if (activity.type === "LIVE_INSTRUCTION") {
      if (!input.liveSessionId) throw new Error("Canlı ders için yoklama kanıtı gerekli.");
      const session = await tx.liveSession.findUniqueOrThrow({ where: { id: input.liveSessionId }, include: { bookings: { where: { studentId: enrollment.userId, status: "ACTIVE" } } } });
      if (session.courseId !== enrollment.courseId || session.cancelled || session.endsAt > new Date() || session.startsAt < enrollment.grantedAt || (session.endsAt.getTime() - session.startsAt.getTime()) / 60000 < activity.durationMinutes || (session.availabilityEnabled && !session.bookings.length)) throw new Error("Geçerli tamamlanmış ders ve öğrenci kaydı gerekli.");
      // The admin's evidenceNote attests actual attendance; scheduled time alone never grants credit.
    } else {
      if (!input.submissionId) throw new Error("Değerlendirilmiş öğrenci çalışması gerekli.");
      const submission = await tx.practiceSubmission.findUniqueOrThrow({ where: { id: input.submissionId } });
      if (submission.enrollmentId !== enrollmentId || submission.status !== "REVIEWED" || !submission.reviewedAt || !submission.studentAnswer.trim() || !submission.teacherFeedback?.trim()) throw new Error("Bu öğrenciye ait değerlendirilmiş çalışma gerekli.");
      if (!activity.assessment?.rubric.trim()) throw new Error("Değerlendirme rubriği gerekli.");
      const minimumScore = activity.assessment.minimumScore;
      if (minimumScore !== null && (submission.score === null || Number(submission.score) < minimumScore)) throw new Error("Değerlendirme eşiği karşılanmadı.");
    }
    const completion = await tx.activityCompletion.create({ data: { ...input, enrollmentId, activityId, verifiedById: actorId, creditedMinutes: activity.durationMinutes } });
    await audit(tx, actorId, completion.id, "CURRICULUM_ACTIVITY_COMPLETED");
    return completion;
  });
}
export async function revokeActivityCompletion(actorId: string, completionId: string, reason: string) {
  text.parse(reason);
  return db.$transaction(async (tx) => {
    await administrator(tx, actorId);
    const completion = await tx.activityCompletion.findUniqueOrThrow({ where: { id: completionId } });
    await tx.$queryRaw`SELECT id FROM enrollments WHERE id = ${completion.enrollmentId} FOR UPDATE`;
    const dependents = await tx.activityCompletion.count({ where: { enrollmentId: completion.enrollmentId, revokedAt: null, activity: { prerequisites: { some: { prerequisiteId: completion.activityId } } } } });
    if (dependents) throw new Error("Önce bu etkinliğe bağlı tamamlamaları inceleyin.");
    await tx.activityCompletion.update({ where: { id: completionId }, data: { revokedAt: new Date() } });
    await tx.commercialAudit.create({ data: { actorId, targetId: completionId, action: "CURRICULUM_COMPLETION_REVOKED", details: { reason } } });
  });
}
export async function getProgrammeProgress(actorId: string, enrollmentId: string) {
  const actor = await db.user.findUnique({ where: { id: actorId } });
  if (!actor?.isActive) throw new Error("Oturum gerekli.");
  const enrollment = await db.enrollment.findUniqueOrThrow({ where: { id: enrollmentId }, include: { course: { include: courseInclude }, activityCompletions: true } });
  if (actor.id !== enrollment.userId && !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Bu programa erişim yetkiniz yok.");
  if (!enrollment.course.curriculumKey) throw new Error("Yapılandırılmış program bulunamadı.");
  // History remains readable after access expires; no private activity materials are returned.
  return { ...programmeProgress(enrollment.course.modules, enrollment.activityCompletions), published: !!enrollment.course.curriculumPublishedAt };
}
