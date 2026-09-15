import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getExamTypeBySlug, listProducts } from "@/server/services/catalog.service";
import { ProductGrid } from "@/components/catalog/ProductGrid";

type Props = { params: Promise<{ examSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = await getExamTypeBySlug(examSlug);
  return { title: exam ? `${exam.name} Online Dersler` : "Sınav Bulunamadı" };
}

export default async function ExamLandingPage({ params }: Props) {
  const { examSlug } = await params;
  const exam = await getExamTypeBySlug(examSlug);
  if (!exam) notFound();

  const products = await listProducts({ examTypeId: exam.id });

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">{exam.name}</p>
      <h1 className="page-title">{exam.name} Online Hazırlık</h1>
      {exam.shortDescription ? <p className="page-copy">{exam.shortDescription}</p> : null}
      <div className="mt-10">
        <ProductGrid products={products} emptyLabel={`${exam.name} için hazırlık paketleri yakında eklenecek.`} />
      </div>
    </main>
  );
}
