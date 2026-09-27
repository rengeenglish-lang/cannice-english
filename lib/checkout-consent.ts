export const CHECKOUT_CONSENT_VERSION = "2026-09-27.2";
export const CHECKOUT_CONSENT_TEXT = {
  agreement: "Mesafeli Satış Sözleşmesi'ni ve Ön Bilgilendirme Formu'nu okudum ve bilgilendirildim.",
  immediateDigital: "Satın aldığım dijital içerik/hizmetin ödeme sonrasında hemen kullanıma açılmasını talep ediyor ve onaylıyorum. Cayma hakkına ilişkin istisnalar konusunda bilgilendirildim.",
  earlyService: "Satın aldığım hizmetin 14 günlük cayma süresi sona ermeden önce başlamasını talep ediyor ve buna açıkça onay veriyorum. Cayma hakkına ilişkin sonuçlar konusunda bilgilendirildim.",
} as const;
export const CONSENT_INFORMATION_LINKS = {
  agreementConsent: [
    { href: "/legal/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi’ni oku" },
    { href: "/legal/on-bilgilendirme-formu", label: "Ön Bilgilendirme Formu’nu oku" },
  ],
  immediateDigitalConsent: [
    { href: "/legal/iade-politikasi#dijital-kaynaklar", label: "Dijital içeriklerde cayma ve iade koşullarını oku" },
    { href: "/legal/iade-politikasi#plan-iadeleri", label: "Plan satın alımlarının iade koşullarını oku" },
  ],
  earlyServiceConsent: [
    { href: "/legal/iade-politikasi#canli-grup-dersleri", label: "Erken başlayan canlı derslerin iade koşullarını oku" },
  ],
} as const;
export const CHECKOUT_ORDER_BUTTON = "ÖDEME YÜKÜMLÜLÜĞÜ DOĞURAN SİPARİŞİ ONAYLA";
export type ConsentRequirements = { immediateDigital: boolean; earlyService: boolean };
export type CheckoutDelivery = { productId: string; immediateDigital: boolean; liveStartsAt: Date | null };
export function consentRequirements(deliveries: CheckoutDelivery[], now = new Date()): ConsentRequirements {
  const boundary = now.getTime() + 14 * 24 * 60 * 60 * 1000;
  return {
    immediateDigital: deliveries.some((item) => item.immediateDigital),
    earlyService: deliveries.some((item) => item.liveStartsAt !== null && item.liveStartsAt.getTime() >= now.getTime() && item.liveStartsAt.getTime() < boundary),
  };
}
/** Requirements come from current server-side delivery data, never submitted flags. */
export function acceptCheckoutConsents(requirements: ConsentRequirements, form: Pick<FormData, "get">, now = new Date()) {
  if (form.get("consentVersion") !== CHECKOUT_CONSENT_VERSION) throw new Error("Sipariş onayları güncellendi. Lütfen sayfayı yenileyip tekrar inceleyin.");
  if (form.get("agreementConsent") !== "on") throw new Error("Sözleşme ve ön bilgilendirme onayını işaretleyin.");
  if (requirements.immediateDigital && form.get("immediateDigitalConsent") !== "on") throw new Error("Dijital içeriğin hemen sunulması için ayrı onayınız gerekiyor.");
  if (requirements.earlyService && form.get("earlyServiceConsent") !== "on") throw new Error("Hizmetin 14 gün dolmadan başlaması için ayrı onayınız gerekiyor.");
  return {
    version: CHECKOUT_CONSENT_VERSION, acceptedAt: now.toISOString(),
    agreement: { accepted: true, text: CHECKOUT_CONSENT_TEXT.agreement, informationLinks: [...CONSENT_INFORMATION_LINKS.agreementConsent] },
    immediateDigital: { required: requirements.immediateDigital, accepted: requirements.immediateDigital, text: requirements.immediateDigital ? CHECKOUT_CONSENT_TEXT.immediateDigital : null, informationLinks: requirements.immediateDigital ? [...CONSENT_INFORMATION_LINKS.immediateDigitalConsent] : [] },
    earlyService: { required: requirements.earlyService, accepted: requirements.earlyService, text: requirements.earlyService ? CHECKOUT_CONSENT_TEXT.earlyService : null, informationLinks: requirements.earlyService ? [...CONSENT_INFORMATION_LINKS.earlyServiceConsent] : [] },
  };
}
