import type { Metadata } from "next";
import { listExamTypes } from "@/server/services/catalog.service";
import { createProductAction } from "@/app/actions/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Yeni Ürün" };

export default async function NewProductPage() {
  const exams = await listExamTypes();
  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Yeni Ürün</h1>
      <p className="page-copy">Kaydettikten sonra kurs kategorisi seçtiyseniz ders modüllerini ve canlı dersleri ekleyebileceğiniz sayfaya yönlendirileceksiniz.</p>
      <div className="mt-8 max-w-3xl">
        <ProductForm exams={exams} product={null} action={createProductAction} />
      </div>
    </div>
  );
}
