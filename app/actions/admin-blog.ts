"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { createBlogPost, updateBlogPost, deleteBlogPost, createBlogCategory } from "@/server/services/admin-blog.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  return obj;
}

export async function createBlogPostAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requireStaff();
  try {
    await createBlogPost(user.id, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updateBlogPostAction(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateBlogPost(id, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(id: string) {
  await requireStaff();
  await deleteBlogPost(id);
  revalidatePath("/admin/blog");
}

export async function createBlogCategoryAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await createBlogCategory(formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kategori eklenemedi." };
  }
  revalidatePath("/admin/blog");
  return { status: "idle" };
}
