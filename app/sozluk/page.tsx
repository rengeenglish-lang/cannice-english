import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Languages, Sparkles, Volume2 } from "lucide-react";
import { CATEGORY_LABELS, POS_TR, dictionaryStats, wordOfTheDay } from "@/lib/dictionary";
import { termSlug } from "@/lib/dictionary/text";
import { dayKey } from "@/lib/coaching/time";
import { SearchBox } from "@/components/dictionary/SearchBox";
import { Pronounce } from "@/components/dictionary/Pronounce";

// "Günün kelimesi" changes daily.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Netfener Sözlük — İngilizce Türkçe Sözlük",
  description: "YDS, YÖKDİL, IELTS ve TOEFL'a hazırlananlar için İngilizce–Türkçe / Türkçe–İngilizce sözlük: phrasal verb'ler, akademik kelimeler, Sağlık, Fen ve Sosyal Bilimler terimleri, örnek cümleler ve telaffuz.",
  alternates: { canonical: "/sozluk" },
};

const POPULAR = ["carry out", "hypothesis", "however", "significant", "take on", "teşhis", "albeit", "prevalence", "put forward", "sürdürülebilir", "notwithstanding", "evidence"];

export default function DictionaryHomePage() {
  const stats = dictionaryStats();
  const word = wordOfTheDay(dayKey(new Date()));
  const link = (t: string) => `/sozluk/${encodeURIComponent(termSlug(t))}`;
  return (
    <main className="inner-page mx-auto w-full max-w-[1000px] px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="eyebrow">Ücretsiz araç</p>
        <h1 className="page-title mt-2">Netfener Sözlük</h1>
        <p className="page-copy mx-auto mt-3 max-w-2xl">
          İngilizce–Türkçe ve Türkçe–İngilizce. Sınav kelimeleri, phrasal verb&apos;ler ve akademik terimler; örnek cümleler ve telaffuzla.
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-3xl"><SearchBox autoFocus /></div>

      <p className="mt-4 text-center text-sm font-semibold text-[color:var(--muted)]">
        Eş veya zıt anlamlı mı arıyorsun? <Link href="/thesaurus" className="font-black text-[color:var(--accent)] hover:underline">Netfener Thesaurus&apos;u aç →</Link>
      </p>

      <ul className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
        {POPULAR.map((t) => (
          <li key={t}><Link href={link(t)} className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-sm font-semibold hover:border-[color:var(--brand)]">{t}</Link></li>
        ))}
      </ul>

      <div className="mt-12 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="wotd" className="dashboard-panel">
          <p className="eyebrow flex items-center gap-1.5"><Sparkles size={14} aria-hidden="true" /> Günün kelimesi</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 id="wotd" className="text-3xl font-black"><Link href={link(word.en)} className="hover:text-[color:var(--accent)]">{word.en}</Link></h2>
            <Pronounce text={word.en} />
          </div>
          <p className="mt-1 text-sm italic text-[color:var(--muted)]">{POS_TR[word.pos] ?? word.pos} · {word.level}</p>
          <p className="mt-3 text-lg font-bold">{word.tr}</p>
          {word.exampleEn ? (
            <blockquote className="mt-4 border-l-4 border-[color:var(--brand)] pl-3 text-sm">
              <p className="italic">{word.exampleEn}</p>
              {word.exampleTr ? <p className="mt-1 text-[color:var(--muted)]">{word.exampleTr}</p> : null}
            </blockquote>
          ) : null}
        </section>

        <section aria-labelledby="about-dict" className="dashboard-panel">
          <h2 id="about-dict" className="section-title !text-lg">Sözlükte neler var?</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><BookOpen size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" /> <span><strong>{stats.entries.toLocaleString("tr-TR")}</strong> anlam, <strong>{stats.headwords.toLocaleString("tr-TR")}</strong> İngilizce madde, <strong>{stats.turkishTerms.toLocaleString("tr-TR")}</strong> Türkçe karşılık</span></li>
            <li className="flex gap-2"><Languages size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" /> <span>İki yönlü arama; Türkçe karakter yazmadan da bulur (ogrenci → öğrenci). Çekimli hâlleri tanır (went → go, studies → study).</span></li>
            <li className="flex gap-2"><Volume2 size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" /> <span>Amerikan ve İngiliz telaffuzu, her anlam için örnek cümle ve çevirisi.</span></li>
          </ul>
          <p className="mt-4 text-xs font-black uppercase tracking-wide text-[color:var(--muted)]">Kategoriler</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {Object.values(CATEGORY_LABELS).map((c) => <li key={c} className="rounded-full bg-[color:var(--brand-soft)] px-2.5 py-1 text-xs font-bold">{c}</li>)}
          </ul>
          <Link href="/dashboard/kelime-motoru" className="mt-5 inline-block text-sm font-bold text-[color:var(--accent)]">Kelime Motoru ile seviyene göre çalış →</Link>
        </section>
      </div>
    </main>
  );
}
