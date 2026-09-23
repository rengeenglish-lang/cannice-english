import { PageHero } from "@/components/ui/PageHero";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/server/services/catalog.service";
import { formatTRY } from "@/lib/pricing";
import { DiscountBadge } from "@/components/catalog/DiscountBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { favoriteProductIds } from "@/server/services/favorites.service";
import { getAuthContext } from "@/server/auth/context";
import { getPlanAccess } from "@/server/services/plans.service";

const FORMAT_LABEL: Record<string, string> = {
  PDF: "Dijital (PDF)",
  PRINT: "Basılı",
  PRINT_AND_PDF: "Basılı + Dijital",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Kitap Bulunamadı" };
  const description = product.shortDescription ?? `${product.title} — Cannice English'ten sınav hazırlık kitabı.`;
  return { title: product.title, description, openGraph: { title: product.title, description, type: "website" } };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.book) notFound();
  // Çırak/Uzman plans include digital extra materials — no separate purchase needed.
  const viewer = await getAuthContext();
  const access = await getPlanAccess(viewer);
  const isFavorite = (await favoriteProductIds(viewer?.id)).has(product.id);
  const includedDownload = access.can("FREE_MATERIALS") && product.book.digitalFileUrl ? product.book.digitalFileUrl : null;

  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <PageHero>
            {product.examType ? (
              <p className="eyebrow">{product.examType.name}</p>
            ) : null}
            <h1 className="page-title">{product.title}</h1>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Yazar: {product.book.author}
            </p>
            {product.description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {product.description}
              </p>
            ) : null}
          </PageHero>
        </div>
        <aside className="panel h-fit">
          <div className="flex items-end gap-3">
            {Number(product.basePrice) > Number(product.salePrice) ? (
              <p className="text-base text-slate-400 line-through">
                {formatTRY(String(product.basePrice))}
              </p>
            ) : null}
            <DiscountBadge
              basePrice={String(product.basePrice)}
              salePrice={String(product.salePrice)}
            />
          </div>
          <p className="text-3xl font-black text-[color:var(--brand)]">
            {formatTRY(String(product.salePrice))}
          </p>
          <div className="mt-5">
            {includedDownload ? (
              <>
                <p className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Bu e-kitap planına dahil.</p>
                <a href={includedDownload} target="_blank" rel="noopener noreferrer" className="primary-button w-full sm:w-auto">E-kitabı indir</a>
                {product.book.format !== "PDF" ? <p className="mt-4 text-xs text-slate-500">Basılı kopya için sepete ekleyebilirsin:</p> : null}
                {product.book.format !== "PDF" ? <div className="mt-2"><AddToCartButton productId={product.id} /></div> : null}
              </>
            ) : (
              <AddToCartButton productId={product.id} />
            )}
            <div className="mt-3">
              <FavoriteButton productId={product.id} initial={isFavorite} title={product.title} variant="full" />
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>✓ Format: {FORMAT_LABEL[product.book.format]}</li>
            {product.book.pageCount ? (
              <li>✓ {product.book.pageCount} sayfa</li>
            ) : null}
          </ul>
        </aside>
      </div>
    </main>
  );
}
