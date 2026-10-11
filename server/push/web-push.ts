import "server-only";
import webpush from "web-push";
import { db } from "@/server/db";
import { open, seal } from "@/lib/crypto/secret-box";
import { SUPPORT_EMAIL } from "@/lib/social";

/**
 * Web Push (phone and desktop notifications). The VAPID key pair is created once, on first use,
 * and kept in the database (private key encrypted with AUTH_SECRET), so no extra environment
 * variables are needed. Changing AUTH_SECRET makes the site create a new pair; existing
 * subscriptions then stop working and students simply turn notifications on again.
 */
const PUBLIC_KEY = "push_vapid_public";
const PRIVATE_KEY = "push_vapid_private";
const PURPOSE = "web-push";

async function readKeys(secret: string) {
  const rows = await db.appSetting.findMany({ where: { key: { in: [PUBLIC_KEY, PRIVATE_KEY] } } });
  const publicKey = rows.find((r) => r.key === PUBLIC_KEY)?.value;
  const sealed = rows.find((r) => r.key === PRIVATE_KEY)?.value;
  const privateKey = sealed ? open(sealed, secret, PURPOSE) : null;
  return publicKey && privateKey ? { publicKey, privateKey } : null;
}

export async function vapidKeys() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const existing = await readKeys(secret);
  if (existing) return existing;
  const fresh = webpush.generateVAPIDKeys();
  // Two first requests at once: whichever writes first wins, the other re-reads.
  await db.$transaction([
    db.appSetting.deleteMany({ where: { key: { in: [PUBLIC_KEY, PRIVATE_KEY] } } }),
    db.appSetting.create({ data: { key: PUBLIC_KEY, value: fresh.publicKey } }),
    db.appSetting.create({ data: { key: PRIVATE_KEY, value: seal(fresh.privateKey, secret, PURPOSE) } }),
  ]).catch(() => undefined);
  await db.pushSubscription.deleteMany({}); // subscriptions made with an old pair can't be used
  return readKeys(secret);
}

export async function savePushSubscription(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }, userAgent: string | null) {
  return db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent },
    update: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent },
  });
}

export function removePushSubscription(userId: string, endpoint: string) {
  return db.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

export type PushPayload = { title: string; body?: string | null; url?: string | null; tag?: string };

/** Sends to every device the user turned notifications on for; dead subscriptions are removed. */
export async function pushToUser(userId: string, payload: PushPayload) {
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return 0;
  const keys = await vapidKeys();
  if (!keys) return 0;
  const body = JSON.stringify({ title: payload.title, body: payload.body ?? "", url: payload.url ?? "/dashboard/notifications", tag: payload.tag });
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, {
        vapidDetails: { subject: `mailto:${SUPPORT_EMAIL}`, publicKey: keys.publicKey, privateKey: keys.privateKey },
        TTL: 60 * 60 * 24,
        timeout: 10_000,
      });
      sent += 1;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => undefined);
      else console.error(`[push] send failed: ${status ?? (error instanceof Error ? error.message : "error")}`);
    }
  }
  return sent;
}
