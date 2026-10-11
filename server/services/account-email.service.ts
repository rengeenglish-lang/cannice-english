import "server-only";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { hashPassword } from "@/server/auth/password";
import { sendNow } from "@/server/email/transactional";
import { RESET_HOURLY_LIMIT, RESET_TTL_MS, VERIFY_TTL_MS, hashToken, isTokenShaped, newToken } from "@/lib/auth/tokens";
import { renderPasswordResetEmail, renderVerifyEmail, renderWelcomeEmail, renderWelcomeVerifyEmail } from "@/lib/email/templates";
import type { AuthTokenKind } from "@/lib/generated/prisma/enums";

const site = () => getSiteUrl().replace(/\/$/, "");

async function issueToken(userId: string, kind: AuthTokenKind, ttlMs: number) {
  const token = newToken();
  await db.authToken.create({ data: { userId, kind, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + ttlMs) } });
  return token;
}

/** The live (unused, unexpired) token row for a raw token of the given kind, or null. */
async function findLiveToken(token: unknown, kind: AuthTokenKind) {
  if (!isTokenShaped(token)) return null;
  const row = await db.authToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: { select: { id: true, isActive: true } } } });
  if (!row || row.kind !== kind || row.usedAt || row.expiresAt <= new Date() || !row.user.isActive) return null;
  return row;
}

// ---------- verification + welcome ----------

/** Right after a password sign-up: one email that welcomes and carries the verification link. */
export async function sendWelcomeVerification(user: { id: string; email: string; name: string }) {
  const token = await issueToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
  const verifyUrl = `${site()}/api/email/verify?t=${token}`;
  return sendNow("WELCOME_VERIFY", user.email, renderWelcomeVerifyEmail({ name: user.name, verifyUrl, siteUrl: site() }));
}

/** "Doğrulama e-postasını tekrar gönder". Limited like resets so the button can't spam. */
export async function resendVerification(userId: string): Promise<"sent" | "verified" | "limited" | "failed"> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, emailVerifiedAt: true } });
  if (!user) return "failed";
  if (user.emailVerifiedAt) return "verified";
  const recent = await db.authToken.count({ where: { userId, kind: "EMAIL_VERIFY", createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } } });
  if (recent >= RESET_HOURLY_LIMIT) return "limited";
  const token = await issueToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
  const verifyUrl = `${site()}/api/email/verify?t=${token}`;
  return (await sendNow("VERIFY", user.email, renderVerifyEmail({ name: user.name, verifyUrl, siteUrl: site() }))) ? "sent" : "failed";
}

/** Verification links may be opened by mail scanners first; that only verifies early, which is harmless. */
export async function verifyEmailToken(token: unknown) {
  const row = await findLiveToken(token, "EMAIL_VERIFY");
  if (!row) return false;
  await db.$transaction([
    db.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: new Date() } }),
  ]);
  return true;
}

/** First Google sign-in: Google already verified the address, so just say welcome. */
export async function sendGoogleWelcome(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (!user) return false;
  return sendNow("WELCOME", user.email, renderWelcomeEmail({ name: user.name, siteUrl: site() }));
}

// ---------- password reset ----------

/**
 * "Şifremi unuttum". Always looks the same from outside (whether or not the address has an
 * account), so the form can't be used to find out who is registered.
 */
export async function requestPasswordReset(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, isActive: true } });
  if (!user?.isActive) return;
  const recent = await db.authToken.count({ where: { userId: user.id, kind: "PASSWORD_RESET", createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } } });
  if (recent >= RESET_HOURLY_LIMIT) return;
  const token = await issueToken(user.id, "PASSWORD_RESET", RESET_TTL_MS);
  const resetUrl = `${site()}/sifre-sifirla?t=${token}`;
  await sendNow("PASSWORD_RESET", user.email, renderPasswordResetEmail({ name: user.name, resetUrl, siteUrl: site() }));
}

export async function isResetTokenValid(token: unknown) {
  return Boolean(await findLiveToken(token, "PASSWORD_RESET"));
}

/**
 * Sets the new password and burns every open reset link for the account. Reaching the link also
 * proves the address, so the account counts as verified from here on.
 */
export async function resetPassword(token: unknown, newPassword: string) {
  const row = await findLiveToken(token, "PASSWORD_RESET");
  if (!row) return false;
  const password = await hashPassword(newPassword);
  const now = new Date();
  return db.$transaction(async (tx) => {
    // Claim this link first: of two simultaneous submits, only one gets to set a password.
    const claimed = await tx.authToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: now } });
    if (claimed.count !== 1) return false;
    await tx.authToken.updateMany({ where: { userId: row.userId, kind: "PASSWORD_RESET", usedAt: null }, data: { usedAt: now } });
    await tx.user.update({ where: { id: row.userId }, data: { password, emailVerifiedAt: now } });
    return true;
  });
}
