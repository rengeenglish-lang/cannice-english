import { getAuthContext } from "@/server/auth/context";
import { hasEbookAccess } from "@/server/services/ebooks.service";
import { renderEbookPage } from "@/server/services/ebook-pages.service";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

/** One rendered page for the online reader. Entitlement is checked before anything is rendered. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  const book = findNetfenerEbook(slug);
  if (!book) return Response.json({ error: "Kitap bulunamadı." }, { status: 404, headers: privateHeaders });

  const user = await getAuthContext();
  if (!user) return Response.json({ error: "Okumak için giriş yapın." }, { status: 401, headers: privateHeaders });
  if (!await hasEbookAccess(user.id, book.slug, "online")) {
    return Response.json({ error: "Bu kitabı okumak için satın almanız gerekir." }, { status: 403, headers: privateHeaders });
  }

  const pageNumber = Number(page);
  let image: Uint8Array;
  try {
    image = await renderEbookPage(book.slug, pageNumber);
  } catch {
    return Response.json({ error: "Sayfa bulunamadı." }, { status: 404, headers: privateHeaders });
  }

  return new Response(image as unknown as BodyInit, {
    headers: {
      ...privateHeaders,
      // The buyer's own browser may keep pages it has already turned to; caches in between may not.
      "Cache-Control": "private, max-age=3600",
      "Content-Type": "image/jpeg",
      "Content-Length": String(image.byteLength),
    },
  });
}
