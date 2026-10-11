import { db } from "@/server/db";
import { verifyCartUnsubscribeToken } from "@/lib/auth/tokens";
import { getSiteUrl } from "@/server/env";

/** Abandoned-cart reminder opt-out: GET from the email link, POST for RFC 8058 one-click. */
async function optOut(token: string | null) {
  const secret = process.env.AUTH_SECRET;
  const userId = token && secret ? verifyCartUnsubscribeToken(token, secret) : null;
  if (!userId) return false;
  await db.user.updateMany({ where: { id: userId }, data: { cartReminderOptOut: true } });
  return true;
}

export async function GET(request: Request) {
  const ok = await optOut(new URL(request.url).searchParams.get("t"));
  return Response.redirect(`${getSiteUrl().replace(/\/$/, "")}/e-posta-iptal?tur=sepet&durum=${ok ? "tamam" : "gecersiz"}`, 303);
}

export async function POST(request: Request) {
  const ok = await optOut(new URL(request.url).searchParams.get("t"));
  return new Response(ok ? "OK" : "Invalid link", { status: ok ? 200 : 400 });
}
