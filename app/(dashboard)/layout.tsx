import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { DashboardShell } from "@/components/admin/AdminShell";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { syncBillingNotices } from "@/server/services/billing.service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  // Lazily sends any due "ödeme zamanı geldi" notice before the page renders, so it is already in
  // the student's notifications (the daily cron covers students who don't log in).
  const [goal] = await Promise.all([getActiveGoal(user.id), syncBillingNotices(user.id).catch(() => 0)]);
  const examFamily = goal ? examFamilyForCode(goal.examType.code) : null;

  return <DashboardShell role={user.role} examFamily={examFamily}>{children}</DashboardShell>;
}
