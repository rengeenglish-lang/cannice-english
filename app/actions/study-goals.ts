"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { createStudyGoal, markStudyGoalReached, reportStudyGoalFailureReason } from "@/server/services/study-goals.service";
import type { StudyGoalPeriodKind } from "@/lib/study-goal-periods";

export type StudyGoalItemInput =
  | { kind: "TOPIC"; examTopicId: string }
  | { kind: "PRACTICE"; quantity: number }
  | { kind: "MOCK_EXAM"; quantity: number }
  | { kind: "CUSTOM"; label: string };

export type StudyGoalActionResult = { status: "success" | "error"; message?: string };

export async function createStudyGoalAction(period: StudyGoalPeriodKind, items: StudyGoalItemInput[]): Promise<StudyGoalActionResult> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Giriş yapmalısınız." };
  try {
    await createStudyGoal(user.id, { period, items });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Hedef kaydedilemedi." };
  }
  revalidatePath("/dashboard/hedeflerim");
  revalidatePath("/dashboard/progress");
  return { status: "success" };
}

export async function markStudyGoalReachedAction(goalId: string): Promise<StudyGoalActionResult> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Giriş yapmalısınız." };
  await markStudyGoalReached(user.id, goalId);
  revalidatePath("/dashboard/hedeflerim");
  revalidatePath("/dashboard/progress");
  return { status: "success" };
}

/** Same as markStudyGoalReachedAction but void-returning, for direct `<form action={...}>` binding. */
export async function markStudyGoalReachedFormAction(goalId: string): Promise<void> {
  await markStudyGoalReachedAction(goalId);
}

export async function reportStudyGoalFailureAction(goalId: string, reason: string): Promise<StudyGoalActionResult> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Giriş yapmalısınız." };
  try {
    await reportStudyGoalFailureReason(user.id, { goalId, reason });
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/dashboard/hedeflerim");
  revalidatePath("/dashboard/progress");
  return { status: "success" };
}
