import "server-only";
import { db } from "@/server/db";

/**
 * Counts one page view against today's (Europe/Istanbul) visit row — a single upsert, run from
 * after() so it never delays the page. Feeds İlerleme Raporu → Site Ziyaret Sıklığı.
 */
export async function recordVisit(userId: string) {
  await db.$executeRaw`
    INSERT INTO user_visits (id, "userId", day, "pageViews", "lastSeen")
    VALUES (${crypto.randomUUID()}, ${userId}, (now() AT TIME ZONE 'Europe/Istanbul')::date, 1, now())
    ON CONFLICT ("userId", day) DO UPDATE SET "pageViews" = user_visits."pageViews" + 1, "lastSeen" = now()
  `.catch(() => undefined);
}

export function listVisits(userId: string, since: Date) {
  return db.userVisit.findMany({ where: { userId, day: { gte: since } }, orderBy: { day: "desc" } });
}
