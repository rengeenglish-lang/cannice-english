import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { notify } from "@/server/services/notifications.service";

/**
 * "Arkadaşını davet et, ikiniz de %15 indirim kazanın". The friend gets a personal 15% coupon when
 * signing up through the invite link; the inviter gets one when that friend's first order is paid.
 * Personal coupons (ownerUserId) work only on their owner's account, once, for 90 days.
 */
export const REFERRAL_PERCENT = 15;
export const REFERRAL_COOKIE = "nf_ref";
const COUPON_DAYS = 90;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomCode = (n: number) => Array.from(randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");
export const isReferralCode = (code: unknown): code is string => typeof code === "string" && /^[A-Z2-9]{8}$/.test(code);
export const inviteUrl = (code: string) => `${getSiteUrl().replace(/\/$/, "")}/davet/${code}`;

export async function getOrCreateReferralCode(userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { referralCode: true } });
  if (user.referralCode) return user.referralCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(8);
    const claimed = await db.user.updateMany({ where: { id: userId, referralCode: null }, data: { referralCode: code } }).catch(() => ({ count: 0 }));
    if (claimed.count) return code;
    const again = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { referralCode: true } });
    if (again.referralCode) return again.referralCode;
  }
  throw new Error("Could not create a referral code");
}

async function personalCoupon(ownerUserId: string, prefix: string, description: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.coupon.create({
        data: {
          code: `${prefix}-${randomCode(6)}`,
          type: "PERCENT",
          value: REFERRAL_PERCENT,
          description,
          isActive: true,
          isPublic: false,
          maxRedemptions: 1,
          ownerUserId,
          expiresAt: new Date(Date.now() + COUPON_DAYS * 24 * 60 * 60 * 1000),
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
    }
  }
  throw new Error("Could not create a coupon code");
}

/** Right after sign-up: links the new account to its inviter and gives the welcome coupon. */
export async function applyReferral(newUserId: string, code: unknown) {
  if (!isReferralCode(code)) return null;
  const inviter = await db.user.findUnique({ where: { referralCode: code }, select: { id: true, isActive: true } });
  if (!inviter?.isActive || inviter.id === newUserId) return null;
  const linked = await db.user.updateMany({ where: { id: newUserId, referredById: null }, data: { referredById: inviter.id } });
  if (!linked.count) return null;
  const coupon = await personalCoupon(newUserId, "HOSGELDIN", "Davet indirimi (arkadaşının davetiyle)");
  await notify(newUserId, {
    category: "PURCHASE",
    key: "referral-welcome",
    title: `Davet hediyen: %${REFERRAL_PERCENT} indirim`,
    body: `Kupon kodun: ${coupon.code}. İlk siparişinde sepette kullanabilirsin (${COUPON_DAYS} gün geçerli).`,
    href: "/dashboard/davet",
  });
  return coupon;
}

/** On a paid order: the first paid order of an invited student earns the inviter a coupon, once. */
export async function rewardReferrer(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true, user: { select: { id: true, name: true, referredById: true, referralRewardedAt: true } } } });
  const friend = order?.user;
  if (order?.status !== "PAID" || !friend?.referredById || friend.referralRewardedAt) return null;
  const claimed = await db.user.updateMany({ where: { id: friend.id, referralRewardedAt: null }, data: { referralRewardedAt: new Date() } });
  if (!claimed.count) return null;
  const coupon = await personalCoupon(friend.referredById, "DAVET", `Davet ödülü (${friend.name.split(/\s+/)[0]})`);
  await notify(friend.referredById, {
    category: "PURCHASE",
    key: `referral-reward:${friend.id}`,
    title: `Davetin işe yaradı: %${REFERRAL_PERCENT} indirim kazandın!`,
    body: `${friend.name.split(/\s+/)[0]} ilk siparişini verdi. Kupon kodun: ${coupon.code} (${COUPON_DAYS} gün geçerli).`,
    href: "/dashboard/davet",
  });
  return coupon;
}

export async function referralOverview(userId: string) {
  const code = await getOrCreateReferralCode(userId);
  const [invited, rewarded, coupons] = await Promise.all([
    db.user.count({ where: { referredById: userId } }),
    db.user.count({ where: { referredById: userId, referralRewardedAt: { not: null } } }),
    db.coupon.findMany({ where: { ownerUserId: userId }, orderBy: { createdAt: "desc" } }),
  ]);
  return { code, url: inviteUrl(code), invited, rewarded, coupons };
}
