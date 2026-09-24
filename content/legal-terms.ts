import { REFUND_POLICY, TERMS_OF_USE } from "@/content/policies";

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
  "mesafeli-satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    body: "Bu sözleşme, Netfener platformu üzerinden gerçekleştirilen mesafeli satışlara ilişkin tarafların hak ve yükümlülüklerini düzenler. Nihai metin hukuki inceleme sonrasında yayınlanacaktır — bu sayfa yer tutucu (taslak) içeriktir.",
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
