import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { levelInfo, type LexiconLevelCode } from "@/lib/vocabulary/levels";
import { levelWords, setCount, setWords } from "@/lib/vocabulary/content";
import { buildQuiz } from "@/lib/vocabulary/quiz";
import { QuizRunner } from "@/components/lexicon/QuizRunner";

export const metadata: Metadata = { title: "Kelime testi" };

export default async function LexiconTestPage({ params }: { params: Promise<{ level: string; set: string }> }) {
  const { level, set } = await params;
  const info = levelInfo(level);
  const user = await getAuthContext();
  const n = Number(set);
  if (!info || !user || !Number.isInteger(n) || n < 1) notFound();
  const code = info.code as LexiconLevelCode;
  const total = setCount(code);
  if (n > total) notFound();
  const words = setWords(code, n);
  const questions = buildQuiz(words, levelWords(code));
  const base = `/dashboard/kelime-motoru/${code.toLowerCase()}`;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`${base}/${n}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--muted)]"><ArrowLeft size={16} aria-hidden="true" /> Kartlara dön</Link>
      <div className="mx-auto mt-4 max-w-xl">
        <p className="eyebrow">{code} · Set {n} testi</p>
        <h1 className="page-title !text-2xl sm:!text-3xl">Ne kadar öğrendin?</h1>
      </div>
      <div className="mt-6">
        <QuizRunner
          level={code}
          setNumber={n}
          questions={questions}
          words={Object.fromEntries(words.map((w) => [w.id, { word: w.word, tr: w.tr, exampleEn: w.exampleEn }]))}
          deckHref={`${base}/${n}`}
          nextHref={n < total ? `${base}/${n + 1}` : null}
          levelHref={base}
        />
      </div>
    </main>
  );
}
