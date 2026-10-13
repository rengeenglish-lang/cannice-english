import "server-only";
import { db } from "@/server/db";
import { notify } from "@/server/services/notifications.service";
import { BADGES, computeStreak, dayKey, earnedBadges, leaderboardName, weekStartKey, weeklyPoints, type BadgeStats, type WeeklyCounts } from "@/lib/engagement";

/** Monday 00:00 in Istanbul (UTC+3 all year) as an instant. */
const weekStartInstant = (now: Date) => new Date(`${weekStartKey(now)}T00:00:00+03:00`);

/** Every Istanbul day on which the student did any study, over the last ~13 months. */
async function activityDays(userId: string, now: Date) {
  const since = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000);
  const [tasks, lessons, courseLessons, tests, vocab, mistakes] = await Promise.all([
    db.studyTask.findMany({ where: { userId, status: "DONE", completedAt: { gte: since } }, select: { completedAt: true } }),
    db.topicLessonProgress.findMany({ where: { userId, completedAt: { gte: since } }, select: { completedAt: true } }),
    db.lessonProgress.findMany({ where: { enrollment: { userId }, completedAt: { gte: since } }, select: { completedAt: true } }),
    db.diagnosticAttempt.findMany({ where: { userId, status: "COMPLETED", completedAt: { gte: since } }, select: { completedAt: true } }),
    db.vocabCard.findMany({ where: { userId, lastReviewedAt: { gte: since } }, select: { lastReviewedAt: true } }),
    db.mistakeEntry.findMany({ where: { userId, lastRetryDay: { not: null } }, select: { lastRetryDay: true } }),
  ]);
  const days = new Set<string>();
  for (const d of [...tasks.map((t) => t.completedAt), ...lessons.map((l) => l.completedAt), ...courseLessons.map((l) => l.completedAt), ...tests.map((t) => t.completedAt), ...vocab.map((v) => v.lastReviewedAt)]) {
    if (d) days.add(dayKey(d));
  }
  for (const m of mistakes) if (m.lastRetryDay) days.add(m.lastRetryDay);
  return days;
}

async function badgeStats(userId: string, bestStreak: number): Promise<BadgeStats> {
  const [tasksDone, topicLessons, courseLessons, vocabMastered, mistakesMastered, testsDone, certificates, coaching, checkIns, mockTests, writingDone, setTests, highScoreTests, perfectWeeks] = await Promise.all([
    db.studyTask.count({ where: { userId, status: "DONE" } }),
    db.topicLessonProgress.count({ where: { userId, completedAt: { not: null } } }),
    db.lessonProgress.count({ where: { enrollment: { userId }, completedAt: { not: null } } }),
    db.vocabCard.count({ where: { userId, masteredAt: { not: null } } }),
    db.mistakeEntry.count({ where: { userId, masteredAt: { not: null } } }),
    db.diagnosticAttempt.count({ where: { userId, status: "COMPLETED" } }),
    db.certificate.count({ where: { userId } }),
    db.coachingProfile.count({ where: { userId } }),
    db.coachingCheckIn.count({ where: { userId } }),
    db.diagnosticAttempt.count({ where: { userId, status: "COMPLETED", kind: "MOCK_EXAM" } }),
    db.writingFeedback.count({ where: { userId, status: "DONE" } }),
    db.lexiconSetTest.findMany({ where: { userId }, select: { score: true, total: true } }),
    countHighScoreTests(userId),
    countPerfectWeeks(userId),
  ]);
  return {
    bestStreak,
    tasksDone,
    lessonsDone: topicLessons + courseLessons,
    vocabMastered,
    mistakesMastered,
    testsDone,
    certificates,
    coachingStarted: coaching > 0 ? 1 : 0,
    checkIns,
    highScoreTests,
    perfectWeeks,
    mockTests,
    writingDone,
    setTestsPassed: setTests.filter((t) => t.total > 0 && t.score / t.total >= 0.8).length,
  };
}

/** Finished tests (any kind) with at least 10 graded answers, 90%+ of them correct. */
async function countHighScoreTests(userId: string) {
  const rows = await db.diagnosticResponse.groupBy({
    by: ["attemptId", "isCorrect"],
    where: { isCorrect: { not: null }, attempt: { userId, status: "COMPLETED" } },
    _count: { _all: true },
  });
  const perAttempt = new Map<string, { total: number; correct: number }>();
  for (const r of rows) {
    const a = perAttempt.get(r.attemptId) ?? { total: 0, correct: 0 };
    a.total += r._count._all;
    if (r.isCorrect) a.correct += r._count._all;
    perAttempt.set(r.attemptId, a);
  }
  return [...perAttempt.values()].filter((a) => a.total >= 10 && a.correct / a.total >= 0.9).length;
}

/** Plan weeks with 5+ tasks that all ended DONE; tasks skipped as "Bugün yoğunum" don't count against it. */
async function countPerfectWeeks(userId: string) {
  const rows = await db.studyTask.groupBy({
    by: ["weekId", "status"],
    // skipReason is null for almost every task, and SQL's NOT (x = 'BUSY') drops nulls: spell both.
    where: { userId, OR: [{ skipReason: null }, { skipReason: { not: "BUSY" } }] },
    _count: { _all: true },
  });
  const perWeek = new Map<string, { total: number; done: number }>();
  for (const r of rows) {
    const w = perWeek.get(r.weekId) ?? { total: 0, done: 0 };
    w.total += r._count._all;
    if (r.status === "DONE") w.done += r._count._all;
    perWeek.set(r.weekId, w);
  }
  return [...perWeek.values()].filter((w) => w.total >= 5 && w.done === w.total).length;
}

/**
 * The student's streak and badges. Newly reached badges are saved (once, ever) and announced in
 * the notification centre.
 */
export async function syncEngagement(userId: string, now = new Date()) {
  const streak = computeStreak(await activityDays(userId, now), dayKey(now));
  const stats = await badgeStats(userId, streak.best);
  const have = new Set((await db.userBadge.findMany({ where: { userId }, select: { badgeKey: true } })).map((b) => b.badgeKey));
  const fresh = earnedBadges(stats).filter((k) => !have.has(k));
  if (fresh.length) {
    await db.userBadge.createMany({ data: fresh.map((badgeKey) => ({ userId, badgeKey })), skipDuplicates: true });
    const first = BADGES.find((b) => b.key === fresh[0])!;
    await notify(userId, {
      category: "COACHING",
      key: "badges",
      title: fresh.length === 1 ? `Yeni rozet: ${first.emoji} ${first.title}` : `${fresh.length} yeni rozet kazandın!`,
      body: fresh.length === 1 ? first.description : fresh.map((k) => BADGES.find((b) => b.key === k)!.title).join(", "),
      href: "/dashboard/kocluk/basarilar",
    });
  }
  const earned = await db.userBadge.findMany({ where: { userId }, select: { badgeKey: true, earnedAt: true } });
  return { streak, stats, earned: new Map(earned.map((e) => [e.badgeKey, e.earnedAt])) };
}

/**
 * This week's points for every student who studied (Monday 00:00 Istanbul → now). Names show only
 * for students who opted in; everyone else appears as "Netfener öğrencisi".
 */
export async function weeklyLeaderboard(now = new Date()) {
  const since = weekStartInstant(now);
  const sinceKey = weekStartKey(now);
  const [tasks, lessons, courseLessons, tests, mistakes, vocab] = await Promise.all([
    db.studyTask.groupBy({ by: ["userId"], where: { status: "DONE", completedAt: { gte: since } }, _count: { _all: true } }),
    db.topicLessonProgress.groupBy({ by: ["userId"], where: { completedAt: { gte: since } }, _count: { _all: true } }),
    db.lessonProgress.findMany({ where: { completedAt: { gte: since } }, select: { enrollment: { select: { userId: true } } } }),
    db.diagnosticAttempt.groupBy({ by: ["userId"], where: { status: "COMPLETED", completedAt: { gte: since } }, _count: { _all: true } }),
    db.mistakeEntry.groupBy({ by: ["userId"], where: { lastRetryDay: { gte: sinceKey } }, _count: { _all: true } }),
    db.vocabCard.groupBy({ by: ["userId"], where: { lastReviewedAt: { gte: since } }, _count: { _all: true } }),
  ]);
  const counts = new Map<string, WeeklyCounts>();
  const add = (userId: string, field: keyof WeeklyCounts, n: number) => {
    const c = counts.get(userId) ?? { tasks: 0, lessons: 0, tests: 0, mistakes: 0, vocab: 0 };
    c[field] += n;
    counts.set(userId, c);
  };
  for (const r of tasks) add(r.userId, "tasks", r._count._all);
  for (const r of lessons) add(r.userId, "lessons", r._count._all);
  for (const r of courseLessons) add(r.enrollment.userId, "lessons", 1);
  for (const r of tests) add(r.userId, "tests", r._count._all);
  for (const r of mistakes) add(r.userId, "mistakes", r._count._all);
  for (const r of vocab) add(r.userId, "vocab", r._count._all);
  const users = await db.user.findMany({ where: { id: { in: [...counts.keys()] }, role: "STUDENT", isActive: true }, select: { id: true, name: true, leaderboardOptIn: true } });
  return users
    .map((u) => ({ userId: u.id, name: leaderboardName(u.name, u.leaderboardOptIn), points: weeklyPoints(counts.get(u.id)!) }))
    .filter((r) => r.points > 0)
    .sort((a, b) => b.points - a.points || a.userId.localeCompare(b.userId))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export function setLeaderboardOptIn(userId: string, optIn: boolean) {
  return db.user.update({ where: { id: userId }, data: { leaderboardOptIn: optIn } });
}
