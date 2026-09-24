import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { levelsOverview } from "@/server/services/lexicon.service";

export const metadata: Metadata = { title: "Kelime Motoru" };

export default async function LexiconHomePage() {
  const user = await getAuthContext();
  if (!user) return null;
  const levels = await levelsOverview(user.id);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="eyebrow">Kelime Motoru</p>
      <h1 className="page-title">Seviyene göre kelime öğren</h1>
      <p className="page-copy">Kartları kaydır, çevir, anlamını ve kullanımını gör; kendi notlarını ekle. Her 20 kelimelik setin sonunda kısa bir test seni bekliyor.</p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((l) => {
          const ready = l.words > 0;
          const pct = l.words ? Math.round((l.known / l.words) * 100) : 0;
          return (
            <li key={l.code} className={`dashboard-panel flex flex-col ${ready ? "" : "opacity-70"}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-[color:var(--night)] text-xl font-bold text-[color:var(--gold)]">{l.code}</span>
                <span className="text-right text-xs font-semibold text-[color:var(--muted)]">{ready ? `${l.words} kelime · ${l.sets} set` : `yaklaşık ${l.target} kelime`}</span>
              </div>
              <h2 className="mt-4 text-xl font-bold">{l.name}</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{l.blurb}</p>
              {ready ? (
                <>
                  <div className="mt-4 flex justify-between text-xs font-semibold text-[color:var(--muted)]"><span>{l.known} kelime biliyorum</span><span>{l.passed}/{l.sets} set geçildi</span></div>
                  <progress className="learning-progress mt-2 w-full" value={pct} max={100} aria-label={`${l.code} ilerleme %${pct}`} />
                  <div className="mt-5 flex flex-wrap gap-2">
                    {l.next ? <Link href={`/dashboard/kelime-motoru/${l.code.toLowerCase()}/${l.next}`} className="primary-button !min-h-10 !py-2 text-sm">{l.passed ? "Devam et" : "Başla"} · Set {l.next} <ArrowRight size={16} aria-hidden="true" /></Link> : null}
                    <Link href={`/dashboard/kelime-motoru/${l.code.toLowerCase()}`} className="ghost-button !min-h-10 gap-1.5 text-sm"><Layers size={16} aria-hidden="true" /> Tüm setler</Link>
                  </div>
                </>
              ) : (
                <p className="mt-5 rounded-xl bg-[color:var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[color:var(--accent-strong)]">Hazırlanıyor — yakında</p>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
