import "server-only";
import { db } from "@/server/db";
import type { OnlineDenemeMode } from "@/lib/generated/prisma/enums";
import { loadKeyedDeneme } from "@/lib/online-denemeler/paper";
import { gradeDeneme } from "@/lib/online-denemeler/grading";
import { DENEME_MINUTES, type SavedAnswer } from "@/lib/online-denemeler/types";

/**
 * A save that leaves the browser just before 00:00 can reach the server a moment later; this much
 * network slack is accepted. Anything later is refused and the attempt is locked.
 */
const SAVE_GRACE_MS = 5_000;

type AttemptRow = NonNullable<Awaited<ReturnType<typeof db.onlineDenemeAttempt.findFirst>>>;

export function getOwnAttempt(attemptId: string, userId: string) {
  return db.onlineDenemeAttempt.findFirst({ where: { id: attemptId, userId } });
}

/** Grades and closes an attempt. Safe to call twice: only the first call that finds it open writes. */
async function finalize(attempt: AttemptRow, timedOut: boolean): Promise<AttemptRow> {
  const keyed = await loadKeyedDeneme(attempt.denemeNo);
  const answers = await db.onlineDenemeAnswer.findMany({ where: { attemptId: attempt.id } });
  const grade = gradeDeneme(keyed?.questions ?? [], new Map(answers.map((a) => [a.n, a.choice])));
  const now = new Date();
  await db.onlineDenemeAttempt.updateMany({
    where: { id: attempt.id, status: "IN_PROGRESS" },
    data: {
      status: "COMPLETED",
      // A sitting that ran out of time ends exactly at its deadline, however late we notice it.
      completedAt: timedOut ? attempt.deadlineAt : now,
      timedOut,
      correct: grade.correct,
      wrong: grade.wrong,
      blank: grade.blank,
      score: grade.score,
    },
  });
  return (await db.onlineDenemeAttempt.findUniqueOrThrow({ where: { id: attempt.id } })) as AttemptRow;
}

/** Locks the attempt if its 180 minutes are over. Every read of an attempt goes through this. */
export async function settleAttempt(attempt: AttemptRow, now = Date.now()): Promise<AttemptRow> {
  if (attempt.status === "IN_PROGRESS" && now > attempt.deadlineAt.getTime()) return finalize(attempt, true);
  return attempt;
}

/** Closes every expired sitting of a student (e.g. one they walked away from), so lists show real scores. */
export async function settleExpiredAttempts(userId: string) {
  const expired = await db.onlineDenemeAttempt.findMany({ where: { userId, status: "IN_PROGRESS", deadlineAt: { lt: new Date() } } });
  for (const a of expired) await finalize(a, true);
}

export async function findOpenAttempt(userId: string, denemeNo: number) {
  const open = await db.onlineDenemeAttempt.findFirst({ where: { userId, denemeNo, status: "IN_PROGRESS" }, orderBy: { startedAt: "desc" } });
  if (!open) return null;
  const settled = await settleAttempt(open);
  return settled.status === "IN_PROGRESS" ? settled : null;
}

export async function createAttempt(userId: string, denemeNo: number, mode: OnlineDenemeMode) {
  const startedAt = new Date();
  return db.onlineDenemeAttempt.create({
    data: { userId, denemeNo, mode, startedAt, deadlineAt: new Date(startedAt.getTime() + DENEME_MINUTES * 60_000) },
  });
}

export type SaveResult = { ok: true } | { ok: false; locked: true } | { ok: false; locked: false; error: string };

export async function saveAnswer(attemptId: string, userId: string, n: number, answer: SavedAnswer): Promise<SaveResult> {
  if (!Number.isInteger(n) || n < 1 || n > 80) return { ok: false, locked: false, error: "Geçersiz soru." };
  if (answer.choice !== null && (!Number.isInteger(answer.choice) || answer.choice < 0 || answer.choice > 4)) {
    return { ok: false, locked: false, error: "Geçersiz seçenek." };
  }
  const attempt = await getOwnAttempt(attemptId, userId);
  if (!attempt) return { ok: false, locked: false, error: "Deneme bulunamadı." };
  if (attempt.status !== "IN_PROGRESS") return { ok: false, locked: true };
  if (Date.now() > attempt.deadlineAt.getTime() + SAVE_GRACE_MS) {
    await finalize(attempt, true);
    return { ok: false, locked: true };
  }
  await db.onlineDenemeAnswer.upsert({
    where: { attemptId_n: { attemptId, n } },
    create: { attemptId, n, choice: answer.choice, flagged: answer.flagged },
    update: { choice: answer.choice, flagged: answer.flagged },
  });
  return { ok: true };
}

/** The student pressed "Testi bitir". After the deadline this still counts as a timed-out sitting. */
export async function finishAttempt(attemptId: string, userId: string) {
  const attempt = await getOwnAttempt(attemptId, userId);
  if (!attempt) return null;
  if (attempt.status !== "IN_PROGRESS") return attempt;
  return finalize(attempt, Date.now() > attempt.deadlineAt.getTime());
}

export async function setAttemptMode(attemptId: string, userId: string, mode: OnlineDenemeMode) {
  await db.onlineDenemeAttempt.updateMany({ where: { id: attemptId, userId, status: "IN_PROGRESS" }, data: { mode } });
}

export async function savedAnswers(attemptId: string): Promise<Record<number, SavedAnswer>> {
  const rows = await db.onlineDenemeAnswer.findMany({ where: { attemptId } });
  return Object.fromEntries(rows.map((r) => [r.n, { choice: r.choice, flagged: r.flagged }]));
}

/** Per deneme: the open sitting (if any), the best and latest finished score, and how many times finished. */
export async function denemeOverview(userId: string) {
  await settleExpiredAttempts(userId);
  const rows = await db.onlineDenemeAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "asc" },
    select: { id: true, denemeNo: true, status: true, deadlineAt: true, score: true, completedAt: true },
  });
  const byNo = new Map<number, { openId: string | null; deadlineAt: Date | null; latestId: string | null; latestScore: number | null; bestScore: number | null; finished: number }>();
  for (const r of rows) {
    const e = byNo.get(r.denemeNo) ?? { openId: null, deadlineAt: null, latestId: null, latestScore: null, bestScore: null, finished: 0 };
    if (r.status === "IN_PROGRESS") {
      e.openId = r.id;
      e.deadlineAt = r.deadlineAt;
    } else if (r.status === "COMPLETED") {
      const score = Number(r.score ?? 0);
      e.finished++;
      e.latestId = r.id;
      e.latestScore = score;
      e.bestScore = Math.max(e.bestScore ?? 0, score);
    }
    byNo.set(r.denemeNo, e);
  }
  return byNo;
}

/** The student's finished sittings, oldest first, for the trend on the result page. */
export function finishedScores(userId: string, take = 6) {
  return db.onlineDenemeAttempt
    .findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take,
      select: { id: true, denemeNo: true, score: true },
    })
    .then((rows) => rows.reverse().map((r) => ({ id: r.id, denemeNo: r.denemeNo, score: Number(r.score ?? 0) })));
}
