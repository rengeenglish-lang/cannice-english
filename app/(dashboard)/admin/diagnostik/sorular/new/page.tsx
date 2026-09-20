import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { DiagnosticQuestionForm } from "@/components/admin/DiagnosticQuestionForm";
import { createDiagnosticQuestionAction } from "@/app/actions/admin-diagnostic-questions";

export const metadata: Metadata = { title: "Yeni Soru" };

export default async function NewDiagnosticQuestionPage() {
  const exams = await db.examType.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/diagnostik/sorular" className="hover:underline">Seviye Tespit Soruları</Link> › Yeni
      </p>
      <h1 className="page-title">Yeni Soru</h1>
      <div className="mt-8 max-w-2xl">
        <DiagnosticQuestionForm question={null} exams={exams} topicSlugById={{}} action={createDiagnosticQuestionAction} />
      </div>
    </div>
  );
}
