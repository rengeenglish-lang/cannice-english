"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import {
  createTopic, updateTopic, deleteTopic,
  createLesson, updateLesson, deleteLesson,
} from "@/server/services/admin-topics.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  return obj;
}

export async function createTopicAction(examSlug: string, examTypeId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  let topicId: string;
  try {
    const topic = await createTopic(examTypeId, formDataToObject(formData));
    topicId = topic.id;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath(`/admin/konu-anlatim/${examSlug}`);
  redirect(`/admin/konu-anlatim/${examSlug}/${topicId}`);
}

export async function updateTopicAction(examSlug: string, topicId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateTopic(topicId, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath(`/admin/konu-anlatim/${examSlug}`);
  revalidatePath(`/admin/konu-anlatim/${examSlug}/${topicId}`);
  revalidatePath("/konu-anlatim");
  return { status: "idle", message: "Kaydedildi." };
}

export async function deleteTopicAction(examSlug: string, topicId: string) {
  await requireStaff();
  await deleteTopic(topicId);
  revalidatePath(`/admin/konu-anlatim/${examSlug}`);
  revalidatePath("/konu-anlatim");
  redirect(`/admin/konu-anlatim/${examSlug}`);
}

export async function createLessonAction(examSlug: string, topicId: string, formData: FormData) {
  await requireStaff();
  await createLesson(topicId, formDataToObject(formData));
  revalidatePath(`/admin/konu-anlatim/${examSlug}/${topicId}`);
  revalidatePath("/konu-anlatim");
}

export async function updateLessonAction(examSlug: string, topicId: string, lessonId: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateLesson(lessonId, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath(`/admin/konu-anlatim/${examSlug}/${topicId}`);
  revalidatePath("/konu-anlatim");
  return { status: "idle", message: "Kaydedildi." };
}

export async function deleteLessonAction(examSlug: string, topicId: string, lessonId: string) {
  await requireStaff();
  await deleteLesson(lessonId);
  revalidatePath(`/admin/konu-anlatim/${examSlug}/${topicId}`);
  revalidatePath("/konu-anlatim");
}
