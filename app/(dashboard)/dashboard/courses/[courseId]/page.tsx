import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { summarizeLearning } from "@/lib/learning-overview";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { getEnrollmentForCourse } from "@/server/services/learning.service";
import { listSubmissionsForEnrollment } from "@/server/services/submissions.service";
import { LearnModuleAccordion } from "@/components/course/LearnModuleAccordion";
import { LiveSessionSchedule } from "@/components/course/LiveSessionSchedule";
import { PracticeSubmissionPanel } from "@/components/course/PracticeSubmissionPanel";
import { billingState } from "@/lib/billing";

type Props = { params: Promise<{ courseId: string }> };

export const metadata: Metadata = { title: "Dersim" };

export default async function CourseLearningPage({ params }: Props) {
  const { courseId } = await params;
  const user = await getAuthContext();
  if (!user) notFound();

  const enrollment = await getEnrollmentForCourse(user.id, courseId);
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const totalLessons = enrollment.course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );
  const completedLessonIds = new Set(
    enrollment.lessonProgresses
      .filter((progress) => progress.completedAt)
      .map((progress) => progress.recordedLessonId),
  );
  const progress = summarizeLearning(
    enrollment.course.modules,
    enrollment.lessonProgresses,
  );
  const percent = progress.percent;
  const submissions = await listSubmissionsForEnrollment(enrollment.id);
  // A group locked for non-payment keeps its recorded content, but its live-lesson links are
  // withheld until the student renews (Canlı Derslerim shows the "Devam etmek için öde" button).
  const liveLocked = billingState(enrollment.paidThrough) === "LOCKED";
  const liveSessions = liveLocked ? enrollment.course.liveSessions.map((s) => ({ ...s, meetingUrl: null })) : enrollment.course.liveSessions;

  return (
    <div>
      <Link href="/dashboard" className="ghost-button mb-4">
        ← Çalışma alanıma dön
      </Link>
      <PageHero>
        <p className="eyebrow">ÖĞRENME YOLUNUZ</p>
        <h1 className="page-title">{enrollment.course.product.title}</h1>
        <p className="page-copy">
          Derslerinizi takip edin, öğrendiklerinizi uygulayın ve ilerlemenizi
          kaydedin.
        </p>
      </PageHero>

      <div className="panel mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-[color:var(--foreground)]">
            İlerleme
          </p>
          <p className="text-sm font-bold text-[color:var(--accent-strong)]">
            {progress.completed}/{totalLessons} ders — %{percent}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]">
          <div
            className="h-full rounded-full bg-[color:var(--accent)] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {liveLocked ? (
          <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            Aylık ödemen yapılmadığı için canlı ders bağlantıları kapalı. <Link href="/dashboard/live-sessions" className="underline">Canlı Derslerim</Link> sayfasından ödemeni yaparak devam edebilirsin.
          </p>
        ) : null}
        {liveSessions.length > 0 ? (
          <LiveSessionSchedule
            sessions={liveSessions}
            now={new Date().getTime()}
            allowJoin
          />
        ) : null}
        <div>
          <p className="eyebrow mb-4">Ders İçeriği</p>
          <LearnModuleAccordion
            courseId={courseId}
            enrollmentId={enrollment.id}
            modules={enrollment.course.modules}
            completedLessonIds={completedLessonIds}
          />
        </div>
        <PracticeSubmissionPanel
          courseId={courseId}
          enrollmentId={enrollment.id}
          submissions={submissions}
        />
      </div>
    </div>
  );
}
