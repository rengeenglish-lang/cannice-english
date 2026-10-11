"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { toggleTopicLessonProgress, saveTopicNote } from "@/server/services/topics.service";
import { recordTopicStudy } from "@/server/services/skill-analysis.service";

export async function toggleTopicLessonProgressAction(topicLessonId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  await toggleTopicLessonProgress(user.id, topicLessonId);
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
