import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { addDays, dayKeyToDate, isoWeekday, weekStartOf } from "@/lib/coaching/time";
import { pathwayConfig } from "@/lib/coaching/exams";
import type { CoachingProfileRow } from "@/server/services/coaching/profile.service";

/**
 * Which week a check-in reviews: from Friday it's the current week; Monday–Thursday it's the
 * week that just ended (so a student who missed the weekend can still answer).
 */
export function checkInWeekFor(todayKey: string) {
  const thisWeek = weekStartOf(todayKey);
  return isoWeekday(todayKey) >= 5 ? thisWeek : addDays(thisWeek, -7);
}

export function getCheckIn(userId: string, weekStartKey: string) {
  return db.coachingCheckIn.findUnique({ where: { userId_weekStart: { userId, weekStart: dayKeyToDate(weekStartKey) } } });
}

/** Whether to prompt for a check-in: the reviewed week had a plan and hasn't been answered yet. */
export async function checkInDue(userId: string, todayKey: string) {
  const week = checkInWeekFor(todayKey);
  const [answered, hadPlan] = await Promise.all([
    getCheckIn(userId, week),
    db.studyTask.count({ where: { userId, date: { gte: dayKeyToDate(week), lt: dayKeyToDate(addDays(week, 7)) } } }),
  ]);
  return !answered && hadPlan > 0 ? week : null;
}

const checkInSchema = z.object({
  manageable: z.enum(["EASY", "OK", "HARD"]),
  hardestSkills: z.array(z.string()).max(8).default([]),
  blockers: z.array(z.enum(["TIME", "MOTIVATION", "DIFFICULT", "TECH", "HEALTH", "NONE"])).max(6).default([]),
  workloadChange: z.enum(["LESS", "SAME", "MORE"]),
  note: z.string().trim().max(500).optional(),
});

export async function saveCheckIn(profile: CoachingProfileRow, weekStartKey: string, raw: z.input<typeof checkInSchema>) {
  const parsed = checkInSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const };
  const skills = pathwayConfig(profile.pathway)?.skills ?? [];
  const data = { ...parsed.data, hardestSkills: parsed.data.hardestSkills.filter((s) => (skills as string[]).includes(s)), note: parsed.data.note || null };
  await db.coachingCheckIn.upsert({
    where: { userId_weekStart: { userId: profile.userId, weekStart: dayKeyToDate(weekStartKey) } },
    update: data,
    create: { userId: profile.userId, weekStart: dayKeyToDate(weekStartKey), ...data },
  });
  // Skills the student found hardest get extra turns in coming plans (they're the declared difficulties).
  if (data.hardestSkills.length) {
    await db.coachingProfile.update({ where: { id: profile.id }, data: { difficulties: [...new Set([...data.hardestSkills, ...profile.difficulties])].slice(0, 4) } });
  }
  return { ok: true as const };
}

const surveySchema = z.object({
  reportId: z.string().min(1),
  useful: z.boolean().nullable(),
  workloadRealistic: z.boolean().nullable(),
  reminderFrequency: z.enum(["TOO_MANY", "OK", "TOO_FEW"]).nullable(),
  message: z.string().trim().max(1000).optional(),
});

/**
 * Report survey. Answers personalise coaching directly: "too many reminders" switches to the
 * essential-only frequency, "too few" back to normal; an unrealistic workload produces a lighter
 * plan proposal on the next refresh (see refreshProposals).
 */
export async function saveReportSurvey(userId: string, raw: z.input<typeof surveySchema>) {
  const parsed = surveySchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const };
  const report = await db.coachingReport.findFirst({ where: { id: parsed.data.reportId, userId } });
  if (!report) return { ok: false as const };
  await db.coachingFeedback.create({
    data: { userId, kind: "REPORT", refId: report.id, useful: parsed.data.useful, workloadRealistic: parsed.data.workloadRealistic, reminderFrequency: parsed.data.reminderFrequency, message: parsed.data.message || null },
  });
  if (parsed.data.reminderFrequency === "TOO_MANY") await db.coachingProfile.update({ where: { userId }, data: { frequency: "LOW" } });
  if (parsed.data.reminderFrequency === "TOO_FEW") await db.coachingProfile.update({ where: { userId }, data: { frequency: "NORMAL" } });
  return { ok: true as const };
}

export function reportSurveyAnswered(userId: string, reportId: string) {
  return db.coachingFeedback.findFirst({ where: { userId, kind: "REPORT", refId: reportId } });
}

/** "Bu öneri yardımcı olmadı" — stored for review; never shared with other students. */
export async function reportUnhelpfulAdvice(userId: string, refId: string, message?: string) {
  await db.coachingFeedback.create({ data: { userId, kind: "ADVICE", refId: refId.slice(0, 200), useful: false, message: message?.trim().slice(0, 1000) || null } });
}
