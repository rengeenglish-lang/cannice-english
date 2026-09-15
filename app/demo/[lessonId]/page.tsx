import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";

type Props = { params: Promise<{ lessonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await db.recordedLesson.findUnique({ where: { id: lessonId } });
  return { title: lesson?.title ?? "Ders Bulunamadı" };
}

export default async function DemoLessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = await db.recordedLesson.findUnique({
    where: { id: lessonId, isPreviewable: true },
    include: { module: { include: { course: { include: { product: true } } } } },
  });
  if (!lesson) notFound();

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">{lesson.module.course.product.title}</p>
      <h1 className="page-title">{lesson.title}</h1>
      <div className="panel mt-8 flex aspect-video items-center justify-center bg-[color:var(--brand-soft)] text-center text-sm font-bold text-[color:var(--brand)]">
        {lesson.videoUrl ? "Video oynatıcı yakında eklenecek." : "Bu ders için video henüz yüklenmedi."}
      </div>
      {lesson.description ? <p className="mt-6 text-base leading-7 text-slate-600">{lesson.description}</p> : null}
    </main>
  );
}
