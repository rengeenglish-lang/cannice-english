import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSubmissionForAdmin } from "@/server/services/submissions.service";
import { reviewSubmissionAction } from "@/app/actions/admin-submissions";
import { ReviewSubmissionForm } from "@/components/admin/ReviewSubmissionForm";

export const metadata: Metadata = { title: "Değerlendirme" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminSubmissionDetailPage({ params }: Props) {
  const { id } = await params;
  const submission = await getSubmissionForAdmin(id);
  if (!submission) notFound();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">{submission.title}</h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        {submission.enrollment.user.name} · {submission.enrollment.course.product.title}
      </p>

      <div className="panel mt-6">
        <p className="eyebrow">Öğrenci Cevabı</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[color:var(--foreground)]">{submission.studentAnswer}</p>
      </div>

      <ReviewSubmissionForm
        action={reviewSubmissionAction.bind(null, id)}
        existingFeedback={submission.teacherFeedback}
        existingScore={submission.score}
      />
    </div>
  );
}
