import { PageHero } from "@/components/ui/PageHero";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { getYouTubeEmbedUrl } from "@/lib/video";

type Props = { params: Promise<{ lessonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await db.recordedLesson.findUnique({
    where: { id: lessonId },
  });
  return { title: lesson?.title ?? "Ders Bulunamadı" };
}

export default async function DemoLessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = await db.recordedLesson.findUnique({
    where: { id: lessonId, isPreviewable: true },
    include: {
      module: { include: { course: { include: { product: true } } } },
    },
  });
  if (!lesson) notFound();
  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">{lesson.module.course.product.title}</p>
        <h1 className="page-title">{lesson.title}</h1>
      </PageHero>
      {embedUrl ? (
        <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-[color:var(--border)] shadow-[0_1px_2px_rgba(22,25,43,.05),0_16px_36px_rgba(24,36,73,.08)]">
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="panel mt-8 flex aspect-video items-center justify-center bg-[color:var(--brand-soft)] text-center text-sm font-bold text-[color:var(--brand)]">
          {lesson.videoUrl
            ? "Bu video kaynağı desteklenmiyor."
            : "Bu ders için video henüz yüklenmedi."}
        </div>
      )}
      {lesson.description ? (
        <p className="mt-6 text-base leading-7 text-[color:var(--muted)]">
          {lesson.description}
        </p>
      ) : null}
    </main>
  );
}
