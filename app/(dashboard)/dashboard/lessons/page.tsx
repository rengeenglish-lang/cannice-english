import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Download } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listEnrollmentsForUser, getPurchasedMaterials } from "@/server/services/learning.service";
import { summarizeLearning } from "@/lib/learning-overview";
import { MyGroupBookings } from "@/components/availability/MyGroupBookings";

export const metadata: Metadata = { title: "Derslerim" };

export default async function LessonsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const [enrollments, materials] = await Promise.all([listEnrollmentsForUser(user.id), getPurchasedMaterials(user.id)]);
  const courses = enrollments.map((e) => ({
    id: e.courseId,
    title: e.course.product.title,
    ...summarizeLearning(e.course.modules, e.lessonProgresses),
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Öğrenmeniz</p>
        <h1 className="page-title">Derslerim</h1>
      </div>

      <MyGroupBookings userId={user.id} />

      <section aria-labelledby="courses-title">
        <h2 id="courses-title" className="section-title !text-lg">Satın Aldığım Kurslar</h2>
        {courses.length ? (
          <div className="mt-4 grid gap-5 xl:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-card-header">
                  <div className="mb-4 flex items-center justify-between text-[color:var(--accent-strong)]">
                    <BookOpen size={24} aria-hidden="true" />
                    <span className="text-xs font-bold">{course.percent === 100 && course.total ? "Tamamlandı" : "Aktif kurs"}</span>
                  </div>
                  <h3 className="text-xl font-extrabold">{course.title}</h3>
                </div>
                <div className="course-card-body">
                  <div>
                    <div className="mb-2 flex justify-between gap-3 text-xs text-[color:var(--muted)]">
                      <span>{course.completed} / {course.total} ders tamamlandı</span>
                      <strong>%{course.percent}</strong>
                    </div>
                    <progress className="learning-progress" value={course.completed} max={course.total || 1} aria-label={`${course.title} ilerlemesi`} />
                  </div>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">
                    {course.nextLesson
                      ? `Sıradaki: ${course.nextLesson.title}`
                      : course.total
                        ? "Tüm dersler tamamlandı. İstediğiniz zaman tekrar edebilirsiniz."
                        : "Ders içeriği ve canlı program için kursunuzu açın."}
                  </p>
                  <Link
                    href={`/dashboard/courses/${course.id}${course.nextLesson ? `#lesson-${course.nextLesson.id}` : ""}`}
                    className="primary-button mt-auto"
                  >
                    {course.nextLesson ? "Derse devam et" : "Kursu aç"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="learning-empty mt-4">
            <BookOpen size={32} className="mx-auto mb-4 text-[color:var(--accent)]" aria-hidden="true" />
            <h3 className="font-bold">Henüz satın alınmış bir kursunuz yok.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[color:var(--muted)]">
              Satın aldığınız dersler, ödemeniz onaylandıktan sonra burada görünür. Bu sırada konu anlatımlarını inceleyebilirsiniz.
            </p>
            <Link href="/konu-anlatim" className="primary-button mt-5">Konu anlatımlarına git</Link>
          </div>
        )}
      </section>

      {materials.length ? (
        <section aria-labelledby="materials-title">
          <h2 id="materials-title" className="section-title !text-lg">Satın Aldığım Materyaller</h2>
          <ul className="mt-4 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)]">
            {materials.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 text-sm font-bold">{item.titleSnapshot}</span>
                {item.product.book?.digitalFileUrl ? (
                  <a href={item.product.book.digitalFileUrl} target="_blank" rel="noopener noreferrer" className="ghost-button self-start text-xs">
                    <Download size={14} aria-hidden="true" /> İndir
                  </a>
                ) : (
                  <Link href={`/books/${item.product.slug}`} className="ghost-button self-start text-xs">Görüntüle</Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
