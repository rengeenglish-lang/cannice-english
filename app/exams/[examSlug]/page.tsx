import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getExamTypeBySlug,
  listProducts,
} from "@/server/services/catalog.service";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ExamShowcase } from "@/components/exams/ExamShowcase";
import { EXAM_LANDING_CONTENT } from "@/lib/exam-landing";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";

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
  const content = EXAM_LANDING_CONTENT[exam.code];

  if (content) {
    return (
      <ExamShowcase
        name={exam.name}
        slug={exam.slug}
        content={content}
        speakingHref={exam.code === "TOEFL" ? "/dashboard/speaking-practice/toefl" : exam.code === "IELTS" ? "/dashboard/speaking-practice/ielts" : undefined}
        examFamily={examFamilyForCode(exam.code)}
      >
        <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-7"><p className="eyebrow">Hazırlık seçenekleri</p><h2 className="mt-2 text-3xl font-black tracking-tight">{exam.name} kaynakları</h2></div>
          <ProductGrid products={products} emptyLabel={`${exam.name} için hazırlık paketleri yakında eklenecek.`} />
        </section>
      </ExamShowcase>
    );
  }

  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <header className="inner-page-hero">
        <p className="eyebrow">{exam.name}</p>
        <h1 className="page-title">{exam.name} Online Hazırlık</h1>
      </header>
      {exam.shortDescription ? (
        <p className="page-copy">{exam.shortDescription}</p>
      ) : null}
      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyLabel={`${exam.name} için hazırlık paketleri yakında eklenecek.`}
        />
      </div>
    </main>
  );
}
