"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setActiveGoal } from "@/server/services/diagnostic-goals.service";
import { logEvent } from "@/lib/diagnostics/analytics";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  return obj;
}

export async function setGoalAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/seviye-tespit/hedef")}`);
  try {
    await setActiveGoal(user.id, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Hedef kaydedilemedi." };
  }
  await logEvent("goal_completed", user.id, { examTypeId: formData.get("examTypeId") });
  revalidatePath("/dashboard");
  redirect("/seviye-tespit/basla");
}
