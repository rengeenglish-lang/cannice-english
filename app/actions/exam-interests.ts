"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setExamInterests } from "@/server/services/exam-interests.service";
import { INTEREST_EXAMS } from "@/lib/exam-interests";

export type ExamInterestsState = { status: "idle" | "success" | "error"; message?: string };

export async function saveExamInterestsAction(_prev: ExamInterestsState, formData: FormData): Promise<ExamInterestsState> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Oturum açman gerekiyor." };
  const picked = INTEREST_EXAMS.filter((e) => formData.get(`exam-${e.code}`) === "on").map((e) => ({
    code: e.code,
    examDate: String(formData.get(`date-${e.code}`) ?? "") || null,
  }));
  if (!picked.length) return { status: "error", message: "En az bir sınav seç." };
  try {
    await setExamInterests(user.id, picked);
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
  // The countdown bar sits in the root layout, so every page needs the new choice.
  revalidatePath("/", "layout");
  return { status: "success", message: "Sınavların kaydedildi. Geri sayım ve içerikler buna göre güncellendi." };
}
