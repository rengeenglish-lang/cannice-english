"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ExamViewMode } from "@/lib/diagnostics/exam-view-mode";

export async function setExamViewModeAction(attemptId: string, mode: ExamViewMode) {
  const store = await cookies();
  store.set("examViewMode", mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  redirect(`/dashboard/sinav/${attemptId}`);
}
