import "server-only";
import { db } from "@/server/db";
import { decideFollowUps, ESSENTIAL, IGNORE_THRESHOLD, type FollowUpCandidate } from "@/lib/coaching/followups";
import { coachingCopy, pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import { addDays, dayKeyToDate, isoWeekday, localDayRange, localTime, minutesOfDay, weekStartOf } from "@/lib/coaching/time";
import { countDueVocab } from "@/server/services/coaching/vocab.service";
import { countDueMistakes } from "@/server/services/coaching/notebook.service";
import type { CoachingProfileRow } from "@/server/services/coaching/profile.service";

const DASH = "/dashboard/kocluk";
/** Non-essential reminders per local day, so a burst of due items never becomes a burst of notifications. */
const DAILY_CAP = 2;
const INACTIVE_DAYS = 4;

/** Consecutive most-recent coaching notifications the student hasn't opened. */
export async function ignoredInARow(userId: string) {
  const logs = await db.coachingNotificationLog.findMany({
    where: { userId, status: "SENT", notificationId: { not: null } },
    orderBy: { createdAt: "desc" },
    take: IGNORE_THRESHOLD + 2,
    select: { notificationId: true },
  });
  if (!logs.length) return 0;
  const notes = await db.notification.findMany({ where: { id: { in: logs.map((l) => l.notificationId!) } }, select: { id: true, isRead: true } });
  const read = new Map(notes.map((n) => [n.id, n.isRead]));
  let n = 0;
  // A notification the student deleted counts as seen.
  for (const l of logs) {
    if (read.get(l.notificationId!) === false) n += 1;
    else break;
  }
  return n;
}

/**
 * What the student could usefully be reminded of right now. Every candidate carries a dedupe
 * key scoped to its day, week or item, so running this many times a day sends each reminder once.
 */
export async function buildCandidates(profile: CoachingProfileRow, todayKey: string, now: Date, ignored: number): Promise<FollowUpCandidate[]> {
  const userId = profile.userId;
  const t = coachingCopy(profile.locale);
  const out: FollowUpCandidate[] = [];
  const weekStart = weekStartOf(todayKey);
  const yesterday = addDays(todayKey, -1);

  const [today, yesterdayOpen, weekTasks] = await Promise.all([
    db.studyTask.findMany({ where: { userId, date: dayKeyToDate(todayKey) }, orderBy: { position: "asc" } }),
    db.studyTask.count({ where: { userId, date: dayKeyToDate(yesterday), status: "PLANNED" } }),
    db.studyTask.findMany({ where: { userId, date: { gte: dayKeyToDate(weekStart), lt: dayKeyToDate(addDays(weekStart, 7)) } }, select: { status: true, skill: true, skipReason: true } }),
  ]);
  const todayOpen = today.filter((x) => x.status === "PLANNED");

  // Mock scheduled today (essential: needs a quiet block of time).
  const mock = todayOpen.find((x) => x.kind === "MOCK");
  if (mock) out.push({ kind: "MOCK_SCHEDULED", dedupeKey: `mock:${mock.id}`, title: t.notify.mock(mock.title), href: DASH });

  // Today's session is ready (sent once the morning quiet hours end).
  if (todayOpen.length) {
    const minutes = todayOpen.reduce((n, x) => n + x.minutes, 0);
    const onlyVocab = todayOpen.every((x) => x.kind === "VOCAB_REVIEW");
    out.push({
      kind: "SESSION_TODAY",
      dedupeKey: `session:${todayKey}`,
      title: onlyVocab ? t.notify.sessionTodayVocab(minutes) : t.notify.sessionToday(minutes, todayOpen[0].title),
      href: DASH,
    });
    // Study time approaching: within the hour before the student's chosen reminder time.
    const local = minutesOfDay(localTime(now, profile.timezone));
    const reminder = minutesOfDay(profile.reminderTime);
    if (local >= reminder - 60 && local <= reminder + 60) out.push({ kind: "SESSION_SOON", dedupeKey: `soon:${todayKey}`, title: t.notify.sessionSoon, href: DASH });
  }

  // Missed yesterday (only if yesterday was a study day with open tasks).
  if (yesterdayOpen && profile.studyDays.includes(isoWeekday(yesterday))) {
    out.push({ kind: "MISSED", dedupeKey: `missed:${yesterday}`, title: t.notify.missed(yesterdayOpen), href: DASH });
  }

  // Inactive for several days — gentle restart, at most once a week.
  const since = localDayRange(addDays(todayKey, -INACTIVE_DAYS), profile.timezone).start;
  if (profile.createdAt < since) {
    const [doneRecently, attemptsRecently, reviewsRecently] = await Promise.all([
      db.studyTask.count({ where: { userId, status: "DONE", completedAt: { gte: since } } }),
      db.diagnosticAttempt.count({ where: { userId, OR: [{ startedAt: { gte: since } }, { completedAt: { gte: since } }] } }),
      db.vocabCard.count({ where: { userId, lastReviewedAt: { gte: since } } }),
    ]);
    if (!doneRecently && !attemptsRecently && !reviewsRecently) out.push({ kind: "INACTIVE", dedupeKey: `inactive:${weekStart}`, title: t.notify.inactive, href: "/dashboard/kocluk/kelime" });
  }

  // Due reviews — only when today's plan doesn't already include them.
  const [vocabDue, mistakesDue] = await Promise.all([countDueVocab(userId, now), countDueMistakes(userId, now)]);
  if (vocabDue >= 5 && !todayOpen.some((x) => x.kind === "VOCAB_REVIEW")) out.push({ kind: "VOCAB_DUE", dedupeKey: `vocab:${todayKey}`, title: t.notify.vocabDue(vocabDue), href: "/dashboard/kocluk/kelime" });
  if (mistakesDue >= 3 && !todayOpen.some((x) => x.kind === "MISTAKE_REVIEW")) out.push({ kind: "MISTAKE_DUE", dedupeKey: `mistake:${todayKey}`, title: t.notify.mistakeDue(mistakesDue), href: "/dashboard/kocluk/defter/tekrar" });

  // Milestones: the whole week done, or two thirds of a skill's tasks done.
  const counted = weekTasks.filter((x) => x.skipReason !== "BUSY");
  if (counted.length >= 3 && counted.every((x) => x.status === "DONE")) {
    out.push({ kind: "MILESTONE", dedupeKey: `milestone:${weekStart}`, title: t.notify.weekMilestone, href: DASH });
  } else {
    const bySkill = new Map<string, { done: number; total: number }>();
    for (const x of counted) {
      if (!x.skill) continue;
      const s = bySkill.get(x.skill) ?? { done: 0, total: 0 };
      s.total += 1;
      if (x.status === "DONE") s.done += 1;
      bySkill.set(x.skill, s);
    }
    for (const [skill, s] of bySkill) {
      if (s.total >= 3 && s.done < s.total && s.done / s.total >= 2 / 3) {
        const name = pick(profile.locale, SKILL_LABELS[skill as SkillKey] ?? { tr: skill, en: skill }).toLocaleLowerCase(profile.locale === "en" ? "en" : "tr");
        out.push({ kind: "MILESTONE", dedupeKey: `progress:${weekStart}:${skill}`, title: t.notify.weekProgress(name, s.done, s.total), href: `${DASH}/plan` });
        break;
      }
    }
  }

  // Weekly report ready (created in the last week).
  const report = await db.coachingReport.findFirst({ where: { userId, kind: "WEEKLY", createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } }, orderBy: { createdAt: "desc" } });
  if (report) out.push({ kind: "WEEKLY_REPORT", dedupeKey: `report:${report.id}`, title: t.notify.weeklyReport, href: `${DASH}/raporlar/${report.id}` });

  // Offer to simplify the plan when a proposal is waiting or reminders keep going unread.
  const pending = await db.planProposal.count({ where: { userId, status: "PENDING" } });
  if (pending || ignored >= IGNORE_THRESHOLD) out.push({ kind: "PLAN_CHECK", dedupeKey: `plancheck:${weekStart}`, title: t.notify.planCheck, href: DASH });

  return out;
}

/**
 * Sends due follow-ups for one student. Preferences are re-read from the database right before
 * delivery (the caller's copy may be stale), each reminder is written together with its delivery
 * log in one transaction, and the log's unique (userId, dedupeKey) index makes concurrent runs —
 * a page visit and the daily cron at the same moment — deliver it only once.
 */
export async function runFollowUps(userId: string, todayKey: string, now = new Date()) {
  const profile = await db.coachingProfile.findUnique({ where: { userId } });
  if (!profile || !profile.enabled) return { sent: 0 };
  const ignored = await ignoredInARow(userId);
  const candidates = await buildCandidates(profile, todayKey, now, ignored);
  if (!candidates.length) return { sent: 0 };

  const already = await db.coachingNotificationLog.findMany({ where: { userId, dedupeKey: { in: candidates.map((c) => c.dedupeKey) } }, select: { dedupeKey: true } });
  const done = new Set(already.map((a) => a.dedupeKey));
  const fresh = candidates.filter((c) => !done.has(c.dedupeKey));
  if (!fresh.length) return { sent: 0 };

  // Re-check preferences at the moment of sending.
  const prefs = await db.coachingProfile.findUnique({ where: { userId }, select: { enabled: true, notifyInApp: true, frequency: true, pausedUntil: true, quietStart: true, quietEnd: true, timezone: true } });
  if (!prefs) return { sent: 0 };
  const decisions = decideFollowUps(fresh, prefs, now, ignored);

  const { start } = localDayRange(todayKey, profile.timezone);
  let sentToday = await db.coachingNotificationLog.count({ where: { userId, status: "SENT", createdAt: { gte: start } } });
  let sent = 0;
  for (const d of decisions) {
    if (d.action === "DEFER") continue;
    if (d.action === "SKIP") {
      await db.coachingNotificationLog.createMany({ data: [{ userId, kind: d.candidate.kind, dedupeKey: d.candidate.dedupeKey, channel: "IN_APP", status: d.status }], skipDuplicates: true });
      continue;
    }
    const essential = ESSENTIAL.has(d.candidate.kind);
    if (!essential && sentToday >= DAILY_CAP) continue; // left for another day (or it expires with its day key)
    try {
      await db.$transaction(async (tx) => {
        const log = await tx.coachingNotificationLog.create({ data: { userId, kind: d.candidate.kind, dedupeKey: d.candidate.dedupeKey, channel: "IN_APP", status: "SENT" } });
        const note = await tx.notification.create({ data: { userId, title: d.candidate.title, body: d.candidate.body ?? null, href: d.candidate.href } });
        await tx.coachingNotificationLog.update({ where: { id: log.id }, data: { notificationId: note.id } });
      });
      sent += 1;
      sentToday += 1;
    } catch (e) {
      // Unique violation: another run delivered this reminder first.
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  return { sent };
}

export function recentDeliveries(userId: string, take = 20) {
  return db.coachingNotificationLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take });
}
