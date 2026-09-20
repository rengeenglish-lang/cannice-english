import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { DashboardShell } from "@/components/admin/AdminShell";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  const goal = await getActiveGoal(user.id);
  const examFamily = goal ? examFamilyForCode(goal.examType.code) : null;

  return <DashboardShell role={user.role} examFamily={examFamily}>{children}</DashboardShell>;
}
