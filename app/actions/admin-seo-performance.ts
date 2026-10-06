"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { MAX_CSV_BYTES } from "@/lib/seo/performance";
import {
  PerformanceError,
  importSearchCsv,
  syncSearchConsole,
} from "@/server/services/seo/performance.service";
export type PerformanceState = { ok: boolean; message: string };
export async function performanceAction(
  _: PerformanceState,
  form: FormData,
): Promise<PerformanceState> {
  try {
    const a = await getAuthContext();
    if (a?.role !== "ADMIN") throw new Error("Unauthorized");
    const mode = String(form.get("mode"));
    const period = { start: String(form.get("start") || ""), end: String(form.get("end") || "") };
    const kind = String(form.get("kind") || "");
    let result;
    if (mode === "csv") {
      const csv = String(form.get("csv") || "");
      if (csv.length > MAX_CSV_BYTES) throw new PerformanceError("CSV çok büyük.");
      result = await importSearchCsv(a.id, { kind, period, csv });
    } else if (mode === "sync") result = await syncSearchConsole(a.id, { kind, period });
    else throw new Error("Invalid operation");
    revalidatePath("/admin/seo", "layout");
    return {
      ok: true,
      message: `${result.rows} satır kaydedildi${result.dropped ? `, ${result.dropped} satır doğrulanamadığı için atlandı` : ""}${result.replaced ? " (aynı dönemin önceki anlık görüntüsü değiştirildi)" : ""}.`,
    };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof PerformanceError
          ? e.message
          : e instanceof Error && e.name === "ZodError"
            ? "Dönem veya alanlar geçersiz: tarihleri (en fazla 93 gün, gelecekte olmayan) ve CSV’yi kontrol edin."
            : "İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin.",
    };
  }
}
