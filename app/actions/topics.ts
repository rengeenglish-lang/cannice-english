"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { toggleTopicLessonProgress, saveTopicNote } from "@/server/services/topics.service";
import { recordTopicStudy } from "@/server/services/skill-analysis.service";
import { syncCertificates } from "@/server/services/certificates.service";
import { getPlanAccess } from "@/server/services/plans.service";
import { getEnglishLessonBody, LessonTranslationError } from "@/server/services/lesson-translation.service";

export async function toggleTopicLessonProgressAction(topicLessonId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  await toggleTopicLessonProgress(user.id, topicLessonId);
  // Ticking the last lesson of a track issues its certificate (and notifies the student).
  await syncCertificates(user.id).catch((e) => console.error("[certificates] sync failed", e));
  revalidatePath("/konu-anlatim");
}

export type SaveNoteResult = { status: "success" | "error"; message?: string };

export async function saveTopicNoteAction(examTopicId: string, content: string): Promise<SaveNoteResult> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Not alabilmek için giriş yapmalısınız." };

  await saveTopicNote(user.id, examTopicId, content.slice(0, 4000));
  revalidatePath("/konu-anlatim");
  return { status: "success" };
}

/** Reading timer on Konu Anlatımı: reports active seconds on a topic. Guests aren't tracked. */
export async function recordTopicStudyAction(examTopicId: string, seconds: number): Promise<void> {
  const user = await getAuthContext();
  if (!user || typeof examTopicId !== "string" || !examTopicId || examTopicId.length > 64) return;
  await recordTopicStudy(user.id, examTopicId, Number(seconds));
}

export type TranslateLessonResult = { status: "success"; text: string } | { status: "error"; message: string };

/** "English" button on Konu Anlatımı: returns the lesson body in English (translated once, then cached). */
export async function translateTopicLessonAction(topicLessonId: string): Promise<TranslateLessonResult> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Çeviri için giriş yapmalısınız." };
  const access = await getPlanAccess(user);
  if (!access.can("KONU_ANLATIMI")) return { status: "error", message: "Bu içerik planınıza dahil değil." };
  if (typeof topicLessonId !== "string" || !topicLessonId || topicLessonId.length > 64) {
    return { status: "error", message: "Ders bulunamadı." };
  }
  try {
    const text = await getEnglishLessonBody(topicLessonId);
    if (!text) return { status: "error", message: "Bu ders için çevrilecek içerik yok." };
    return { status: "success", text };
  } catch (error) {
    if (error instanceof LessonTranslationError) return { status: "error", message: error.message };
    console.error("[lesson-translation] failed", error);
    return { status: "error", message: "Çeviri şu anda yapılamadı. Biraz sonra tekrar dene." };
  }
}
