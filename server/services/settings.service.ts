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

const SPEAKING_CLUB_KEYS = { url: "speaking_club_url", schedule: "speaking_club_schedule", note: "speaking_club_note" } as const;

/** Speaking Club: the meeting link and the schedule students see, set in Yönetim → Speaking Club. */
export async function getSpeakingClub() {
  const rows = await db.appSetting.findMany({ where: { key: { in: Object.values(SPEAKING_CLUB_KEYS) } } });
  const get = (key: string) => rows.find((r) => r.key === key)?.value?.trim() || "";
  const url = get(SPEAKING_CLUB_KEYS.url);
  return { url: /^https:\/\//i.test(url) ? url : "", schedule: get(SPEAKING_CLUB_KEYS.schedule), note: get(SPEAKING_CLUB_KEYS.note) };
}

export async function saveSpeakingClub(input: { url: string; schedule: string; note: string }) {
  await Promise.all([
    setSetting(SPEAKING_CLUB_KEYS.url, input.url),
    setSetting(SPEAKING_CLUB_KEYS.schedule, input.schedule),
    setSetting(SPEAKING_CLUB_KEYS.note, input.note),
  ]);
}
