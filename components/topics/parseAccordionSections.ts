export type AccordionSection = { title: string; body: string };

/**
 * Splits a lesson's contentBody into named accordion sections when it has
 * the shape of an intro lesson written as several "\n\n"-separated blocks:
 * the first block becomes "Genel Açıklama", the last becomes "Sonuç olarak",
 * and any block in between uses its own first line as the section title
 * (matching how phrasalVerbIntro in prisma/seed.ts is written, e.g. "Geçişli
 * mi, geçişsiz mi?" or "Particle'ın anlamı tamamen rastgele değildir" as a
 * block's opening line). Returns null when the content is a single block,
 * so lessons with plain one-paragraph content (every other topic's
 * "Konuya Giriş") fall back to the ordinary prose card untouched.
 */
export function parseAccordionSections(contentBody: string): AccordionSection[] | null {
  const blocks = contentBody
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length < 2) return null;

  return blocks.map((block, index) => {
    if (index === 0) return { title: "Genel Açıklama", body: block };
    if (index === blocks.length - 1) return { title: "Sonuç olarak", body: block };

    const lines = block.split("\n");
    const title = lines[0].trim();
    const body = lines.slice(1).join("\n").trim();
    return { title, body: body || block };
  });
}
