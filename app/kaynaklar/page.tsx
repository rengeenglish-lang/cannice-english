import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookMarked, FileText, Layers, Library } from "lucide-react";
import { RESOURCE_TYPES } from "@/server/services/resources.service";

export const metadata: Metadata = { title: "Kaynaklar" };

const ICONS = { "e-kitaplar": Library, "konu-konu": Layers, "pdf-denemeler": FileText, "kayitli-kaynaklar": BookMarked } as const;

export default function KaynaklarPage() {
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">KAYNAKLAR</p>
        <h1 className="page-title">Başarın için özenle hazırlanmış kaynaklar</h1>
        <p className="page-copy">E-kitaplardan konu konu çalışma kaynaklarına, PDF denemelerden kayıtlı kaynaklarına kadar her şey tek yerde.</p>
      </PageHero>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCE_TYPES.map((type) => {
          const Icon = ICONS[type.slug];
          return (
            <Link key={type.slug} href={`/kaynaklar/${type.slug}`} className="panel group flex flex-col gap-4 transition hover:-translate-y-1 hover:border-[color:var(--brand)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-extrabold">{type.label}</h2>
              <p className="text-sm leading-6 text-[color:var(--muted)]">{type.description}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-[color:var(--accent-strong)]">
                Aç <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-10 text-sm text-[color:var(--muted)]">
        Hazırlık grupları ve çalışma paketleri için <Link href="/packages" className="font-bold underline">Paketler</Link> sayfasına göz atabilirsin.
      </p>
    </main>
  );
}
