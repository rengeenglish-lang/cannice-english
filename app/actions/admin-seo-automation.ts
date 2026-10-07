"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setAutomation } from "@/server/services/seo/automation.service";
import { cancelJob, retryJob } from "@/server/services/seo/jobs.service";
export type AutomationActionState = { ok: boolean; message: string };
async function actor() {
  const a = await getAuthContext();
  if (a?.role !== "ADMIN") throw new Error("Unauthorized");
  return a.id;
}
const KNOWN = ["Ayarlar başka", "İş yeniden", "Yalnızca sıradaki", "Çok sık", "Başka bir SEO"];
export async function automationAction(_: AutomationActionState, form: FormData): Promise<AutomationActionState> {
  try {
    const id = await actor();
    const mode = String(form.get("mode"));
    const revision = Number(form.get("revision"));
    let message: string;
    if (mode === "stop") {
      await setAutomation(id, { revision, emergencyStop: true });
      message = "Acil durdurma etkin: sıradaki işler iptal edildi, zamanlanmış otomatik yayın durdu. Taslaklar ve ölçümler korunur.";
    } else if (mode === "resume") {
      await setAutomation(id, { revision, emergencyStop: false });
      message = "Otomasyon devam ediyor.";
    } else if (mode === "autosync") {
      const enabled = form.get("enabled") === "true";
      await setAutomation(id, { revision, autoSync: enabled });
      message = enabled ? "Otomatik veri eşitleme açıldı (yalnızca okuma)." : "Otomatik veri eşitleme kapatıldı.";
    } else if (mode === "retry") {
      await retryJob(id, { id: String(form.get("jobId")) });
      message = "İş yeniden sıraya alındı.";
    } else if (mode === "cancel") {
      await cancelJob(id, { id: String(form.get("jobId")) });
      message = "İş iptal edildi.";
    } else throw new Error("Invalid operation");
    revalidatePath("/admin/seo", "layout");
    return { ok: true, message };
  } catch (e) {
    return { ok: false, message: e instanceof Error && KNOWN.some((k) => e.message.startsWith(k)) ? e.message : "İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin." };
  }
}
