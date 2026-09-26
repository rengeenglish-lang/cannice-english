import Image from "next/image";
import Link from "next/link";
import { NETFENER_EBOOKS, type NetfenerEbook } from "@/lib/netfener-ebooks";

import { EbookPurchase } from "@/components/resources/EbookPurchase";
import type { EbookOffer } from "@/server/services/ebooks.service";

export function NetfenerEbooks({ books = NETFENER_EBOOKS, signedIn, offers }: {
  books?: readonly NetfenerEbook[];
  signedIn: boolean;
  offers: Record<string, EbookOffer>;
}) {
  if (!books.length) return null;
  return (
    <section className="mt-10" aria-labelledby="netfener-ebooks-heading">
      <h2 id="netfener-ebooks-heading" className="section-title">Netfener çalışma kitapları</h2>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">İlk 3 sayfayı giriş yapmadan inceleyin. Tam PDF, giriş yaptıktan ve ilgili kitabı satın aldıktan sonra indirilebilir.</p>
      <ul className="mt-6 grid gap-6 lg:grid-cols-2">
        {books.map((book) => {
          return (
            <li key={book.slug} className="panel flex flex-col gap-6 sm:flex-row">
              <Image src={book.cover} alt={`${book.title} kitap kapağı`} width={300} height={424}
                className="mx-auto h-auto w-44 self-start rounded-lg shadow-md sm:mx-0" />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <p className="eyebrow">PDF · {book.pages} sayfa</p>
                <h3 className="mt-3 text-xl font-bold">{book.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{book.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{book.description}</p>
                <div className="mt-auto pt-6">
                  <Link className="secondary-button mb-4" href={`/kaynaklar/e-kitaplar/onizleme/${book.slug}`} aria-label={`${book.title}: İlk 3 sayfayı incele`}>İlk 3 sayfayı incele</Link>
                  <EbookPurchase book={book} signedIn={signedIn} offer={offers[book.slug]} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
