import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { wordStates } from "@/server/services/lexicon.service";
import { levelInfo, type LexiconLevelCode } from "@/lib/vocabulary/levels";
import { setCount, setWords } from "@/lib/vocabulary/content";
import { FlashcardDeck } from "@/components/lexicon/FlashcardDeck";

export const metadata: Metadata = { title: "Kelime kartları" };

export default async function LexiconSetPage({ params }: { params: Promise<{ level: string; set: string }> }) {
  const { level, set } = await params;
  const info = levelInfo(level);
  const user = await getAuthContext();
  const n = Number(set);
  if (!info || !user || !Number.isInteger(n) || n < 1) notFound();
  const code = info.code as LexiconLevelCode;
  if (n > setCount(code)) notFound();
  const words = setWords(code, n);
  const states = await wordStates(user.id, words);
  const base = `/dashboard/kelime-motoru/${code.toLowerCase()}`;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href={base} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--muted)]"><ArrowLeft size={16} aria-hidden="true" /> {code} setleri</Link>
      <div className="mx-auto mt-4 max-w-xl">
        <p className="eyebrow">{code} · Set {n} / {setCount(code)}</p>
        <h1 className="page-title !text-2xl sm:!text-3xl">Kelime kartları</h1>
      </div>
      <div className="mt-6">
        <FlashcardDeck
          level={code}
          words={words.map(({ id, word, pos, tr, exampleEn, exampleTr, tip }) => ({ id, word, pos, tr, exampleEn, exampleTr, tip }))}
          initialStates={states}
          testHref={`${base}/${n}/test`}
          levelHref={base}
        />
      </div>
    </main>
  );
}
