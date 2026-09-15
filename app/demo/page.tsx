import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Örnek Dersler" };

export default async function DemoIndexPage() {
  const lessons = await db.recordedLesson.findMany({
    where: { isPreviewable: true },
    include: { module: { include: { course: { include: { product: true } } } } },
    take: 12,
  });

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Örnek Dersleri İzle</p>
      <h1 className="page-title">Derslerimizden ücretsiz örnekler</h1>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Link key={lesson.id} href={`/demo/${lesson.id}`} className="panel transition hover:-translate-y-1">
            <p className="eyebrow">{lesson.module.course.product.title}</p>
            <h2 className="mt-2 text-lg font-black text-[color:var(--foreground)]">{lesson.title}</h2>
            {lesson.durationMinutes ? <p className="mt-2 text-sm text-slate-500">{lesson.durationMinutes} dk</p> : null}
          </Link>
        ))}
        {lessons.length === 0 ? <p className="text-slate-500">Örnek dersler yakında eklenecek.</p> : null}
      </div>
    </main>
  );
}
