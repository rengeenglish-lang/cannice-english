import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getAuthContext } from "@/server/auth/context";
import { driveAuthUrl, driveClientConfigured } from "@/server/google/drive";
import { getSiteUrl } from "@/server/env";

const STATE_COOKIE = "nf_drive_state";

/** Admin only: sends the admin to Google to let the site save invoices in their Drive. */
export async function GET() {
  const user = await getAuthContext();
  const site = getSiteUrl().replace(/\/$/, "");
  if (user?.role !== "ADMIN") return Response.redirect(`${site}/sign-in`, 303);
  if (!driveClientConfigured()) return Response.redirect(`${site}/admin/faturalar?drive=ayar-eksik`, 303);
  const state = randomBytes(24).toString("base64url");
  (await cookies()).set(STATE_COOKIE, state, { httpOnly: true, secure: site.startsWith("https://"), sameSite: "lax", maxAge: 600, path: "/api/admin/google-drive" });
  return Response.redirect(driveAuthUrl(state), 303);
}
