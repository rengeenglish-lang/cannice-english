import { runCoachingCron } from "@/server/services/coaching/coaching.service";

export const maxDuration = 60;

/**
 * Daily Vercel Cron (see vercel.json, 06:30 UTC = 09:30 Istanbul, after default quiet hours):
 * refreshes every enabled coaching profile — plan, task completion, reports — and delivers due
 * follow-ups for students who haven't opened the site. Page visits run the same refresh, so this
 * only has to catch students who stay away. Same `Authorization: Bearer $CRON_SECRET` guard as
 * the billing cron.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await runCoachingCron());
}
