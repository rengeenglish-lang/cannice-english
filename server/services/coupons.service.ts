import "server-only";
import { db } from "@/server/db";
import { couponSchema } from "@/lib/validation/admin-coupons";
import type { z } from "zod";

export function listCouponsForAdmin() {
  return db.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export function getCoupon(id: string) {
  return db.coupon.findUnique({ where: { id } });
}

export function listPublicActiveCoupons() {
  return db.coupon.findMany({
    where: {
      isActive: true,
      isPublic: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

function toData(input: z.infer<typeof couponSchema>) {
  return {
    code: input.code.toUpperCase(),
    type: input.type,
    value: input.value,
    description: input.description || null,
    isActive: input.isActive,
    isPublic: input.isPublic,
    minOrderAmount: input.minOrderAmount === "" || input.minOrderAmount === undefined ? null : input.minOrderAmount,
    maxRedemptions: input.maxRedemptions === "" || input.maxRedemptions === undefined ? null : Number(input.maxRedemptions),
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  };
}

export async function createCoupon(raw: Record<string, unknown>) {
  const input = couponSchema.parse(raw);
  return db.coupon.create({ data: toData(input) });
}

export async function updateCoupon(id: string, raw: Record<string, unknown>) {
  const input = couponSchema.parse(raw);
  return db.coupon.update({ where: { id }, data: toData(input) });
}

export async function deleteCoupon(id: string) {
  return db.coupon.delete({ where: { id } });
}

export type CouponValidationResult =
  | { ok: true; coupon: { id: string; code: string; type: "PERCENT" | "FIXED"; value: number }; discount: number }
  | { ok: false; message: string };

export async function validateCouponForOrder(code: string, subtotal: number): Promise<CouponValidationResult> {
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) return { ok: false, message: "Kupon kodu geçersiz." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, message: "Bu kuponun süresi doldu." };
  if (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions) return { ok: false, message: "Bu kuponun kullanım limiti doldu." };
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return { ok: false, message: `Bu kupon en az ${Number(coupon.minOrderAmount)} TL'lik siparişlerde geçerli.` };
  }
  const discount = coupon.type === "PERCENT" ? Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100 : Math.min(Number(coupon.value), subtotal);
  return { ok: true, coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: Number(coupon.value) }, discount };
}

export async function redeemCoupon(couponId: string) {
  return db.coupon.update({ where: { id: couponId }, data: { redemptionCount: { increment: 1 } } });
}
