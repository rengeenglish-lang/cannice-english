"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import {
  createSeoDraft,
  saveSeoBrand,
  saveSeoBrief,
  saveSeoDraftContent,
  reviewSeoDraft,
  StudioError,
} from "@/server/services/seo/studio.service";
export type StudioState = { ok: boolean; message: string; id?: string };
async function actor() {
  const a = await getAuthContext();
  if (a?.role !== "ADMIN") throw new Error("Unauthorized");
  return a.id;
}
function feedback(error: unknown): StudioState {
  return {
    ok: false,
    message:
      error instanceof StudioError
        ? error.message
        : "İşlem tamamlanamadı. Alanları kontrol edin; sayfayı yenileyip tekrar deneyin.",
  };
}
function refresh() {
  revalidatePath("/admin/seo", "layout");
  revalidatePath("/admin/blog");
}
export async function createSeoDraftAction(
  _: StudioState,
  form: FormData,
): Promise<StudioState> {
  try {
    const result = await createSeoDraft(await actor(), form.get("keywordId"));
    refresh();
    return { ok: true, message: "Brief çalışma alanı hazır.", id: result.id };
  } catch (e) {
    return feedback(e);
  }
}
export async function saveStudioAction(
  _: StudioState,
  form: FormData,
): Promise<StudioState> {
  try {
    const actorId = await actor();
    const payload = String(form.get("payload") || "");
    if (payload.length > 150000) throw new Error("Payload too large");
    const input = JSON.parse(payload);
    const mode = String(form.get("mode"));
    if (mode === "brand") await saveSeoBrand(actorId, input);
    else if (mode === "brief") await saveSeoBrief(actorId, input);
    else if (mode === "content") await saveSeoDraftContent(actorId, input);
    else if (mode === "review") await reviewSeoDraft(actorId, input);
    else throw new Error("Invalid operation");
    refresh();
    return {
      ok: true,
      message:
        mode === "review"
          ? "İnceleme kaydedildi. Yazı yayınlanmadı."
          : "Kaydedildi. Yazı yayınlanmadı.",
    };
  } catch (e) {
    return feedback(e);
  }
}
