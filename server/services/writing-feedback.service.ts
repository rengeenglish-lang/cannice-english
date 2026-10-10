import "server-only";
import { db } from "@/server/db";
import { getPlanAccess } from "@/server/services/plans.service";
import { callClaudeTool, ClaudeApiError, ClaudeRefusalError } from "@/server/seo/claude";
import {
  FEEDBACK_TOOL,
  WRITING_FEEDBACK_MAX_TOKENS,
  WRITING_FEEDBACK_MODEL,
  WRITING_FEEDBACK_PRICING,
  buildFeedbackSystemPrompt,
  buildFeedbackUserMessage,
  costUsd,
  monthStart,
  monthlyAllowance,
  monthlyCapUsd,
  parseFeedbackResult,
  reserveUsd,
  type WritingInput,
} from "@/lib/writing-feedback";

export class WritingFeedbackError extends Error {}

type User = { id: string; role: string };

/** Whether the feature can run at all: it needs the Anthropic key and a non-zero monthly cap. */
export const writingFeedbackConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY) && monthlyCapUsd(process.env) > 0;

/** This month's allowance for the student; FAILED gradings don't count. */
export async function getWritingAllowance(user: User, now = new Date()) {
  const access = await getPlanAccess(user);
  const limit = monthlyAllowance(access.plan?.tier, access.isStaff);
  const used = await db.writingFeedback.count({ where: { userId: user.id, createdAt: { gte: monthStart(now) }, status: { not: "FAILED" } } });
  return { limit, used, remaining: Math.max(0, limit - used), unlimited: !Number.isFinite(limit) };
}

export async function listWritingFeedback(userId: string, take = 30) {
  return db.writingFeedback.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, kind: true, status: true, result: true, createdAt: true, answer: true },
  });
}

export async function getWritingFeedback(userId: string, id: string) {
  return db.writingFeedback.findFirst({ where: { id, userId } });
}

/**
 * Reserves the worst-case cost and one allowance slot, then grades with Claude. The reservation is
 * taken under an advisory lock, so two concurrent submissions can't both pass the allowance or the
 * site-wide monthly cap. On any failure the row becomes FAILED and stops counting.
 */
export async function gradeWriting(user: User, input: WritingInput, call: typeof callClaudeTool = callClaudeTool, now = new Date()) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const cap = monthlyCapUsd(process.env);
  if (!apiKey || cap <= 0) throw new WritingFeedbackError("Yazma geri bildirimi şu anda kullanılamıyor.");

  const system = buildFeedbackSystemPrompt(input.kind);
  const userMessage = buildFeedbackUserMessage(input);
  const estimatedUsd = reserveUsd(system, userMessage);
  const allowance = await getWritingAllowance(user, now);

  const row = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(782943, 2)`;
    const since = monthStart(now);
    const used = await tx.writingFeedback.count({ where: { userId: user.id, createdAt: { gte: since }, status: { not: "FAILED" } } });
    if (used >= allowance.limit) throw new WritingFeedbackError("Bu ayki geri bildirim hakkın doldu. Yeni ay başında yenilenir ya da planını yükseltebilirsin.");
    const sums = await tx.writingFeedback.groupBy({ by: ["status"], where: { createdAt: { gte: since }, status: { in: ["PENDING", "DONE"] } }, _sum: { estimatedUsd: true, actualUsd: true } });
    const spent = sums.reduce((t, s) => t + Number(s.status === "DONE" ? (s._sum.actualUsd ?? s._sum.estimatedUsd ?? 0) : (s._sum.estimatedUsd ?? 0)), 0);
    if (spent + estimatedUsd > cap) throw new WritingFeedbackError("Yazma geri bildirimi bu ay için yoğunluk nedeniyle geçici olarak durduruldu. Lütfen daha sonra tekrar dene.");
    return tx.writingFeedback.create({ data: { userId: user.id, kind: input.kind, taskPrompt: input.taskPrompt, answer: input.answer, model: WRITING_FEEDBACK_MODEL, estimatedUsd } });
  });

  try {
    const res = await call(
      { apiKey, pricing: WRITING_FEEDBACK_PRICING },
      { tool: FEEDBACK_TOOL, system, user: userMessage, model: WRITING_FEEDBACK_MODEL, maxTokens: WRITING_FEEDBACK_MAX_TOKENS },
    );
    const result = parseFeedbackResult(input.kind, res.input);
    await db.writingFeedback.update({
      where: { id: row.id },
      data: { status: "DONE", result, actualUsd: costUsd(res.inputTokens, res.outputTokens), inputTokens: res.inputTokens, outputTokens: res.outputTokens, completedAt: new Date() },
    });
    return row.id;
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 300) : "unknown";
    await db.writingFeedback.update({ where: { id: row.id }, data: { status: "FAILED", errorMessage: detail, completedAt: new Date() } });
    console.error("writing feedback failed", row.id, detail);
    if (error instanceof ClaudeRefusalError) throw new WritingFeedbackError("Bu metin değerlendirilemedi. Metni kontrol edip tekrar dene; hakkından düşülmedi.");
    if (error instanceof ClaudeApiError && error.retryable) throw new WritingFeedbackError("Değerlendirme servisi şu anda yoğun. Birkaç dakika sonra tekrar dene; hakkından düşülmedi.");
    throw new WritingFeedbackError("Değerlendirme tamamlanamadı. Tekrar dene; hakkından düşülmedi.");
  }
}
