import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faydalı Araçlar" };

const TOOLS = [
  {
    href: "/sozluk",
    title: "Netfener Sözlük",
    description: "İngilizce–Türkçe / Türkçe–İngilizce sözlük: phrasal verb'ler, akademik ve alan terimleri, telaffuz.",
  },
  {
    href: "/thesaurus",
    title: "Netfener Thesaurus",
    description: "142 binden fazla İngilizce kelime için eş anlamlı, zıt anlamlı ve ilişkili kelimeler.",
  },
  {
    href: "/tools/score-calculator",
    title: "Puan Hesaplama",
    description: "Doğru sayına göre tahmini bant/puan aralığını gör.",
  },
  {
    href: "/tools/guidance",
    title: "Rehberlik Aracı",
    description: "Sınavını ve hedefini seç, sana uygun paketi gör.",
  },
  {
    href: "/tools/exam-calendar",
    title: "ÖSYM Sınav Takvimi",
    description: "Tüm sınav tarihlerini tek takvimde bulun.",
  },
  {
    href: "/tools/free-resources",
    title: "Ücretsiz Kaynaklar",
    description: "İndirilebilir kelime listeleri ve çalışma kağıtları.",
  },
];

export default function ToolsIndexPage() {
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Faydalı Araçlar</p>
        <h1 className="page-title">
          Sınav hazırlığını destekleyen ücretsiz araçlar
        </h1>
      </PageHero>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="panel transition hover:-translate-y-1"
          >
            <h2 className="text-xl font-black text-[color:var(--foreground)]">
              {tool.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
