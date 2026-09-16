"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { toggleTopicLessonProgress } from "@/server/services/topics.service";

export async function toggleTopicLessonProgressAction(topicSlug: string, topicLessonId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  await toggleTopicLessonProgress(user.id, topicLessonId);
  revalidatePath(`/konu-anlatim/${topicSlug}`);
}
