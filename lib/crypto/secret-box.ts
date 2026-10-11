/**
 * Small authenticated encryption for secrets kept in the database (the Google Drive refresh
 * token). AES-256-GCM with a key derived from AUTH_SECRET, so a leaked table alone is useless.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const keyFrom = (secret: string, purpose: string) => createHash("sha256").update(`${purpose}:${secret}`).digest();

export function seal(plain: string, secret: string, purpose: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(secret, purpose), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function open(sealed: string, secret: string, purpose: string): string | null {
  const [iv, tag, data] = sealed.split(".").map((p) => Buffer.from(p ?? "", "base64url"));
  if (!iv?.length || !tag?.length || !data) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", keyFrom(secret, purpose), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
