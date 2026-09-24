import { SUPPORT_EMAIL } from "@/lib/social";

/**
 * Seller / data-controller identity used by every legal document (Mesafeli Satış Sözleşmesi, Ön
 * Bilgilendirme Formu, Aydınlatma Metni…). The Mesafeli Sözleşmeler Yönetmeliği and KVKK require
 * these to be real — fill in every "[…]" value before the documents go live.
 */
export const LEGAL_ENTITY = {
  brand: "Netfener",
  /** Ticari unvan, e.g. "Netfener Eğitim Teknolojileri Ltd. Şti." or the şahıs işletmesi owner's name. */
  legalName: "[Şirket unvanı]",
  address: "[Açık adres]",
  /** MERSİS numarası (şirket) or VKN/TCKN (şahıs işletmesi). */
  registryNumber: "[MERSİS / Vergi kimlik numarası]",
  taxOffice: "[Vergi dairesi]",
  phone: "[Telefon]",
  email: SUPPORT_EMAIL,
  /** Kayıtlı elektronik posta — optional for şahıs işletmeleri. */
  kep: "[KEP adresi]",
  website: "[Web sitesi adresi]",
} as const;

/** True once every placeholder above has been replaced with real details. */
export function isLegalEntityComplete() {
  return !Object.values(LEGAL_ENTITY).some((value) => value.includes("["));
}

export function sellerIdentityLines() {
  return [
    `Unvan: ${LEGAL_ENTITY.legalName} (“${LEGAL_ENTITY.brand}”)`,
    `Adres: ${LEGAL_ENTITY.address}`,
    `MERSİS / Vergi No: ${LEGAL_ENTITY.registryNumber} · Vergi Dairesi: ${LEGAL_ENTITY.taxOffice}`,
    `Telefon: ${LEGAL_ENTITY.phone} · E-posta: ${LEGAL_ENTITY.email} · KEP: ${LEGAL_ENTITY.kep}`,
    `Web sitesi: ${LEGAL_ENTITY.website}`,
  ];
}
