import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { listSelectedEbooks, rememberEbook } from "@/server/services/ebook-library.service";
import { getEbookOffers } from "@/server/services/ebooks.service";
import { NETFENER_EBOOKS, findNetfenerEbook } from "@/lib/netfener-ebooks";
import { EBOOK_REVIEW_UNLOCK_MESSAGE, needsEbookReview } from "@/lib/ebook-review-reward";
import { isEbookFreePromoActive, ebookFreePromoEndLabel } from "@/lib/netfener-ebook-promo";
import { EbookDownloadButton } from "@/components/resources/EbookDownloadButton";
import { PrintBookDialog } from "@/components/resources/PrintBookDialog";
import { ResendBookEmailForm } from "@/components/auth/BookEmailConfirmation";

export const metadata: Metadata = { title: "Kitaplarım", robots: { index: false, follow: false } };
export default async function MyBooksPage({ searchParams }: { searchParams: Promise<{ book?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const requested = findNetfenerEbook((await searchParams).book ?? "");
  if (requested) await rememberEbook(user.id, requested.slug);
  const [selected, offers] = await Promise.all([listSelectedEbooks(user.id), getEbookOffers(user.id)]);
  const promotion = Object.values(offers).find(offer => offer.promotion)?.promotion;
  const free = isEbookFreePromoActive();
  const slugs = new Set(selected.map(book => book.bookSlug));
  if (promotion?.firstBookSlug) slugs.add(promotion.firstBookSlug);
  const books = NETFENER_EBOOKS.filter(book => (free && promotion?.reviewUnlocked) || slugs.has(book.slug) || offers[book.slug]?.ownsOnline || offers[book.slug]?.ownsPdf);
  return <div className="space-y-7">
    <header><p className="eyebrow">Kütüphanen</p><h1 className="page-title">Kitaplarım</h1><p className="page-copy">Seçtiğin kitaplar burada. Online oku, PDF indir veya basılı kitap seçeneklerini incele.</p></header>
    {!user.emailVerifiedAt ? <section className="dashboard-panel max-w-2xl" aria-label="Kitap e-posta doğrulaması">
      <h2 className="text-lg font-semibold">Kitabını açmak için e-postanı doğrula.</h2><p className="mt-2 text-sm leading-6">E-postandaki bağlantı seni doğrudan bu alana getirir. Bağlantı ulaşmadıysa yeniden isteyebilirsin.</p><ResendBookEmailForm email={user.email} />
    </section> : null}
    {free ? <section className="dashboard-panel" aria-label="E-kitap kampanyası">
      <p className="text-sm leading-7">Kampanya {ebookFreePromoEndLabel()} tarihine kadar geçerli. {promotion?.reviewUnlocked ? "Yorumun sayesinde tüm kampanya e-kitaplarının PDF indirmeleri açıldı." : EBOOK_REVIEW_UNLOCK_MESSAGE}</p>
      {promotion?.trialEndsAt ? <p className="mt-3 text-sm">7 günlük Çırak dijital deneme bitişi: {new Date(promotion.trialEndsAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}. Ödeme bilgisi veya otomatik yenileme yok.</p> : null}
      {promotion?.firstBookSlug && !promotion.reviewUnlocked ? <Link className="primary-button mt-4" href="/dashboard/reviews#netfener-yorumu">Yorumumu paylaş ve diğer kitapları aç</Link> : null}
    </section> : null}
    {books.length ? <div className="grid gap-6 xl:grid-cols-2">{books.map(book => {
      const offer = offers[book.slug];
      const canRead = Boolean(offer?.ownsOnline || (free && user.emailVerifiedAt));
      const canDownload = Boolean(offer?.ownsPdf || (free && user.emailVerifiedAt));
      return <article key={book.slug} aria-label={book.title} className="dashboard-panel flex flex-col gap-5 sm:flex-row">
        <Image src={book.cover} width={145} height={205} alt={`${book.title} kapağı`} className="h-48 w-auto shrink-0 self-center object-contain sm:self-start" unoptimized />
        <div className="min-w-0 flex-1 space-y-4"><div><h2 className="text-xl font-semibold">{book.title}</h2><p className="mt-1 text-sm text-[color:var(--muted)]">{book.subtitle} · {book.pages} sayfa</p></div>
          {canRead ? <a href={`/kaynaklar/e-kitaplar/oku/${book.slug}`} target="_blank" rel="noopener noreferrer" className="primary-button">Online oku</a> : <Link className="secondary-button" href={`/kaynaklar/e-kitaplar/onizleme/${book.slug}`}>Kitabı incele</Link>}
          <EbookDownloadButton key={`${book.slug}:${promotion?.reviewUnlocked}`} slug={book.slug} filename={book.filename} reviewRequired={!offer?.ownsPdf && free && needsEbookReview(promotion, book.slug)} disabled={!canDownload} />
          {!free && !offer?.ownsPdf ? <Link className="ghost-button" href={`/kaynaklar/e-kitaplar/onizleme/${book.slug}`}>PDF satın alma seçenekleri</Link> : null}
          <PrintBookDialog title={book.title} signedIn product={offer?.editions.print} />
        </div>
      </article>;
    })}</div> : <div className="dashboard-panel"><p className="text-sm">Henüz bir kitap seçmedin.</p><Link className="primary-button mt-4" href="/kaynaklar/e-kitaplar">Kitapları keşfet</Link></div>}
    <Link className="secondary-button" href="/kaynaklar/e-kitaplar">Başka kitap seç</Link>
  </div>;
}
