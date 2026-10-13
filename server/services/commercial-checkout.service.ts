import "server-only";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { addBillingPeriod, launchPrice } from "@/lib/commercial";
import type { CommercialKind, BillingInterval } from "@/lib/generated/prisma/client";

const inputSchema = z.object({ kind: z.enum(["PREMIUM", "GROUP"]), interval: z.enum(["MONTHLY", "QUARTERLY", "SIX_MONTH", "ANNUAL"]), cohortId: z.string().min(1).optional(), requestKey: z.string().uuid() }).strict();
async function userLock(tx: TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.isActive) throw new Error("Aktif hesap gerekli.");
  return user;
}
async function admin(tx: TransactionClient, actorId: string) {
  const actor = await tx.user.findUnique({ where: { id: actorId } });
  if (!actor?.isActive || !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Yönetici yetkisi gerekli.");
}
async function cohortLock(tx: TransactionClient, cohortId: string) {
  await tx.$queryRaw`SELECT id FROM programme_cohorts WHERE id = ${cohortId} FOR UPDATE`;
  return tx.programmeCohort.findUniqueOrThrow({ where: { id: cohortId }, include: { course: true, teacher: { select: { isActive: true } } } });
}
async function occupied(tx: TransactionClient, cohortId: string, now: Date) {
  const confirmed = await tx.cohortEnrollment.count({ where: { cohortId, status: "CONFIRMED" } });
  const reserved = await tx.seatReservation.count({ where: { cohortId, releasedAt: null, expiresAt: { gt: now } } });
  return confirmed + reserved;
}
const validPaidOrder = { status: "PAID" as const, payment: { status: "SUCCEEDED" as const } };
async function latestPeriod(tx: TransactionClient, userId: string, kind: CommercialKind, cohortId?: string) {
  return tx.orderItem.findFirst({ where: {
    purchaseType: kind === "PREMIUM" ? "PREMIUM_SUBSCRIPTION" : "GROUP_PROGRAM",
    ...(cohortId ? { cohortId } : {}), order: { ...validPaidOrder, userId },
    accessGrants: { some: { revokedAt: null } }, paidThrough: { not: null },
  }, orderBy: { paidThrough: "desc" } });
}

export async function createCommercialCheckout(userId: string, raw: unknown) {
  const input = inputSchema.parse(raw);
  launchPrice(input.kind, input.interval);
  if ((input.kind === "GROUP") !== Boolean(input.cohortId)) throw new Error("Program grubu seçimi geçersiz.");
  return db.$transaction(async (tx) => {
    await userLock(tx, userId);
    const checkoutKey = `${userId}:${input.requestKey}`;
    const duplicate = await tx.order.findUnique({ where: { checkoutKey }, include: { items: true } });
    if (duplicate) {
      if (duplicate.commercialKind !== input.kind || duplicate.items[0]?.billingInterval !== input.interval || duplicate.items[0]?.cohortId !== (input.cohortId ?? null)) throw new Error("İstek anahtarı başka bir seçim için kullanılmış.");
      return { orderId: duplicate.id };
    }
    const price = await tx.commercialPrice.findUniqueOrThrow({ where: { kind_interval: { kind: input.kind, interval: input.interval } } });
    if (!price.active || !price.checkoutEnabled) throw new Error("Bu ödeme seçeneği henüz satışa açık değil.");
    const now = new Date();
    let productId: string;
    let title: string;
    let reserve = false;
    let holdMinutes = 0;
    if (input.kind === "GROUP") {
      const cohort = await cohortLock(tx, input.cohortId!);
      const membership = await tx.cohortEnrollment.findUnique({ where: { cohortId_studentId: { cohortId: cohort.id, studentId: userId } } });
      const renewing = membership?.status === "CONFIRMED";
      if (!cohort.salesEnabled || !cohort.teacher.isActive || !cohort.course.curriculumPublishedAt || cohort.expectedEndsAt <= now || (!renewing && cohort.status !== "OPEN") || (renewing && !["OPEN", "CLOSED"].includes(cohort.status))) throw new Error("Grup bu ödeme için açık değil.");
      if (membership?.status === "CANCELLED") throw new Error("İptal edilen grup kaydı için yönetici incelemesi gerekli.");
      if (await tx.cohortEnrollment.count({ where: { studentId: userId, cohortId: { not: cohort.id }, status: "CONFIRMED", cohort: { courseId: cohort.courseId } } })) throw new Error("Bu programın başka grubuna kayıtlısınız.");
      const previous = await latestPeriod(tx, userId, input.kind, cohort.id);
      const base = new Date(Math.max(now.getTime(), previous?.paidThrough?.getTime() ?? cohort.startsAt.getTime()));
      if (addBillingPeriod(base, input.interval) > cohort.expectedEndsAt) throw new Error("Bu ödeme dönemi programın bitiş tarihini aşıyor; daha kısa dönem seçin.");
      if (!renewing && await occupied(tx, cohort.id, now) >= cohort.maximumCapacity) throw new Error("Şu anda ayrılabilir kontenjan yok. Bekleme listesini kontrol edin.");
      // A second tab must not reserve an extra seat for the same student.
      const pending = await tx.order.findFirst({ where: { userId, commercialKind: "GROUP", status: "AWAITING_PAYMENT", items: { some: { cohortId: cohort.id } }, OR: [{ reservation: { expiresAt: { gt: now }, releasedAt: null } }, { reservation: null }] } });
      if (pending) throw new Error("Bu grup için bekleyen ödeme talebiniz var; siparişlerinizden devam edin.");
      reserve = !renewing; holdMinutes = cohort.seatHoldMinutes;
      productId = cohort.course.productId; title = cohort.title;
      await tx.cohortEnrollment.upsert({ where: { cohortId_studentId: { cohortId: cohort.id, studentId: userId } }, create: { cohortId: cohort.id, studentId: userId }, update: {} });
    } else {
      // Keep the bookkeeping product out of the generic cart/catalog.
      const product = await tx.product.upsert({ where: { slug: "platform-premium-subscription" }, update: {}, create: { slug: "platform-premium-subscription", title: "Tek Premium Üyelik", category: "STUDY_PACKAGE", basePrice: 0, salePrice: 0, isPublished: false } });
      if (await tx.course.findUnique({ where: { productId: product.id } })) throw new Error("Premium ürün yapılandırması geçersiz.");
      productId = product.id; title = product.title;
    }
    const amount = (price.amountMinor / 100).toFixed(2);
    const order = await tx.order.create({ data: { userId, checkoutKey, commercialKind: input.kind, status: "AWAITING_PAYMENT", subtotal: amount, total: amount, currency: price.currency,
      items: { create: { productId, titleSnapshot: title, purchaseType: input.kind === "PREMIUM" ? "PREMIUM_SUBSCRIPTION" : "GROUP_PROGRAM", billingInterval: input.interval, cohortId: input.cohortId, unitPrice: amount, lineTotal: amount } },
      payment: { create: { provider: "MANUAL", amount, currency: price.currency, status: "PENDING" } },
      ...(reserve ? { reservation: { create: { cohortId: input.cohortId!, expiresAt: new Date(now.getTime()+holdMinutes*60000) } } } : {}),
    } });
    return { orderId: order.id };
  }, { timeout: 15000 });
}

/** Existing manual approval is the trusted payment boundary. No client success flag grants access. */
export async function approveCommercialOrder(orderId: string, actorId: string) {
  return db.$transaction(async (tx) => {
    await admin(tx, actorId);
    const initial = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (!initial.userId || !initial.commercialKind) throw new Error("Üyelik siparişi bulunamadı.");
    await userLock(tx, initial.userId);
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { payment: true, items: true, reservation: true } });
    if (order.status === "PAID" && order.payment?.status === "SUCCEEDED") return { enrolled: 0, skippedGuest: false, review: false };
    if (order.status === "PAYMENT_REVIEW") return { enrolled: 0, skippedGuest: false, review: true };
    if (order.status !== "AWAITING_PAYMENT" || order.payment?.status !== "PENDING" || order.payment.provider !== "MANUAL") throw new Error("Sipariş ödeme onayı için uygun değil.");
    if (order.items.length !== 1 || !order.payment.amount.equals(order.total) || order.payment.currency !== order.currency) throw new Error("Ödeme tutarı siparişle eşleşmiyor.");
    const item = order.items[0];
    if (!item.billingInterval || item.quantity !== 1 || !item.lineTotal.equals(order.total) || !item.unitPrice.equals(item.lineTotal) || Number(order.discountTotal) !== 0) throw new Error("Üyelik sipariş tutarı geçersiz.");
    launchPrice(order.commercialKind!, item.billingInterval);
    if (item.purchaseType !== (order.commercialKind === "GROUP" ? "GROUP_PROGRAM" : "PREMIUM_SUBSCRIPTION")) throw new Error("Satın alma türü geçersiz.");
    const now = new Date();
    const cohort = item.cohortId ? await cohortLock(tx, item.cohortId) : null;
    let reviewReason = "";
    let membership = null;
    if (order.commercialKind === "GROUP") {
      if (!cohort || cohort.course.productId !== item.productId) throw new Error("Program eşleşmesi geçersiz.");
      membership = await tx.cohortEnrollment.findUnique({ where: { cohortId_studentId: { cohortId: cohort.id, studentId: initial.userId } } });
      if (!membership || membership.status === "CANCELLED" || !["OPEN", "CLOSED"].includes(cohort.status) || !cohort.course.curriculumPublishedAt || !cohort.teacher.isActive) reviewReason = "Grup veya öğrenci kaydı artık uygun değil.";
      if (membership?.status !== "CONFIRMED" && (!order.reservation || order.reservation.releasedAt || order.reservation.expiresAt <= now)) reviewReason = "Kontenjan ayırma süresi dolmuş; ödeme incelemesi gerekli.";
      if (await tx.cohortEnrollment.count({ where: { studentId: initial.userId, cohortId: { not: cohort.id }, status: "CONFIRMED", cohort: { courseId: cohort.courseId } } })) reviewReason = "Öğrenci başka gruba kaydedilmiş.";
    } else if (cohort) throw new Error("Premium siparişinde grup olamaz.");
    const previous = await latestPeriod(tx, initial.userId, order.commercialKind!, item.cohortId ?? undefined);
    const base = new Date(Math.max(now.getTime(), previous?.paidThrough?.getTime() ?? (cohort?.startsAt.getTime() ?? now.getTime())));
    const paidThrough = addBillingPeriod(base, item.billingInterval);
    if (cohort && paidThrough > cohort.expectedEndsAt) reviewReason = "Ödeme dönemi program bitişini aşıyor.";
    const startsAt = previous?.paidThrough && previous.paidThrough > now ? previous.paidThrough : now;
    const accessExpiresAt = new Date(Math.min(paidThrough.getTime() + (cohort?.graceDays ?? 0)*86400000, cohort?.expectedEndsAt.getTime() ?? Infinity));
    await tx.payment.update({ where: { orderId }, data: { status: "SUCCEEDED", paidAt: now } });
    await tx.seatReservation.updateMany({ where: { orderId, releasedAt: null }, data: { releasedAt: now } });
    if (reviewReason) {
      await tx.order.update({ where: { id: orderId }, data: { status: "PAYMENT_REVIEW" } });
      await tx.commercialAudit.create({ data: { actorId, action: "PAYMENT_REVIEW_REQUIRED", targetId: orderId, details: { reason: reviewReason } } });
      return { enrolled: 0, skippedGuest: false, review: true };
    }
    // All writes below roll back together if the database seat guard fails.
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    await tx.orderItem.update({ where: { id: item.id }, data: { periodStartsAt: startsAt, paidThrough, accessExpiresAt } });
    if (cohort && membership) {
      const count = await tx.cohortEnrollment.count({ where: { cohortId: cohort.id, status: "CONFIRMED" } });
      await tx.cohortEnrollment.update({ where: { id: membership.id }, data: { status: "CONFIRMED", orderItemId: item.id, confirmedAt: membership.confirmedAt ?? now } });
      await tx.enrollment.upsert({ where: { userId_courseId: { userId: initial.userId, courseId: cohort.courseId } }, create: { userId: initial.userId, courseId: cohort.courseId, orderItemId: item.id, expiresAt: accessExpiresAt }, update: { status: "ACTIVE", orderItemId: item.id, expiresAt: accessExpiresAt } });
      await tx.cohortWaitlist.updateMany({ where: { cohortId: cohort.id, studentId: initial.userId, status: "WAITING" }, data: { status: "ENROLLED" } });
      if (membership.status !== "CONFIRMED" && count+1 === cohort.minimumCapacity) await tx.cohortEvent.create({ data: { cohortId: cohort.id, type: "GROUP_CONFIRMED" } });
    } else {
      await tx.membershipSubscription.create({ data: { userId: initial.userId, orderItemId: item.id, interval: item.billingInterval, startsAt, expiresAt: paidThrough } });
    }
    await tx.accessGrant.create({ data: { userId: initial.userId, orderItemId: item.id, capability: cohort ? "GROUP_FULL_ACCESS" : "PREMIUM_SIMULATIONS", startsAt, expiresAt: accessExpiresAt } });
    await tx.commercialAudit.create({ data: { actorId, action: "PAYMENT_APPROVED", targetId: orderId, details: { kind: order.commercialKind, amount: order.total.toString(), paidThrough: paidThrough.toISOString() } } });
    return { enrolled: cohort ? 1 : 0, skippedGuest: false, review: false };
  }, { timeout: 15000 });
}

/** Records confirmed manual refunds, failures or cancellation; it never initiates a bank refund. */
export async function closeCommercialOrder(actorId: string, orderId: string, rawStatus: unknown, reason: string) {
  const status = z.enum(["FAILED", "CANCELLED", "REFUNDED"]).parse(rawStatus);
  z.string().trim().min(3).max(2000).parse(reason);
  return db.$transaction(async (tx) => {
    await admin(tx, actorId);
    const initial = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (!initial.userId || !initial.commercialKind) throw new Error("Üyelik siparişi gerekli.");
    await userLock(tx, initial.userId);
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, payment: true } });
    if (order.status === status) return;
    if (status === "REFUNDED" ? !["PAID", "PAYMENT_REVIEW"].includes(order.status) || order.payment?.status !== "SUCCEEDED" : order.status !== "AWAITING_PAYMENT" || order.payment?.status !== "PENDING") throw new Error("Ödeme durumu bu işleme uygun değil.");
    const cohortIds = [...new Set(order.items.flatMap((i) => i.cohortId ? [i.cohortId] : []))].sort();
    for (const cohortId of cohortIds) await cohortLock(tx, cohortId);
    const now = new Date();
    await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.payment.update({ where: { orderId }, data: { status: status === "REFUNDED" ? "REFUNDED" : "FAILED" } });
    await tx.seatReservation.updateMany({ where: { orderId, releasedAt: null }, data: { releasedAt: now } });
    await tx.accessGrant.updateMany({ where: { orderItem: { orderId } }, data: { revokedAt: now } });
    await tx.membershipSubscription.updateMany({ where: { orderItem: { orderId } }, data: { revokedAt: now } });
    for (const cohortId of cohortIds) {
      const cohort = await tx.programmeCohort.findUniqueOrThrow({ where: { id: cohortId } });
      const latest = await tx.orderItem.findFirst({ where: { cohortId, order: { ...validPaidOrder, userId: initial.userId }, accessExpiresAt: { gt: now } }, orderBy: { accessExpiresAt: "desc" } });
      if (latest) {
        await tx.enrollment.updateMany({ where: { userId: initial.userId, courseId: cohort.courseId }, data: { orderItemId: latest.id, expiresAt: latest.accessExpiresAt } });
        await tx.cohortEnrollment.updateMany({ where: { cohortId, studentId: initial.userId, status: "CONFIRMED" }, data: { orderItemId: latest.id } });
      } else if (status === "REFUNDED") {
        await tx.enrollment.updateMany({ where: { userId: initial.userId, courseId: cohort.courseId, orderItemId: { in: order.items.map((i) => i.id) } }, data: { status: "REVOKED", expiresAt: now } });
        const removed = await tx.cohortEnrollment.updateMany({ where: { cohortId, studentId: initial.userId, status: "CONFIRMED" }, data: { status: "CANCELLED", cancelledAt: now } });
        if (removed.count) await tx.cohortEvent.create({ data: { cohortId, type: "SEAT_AVAILABLE" } });
      }
    }
    await tx.commercialAudit.create({ data: { actorId, action: `COMMERCIAL_ORDER_${status}`, targetId: orderId, details: { reason } } });
  });
}

export async function commercialOrderForUser(userId: string, orderId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.isActive) throw new Error("Aktif hesap gerekli.");
  return db.order.findFirst({ where: { id: orderId, userId, commercialKind: { not: null } }, include: { items: { include: { cohort: { select: { courseId: true, title: true } } } }, reservation: true } });
}

export async function configureCommercialSales(actorId: string, kind: CommercialKind, interval: BillingInterval, enabled: boolean) {
  launchPrice(kind, interval);
  return db.$transaction(async (tx) => {
    await admin(tx, actorId);
    if (enabled && kind === "PREMIUM" && !(await tx.learningTool.count({ where: { enabled: true, policy: "PREMIUM" } }))) throw new Error("Satıştan önce çalışan Premium araçları yapılandırılmalı.");
    await tx.commercialPrice.update({ where: { kind_interval: { kind, interval } }, data: { checkoutEnabled: enabled } });
    await tx.commercialAudit.create({ data: { actorId, targetId: `${kind}:${interval}`, action: "COMMERCIAL_SALES_CONFIGURED", details: { enabled } } });
  });
}

export async function configureCohortSales(actorId: string, cohortId: string, raw: unknown) {
  const input = z.object({ salesEnabled: z.boolean(), graceDays: z.number().int().min(0).max(30), seatHoldMinutes: z.number().int().min(5).max(10080) }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    await admin(tx, actorId);
    const cohort = await cohortLock(tx, cohortId);
    if (input.salesEnabled && (!cohort.course.curriculumPublishedAt || !cohort.teacher.isActive || !["OPEN", "CLOSED"].includes(cohort.status) || cohort.expectedEndsAt <= new Date())) throw new Error("Yayımlanmış müfredat, aktif öğretmen ve geçerli grup gerekli.");
    await tx.programmeCohort.update({ where: { id: cohortId }, data: input });
    await tx.commercialAudit.create({ data: { actorId, targetId: cohortId, action: "COHORT_SALES_CONFIGURED", details: input } });
  });
}
