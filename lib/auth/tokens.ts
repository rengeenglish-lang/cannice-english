/**
 * Single-use email links (password reset, email verification). The raw token only ever travels
 * in the email; the database keeps its SHA-256, so a leaked table can't be turned into links.
 * Pure (node:crypto only) so it is unit-tested.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const RESET_TTL_MS = 60 * 60 * 1000;
export const VERIFY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Reset emails per account per hour, so the form can't be used to flood someone's inbox. */
export const RESET_HOURLY_LIMIT = 3;

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** A well-formed token is 43 base64url characters; anything else is rejected before a lookup. */
export const isTokenShaped = (token: unknown): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);

// ---------- cart-reminder unsubscribe (stateless, like the coaching one) ----------

const sign = (userId: string, secret: string) => createHmac("sha256", secret).update(`cart-reminder:${userId}`).digest("base64url");

export function cartUnsubscribeToken(userId: string, secret: string) {
  return `${Buffer.from(userId).toString("base64url")}.${sign(userId, secret)}`;
}

export function verifyCartUnsubscribeToken(token: string, secret: string): string | null {
  const [idPart, sig] = token.split(".");
  if (!idPart || !sig) return null;
  const userId = Buffer.from(idPart, "base64url").toString();
  if (!userId) return null;
  const expected = Buffer.from(sign(userId, secret));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given) ? userId : null;
}
