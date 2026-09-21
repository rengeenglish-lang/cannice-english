"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { markNotificationRead, markAllNotificationsRead } from "@/server/services/notifications.service";

export async function markNotificationReadAction(id: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  await markNotificationRead(id, user.id);
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  await markAllNotificationsRead(user.id);
  revalidatePath("/dashboard/notifications");
}
