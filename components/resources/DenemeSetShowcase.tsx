import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import type { BundleOffer } from "@/server/services/ebooks.service";

const SETS = [
  { slug: "yds-denemeleri-set-1", label: "Set 1", range: "Deneme 1–5", tone: "bg-[#ffb15c] text-[#2b1600]" },
  { slug: "yds-denemeleri-set-2", label: "Set 2", range: "Deneme 6–10", tone: "bg-[#c9a8ff] text-[#1c0b3a]" },
] as const;

/** "10 Özgün Deneme": both YDS deneme books side by side, each opening its free preview. */
export function DenemeSetShowcase({ offer }: { offer?: BundleOffer }) {
  return (
    <section aria-labelledby="deneme-sets-heading" className="panel relative mt-10 overflow-hidden">
      <span className="inline-flex rounded-full bg-[color:var(--night)] px-3.5 py-1.5 text-xs font-black tracking-[.16em] text-white">10 ÖZGÜN DENEME</span>
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {SETS.map((set) => {
            const book = findNetfenerEbook(set.slug)!;
            return (
              <Link
                key={set.slug}
                href={`/kaynaklar/e-kitaplar/onizleme/${set.slug}`}
                className="group relative block aspect-[210/297] overflow-hidden rounded-xl shadow-[0_18px_40px_rgba(0,0,0,.25)] transition group-hover:-translate-y-1 hover:-translate-y-1"
                aria-label={`${book.title}: ücretsiz önizleme`}
              >
                <Image src={book.cover} alt={`${book.title} kapağı`} fill sizes="(min-width: 1024px) 260px, 45vw" className="object-cover" />
              </Link>
            );
          })}
        </div>
        <div className="min-w-0">
          <h2 id="deneme-sets-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Özgün YDS Denemeleri</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Gerçek sınav formatında 10 tam deneme ve 800 özgün soru. Her deneme 80 soru ve 180 dakika; cevap kâğıdı, cevap anahtarı, net ve puan takip tablosu ve her soru için Türkçe çözüm içerir. Soruların tamamı Netfener için yazıldı.
          </p>
          <div className="mt-6 flex items-center gap-2 sm:gap-3">
            {SETS.map((set, i) => (
              <div key={set.slug} className="contents">
                {i ? (
                  <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--night)] text-white">
                    <Plus size={16} />
                  </span>
                ) : null}
                <Link
                  href={`/kaynaklar/e-kitaplar/onizleme/${set.slug}`}
                  className={`flex min-w-0 flex-1 flex-col items-center rounded-full px-4 py-3 text-center font-black leading-tight shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${set.tone}`}
                >
                  <span className="text-[11px] tracking-[.14em] sm:text-xs">YDS DENEMELERİ</span>
                  <span className="text-lg sm:text-xl">{set.label.toLocaleUpperCase("tr")}</span>
                  <span className="text-[11px] font-bold opacity-80">{set.range}</span>
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold">
            {offer ? (
              <>
                İki set birlikte <span className="text-[color:var(--accent-strong)]">{offer.price}</span>
                {offer.discountPercent ? <span className="ml-1 text-[color:var(--muted)] line-through">{offer.listPrice}</span> : null}
                {" · "}
                <Link href="/kaynaklar/e-kitaplar#netfener-bundles-heading" className="underline">Seti incele</Link>
              </>
            ) : (
              <span className="text-[color:var(--muted)]">Satışa hazırlanıyor. Her setin 10 sayfalık önizlemesini ücretsiz inceleyebilirsin.</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
