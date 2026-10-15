import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Network, SearchCheck, ShieldCheck } from "lucide-react";
import meta from "@/public/wordnet/meta.json";
import { ThesaurusSearch } from "@/components/thesaurus/ThesaurusSearch";

export const metadata: Metadata = {
  title: "İngilizce Thesaurus — Eş ve Zıt Anlamlı Kelimeler",
  description: "İngilizce kelimelerin eş anlamlılarını, zıt anlamlılarını, ilgili kelimelerini ve farklı anlamlarını ücretsiz ara.",
  alternates: { canonical: "/thesaurus" },
};

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function ThesaurusPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? "").slice(0, 80);
  return (
    <main className="inner-page mx-auto w-full max-w-[1000px] px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="eyebrow">Ücretsiz WordNet aracı</p>
        <h1 className="page-title mt-2">Netfener Thesaurus</h1>
        <p className="page-copy mx-auto mt-3 max-w-2xl">
          İngilizce kelimelerin eş anlamlılarını, zıt anlamlılarını, kullanım anlamlarını ve ilişkili kelimelerini keşfet.
        </p>
      </header>

      <ThesaurusSearch key={query} initialQuery={query} />

      {!query ? (
        <>
          <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
            {["important", "study", "improve", "happy", "difficult", "explain", "change", "effective"].map((word) => (
              <li key={word}><Link href={`/thesaurus?q=${word}`} className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-sm font-semibold hover:border-[color:var(--brand)]">{word}</Link></li>
            ))}
          </ul>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <InfoCard icon={<SearchCheck size={22} />} title={`${meta.headwords.toLocaleString("tr-TR")} kelime`} copy={`${meta.senses.toLocaleString("tr-TR")} farklı anlam ve kullanım kaydı.`} />
            <InfoCard icon={<Network size={22} />} title="Anlam ağları" copy="Eş anlamlı, zıt anlamlı ve kavramsal olarak ilişkili kelimeler." />
            <InfoCard icon={<ShieldCheck size={22} />} title="Ücretsiz ve yerel" copy="Ücretli API yok; bütün aramalar Netfener içinde çalışır." />
          </div>
        </>
      ) : null}

      <p className="mt-12 text-center text-xs leading-5 text-[color:var(--muted)]">
        Thesaurus verileri Princeton Üniversitesi WordNet 3.1 veritabanından türetilmiştir. WordNet lisansı ve kaynak bildirimi veri paketinde korunmaktadır.
      </p>
    </main>
  );
}

function InfoCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <section className="dashboard-panel">
      <div className="text-[color:var(--accent)]" aria-hidden="true">{icon}</div>
      <h2 className="mt-3 text-lg font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{copy}</p>
    </section>
  );
}
