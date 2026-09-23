import { syncBillingNotices } from "@/server/services/billing.service";

/**
 * Daily Vercel Cron (see vercel.json): sends due group-lesson payment notices to every student,
 * including those who haven't opened the dashboard. Vercel signs cron requests with
 * `Authorization: Bearer $CRON_SECRET`; without CRON_SECRET configured the route stays closed.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const processed = await syncBillingNotices();
  return Response.json({ processed });
}
