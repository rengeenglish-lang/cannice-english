import "server-only";
import { db } from "@/server/db";

export type GoogleProfile = { email?: string | null; emailVerified?: boolean | null; name?: string | null; image?: string | null };
export type GoogleResolution =
  | { ok: true; userId: string; created: boolean; passwordCleared: boolean }
  | { ok: false; reason: "unverified" | "inactive" };

export const isGoogleConfigured = () => Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

/**
 * Maps a Google identity to a Netfener account by *verified* e-mail. Creates a STUDENT account on
 * first use. Linking to an existing password account removes that password: password sign-ups are
 * not e-mail-verified, so without this an attacker could pre-register a victim's address and keep
 * access after the victim signs in with Google. Roles and active state are never changed here.
 */
export async function resolveGoogleUser(profile: GoogleProfile): Promise<GoogleResolution> {
  const email = profile.email?.trim().toLowerCase();
  if (!email || profile.emailVerified !== true) return { ok: false, reason: "unverified" };
  const existing = await db.user.findUnique({ where: { email }, select: { id: true, isActive: true, password: true, image: true } });
  if (existing) {
    if (!existing.isActive) return { ok: false, reason: "inactive" };
    const data: { password?: null; image?: string } = {};
    if (existing.password) data.password = null;
    if (!existing.image && profile.image) data.image = profile.image;
    if (Object.keys(data).length) await db.user.update({ where: { id: existing.id }, data });
    return { ok: true, userId: existing.id, created: false, passwordCleared: Boolean(existing.password) };
  }
  const name = (profile.name?.trim() || email.split("@")[0]).slice(0, 120);
  try {
    const user = await db.user.create({ data: { email, name, image: profile.image ?? null, role: "STUDENT" }, select: { id: true } });
    return { ok: true, userId: user.id, created: true, passwordCleared: false };
  } catch {
    // A concurrent first sign-in created the account; resolve against it instead of failing.
    const raced = await db.user.findUnique({ where: { email }, select: { id: true, isActive: true } });
    return raced?.isActive ? { ok: true, userId: raced.id, created: false, passwordCleared: false } : { ok: false, reason: "inactive" };
  }
}
