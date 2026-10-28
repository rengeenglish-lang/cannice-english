import "server-only";
import { db } from "@/server/db";
import { chunkForTranslation, parseGoogleTranslateResponse } from "@/lib/lesson-translation";

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TIMEOUT_MS = 20_000;

export class LessonTranslationError extends Error {}

async function translateChunk(text: string): Promise<string> {
  const params = new URLSearchParams({ client: "gtx", sl: "tr", tl: "en", dt: "t", q: text });
  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { "user-agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new LessonTranslationError("Çeviri servisine ulaşılamadı. Biraz sonra tekrar dene.");
  }
  if (!response.ok) throw new LessonTranslationError(`Çeviri servisi yanıt vermedi (${response.status}).`);
  const translated = parseGoogleTranslateResponse(await response.json());
  if (translated === null) throw new LessonTranslationError("Çeviri alınamadı. Biraz sonra tekrar dene.");
  return translated;
}

/**
 * Returns the English version of a lesson body. The first request translates the Turkish body
 * chunk by chunk and stores it on the lesson; later requests read the stored copy, so each lesson
 * is only translated once. Returns null when the lesson has no Turkish content to translate.
 */
export async function getEnglishLessonBody(lessonId: string): Promise<string | null> {
  const lesson = await db.topicLesson.findUnique({
    where: { id: lessonId },
    select: { contentBody: true, contentBodyEn: true },
  });
  if (!lesson?.contentBody) return null;
  if (lesson.contentBodyEn) return lesson.contentBodyEn;

  const parts: string[] = [];
  for (const chunk of chunkForTranslation(lesson.contentBody)) {
    parts.push(await translateChunk(chunk));
  }
  const english = parts.join("\n\n");

  await db.topicLesson.update({ where: { id: lessonId }, data: { contentBodyEn: english } });
  return english;
}
