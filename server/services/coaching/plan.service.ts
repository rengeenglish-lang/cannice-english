import "server-only";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { findOrCreatePracticeAttempt } from "@/server/services/diagnostic-attempts.service";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { generateWeekPlan, type PlannedTask } from "@/lib/coaching/planner";
import { suggestAdjustment } from "@/lib/coaching/adapt";
import { coachingCopy } from "@/lib/coaching/i18n";
import { addDays, dateToDayKey, dayKey, dayKeyToDate, daysBetween, isoWeekday, localDayRange, weekStartOf } from "@/lib/coaching/time";
import type { SkillKey } from "@/lib/coaching/exams";
import { buildCatalog } from "@/server/services/coaching/catalog.service";
import { examPerformance, weakSkillsFrom } from "@/server/services/coaching/insights.service";
import { countDueMistakes, recurringMistakeTopics } from "@/server/services/coaching/notebook.service";
import { ensureVocabIntake, hasSiteVocabulary } from "@/server/services/coaching/vocab.service";
import type { CoachingProfileRow } from "@/server/services/coaching/profile.service";

type User = { id: string; role: string };
type Basis = { generated: boolean; dailyMinutes: number; studyDays: number[]; focus: string[] };

export const VOCAB_HREF = "/dashboard/kocluk/kelime";
export const NOTEBOOK_HREF = "/dashboard/kocluk/defter/tekrar";

export function todayKeyFor(profile: { timezone: string }, now = new Date()) {
  return dayKey(now, profile.timezone);
}

async function focusSkills(profile: CoachingProfileRow, examTypeId: string | null) {
  const perf = await examPerformance(profile.userId, (await import("@/lib/coaching/exams")).pathwayConfig(profile.pathway)!, examTypeId);
  const measured = weakSkillsFrom(perf.skills);
  const declared = profile.difficulties as SkillKey[];
  return [...new Set([...measured, ...declared])];
}

async function planTasks(profile: CoachingProfileRow, user: User, weekStartKey: string, fromDay: string) {
  const t = coachingCopy(profile.locale);
  const catalog = await buildCatalog(profile, user);
  const focus = await focusSkills(profile, catalog.examTypeId);
  const firstWeek = await db.studyPlanWeek.count({ where: { userId: profile.userId } });
  const [vocabCount, mistakes] = await Promise.all([
    db.vocabCard.count({ where: { userId: profile.userId, masteredAt: null } }),
    db.mistakeEntry.count({ where: { userId: profile.userId, masteredAt: null, questionId: { not: null } } }),
  ]);
  const examDateKey = profile.examDate ? dateToDayKey(profile.examDate) : null;
  const tasks = generateWeekPlan({
    weekStart: weekStartKey,
    fromDay,
    studyDays: profile.studyDays,
    dailyMinutes: profile.dailyMinutes,
    pathway: catalog.config,
    focusSkills: focus,
    activities: catalog.activities,
    vocab: { available: vocabCount > 0 || (await hasSiteVocabulary(profile.contentExamSlug)), href: VOCAB_HREF },
    mistakes: { available: mistakes > 0, href: NOTEBOOK_HREF },
    mock: catalog.mock,
    timedPractice: catalog.timedPractice,
    daysUntilExam: examDateKey ? daysBetween(fromDay, examDateKey) : null,
    weekIndex: firstWeek,
    copy: { vocabTitle: t.task.vocabTitle, vocabDetail: t.task.vocabDetail, mistakeTitle: t.task.mistakeTitle, mistakeDetail: t.task.mistakeDetail },
  });

  // Offer the free level test on the first planned day until the student has taken one.
  if (catalog.examTypeId && tasks.length) {
    const [tested, offered] = await Promise.all([
      db.diagnosticAttempt.count({ where: { userId: profile.userId, examTypeId: catalog.examTypeId, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" } }),
      // Already ticked or skipped recently: re-planning mustn't offer it again.
      db.studyTask.count({ where: { userId: profile.userId, kind: "LEVEL_TEST", status: { not: "PLANNED" }, date: { gte: dayKeyToDate(addDays(fromDay, -28)) } } }),
    ]);
    if (!tested && !offered) {
      const first = tasks[0].date;
      tasks.forEach((x) => { if (x.date === first) x.position += 1; });
      tasks.unshift({ date: first, position: 0, kind: "LEVEL_TEST", skill: null, title: t.dash.levelTest, detail: t.onboarding.diagnosticOffer, href: catalog.levelTestHref ?? undefined, isGap: false, minutes: 30, busyMinutes: null });
      // Keep that day within the student's time: the level test replaces the day's last new-learning tasks.
      const dayTotal = () => tasks.filter((x) => x.date === first).reduce((n, x) => n + x.minutes, 0);
      while (dayTotal() > profile.dailyMinutes) {
        const i = tasks.findLastIndex((x) => x.date === first && x.kind !== "LEVEL_TEST" && x.kind !== "VOCAB_REVIEW" && x.kind !== "MISTAKE_REVIEW");
        if (i < 0) break;
        tasks.splice(i, 1);
      }
    }
  }
  return { tasks, basis: { generated: true, dailyMinutes: profile.dailyMinutes, studyDays: profile.studyDays, focus } satisfies Basis };
}

function taskRows(tasks: PlannedTask[], weekId: string, userId: string) {
  return tasks.map((x) => ({
    weekId,
    userId,
    date: dayKeyToDate(x.date),
    position: x.position,
    kind: x.kind,
    skill: x.skill,
    title: x.title,
    detail: x.detail ?? null,
    href: x.href ?? null,
    refType: x.refType ?? null,
    refId: x.refId ?? null,
    isGap: x.isGap,
    minutes: x.minutes,
    busyMinutes: x.busyMinutes,
  }));
}

/** Creates the week's plan the first time it's needed (lazily, from any coaching page or the cron). */
export async function ensureWeekPlan(profile: CoachingProfileRow, user: User, weekStartKey: string, todayKey: string) {
  const existing = await db.studyPlanWeek.findUnique({ where: { userId_weekStart: { userId: profile.userId, weekStart: dayKeyToDate(weekStartKey) } } });
  if (existing && (existing.basis as Basis | null)?.generated) return existing;
  await ensureVocabIntake(profile, dayKeyToDate(weekStartKey));
  const fromDay = todayKey > weekStartKey ? todayKey : weekStartKey;
  const { tasks, basis } = await planTasks(profile, user, weekStartKey, fromDay);
  try {
    return await db.$transaction(async (tx) => {
      // Claim the week first: of two concurrent page loads, only one generates the plan.
      const claimed = existing
        ? await tx.studyPlanWeek.updateMany({ where: { id: existing.id, basis: { path: ["generated"], equals: false } }, data: { basis } })
        : { count: 1 };
      if (!claimed.count) return existing!;
      const week = existing ?? (await tx.studyPlanWeek.create({ data: { userId: profile.userId, weekStart: dayKeyToDate(weekStartKey), basis } }));
      await tx.studyTask.createMany({ data: taskRows(tasks, week.id, profile.userId) });
      return week;
    });
  } catch (e) {
    if ((e as { code?: string }).code !== "P2002") throw e;
    return (await db.studyPlanWeek.findUnique({ where: { userId_weekStart: { userId: profile.userId, weekStart: dayKeyToDate(weekStartKey) } } }))!;
  }
}

/** Week row without generating (used when a task is postponed into a week that has no plan yet). */
async function weekRow(userId: string, weekStartKey: string) {
  return db.studyPlanWeek.upsert({
    where: { userId_weekStart: { userId, weekStart: dayKeyToDate(weekStartKey) } },
    update: {},
    create: { userId, weekStart: dayKeyToDate(weekStartKey), basis: { generated: false } },
  });
}

/**
 * "Kalan günleri yeniden planla": replaces the remaining untouched tasks from today on with a
 * fresh plan. Completed tasks and anything the student edited or added stay as they are.
 */
export async function regenerateRemaining(profile: CoachingProfileRow, user: User, todayKey: string) {
  const weekStartKey = weekStartOf(todayKey);
  const week = await weekRow(profile.userId, weekStartKey);
  const { tasks, basis } = await planTasks(profile, user, weekStartKey, todayKey);
  await db.$transaction(async (tx) => {
    await tx.studyTask.deleteMany({ where: { weekId: week.id, status: "PLANNED", editedByStudent: false, date: { gte: dayKeyToDate(todayKey) } } });
    const kept = await tx.studyTask.findMany({ where: { weekId: week.id, date: { gte: dayKeyToDate(todayKey) } }, select: { date: true } });
    const offset = new Map<string, number>();
    for (const k of kept) offset.set(dateToDayKey(k.date), (offset.get(dateToDayKey(k.date)) ?? 0) + 1);
    const shifted = tasks.map((x) => ({ ...x, position: x.position + (offset.get(x.date) ?? 0) }));
    await tx.studyTask.createMany({ data: taskRows(shifted, week.id, profile.userId) });
    await tx.studyPlanWeek.update({ where: { id: week.id }, data: { basis } });
  });
}

export async function getWeekTasks(userId: string, weekStartKey: string) {
  return db.studyTask.findMany({
    where: { userId, date: { gte: dayKeyToDate(weekStartKey), lt: dayKeyToDate(addDays(weekStartKey, 7)) } },
    orderBy: [{ date: "asc" }, { position: "asc" }],
  });
}

async function ownTask(userId: string, taskId: string) {
  return db.studyTask.findFirst({ where: { id: taskId, userId } });
}

export async function completeTask(userId: string, taskId: string, selfMinutes?: number | null) {
  const task = await ownTask(userId, taskId);
  if (!task) return null;
  return db.studyTask.update({
    where: { id: task.id },
    data: { status: "DONE", completion: "SELF", completedAt: new Date(), selfMinutes: selfMinutes && selfMinutes > 0 ? Math.min(600, selfMinutes) : null },
  });
}

export async function reopenTask(userId: string, taskId: string) {
  const task = await ownTask(userId, taskId);
  if (!task) return null;
  return db.studyTask.update({ where: { id: task.id }, data: { status: "PLANNED", completion: null, completedAt: null, skipReason: null } });
}

export async function skipTask(userId: string, taskId: string) {
  const task = await ownTask(userId, taskId);
  if (!task) return null;
  return db.studyTask.update({ where: { id: task.id }, data: { status: "SKIPPED", skipReason: "STUDENT" } });
}

/** Moves a task to another day (creating that week's row if needed) and puts it last that day. */
export async function moveTask(userId: string, taskId: string, toKey: string) {
  const task = await ownTask(userId, taskId);
  if (!task) return null;
  const week = await weekRow(userId, weekStartOf(toKey));
  const last = await db.studyTask.aggregate({ where: { userId, date: dayKeyToDate(toKey) }, _max: { position: true } });
  const postponed = toKey > dateToDayKey(task.date);
  return db.studyTask.update({
    where: { id: task.id },
    data: { weekId: week.id, date: dayKeyToDate(toKey), position: (last._max.position ?? -1) + 1, status: "PLANNED", skipReason: null, postponedCount: postponed ? { increment: 1 } : undefined },
  });
}

/** "Bugün yoğunum": keeps only the short revision versions of today's tasks. */
export async function applyBusyDay(userId: string, todayKey: string) {
  const tasks = await db.studyTask.findMany({ where: { userId, date: dayKeyToDate(todayKey), status: "PLANNED" } });
  for (const task of tasks) {
    await db.studyTask.update({
      where: { id: task.id },
      data: task.busyMinutes ? { minutes: task.busyMinutes } : { status: "SKIPPED", skipReason: "BUSY" },
    });
  }
  return tasks.length;
}

export async function editTask(userId: string, taskId: string, input: { title: string; detail?: string; minutes: number; date: string }) {
  const task = await ownTask(userId, taskId);
  if (!task) return null;
  if (input.date !== dateToDayKey(task.date)) await moveTask(userId, taskId, input.date);
  return db.studyTask.update({ where: { id: task.id }, data: { title: input.title, detail: input.detail || null, minutes: input.minutes, editedByStudent: true } });
}

export async function addCustomTask(userId: string, input: { title: string; detail?: string; minutes: number; date: string; skill?: string | null }) {
  const week = await weekRow(userId, weekStartOf(input.date));
  const last = await db.studyTask.aggregate({ where: { userId, date: dayKeyToDate(input.date) }, _max: { position: true } });
  return db.studyTask.create({
    data: { weekId: week.id, userId, date: dayKeyToDate(input.date), position: (last._max.position ?? -1) + 1, kind: "CUSTOM", skill: input.skill || null, title: input.title, detail: input.detail || null, minutes: input.minutes, isGap: false, editedByStudent: true },
  });
}

export function deleteTask(userId: string, taskId: string) {
  return db.studyTask.deleteMany({ where: { id: taskId, userId } });
}

/**
 * Where "Başla" sends the student. Practice tasks start the real Pratik Bankası attempt (linked
 * to the task so finishing it completes the task automatically); others open their page.
 */
export async function startTask(userId: string, taskId: string): Promise<string | null> {
  const task = await ownTask(userId, taskId);
  if (!task) return null;
  await db.studyTask.update({ where: { id: task.id }, data: { startedAt: task.startedAt ?? new Date() } });
  if ((task.kind === "PRACTICE" || task.kind === "TIMED_PRACTICE") && task.refType === "DIAGNOSTIC_TOPIC") {
    const goal = await getActiveGoal(userId);
    if (!goal) return "/dashboard/practice";
    const { attempt } = await findOrCreatePracticeAttempt(userId, goal.examTypeId, goal.examType.code, examFamilyForCode(goal.examType.code), goal.id, task.refId === "KARMA" ? null : task.refId);
    if (!attempt) return "/dashboard/practice";
    await db.studyTask.update({ where: { id: task.id }, data: { attemptId: attempt.id } });
    return `/dashboard/sinav/${attempt.id}`;
  }
  if (task.kind === "MOCK") return "/dashboard/mock-exam";
  return task.href;
}

/**
 * Marks tasks done from real activity (the "AUTO" completions): a linked practice attempt that
 * finished, a mock or level test completed since the task's day, a Konu Anlatımı lesson of the
 * task's topic ticked on that day, or enough vocabulary / notebook reviews that day.
 */
export async function syncTaskCompletion(profile: CoachingProfileRow, todayKey: string) {
  const userId = profile.userId;
  const tz = profile.timezone;
  const open = await db.studyTask.findMany({
    where: { userId, status: "PLANNED", date: { gte: dayKeyToDate(addDays(todayKey, -14)), lte: dayKeyToDate(todayKey) } },
  });
  if (!open.length) return 0;
  const since = localDayRange(addDays(todayKey, -14), tz).start;
  const [attempts, lessonDone, reviewed] = await Promise.all([
    db.diagnosticAttempt.findMany({ where: { userId, status: "COMPLETED", completedAt: { gte: since } }, select: { id: true, kind: true, scopeTopicId: true, completedAt: true } }),
    db.topicLessonProgress.findMany({ where: { userId, completedAt: { gte: since } }, select: { completedAt: true, topicLesson: { select: { topicId: true } } } }),
    db.vocabCard.findMany({ where: { userId, lastReviewedAt: { gte: since } }, select: { lastReviewedAt: true } }),
  ]);
  const retried = await db.mistakeEntry.findMany({ where: { userId, lastRetryDay: { gte: addDays(todayKey, -14) } }, select: { lastRetryDay: true } });
  const dueVocabNow = await db.vocabCard.count({ where: { userId, masteredAt: null, dueAt: { lte: new Date() } } });
  const dueMistakesNow = await countDueMistakes(userId);
  let done = 0;
  for (const task of open) {
    const key = dateToDayKey(task.date);
    const { start, end } = localDayRange(key, tz);
    const inDay = (d: Date | null) => Boolean(d && d >= start && d < end);
    const onOrAfter = (d: Date | null) => Boolean(d && d >= start);
    let hit = false;
    if (task.attemptId) hit = attempts.some((a) => a.id === task.attemptId);
    else if (task.kind === "PRACTICE" || task.kind === "TIMED_PRACTICE") hit = task.refType === "DIAGNOSTIC_TOPIC" && attempts.some((a) => a.kind === "PRACTICE" && inDay(a.completedAt) && (task.refId === "KARMA" ? a.scopeTopicId === null : a.scopeTopicId === task.refId));
    else if (task.kind === "MOCK") hit = attempts.some((a) => a.kind === "MOCK_EXAM" && onOrAfter(a.completedAt));
    else if (task.kind === "LEVEL_TEST") hit = attempts.some((a) => a.kind === "FULL_DIAGNOSTIC" && onOrAfter(a.completedAt));
    else if (task.kind === "LESSON" && task.refType === "EXAM_TOPIC") hit = lessonDone.some((l) => l.topicLesson.topicId === task.refId && inDay(l.completedAt));
    else if (task.kind === "VOCAB_REVIEW") {
      const n = reviewed.filter((r) => inDay(r.lastReviewedAt)).length;
      hit = n >= 5 || (n >= 1 && key === todayKey && dueVocabNow === 0);
    } else if (task.kind === "MISTAKE_REVIEW") {
      const n = retried.filter((r) => r.lastRetryDay === key).length;
      hit = n >= 3 || (n >= 1 && key === todayKey && dueMistakesNow === 0);
    }
    if (hit) {
      await db.studyTask.update({ where: { id: task.id }, data: { status: "DONE", completion: "AUTO", completedAt: new Date() } });
      done += 1;
    }
  }
  return done;
}

/** Tasks from earlier days this week that were never done or skipped. */
export function missedTasks(userId: string, todayKey: string) {
  return db.studyTask.findMany({
    where: { userId, status: "PLANNED", date: { gte: dayKeyToDate(weekStartOf(todayKey)), lt: dayKeyToDate(todayKey) } },
    orderBy: [{ date: "asc" }, { position: "asc" }],
  });
}

// ---- Proposals: substantial changes the student confirms first ----

type ProposalPayload = { weekStart: string; kind: "SETTINGS"; dailyMinutes: number; studyDays: number[] } | { weekStart: string; kind: "MISSED"; taskIds: string[] };

/**
 * Looks at last week (completion, check-in, ignored reminders, survey answers) and at this week's
 * missed tasks, and files at most one pending proposal per kind per week.
 */
export async function refreshProposals(profile: CoachingProfileRow, todayKey: string) {
  const userId = profile.userId;
  const thisWeek = weekStartOf(todayKey);
  const lastWeek = addDays(thisWeek, -7);
  const pending = await db.planProposal.findMany({ where: { userId, createdAt: { gte: localDayRange(thisWeek, profile.timezone).start } } });
  const has = (kind: string) => pending.some((p) => (p.payload as ProposalPayload).kind === kind);

  {
    const [planned, done, checkIn, logs, survey] = await Promise.all([
      db.studyTask.count({ where: { userId, date: { gte: dayKeyToDate(lastWeek), lt: dayKeyToDate(thisWeek) }, NOT: { skipReason: "BUSY" } } }),
      db.studyTask.count({ where: { userId, status: "DONE", date: { gte: dayKeyToDate(lastWeek), lt: dayKeyToDate(thisWeek) } } }),
      db.coachingCheckIn.findFirst({ where: { userId, weekStart: { gte: dayKeyToDate(lastWeek) } }, orderBy: { weekStart: "desc" } }),
      db.coachingNotificationLog.findMany({ where: { userId, status: "SENT", notificationId: { not: null } }, orderBy: { createdAt: "desc" }, take: 5, select: { notificationId: true } }),
      db.coachingFeedback.findFirst({ where: { userId, kind: "REPORT", createdAt: { gte: dayKeyToDate(addDays(todayKey, -14)) } }, orderBy: { createdAt: "desc" } }),
    ]);
    // A check-in or survey answer is acted on once: after a proposal has been filed for it, it
    // doesn't keep producing new (ever lighter) proposals week after week.
    const handledSince = async (at: Date) => (await db.planProposal.count({ where: { userId, reason: { not: "MISSED_TASKS" }, createdAt: { gte: at } } })) > 0;
    const freshCheckIn = checkIn && !(await handledSince(checkIn.updatedAt)) ? checkIn : null;
    const freshSurvey = survey?.workloadRealistic === false && !(await handledSince(survey.createdAt));
    // Otherwise at most one settings proposal a week — declining it isn't met with the same question again.
    if (!has("SETTINGS") || freshCheckIn || freshSurvey) {
      const unread = logs.length ? await db.notification.count({ where: { id: { in: logs.map((l) => l.notificationId!) }, isRead: false } }) : 0;
      const adj = suggestAdjustment({
        plannedCount: planned,
        doneCount: done,
        dailyMinutes: profile.dailyMinutes,
        studyDays: profile.studyDays,
        checkIn: freshCheckIn ? { manageable: freshCheckIn.manageable, workloadChange: freshCheckIn.workloadChange, blockers: freshCheckIn.blockers } : null,
        ignoredReminders: logs.length >= 3 && unread === logs.length ? logs.length : 0,
        unrealisticWorkload: freshSurvey,
      });
      if (adj && (adj.dailyMinutes !== profile.dailyMinutes || adj.studyDays.length !== profile.studyDays.length)) {
        const t = coachingCopy(profile.locale);
        const dayCount = adj.studyDays.length !== profile.studyDays.length ? adj.studyDays.length : 0;
        const summary = adj.reason === "CHECKIN_MORE" ? t.proposals.CHECKIN_MORE(adj.dailyMinutes) : t.proposals[adj.reason](adj.dailyMinutes, dayCount);
        // The newest suggestion replaces an older one still waiting for an answer.
        await db.planProposal.updateMany({ where: { userId, status: "PENDING", reason: { not: "MISSED_TASKS" } }, data: { status: "DECLINED", decidedAt: new Date() } });
        await db.planProposal.create({ data: { userId, reason: adj.reason, summary, payload: { weekStart: thisWeek, kind: "SETTINGS", dailyMinutes: adj.dailyMinutes, studyDays: adj.studyDays } } });
      }
    }
  }

  if (!has("MISSED")) {
    const missed = await missedTasks(userId, todayKey);
    const remainingStudyDays = Array.from({ length: 7 }, (_, i) => addDays(thisWeek, i)).filter((d) => d >= todayKey && profile.studyDays.includes(isoWeekday(d)));
    if (missed.length >= 2 && remainingStudyDays.length) {
      const t = coachingCopy(profile.locale);
      await db.planProposal.create({ data: { userId, reason: "MISSED_TASKS", summary: t.proposals.MISSED_TASKS(missed.length), payload: { weekStart: thisWeek, kind: "MISSED", taskIds: missed.map((m) => m.id) } } });
    }
  }
}

export function pendingProposals(userId: string) {
  return db.planProposal.findMany({ where: { userId, status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 2 });
}

export async function decideProposal(profile: CoachingProfileRow, user: User, proposalId: string, accept: boolean, todayKey: string) {
  const proposal = await db.planProposal.findFirst({ where: { id: proposalId, userId: profile.userId, status: "PENDING" } });
  if (!proposal) return;
  await db.planProposal.update({ where: { id: proposal.id }, data: { status: accept ? "ACCEPTED" : "DECLINED", decidedAt: new Date() } });
  if (!accept) return;
  const payload = proposal.payload as ProposalPayload;
  if (payload.kind === "SETTINGS") {
    const updated = await db.coachingProfile.update({ where: { id: profile.id }, data: { dailyMinutes: payload.dailyMinutes, studyDays: payload.studyDays } });
    await regenerateRemaining(updated, user, todayKey);
  } else {
    // Spread missed tasks over the remaining study days, one per day in turn.
    const days = Array.from({ length: 7 }, (_, i) => addDays(payload.weekStart, i)).filter((d) => d >= todayKey && profile.studyDays.includes(isoWeekday(d)));
    for (const [i, id] of payload.taskIds.entries()) if (days.length) await moveTask(profile.userId, id, days[i % days.length]);
  }
}

/** Keeps a recurring-mistake list handy for the dashboard and reports. */
export { recurringMistakeTopics };
