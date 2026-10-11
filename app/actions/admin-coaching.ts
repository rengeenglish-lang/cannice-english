"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setSuggestionHandled } from "@/server/services/coaching/suggestions.service";

/** Gelen Koçluk Önerileri: admins only, since the messages are students' own words. */
export async function setSuggestionHandledAction(id: string, handled: boolean) {
  const actor = await getAuthContext();
  if (!actor || actor.role !== "ADMIN" || typeof id !== "string") return;
  await setSuggestionHandled(id, handled);
  revalidatePath("/admin/kocluk/oneriler");
}
