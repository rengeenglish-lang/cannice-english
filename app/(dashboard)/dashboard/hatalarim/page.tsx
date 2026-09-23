import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, Package, XCircle } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listRecentMistakes, MISTAKE_WINDOW_DAYS } from "@/server/services/mistakes.service";

export const metadata: Metadata = { title: "Hatalarım" };

const LETTERS = ["A", "B", "C", "D", "E"];

function optionLabel(options: string[], raw: string | null) {
  if (raw === null || raw === "") return "(Boş)";
  const index = Number(raw);
  if (Number.isInteger(index) && options[index] !== undefined) return `${LETTERS[index] ?? index + 1}) ${options[index]}`;
  return raw;
}

export default async function MistakesPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const mistakes = await listRecentMistakes(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Son {MISTAKE_WINDOW_DAYS} gün</p>
      <h1 className="page-title">Hatalarım</h1>
      <p className="page-copy">
        Son bir ay içinde yanlış cevapladığın sorular; her birinin açıklaması, ilgili kaynaklar ve konu anlatımı bağlantısıyla. Aynı soruyu daha sonra doğru çözdüğünde listeden kalkar.
      </p>

      {mistakes.length === 0 ? (
        <div className="learning-empty mt-6">
          <CheckCircle2 size={32} className="mx-auto mb-4 text-emerald-600" aria-hidden="true" />
          <p className="font-bold">Son 30 günde açık bir hatan yok.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">Seviye tespit, deneme veya pratik sorularda yanlış yaptığın sorular burada toplanır.</p>
          <Link href="/dashboard/practice" className="primary-button mt-5">Pratik yap</Link>
        </div>
      ) : (
        <ol className="mt-6 space-y-5">
          {mistakes.map((m, i) => (
            <li key={m.id} className="dashboard-panel">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[color:var(--muted)]">
                <span>
                  {i + 1}. {m.examName} · {m.topicName}
                </span>
                <span>
                  {m.sourceLabel} · {m.answeredAt.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}
                </span>
              </div>
              {m.passageText ? (
                <details className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <summary className="cursor-pointer font-bold">Okuma metnini göster</summary>
                  <p className="mt-2 whitespace-pre-wrap leading-6">{m.passageText}</p>
                </details>
              ) : null}
              <p className="mt-3 whitespace-pre-wrap font-semibold leading-7">{m.prompt}</p>

              <div className="mt-4 grid gap-2 text-sm">
                <p className="flex gap-2 rounded-xl bg-rose-50 p-3 text-rose-900">
                  <XCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span><strong>Senin cevabın:</strong> {optionLabel(m.options, m.studentAnswer)}</span>
                </p>
                {m.correctAnswer !== null ? (
                  <p className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-900">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span><strong>Doğru cevap:</strong> {optionLabel(m.options, m.correctAnswer)}</span>
                  </p>
                ) : null}
              </div>

              <div className="mt-4 rounded-xl border border-[color:var(--border)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Açıklama</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{m.explanation ?? "Bu soru için açıklama yakında eklenecek."}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {m.konu ? (
                  <Link href={m.konu.href} className="primary-button text-xs">
                    <BookOpen size={16} aria-hidden="true" /> Konu anlatımı: {m.konu.label}
                  </Link>
                ) : null}
                {m.materials.map((p) => (
                  <Link key={p.id} href={`/packages/${p.slug}`} className="secondary-button text-xs">
                    <Package size={16} aria-hidden="true" /> {p.title}
                  </Link>
                ))}
                <Link href="/kaynaklar" className="ghost-button text-xs">Ek materyaller</Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
