import "server-only";
import { pricingFromEnv, type Pricing } from "@/lib/seo/autopilot";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const TIMEOUT_MS = 240_000;

export type ClaudeConfig = { apiKey: string; pricing: Pricing };

/** Returns null (feature visibly unavailable) unless BOTH the key and per-token prices are configured. */
export function claudeConfig(): ClaudeConfig | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const pricing = pricingFromEnv(process.env);
  return apiKey && pricing ? { apiKey, pricing } : null;
}

export type ClaudeToolCall = {
  tool: { name: string; description: string; input_schema: unknown };
  system: string;
  user: string;
  model: string;
  maxTokens: number;
};
export type ClaudeResult = { input: unknown; inputTokens: number; outputTokens: number; stopReason: string | null };

/** Some models (e.g. Sonnet 5.5) reject a forced tool_choice, so use "auto"; the prompts already require the tool call. */
export function buildClaudeRequest(call: ClaudeToolCall) {
  return {
    model: call.model,
    max_tokens: call.maxTokens,
    system: call.system,
    messages: [{ role: "user", content: call.user }],
    tools: [call.tool],
    tool_choice: { type: "auto" },
  };
}

/** Client errors (bad request, auth, not found) cannot be fixed by retrying; 408/409/429 and 5xx can. */
export class ClaudeApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
  get retryable() {
    return [408, 409, 429].includes(this.status) || this.status >= 500;
  }
}

export async function callClaudeTool(config: ClaudeConfig, call: ClaudeToolCall): Promise<ClaudeResult> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": config.apiKey, "anthropic-version": API_VERSION },
    body: JSON.stringify(buildClaudeRequest(call)),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 300); // short, key-free excerpt only
    throw new ClaudeApiError(response.status, `Claude API hatası ${response.status}: ${body}`);
  }
  const data = (await response.json()) as {
    content?: Array<{ type: string; name?: string; input?: unknown }>;
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string | null;
  };
  const block = data.content?.find((b) => b.type === "tool_use" && b.name === call.tool.name);
  if (!block) throw new Error("Claude araç sonucu döndürmedi");
  if (data.stop_reason === "max_tokens") throw new Error("Claude çıktısı yarıda kesildi (max_tokens)");
  return {
    input: block.input,
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    stopReason: data.stop_reason ?? null,
  };
}
