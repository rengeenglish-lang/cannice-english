import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { EXAM_META } from "@/lib/exam-types";
import { ScoreCalculatorForm } from "@/components/tools/ScoreCalculatorForm";
import { NextStepCta } from "@/components/marketing/NextStepCta";

export const metadata: Metadata = { title: "Puan Hesaplama" };

export default async function ScoreCalculatorPage() {
  const exams = await db.examType.findMany({
    where: { active: true, scoreConversionRows: { some: {} } },
    include: { scoreConversionRows: { orderBy: { displayOrder: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });

  const examGroups = exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    solid: EXAM_META[exam.code].solid,
    rows: exam.scoreConversionRows,
  }));

  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Faydalı Araçlar</p>
        <h1 className="page-title">YDS ve YÖKDİL Puan Hesaplama Aracı</h1>
        <p className="page-copy">
          Sınavı seç, doğru cevap sayını gir — tahmini puan aralığını
          hemen gör.
        </p>
      </PageHero>
      <div className="mt-8">
        {examGroups.length > 0 ? (
          <ScoreCalculatorForm exams={examGroups} />
        ) : (
          <p className="text-[color:var(--muted)]">
            Puan tabloları yakında eklenecek.
          </p>
        )}
      </div>
      <NextStepCta title="Hedef puanına ne kadar uzaksın?" copy="Ücretsiz seviye tespitiyle hangi konularda puan kaybettiğini gör; deneme sınavları ve konu anlatımlarıyla farkı kapat." />
    </main>
  );
}
