"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getAuthContext } from "@/server/auth/context";
import { pushToUser, removePushSubscription, savePushSubscription, vapidKeys } from "@/server/push/web-push";

export async function getPushPublicKeyAction() {
  const user = await getAuthContext();
  if (!user) return null;
  return (await vapidKeys())?.publicKey ?? null;
}

const subscriptionSchema = z.object({ endpoint: z.url().max(1000), keys: z.object({ p256dh: z.string().min(10).max(300), auth: z.string().min(8).max(100) }) });

export async function savePushSubscriptionAction(raw: unknown) {
  const user = await getAuthContext();
  const parsed = subscriptionSchema.safeParse(raw);
  if (!user || !parsed.success || !parsed.data.endpoint.startsWith("https://")) return false;
  await savePushSubscription(user.id, parsed.data, (await headers()).get("user-agent")?.slice(0, 300) ?? null);
  await pushToUser(user.id, { title: "Bildirimler açık", body: "Netfener bildirimleri artık bu cihaza da gelecek.", url: "/dashboard/notifications", tag: "push-welcome" });
  return true;
}

export async function removePushSubscriptionAction(endpoint: string) {
  const user = await getAuthContext();
  if (!user) return false;
  await removePushSubscription(user.id, String(endpoint).slice(0, 1000));
  return true;
}
