import { getSiteUrl } from "@/server/env";
import { verifyEmailToken } from "@/server/services/account-email.service";

/** The link in the welcome / verification email. */
export async function GET(request: Request) {
  const ok = await verifyEmailToken(new URL(request.url).searchParams.get("t"));
  return Response.redirect(`${getSiteUrl().replace(/\/$/, "")}/e-posta-dogrulama?durum=${ok ? "tamam" : "gecersiz"}`, 303);
}
