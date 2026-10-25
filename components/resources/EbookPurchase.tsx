import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { NetfenerEbook } from "@/lib/netfener-ebooks";
import { EBOOK_EDITIONS, EDITION_COPY } from "@/lib/netfener-ebook-editions";
import type { EbookOffer } from "@/server/services/ebooks.service";
import { ebookFreePromoEndLabel, isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";

/** The three ways to buy a book, plus whatever the reader already owns. */
export function EbookPurchase({ book, signedIn, offer }: {
  book: NetfenerEbook;
  signedIn: boolean;
  offer?: EbookOffer;
}) {
  // Free promotion: read online for everyone, PDF for any signed-in account. Only print stays on sale.
  if (isEbookFreePromoActive()) {
    const next = encodeURIComponent(`/kaynaklar/e-kitaplar/onizleme/${book.slug}`);
    const print = offer?.editions.print;
    return (
      <div className="w-full space-y-4">
        <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          🎁 Bu kitap {ebookFreePromoEndLabel()} tarihine kadar ücretsiz. Online okumak için hesap gerekmez; PDF indirmek için ücretsiz hesap açman yeterli.
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="primary-button" href={`/kaynaklar/e-kitaplar/oku/${book.slug}`} target="_blank" rel="noopener noreferrer">
            Online oku (ücretsiz)
          </a>
          {signedIn ? (
            <a className="secondary-button" href={`/api/ebooks/${book.slug}`} download={book.filename}>
              PDF indir (ücretsiz)
            </a>
          ) : (
            <Link className="secondary-button" href={`/sign-in?next=${next}`}>
              PDF indirmek için giriş yap / hesap aç
            </Link>
          )}
        </div>
        {print ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[color:var(--border)] bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold">{EDITION_COPY.print.label}</p>
              <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{EDITION_COPY.print.note}</p>
              <p className="mt-2 text-lg font-black text-[color:var(--brand)]">{print.price}</p>
            </div>
            {signedIn ? (
              <AddToCartButton productId={print.productId} />
            ) : (
              <Link className="ghost-button" href={`/sign-in?next=${next}`}>Giriş yap</Link>
            )}
          </div>
        ) : null}
      </div>
    );
  }

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
