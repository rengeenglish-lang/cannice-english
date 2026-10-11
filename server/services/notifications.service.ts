import "server-only";
import { after } from "next/server";
import { db } from "@/server/db";
import { pushToUser } from "@/server/push/web-push";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { NotificationCategory } from "@/lib/generated/prisma/enums";

/** Everything except purchases is cleared this long after it was (last) sent. */
export const NOTIFICATION_RETENTION_DAYS = 30;

export type NotificationInput = {
  title: string;
  body?: string | null;
  href?: string | null;
  category?: NotificationCategory;
  /**
   * Notifications about the same thing share a key: sending again replaces the earlier one (new
   * text, back to unread and out of the archive, moved to the top) instead of adding another.
   */
  key?: string;
};

type Client = Prisma.TransactionClient | typeof db;

/**
 * Sends (or, with a key, replaces) one in-app notification, and the same message to the user's
 * phone/desktop if they turned push notifications on. Inside a transaction (`client` given) only
 * the in-app note is written; the caller pushes after commit with pushNotification().
 */
export async function notify(userId: string, input: NotificationInput, client: Client = db) {
  const data = { title: input.title, body: input.body ?? null, href: input.href ?? null, category: input.category ?? "SYSTEM" };
  const note = input.key
    ? await client.notification.upsert({
        where: { userId_dedupeKey: { userId, dedupeKey: input.key } },
        create: { userId, dedupeKey: input.key, ...data },
        update: { ...data, isRead: false, archivedAt: null, createdAt: new Date() },
      })
    : await client.notification.create({ data: { userId, ...data } });
  if (client === db) pushNotification(userId, input);
  return note;
}

/**
 * Push delivery never delays or breaks the action that caused it: during a request it runs after
 * the response; elsewhere (cron, tests) it runs in the background.
 */
export function pushNotification(userId: string, input: NotificationInput) {
  const send = () => pushToUser(userId, { title: input.title, body: input.body, url: input.href, tag: input.key }).catch(() => 0);
  try {
    after(send);
  } catch {
    void send();
  }
}

/**
 * For scheduled reminders: sends at most once per `onceKey`, even when the student deleted the
 * note in between, so a cron running every hour never re-reminds about the same thing. Shares the
 * EmailLog table with emails (keys prefixed "inapp:").
 */
export async function notifyOnce(onceKey: string, userId: string, input: NotificationInput) {
  try {
    await db.emailLog.create({ data: { key: `inapp:${onceKey}`, kind: "IN_APP", to: userId } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return false;
    throw error;
  }
  await notify(userId, input);
  return true;
}

/** Kept for existing callers: an uncategorised, unkeyed notification. */
export function createNotification(userId: string, data: { title: string; body?: string; href?: string }) {
  return notify(userId, data);
}

/** Same notification to every active admin (e.g. a havale waiting for approval). */
export async function notifyAdmins(input: NotificationInput) {
  const admins = await db.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  for (const admin of admins) await notify(admin.id, { category: "ADMIN", ...input });
  return admins.length;
}

/** Removes a keyed notification once it no longer applies (cart bought, havale approved). */
export function withdrawNotification(key: string, userId?: string) {
  return db.notification.deleteMany({ where: { dedupeKey: key, ...(userId ? { userId } : {}) } });
}

// ---------- the notification centre ----------

export function listNotificationsForUser(userId: string, opts: { archived?: boolean } = {}) {
  return db.notification.findMany({
    where: { userId, archivedAt: opts.archived ? { not: null } : null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function countUnreadNotifications(userId: string) {
  return db.notification.count({ where: { userId, isRead: false, archivedAt: null } });
}

export function setNotificationDone(id: string, userId: string, done: boolean) {
  return db.notification.updateMany({ where: { id, userId }, data: { isRead: done } });
}

/** Kept for existing callers. */
export function markNotificationRead(id: string, userId: string) {
  return setNotificationDone(id, userId, true);
}

export function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({ where: { userId, isRead: false, archivedAt: null }, data: { isRead: true } });
}

export function setNotificationArchived(id: string, userId: string, archived: boolean) {
  return db.notification.updateMany({ where: { id, userId }, data: { archivedAt: archived ? new Date() : null, ...(archived ? { isRead: true } : {}) } });
}

export function archiveReadNotifications(userId: string) {
  return db.notification.updateMany({ where: { userId, isRead: true, archivedAt: null }, data: { archivedAt: new Date() } });
}

export function deleteNotification(id: string, userId: string) {
  return db.notification.deleteMany({ where: { id, userId } });
}

/** "Tümünü temizle": empties the inbox, or the archive. */
export function clearNotifications(userId: string, archived: boolean) {
  return db.notification.deleteMany({ where: { userId, archivedAt: archived ? { not: null } : null } });
}

/** Daily housekeeping: anything but a purchase record goes after 30 days. */
export function purgeOldNotifications(now = new Date()) {
  const cutoff = new Date(now.getTime() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  return db.notification.deleteMany({ where: { createdAt: { lt: cutoff }, category: { not: "PURCHASE" } } });
}
