import "server-only";
import { db } from "@/server/db";

export const TRY_USD_RATE_KEY = "try_usd_rate";
/** Placeholder only — an admin must set the real rate from /admin/settings before PayPal checkout is trustworthy. */
const DEFAULT_TRY_USD_RATE = "0.024";

export async function getSetting(key: string, fallback: string) {
  const row = await db.appSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  return db.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export async function getTryToUsdRate() {
  const raw = await getSetting(TRY_USD_RATE_KEY, DEFAULT_TRY_USD_RATE);
  const rate = Number(raw);
  return Number.isFinite(rate) && rate > 0 ? rate : Number(DEFAULT_TRY_USD_RATE);
}

export function convertTryToUsd(tryAmount: number, rate: number) {
  return Math.max(0.5, Math.round(tryAmount * rate * 100) / 100);
}
