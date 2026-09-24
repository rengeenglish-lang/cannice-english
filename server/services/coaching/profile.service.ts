import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { getActiveGoal, setActiveGoal } from "@/server/services/diagnostic-goals.service";
import { PATHWAY_CODES, parseScore, pathwayConfig, versionOf, type SkillKey } from "@/lib/coaching/exams";
import { DEFAULT_TIMEZONE, isValidHHMM, isValidTimezone } from "@/lib/coaching/time";

export function getCoachingProfile(userId: string) {
  return db.coachingProfile.findUnique({ where: { userId } });
}

export type CoachingProfileRow = NonNullable<Awaited<ReturnType<typeof getCoachingProfile>>>;

const onboardingSchema = z.object({
  pathway: z.enum(PATHWAY_CODES as [string, ...string[]]),
  examVersion: z.string().min(1),
  targetScore: z.string().trim().max(10).optional().default(""),
  skillTargets: z.record(z.string(), z.string().trim().max(10)).default({}),
  examDate: z.string().trim().optional().default(""),
  currentLevel: z.enum(["UNKNOWN", "A1", "A2", "B1", "B2", "C1", "C2"]).default("UNKNOWN"),
  recentScore: z.string().trim().max(20).optional().default(""),
  recentScoreKind: z.enum(["PRACTICE", "OFFICIAL"]).optional(),
  studyDays: z.array(z.coerce.number().int().min(1).max(7)).min(1, "days"),
  dailyMinutes: z.coerce.number().int().min(10, "minutes").max(240, "minutes"),
  commitment: z.enum(["SCHOOL", "UNIVERSITY", "WORK", "OTHER"]).optional(),
  difficulties: z.array(z.string()).default([]),
  reminderTime: z.string().refine(isValidHHMM).default("19:00"),
  isMinor: z.boolean().default(false),
  guardianConsent: z.boolean().default(false),
  syncGoal: z.boolean().default(true),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
export type OnboardingError = "days" | "minutes" | "score" | "guardian" | "generic";

/**
 * Saves the onboarding answers. Only planning inputs are stored (no birth date, school or other
 * personal details); under-18s can't activate coaching without the guardian-consent confirmation.
 * Scores are validated on the chosen exam's own scale. With `syncGoal`, the site-wide ExamGoal is
 * pointed at the same exam so Pratik Bankası and Deneme Sınavı serve that exam's questions.
 */
export async function saveOnboarding(userId: string, raw: OnboardingInput): Promise<{ ok: true } | { ok: false; error: OnboardingError }> {
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return { ok: false, error: msg === "days" || msg === "minutes" ? msg : "generic" };
  }
  const input = parsed.data;
  const config = pathwayConfig(input.pathway)!;
  const version = versionOf(config, input.examVersion);
  if (input.isMinor && !input.guardianConsent) return { ok: false, error: "guardian" };

  const target = input.targetScore ? parseScore(input.targetScore, config.overall) : null;
  if (input.targetScore && target === null) return { ok: false, error: "score" };
  const skillTargets: Record<string, number> = {};
  for (const { skill, scale } of config.skillScores) {
    const value = input.skillTargets[skill];
    if (!value) continue;
    const parsedScore = parseScore(value, scale);
    if (parsedScore === null) return { ok: false, error: "score" };
    skillTargets[skill] = parsedScore;
  }
  const difficulties = input.difficulties.filter((d) => config.skills.includes(d as SkillKey));
  const examDate = /^\d{4}-\d{2}-\d{2}$/.test(input.examDate) ? new Date(`${input.examDate}T00:00:00.000Z`) : null;

  const data = {
    enabled: true,
    pathway: input.pathway as never,
    examVersion: version.key,
    contentExamSlug: version.contentExamSlug,
    targetScore: target !== null ? String(target) : null,
    skillTargets,
    examDate,
    currentLevel: input.currentLevel === "UNKNOWN" ? null : input.currentLevel,
    recentScore: input.recentScore || null,
    recentScoreKind: input.recentScore ? (input.recentScoreKind ?? "PRACTICE") : null,
    studyDays: [...new Set(input.studyDays)].sort(),
    dailyMinutes: input.dailyMinutes,
    commitment: input.commitment ?? null,
    difficulties,
    reminderTime: input.reminderTime,
    isMinor: input.isMinor,
    guardianConsentAt: input.isMinor ? new Date() : null,
  };
  await db.coachingProfile.upsert({ where: { userId }, update: data, create: { userId, ...data } });

  if (input.syncGoal && version.contentExamSlug) {
    const examType = await db.examType.findUnique({ where: { slug: version.contentExamSlug } });
    const current = await getActiveGoal(userId);
    if (examType && current?.examTypeId !== examType.id) {
      await setActiveGoal(userId, {
        examTypeId: examType.id,
        targetScoreRaw: target !== null ? String(target) : "Belirtilmedi",
        currentScoreKnown: Boolean(input.recentScore),
        currentScoreRaw: input.recentScore || "",
        targetTimeframe: examDate ? "EXACT_DATE" : "UNKNOWN",
        targetDate: examDate ? input.examDate : "",
      });
    }
  }
  return { ok: true };
}

const settingsSchema = z.object({
  notifyInApp: z.boolean(),
  frequency: z.enum(["NORMAL", "LOW"]),
  quietStart: z.string().refine(isValidHHMM),
  quietEnd: z.string().refine(isValidHHMM),
  reminderTime: z.string().refine(isValidHHMM),
  /** -1 = keep the current pause, 0 = resume now, N = pause N days. */
  pauseDays: z.coerce.number().int().min(-1).max(30),
  timezone: z.string().refine(isValidTimezone).default(DEFAULT_TIMEZONE),
  locale: z.enum(["tr", "en"]),
});

export async function updateCoachingSettings(userId: string, raw: z.input<typeof settingsSchema>) {
  const input = settingsSchema.parse(raw);
  const existing = await db.coachingProfile.findUniqueOrThrow({ where: { userId } });
  const pausedUntil = input.pauseDays > 0 ? new Date(Date.now() + input.pauseDays * 86_400_000) : input.pauseDays === -1 ? existing.pausedUntil : null;
  return db.coachingProfile.update({
    where: { userId },
    data: {
      notifyInApp: input.notifyInApp,
      frequency: input.frequency,
      quietStart: input.quietStart,
      quietEnd: input.quietEnd,
      reminderTime: input.reminderTime,
      pausedUntil,
      timezone: input.timezone,
      locale: input.locale,
    },
  });
}

export function setCoachingEnabled(userId: string, enabled: boolean) {
  return db.coachingProfile.update({ where: { userId }, data: { enabled } });
}

/**
 * "Koçluk verilerimi sil" — removes every coaching record for the student and nothing else
 * (orders, exam attempts, the site-wide ExamGoal and the rest of the account are untouched). The
 * in-app notifications coaching sent are removed too, via the delivery log that links them.
 */
export async function deleteCoachingData(userId: string) {
  await db.$transaction(async (tx) => {
    const logs = await tx.coachingNotificationLog.findMany({ where: { userId, notificationId: { not: null } }, select: { notificationId: true } });
    const notificationIds = logs.map((l) => l.notificationId!).filter(Boolean);
    // Coaching notifications are found via the delivery log, and by their coaching link as a fallback.
    await tx.notification.deleteMany({ where: { userId, OR: [{ id: { in: notificationIds } }, { href: { startsWith: "/dashboard/kocluk" } }] } });
    await tx.coachingNotificationLog.deleteMany({ where: { userId } });
    await tx.coachingReport.deleteMany({ where: { userId } });
    await tx.coachingFeedback.deleteMany({ where: { userId } });
    await tx.coachingCheckIn.deleteMany({ where: { userId } });
    await tx.mistakeEntry.deleteMany({ where: { userId } });
    await tx.vocabCard.deleteMany({ where: { userId } });
    await tx.planProposal.deleteMany({ where: { userId } });
    await tx.studyTask.deleteMany({ where: { userId } });
    await tx.studyPlanWeek.deleteMany({ where: { userId } });
    await tx.coachingProfile.deleteMany({ where: { userId } });
  });
}
