import { redirect } from "next/navigation";
import { after } from "next/server";
import { getAuthContext } from "@/server/auth/context";
import { DashboardShell } from "@/components/admin/AdminShell";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { syncBillingNotices } from "@/server/services/billing.service";
import { db } from "@/server/db";
import { refreshAndNotify } from "@/server/services/coaching/coaching.service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  // Lazily sends any due "ödeme zamanı geldi" notice before the page renders, so it is already in
  // the student's notifications (the daily cron covers students who don't log in).
  const [goal] = await Promise.all([getActiveGoal(user.id), syncBillingNotices(user.id).catch(() => 0)]);
  const examFamily = goal ? examFamilyForCode(goal.examType.code) : null;
  // Coaching follow-ups run after the response is sent, so they never slow a page down. The
  // daily cron covers students who don't visit; the delivery log's unique key stops duplicates.
  after(async () => {
    const coaching = await db.coachingProfile.findUnique({ where: { userId: user.id }, select: { enabled: true } });
    if (coaching?.enabled) await refreshAndNotify(user).catch((e) => console.error("coaching follow-ups failed", e));
  });

  return <DashboardShell role={user.role} examFamily={examFamily}>{children}</DashboardShell>;
}
