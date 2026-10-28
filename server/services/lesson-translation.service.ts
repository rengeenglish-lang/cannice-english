import "server-only";
import { db } from "@/server/db";
import { chunkForTranslation, parseGoogleTranslateResponse } from "@/lib/lesson-translation";

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 4;
/** Pause between chunks so a long lesson doesn't hammer the endpoint. */
const PAUSE_BETWEEN_CHUNKS_MS = 400;

export class LessonTranslationError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 429 (rate limit) and 5xx are transient: wait and try again with a growing delay. */
function isTransient(status: number) {
  return status === 429 || status >= 500;
}

async function translateChunk(text: string): Promise<string> {
  const params = new URLSearchParams({ client: "gtx", sl: "tr", tl: "en", dt: "t", q: text });
  const url = `${ENDPOINT}?${params.toString()}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1000 * 2 ** (attempt - 1));
        continue;
      }
      throw new LessonTranslationError("Çeviri servisine ulaşılamadı. Biraz sonra tekrar dene.");
    }

    if (response.ok) {
      const translated = parseGoogleTranslateResponse(await response.json());
      if (translated === null) throw new LessonTranslationError("Çeviri alınamadı. Biraz sonra tekrar dene.");
      return translated;
    }

    if (isTransient(response.status) && attempt < MAX_ATTEMPTS) {
      await sleep(1500 * 2 ** (attempt - 1));
      continue;
    }
    if (response.status === 429) {
      throw new LessonTranslationError("Çeviri servisi şu anda yoğun. Birkaç dakika sonra tekrar dene.");
    }
    throw new LessonTranslationError("Çeviri servisi şu anda yanıt vermiyor. Biraz sonra tekrar dene.");
  }
  throw new LessonTranslationError("Çeviri servisi şu anda yoğun. Birkaç dakika sonra tekrar dene.");
}

/**
 * Returns the English version of a lesson body. The first request translates the Turkish body
 * chunk by chunk and stores it on the lesson; later requests read the stored copy, so each lesson
 * is only translated once. Nothing is stored unless every chunk succeeds.
 * Returns null when the lesson has no Turkish content to translate.
 */
export async function getEnglishLessonBody(lessonId: string): Promise<string | null> {
  const lesson = await db.topicLesson.findUnique({
    where: { id: lessonId },
    select: { contentBody: true, contentBodyEn: true },
  });
  if (!lesson?.contentBody) return null;
  if (lesson.contentBodyEn) return lesson.contentBodyEn;

  const chunks = chunkForTranslation(lesson.contentBody);
  const parts: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(PAUSE_BETWEEN_CHUNKS_MS);
    parts.push(await translateChunk(chunks[i]));
  }
  const english = parts.join("\n\n");

  await db.topicLesson.update({ where: { id: lessonId }, data: { contentBodyEn: english } });
  return english;
}
