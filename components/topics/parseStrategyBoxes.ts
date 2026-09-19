export type StrategyBoxType = "strateji" | "ornek-soru" | "dikkat";

export type StrategySegment =
  | { kind: "text"; content: string }
  | { kind: "box"; boxType: StrategyBoxType; content: string };

const BOX_MARKER = /\[(STRATEJI|ORNEK_SORU|DIKKAT)\]\s*([\s\S]*?)\s*\[\/\1\]/g;

const BOX_TYPE_MAP: Record<string, StrategyBoxType> = {
  STRATEJI: "strateji",
  ORNEK_SORU: "ornek-soru",
  DIKKAT: "dikkat",
};

/** Detects the "► STRATEJİ ◄" / "ÖRNEK SORU" callout boxes used in the YDS Stratejileri topic. */
export function hasStrategyBoxes(body: string): boolean {
  return /\[(STRATEJI|ORNEK_SORU|DIKKAT)\]/.test(body);
}

/**
 * Splits a section body into plain-text and boxed segments, in order, using
 * inline [STRATEJI]...[/STRATEJI] / [ORNEK_SORU]...[/ORNEK_SORU] /
 * [DIKKAT]...[/DIKKAT] markers authored in prisma/seed.ts. Content with no
 * markers returns a single text segment, so this is safe to call on any
 * lesson body.
 */
export function parseStrategyBoxes(body: string): StrategySegment[] {
  const segments: StrategySegment[] = [];
  let cursor = 0;

  for (const match of body.matchAll(BOX_MARKER)) {
    const [full, tag, content] = match;
    const index = match.index ?? 0;
    const before = body.slice(cursor, index).trim();
    if (before) segments.push({ kind: "text", content: before });
    segments.push({ kind: "box", boxType: BOX_TYPE_MAP[tag], content: content.trim() });
    cursor = index + full.length;
  }

  const rest = body.slice(cursor).trim();
  if (rest) segments.push({ kind: "text", content: rest });

  return segments;
}
