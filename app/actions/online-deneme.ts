"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { getPlanAccess, remainingMockExamStarts } from "@/server/services/plans.service";
import {
  createAttempt,
  findOpenAttempt,
  finishAttempt,
  getOwnAttempt,
  saveAnswer,
  setAttemptMode,
  settleAttempt,
  type SaveResult,
} from "@/server/services/online-deneme.service";
import { DENEME_LOADERS } from "@/content/yds-denemeler/registry";
import { logEvent } from "@/lib/diagnostics/analytics";
import type { SavedAnswer } from "@/lib/online-denemeler/types";

const BASE = "/dashboard/yds-denemeleri";

/** Starts (or resumes) a sitting. The 180-minute clock starts here, on the server. */
export async function startOnlineDenemeAction(formData: FormData) {
  const no = Number(formData.get("denemeNo"));
  const mode = formData.get("mode") === "OPTIK" ? "OPTIK" : "KLASIK";
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`${BASE}/${no}`)}`);
  if (!DENEME_LOADERS[no]) redirect(BASE);

  const access = await getPlanAccess(user);
  if (!access.can("MOCK_EXAMS")) redirect("/dashboard/mock-exam#planlar");

  const open = await findOpenAttempt(user.id, no);
  if (open) {
    if (open.mode !== mode) await setAttemptMode(open.id, user.id, mode);
    await logEvent("mock_exam_resumed", user.id, { onlineDenemeAttemptId: open.id, denemeNo: no });
    redirect(`${BASE}/oturum/${open.id}`);
  }

  const remaining = await remainingMockExamStarts(user.id, access);
  if (remaining !== null && remaining <= 0) redirect("/dashboard/mock-exam?limit=1#planlar");

  const attempt = await createAttempt(user.id, no, mode);
  await logEvent("mock_exam_started", user.id, { onlineDenemeAttemptId: attempt.id, denemeNo: no, mode });
  revalidatePath(BASE);
  redirect(`${BASE}/oturum/${attempt.id}`);
}

/** Saves one answer as soon as it is marked. Refused (and the sitting locked) once time is up. */
export async function saveOnlineDenemeAnswerAction(attemptId: string, n: number, answer: SavedAnswer): Promise<SaveResult> {
  const user = await getAuthContext();
  if (!user) return { ok: false, locked: false, error: "Oturumun kapanmış. Lütfen tekrar giriş yap." };
  return saveAnswer(attemptId, user.id, n, { choice: answer.choice, flagged: Boolean(answer.flagged) });
}

/** Called by the countdown at 00:00. The server decides: it only locks if the deadline really passed. */
export async function lockOnlineDenemeAction(attemptId: string): Promise<{ locked: boolean; msLeft: number }> {
  const user = await getAuthContext();
  if (!user) return { locked: false, msLeft: 0 };
  const attempt = await getOwnAttempt(attemptId, user.id);
  if (!attempt) return { locked: true, msLeft: 0 };
  const settled = await settleAttempt(attempt);
  if (settled.status !== "IN_PROGRESS") {
    // No revalidatePath here: refreshing the open sitting would redirect away before the lock screen shows.
    await logEvent("mock_exam_completed", user.id, { onlineDenemeAttemptId: attemptId, timedOut: true });
    return { locked: true, msLeft: 0 };
  }
  return { locked: false, msLeft: Math.max(0, settled.deadlineAt.getTime() - Date.now()) };
}

export async function finishOnlineDenemeAction(attemptId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`${BASE}/oturum/${attemptId}`)}`);
  const attempt = await finishAttempt(attemptId, user.id);
  if (!attempt) redirect(BASE);
  await logEvent("mock_exam_completed", user.id, { onlineDenemeAttemptId: attemptId, timedOut: attempt.timedOut });
  revalidatePath(BASE);
  redirect(`${BASE}/sonuc/${attemptId}`);
}

export async function setOnlineDenemeModeAction(attemptId: string, mode: "KLASIK" | "OPTIK") {
  const user = await getAuthContext();
  if (!user) return;
  await setAttemptMode(attemptId, user.id, mode === "OPTIK" ? "OPTIK" : "KLASIK");
}
