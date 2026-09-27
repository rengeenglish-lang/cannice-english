import { z } from "zod";
import { LEGAL_DOCS, type LegalDoc } from "@/content/legal-terms";
import { CHECKOUT_CONSENT_TEXT, CONSENT_INFORMATION_LINKS } from "@/lib/checkout-consent";

export const LEGAL_CONTENT_KEY = "legal_content_v1";
export const legalSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).max(100).optional(),
  heading: z.string().trim().min(1).max(250),
  paragraphs: z.array(z.string().trim().min(1).max(15000)).min(1).max(30),
}).strict();
export const legalDocumentSchema = z.object({
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(20).max(15000),
  sections: z.array(legalSectionSchema).max(60).default([]),
}).strict();
export const consentWordingSchema = z.object({
  agreement: z.string().trim().min(20).max(2000),
  immediateDigital: z.string().trim().min(20).max(2000),
  earlyService: z.string().trim().min(20).max(2000),
}).strict();
export type ConsentWording = z.infer<typeof consentWordingSchema>;
export type LegalBundle = {
  revision: number;
  documents: Record<string, { draft: LegalDoc; published?: LegalDoc }>;
  wording: { draft: ConsentWording; published: ConsentWording };
};
export function initialLegalBundle(): LegalBundle {
  return { revision: 0, documents: {}, wording: { draft: { ...CHECKOUT_CONSENT_TEXT }, published: { ...CHECKOUT_CONSENT_TEXT } } };
}
export function resolveLegalDocuments(bundle: LegalBundle): Record<string, LegalDoc> {
  return Object.fromEntries(Object.entries(LEGAL_DOCS).map(([key, document]) => [key, bundle.documents[key]?.published ?? document]));
}
export function validateLegalDocument(key: string, raw: unknown) {
  if (!Object.hasOwn(LEGAL_DOCS, key)) throw new Error("Belge bulunamadı.");
  const document = legalDocumentSchema.parse(raw);
  const ids = document.sections.flatMap((section) => section.id ? [section.id] : []);
  if (new Set(ids).size !== ids.length) throw new Error("Bölüm bağlantıları benzersiz olmalı.");
  const required = Object.values(CONSENT_INFORMATION_LINKS).flat().flatMap((link) => link.href.startsWith(`/legal/${key}#`) ? [link.href.split("#")[1]] : []);
  if (required.some((anchor) => !ids.includes(anchor))) throw new Error("Ödeme onaylarından bağlantı verilen bölümler kaldırılamaz. Başlık ve içeriklerini düzenleyebilirsiniz.");
  return document;
}
