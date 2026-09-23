import "server-only";
import { cache } from "react";
import { db, type TransactionClient } from "@/server/db";
import {
  BASLANGIC_MOCK_EXAM_LIMIT,
  DEFAULT_ACCESS_MONTHS,
  PLAN_RANK,
  addMonths,
  perkCandidatesForCourse,
  planAllows,
  type PlanFeature,
  type PlanPerkCode,
  type PlanTierCode,
} from "@/lib/plans";
import { nextPaidThrough } from "@/lib/billing";
import { createNotification } from "@/server/services/notifications.service";

export type ActivePlan = { subscriptionId: string; tier: PlanTierCode; startsAt: Date; expiresAt: Date };

/** The student's best currently-running plan (highest tier; latest expiry breaks ties). */
export const getActivePlan = cache(async (userId: string): Promise<ActivePlan | null> => {
  const now = new Date();
  const subs = await db.planSubscription.findMany({
    where: { userId, status: "ACTIVE", startsAt: { lte: now }, expiresAt: { gt: now } },
  });
  const best = subs.sort((a, b) => PLAN_RANK[b.tier] - PLAN_RANK[a.tier] || b.expiresAt.getTime() - a.expiresAt.getTime())[0];
  return best ? { subscriptionId: best.id, tier: best.tier, startsAt: best.startsAt, expiresAt: best.expiresAt } : null;
});

export type PlanAccess = {
  plan: ActivePlan | null;
  /** Teachers/admins see everything so they can review content without buying a plan. */
  isStaff: boolean;
  can: (feature: PlanFeature) => boolean;
};

export async function getPlanAccess(user: { id: string; role: string } | null): Promise<PlanAccess> {
  if (!user) return { plan: null, isStaff: false, can: () => false };
  const isStaff = user.role === "ADMIN" || user.role === "TEACHER";
  const plan = await getActivePlan(user.id);
  return { plan, isStaff, can: (feature) => isStaff || planAllows(plan?.tier, feature) };
}

/**
 * How many more Deneme Sınavları a Başlangıç student may start in the current plan period
 * (null = unlimited). Resuming an in-progress deneme never counts — only brand-new starts do.
 */
export async function remainingMockExamStarts(userId: string, access: PlanAccess): Promise<number | null> {
  if (access.can("UNLIMITED_MOCK_EXAMS")) return null;
  if (!access.plan) return 0;
  const used = await db.diagnosticAttempt.count({
    where: { userId, kind: "MOCK_EXAM", startedAt: { gte: access.plan.startsAt } },
  });
  return Math.max(0, BASLANGIC_MOCK_EXAM_LIMIT - used);
}

export function listPlanProducts() {
  return db.product.findMany({
    where: { category: "PLAN", isPublished: true, planTier: { not: null } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
}

/**
 * Called from markOrderPaid's transaction. Buying the tier you already hold extends it from its
 * current end date (no lost days); any other tier starts today and runs alongside — getActivePlan
 * always picks the highest one, so upgrading takes effect immediately.
 */
export async function grantPlanForOrderItem(
  tx: TransactionClient,
  userId: string,
  orderItem: { id: string; quantity: number },
  product: { planTier: PlanTierCode | null; accessMonths: number | null },
) {
  if (!product.planTier) return null;
  const existing = await tx.planSubscription.findUnique({ where: { orderItemId: orderItem.id } });
  if (existing) return existing;

  const now = new Date();
  const sameTier = await tx.planSubscription.findFirst({
    where: { userId, tier: product.planTier, status: "ACTIVE", expiresAt: { gt: now } },
    orderBy: { expiresAt: "desc" },
  });
  const startsAt = sameTier ? sameTier.expiresAt : now;
  const months = (product.accessMonths ?? DEFAULT_ACCESS_MONTHS[product.planTier]) * Math.max(1, orderItem.quantity);
  return tx.planSubscription.create({
    data: { userId, tier: product.planTier, orderItemId: orderItem.id, startsAt, expiresAt: addMonths(startsAt, months) },
  });
}

/** Uzman perks still unclaimed on the active plan that this course qualifies for. */
export async function availablePerkForCourse(userId: string, courseId: string): Promise<PlanPerkCode | null> {
  const plan = await getActivePlan(userId);
  if (!planAllows(plan?.tier, "LIVE_LESSON_PERKS") || !plan) return null;
  const course = await db.course.findUnique({ where: { id: courseId }, include: { product: true } });
  if (!course) return null;
  const claimed = await db.planPerkClaim.findMany({ where: { subscriptionId: plan.subscriptionId }, select: { perk: true } });
  const used = new Set(claimed.map((c) => c.perk));
  return perkCandidatesForCourse({ isSpeakingClub: course.isSpeakingClub, category: course.product.category }).find((perk) => !used.has(perk)) ?? null;
}

/** Uses one Uzman perk to grant a free, one-billing-month enrollment on a live course. */
export async function claimPerkForCourse(userId: string, courseId: string) {
  const perk = await availablePerkForCourse(userId, courseId);
  const plan = await getActivePlan(userId);
  if (!perk || !plan) throw new Error("Bu ders için kullanılabilir bir Uzman plan hakkınız bulunmuyor.");

  await db.$transaction(async (tx) => {
    await tx.planPerkClaim.create({ data: { subscriptionId: plan.subscriptionId, perk, courseId } });
    const existing = await tx.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    const paidThrough = nextPaidThrough(existing?.paidThrough ?? null);
    await tx.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { status: "ACTIVE", paidThrough, renewalNoticeSentAt: null },
      create: { userId, courseId, status: "ACTIVE", paidThrough },
    });
  });
  await createNotification(userId, {
    title: "Uzman plan hakkın kullanıldı",
    body: "Canlı dersin 1 ay boyunca ücretsiz olarak Canlı Derslerim bölümünde.",
    href: "/dashboard/live-sessions",
  });
  return perk;
}
