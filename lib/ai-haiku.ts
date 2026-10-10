/**
 * The model behind Netfener's student-facing AI helpers (Yazma Geri Bildirimi, Hatalarım "Neden
 * yanlış?") and its list prices, so every cost estimate and ledger uses the same numbers.
 */
export const HAIKU_MODEL = "claude-haiku-5-5";
/** Claude Haiku 5.5 list prices (USD per million tokens) for prompts up to 100K tokens. */
export const HAIKU_PRICING = { inputUsdPerMTok: 0.1, outputUsdPerMTok: 0.5 };

export const haikuCostUsd = (inputTokens: number, outputTokens: number) =>
  (inputTokens * HAIKU_PRICING.inputUsdPerMTok + outputTokens * HAIKU_PRICING.outputUsdPerMTok) / 1_000_000;

/** Worst-case cost reserved before a call: generous input estimate (Turkish ≈ 2.2 chars/token) plus the full output budget. */
export function haikuReserveUsd(promptChars: number, extraInputTokens: number, maxOutputTokens: number): number {
  return Math.ceil(haikuCostUsd(Math.ceil(promptChars / 2.2) + extraInputTokens, maxOutputTokens) * 100_000) / 100_000;
}

/** A monthly USD cap from the environment; unset or invalid falls back to `fallback`, 0 switches the feature off. */
export function monthlyCapFromEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
