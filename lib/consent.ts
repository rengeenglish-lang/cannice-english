/**
 * Consent wording and cookie-consent format, shared by the sign-up form, the profile page, the
 * cookie banner and the server. Change the wording → bump CONSENT_TEXT_VERSION, so the consent
 * log shows which text each person agreed to.
 */
export const CONSENT_TEXT_VERSION = "2026-10-11";

export const TERMS_CONSENT_TEXT = "Üyelik Sözleşmesi'ni okudum ve kabul ediyorum.";
export const MARKETING_CONSENT_TEXT =
  "Netfener'in kampanya, indirim, yeni içerik, sınav programı, ders ve hizmet duyurularını seçtiğim kanallardan göndermesine izin veriyorum. Bu onayı dilediğim zaman geri çekebilirim.";

export const MARKETING_CHANNELS = [
  { key: "marketingEmail", kind: "MARKETING_EMAIL", label: "E-posta almak istiyorum." },
  { key: "marketingSms", kind: "MARKETING_SMS", label: "SMS almak istiyorum." },
  { key: "marketingPhone", kind: "MARKETING_PHONE", label: "Telefonla aranmak istiyorum." },
] as const;
export type MarketingKey = (typeof MARKETING_CHANNELS)[number]["key"];

// ---------- cookies ----------

export const COOKIE_CONSENT_NAME = "nf_cookie_consent";
/** Asked again after six months, and whenever the categories change (version). */
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 182;
export const COOKIE_CONSENT_VERSION = 1;

export type CookieChoices = { functional: boolean; analytics: boolean; marketing: boolean };
export type CookieConsent = CookieChoices & { v: number; at: string };

export const COOKIE_CATEGORIES: { key: keyof CookieChoices | "necessary"; title: string; description: string }[] = [
  { key: "necessary", title: "Zorunlu çerezler", description: "Oturum açma, sepet, ödeme güvenliği ve çerez tercihinin kendisi. Site bunlar olmadan çalışmaz; her zaman açıktır." },
  { key: "functional", title: "İşlevsel çerezler", description: "Canlı destek sohbeti (Tawk.to). Kapalıyken sohbet penceresi yüklenmez; bize e-postayla ulaşabilirsin." },
  { key: "analytics", title: "Analitik çerezler", description: "Site kullanımını ölçen araçlar. Netfener şu anda üçüncü taraf analitik aracı kullanmıyor; eklenirse yalnızca bu izinle çalışır." },
  { key: "marketing", title: "Pazarlama çerezleri", description: "Reklam ve yeniden pazarlama araçları. Şu anda kullanılmıyor; eklenirse yalnızca bu izinle çalışır." },
];

export function parseCookieConsent(raw: string | undefined | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsent>;
    if (value.v !== COOKIE_CONSENT_VERSION) return null;
    return { v: value.v, at: String(value.at ?? ""), functional: value.functional === true, analytics: value.analytics === true, marketing: value.marketing === true };
  } catch {
    return null;
  }
}

export function serializeCookieConsent(choices: CookieChoices, now = new Date()) {
  const value: CookieConsent = { v: COOKIE_CONSENT_VERSION, at: now.toISOString(), ...choices };
  return encodeURIComponent(JSON.stringify(value));
}
