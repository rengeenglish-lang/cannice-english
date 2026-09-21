"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import {
  findOrCreateFullDiagnosticAttempt,
  findOrCreateMasteryCheckAttempt,
  findOrCreatePracticeAttempt,
  findOrCreateMockExamAttempt,
  submitAnswer,
  getAttempt,
  finishAttempt,
} from "@/server/services/diagnostic-attempts.service";
import { startRoadmapItem } from "@/server/services/study-roadmap.service";
import { examFamilyForCode, hasLiveDiagnostic } from "@/lib/diagnostics/exam-family";
import { logEvent } from "@/lib/diagnostics/analytics";

export async function startFullDiagnosticAction() {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/seviye-tespit/basla")}`);
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
  redirect(`/dashboard/sinav/${attempt.id}`);
}

export async function startMasteryCheckAction(topicId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/plan")}`);
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
  redirect(`/dashboard/sinav/${attempt.id}`);
}

export async function startPracticeAction(topicId: string | null) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/practice")}`);
  const goal = await getActiveGoal(user.id);
  if (!goal) redirect("/seviye-tespit/hedef");

  const { attempt } = await findOrCreatePracticeAttempt(
    user.id,
    goal.examTypeId,
    goal.examType.code,
    examFamilyForCode(goal.examType.code),
    goal.id,
    topicId,
  );
  if (!attempt) return;
  await logEvent("practice_started", user.id, { attemptId: attempt.id, topicId });
  redirect(`/dashboard/sinav/${attempt.id}`);
}

export async function startMockExamAction() {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/mock-exam")}`);
  const goal = await getActiveGoal(user.id);
  if (!goal) redirect("/seviye-tespit/hedef");
  if (!hasLiveDiagnostic(goal.examType.code)) return;

  const { attempt, resumed } = await findOrCreateMockExamAttempt(
    user.id,
    goal.examTypeId,
    goal.examType.code,
    examFamilyForCode(goal.examType.code),
    goal.id,
  );
  if (!attempt) return;
  await logEvent(resumed ? "mock_exam_resumed" : "mock_exam_started", user.id, { attemptId: attempt.id });
  redirect(`/dashboard/sinav/${attempt.id}`);
}

/** Called when the client-side countdown hits zero — finalizes with whatever was answered so far. */
export async function autoSubmitMockExamAction(attemptId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/dashboard/sinav/${attemptId}`)}`);
  const attempt = await getAttempt(attemptId, user.id);
  if (attempt && attempt.status === "IN_PROGRESS") {
    await finishAttempt(attemptId, user.id);
    await logEvent("mock_exam_completed", user.id, { attemptId, autoSubmitted: true });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/plan");
  }
  redirect(`/dashboard/sonuc/${attemptId}`);
}

export async function answerAndAdvanceAction(attemptId: string, formData: FormData) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/dashboard/sinav/${attemptId}`)}`);
  const questionId = String(formData.get("questionId") ?? "");
  const answerRaw = String(formData.get("answerRaw") ?? "");
  if (!questionId || !answerRaw) {
    revalidatePath(`/dashboard/sinav/${attemptId}`);
    return;
  }

  try {
    await submitAnswer(attemptId, user.id, questionId, answerRaw);
  } catch (error) {
    if (error instanceof Error && error.message === "Sınav süresi doldu.") {
      await finishAttempt(attemptId, user.id);
      await logEvent("mock_exam_completed", user.id, { attemptId, autoSubmitted: true });
      redirect(`/dashboard/sonuc/${attemptId}`);
    }
    throw error;
  }
  const attempt = await getAttempt(attemptId, user.id);
  if (attempt && attempt.currentIndex >= attempt.questionOrder.length) {
    await finishAttempt(attemptId, user.id);
    const event =
      attempt.kind === "MASTERY_CHECK"
        ? "mastery_check_completed"
        : attempt.kind === "PRACTICE"
          ? "practice_completed"
          : attempt.kind === "MOCK_EXAM"
            ? "mock_exam_completed"
            : "diagnostic_completed";
    await logEvent(event, user.id, { attemptId });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/plan");
    redirect(`/dashboard/sonuc/${attemptId}`);
  }
  revalidatePath(`/dashboard/sinav/${attemptId}`);
}

export async function startRoadmapItemAction(itemId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/plan")}`);
  await startRoadmapItem(user.id, itemId);
  await logEvent("roadmap_item_started", user.id, { itemId });
  revalidatePath("/dashboard/plan");
}
