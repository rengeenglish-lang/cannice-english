import "server-only";
import { db } from "@/server/db";

export function listNotificationsForUser(userId: string) {
  return db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export function countUnreadNotifications(userId: string) {
  return db.notification.count({ where: { userId, isRead: false } });
}

export async function createNotification(userId: string, data: { title: string; body?: string; href?: string }) {
  return db.notification.create({ data: { userId, title: data.title, body: data.body ?? null, href: data.href ?? null } });
}

export async function markNotificationRead(id: string, userId: string) {
  return db.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export async function markAllNotificationsRead(userId: string) {
  return db.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
