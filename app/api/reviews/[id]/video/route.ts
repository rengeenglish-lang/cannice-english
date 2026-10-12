import { NextResponse } from "next/server";
import { getAuthContext } from "@/server/auth/context";
import { siteReviewVideoUrl } from "@/server/services/site-reviews.service";

/**
 * Plays an uploaded review video: redirects the <video> element to a short-lived signed R2 URL, so
 * the bytes stream from Cloudflare (free bandwidth) and unapproved videos stay private.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthContext();
  const url = await siteReviewVideoUrl(id, user ? { id: user.id, role: user.role } : null).catch(() => null);
  if (!url) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { "cache-control": "private, no-store" } });
}
