"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { createTopic, updateTopic, deactivateTopic, reactivateTopic } from "@/server/services/admin-diagnostic-topics.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  return obj;
}

export async function createDiagnosticTopicAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  let topicId: string;
  try {
    const topic = await createTopic(formDataToObject(formData));
    topicId = topic.id;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/diagnostik/konular");
  redirect(`/admin/diagnostik/konular/${topicId}`);
}

export async function updateDiagnosticTopicAction(topicId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateTopic(topicId, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/diagnostik/konular");
  revalidatePath(`/admin/diagnostik/konular/${topicId}`);
  return { status: "idle", message: "Kaydedildi." };
}

export async function deactivateDiagnosticTopicAction(topicId: string) {
  await requireStaff();
  await deactivateTopic(topicId);
  revalidatePath("/admin/diagnostik/konular");
}

export async function reactivateDiagnosticTopicAction(topicId: string) {
  await requireStaff();
  await reactivateTopic(topicId);
  revalidatePath("/admin/diagnostik/konular");
}
