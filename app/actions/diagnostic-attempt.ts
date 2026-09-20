"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import {
  findOrCreateFullDiagnosticAttempt,
  findOrCreateMasteryCheckAttempt,
  submitAnswer,
  getAttempt,
  finishAttempt,
} from "@/server/services/diagnostic-attempts.service";
import { startRoadmapItem } from "@/server/services/study-roadmap.service";
import { examFamilyForCode, hasLiveDiagnostic } from "@/lib/diagnostics/exam-family";
import { logEvent } from "@/lib/diagnostics/analytics";

export async function startFullDiagnosticAction() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  const goal = await getActiveGoal(user.id);
  if (!goal) redirect("/seviye-tespit/hedef");
  if (!hasLiveDiagnostic(goal.examType.code)) return;

  const { attempt, resumed } = await findOrCreateFullDiagnosticAttempt(
    user.id,
    goal.examTypeId,
    goal.examType.code,
    examFamilyForCode(goal.examType.code),
    goal.id,
  );
  if (!attempt) return;
  await logEvent(resumed ? "diagnostic_resumed" : "diagnostic_started", user.id, { attemptId: attempt.id });
  redirect(`/seviye-tespit/sinav/${attempt.id}`);
}

export async function startMasteryCheckAction(topicId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  const goal = await getActiveGoal(user.id);
  if (!goal) redirect("/seviye-tespit/hedef");

  await startRoadmapItem(user.id, topicId).catch(() => undefined);
  const { attempt } = await findOrCreateMasteryCheckAttempt(
    user.id,
    goal.examTypeId,
    goal.examType.code,
    examFamilyForCode(goal.examType.code),
    goal.id,
    topicId,
  );
  if (!attempt) return;
  await logEvent("mastery_check_started", user.id, { attemptId: attempt.id, topicId });
  redirect(`/seviye-tespit/sinav/${attempt.id}`);
}

export async function answerAndAdvanceAction(attemptId: string, formData: FormData) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  const questionId = String(formData.get("questionId") ?? "");
  const answerRaw = String(formData.get("answerRaw") ?? "");
  if (!questionId || !answerRaw) {
    revalidatePath(`/seviye-tespit/sinav/${attemptId}`);
    return;
  }

  await submitAnswer(attemptId, user.id, questionId, answerRaw);
  const attempt = await getAttempt(attemptId, user.id);
  if (attempt && attempt.currentIndex >= attempt.questionOrder.length) {
    await finishAttempt(attemptId, user.id);
    await logEvent(attempt.kind === "MASTERY_CHECK" ? "mastery_check_completed" : "diagnostic_completed", user.id, { attemptId });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/plan");
    redirect(`/seviye-tespit/sonuc/${attemptId}`);
  }
  revalidatePath(`/seviye-tespit/sinav/${attemptId}`);
}

export async function startRoadmapItemAction(itemId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  await startRoadmapItem(user.id, itemId);
  await logEvent("roadmap_item_started", user.id, { itemId });
  revalidatePath("/dashboard/plan");
}
