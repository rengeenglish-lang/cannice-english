import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { db } from "@/server/db";

export default async function SeviyeTespitHubPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const goal = await getActiveGoal(user.id);
  if (!goal) redirect("/seviye-tespit/hedef");

  const inProgress = await db.diagnosticAttempt.findFirst({
    where: { userId: user.id, goalId: goal.id, kind: "FULL_DIAGNOSTIC", status: "IN_PROGRESS" },
  });
  if (inProgress) redirect(`/seviye-tespit/sinav/${inProgress.id}`);

  const completed = await db.diagnosticAttempt.findFirst({
    where: { userId: user.id, goalId: goal.id, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
  });
  if (completed) redirect("/dashboard/plan");

  redirect("/seviye-tespit/basla");
}
