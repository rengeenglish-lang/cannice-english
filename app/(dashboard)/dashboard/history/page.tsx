import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { getAttemptHistory } from "@/server/services/diagnostic-results.service";

export const metadata: Metadata = { title: "Geçmiş Sorular" };

const KIND_LABEL: Record<string, string> = {
  FULL_DIAGNOSTIC: "Seviye Tespit",
  MASTERY_CHECK: "Konu Kontrolü",
  PRACTICE: "Pratik",
  MOCK_EXAM: "Deneme Sınavı",
};

export default async function HistoryPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const attempts = await getAttemptHistory(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Geçmişin</p>
      <h1 className="page-title">Geçmiş Sorular</h1>

      {attempts.length === 0 ? (
        <p className="page-copy mt-4">Henüz soru çözmediniz.</p>
      ) : (
        <ul className="mt-6 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)]">
          {attempts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-bold text-[color:var(--foreground)]">
                  {KIND_LABEL[a.kind] ?? a.kind}{a.topicName ? ` · ${a.topicName}` : ""}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {a.examName} · {a.completedAt?.toLocaleDateString("tr-TR")} · {a.correct}/{a.total} doğru
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[color:var(--accent-strong)]">%{a.percentage}</span>
                <Link href={`/seviye-tespit/sonuc/${a.id}`} className="ghost-button text-xs">Görüntüle</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
