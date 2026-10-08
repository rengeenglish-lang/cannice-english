import "server-only";
import { db, type TransactionClient } from "@/server/db";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import {
  AUTOMATION_KEY,
  DEFAULT_AUTOMATION,
  automationEnvelopeSchema,
  type AutomationState,
} from "@/lib/seo/automation";
import { z } from "zod";

export async function readAutomation(tx: TransactionClient = db) {
  const row = await tx.appSetting.findUnique({ where: { key: AUTOMATION_KEY } });
  return row
    ? automationEnvelopeSchema.parse(JSON.parse(row.value))
    : { revision: 0, state: DEFAULT_AUTOMATION };
}
/** Fail-safe: if the setting cannot be read, treat automation as stopped. */
export async function isAutomationStopped() {
  try {
    return (await readAutomation()).state.emergencyStop;
  } catch {
    return true;
  }
}

const patchSchema = z.object({ revision: z.number().int().min(0), emergencyStop: z.boolean().optional(), autoSync: z.boolean().optional(), autoGenerate: z.boolean().optional(), autoPublish: z.boolean().optional() }).strict();
export async function setAutomation(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = patchSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "AUTOMATION_CHANGED");
    const current = await readAutomation(tx);
    if (current.revision !== input.revision) throw new Error("Ayarlar başka bir sekmede değişti. Sayfayı yenileyin.");
    const state: AutomationState = {
      emergencyStop: input.emergencyStop ?? current.state.emergencyStop,
      autoSync: input.autoSync ?? current.state.autoSync,
      autoGenerate: input.autoGenerate ?? current.state.autoGenerate,
      autoPublish: input.autoPublish ?? current.state.autoPublish,
    };
    // Publishing without review only makes sense while generation is on.
    if (!state.autoGenerate) state.autoPublish = false;
    const next = { revision: current.revision + 1, state };
    const value = JSON.stringify(next);
    await tx.appSetting.upsert({ where: { key: AUTOMATION_KEY }, create: { key: AUTOMATION_KEY, value }, update: { value } });
    // An emergency stop also cancels queued work so nothing wakes up later; drafts and analytics are untouched.
    let cancelled = 0;
    if (state.emergencyStop && !current.state.emergencyStop)
      cancelled = (await tx.seoJob.updateMany({ where: { status: "QUEUED" }, data: { status: "CANCELLED", finishedAt: new Date(), lastError: "Acil durdurma" } })).count;
    await tx.seoActivityLog.create({
      data: { actorId, action: state.emergencyStop !== current.state.emergencyStop ? (state.emergencyStop ? "EMERGENCY_STOP" : "EMERGENCY_RESUME") : "AUTOMATION_CHANGED", details: { revision: next.revision, state, cancelledJobs: cancelled } },
    });
    return next;
  });
}
