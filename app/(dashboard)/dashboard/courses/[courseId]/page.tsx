import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { getEnrollmentForCourse } from "@/server/services/learning.service";
import { LearnModuleAccordion } from "@/components/course/LearnModuleAccordion";
import { LiveSessionSchedule } from "@/components/course/LiveSessionSchedule";

type Props = { params: Promise<{ courseId: string }> };

export const metadata: Metadata = { title: "Dersim" };

export default async function CourseLearningPage({ params }: Props) {
  const { courseId } = await params;
  const user = await getAuthContext();
  if (!user) notFound();

  const enrollment = await getEnrollmentForCourse(user.id, courseId);
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const totalLessons = enrollment.course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedLessonIds = new Set(enrollment.lessonProgresses.filter((progress) => progress.completedAt).map((progress) => progress.recordedLessonId));
  const percent = totalLessons > 0 ? Math.round((completedLessonIds.size / totalLessons) * 100) : 0;

  return (
    <div>
      <p className="eyebrow">Dersim</p>
      <h1 className="page-title">{enrollment.course.product.title}</h1>

      <div className="panel mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-[color:var(--foreground)]">İlerleme</p>
          <p className="text-sm font-bold text-[color:var(--accent-strong)]">{completedLessonIds.size}/{totalLessons} ders — %{percent}</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]">
          <div className="h-full rounded-full bg-[color:var(--accent)] transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {enrollment.course.liveSessions.length > 0 ? <LiveSessionSchedule sessions={enrollment.course.liveSessions} /> : null}
        <div>
          <p className="eyebrow mb-4">Ders İçeriği</p>
          <LearnModuleAccordion
            courseId={courseId}
            enrollmentId={enrollment.id}
            modules={enrollment.course.modules}
            completedLessonIds={completedLessonIds}
          />
        </div>
      </div>
    </div>
  );
}
