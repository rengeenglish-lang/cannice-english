import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { NextStepCta } from "@/components/marketing/NextStepCta";

export const metadata: Metadata = { title: "Sözlük" };

export default async function DictionaryPage() {
  const terms = await db.dictionaryTerm.findMany({
    include: { examType: true },
    orderBy: { term: "asc" },
  });
  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Faydalı Araçlar</p>
        <h1 className="page-title">İngilizce Sınavlar İçin Özel Sözlük</h1>
      </PageHero>
      <div className="mt-10 space-y-4">
        {terms.map((term) => (
          <div key={term.id} className="panel">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-black text-[color:var(--foreground)]">
                {term.term}
              </h2>
              {term.examType ? (
                <span className="eyebrow">{term.examType.name}</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {term.definition}
            </p>
            {term.exampleSentence ? (
              <p className="mt-1 text-sm italic text-slate-400">
                &ldquo;{term.exampleSentence}&rdquo;
              </p>
            ) : null}
          </div>
        ))}
        {terms.length === 0 ? (
          <p className="text-slate-500">Sözlük yakında eklenecek.</p>
        ) : null}
      </div>
      <NextStepCta />
    </main>
  );
}
