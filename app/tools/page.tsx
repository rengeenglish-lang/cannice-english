import { PageHero } from "@/components/ui/PageHero";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faydalı Araçlar" };

const TOOLS = [
  {
    href: "/tools/dictionary",
    title: "Sözlük",
    description: "Sınavlara özel kelime ve terimler.",
  },
  {
    href: "/tools/score-calculator",
    title: "Puan Hesaplama",
    description: "Doğru sayınıza göre tahmini bant/puan aralığınızı görün.",
  },
  {
    href: "/tools/guidance",
    title: "Rehberlik Aracı",
    description: "Sınavınızı ve hedefinizi seçin, size uygun paketi görün.",
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
          Sınav hazırlığınızı destekleyen ücretsiz araçlar
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
