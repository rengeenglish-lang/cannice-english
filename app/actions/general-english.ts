"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { submitPlacement } from "@/server/services/speaking-club.service";

export async function submitGeneralEnglishAction(form: FormData) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in?next=/seviye-tespit/genel-ingilizce");
  const answers: Record<string, number> = {};
  for (const [key, value] of form.entries()) {
    if (key.startsWith("q_") && typeof value === "string" && value.trim() !== "") answers[key.slice(2)] = Number(value);
  }
  await submitPlacement(user.id, answers);
  revalidatePath("/dashboard");
  revalidatePath("/seviye-tespit/genel-ingilizce/sonuc");
  redirect("/seviye-tespit/genel-ingilizce/sonuc");
}
