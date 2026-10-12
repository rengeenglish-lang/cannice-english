/**
 * Netfener reviews ("Yorumlar") and the review-reward promotion. Pure rules, unit-tested; the data
 * side is server/services/site-reviews.service.ts.
 *
 * While the promotion is on, a learner's first comprehensive text review earns a 50% coupon for one
 * plan and their first video review (with consent to show it on the site) earns a 100% coupon for
 * one plan. The coupon is issued as soon as the review is posted; reviews stay hidden until an admin
 * approves them, and a rejected review's unused coupon is withdrawn. Rewards never depend on the
 * rating, and every rewarded review is labelled as such when shown.
 */

export type ReviewKind = "TEXT" | "VIDEO";

export const REVIEW_MIN_CHARS = 40;
export const REVIEW_MAX_CHARS = 4000;
/** A "comprehensive" text review: long enough to earn the text reward. */
export const TEXT_REWARD_MIN_CHARS = 400;
export const REWARD_PERCENT: Record<ReviewKind, number> = { TEXT: 50, VIDEO: 100 };
export const REWARD_VALID_DAYS = 90;

export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
/** Hard limit: a video review may be at most 90 seconds long (half a second of slack for encoders). */
export const VIDEO_MAX_SECONDS = 90;
export const exceedsVideoLimit = (seconds: number) => seconds > VIDEO_MAX_SECONDS + 0.5;
/** What R2 stores is played as-is, so only formats every browser plays are accepted. */
export const VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export const VIDEO_USAGE_CONSENT_TEXT =
  "Videomun ve videoda görünen adımın, yüzümün ve sesimin Netfener tarafından netfener.com'da ve Netfener'in sosyal medya hesaplarında tanıtım amacıyla, süresiz ve ücretsiz olarak yayımlanmasına izin veriyorum. Bu izni destek@netfener.com adresine yazarak istediğim zaman geri alabilirim; geri aldığımda videom yayından kaldırılır.";

export const REWARD_DISCLOSURE = "Bu yorumu paylaşan öğrenciye plan indirimi verildi.";

export function rewardPercentFor(kind: ReviewKind, body: string) {
  if (kind === "TEXT" && body.trim().length < TEXT_REWARD_MIN_CHARS) return 0;
  return REWARD_PERCENT[kind];
}

/** Why no reward was given (shown to the learner), or null when one is due. */
export function rewardBlocker(input: { kind: ReviewKind; body: string; promotionOn: boolean; alreadyRewarded: boolean; emailVerified: boolean }) {
  if (!input.promotionOn) return "Ödüllü yorum kampanyası şu an aktif değil.";
  if (input.alreadyRewarded) return input.kind === "VIDEO" ? "Video yorum ödülünü daha önce aldın." : "Yazılı yorum ödülünü daha önce aldın.";
  if (!input.emailVerified) return "Ödül için önce e-posta adresini doğrulamalısın.";
  if (rewardPercentFor(input.kind, input.body) === 0) return `Ödül için yorumun en az ${TEXT_REWARD_MIN_CHARS} karakter olmalı.`;
  return null;
}

const LINK_HOSTS = ["youtube.com", "youtu.be", "instagram.com", "tiktok.com", "drive.google.com"];

/** Accepts an https link to YouTube, Instagram, TikTok or Google Drive; returns the cleaned URL. */
export function normaliseVideoLink(raw: string) {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^(www|m)\./, "");
    return LINK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** youtube.com/watch?v=ID, youtu.be/ID or /shorts/ID → privacy-friendly embed URL; null for other hosts. */
export function youtubeEmbedUrl(link: string) {
  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^(www|m)\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com") id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] ?? null;
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

/** "Ayşe Nur Yılmaz" → "Ayşe Y." — what shows next to a public review by default. */
export function defaultDisplayName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last.charAt(0).toLocaleUpperCase("tr-TR")}.` : first;
}

/** Discount for a plan-only reward coupon: the given percent of the single most expensive plan unit. */
export function scopedDiscount(percent: number, units: { category: string; unitPrice: number }[], category: string) {
  const best = Math.max(0, ...units.filter((u) => u.category === category).map((u) => u.unitPrice));
  return Math.round(best * (percent / 100) * 100) / 100;
}

/**
 * Duration of an MP4/MOV from its "mvhd" box, found in a chunk of the file (the box sits at the
 * start of web-optimised files and at the end of most phone recordings). Null when not in `buf`.
 */
export function mp4DurationSeconds(buf: Uint8Array): number | null {
  for (let i = 4; i + 32 <= buf.length; i++) {
    if (buf[i] !== 0x6d || buf[i + 1] !== 0x76 || buf[i + 2] !== 0x68 || buf[i + 3] !== 0x64) continue; // "mvhd"
    // A real box header: its 4-byte size (just before the type) is that of an mvhd box (108 or 120 bytes).
    const boxSize = new DataView(buf.buffer, buf.byteOffset + i - 4, 4).getUint32(0);
    if (boxSize < 100 || boxSize > 140) continue;
    const view = new DataView(buf.buffer, buf.byteOffset + i + 4);
    const version = view.getUint8(0);
    const timescale = version === 1 ? view.getUint32(20) : view.getUint32(12);
    const duration = version === 1 ? Number(view.getBigUint64(24)) : view.getUint32(16);
    if (timescale > 0 && duration >= 0) return duration / timescale;
  }
  return null;
}
