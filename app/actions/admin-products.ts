"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import {
  createProduct, updateProduct, togglePublish,
  addModule, deleteModule, addLesson, deleteLesson, addLiveSession, deleteLiveSession,
} from "@/server/services/admin-products.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  obj.isPublished = formData.get("isPublished") === "on";
  obj.isFeatured = formData.get("isFeatured") === "on";
  obj.isPreviewable = formData.get("isPreviewable") === "on";
  obj.isSpeakingClub = formData.get("isSpeakingClub") === "on";
  return obj;
}

/** Fields not present on a shorter quick-add form come back as `null` from
 * FormData.get(), which fails zod's `.optional()` (undefined-only) checks. */
function field(formData: FormData, key: string) {
  return formData.get(key) ?? undefined;
}

export async function createProductAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  let productId: string;
  try {
    const product = await createProduct(formDataToObject(formData));
    productId = product.id;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${productId}`);
}

export async function updateProductAction(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateProduct(id, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { status: "idle" };
}

export async function togglePublishAction(id: string) {
  await requireStaff();
  await togglePublish(id);
  revalidatePath("/admin/products");
}

export async function addModuleAction(productId: string, courseId: string, formData: FormData) {
  await requireStaff();
  await addModule(courseId, { title: formData.get("title") });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteModuleAction(productId: string, moduleId: string) {
  await requireStaff();
  await deleteModule(moduleId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function addLessonAction(productId: string, moduleId: string, formData: FormData) {
  await requireStaff();
  await addLesson(moduleId, {
    title: field(formData, "title"),
    durationMinutes: field(formData, "durationMinutes"),
    isPreviewable: formData.get("isPreviewable") === "on",
    videoUrl: field(formData, "videoUrl"),
    description: field(formData, "description"),
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteLessonAction(productId: string, lessonId: string) {
  await requireStaff();
  await deleteLesson(lessonId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function addLiveSessionAction(productId: string, courseId: string, formData: FormData) {
  await requireStaff();
  await addLiveSession(courseId, {
    title: field(formData, "title"),
    cohortLabel: field(formData, "cohortLabel"),
    startsAt: field(formData, "startsAt"),
    endsAt: field(formData, "endsAt"),
    meetingUrl: field(formData, "meetingUrl"),
    capacity: field(formData, "capacity"),
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteLiveSessionAction(productId: string, sessionId: string) {
  await requireStaff();
  await deleteLiveSession(sessionId);
  revalidatePath(`/admin/products/${productId}`);
}
