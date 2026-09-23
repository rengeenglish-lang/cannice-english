import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Download, Library, PlayCircle, Plus } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { listEnrollmentsForUser, getPurchasedMaterials } from "@/server/services/learning.service";
import { listSavedTopicsWithProgress } from "@/server/services/saved-topics.service";
import { summarizeLearning } from "@/lib/learning-overview";
import { konuAnlatimHref } from "@/lib/konu-links";
import { removeSavedTopicAction } from "@/app/actions/saved-topics";

export const metadata: Metadata = { title: "Derslerim" };

export default async function LessonsPage({ searchParams }: { searchParams: Promise<{ eklendi?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { eklendi } = await searchParams;

  const [enrollments, materials, savedTopics] = await Promise.all([
    listEnrollmentsForUser(user.id),
    getPurchasedMaterials(user.id),
    listSavedTopicsWithProgress(user.id),
  ]);
  // Derslerim is for video (recorded) lessons — live-only groups live in Canlı Derslerim.
  const videoEnrollments = enrollments.filter((e) => e.course.modules.some((m) => m.lessons.length > 0));
  const courses = videoEnrollments.map((e) => ({
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

      {eklendi ? (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Konu derslerine eklendi. Aşağıdaki Konu Anlatımı derslerim bölümünden çalışmaya başlayabilirsin.
        </p>
      ) : null}

      <section aria-labelledby="topics-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="topics-title" className="section-title !text-lg">Konu Anlatımı Derslerim</h2>
          <Link href="/dashboard/konu-anlatimi" className="secondary-button text-xs">
            <Plus size={16} aria-hidden="true" /> Ders Ekle
          </Link>
        </div>
        {savedTopics.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {savedTopics.map((topic) => (
              <li key={topic.topicId} className="dashboard-panel flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Library size={20} className="mt-0.5 shrink-0 text-[color:var(--accent-strong)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[color:var(--muted)]">{topic.examName}</p>
                    <p className="font-bold">{topic.topicName}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-[color:var(--muted)]">
                    <span>{topic.completed} / {topic.total} ders</span>
                    <strong>%{topic.percent}</strong>
                  </div>
                  <progress className="learning-progress" value={topic.completed} max={topic.total || 1} aria-label={`${topic.topicName} ilerlemesi`} />
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link href={konuAnlatimHref(topic.examSlug, topic.topicSlug)} className="primary-button text-xs">
                    {topic.completed ? "Devam et" : "Başla"} <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <form action={removeSavedTopicAction.bind(null, topic.topicId)}>
                    <button type="submit" className="ghost-button text-xs">Kaldır</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="learning-empty mt-4">
            <Library size={32} className="mx-auto mb-4 text-[color:var(--accent)]" aria-hidden="true" />
            <h3 className="font-bold">Henüz konu anlatımı dersi eklemedin.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[color:var(--muted)]">
              Sınavını ve çalışmak istediğin konuyu seç, &ldquo;Ders Ekle&rdquo; ile buraya ekle.
            </p>
            <Link href="/dashboard/konu-anlatimi" className="primary-button mt-5">Konu seç</Link>
          </div>
        )}
      </section>

      <section aria-labelledby="courses-title">
        <h2 id="courses-title" className="section-title !text-lg">Video Derslerim</h2>
        {courses.length ? (
          <div className="mt-4 grid gap-5 xl:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-card-header">
                  <div className="mb-4 flex items-center justify-between text-[color:var(--accent-strong)]">
                    <PlayCircle size={24} aria-hidden="true" />
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
            <h3 className="font-bold">Henüz video dersin yok.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[color:var(--muted)]">
              Kayıtlı video dersleri olan bir paket satın aldığında, dersler ödemen onaylandıktan sonra burada görünür.
            </p>
            <Link href="/packages" className="primary-button mt-5">Paketleri incele</Link>
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
