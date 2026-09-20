import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { getQuestionForEdit } from "@/server/services/admin-diagnostic-questions.service";
import { updateDiagnosticQuestionAction } from "@/app/actions/admin-diagnostic-questions";
import { DiagnosticQuestionForm } from "@/components/admin/DiagnosticQuestionForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditDiagnosticQuestionPage({ params }: Props) {
  const { id } = await params;
  const [question, exams, topics] = await Promise.all([
    getQuestionForEdit(id),
    db.examType.findMany({ orderBy: { displayOrder: "asc" } }),
    db.diagnosticTopic.findMany({ select: { id: true, slug: true } }),
  ]);
  if (!question) notFound();

  const topicSlugById = Object.fromEntries(topics.map((t) => [t.id, t.slug]));

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/diagnostik/sorular" className="hover:underline">Seviye Tespit Soruları</Link> › Düzenle
      </p>
      <h1 className="page-title line-clamp-1">{question.prompt}</h1>
      <div className="mt-8 max-w-2xl">
        <DiagnosticQuestionForm question={question} exams={exams} topicSlugById={topicSlugById} action={updateDiagnosticQuestionAction.bind(null, id)} />
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Soruyu Düzenle" };
