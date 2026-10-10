import "server-only";
import { db } from "@/server/db";
import { weekStartOf } from "@/lib/coaching/time";
import { getCoachingProfile, type CoachingProfileRow } from "@/server/services/coaching/profile.service";
import { ensureWeekPlan, refreshProposals, syncTaskCompletion, todayKeyFor } from "@/server/services/coaching/plan.service";
import { syncMistakes } from "@/server/services/coaching/notebook.service";
import { ensureReports } from "@/server/services/coaching/reports.service";
import { runFollowUps } from "@/server/services/coaching/followups.service";

type User = { id: string; role: string };

/** Minimum gap between two full refreshes for one student (page loads in quick succession). */
const REFRESH_EVERY_MS = 15_000;

/**
 * Brings a student's coaching up to date from their real activity: new wrong answers into the
 * notebook, finished activities ticking plan tasks, this week's plan, due reports and plan
 * proposals. Idempotent and cheap to call on every coaching page load and from the daily cron.
 */
export async function refreshCoaching(user: User, now = new Date()): Promise<CoachingProfileRow | null> {
  const profile = await getCoachingProfile(user.id);
  if (!profile || !profile.enabled) return profile;
  const todayKey = todayKeyFor(profile, now);
  if (profile.lastSyncedAt && now.getTime() - profile.lastSyncedAt.getTime() < REFRESH_EVERY_MS) {
    await ensureWeekPlan(profile, user, weekStartOf(todayKey), todayKey);
    return profile;
  }
  await syncMistakes(user.id, profile.lastSyncedAt);
  await db.coachingProfile.update({ where: { id: profile.id }, data: { lastSyncedAt: now } });
  await ensureWeekPlan(profile, user, weekStartOf(todayKey), todayKey);
  await syncTaskCompletion(profile, todayKey);
  await ensureReports(profile, todayKey);
  await refreshProposals(profile, todayKey);
  return profile;
}

/** Refresh + follow-ups for one student; used after page responses (`after()`) and by the cron. */
export async function refreshAndNotify(user: User, now = new Date(), opts: { email?: boolean } = {}) {
  const profile = await refreshCoaching(user, now);
  if (!profile || !profile.enabled) return { sent: 0, emailed: 0 };
  return runFollowUps(user.id, todayKeyFor(profile, now), now, opts);
}

/**
 * Daily cron: enabled students, least recently refreshed first, until the time budget runs out
 * (students who visit the site are refreshed on their own visits anyway).
 */
export async function runCoachingCron(now = new Date(), limit = 500, budgetMs = 50_000) {
  const started = Date.now();
  const profiles = await db.coachingProfile.findMany({
    where: { enabled: true },
    select: { user: { select: { id: true, role: true } } },
    orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
    take: limit,
  });
  let sent = 0;
  let emailed = 0;
  let failed = 0;
  let processed = 0;
  for (const p of profiles) {
    if (Date.now() - started > budgetMs) break;
    processed += 1;
    try {
      const r = await refreshAndNotify(p.user, now, { email: true });
      sent += r.sent;
      emailed += r.emailed;
    } catch (e) {
      failed += 1;
      console.error("coaching cron failed for a student", e);
    }
  }
  return { students: processed, remaining: profiles.length - processed, sent, emailed, failed };
}

/**
 * Hourly cron for students who turned on email: delivers the time-sensitive emails (the study-time
 * reminder around each student's chosen reminder time, the weekly report once it exists) without
 * re-planning — the daily cron and page visits keep plans fresh.
 */
export async function runCoachingEmailCron(now = new Date(), limit = 1000, budgetMs = 50_000) {
  const started = Date.now();
  const profiles = await db.coachingProfile.findMany({ where: { enabled: true, notifyEmail: true }, select: { userId: true, timezone: true }, take: limit });
  let emailed = 0;
  let failed = 0;
  let processed = 0;
  for (const p of profiles) {
    if (Date.now() - started > budgetMs) break;
    processed += 1;
    try {
      emailed += (await runFollowUps(p.userId, todayKeyFor(p, now), now, { email: true })).emailed;
    } catch (e) {
      failed += 1;
      console.error("coaching email cron failed for a student", e);
    }
  }
  return { students: processed, remaining: profiles.length - processed, emailed, failed };
}
