"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import {
  archiveReadNotifications,
  clearNotifications,
  deleteNotification,
  markAllNotificationsRead,
  setNotificationArchived,
  setNotificationDone,
} from "@/server/services/notifications.service";

async function userId() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  return user.id;
}

// The whole dashboard layout shows the unread count, so refresh it along with the page.
const refresh = () => revalidatePath("/dashboard", "layout");

export async function markNotificationReadAction(id: string) {
  await setNotificationDone(id, await userId(), true);
  refresh();
}

export async function setNotificationDoneAction(id: string, done: boolean) {
  await setNotificationDone(id, await userId(), done);
  refresh();
}

export async function setNotificationArchivedAction(id: string, archived: boolean) {
  await setNotificationArchived(id, await userId(), archived);
  refresh();
}

export async function deleteNotificationAction(id: string) {
  await deleteNotification(id, await userId());
  refresh();
}

export async function markAllNotificationsReadAction() {
  await markAllNotificationsRead(await userId());
  refresh();
}

export async function archiveReadNotificationsAction() {
  await archiveReadNotifications(await userId());
  refresh();
}

export async function clearNotificationsAction(archived: boolean) {
  await clearNotifications(await userId(), archived);
  refresh();
}
