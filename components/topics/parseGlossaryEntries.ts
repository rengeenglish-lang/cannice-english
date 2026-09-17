import type { AccordionSection } from "@/components/topics/parseAccordionSections";

/**
 * Splits a glossary lesson's contentBody (a list of "term – meaning\nÖrnek: ..."
 * entries joined by blank lines) back into individual entries, then groups
 * them into fixed-size chunks (default 10) rendered as accordion sections
 * labelled by their position range ("1–10", "11–20", ...).
 */
export function parseGlossaryEntries(contentBody: string): string[] {
  return contentBody
    .split(/\n\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function groupGlossaryIntoAccordion(entries: string[], groupSize = 10): AccordionSection[] {
  const sections: AccordionSection[] = [];
  for (let i = 0; i < entries.length; i += groupSize) {
    const chunk = entries.slice(i, i + groupSize);
    const title = chunk.length === 1 ? `${i + 1}` : `${i + 1}–${i + chunk.length}`;
    sections.push({ title, body: chunk.join("\n\n") });
  }
  return sections;
}
