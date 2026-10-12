import { NextResponse } from "next/server";
import { getAuthContext } from "@/server/auth/context";
import { lessonVideoPlaybackUrl } from "@/server/services/lesson-video.service";

/**
 * Plays a lesson video stored in R2: checks the viewer may watch it, then redirects the <video>
 * element to a 4-hour signed URL so the stream comes straight from Cloudflare.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (kind !== "konu" && kind !== "ders") return new NextResponse("Not found", { status: 404 });
  const user = await getAuthContext();
  const url = await lessonVideoPlaybackUrl(kind, id, user ? { id: user.id, role: user.role } : null).catch(() => null);
  if (!url) return new NextResponse("Forbidden", { status: user ? 403 : 401 });
  return NextResponse.redirect(url, { status: 302, headers: { "cache-control": "private, no-store" } });
}
