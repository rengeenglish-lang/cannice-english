import "server-only";
import { db, type TransactionClient } from "@/server/db";
import { isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";
import { EBOOK_REVIEW_TRIAL_DAYS, EBOOK_REVIEW_TRIAL_TIER, type EbookPromotionState } from "@/lib/ebook-review-reward";

const withTrial = { trialSubscription: { select: { expiresAt: true } } } as const;

export async function lockEbookAccount(tx: TransactionClient, userId: string) {
  // Lock the account even before its first claim exists: two concurrent book requests cannot both win.
  const users = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "users" WHERE "id" = ${userId} AND "isActive" = true FOR UPDATE`;
  if (!users.length) throw new Error("Devam etmek için aktif hesabına giriş yap.");
  return tx.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, emailVerifiedAt: true } });
}

/** The review may still be pending publication. A low rating earns exactly the same reward. */
export async function grantEbookReviewReward(tx: TransactionClient, userId: string, reviewId: string) {
  if (!isEbookFreePromoActive()) return null;
  const user = await lockEbookAccount(tx, userId);
  if (!user.emailVerifiedAt) return null;
  const existing = await tx.ebookPromotionAccess.findUnique({ where: { userId }, include: withTrial });
  if (existing?.unlockedAt) return existing;
  const review = await tx.siteReview.findFirst({ where: { id: reviewId, userId, status: { in: ["PENDING", "APPROVED"] } }, select: { id: true } });
  if (!review) return null;
  const now = new Date();
  const trial = await tx.planSubscription.create({ data: {
    userId, tier: EBOOK_REVIEW_TRIAL_TIER, startsAt: now,
    expiresAt: new Date(now.getTime() + EBOOK_REVIEW_TRIAL_DAYS * 86400000),
  } });
  const reward = { reviewId, unlockedAt: now, trialSubscriptionId: trial.id };
  return tx.ebookPromotionAccess.upsert({ where: { userId }, create: { userId, ...reward }, update: reward, include: withTrial });
}

/** Existing eligible reviews count too; recognising one grants the same one-time reward. */
export async function getEbookPromotionState(userId: string): Promise<EbookPromotionState> {
  let access = await db.ebookPromotionAccess.findUnique({ where: { userId }, include: withTrial });
  if (!access?.unlockedAt && isEbookFreePromoActive()) {
    const review = await db.siteReview.findFirst({ where: { userId, status: { in: ["PENDING", "APPROVED"] } }, orderBy: { createdAt: "asc" }, select: { id: true } });
    if (review) access = await db.$transaction(tx => grantEbookReviewReward(tx, userId, review.id));
  }
  return {
    firstBookSlug: access?.firstBookSlug ?? null,
    reviewUnlocked: Boolean(access?.unlockedAt),
    trialEndsAt: access?.trialSubscription?.expiresAt.toISOString() ?? null,
  };
}

/** Called only by an explicit download POST. Re-downloading the chosen first book is always allowed. */
export async function reserveFirstPromotionalBook(userId: string, slug: string): Promise<boolean> {
  return db.$transaction(async tx => {
    const user = await lockEbookAccount(tx, userId);
    if (!user.emailVerifiedAt) return false;
    if (!isEbookFreePromoActive()) return false;
    let access = await tx.ebookPromotionAccess.findUnique({ where: { userId } });
    if (!access?.unlockedAt) {
      const review = await tx.siteReview.findFirst({ where: { userId, status: { in: ["PENDING", "APPROVED"] } }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (review) access = await grantEbookReviewReward(tx, userId, review.id);
    }
    if (access?.unlockedAt || access?.firstBookSlug === slug) return true;
    if (access?.firstBookSlug) return false;
    const first = { firstBookSlug: slug, firstDownloadedAt: new Date() };
    await tx.ebookPromotionAccess.upsert({ where: { userId }, create: { userId, ...first }, update: first });
    return true;
  });
}
