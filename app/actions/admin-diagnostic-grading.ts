"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { reviewDiagnosticResponse } from "@/server/services/admin-diagnostic-grading.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

export async function reviewDiagnosticResponseAction(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await reviewDiagnosticResponse(id, { teacherFeedback: formData.get("teacherFeedback"), score: formData.get("score") });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/diagnostik/degerlendirmeler");
  revalidatePath(`/admin/diagnostik/degerlendirmeler/${id}`);
  redirect("/admin/diagnostik/degerlendirmeler");
}
