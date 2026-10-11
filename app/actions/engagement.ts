"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setLeaderboardOptIn } from "@/server/services/engagement.service";

export async function setLeaderboardOptInAction(optIn: boolean) {
  const user = await getAuthContext();
  if (!user) return;
  await setLeaderboardOptIn(user.id, optIn);
  revalidatePath("/dashboard/kocluk/basarilar");
}
