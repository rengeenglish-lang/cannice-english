import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Genel İngilizce CEFR Sonucu" };

export default async function GeneralEnglishResultPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const result = await db.englishPlacement.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  if (!result) redirect("/seviye-tespit/genel-ingilizce");
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <p className="eyebrow">General English · CEFR</p>
      <h1 className="page-title">Genel İngilizce test sonucun</h1>
      <section className="dashboard-panel space-y-4">
        <h2 className="text-lg font-bold">Tahmini CEFR seviyen</h2>
        <p className="text-5xl font-black text-[color:var(--accent-strong)]">{result.cefr}</p>
        <p>{result.total} soruda {result.correct} doğru cevap.</p>
        <p className="text-sm leading-6 text-[color:var(--muted)]">Her seviyedeki 5 sorudan en az 3 doğru cevapla, önceki seviyeleri de geçerek ilerlersin. A1 sorularında 3 doğrunun altındaysan başlangıç düzeyinden çalışmaya başlayabilirsin. Bu kısa test dil bilgisi ve kelime becerilerine dayalı bir tahmindir; resmî CEFR sertifikası değildir. Konuşma, dinleme ve yazma ayrıca değerlendirilmelidir.</p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/seviye-tespit/genel-ingilizce" className="primary-button">Tekrar çöz</Link>
        <Link href="/seviye-tespit/yeni" className="secondary-button">Diğer seviye testleri</Link>
      </div>
    </main>
  );
}
