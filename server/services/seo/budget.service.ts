import "server-only";
import { db, type TransactionClient } from "@/server/db";
import { requireSeoAdmin } from "./access";
import { readSeoSettings } from "./settings.service";
import { budgetState, canReserve, monthKey } from "@/lib/seo/budget";

export class BudgetError extends Error {}

async function totals(tx: TransactionClient, month: string) {
  const rows = await tx.seoAiUsage.groupBy({ by: ["status"], where: { month, status: { in: ["RESERVED", "SETTLED"] } }, _sum: { estimatedUsd: true, actualUsd: true } });
  let spent = 0, reserved = 0;
  for (const r of rows) {
    if (r.status === "SETTLED") spent += Number(r._sum.actualUsd ?? r._sum.estimatedUsd ?? 0);
    else reserved += Number(r._sum.estimatedUsd ?? 0);
  }
  return { spent, reserved };
}

/**
 * The only way a future AI adapter may spend: reserve the estimate first. Serialized with an
 * advisory lock so concurrent callers cannot both squeeze under the cap. A monthly cap of 0
 * means no AI spending at all. Throws instead of silently exceeding the limit.
 */
export async function reserveAiBudget(input: { provider: string; model: string; operation: string; estimatedUsd: number; draftId?: string; actorId?: string }, now = new Date()) {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(782943, 1)`;
    const { settings } = await readSeoSettings(tx);
    const month = monthKey(now);
    const t = await totals(tx, month);
    const state = budgetState(settings.monthlyBudgetUsd, t.spent, t.reserved);
    if (!canReserve(state, input.estimatedUsd))
      throw new BudgetError(state.cap <= 0 ? "Aylık AI bütçesi tanımlı değil; harcama yapılamaz." : "Aylık AI bütçesi aşılacağı için işlem reddedildi.");
    const row = await tx.seoAiUsage.create({ data: { month, provider: input.provider, model: input.model, operation: input.operation, estimatedUsd: input.estimatedUsd, draftId: input.draftId, actorId: input.actorId } });
    return { id: row.id, warning: budgetState(state.cap, state.spent, state.reserved + input.estimatedUsd).warning };
  });
}
export async function settleAiUsage(id: string, actual: { usd: number; inputTokens?: number; outputTokens?: number }) {
  const r = await db.seoAiUsage.updateMany({ where: { id, status: "RESERVED" }, data: { status: "SETTLED", actualUsd: actual.usd, inputTokens: actual.inputTokens, outputTokens: actual.outputTokens, settledAt: new Date() } });
  if (r.count !== 1) throw new BudgetError("Rezervasyon bulunamadı.");
}
/** A failed generation releases its reservation so it does not count against the budget. */
export async function releaseAiUsage(id: string) {
  await db.seoAiUsage.updateMany({ where: { id, status: "RESERVED" }, data: { status: "RELEASED", settledAt: new Date() } });
}

export async function getBudgetReport(actorId: string, now = new Date()) {
  await requireSeoAdmin(actorId);
  const { settings } = await readSeoSettings();
  const month = monthKey(now);
  const t = await totals(db, month);
  const since = (days: number) => new Date(now.getTime() - days * 86_400_000);
  const sum = async (from: Date) => Number((await db.seoAiUsage.aggregate({ where: { createdAt: { gte: from }, status: { in: ["RESERVED", "SETTLED"] } }, _sum: { actualUsd: true, estimatedUsd: true } }))._sum.actualUsd ?? 0);
  return {
    month,
    provider: settings.provider,
    state: budgetState(settings.monthlyBudgetUsd, t.spent, t.reserved),
    today: await sum(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))),
    days7: await sum(since(7)),
    days30: await sum(since(30)),
    operations: await db.seoAiUsage.count({ where: { month, status: { not: "RELEASED" } } }),
  };
}
