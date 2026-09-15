"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "@/server/services/admin-testimonials.service";

export type AdminFormState = { status: "idle" | "error"; message?: string };

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  obj.isPublished = formData.get("isPublished") === "on";
  obj.isFeatured = formData.get("isFeatured") === "on";
  return obj;
}

export async function createTestimonialAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await createTestimonial(formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function updateTestimonialAction(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateTestimonial(id, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(id: string) {
  await requireStaff();
  await deleteTestimonial(id);
  revalidatePath("/admin/testimonials");
}
