"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import {
  saveSeoSettings,
  pauseSeo,
} from "@/server/services/seo/settings.service";
import { refreshSeoInventory } from "@/server/services/seo/inventory.service";
export type SeoActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  revision?: number;
};
async function actorId() {
  const actor = await getAuthContext();
  if (actor?.role !== "ADMIN")
    throw new Error("SEO yönetimi için yönetici olarak giriş yapın.");
  return actor.id;
}
function feedback(error: unknown): SeoActionState {
  // Never echo Prisma errors or raw submitted values to the browser.
  const allowed = [
    "SEO yönetimi",
    "Ayarlar başka",
    "Yalnızca mevcut",
    "Başka bir SEO",
    "Çok sık",
    "Envanter 2.000",
  ];
  const message =
    error instanceof Error && allowed.some((s) => error.message.startsWith(s))
      ? error.message
      : "İşlem tamamlanamadı. Alanları kontrol edip tekrar deneyin.";
  return { status: "error", message };
}
export async function saveSeoSettingsAction(
  _previous: SeoActionState,
  form: FormData,
): Promise<SeoActionState> {
  try {
    const actor = await actorId();
    const payload = String(form.get("payload") ?? "");
    if (payload.length > 40000) throw new Error("Invalid payload");
    const saved = await saveSeoSettings(actor, JSON.parse(payload));
    revalidatePath("/admin/seo", "layout");
    return {
      status: "success",
      message: "Ayarlar kaydedildi. Üretim ve otomatik yayın hâlâ kapalı.",
      revision: saved.revision,
    };
  } catch (error) {
    return { ...feedback(error), revision: _previous.revision };
  }
}
export async function refreshSeoInventoryAction(): Promise<SeoActionState> {
  try {
    const result = await refreshSeoInventory(await actorId());
    revalidatePath("/admin/seo", "layout");
    return {
      status: "success",
      message: `${result.count} içerik kaydı güncellendi. Kaynak sayfalar değiştirilmedi.`,
    };
  } catch (error) {
    return feedback(error);
  }
}
export async function pauseSeoAction(): Promise<SeoActionState> {
  try {
    await pauseSeo(await actorId());
    revalidatePath("/admin/seo", "layout");
    return {
      status: "success",
      message: "Autopilot duraklatıldı. İçerikler korundu.",
    };
  } catch (error) {
    return feedback(error);
  }
}
