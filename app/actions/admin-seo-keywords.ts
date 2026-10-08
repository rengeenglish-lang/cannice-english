"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { importSeoKeywords, saveSeoKeyword } from "@/server/services/seo/keywords.service";
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

export async function importKeywordsAction(_: KeywordState, form: FormData): Promise<KeywordState> {
  try {
    const actor = await getAuthContext();
    if (actor?.role !== "ADMIN") throw new Error("Unauthorized");
    const { created, skipped } = await importSeoKeywords(actor.id, String(form.get("keywords") || ""));
    revalidatePath("/admin/seo", "layout");
    const detail = skipped.slice(0, 5).map((s) => `satır ${s.line}: ${s.message}`).join("; ");
    return { ok: true, message: `${created} anahtar kelime eklendi${skipped.length ? `, ${skipped.length} satır atlandı (${detail}${skipped.length > 5 ? "; …" : ""})` : "."}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error && error.message.startsWith("Çok sık") ? error.message : "İçe aktarılamadı. Yönetici oturumunu ve satır biçimini kontrol edin." };
  }
}
