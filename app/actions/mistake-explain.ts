"use server";

import { getAuthContext } from "@/server/auth/context";
import { explainMistake, MistakeExplainError } from "@/server/services/mistake-explain.service";
import type { MistakeExplanationResult } from "@/lib/mistake-explain";

export type ExplainActionResult =
  | { status: "done"; result: MistakeExplanationResult; remaining: number | null }
  | { status: "error"; message: string };

export async function explainMistakeAction(responseId: string): Promise<ExplainActionResult> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Oturumun kapanmış. Lütfen tekrar giriş yap." };
  try {
    const { result, remaining } = await explainMistake(user, responseId);
    return { status: "done", result, remaining };
  } catch (error) {
    return { status: "error", message: error instanceof MistakeExplainError ? error.message : "Açıklama oluşturulamadı. Tekrar dene." };
  }
}
