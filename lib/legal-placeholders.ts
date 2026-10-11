import type { LegalDoc } from "@/content/legal-terms";

/**
 * Fills the {{TOKENS}} in legal texts. A required token with no value becomes a visible
 * "[Label]" gap; a {{?TOKEN}} (optional) paragraph disappears when its value is empty.
 */
export type LegalValues = { UNVAN: string; KRA_PIN: string; ADRES: string; EPOSTA: string; TELEFON: string; TR_KDV: string };

const LABELS: Record<keyof LegalValues, string> = {
  UNVAN: "TİCARİ UNVAN",
  KRA_PIN: "VERGİ NUMARASI",
  ADRES: "AÇIK ADRES",
  EPOSTA: "E-POSTA",
  TELEFON: "TELEFON",
  TR_KDV: "",
};

function fill(text: string, values: LegalValues) {
  return text
    .replace(/\{\{\?(\w+)\}\}/g, (_, key: keyof LegalValues) => (values[key] ? (key === "TR_KDV" ? `Türkiye KDV kayıt numarası: ${values[key]}` : values[key]) : ""))
    .replace(/\{\{(\w+)\}\}/g, (_, key: keyof LegalValues) => values[key] || `[${LABELS[key] ?? key}]`);
}

const isEmpty = (paragraph: string) => paragraph.replace(/^[•>]\s*/, "").trim() === "";

export function fillLegalDoc(doc: LegalDoc, values: LegalValues): LegalDoc {
  return {
    ...doc,
    body: fill(doc.body, values),
    sections: doc.sections?.map((section) => ({
      ...section,
      paragraphs: section.paragraphs.map((p) => fill(p, values)).filter((p) => !isEmpty(p)),
    })),
  };
}

/** A gap still waiting for real details ("[AÇIK ADRES]", "[SÜRE]" …): the page keeps its TASLAK badge. */
export function hasLegalGaps(doc: LegalDoc) {
  const text = [doc.body, ...(doc.sections ?? []).flatMap((s) => [s.heading, ...s.paragraphs])].join("\n");
  return /\[[A-ZÇĞİÖŞÜ][^\]]*\]/.test(text);
}
