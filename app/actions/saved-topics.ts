"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { saveExamTopic, removeSavedExamTopic } from "@/server/services/saved-topics.service";

/** "Ders Ekle" — adds the topic to Derslerim and takes the student there. */
export async function addSavedTopicAction(examTopicId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/konu-anlatimi")}`);
  await saveExamTopic(user.id, examTopicId);
  revalidatePath("/dashboard/lessons");
  redirect("/dashboard/lessons?eklendi=1");
}

export async function removeSavedTopicAction(examTopicId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  await removeSavedExamTopic(user.id, examTopicId);
  revalidatePath("/dashboard/lessons");
  revalidatePath("/dashboard/konu-anlatimi");
}
