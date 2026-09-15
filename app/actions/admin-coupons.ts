"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/server/auth/context";
import { createCoupon, updateCoupon, deleteCoupon } from "@/server/services/coupons.service";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) obj[key] = value;
  obj.isActive = formData.get("isActive") === "on";
  obj.isPublic = formData.get("isPublic") === "on";
  return obj;
}

export async function createCouponAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await createCoupon(formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCouponAction(id: string, _prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireStaff();
  try {
    await updateCoupon(id, formDataToObject(formData));
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCouponAction(id: string) {
  await requireStaff();
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
}
