import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAuthContext } from "@/server/auth/context";
import { canDownloadEbookPdf, claimEbookDownload, hasPurchasedEbook, hasVerifiedEbookAccount } from "@/server/services/ebooks.service";
import { isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { getSiteUrl } from "@/server/env";
import { EBOOK_REVIEW_UNLOCK_MESSAGE } from "@/lib/ebook-review-reward";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
type Context = { params: Promise<{ slug: string }> };

/** Explicit download intent reserves one first book; ordinary GETs/prefetches never consume it. */
export async function POST(request: Request, { params }: Context) {
  if (![new URL(request.url).origin, new URL(getSiteUrl()).origin].includes(request.headers.get("origin") ?? "")) return Response.json({ error: "Geçersiz istek." }, { status: 403, headers: privateHeaders });
  const { slug } = await params;
  if (!findNetfenerEbook(slug)) return Response.json({ error: "Kitap bulunamadı." }, { status: 404, headers: privateHeaders });
  const user = await getAuthContext();
  if (!user) return Response.json({ error: "Devam etmek için giriş yap.", code: "SIGN_IN" }, { status: 401, headers: privateHeaders });
  const paid = await hasPurchasedEbook(user.id, slug);
  if (!paid && isEbookFreePromoActive() && !await hasVerifiedEbookAccount(user.id)) return Response.json({ error: "Kitabını açmak için e-postandaki doğrulama bağlantısına tıkla.", code: "VERIFY_EMAIL" }, { status: 403, headers: privateHeaders });
  if (!await claimEbookDownload(user.id, slug)) {
    return Response.json({ error: isEbookFreePromoActive() ? EBOOK_REVIEW_UNLOCK_MESSAGE : "Kampanya sona erdi. Bu PDF için satın alma gerekiyor.", code: isEbookFreePromoActive() ? "REVIEW_REQUIRED" : "PURCHASE_REQUIRED" }, { status: 403, headers: privateHeaders });
  }
  return Response.json({ downloadUrl: `/api/ebooks/${slug}` }, { headers: privateHeaders });
}

export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params;
  const book = findNetfenerEbook(slug);
  if (!book) return Response.json({ error: "Kitap bulunamadı." }, { status: 404, headers: privateHeaders });
  const user = await getAuthContext();
  if (!user) return Response.json({ error: "Kitabını açmak için giriş yap." }, { status: 401, headers: privateHeaders });
  if (!await canDownloadEbookPdf(user.id, book.slug)) return Response.json({ error: isEbookFreePromoActive() ? "PDF indirme işlemini Kitaplarım alanından başlat. İlk kitabından sonra diğer PDF’ler için yorumunu paylaş." : "Bu PDF için tamamlanmış satın alma gerekiyor.", href: `/dashboard/books?book=${book.slug}` }, { status: 403, headers: privateHeaders });
  // Only catalogue filenames reach the filesystem, after the access check.
  const data = await readFile(path.join(process.cwd(), "content", "ebooks", book.filename));
  return new Response(new Uint8Array(data), { headers: { ...privateHeaders, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${book.filename}"`, "Content-Length": String(data.byteLength) } });
}
