import { planRecurringJobs, runDueJobs } from "@/server/services/seo/jobs.service";

export const maxDuration = 60;

/**
 * Vercel Cron (every 3 hours) (see vercel.json): plans the recurring read-only data jobs (when automatic
 * sync is enabled) and runs due jobs. It never creates, approves or publishes content, and does
 * nothing while the emergency stop is active. Same `Authorization: Bearer $CRON_SECRET` guard as
 * the other crons.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const plan = await planRecurringJobs();
  const run = await runDueJobs();
  return Response.json({ plan, run });
}
