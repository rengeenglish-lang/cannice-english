import Link from "next/link";
import type { WiktionaryResult } from "@/lib/dictionary/wiktionary";
import { termSlug } from "@/lib/dictionary/text";

const POS: Record<string, string> = {
  noun: "İsim", verb: "Fiil", adjective: "Sıfat", adverb: "Zarf", pronoun: "Zamir",
  preposition: "Edat", conjunction: "Bağlaç", interjection: "Ünlem", determiner: "Belirteç",
};

const wordLink = (word: string) => `/sozluk/${encodeURIComponent(termSlug(word))}`;

export function WiktionaryResults({ result }: { result: WiktionaryResult }) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white" aria-labelledby="wiktionary-heading">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--brand-soft)] px-5 py-4 sm:px-6">
        <h2 id="wiktionary-heading" className="text-xl font-black">İngilizce açıklamalar: {result.word}</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Wiktionary&apos;den ayrıntılı tanımlar, örnekler ve sözcük biçimleri</p>
      </header>
      <div className="divide-y divide-[color:var(--border)]">
        {result.entries.map((entry, entryIndex) => (
          <article key={`${entry.partOfSpeech}-${entryIndex}`} className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-black text-[color:var(--brand)]">{POS[entry.partOfSpeech.toLowerCase()] ?? entry.partOfSpeech}</h3>
              {entry.pronunciations.length ? <span className="text-sm text-[color:var(--muted)]">{entry.pronunciations.join(" · ")}</span> : null}
            </div>
            <ol className="mt-3 space-y-4 pl-5 [list-style:decimal]">
              {entry.senses.map((sense, senseIndex) => (
                <li key={senseIndex} className="pl-1 text-sm leading-6">
                  <p>{sense.definition}</p>
                  {sense.examples[0] ? <p className="mt-1 border-l-2 border-[color:var(--border-strong)] pl-3 italic text-[color:var(--muted)]">{sense.examples[0]}</p> : null}
                  {sense.synonyms.length ? (
                    <p className="mt-1 text-xs text-[color:var(--muted)]"><strong>Eş anlamlılar:</strong>{" "}{sense.synonyms.map((word, index) => <span key={`${word}-${index}`}>{index ? ", " : ""}<Link href={wordLink(word)} className="hover:text-[color:var(--accent)] hover:underline">{word}</Link></span>)}</p>
                  ) : null}
                  {sense.antonyms.length ? (
                    <p className="mt-1 text-xs text-[color:var(--muted)]"><strong>Zıt anlamlılar:</strong>{" "}{sense.antonyms.map((word, index) => <span key={`${word}-${index}`}>{index ? ", " : ""}<Link href={wordLink(word)} className="hover:text-[color:var(--accent)] hover:underline">{word}</Link></span>)}</p>
                  ) : null}
                </li>
              ))}
            </ol>
            {entry.forms.length ? <p className="mt-4 text-xs text-[color:var(--muted)]"><strong>Biçimler:</strong> {entry.forms.map((form) => form.word).join(", ")}</p> : null}
          </article>
        ))}
      </div>
      <footer className="border-t border-[color:var(--border)] px-5 py-3 text-xs leading-5 text-[color:var(--muted)] sm:px-6">
        Kaynak: <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline">Wiktionary</a>. Veriler <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="font-bold underline">CC BY-SA 4.0</a> lisansıyla sunulur.
      </footer>
    </section>
  );
}
