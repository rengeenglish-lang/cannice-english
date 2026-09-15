"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { createSubmission } from "@/server/services/submissions.service";

export type SubmissionFormState = { status: "idle" | "error" | "success"; message?: string };

export async function submitPracticeExamAction(
  courseId: string,
  enrollmentId: string,
  _prev: SubmissionFormState,
  formData: FormData,
): Promise<SubmissionFormState> {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.userId !== user.id) redirect("/dashboard");

  try {
    await createSubmission(enrollmentId, { title: formData.get("title"), studentAnswer: formData.get("studentAnswer") });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Gönderilemedi." };
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { status: "success", message: "Deneme sınavınız gönderildi. Öğretmeniniz en kısa sürede geri bildirim yapacak." };
}
