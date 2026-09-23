import { ProductCard } from "@/components/catalog/ProductCard";

type ProductCardData = Parameters<typeof ProductCard>[0]["product"];

export function ProductGrid({ products, emptyLabel = "Bu kategoride henüz ürün bulunmuyor.", favoriteIds = new Set<string>() }: { products: ProductCardData[]; emptyLabel?: string; favoriteIds?: Set<string> }) {
  if (products.length === 0) {
    return <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-white/60 px-5 py-10 text-center text-[color:var(--muted)]">{emptyLabel}</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} isFavorite={favoriteIds.has(product.id)} />
      ))}
    </div>
  );
}
