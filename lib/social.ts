/** Netfener's social media profiles, linked from the footer. */
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61583837323529",
  instagram: "https://www.instagram.com/net.fener/",
} as const;

/** Support address used by Yardım Masası and the policies; also the Reply-To on site emails. */
export const SUPPORT_EMAIL = "destek@netfener.com";

/**
 * WhatsApp number for the floating "WhatsApp'tan yaz" button, in international format without
 * "+" or spaces (e.g. "905321234567"). Empty hides the button.
 */
export const WHATSAPP_NUMBER = "905052644511";
export const WHATSAPP_GREETING = "Merhaba, Netfener hakkında bilgi almak istiyorum.";

/** wa.me link with a prefilled message; `page` tells us where the visitor wrote from. */
export function whatsappLink(number: string, page?: string) {
  const digits = number.replace(/\D/g, "");
  const text = page ? `${WHATSAPP_GREETING} (${page})` : WHATSAPP_GREETING;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
