import { CHECKOUT_CONSENT_TEXT, CHECKOUT_ORDER_BUTTON } from "@/lib/checkout-consent";
import { REFUND_POLICY, TERMS_OF_USE } from "@/content/policies";

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
  "mesafeli-satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    draft: true,
    updatedAt: "27 Eylül 2026",
    sections: [
      { heading: "Zorunlu Onay 1 — Sözleşme ve Ön Bilgilendirme", paragraphs: [CHECKOUT_CONSENT_TEXT.agreement] },
      { heading: "Zorunlu Onay 2 — Dijital İçeriğin Hemen Sunulması", paragraphs: ["Yalnızca satın alınan ürün gerçekten anında sunulan dijital içerik/hizmet niteliğindeyse gösterilir.", CHECKOUT_CONSENT_TEXT.immediateDigital] },
      { heading: "Canlı Hizmetin Erken Başlatılması Gerekiyorsa", paragraphs: [CHECKOUT_CONSENT_TEXT.earlyService] },
      { heading: "Ödeme Butonu", paragraphs: [CHECKOUT_ORDER_BUTTON] },
    ],
    body: "Bu sözleşme, Netfener platformu üzerinden gerçekleştirilen mesafeli satışlara ilişkin tarafların hak ve yükümlülüklerini düzenler. Nihai metin hukuki inceleme sonrasında yayınlanacaktır — bu sayfa yer tutucu (taslak) içeriktir.",
  },
  "on-bilgilendirme-formu": {
    title: "Ön Bilgilendirme Formu",
    body: "Bu sayfa ön bilgilendirme formu için taslaktır. Nihai belge metni henüz yayımlanmamıştır.",
    draft: true,
  },
  "uyelik-sozlesmesi": {
    title: "Üyelik Sözleşmesi",
    body: "Bu sözleşme, Netfener platformuna üye olan kullanıcıların uyması gereken kuralları ve platformun sunduğu hizmetlerin kapsamını belirler. Nihai metin hukuki inceleme sonrasında yayınlanacaktır — bu sayfa yer tutucu (taslak) içeriktir.",
  },
  "gizlilik-sozlesmesi": {
    title: "Gizlilik Sözleşmesi",
    body: "Kullanıcılarımızın kişisel verilerinin nasıl toplandığı, işlendiği ve korunduğu bu belgede açıklanır. Nihai metin hukuki inceleme sonrasında yayınlanacaktır — bu sayfa yer tutucu (taslak) içeriktir.",
  },
  "aydinlatma-metni": {
    title: "Aydınlatma Metni",
    body: "KVKK kapsamında veri sorumlusu sıfatıyla kişisel verilerinizin işlenmesine ilişkin aydınlatma metni. Nihai metin hukuki inceleme sonrasında yayınlanacaktır — bu sayfa yer tutucu (taslak) içeriktir.",
  },
  "acik-riza-metni": {
    title: "Açık Rıza Metni",
    body: "Kişisel verilerinizin belirli amaçlarla işlenmesine yönelik açık rızanızın alındığı metin. Nihai metin hukuki inceleme sonrasında yayınlanacaktır — bu sayfa yer tutucu (taslak) içeriktir.",
  },
};
