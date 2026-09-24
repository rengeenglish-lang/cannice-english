import { REFUND_POLICY, TERMS_OF_USE } from "@/content/policies";
import {
  COOKIE_POLICY,
  DISTANCE_SALES_AGREEMENT,
  EXPLICIT_CONSENT,
  KVKK_NOTICE,
  MEMBERSHIP_AGREEMENT,
  PRE_INFORMATION_FORM,
  PRIVACY_POLICY,
} from "@/content/legal-documents";

export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = {
  title: string;
  body: string;
  /** Full structured text; placeholder docs only have `body`. */
  sections?: LegalSection[];
  updatedAt?: string;
  /** Placeholder docs awaiting legal review show a "TASLAK" badge. */
  draft?: boolean;
};

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  "iade-politikasi": REFUND_POLICY,
  "kullanim-kosullari": TERMS_OF_USE,
  "mesafeli-satis-sozlesmesi": DISTANCE_SALES_AGREEMENT,
  "on-bilgilendirme-formu": PRE_INFORMATION_FORM,
  "uyelik-sozlesmesi": MEMBERSHIP_AGREEMENT,
  "gizlilik-sozlesmesi": PRIVACY_POLICY,
  "aydinlatma-metni": KVKK_NOTICE,
  "acik-riza-metni": EXPLICIT_CONSENT,
  "cerez-politikasi": COOKIE_POLICY,
};
