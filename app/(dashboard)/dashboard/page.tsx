import Link from "next/link";
import { MyGroupBookings } from "@/components/availability/MyGroupBookings";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { listEnrollmentsForUser } from "@/server/services/learning.service";
import { summarizeLearning } from "@/lib/learning-overview";
import { LearningDashboard } from "@/components/dashboard/LearningDashboard";
export const metadata: Metadata = { title: "Çalışma Alanım" };
export default async function StudentDashboardPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const [enrollments, orders] = await Promise.all([
    listEnrollmentsForUser(user.id),
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);
  const courses = enrollments.map((e) => ({
    id: e.courseId,
    title: e.course.product.title,
    ...summarizeLearning(e.course.modules, e.lessonProgresses),
  }));
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
    <>
<Link href="/checkout/membership" className="ghost-button mb-4 inline-flex">Üyelik, program ödemeleri ve yenileme</Link>
<MyGroupBookings userId={user.id} />
<LearningDashboard
      name={user.name}
      courses={courses}
      sessions={sessions}
      today={new Date().toISOString()}
      orders={orders.map((o) => ({
        id: o.id,
        title: o.items.map((i) => i.titleSnapshot).join(", "),
        total: String(o.total),
        status: o.status,
      }))}
    />
</>
  );
}
