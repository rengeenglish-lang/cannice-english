"use server";

import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { startLevelTestAttempt, retakeLevelTestAttempt } from "@/server/services/diagnostic-attempts.service";
import { examFamilyForCode, hasLiveDiagnostic } from "@/lib/diagnostics/exam-family";
import { logEvent } from "@/lib/diagnostics/analytics";

export async function startNewLevelTestAction(examSlug: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/seviye-tespit/yeni")}`);
  const examType = await db.examType.findUnique({ where: { slug: examSlug } });
  if (!examType || !hasLiveDiagnostic(examType.code)) redirect("/seviye-tespit/yeni?hata=yakinda");
  const goal = await getActiveGoal(user.id);
  const { attempt, resumed } = await startLevelTestAttempt(
    user.id,
    examType,
    examFamilyForCode(examType.code),
    goal?.examTypeId === examType.id ? goal.id : null,
  );
  if (!attempt) redirect("/seviye-tespit/yeni?hata=yakinda");
  await logEvent(resumed ? "diagnostic_resumed" : "diagnostic_started", user.id, { attemptId: attempt.id, source: "yeni-test" });
  redirect(`/dashboard/sinav/${attempt.id}`);
}

export async function retakeLevelTestAction(sourceAttemptId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/seviye-tespit/tekrar")}`);
  const source = await db.diagnosticAttempt.findFirst({ where: { id: sourceAttemptId, userId: user.id } });
  if (!source) redirect("/seviye-tespit/tekrar");
  const goal = await getActiveGoal(user.id);
  const { attempt, resumed } = await retakeLevelTestAttempt(user.id, sourceAttemptId, goal?.examTypeId === source.examTypeId ? goal.id : null);
  if (!attempt) redirect("/seviye-tespit/tekrar?hata=soru-yok");
  await logEvent(resumed ? "diagnostic_resumed" : "diagnostic_started", user.id, { attemptId: attempt.id, retakeOf: sourceAttemptId });
  redirect(`/dashboard/sinav/${attempt.id}`);
}
