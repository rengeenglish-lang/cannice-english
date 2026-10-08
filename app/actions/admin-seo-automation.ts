"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setAutomation } from "@/server/services/seo/automation.service";
import { cancelJob, queueArticleGeneration, retryJob, runOneJobNow } from "@/server/services/seo/jobs.service";
export type AutomationActionState = { ok: boolean; message: string };
async function actor() {
  const a = await getAuthContext();
  if (a?.role !== "ADMIN") throw new Error("Unauthorized");
  return a.id;
}
const KNOWN = ["Ayarlar başka", "İş yeniden", "Yalnızca sıradaki", "Çok sık", "Başka bir SEO", "Otomasyon acil", "Yalnızca mevcut", "Yalnızca taslağı"];
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
    } else if (mode === "autogenerate") {
      const enabled = form.get("enabled") === "true";
      await setAutomation(id, { revision, autoGenerate: enabled });
      message = enabled ? "Otomatik makale üretimi açıldı: günlük sınır ve AI bütçesi içinde, 3 saatte bir sıradaki anahtar kelimeler için yazı üretilir." : "Otomatik makale üretimi kapatıldı (otomatik yayın da kapandı).";
    } else if (mode === "autopublish") {
      const enabled = form.get("enabled") === "true";
      await setAutomation(id, { revision, autoPublish: enabled });
      message = enabled ? "Otomatik yayın açıldı: yayın kapısını ve en düşük puanı geçen yazılar kendiliğinden yayınlanır; geçmeyenler incelemeye kalır." : "Otomatik yayın kapatıldı: tüm yazılar inceleme bekler.";
    } else if (mode === "generate") {
      const { created } = await queueArticleGeneration(id, String(form.get("keywordId")));
      message = created ? "Üretim sıraya alındı. Otomasyon sayfasında “Şimdi bir iş çalıştır” ile hemen başlatabilirsiniz." : "Bu anahtar kelime için üretim zaten sıraya alınmış ya da çalıştırılmış.";
    } else if (mode === "runnow") {
      const r = await runOneJobNow(id);
      message = r.stopped ? "Otomasyon durdurulmuş; iş çalıştırılmadı." : `Çalıştı: ${r.succeeded} tamamlandı, ${r.failed} başarısız, ${r.retried} yeniden denenecek.`;
      revalidatePath("/blog");
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
