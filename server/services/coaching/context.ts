import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { coachingCopy } from "@/lib/coaching/i18n";
import { pathwayConfig } from "@/lib/coaching/exams";
import { refreshCoaching } from "@/server/services/coaching/coaching.service";
import { todayKeyFor } from "@/server/services/coaching/plan.service";

/**
 * One refresh per request, shared by the coaching layout and page (React `cache`). Every coaching
 * page reads the signed-in student's own records only — there is no way to view another student.
 */
export const loadCoaching = cache(async () => {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in?next=%2Fdashboard%2Fkocluk");
  const profile = await refreshCoaching(user);
  const t = coachingCopy(profile?.locale);
  return { user, profile, t, todayKey: profile ? todayKeyFor(profile) : null, config: profile ? pathwayConfig(profile.pathway) : null };
});

/** For pages that need an active profile: sends new students to onboarding. */
export async function requireCoaching() {
  const ctx = await loadCoaching();
  if (!ctx.profile || !ctx.config || !ctx.todayKey) redirect("/dashboard/kocluk/baslangic");
  if (!ctx.profile.enabled) redirect("/dashboard/kocluk");
  return { ...ctx, profile: ctx.profile, config: ctx.config, todayKey: ctx.todayKey };
}
