import { Book3D } from "@/components/ui/Book3D";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { NETFENER_BUNDLES, bundleBooks } from "@/lib/netfener-bundles";
import type { BundleOffer } from "@/server/services/ebooks.service";

/** Bundle cards: the covers you get, what you save, and one button. */
export function EbookBundles({ offers, signedIn }: {
  offers: Record<string, BundleOffer>;
  signedIn: boolean;
}) {
  const sellable = NETFENER_BUNDLES.filter((bundle) => offers[bundle.slug]);
  if (!sellable.length) return null;

  return (
    <section className="mt-12" aria-labelledby="netfener-bundles-heading">
      <h2 id="netfener-bundles-heading" className="section-title">Birlikte al, daha az öde</h2>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        Setlerdeki kitapların tamamı hesabına tanımlanır; her birini ayrı ayrı indirebilirsin.
      </p>

      <ul className="mt-6 grid gap-6 lg:grid-cols-2">
        {sellable.map((bundle) => {
          const offer = offers[bundle.slug];
          const books = bundleBooks(bundle);
          // Five covers is the most that fans out without a title disappearing behind the next book.
          const shown = books.slice(0, 5);
          const hidden = books.length - shown.length;
          const coverWidth = shown.length <= 3 ? 112 : shown.length === 4 ? 100 : 88;
          const overlap = Math.round(coverWidth * 0.14);
          return (
            <li
              key={bundle.slug}
              className="panel group relative flex flex-col overflow-hidden border-2 border-[color:var(--border)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]"
            >
              <span className="absolute left-0 top-0 rounded-br-2xl bg-[color:var(--brand)] px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em] text-[color:var(--gold)]">
                Birlikte al
              </span>

              <div className="flex items-end justify-center rounded-2xl bg-[color:var(--brand-soft)] px-4 pb-7 pt-12">
                {shown.map((book, index) => (
                  <div
                    key={book.slug}
                    className="relative"
                    style={{ zIndex: index + 1, marginLeft: index ? -overlap : 0 }}
                  >
                    <Book3D src={book.cover} alt={book.title} width={coverWidth} />
                  </div>
                ))}
                {hidden > 0 ? (
                  <span className="ml-4 self-center rounded-full bg-[color:var(--brand)] px-3 py-2 text-xs font-extrabold text-[color:var(--gold)]">
                    +{hidden} kitap
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col px-1 pt-6">
                <h3 className="text-xl font-extrabold sm:text-2xl">{bundle.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[color:var(--accent-strong)]">{bundle.subtitle}</p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{bundle.description}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {books.map((book) => (
                    <li
                      key={book.slug}
                      className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-bold text-[color:var(--muted)]"
                    >
                      {book.title}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-end gap-4 pt-6">
                  {offer.discountPercent > 0 ? (
                    <span className="rounded-xl bg-[color:var(--accent)] px-3 py-2 text-sm font-black text-white">
                      %{offer.discountPercent}
                    </span>
                  ) : null}
                  <div>
                    {offer.discountPercent > 0 ? (
                      <p className="text-sm text-[color:var(--muted)] line-through">{offer.listPrice}</p>
                    ) : null}
                    <p className="text-2xl font-black text-[color:var(--brand)]">{offer.price}</p>
                  </div>
                  <div className="ml-auto">
                    {signedIn ? (
                      <AddToCartButton productId={offer.productId} />
                    ) : (
                      <Link className="primary-button" href="/sign-in?next=%2Fkaynaklar%2Fe-kitaplar">
                        Satın almak için giriş yap
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
