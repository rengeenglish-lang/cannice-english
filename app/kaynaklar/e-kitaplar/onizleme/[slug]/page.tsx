import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { getAuthContext } from "@/server/auth/context";
import { getEbookOffers } from "@/server/services/ebooks.service";
import { EbookPurchase } from "@/components/resources/EbookPurchase";
import { EbookPitchPanel } from "@/components/resources/EbookPitchPanel";
import { EbookPreviewSlider } from "@/components/resources/EbookPreviewSlider";
import { findEbookPitch } from "@/lib/netfener-ebook-copy";
import { ebookFreePromoEndLabel, isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = findNetfenerEbook((await params).slug);
  return { title: book ? `${book.title} — 10 Sayfalık Önizleme` : "Kitap bulunamadı" };
}
export default async function EbookPreviewPage({ params }: Props) {
  const book = findNetfenerEbook((await params).slug);
  if (!book) notFound();
  const user = await getAuthContext();
  const offers = await getEbookOffers(user?.id);
  const pitch = findEbookPitch(book.slug);
  return <main className="inner-page mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6">
    <Link className="ghost-button mb-5" href="/kaynaklar/e-kitaplar">← E-Kitaplar</Link>
    <section className="panel">
      <p className="eyebrow">Ücretsiz önizleme · 10 sayfa</p>
      <h1 className="page-title mt-3">{book.title}</h1>
      <p className="mt-3 font-semibold">{book.subtitle}</p>
      <p className="page-copy mt-3">{book.description}</p>
      <p className="mt-4 text-sm text-[color:var(--muted)]">Tam kitap: {book.pages} sayfa. Önizleme herkese açıktır. {isEbookFreePromoActive() ? `${ebookFreePromoEndLabel()} tarihine kadar tüm kitap ücretsiz okunabilir; PDF indirmek için ücretsiz hesap yeterli.` : "Tam PDF için hesabınıza giriş yapmanız ve bu kitabı satın almanız gerekir."}</p>
      <div className="mt-6"><EbookPurchase book={book} signedIn={Boolean(user)} offer={offers[book.slug]} /></div>
      <a className="secondary-button mt-4" href={`/ebooks/previews/${book.slug}.pdf`} target="_blank" rel="noopener noreferrer">10 sayfalık önizlemeyi PDF olarak aç</a>
    </section>
    <EbookPreviewSlider key={book.slug} slug={book.slug} title={book.title} cover={book.cover} />
    {pitch ? <EbookPitchPanel title={book.title} pitch={pitch} /> : null}
    <section className="panel mt-10 text-center" aria-label="Tam kitaba erişim">
      <h2 className="text-xl font-bold">Çalışmaya tam kitapla devam edin</h2>
      <p className="my-4 text-sm text-[color:var(--muted)]">{isEbookFreePromoActive() ? "Kampanya süresince tam kitap ücretsiz." : "Ödeme onaylandıktan sonra tam PDF’yi hesabınızdan indirebilirsiniz."}</p>
      <EbookPurchase book={book} signedIn={Boolean(user)} offer={offers[book.slug]} />
    </section>
  </main>;
}
