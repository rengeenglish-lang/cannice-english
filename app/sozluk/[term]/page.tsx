import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { search, type SearchResult } from "@/lib/dictionary";
import { slugToQuery, termSlug } from "@/lib/dictionary/text";
import { SearchBox } from "@/components/dictionary/SearchBox";
import { ResultTable } from "@/components/dictionary/ResultTable";
import { Pronounce } from "@/components/dictionary/Pronounce";
import { dictionaryViewer } from "@/server/services/dictionary-viewer";

type Props = { params: Promise<{ term: string }> };

function queryFrom(raw: string) {
  try {
    return slugToQuery(raw);
  } catch {
    return raw.replace(/-/g, " ");
  }
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const hasResults = (r: SearchResult) => r.en.length + r.tr.length + r.phrases.length + r.trPhrases.length > 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const q = queryFrom((await params).term);
  const r = search(q);
  const canonical = `/sozluk/${encodeURIComponent(termSlug(q))}`;
  if (!hasResults(r)) return { title: `${q} — Netfener Sözlük`, robots: { index: false, follow: true } };
  const first = r.en[0] ?? r.tr[0];
  const isEnglish = r.en.length > 0;
  const meaning = isEnglish ? r.en.slice(0, 3).map((e) => e.tr).join("; ") : r.tr.slice(0, 4).map((e) => e.en).join(", ");
  return {
    title: isEnglish ? `${q} ne demek? ${q} Türkçesi — Netfener Sözlük` : `${q} İngilizcesi — Netfener Sözlük`,
    description: `${q}: ${meaning}. ${first?.exampleEn ? `Örnek: ${first.exampleEn}` : ""} İngilizce–Türkçe sözlük, telaffuz ve örnek cümleler.`.slice(0, 300),
    alternates: { canonical },
  };
}

export default async function DictionaryTermPage({ params }: Props) {
  const raw = (await params).term;
  const q = queryFrom(raw);
  const slug = termSlug(q);
  if (slug && safeDecode(raw) !== slug) permanentRedirect(`/sozluk/${encodeURIComponent(slug)}`);

  const r = search(q);
  const all = [...r.en, ...r.tr, ...r.phrases, ...r.trPhrases];
  const viewer = await dictionaryViewer(all.flatMap((e) => (e.lexiconId ? [e.lexiconId] : [])));
  const headline = r.lemma ?? r.query;

  return (
    <main className="inner-page mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Konum" className="text-xs font-bold text-[color:var(--muted)]">
        <Link href="/sozluk" className="hover:text-[color:var(--accent)]">Netfener Sözlük</Link> › <span>{r.query}</span>
      </nav>
      <div className="mt-4"><SearchBox initial={r.query} /></div>

      <header className="mt-8 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black tracking-tight">{headline}</h1>
        {r.en.length ? <Pronounce text={headline} /> : null}
      </header>
      {r.en.length ? (
        <Link href={`/thesaurus?q=${encodeURIComponent(headline)}`} className="mt-4 inline-flex items-center rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-2 text-sm font-black text-[color:var(--brand)] hover:border-[color:var(--brand)]">
          {headline} için eş ve zıt anlamlıları gör →
        </Link>
      ) : null}
      {r.lemma ? (
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          <strong>{r.query}</strong> kelimesi <strong>{r.lemma}</strong> kelimesinin çekimli hâli; sözlük biçimi gösteriliyor.
        </p>
      ) : null}

      <ResultTable title={`İngilizce → Türkçe: ${headline}`} rows={r.en} direction="en-tr" signedIn={viewer.signedIn} learning={viewer.learning} />
      <ResultTable title={`Türkçe → İngilizce: ${r.query}`} rows={r.tr} direction="tr-en" signedIn={viewer.signedIn} learning={viewer.learning} />
      <ResultTable title={`"${headline}" geçen ifadeler ve phrasal verb'ler`} rows={r.phrases} direction="en-tr" signedIn={viewer.signedIn} learning={viewer.learning} />
      <ResultTable title={`Anlamında "${r.query}" geçen terimler`} rows={r.trPhrases} direction="tr-en" signedIn={viewer.signedIn} learning={viewer.learning} />

      {!hasResults(r) ? (
        <section className="mt-10 rounded-2xl border border-dashed border-[color:var(--border-strong)] p-6">
          <h2 className="text-lg font-black">&ldquo;{r.query}&rdquo; için sonuç bulunamadı</h2>
          {r.suggestions.length ? (
            <>
              <p className="mt-2 text-sm text-[color:var(--muted)]">Bunu mu demek istediniz?</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {r.suggestions.map((s) => (
                  <li key={s}><Link href={`/sozluk/${encodeURIComponent(termSlug(s))}`} className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-sm font-bold hover:border-[color:var(--brand)]">{s}</Link></li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--muted)]">Yazımı kontrol et ya da kelimenin yalın hâlini dene.</p>
          )}
        </section>
      ) : null}

      <p className="mt-10 text-xs leading-5 text-[color:var(--muted)]">
        Netfener Sözlük; Kelime Motoru (A1–C1), The Ultimate Phrasal Verbs Guide ve YÖKDİL alan sözlüklerimiz için Netfener tarafından hazırlanan anlam ve örneklerden oluşur.
        Telaffuz, cihazının kendi sesleriyle çalınır.
      </p>
    </main>
  );
}
