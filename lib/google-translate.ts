import { chunkForTranslation, parseGoogleTranslateResponse } from "@/lib/lesson-translation";

/**
 * Batch translation of lesson bodies with Google's public translate endpoint. Used only by the
 * offline script (scripts/translate-lessons.ts), never at request time.
 */
const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 5;
/** Pause between chunks so the endpoint isn't hammered. */
export const PAUSE_BETWEEN_CHUNKS_MS = 800;

export class GoogleTranslateError extends Error {}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function translateChunk(text: string): Promise<string> {
  const params = new URLSearchParams({ client: "gtx", sl: "tr", tl: "en", dt: "t", q: text });
  const url = `${ENDPOINT}?${params.toString()}`;
  let lastReason = "bilinmeyen hata";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const backoff = 2000 * 2 ** (attempt - 1);
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error);
      await sleep(backoff);
      continue;
    }

    if (response.ok) {
      const translated = parseGoogleTranslateResponse(await response.json());
      if (translated !== null) return translated;
      lastReason = "beklenmeyen yanıt biçimi";
      await sleep(backoff);
      continue;
    }

    lastReason = `HTTP ${response.status}`;
    // 429 (rate limit) and 5xx are transient; anything else is not worth retrying.
    if (response.status === 429 || response.status >= 500) {
      await sleep(backoff);
      continue;
    }
    break;
  }
  throw new GoogleTranslateError(`Çeviri başarısız (${lastReason})`);
}

/** Translates a Turkish lesson body chunk by chunk. Throws if any chunk can't be translated. */
export async function translateLessonBody(body: string): Promise<string> {
  const chunks = chunkForTranslation(body);
  const parts: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(PAUSE_BETWEEN_CHUNKS_MS);
    parts.push(await translateChunk(chunks[i]));
  }
  return parts.join("\n\n");
}
