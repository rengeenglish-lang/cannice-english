import { REFUND_POLICY, TERMS_OF_USE } from "@/content/policies";
import { NETFENER_LEGAL_DOCS } from "@/content/legal/netfener-legal";

export type LegalSection = { id?: string; heading: string; paragraphs: string[] };
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
  "mesafeli-satis-sozlesmesi": NETFENER_LEGAL_DOCS["mesafeli-satis-sozlesmesi"],
  "on-bilgilendirme-formu": {
    title: "Ön Bilgilendirme Formu",
    body: "Bu sayfa ön bilgilendirme formu için taslaktır. Nihai belge metni henüz yayımlanmamıştır.",
    draft: true,
  },
  "uyelik-sozlesmesi": NETFENER_LEGAL_DOCS["uyelik-sozlesmesi"],
  "gizlilik-sozlesmesi": NETFENER_LEGAL_DOCS["gizlilik-sozlesmesi"],
  "aydinlatma-metni": NETFENER_LEGAL_DOCS["aydinlatma-metni"],
  "acik-riza-metni": NETFENER_LEGAL_DOCS["acik-riza-metni"],
};
