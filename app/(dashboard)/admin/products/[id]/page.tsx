import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listExamTypes } from "@/server/services/catalog.service";
import { getProductForEdit } from "@/server/services/admin-products.service";
import { updateProductAction } from "@/app/actions/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";
import { CourseManager } from "@/components/admin/CourseManager";

export const metadata: Metadata = { title: "Ürünü Düzenle" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [exams, product] = await Promise.all([listExamTypes(), getProductForEdit(id)]);
  if (!product) notFound();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">{product.title}</h1>
      <div className="mt-8 max-w-3xl">
        <ProductForm exams={exams} product={product} action={updateProductAction.bind(null, id)} />
      </div>
      {product.course ? (
        <div className="max-w-3xl">
          <CourseManager
            productId={product.id}
            courseId={product.course.id}
            modules={product.course.modules}
            liveSessions={product.course.liveSessions}
          />
        </div>
      ) : null}
    </div>
  );
}
