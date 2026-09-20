import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { listEnrollmentsForUser } from "@/server/services/learning.service";
import { LiveCalendar } from "@/components/dashboard/LiveCalendar";

export const metadata: Metadata = { title: "Canlı Ders Takvimi" };

export default async function LiveSessionsPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const enrollments = await listEnrollmentsForUser(user.id);
  const sessions = enrollments
    .flatMap((e) =>
      e.course.liveSessions.map((s) => ({
        id: s.id,
        title: s.title,
        courseId: e.courseId,
        courseTitle: e.course.product.title,
        startsAt: s.startsAt.toISOString(),
      })),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Birlikte Öğrenelim</p>
      <h1 className="page-title">Canlı Ders Takvimi</h1>
      <div className="mt-6">
        <LiveCalendar sessions={sessions} today={new Date().toISOString()} />
      </div>
    </div>
  );
}
