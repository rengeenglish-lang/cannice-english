import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ListChecks } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { setsOverview } from "@/server/services/lexicon.service";
import { levelInfo, type LexiconLevelCode } from "@/lib/vocabulary/levels";
import { levelWords } from "@/lib/vocabulary/content";

export const metadata: Metadata = { title: "Kelime Motoru – setler" };

export default async function LexiconLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = levelInfo(level);
  const user = await getAuthContext();
  if (!info || !user) notFound();
  const code = info.code as LexiconLevelCode;
  if (!levelWords(code).length) notFound();
  const sets = await setsOverview(user.id, code);
  const base = `/dashboard/kelime-motoru/${code.toLowerCase()}`;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard/kelime-motoru" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--muted)]"><ArrowLeft size={16} aria-hidden="true" /> Seviyeler</Link>
      <p className="eyebrow mt-4">{code} · {info.name}</p>
      <h1 className="page-title">{sets.length} set, {levelWords(code).length} kelime</h1>
      <p className="page-copy">Her sette 20 kelime var. Kartları çalış, ardından testi çöz; en az %70 ile set geçilmiş sayılır.</p>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sets.map((s) => (
          <li key={s.n} className={`dashboard-panel !p-4 ${s.passed ? "!border-emerald-300" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Set {s.n}</span>
              {s.passed ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700"><Check size={12} aria-hidden="true" /> {s.best ? `${s.best.score}/${s.best.total}` : ""}</span> : s.best ? <span className="text-xs font-semibold text-[color:var(--muted)]">En iyi {s.best.score}/{s.best.total}</span> : null}
            </div>
            <p lang="en" className="mt-2 line-clamp-1 text-sm text-[color:var(--muted)]">{s.preview.join(", ")}…</p>
            <p className="mt-2 text-xs text-[color:var(--muted)]">✓ {s.known} · ↺ {s.learning} / {s.size}</p>
            <div className="mt-3 flex gap-2">
              <Link href={`${base}/${s.n}`} className="primary-button !min-h-9 flex-1 !px-3 !py-1.5 text-xs">Kartlar</Link>
              <Link href={`${base}/${s.n}/test`} className="ghost-button !min-h-9 !px-3 text-xs"><ListChecks size={14} aria-hidden="true" /> Test</Link>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
