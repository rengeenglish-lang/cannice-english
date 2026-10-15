"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, LoaderCircle, Search, Volume2 } from "lucide-react";
import { lemmaCandidates, termSlug } from "@/lib/dictionary/text";
import { normaliseThesaurusQuery, wordNetShard } from "@/lib/thesaurus/text";

type WordNetSense = {
  p: "noun" | "verb" | "adjective" | "adverb";
  d: string;
  s: string[];
  a?: string[];
  r?: string[];
  e?: string[];
};

type WordNetShard = Record<string, WordNetSense[]>;

const POS_LABEL: Record<WordNetSense["p"], string> = {
  noun: "İsim",
  verb: "Fiil",
  adjective: "Sıfat",
  adverb: "Zarf",
};

function speak(word: string) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function hrefFor(word: string) {
  return `/thesaurus?q=${encodeURIComponent(word)}`;
}

export function ThesaurusSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [input, setInput] = useState(initialQuery);
  const [result, setResult] = useState<{ word: string; senses: WordNetSense[] } | null>(null);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const searched = Boolean(initialQuery);

  useEffect(() => {
    const query = normaliseThesaurusQuery(initialQuery);
    if (!query) return;

    const controller = new AbortController();

    async function lookup() {
      const candidates = [query, ...lemmaCandidates(query)].filter((word, index, all) => all.indexOf(word) === index);
      for (const candidate of candidates) {
        const response = await fetch(`/wordnet/${wordNetShard(candidate)}.json`, { signal: controller.signal });
        if (!response.ok) continue;
        const shard = (await response.json()) as WordNetShard;
        if (shard[candidate]?.length) {
          setResult({ word: candidate, senses: shard[candidate] });
          return;
        }
      }
    }

    lookup()
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResult(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [initialQuery]);

  const groups = useMemo(() => {
    if (!result) return [];
    const grouped = new Map<WordNetSense["p"], WordNetSense[]>();
    for (const sense of result.senses) grouped.set(sense.p, [...(grouped.get(sense.p) ?? []), sense]);
    return [...grouped.entries()];
  }, [result]);

  return (
    <>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const query = normaliseThesaurusQuery(input);
          if (query) router.push(hrefFor(query));
        }}
        className="mx-auto mt-8 max-w-3xl"
      >
        <label htmlFor="thesaurus-query" className="sr-only">İngilizce kelime ara</label>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-[color:var(--brand)] bg-white px-4 py-2 shadow-sm focus-within:ring-4 focus-within:ring-[color:var(--brand-soft)]">
          <Search size={21} className="shrink-0 text-[color:var(--muted)]" aria-hidden="true" />
          <input
            id="thesaurus-query"
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="İngilizce kelime yaz: important, study, improve…"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            maxLength={80}
            className="min-w-0 flex-1 bg-transparent py-2 text-lg font-semibold outline-none"
          />
          <button type="submit" className="primary-button !min-h-0 !px-5 !py-2">Ara</button>
        </div>
      </form>

      {loading ? (
        <div className="mt-14 flex items-center justify-center gap-3 text-sm font-bold text-[color:var(--muted)]" role="status">
          <LoaderCircle className="animate-spin" size={22} aria-hidden="true" /> WordNet aranıyor…
        </div>
      ) : null}

      {!loading && result ? (
        <section className="mt-10" aria-live="polite">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-5">
            <div>
              <p className="eyebrow">Arama sonucu</p>
              <h2 className="mt-1 text-4xl font-black tracking-tight">{result.word}</h2>
              {result.word !== normaliseThesaurusQuery(initialQuery) ? (
                <p className="mt-1 text-sm text-[color:var(--muted)]">Kelimenin sözlük biçimi gösteriliyor.</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => speak(result.word)} className="secondary-button !min-h-10 !px-4 !py-2">
                <Volume2 size={17} aria-hidden="true" /> Dinle
              </button>
              <Link href={`/sozluk/${encodeURIComponent(termSlug(result.word))}`} className="secondary-button !min-h-10 !px-4 !py-2">
                <BookOpen size={17} aria-hidden="true" /> Türkçe anlamı
              </Link>
            </div>
          </header>

          <div className="mt-7 space-y-8">
            {groups.map(([partOfSpeech, senses]) => (
              <section key={partOfSpeech} aria-labelledby={`pos-${partOfSpeech}`}>
                <h3 id={`pos-${partOfSpeech}`} className="inline-flex rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-sm font-black text-[color:var(--brand)]">
                  {POS_LABEL[partOfSpeech]}
                </h3>
                <ol className="mt-4 space-y-4">
                  {senses.map((sense, index) => (
                    <li key={`${partOfSpeech}-${sense.d}-${index}`} className="dashboard-panel">
                      <p className="text-sm leading-6 text-[color:var(--muted)]"><strong className="mr-2 text-[color:var(--foreground)]">{index + 1}.</strong>{sense.d}</p>
                      {sense.s.length ? <WordLinks title="Eş anlamlılar" words={sense.s} tone="synonym" /> : null}
                      {sense.a?.length ? <WordLinks title="Zıt anlamlılar" words={sense.a} tone="antonym" /> : null}
                      {sense.r?.length ? <WordLinks title="İlgili kelimeler" words={sense.r} tone="related" /> : null}
                      {sense.e?.length ? (
                        <div className="mt-4 border-l-4 border-[color:var(--border-strong)] pl-4">
                          {sense.e.map((example) => <p key={example} className="mt-1 text-sm italic text-[color:var(--muted)]">“{example}”</p>)}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && searched && !result ? (
        <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-dashed border-[color:var(--border-strong)] p-6 text-center" aria-live="polite">
          <h2 className="text-xl font-black">Bu kelime için WordNet sonucu bulunamadı</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Yazımı kontrol et veya kelimenin yalın İngilizce biçimini dene.</p>
          <Link href={`/sozluk/${encodeURIComponent(termSlug(initialQuery))}`} className="mt-5 inline-flex items-center gap-2 font-bold text-[color:var(--accent)]">
            Netfener Sözlük&apos;te ara <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </>
  );
}

function WordLinks({ title, words, tone }: { title: string; words: string[]; tone: "synonym" | "antonym" | "related" }) {
  const style = tone === "antonym"
    ? "border-red-200 bg-red-50 text-red-800 hover:border-red-400"
    : tone === "related"
      ? "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-400"
      : "border-[color:var(--border-strong)] bg-white text-[color:var(--brand)] hover:border-[color:var(--brand)]";
  return (
    <div className="mt-4">
      <p className="text-xs font-black uppercase tracking-[.12em] text-[color:var(--muted)]">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {words.map((word) => (
          <li key={word}><Link href={hrefFor(word)} className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-bold transition ${style}`}>{word}</Link></li>
        ))}
      </ul>
    </div>
  );
}
