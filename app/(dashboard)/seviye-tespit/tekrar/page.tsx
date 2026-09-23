import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/server/auth/context";
import { getLevelTestHistory } from "@/server/services/diagnostic-results.service";
import { retakeLevelTestAction } from "@/app/actions/level-test";

export const metadata: Metadata = { title: "Seviye Tespit — Tekrar Çöz" };

export default async function RetakeLevelTestPage({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { hata } = await searchParams;
  const history = await getLevelTestHistory(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/seviye-tespit" className="ghost-button mb-4 -ml-4">← Seviye Tespit</Link>
      <p className="eyebrow">Tekrar Çöz</p>
      <h1 className="page-title">Önceki seviye tespit sınavların</h1>
      <p className="page-copy">Aynı soruları yeniden çözerek ne kadar ilerlediğini doğrudan karşılaştırabilirsin.</p>
      {hata ? (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Bu sınavın soruları artık kullanılmıyor. Yeni bir test çözebilirsin.
        </p>
      ) : null}
      {history.length === 0 ? (
        <div className="learning-empty mt-6">
          <p className="font-bold">Henüz tamamladığın bir seviye tespit sınavı yok.</p>
          <Link href="/seviye-tespit/yeni" className="primary-button mt-5">Yeni Test Başlat</Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-white">
          {history.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-bold">{a.examName} Seviye Tespit</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {a.completedAt?.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })} · {a.correct}/{a.total} doğru · %{a.percentage}
                  {a.cefr ? ` · CEFR ${a.cefr}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/sonuc/${a.id}`} className="ghost-button text-xs">Sonuç</Link>
                <form action={retakeLevelTestAction.bind(null, a.id)}>
                  <button type="submit" className="primary-button text-xs">Tekrar Çöz</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
