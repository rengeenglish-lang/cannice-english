import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { getSetting, setSetting } from "@/server/services/settings.service";
import { notify, notifyAdmins } from "@/server/services/notifications.service";
import { headObject, presignDownload, presignUpload, r2Configured, deleteObject, getObjectRange } from "@/server/storage/r2";
import {
  REVIEW_MAX_CHARS,
  REVIEW_MIN_CHARS,
  REWARD_VALID_DAYS,
  VIDEO_MAX_BYTES,
  VIDEO_TYPES,
  VIDEO_MAX_SECONDS,
  VIDEO_USAGE_CONSENT_TEXT,
  exceedsVideoLimit,
  mp4DurationSeconds,
  normaliseVideoLink,
  rewardBlocker,
  rewardPercentFor,
  type ReviewKind,
} from "@/lib/site-reviews";
import type { ExamCode } from "@/lib/generated/prisma/enums";
import { grantEbookReviewReward, lockEbookAccount } from "@/server/services/ebook-review-reward.service";

const PROMO_KEY = "review_rewards_enabled";
const EXAM_CODES = ["IELTS", "TOEFL", "PTE", "YDS", "YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN"];

export async function reviewPromotionOn() {
  return (await getSetting(PROMO_KEY, "false")) === "true";
}

export async function setReviewPromotion(on: boolean) {
  await setSetting(PROMO_KEY, on ? "true" : "false");
}

export const videoUploadsAvailable = () => r2Configured("reviews");

/** Signed URL for the browser to upload a review video straight to R2. */
export async function createReviewVideoUpload(userId: string, contentType: string, size: number) {
  if (!videoUploadsAvailable()) throw new Error("Video yükleme henüz açık değil; bir YouTube/Instagram bağlantısı paylaşabilirsin.");
  if (!(VIDEO_TYPES as readonly string[]).includes(contentType)) throw new Error("Yalnızca MP4 veya WebM video yükleyebilirsin.");
  if (!Number.isFinite(size) || size <= 0 || size > VIDEO_MAX_BYTES) throw new Error("Video en fazla 200 MB olabilir.");
  const key = `reviews/${userId}/${Date.now()}-${randomBytes(6).toString("hex")}.${contentType === "video/webm" ? "webm" : "mp4"}`;
  return { key, url: await presignUpload("reviews", key, contentType) };
}

export type SubmitReviewInput = {
  kind: ReviewKind;
  rating: number;
  displayName: string;
  examCode?: string | null;
  body: string;
  videoKey?: string | null;
  videoLink?: string | null;
  usageConsent?: boolean;
  /** Length measured in the browser; used only when the file itself doesn't say (e.g. WebM). */
  videoSeconds?: number | null;
  /** For shared links, whose length can't be read: the learner confirms it is within the limit. */
  confirmsMaxLength?: boolean;
};

const TOO_LONG = `Video yorum en fazla ${VIDEO_MAX_SECONDS} saniye olabilir. Lütfen videonu kısaltıp tekrar yükle.`;

/** Reads the MP4 header from R2 (start, then end of the file); null when it isn't an MP4. */
async function storedVideoSeconds(key: string) {
  for (const range of ["bytes=0-1048575", "bytes=-4194304"]) {
    const seconds = mp4DurationSeconds(await getObjectRange("reviews", key, range));
    if (seconds !== null) return seconds;
  }
  return null;
}

function rewardCode() {
  return `YORUM-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Saves a review for moderation and, when due, issues its reward coupon straight away (one per kind,
 * per learner, ever). Throws with a Turkish message when the input is not acceptable.
 */
export async function submitSiteReview(user: { id: string; emailVerifiedAt: Date | null }, input: SubmitReviewInput) {
  const body = input.body.trim();
  if (input.kind !== "TEXT" && input.kind !== "VIDEO") throw new Error("Geçersiz yorum türü.");
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new Error("1 ile 5 arasında bir puan seç.");
  const displayName = input.displayName.trim().slice(0, 60);
  if (displayName.length < 2) throw new Error("Yorumda görünecek adını yaz.");
  if (input.kind === "TEXT" && body.length < REVIEW_MIN_CHARS) throw new Error(`Yorumun en az ${REVIEW_MIN_CHARS} karakter olmalı.`);
  if (body.length > REVIEW_MAX_CHARS) throw new Error(`Yorumun en fazla ${REVIEW_MAX_CHARS} karakter olabilir.`);
  const examCode = input.examCode && EXAM_CODES.includes(input.examCode) ? (input.examCode as ExamCode) : null;

  let videoKey: string | null = null;
  let videoUrl: string | null = null;
  let videoSeconds: number | null = null;
  if (input.kind === "VIDEO") {
    if (!input.usageConsent) throw new Error("Video yorum için yayın iznini onaylamalısın.");
    if (input.videoKey) {
      if (!input.videoKey.startsWith(`reviews/${user.id}/`)) throw new Error("Video bulunamadı.");
      const head = await headObject("reviews", input.videoKey);
      if (!head || head.size === 0) throw new Error("Video yüklemesi tamamlanmamış, lütfen tekrar dene.");
      if (head.size > VIDEO_MAX_BYTES) {
        await deleteObject("reviews", input.videoKey).catch(() => undefined);
        throw new Error("Video en fazla 200 MB olabilir.");
      }
      const seconds = (await storedVideoSeconds(input.videoKey).catch(() => null)) ?? (Number.isFinite(input.videoSeconds) ? Number(input.videoSeconds) : null);
      if (seconds === null || exceedsVideoLimit(seconds)) {
        await deleteObject("reviews", input.videoKey).catch(() => undefined);
        throw new Error(seconds === null ? "Videonun süresi okunamadı; lütfen MP4 olarak tekrar yükle." : TOO_LONG);
      }
      videoKey = input.videoKey;
      videoSeconds = Math.round(seconds);
    } else if (input.videoLink) {
      videoUrl = normaliseVideoLink(input.videoLink);
      if (!videoUrl) throw new Error("YouTube, Instagram, TikTok veya Google Drive bağlantısı paylaş.");
      if (!input.confirmsMaxLength) throw new Error(`Videonun ${VIDEO_MAX_SECONDS} saniyeyi geçmediğini onaylamalısın.`);
    } else throw new Error("Bir video yükle ya da video bağlantısı paylaş.");
  }

  const promotionOn = await reviewPromotionOn();
  const result = await db.$transaction(async (tx) => {
    // Lock before inserting review/coupon foreign keys, so simultaneous submissions cannot both
    // claim a reward or deadlock while upgrading a parent-row key-share lock.
    await lockEbookAccount(tx, user.id);
    const previous = await tx.siteReview.count({ where: { userId: user.id, kind: input.kind, rewardCouponId: { not: null } } });
    const blocker = rewardBlocker({ kind: input.kind, body, promotionOn, alreadyRewarded: previous > 0, emailVerified: Boolean(user.emailVerifiedAt) });
    const percent = blocker ? 0 : rewardPercentFor(input.kind, body);
    const coupon = percent
      ? await tx.coupon.create({
          data: {
            code: rewardCode(),
            type: "PERCENT",
            value: percent,
            description: `${input.kind === "VIDEO" ? "Video" : "Yazılı"} yorum ödülü — bir plan için %${percent} indirim`,
            isActive: true,
            maxRedemptions: 1,
            ownerUserId: user.id,
            appliesTo: "PLAN",
            expiresAt: new Date(Date.now() + REWARD_VALID_DAYS * 24 * 60 * 60 * 1000),
          },
        })
      : null;
    const review = await tx.siteReview.create({
      data: {
        userId: user.id,
        kind: input.kind,
        rating: input.rating,
        displayName,
        examCode,
        body,
        videoKey,
        videoUrl,
        videoSeconds,
        usageConsentText: input.kind === "VIDEO" ? VIDEO_USAGE_CONSENT_TEXT : null,
        usageConsentAt: input.kind === "VIDEO" ? new Date() : null,
        rewardCouponId: coupon?.id ?? null,
      },
    });
    const ebookReward = await grantEbookReviewReward(tx, user.id, review.id);
    return { review, coupon, ebookReward, percent, rewardMessage: blocker };
  });

  if (result.coupon) {
    await notify(user.id, {
      category: "PURCHASE",
      key: `review-reward:${result.review.id}`,
      title: `Teşekkürler! %${result.percent} plan indirimin hazır`,
      body: `Kupon kodun: ${result.coupon.code} — ${REWARD_VALID_DAYS} gün içinde dilediğin bir planda kullanabilirsin. Yorumun incelendikten sonra yayınlanacak.`,
      href: "/planlar",
    }).catch(() => null);
  }
  await notifyAdmins({ key: "admin-reviews", title: "Onay bekleyen yorum", body: `${displayName} yeni bir ${input.kind === "VIDEO" ? "video" : "yazılı"} yorum gönderdi.`, href: "/admin/yorumlar" }).catch(() => 0);
  return result;
}

export function listMySiteReviews(userId: string) {
  return db.siteReview.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function myRewardCoupons(userId: string) {
  const reviews = await db.siteReview.findMany({ where: { userId, rewardCouponId: { not: null } }, select: { rewardCouponId: true } });
  const ids = reviews.map((r) => r.rewardCouponId!);
  return ids.length ? db.coupon.findMany({ where: { id: { in: ids } } }) : [];
}

export function listSiteReviewsForAdmin(status: "PENDING" | "APPROVED" | "REJECTED") {
  return db.siteReview.findMany({
    where: { status },
    orderBy: status === "PENDING" ? { createdAt: "asc" } : { reviewedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 200,
  });
}

export function countPendingSiteReviews() {
  return db.siteReview.count({ where: { status: "PENDING" } });
}

export async function approveSiteReview(id: string, adminId: string) {
  const review = await db.siteReview.update({ where: { id }, data: { status: "APPROVED", rejectReason: null, reviewedById: adminId, reviewedAt: new Date() } });
  // A reward withdrawn by an earlier rejection comes back if the review is approved after all.
  if (review.rewardCouponId) await db.coupon.updateMany({ where: { id: review.rewardCouponId, redemptionCount: 0 }, data: { isActive: true } });
  await notify(review.userId, { category: "ACCOUNT", key: `review-status:${review.id}`, title: "Yorumun yayında 🎉", body: "Netfener hakkındaki yorumun onaylandı ve sitede yayınlandı. Teşekkürler!", href: "/yorumlar" }).catch(() => null);
  return review;
}

/** Rejects a review and withdraws its reward if the coupon hasn't been used yet. */
export async function rejectSiteReview(id: string, adminId: string, reason: string) {
  const review = await db.siteReview.update({
    where: { id },
    data: { status: "REJECTED", featured: false, rejectReason: reason.trim().slice(0, 500) || null, reviewedById: adminId, reviewedAt: new Date() },
  });
  let withdrawn = false;
  if (review.rewardCouponId) {
    withdrawn = (await db.coupon.updateMany({ where: { id: review.rewardCouponId, redemptionCount: 0 }, data: { isActive: false } })).count > 0;
  }
  await notify(review.userId, {
    category: "ACCOUNT",
    key: `review-status:${review.id}`,
    title: "Yorumun yayınlanmadı",
    body: `${review.rejectReason ? `Neden: ${review.rejectReason}. ` : ""}${withdrawn ? "Bu yoruma bağlı indirim kuponu iptal edildi. " : ""}Yeni bir yorum gönderebilirsin.`,
    href: "/dashboard/reviews",
  }).catch(() => null);
  return { review, withdrawn };
}

export function setSiteReviewFeatured(id: string, featured: boolean) {
  return db.siteReview.update({ where: { id, status: "APPROVED" }, data: { featured } });
}

/** Approved reviews for the public pages, featured first. */
export async function listPublishedSiteReviews(take = 60) {
  const reviews = await db.siteReview.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
    select: { id: true, kind: true, rating: true, displayName: true, examCode: true, body: true, videoKey: true, videoUrl: true, rewardCouponId: true, createdAt: true, ebookPromotionAccess: { select: { unlockedAt: true } } },
  });
  return reviews.map(({ ebookPromotionAccess, ...review }) => ({ ...review, ebookRewarded: Boolean(ebookPromotionAccess?.unlockedAt) }));
}

/**
 * Where a review's uploaded video can be streamed from: anyone for approved reviews, otherwise only
 * the author and staff. Null when there is nothing to show.
 */
export async function siteReviewVideoUrl(id: string, viewer: { id: string; role: string } | null) {
  const review = await db.siteReview.findUnique({ where: { id }, select: { userId: true, status: true, videoKey: true } });
  if (!review?.videoKey) return null;
  const staff = viewer && (viewer.role === "ADMIN" || viewer.role === "TEACHER");
  if (review.status !== "APPROVED" && !staff && viewer?.id !== review.userId) return null;
  return presignDownload("reviews", review.videoKey);
}
