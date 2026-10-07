"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import {
  CompetitorError,
  addCompetitor,
  importCompetitorTopics,
  removeCompetitor,
  saveSerpResults,
  setCompetitorActive,
  trackGapAsKeyword,
} from "@/server/services/seo/competitors.service";
export type CompetitorState = { ok: boolean; message: string };
export async function competitorAction(_: CompetitorState, form: FormData): Promise<CompetitorState> {
  try {
    const a = await getAuthContext();
    if (a?.role !== "ADMIN") throw new Error("Unauthorized");
    const mode = String(form.get("mode"));
    const text = String(form.get("text") || "");
    if (text.length > 120_000) throw new CompetitorError("Metin çok uzun.");
    let message: string;
    if (mode === "add") {
      await addCompetitor(a.id, { name: form.get("name"), domain: form.get("domain"), notes: String(form.get("notes") || "") });
      message = "Rakip eklendi.";
    } else if (mode === "toggle") {
      await setCompetitorActive(a.id, { id: String(form.get("id")), active: form.get("active") === "true" });
      message = "Rakip güncellendi.";
    } else if (mode === "remove") {
      await removeCompetitor(a.id, { id: String(form.get("id")), confirmed: form.get("confirmed") === "on" });
      message = "Rakip ve konuları silindi.";
    } else if (mode === "topics") {
      const r = await importCompetitorTopics(a.id, { competitorId: String(form.get("id")), text });
      message = `${r.added} konu eklendi${r.dropped ? `, ${r.dropped} satır kullanılamadı` : ""}.`;
    } else if (mode === "serp") {
      const r = await saveSerpResults(a.id, { keywordId: String(form.get("keywordId")), text });
      message = `${r.saved} sonuç kaydedildi${r.dropped ? `, ${r.dropped} satır kullanılamadı` : ""}.`;
    } else if (mode === "track") {
      await trackGapAsKeyword(a.id, { title: String(form.get("title")) });
      message = "Anahtar kelime olarak eklendi (arama hacmi ölçülmedi).";
    } else throw new Error("Invalid operation");
    revalidatePath("/admin/seo", "layout");
    return { ok: true, message };
  } catch (e) {
    const known = e instanceof CompetitorError || (e instanceof Error && /^(Bu anahtar|Çok sık|Başka bir SEO|Yalnızca mevcut)/.test(e.message));
    return { ok: false, message: known ? (e as Error).message : e instanceof Error && e.name === "ZodError" ? "Alanları kontrol edin." : "İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin." };
  }
}
