import { after } from "next/server";
import { cookies } from "next/headers";
import { getAuthContext } from "@/server/auth/context";
import { completeDriveConnection } from "@/server/google/drive";
import { syncDirtyInvoices } from "@/server/services/invoices.service";
import { getSiteUrl } from "@/server/env";

/** Google sends the admin back here after consent. */
export async function GET(request: Request) {
  const site = getSiteUrl().replace(/\/$/, "");
  const user = await getAuthContext();
  if (user?.role !== "ADMIN") return Response.redirect(`${site}/sign-in`, 303);
  const url = new URL(request.url);
  const jar = await cookies();
  const expected = jar.get("nf_drive_state")?.value;
  jar.delete({ name: "nf_drive_state", path: "/api/admin/google-drive" });
  const code = url.searchParams.get("code");
  if (!code || !expected || url.searchParams.get("state") !== expected) return Response.redirect(`${site}/admin/faturalar?drive=hata`, 303);
  try {
    await completeDriveConnection(code);
  } catch (error) {
    console.error("[drive] connect failed", error instanceof Error ? error.message : error);
    return Response.redirect(`${site}/admin/faturalar?drive=hata`, 303);
  }
  // Archive what's waiting without holding up the redirect.
  after(() => syncDirtyInvoices(50).catch(() => 0));
  return Response.redirect(`${site}/admin/faturalar?drive=bagli`, 303);
}
