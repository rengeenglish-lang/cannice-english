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
        {enrollment.course.liveSessions.length > 0 ? (
          <LiveSessionSchedule
            sessions={enrollment.course.liveSessions}
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
