"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { reviewSubmission } from "@/server/services/submissions.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

export async function reviewSubmissionAction(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await reviewSubmission(id, { teacherFeedback: formData.get("teacherFeedback"), score: formData.get("score") });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  redirect("/admin/submissions");
}
