import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { NetfenerEbook } from "@/lib/netfener-ebooks";
import { EBOOK_EDITIONS, EDITION_COPY } from "@/lib/netfener-ebook-editions";
import type { EbookOffer } from "@/server/services/ebooks.service";

/** The three ways to buy a book, plus whatever the reader already owns. */
export function EbookPurchase({ book, signedIn, offer }: {
  book: NetfenerEbook;
  signedIn: boolean;
  offer?: EbookOffer;
}) {
  const owned = signedIn && offer ? (
    <div className="flex flex-wrap gap-3">
      {offer.ownsOnline ? (
        <a className="primary-button" href={`/kaynaklar/e-kitaplar/oku/${book.slug}`} target="_blank" rel="noopener noreferrer">
          Online oku
        </a>
      ) : null}
      {offer.ownsPdf ? (
        <a className="secondary-button" href={`/api/ebooks/${book.slug}`} download={book.filename}>
          PDF indir
        </a>
      ) : null}
    </div>
  ) : null;

  const forSale = EBOOK_EDITIONS.filter((edition) => offer?.editions[edition]);
  if (!offer || (!owned && forSale.length === 0)) {
    return (
      <p className="text-sm text-[color:var(--muted)]">
        Satışa hazırlanıyor. 10 sayfalık önizlemeyi ücretsiz inceleyebilirsiniz.
      </p>
    );
  }

  return (
    <div className="w-full space-y-4">
      {owned}
      {forSale.length ? (
        <ul className="grid gap-3 sm:grid-cols-3">
          {forSale.map((edition) => {
            const sale = offer.editions[edition]!;
            const alreadyOwned =
              (edition === "pdf" && offer.ownsPdf) || (edition === "online" && offer.ownsOnline);
            return (
              <li
                key={edition}
                className="flex flex-col rounded-2xl border-2 border-[color:var(--border)] bg-white p-4 transition hover:border-[color:var(--accent)]"
              >
                <p className="text-sm font-extrabold">{EDITION_COPY[edition].label}</p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{EDITION_COPY[edition].note}</p>
                <p className="mt-3 text-xl font-black text-[color:var(--brand)]">{sale.price}</p>
                <div className="mt-3">
                  {alreadyOwned ? (
                    <p className="text-xs font-bold text-[color:var(--accent-strong)]">Bu sürüm sende</p>
                  ) : signedIn ? (
                    <AddToCartButton productId={sale.productId} />
                  ) : (
                    <Link
                      className="ghost-button -ml-4"
                      href={`/sign-in?next=${encodeURIComponent(`/kaynaklar/e-kitaplar/onizleme/${book.slug}`)}`}
                    >
                      Giriş yap
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
