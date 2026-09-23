import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listFavorites } from "@/server/services/favorites.service";
import { favoriteToCartAction, removeFavoriteAction } from "@/app/actions/favorites";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Favorilerim" };

const TYPE_LABEL: Record<string, string> = {
  PLAN: "Plan",
  PREP_GROUP: "Canlı Grup Dersi",
  MOCK_CAMP: "Soru & Deneme Kampı",
  STUDY_PACKAGE: "Çalışma Paketi",
  TRANSLATION_SUPPORT: "Akademik Çeviri",
  BOOK: "Kitap",
};

export default async function FavoritesPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const favorites = await listFavorites(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Sonra bakmak için</p>
        <h1 className="page-title">Favorilerim</h1>
        <p className="page-copy">Kalp ikonuyla kaydettiğin planlar, grup dersleri, paketler ve kitaplar burada.</p>
      </div>
      {favorites.length === 0 ? (
        <div className="learning-empty">
          <Heart size={32} className="mx-auto mb-4 text-rose-500" aria-hidden="true" />
          <p className="font-bold">Henüz favorin yok.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">Beğendiğin ürünlerdeki kalp ikonuna dokunarak onları buraya kaydedebilirsin.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/planlar" className="primary-button">Planları incele</Link>
            <Link href="/kaynaklar" className="secondary-button">Kaynaklar</Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {favorites.map(({ product }) => {
            const href = product.category === "BOOK" ? `/books/${product.slug}` : product.category === "PLAN" ? "/planlar" : `/packages/${product.slug}`;
            const base = Number(product.basePrice);
            const sale = Number(product.salePrice);
            return (
              <li key={product.id} className="dashboard-panel flex flex-col gap-3">
                <div>
                  <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[10px] font-black tracking-wider text-[color:var(--brand)]">
                    {(TYPE_LABEL[product.category] ?? "Ürün").toLocaleUpperCase("tr-TR")}
                  </span>
                  <Link href={href} className="mt-2 block font-black hover:underline">{product.title}</Link>
                  {product.examType ? <p className="text-xs text-[color:var(--muted)]">{product.examType.name}</p> : null}
                </div>
                <div>
                  {base > sale ? <del className="text-xs text-slate-400">{formatTRY(base)}</del> : null}
                  <p className="text-xl font-black text-[color:var(--brand)]">{formatTRY(sale)}</p>
                </div>
                {!product.isPublished ? (
                  <p className="text-sm font-semibold text-rose-700">Bu ürün şu an satışta değil.</p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2">
                  {product.isPublished ? (
                    product.category === "PREP_GROUP" ? (
                      <Link href="/group-lessons" className="primary-button text-xs">Ders saati seç</Link>
                    ) : (
                      <form action={favoriteToCartAction.bind(null, product.id)}>
                        <button type="submit" className="primary-button text-xs">
                          <ShoppingCart size={15} aria-hidden="true" /> Sepete ekle
                        </button>
                      </form>
                    )
                  ) : null}
                  <form action={removeFavoriteAction.bind(null, product.id)}>
                    <button type="submit" className="ghost-button text-xs">Kaldır</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
