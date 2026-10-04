"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { saveSeoKeyword } from "@/server/services/seo/keywords.service";
export type KeywordState = { message: string; ok: boolean; revision?: number };
export async function saveKeywordAction(
  previous: KeywordState,
  form: FormData,
): Promise<KeywordState> {
  try {
    const actor = await getAuthContext();
    if (actor?.role !== "ADMIN") throw new Error("Unauthorized");
    const payload = String(form.get("payload") || "");
    if (payload.length > 10000) throw new Error("Invalid payload");
    const input = JSON.parse(payload);
    const saved = await saveSeoKeyword(actor.id, input, Boolean(input.id));
    revalidatePath("/admin/seo", "layout");
    return {
      ok: true,
      message: "Anahtar kelime kaydedildi.",
      revision: saved.revision,
    };
  } catch (error) {
    const known = [
      "Bu anahtar",
      "Kayıt başka",
      "Yalnızca mevcut",
      "Çok sık",
      "Başka bir SEO",
    ];
    return {
      ok: false,
      revision: previous.revision,
      message:
        error instanceof Error && known.some((s) => error.message.startsWith(s))
          ? error.message
          : "Kaydedilemedi. Alanları ve yönetici oturumunu kontrol edin.",
    };
  }
}
