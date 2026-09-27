"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { saveLegalContent } from "@/server/services/legal-content.service";
export type LegalEditorState = { message: string; ok?: boolean; revision?: number };
export async function saveLegalContentAction(_previous: LegalEditorState, form: FormData): Promise<LegalEditorState> {
  const actor = await getAuthContext();
  if (!actor || actor.role !== "ADMIN") return { message: "Yönetici oturumu gerekli." };
  try {
    const content = String(form.get("content") ?? "");
    if (content.length > 200000) return { message: "Belge çok uzun. En fazla 200.000 karakter kaydedilebilir." };
    const result = await saveLegalContent(actor.id, { target: form.get("target"), revision: Number(form.get("revision")), operation: form.get("operation"), content: JSON.parse(content) });
    revalidatePath("/admin/legal");
    if (form.get("operation") === "PUBLISH") { revalidatePath("/legal/[doc]", "page"); revalidatePath("/checkout"); }
    return { message: form.get("operation") === "PUBLISH" ? "Yayımlandı. Yeni metin sitede ve yeni siparişlerde kullanılacak." : "Taslak kaydedildi. Sitedeki yayımlanmış metin değişmedi.", ok: true, revision: result.revision };
  } catch (error) { return { message: error instanceof Error ? error.message : "Kaydedilemedi." }; }
}
