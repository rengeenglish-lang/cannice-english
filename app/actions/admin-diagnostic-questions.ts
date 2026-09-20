"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { createQuestion, updateQuestion, deactivateQuestion, reactivateQuestion } from "@/server/services/admin-diagnostic-questions.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  return obj;
}

export async function createDiagnosticQuestionAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  let questionId: string;
  try {
    const question = await createQuestion(formDataToObject(formData));
    questionId = question.id;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/diagnostik/sorular");
  redirect(`/admin/diagnostik/sorular/${questionId}`);
}

export async function updateDiagnosticQuestionAction(questionId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateQuestion(questionId, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/diagnostik/sorular");
  revalidatePath(`/admin/diagnostik/sorular/${questionId}`);
  return { status: "idle", message: "Kaydedildi." };
}

export async function deactivateDiagnosticQuestionAction(questionId: string) {
  await requireStaff();
  await deactivateQuestion(questionId);
  revalidatePath("/admin/diagnostik/sorular");
}

export async function reactivateDiagnosticQuestionAction(questionId: string) {
  await requireStaff();
  await reactivateQuestion(questionId);
  revalidatePath("/admin/diagnostik/sorular");
}
