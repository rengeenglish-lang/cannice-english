import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/server/services/catalog.service";
import { formatTRY } from "@/lib/pricing";
import { DiscountBadge } from "@/components/catalog/DiscountBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

const FORMAT_LABEL: Record<string, string> = { PDF: "Dijital (PDF)", PRINT: "Basılı", PRINT_AND_PDF: "Basılı + Dijital" };

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.title ?? "Kitap Bulunamadı" };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.book) notFound();

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {product.examType ? <p className="eyebrow">{product.examType.name}</p> : null}
          <h1 className="page-title">{product.title}</h1>
          <p className="mt-1 text-sm font-bold text-slate-500">Yazar: {product.book.author}</p>
          {product.description ? <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{product.description}</p> : null}
        </div>
        <aside className="panel h-fit">
          <div className="flex items-end gap-3">
            {Number(product.basePrice) > Number(product.salePrice) ? (
              <p className="text-base text-slate-400 line-through">{formatTRY(String(product.basePrice))}</p>
            ) : null}
            <DiscountBadge basePrice={String(product.basePrice)} salePrice={String(product.salePrice)} />
          </div>
          <p className="text-3xl font-black text-[color:var(--brand)]">{formatTRY(String(product.salePrice))}</p>
          <div className="mt-5"><AddToCartButton productId={product.id} /></div>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>✓ Format: {FORMAT_LABEL[product.book.format]}</li>
            {product.book.pageCount ? <li>✓ {product.book.pageCount} sayfa</li> : null}
          </ul>
        </aside>
      </div>
    </main>
  );
}
