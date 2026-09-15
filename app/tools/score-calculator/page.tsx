import type { Metadata } from "next";
import { db } from "@/server/db";
import { EXAM_META } from "@/lib/exam-types";
import { ScoreCalculatorForm } from "@/components/tools/ScoreCalculatorForm";

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
    <main className="mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Faydalı Araçlar</p>
      <h1 className="page-title">YDS ve YÖKDİL Puan Hesaplama Aracı</h1>
      <p className="page-copy">Sınavı seçin, doğru cevap sayınızı girin — tahmini puan aralığınızı hemen görün.</p>
      <div className="mt-8">
        {examGroups.length > 0 ? (
          <ScoreCalculatorForm exams={examGroups} />
        ) : (
          <p className="text-[color:var(--muted)]">Puan tabloları yakında eklenecek.</p>
        )}
      </div>
    </main>
  );
}
