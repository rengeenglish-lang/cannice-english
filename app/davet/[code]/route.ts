import { cookies } from "next/headers";
import { getSiteUrl } from "@/server/env";
import { isReferralCode, REFERRAL_COOKIE } from "@/server/services/referrals.service";

/**
 * The invite link students share (netfener.com/davet/CODE). Remembers the code for 30 days, so it
 * still counts if the friend browses first or signs up with Google, then opens the sign-up page.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const site = getSiteUrl().replace(/\/$/, "");
  if (!isReferralCode(code)) return Response.redirect(`${site}/register`, 303);
  (await cookies()).set(REFERRAL_COOKIE, code, { httpOnly: true, sameSite: "lax", secure: site.startsWith("https://"), maxAge: 60 * 60 * 24 * 30, path: "/" });
  return Response.redirect(`${site}/register?ref=${code}`, 303);
}
