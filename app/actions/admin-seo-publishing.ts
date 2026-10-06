"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { StudioError } from "@/server/services/seo/studio.service";
import {
  approveSeoDraft,
  cancelSeoSchedule,
  publishSeoDraftNow,
  restoreSeoVersion,
  revokeSeoApproval,
  scheduleSeoDraft,
  unpublishSeoDraft,
} from "@/server/services/seo/publishing.service";
export type PublishingState = { ok: boolean; message: string };
async function actor() {
  const a = await getAuthContext();
  if (a?.role !== "ADMIN") throw new Error("Unauthorized");
  return a.id;
}
function feedback(error: unknown): PublishingState {
  return {
    ok: false,
    message:
      error instanceof StudioError
        ? error.message
        : "İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin.",
  };
}
const MESSAGES: Record<string, string> = {
  approve: "Yayın için onaylandı. Yazı henüz yayınlanmadı.",
  revoke: "Onay geri alındı.",
  schedule: "Yayın zamanlandı. Zaman geldiğinde kapı yeniden denetlenir.",
  cancel: "Zamanlama iptal edildi.",
  publish: "Yazı yayınlandı.",
  unpublish: "Yazı yayından kaldırıldı; düzenlenebilir taslağa döndü.",
  restore: "Sürüm taslağa geri yüklendi. Yeniden inceleme ve onay gerekir.",
};
export async function publishingAction(
  _: PublishingState,
  form: FormData,
): Promise<PublishingState> {
  try {
    const actorId = await actor();
    const payload = String(form.get("payload") || "");
    if (payload.length > 5000) throw new Error("Payload too large");
    const input = JSON.parse(payload);
    const mode = String(form.get("mode"));
    let slug: string | undefined;
    if (mode === "approve") await approveSeoDraft(actorId, input);
    else if (mode === "revoke") await revokeSeoApproval(actorId, input);
    else if (mode === "schedule") await scheduleSeoDraft(actorId, input);
    else if (mode === "cancel") await cancelSeoSchedule(actorId, input);
    else if (mode === "publish") slug = (await publishSeoDraftNow(actorId, input)).slug;
    else if (mode === "unpublish") slug = (await unpublishSeoDraft(actorId, input)).slug;
    else if (mode === "restore") await restoreSeoVersion(actorId, input);
    else throw new Error("Invalid operation");
    revalidatePath("/admin/seo", "layout");
    if (slug) {
      revalidatePath("/blog");
      revalidatePath(`/blog/${slug}`);
      revalidatePath("/sitemap.xml");
    }
    return { ok: true, message: MESSAGES[mode] };
  } catch (e) {
    return feedback(e);
  }
}
