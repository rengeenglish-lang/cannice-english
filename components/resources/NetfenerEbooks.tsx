import { EbookShowcase } from "./EbookShowcase";
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
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">İlk 10 sayfayı giriş yapmadan inceleyin. Tam PDF, giriş yaptıktan ve ilgili kitabı satın aldıktan sonra indirilebilir.</p>
      <ul className="mt-6 grid gap-8">
        {books.map((book) => {
          return (
            <li key={book.slug} className="panel grid gap-8 md:grid-cols-[minmax(280px,0.8fr)_1.2fr] md:items-center">
              <EbookShowcase book={book} />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <p className="eyebrow">PDF · {book.pages} sayfa</p>
                <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{book.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{book.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{book.description}</p>
                <div className="mt-auto pt-6">
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
