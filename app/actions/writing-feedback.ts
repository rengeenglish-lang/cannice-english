"use server";

import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { gradeWriting, WritingFeedbackError } from "@/server/services/writing-feedback.service";
import { validateWritingInput } from "@/lib/writing-feedback";

export type WritingFeedbackFormState = { status: "idle" | "error"; message?: string };

export async function submitWritingFeedbackAction(_prev: WritingFeedbackFormState, formData: FormData): Promise<WritingFeedbackFormState> {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in?callbackUrl=/dashboard/yazma-geri-bildirim");

  const parsed = validateWritingInput({ kind: formData.get("kind"), taskPrompt: formData.get("taskPrompt"), answer: formData.get("answer") });
  if (!parsed.ok) return { status: "error", message: parsed.error };

  let id: string;
  try {
    id = await gradeWriting(user, parsed.input);
  } catch (error) {
    return { status: "error", message: error instanceof WritingFeedbackError ? error.message : "Değerlendirme tamamlanamadı. Tekrar dene." };
  }
  redirect(`/dashboard/yazma-geri-bildirim/${id}`);
}
