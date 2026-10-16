import "server-only";
import { parseWiktionaryResult, type WiktionaryResult } from "@/lib/dictionary/wiktionary";

const ENGLISH_TERM = /^[a-z][a-z '\-]{0,79}$/i;

export async function wiktionaryDefinition(term: string): Promise<WiktionaryResult | null> {
  const word = term.trim();
  if (!ENGLISH_TERM.test(word)) return null;

  try {
    const response = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 604_800 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return parseWiktionaryResult(await response.json());
  } catch {
    return null;
  }
}
