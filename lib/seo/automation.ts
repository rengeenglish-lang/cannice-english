import { z } from "zod";

export const AUTOMATION_KEY = "seo_automation_v1";
export const automationSchema = z
  .object({
    emergencyStop: z.boolean(),
    /** Scheduled, read-only data jobs (Search Console sync, inventory refresh). Never creates or publishes content. */
    autoSync: z.boolean(),
  })
  .strict();
export const automationEnvelopeSchema = z
  .object({ revision: z.number().int().min(0), state: automationSchema })
  .strict();
export type AutomationState = z.infer<typeof automationSchema>;
export const DEFAULT_AUTOMATION: AutomationState = { emergencyStop: false, autoSync: false };

export const JOB_TYPES = ["SEARCH_SYNC", "INVENTORY_REFRESH"] as const;
export type JobType = (typeof JOB_TYPES)[number];
export const JOB_LABELS: Record<string, string> = {
  SEARCH_SYNC: "Search Console eşitleme",
  INVENTORY_REFRESH: "İçerik envanteri taraması",
};
export const STATUS_LABELS: Record<string, string> = {
  QUEUED: "Sırada",
  RUNNING: "Çalışıyor",
  SUCCEEDED: "Tamamlandı",
  FAILED: "Başarısız",
  CANCELLED: "İptal edildi",
};
export const STALE_LOCK_MS = 10 * 60_000;

/** 5 min, 30 min, 3 h … capped at 6 h. */
export function backoffMs(attempt: number) {
  return Math.min(5 * 60_000 * 6 ** Math.max(0, attempt - 1), 6 * 3_600_000);
}

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
/** Search Console data lags ~3 days: the newest complete 28-day window ends 3 days ago, plus the 28 days before it. */
export function syncWindows(now: Date) {
  const end = Math.floor(now.getTime() / DAY) * DAY - 3 * DAY;
  const start = end - 27 * DAY;
  return [
    { start: iso(start), end: iso(end) },
    { start: iso(start - 28 * DAY), end: iso(start - DAY) },
  ];
}
/** Monday-based ISO-ish week key (UTC), used to run weekly jobs once per week. */
export function weekKey(now: Date) {
  const day = Math.floor(now.getTime() / DAY);
  return iso((day - ((day + 3) % 7)) * DAY);
}
export const syncDedupeKey = (kind: string, period: { start: string; end: string }) => `SEARCH_SYNC:${kind}:${period.start}:${period.end}`;
export const inventoryDedupeKey = (now: Date) => `INVENTORY_REFRESH:${weekKey(now)}`;
