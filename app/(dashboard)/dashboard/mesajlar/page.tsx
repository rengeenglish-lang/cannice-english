import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { listEnrollmentsForUser } from "@/server/services/learning.service";
import { listMessagesForStudent } from "@/server/services/messages.service";
import { TeacherMessageForm } from "@/components/messages/TeacherMessageForm";

export const metadata: Metadata = { title: "Mesajlarım" };

export default async function StudentMessagesPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { course } = await searchParams;
  const [enrollments, messages] = await Promise.all([listEnrollmentsForUser(user.id), listMessagesForStudent(user.id)]);
  const courses = enrollments.map((e) => ({ id: e.courseId, title: e.course.product.title }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Öğretmenine Sor</p>
        <h1 className="page-title">Mesajlarım</h1>
        <p className="page-copy">Derslerinle ilgili sorularını öğretmenine yaz; yanıtlandığında bildirim alırsın.</p>
      </div>
      <TeacherMessageForm courses={courses} defaultCourseId={courses.some((c) => c.id === course) ? course : undefined} />
      <section aria-labelledby="history-title">
        <h2 id="history-title" className="section-title !text-lg">Önceki mesajların</h2>
        {messages.length ? (
          <ul className="mt-4 space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="dashboard-panel">
                <p className="text-xs font-bold text-[color:var(--muted)]">
                  {m.course?.product.title ?? "Genel soru"} · {m.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
                {m.reply ? (
                  <div className="mt-4 rounded-xl bg-[color:var(--brand-soft)] p-4">
                    <p className="text-xs font-bold text-[color:var(--brand)]">{m.repliedBy?.name ?? "Öğretmenin"} yanıtladı</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{m.reply}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-semibold text-amber-700">Yanıt bekleniyor</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[color:var(--muted)]">Henüz mesaj göndermedin.</p>
        )}
      </section>
    </div>
  );
}
