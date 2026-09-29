import { Book3D } from "@/components/ui/Book3D";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { NETFENER_BUNDLES, bundleBooks } from "@/lib/netfener-bundles";
import type { BundleOffer } from "@/server/services/ebooks.service";

/** How much shelf shows in front of the books, in pixels. */
const FLOOR = 64;

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
          // Five covers is the most that fits the shelf once they are spaced apart.
          const shown = books.slice(0, 5);
          const hidden = books.length - shown.length;
          const coverWidth = shown.length <= 3 ? 112 : shown.length === 4 ? 100 : 88;
          // A gap, not an overlap: touching covers read as one continuous picture.
          const gap = Math.round(coverWidth * 0.16);
          return (
            <li
              key={bundle.slug}
              className="panel group relative flex flex-col overflow-hidden border-2 border-[color:var(--border)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]"
            >
              <span className="absolute left-0 top-0 z-10 rounded-br-2xl bg-[color:var(--brand)] px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em] text-[color:var(--gold)]">
                Birlikte al
              </span>

              <div
                className="relative h-[240px] overflow-hidden rounded-2xl sm:h-[262px]"
                style={{
                  perspective: 900,
                  perspectiveOrigin: "50% 42%",
                  background: "linear-gradient(180deg,#171512 0%,#211d18 58%,#2a241d 100%)",
                }}
              >
                {/* the shelf itself: a plane laid down under the books, receding towards the wall */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "-30%",
                    right: "-30%",
                    bottom: 0,
                    height: 300,
                    transformOrigin: "bottom center",
                    transform: "rotateX(74deg)",
                    background:
                      "linear-gradient(180deg,#5a4028 0%,#402c1a 38%,#2a1c10 100%)," +
                      "repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 58px,rgba(255,255,255,.05) 58px 60px)",
                  }}
                />
                {/* lamp light falling from above the shelf */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[-40px] h-[260px] w-[420px] -translate-x-1/2"
                  style={{ background: "radial-gradient(50% 60% at 50% 0%,rgba(255,215,150,.30),transparent 72%)" }}
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 h-0.5"
                  style={{ bottom: FLOOR, background: "linear-gradient(90deg,transparent,rgba(255,206,130,.35),transparent)" }}
                />
                <div className="absolute inset-x-0 flex items-end justify-center px-4" style={{ bottom: FLOOR }}>
                  {shown.map((book, index) => (
                    <div
                      key={book.slug}
                      className="relative"
                      style={{ zIndex: index + 1, marginLeft: index ? gap : 0 }}
                    >
                      <Book3D src={book.cover} alt={book.title} width={coverWidth} />
                    </div>
                  ))}
                  {hidden > 0 ? (
                    <span className="ml-4 self-center rounded-full border border-[color:var(--gold)]/40 bg-white/10 px-3 py-2 text-xs font-extrabold text-[color:var(--gold)]">
                      +{hidden} kitap
                    </span>
                  ) : null}
                </div>
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
