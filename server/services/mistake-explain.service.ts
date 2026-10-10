import "server-only";
import { db } from "@/server/db";
import { getPlanAccess } from "@/server/services/plans.service";
import { callClaudeTool, ClaudeApiError, ClaudeRefusalError } from "@/server/seo/claude";
import { HAIKU_MODEL, HAIKU_PRICING, haikuCostUsd } from "@/lib/ai-haiku";
import {
  EXPLAIN_MAX_TOKENS,
  EXPLAIN_SYSTEM_PROMPT,
  EXPLAIN_TOOL,
  PENDING_STALE_MS,
  buildExplainUserMessage,
  dailyExplainAllowance,
  explainCapUsd,
  explainReserveUsd,
  istanbulDayStart,
  optionIndex,
  parseExplanation,
  type MistakeExplanationResult,
} from "@/lib/mistake-explain";

export class MistakeExplainError extends Error {}

type User = { id: string; role: string };
export type ExplainOutcome = { result: MistakeExplanationResult; remaining: number | null };

export const mistakeExplainConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY) && explainCapUsd(process.env) > 0;

const monthStart = (now: Date) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

async function remainingToday(userId: string, limit: number, now: Date) {
  if (!Number.isFinite(limit)) return null;
  const used = await db.mistakeExplanationView.count({ where: { userId, charged: true, createdAt: { gte: istanbulDayStart(now) } } });
  return Math.max(0, limit - used);
}

/**
 * Explains why the student's answer to one of their own wrong responses is wrong. A saved
 * explanation for the same question and option is reused for free; otherwise one is generated
 * under the student's daily allowance and the site-wide monthly cap (both checked under an
 * advisory lock). A failed generation counts against neither.
 */
export async function explainMistake(user: User, responseId: string, call: typeof callClaudeTool = callClaudeTool, now = new Date()): Promise<ExplainOutcome> {
  const response = await db.diagnosticResponse.findFirst({
    where: { id: responseId, isCorrect: false, attempt: { userId: user.id } },
    include: { question: { include: { topic: true } }, attempt: { include: { examType: true } } },
  });
  if (!response) throw new MistakeExplainError("Bu hata bulunamadı.");
  const q = response.question;
  const options = Array.isArray(q.options) ? (q.options as unknown[]).map(String) : [];
  const chosen = optionIndex(response.answerRaw, options.length);
  const correct = optionIndex(q.correctAnswer, options.length);
  if (chosen === null || correct === null || chosen === correct) throw new MistakeExplainError("Bu soru için yapay zekâ açıklaması verilemiyor.");
  const answer = String(chosen);

  const access = await getPlanAccess(user);
  const limit = dailyExplainAllowance(access.plan?.tier, access.isStaff);

  const saved = await db.mistakeExplanation.findUnique({ where: { questionId_answer: { questionId: q.id, answer } } });
  if (saved?.status === "DONE" && saved.result) {
    await db.mistakeExplanationView.create({ data: { userId: user.id, explanationId: saved.id, charged: false } });
    return { result: saved.result as MistakeExplanationResult, remaining: await remainingToday(user.id, limit, now) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const cap = explainCapUsd(process.env);
  if (!apiKey || cap <= 0) throw new MistakeExplainError("Yapay zekâ açıklaması şu anda kullanılamıyor.");

  const userMessage = buildExplainUserMessage(
    { prompt: q.prompt, passageText: q.passageText, options, correctIndex: correct, explanation: q.explanation, topicName: q.topic.name, examName: response.attempt.examType.name },
    chosen,
  );
  const estimatedUsd = explainReserveUsd(userMessage);

  const { rowId, viewId } = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(782943, 3)`;
    const current = await tx.mistakeExplanation.findUnique({ where: { questionId_answer: { questionId: q.id, answer } } });
    if (current?.status === "PENDING" && now.getTime() - current.updatedAt.getTime() < PENDING_STALE_MS)
      throw new MistakeExplainError("Bu açıklama şu anda hazırlanıyor. Birkaç saniye sonra tekrar dene.");
    if (Number.isFinite(limit)) {
      const used = await tx.mistakeExplanationView.count({ where: { userId: user.id, charged: true, createdAt: { gte: istanbulDayStart(now) } } });
      if (used >= limit) throw new MistakeExplainError("Bugünkü yapay zekâ açıklama hakkın doldu. Yarın yenilenir; daha önce açılmış açıklamalar her zaman görüntülenebilir.");
    }
    const sums = await tx.mistakeExplanation.groupBy({ by: ["status"], where: { createdAt: { gte: monthStart(now) }, status: { in: ["PENDING", "DONE"] } }, _sum: { estimatedUsd: true, actualUsd: true } });
    const spent = sums.reduce((t, s) => t + Number(s.status === "DONE" ? (s._sum.actualUsd ?? s._sum.estimatedUsd ?? 0) : (s._sum.estimatedUsd ?? 0)), 0);
    if (spent + estimatedUsd > cap) throw new MistakeExplainError("Yapay zekâ açıklamaları bu ay için yoğunluk nedeniyle geçici olarak durduruldu. Sorunun yazılı açıklaması yukarıda.");
    const row = current
      ? await tx.mistakeExplanation.update({ where: { id: current.id }, data: { status: "PENDING", errorMessage: null, estimatedUsd, model: HAIKU_MODEL, createdAt: now } })
      : await tx.mistakeExplanation.create({ data: { questionId: q.id, answer, model: HAIKU_MODEL, estimatedUsd } });
    const view = await tx.mistakeExplanationView.create({ data: { userId: user.id, explanationId: row.id, charged: true } });
    return { rowId: row.id, viewId: view.id };
  });

  try {
    const res = await call(
      { apiKey, pricing: HAIKU_PRICING },
      { tool: EXPLAIN_TOOL, system: EXPLAIN_SYSTEM_PROMPT, user: userMessage, model: HAIKU_MODEL, maxTokens: EXPLAIN_MAX_TOKENS },
    );
    const result = parseExplanation(res.input, options.length);
    await db.mistakeExplanation.update({
      where: { id: rowId },
      data: { status: "DONE", result, actualUsd: haikuCostUsd(res.inputTokens, res.outputTokens), inputTokens: res.inputTokens, outputTokens: res.outputTokens, completedAt: new Date() },
    });
    return { result, remaining: await remainingToday(user.id, limit, now) };
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 300) : "unknown";
    await db.$transaction([
      db.mistakeExplanation.update({ where: { id: rowId }, data: { status: "FAILED", errorMessage: detail, completedAt: new Date() } }),
      db.mistakeExplanationView.delete({ where: { id: viewId } }),
    ]);
    console.error("mistake explanation failed", rowId, detail);
    if (error instanceof ClaudeApiError && error.retryable) throw new MistakeExplainError("Açıklama servisi şu anda yoğun. Biraz sonra tekrar dene; hakkından düşülmedi.");
    if (error instanceof ClaudeRefusalError) throw new MistakeExplainError("Bu soru için açıklama oluşturulamadı; hakkından düşülmedi.");
    throw new MistakeExplainError("Açıklama oluşturulamadı. Tekrar dene; hakkından düşülmedi.");
  }
}
