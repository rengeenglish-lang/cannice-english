import type { Metadata } from "next";
import { listProducts } from "@/server/services/catalog.service";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export const metadata: Metadata = { title: "Kitaplar ve Kaynaklar" };

export default async function BooksPage() {
  const products = await listProducts({ category: "BOOK" });
  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Kitaplar ve Kaynaklar</p>
      <h1 className="page-title">Sınavınıza özel kelime kitapları ve deneme setleri</h1>
      <p className="page-copy">Basılı veya dijital formatta, sınav uzmanları tarafından hazırlanan kaynaklar.</p>
      <div className="mt-10">
        <ProductGrid products={products} emptyLabel="Kitaplar yakında eklenecek." />
      </div>
    </main>
  );
}
