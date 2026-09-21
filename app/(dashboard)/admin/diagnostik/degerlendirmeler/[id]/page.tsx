import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDiagnosticResponseForAdmin } from "@/server/services/admin-diagnostic-grading.service";
import { reviewDiagnosticResponseAction } from "@/app/actions/admin-diagnostic-grading";
import { ReviewSubmissionForm } from "@/components/admin/ReviewSubmissionForm";

export const metadata: Metadata = { title: "Değerlendirme" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminDiagnosticGradingDetailPage({ params }: Props) {
  const { id } = await params;
  const response = await getDiagnosticResponseForAdmin(id);
  if (!response) notFound();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">{response.question.topic.name}</h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        {response.attempt.user.name} · {response.question.examType?.name ?? "Genel"}
      </p>

      <div className="panel mt-6">
        <p className="eyebrow">Soru</p>
        {response.question.passageText ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[color:var(--muted)]">{response.question.passageText}</p>
        ) : null}
        <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[color:var(--foreground)]">{response.question.prompt}</p>
      </div>

      <div className="panel mt-6">
        <p className="eyebrow">Öğrenci Cevabı</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[color:var(--foreground)]">{response.answerRaw || "(Cevap verilmedi)"}</p>
      </div>

      <ReviewSubmissionForm
        action={reviewDiagnosticResponseAction.bind(null, id)}
        existingFeedback={response.teacherFeedback}
        existingScore={response.score}
      />
    </div>
  );
}
