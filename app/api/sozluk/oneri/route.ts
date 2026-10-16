import { NextResponse } from "next/server";
import { complete } from "@/lib/dictionary";

type Suggestion = { term: string; lang: "en" | "tr" };

async function datamuseSuggestions(q: string): Promise<Suggestion[]> {
  if (!/^[a-z][a-z '\-]{1,79}$/i.test(q)) return [];
  try {
    const response = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=8`, {
      signal: AbortSignal.timeout(1200),
      next: { revalidate: 86_400 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((item): Suggestion[] => {
      if (!item || typeof item !== "object") return [];
      const word = (item as Record<string, unknown>).word;
      return typeof word === "string" && word.length <= 80 ? [{ term: word, lang: "en" }] : [];
    });
  } catch {
    return [];
  }
}

/** Autocomplete for Netfener Sözlük: headwords and Turkish terms starting with `q`. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const local = complete(q);
  const external = local.length < 8 ? await datamuseSuggestions(q) : [];
  const seen = new Set(local.map((item) => item.term.toLocaleLowerCase("en")));
  const items = [...local, ...external.filter((item) => {
    const key = item.term.toLocaleLowerCase("en");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })].slice(0, 8);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
