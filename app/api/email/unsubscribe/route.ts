import { db } from "@/server/db";
import { verifyUnsubscribeToken } from "@/lib/coaching/email";
import { getSiteUrl } from "@/server/env";

/**
 * Coaching email unsubscribe. GET is the link in every email (turns email off, then shows a
 * confirmation page); POST is RFC 8058 one-click unsubscribe sent by mail clients. Both only ever
 * turn notifyEmail off, so a forwarded link can't do anything worse than that.
 */
async function unsubscribe(token: string | null) {
  const secret = process.env.AUTH_SECRET;
  const userId = token && secret ? verifyUnsubscribeToken(token, secret) : null;
  if (!userId) return false;
  await db.coachingProfile.updateMany({ where: { userId }, data: { notifyEmail: false } });
  return true;
}

export async function GET(request: Request) {
  const ok = await unsubscribe(new URL(request.url).searchParams.get("t"));
  return Response.redirect(`${getSiteUrl().replace(/\/$/, "")}/e-posta-iptal?durum=${ok ? "tamam" : "gecersiz"}`, 303);
}

export async function POST(request: Request) {
  const ok = await unsubscribe(new URL(request.url).searchParams.get("t"));
  return new Response(ok ? "OK" : "Invalid link", { status: ok ? 200 : 400 });
}
