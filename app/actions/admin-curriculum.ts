"use server";
import { revalidatePath } from "next/cache";
import { requireAdministrator } from "@/server/auth/context";
import { importApprovedProgrammePlans } from "@/server/services/curriculum.service";

export async function importCurriculumPlansAction(): Promise<{ message: string; success: boolean }> {
  const actor = await requireAdministrator();
  try {
    await importApprovedProgrammePlans(actor.id);
  } catch {
    return { success: false, message: "Planlar içe aktarılamadı. Sınav tanımları ve veritabanı geçişlerini kontrol edin; mevcut kayıtlar korunur." };
  }
  revalidatePath("/admin/curricula");
  return { success: true, message: "Onaylı planlar taslak olarak kaydedildi. Mevcut planlar değiştirilmedi." };
}
