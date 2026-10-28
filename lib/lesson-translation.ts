/**
 * Pure helpers for translating a lesson body with Google's public translate endpoint
 * (no API key, no billing). Kept free of server-only imports so they can be unit-tested.
 */

/** Keeps each request well under the endpoint's URL/text limits. */
export const TRANSLATE_CHUNK_CHARS = 1500;

/**
 * Splits text into chunks of at most `max` characters, breaking on blank lines (paragraphs).
 * A paragraph longer than `max` is split on whitespace. Empty input yields no chunks.
 */
export function chunkForTranslation(text: string, max = TRANSLATE_CHUNK_CHARS): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const push = (value: string) => {
    if (value) chunks.push(value);
  };

  for (const paragraph of paragraphs) {
    const pieces = paragraph.length > max ? splitLongParagraph(paragraph, max) : [paragraph];
    for (const piece of pieces) {
      const candidate = current ? `${current}\n\n${piece}` : piece;
      if (candidate.length <= max) {
        current = candidate;
      } else {
        push(current);
        current = piece;
      }
    }
  }
  push(current);
  return chunks;
}

function splitLongParagraph(paragraph: string, max: number): string[] {
  const words = paragraph.split(/\s+/);
  const pieces: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= max) {
      current = candidate;
    } else {
      if (current) pieces.push(current);
      current = word;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

/**
 * Reads the translated text from a Google `translate_a/single` (client=gtx) response.
 * The shape is `[[[translated, original, ...], ...], ...]`; the segments are concatenated.
 * Returns null when the payload doesn't have that shape.
 */
export function parseGoogleTranslateResponse(payload: unknown): string | null {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;
  const segments = payload[0] as unknown[];
  const parts: string[] = [];
  for (const segment of segments) {
    if (Array.isArray(segment) && typeof segment[0] === "string") parts.push(segment[0]);
  }
  return parts.length ? parts.join("") : null;
}
