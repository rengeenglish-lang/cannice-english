import Link from "next/link";
import { ProductGrid } from "@/components/catalog/ProductGrid";

type ProductCardData = Parameters<typeof ProductGrid>[0]["products"];

export function PackageHighlights({ products }: { products: ProductCardData }) {
  return (
    <section className="mx-auto mt-20 w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Öne Çıkan Paketler</p>
          <h2 className="section-title">Sıfırdan başlayanlar için de puanını artırmak isteyenler için de</h2>
        </div>
        <Link href="/packages" className="secondary-button">Tüm Paketleri Gör</Link>
      </div>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
