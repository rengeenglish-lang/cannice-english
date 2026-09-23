import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { listProducts } from "@/server/services/catalog.service";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { auth } from "@/auth";
import { favoriteProductIds } from "@/server/services/favorites.service";

export const metadata: Metadata = { title: "Kaynaklar" };

export default async function BooksPage() {
  const favoriteIds = await favoriteProductIds((await auth())?.user?.id);
  const products = await listProducts({ category: "BOOK" });
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Kaynaklar</p>
        <h1 className="page-title">
          Sınavınıza özel kelime kitapları ve deneme setleri
        </h1>
        <p className="page-copy">
          Basılı veya dijital formatta, sınav uzmanları tarafından hazırlanan
          kaynaklar.
        </p>
      </PageHero>
      <div className="mt-10">
        <ProductGrid favoriteIds={favoriteIds}
          products={products}
          emptyLabel="Kitaplar yakında eklenecek."
        />
      </div>
    </main>
  );
}
