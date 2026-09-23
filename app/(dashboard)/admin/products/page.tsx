import Link from "next/link";
import type { Metadata } from "next";
import { listProductsForAdmin } from "@/server/services/admin-products.service";
import { togglePublishAction } from "@/app/actions/admin-products";
import { formatTRY } from "@/lib/pricing";

export const metadata: Metadata = { title: "Ürünler" };

const CATEGORY_LABEL: Record<string, string> = {
  PREP_GROUP: "Hazırlık Grubu",
  MOCK_CAMP: "Soru & Deneme Kampı",
  STUDY_PACKAGE: "Çalışma Paketi",
  TRANSLATION_SUPPORT: "Akademik Çeviri",
  PLAN: "Deneme Sınavı Planı",
  BOOK: "Kitap",
};

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Yönetim</p>
          <h1 className="page-title">Ürünler</h1>
        </div>
        <Link href="/admin/products/new" className="primary-button">Yeni Ürün</Link>
      </div>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Ürün</th><th>Kategori</th><th>Sınav</th><th>Fiyat</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="font-bold text-[color:var(--foreground)]">{product.title}</td>
                <td>{CATEGORY_LABEL[product.category] ?? product.category}</td>
                <td>{product.examType?.name ?? "—"}</td>
                <td>{formatTRY(String(product.salePrice))}</td>
                <td>{product.isPublished ? "Yayında" : "Taslak"}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/products/${product.id}`} className="ghost-button">Düzenle</Link>
                  <form action={async () => { "use server"; await togglePublishAction(product.id); }} className="inline">
                    <button type="submit" className="ghost-button">{product.isPublished ? "Yayından Kaldır" : "Yayınla"}</button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">Henüz ürün eklenmedi.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
