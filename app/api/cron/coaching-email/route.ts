import { runCoachingEmailCron } from "@/server/services/coaching/coaching.service";

export const maxDuration = 60;

/**
 * Hourly Vercel Cron (see vercel.json): coaching emails for students who turned them on, so the
 * study-time reminder lands near each student's own reminder time. Same `Authorization: Bearer
 * $CRON_SECRET` guard as the other crons; does nothing until RESEND_API_KEY and EMAIL_FROM are set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await runCoachingEmailCron());
}
