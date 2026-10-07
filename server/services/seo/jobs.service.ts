import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import { z } from "zod";
import { db } from "@/server/db";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import { isAutomationStopped, readAutomation } from "./automation.service";
import { refreshSeoInventory } from "./inventory.service";
import { syncSearchConsoleSystem } from "./performance.service";
import { gscStatus } from "./performance.service";
import {
  JOB_TYPES,
  STALE_LOCK_MS,
  backoffMs,
  inventoryDedupeKey,
  syncDedupeKey,
  syncWindows,
  type JobType,
} from "@/lib/seo/automation";

const KINDS = ["PAGES", "QUERIES"] as const;

/** Idempotent: the same dedupe key never creates a second job. Returns true when a job was created. */
export async function enqueueJob(type: JobType, payload: Record<string, unknown>, dedupeKey: string, runAt = new Date()) {
  try {
    await db.seoJob.create({ data: { type, payload: payload as Prisma.InputJsonValue, dedupeKey, runAt } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return false;
    throw e;
  }
}

/**
 * Plans the recurring read-only jobs. Only runs when automatic data sync is enabled and no
 * emergency stop is active. Search Console jobs are planned only when the integration is configured.
 */
export async function planRecurringJobs(now = new Date()) {
  const { state } = await readAutomation();
  if (state.emergencyStop || !state.autoSync) return { planned: 0, skipped: state.emergencyStop ? "stopped" : "autoSync off" };
  let planned = 0;
  if (gscStatus().configured)
    for (const period of syncWindows(now))
      for (const kind of KINDS)
        if (await enqueueJob("SEARCH_SYNC", { kind, period }, syncDedupeKey(kind, period), now)) planned++;
  if (await enqueueJob("INVENTORY_REFRESH", {}, inventoryDedupeKey(now), now)) planned++;
  return { planned, skipped: null };
}

type Claimed = { id: string; type: string; payload: unknown; attempts: number; maxAttempts: number };
/** Atomically claims due jobs; concurrent runners never receive the same row (FOR UPDATE SKIP LOCKED). Recovers stale locks. */
async function claim(now: Date, limit: number): Promise<Claimed[]> {
  const stale = new Date(now.getTime() - STALE_LOCK_MS);
  return db.$queryRaw<Claimed[]>`
    UPDATE seo_jobs SET status = 'RUNNING', "lockedAt" = ${now}, attempts = attempts + 1
    WHERE id IN (
      SELECT id FROM seo_jobs
      WHERE (status = 'QUEUED' AND "runAt" <= ${now}) OR (status = 'RUNNING' AND "lockedAt" < ${stale})
      ORDER BY "runAt" ASC LIMIT ${limit} FOR UPDATE SKIP LOCKED)
    RETURNING id, type, payload, attempts, "maxAttempts"`;
}

const syncPayload = z.object({ kind: z.enum(KINDS), period: z.object({ start: z.string(), end: z.string() }) });
async function execute(type: string, payload: unknown) {
  if (type === "SEARCH_SYNC") return syncSearchConsoleSystem(syncPayload.parse(payload));
  if (type === "INVENTORY_REFRESH") return refreshSeoInventory(null);
  throw new Error(`Bilinmeyen iş türü: ${type}`);
}

export async function runDueJobs(now = new Date(), limit = 5) {
  if (await isAutomationStopped()) return { ran: 0, succeeded: 0, failed: 0, retried: 0, stopped: true };
  const jobs = await claim(now, limit);
  let succeeded = 0, failed = 0, retried = 0;
  for (const job of jobs) {
    try {
      // A stop issued mid-run still lets the current job finish its own transaction, but starts nothing new.
      if (await isAutomationStopped()) throw new StoppedError();
      const result = await execute(job.type, job.payload);
      await db.seoJob.update({ where: { id: job.id }, data: { status: "SUCCEEDED", finishedAt: new Date(), lockedAt: null, lastError: null, result: JSON.parse(JSON.stringify(result ?? null)) } });
      succeeded++;
    } catch (error) {
      const message = (error instanceof Error ? error.message : "Bilinmeyen hata").slice(0, 500);
      const final = error instanceof StoppedError || job.attempts >= job.maxAttempts;
      await db.seoJob.update({
        where: { id: job.id },
        data: error instanceof StoppedError
          ? { status: "CANCELLED", finishedAt: new Date(), lockedAt: null, lastError: "Acil durdurma" }
          : final
            ? { status: "FAILED", finishedAt: new Date(), lockedAt: null, lastError: message }
            : { status: "QUEUED", lockedAt: null, lastError: message, runAt: new Date(now.getTime() + backoffMs(job.attempts)) },
      });
      await db.seoActivityLog.create({ data: { actorId: null, action: final ? "JOB_FAILED" : "JOB_RETRY_SCHEDULED", details: { id: job.id, type: job.type, attempt: job.attempts, error: message } } });
      if (final) failed++;
      else retried++;
    }
  }
  return { ran: jobs.length, succeeded, failed, retried, stopped: false };
}
class StoppedError extends Error {}

export async function listJobs(actorId: string) {
  await requireSeoAdmin(actorId);
  return db.seoJob.findMany({ orderBy: [{ createdAt: "desc" }], take: 30, select: { id: true, type: true, status: true, attempts: true, maxAttempts: true, runAt: true, finishedAt: true, lastError: true, payload: true, createdAt: true } });
}

const idInput = z.object({ id: z.string().min(1).max(100) }).strict();
export async function retryJob(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const { id } = idInput.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "JOB_RETRIED");
    const changed = await tx.seoJob.updateMany({ where: { id, status: { in: ["FAILED", "CANCELLED"] } }, data: { status: "QUEUED", attempts: 0, runAt: new Date(), lastError: null, finishedAt: null, lockedAt: null } });
    if (changed.count !== 1) throw new Error("İş yeniden denenemez.");
    await tx.seoActivityLog.create({ data: { actorId, action: "JOB_RETRIED", details: { id } } });
  });
}
export async function cancelJob(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const { id } = idInput.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "JOB_CANCELLED");
    const changed = await tx.seoJob.updateMany({ where: { id, status: "QUEUED" }, data: { status: "CANCELLED", finishedAt: new Date(), lastError: "Yönetici iptal etti" } });
    if (changed.count !== 1) throw new Error("Yalnızca sıradaki iş iptal edilebilir.");
    await tx.seoActivityLog.create({ data: { actorId, action: "JOB_CANCELLED", details: { id } } });
  });
}
export { JOB_TYPES };
