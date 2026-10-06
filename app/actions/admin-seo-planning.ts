"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { saveApprovedLinks, saveClusters } from "@/server/services/seo/planning.service";
export async function savePlanningAction(_: { ok: boolean; message: string }, form: FormData) {
  try {
    const actor = await getAuthContext();
    if (actor?.role !== "ADMIN") throw new Error("Unauthorized");
    const payload = String(form.get("payload") || "");
    if (payload.length > 60000) throw new Error("Too large");
    const input = JSON.parse(payload);
    if (form.get("mode") === "links") await saveApprovedLinks(actor.id, input);
    else if (form.get("mode") === "clusters") await saveClusters(actor.id, input);
    else throw new Error("Invalid mode");
    revalidatePath("/admin/seo", "layout");
    return { ok: true, message: "Kaydedildi. Yazı yayınlanmadı." };
  } catch {
    return { ok: false, message: "Kaydedilemedi. Sayfayı yenileyin; tekrar eden veya artık yayında olmayan sayfaları kaldırın ve alanları kontrol edin." };
  }
}
