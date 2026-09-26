import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAuthContext } from "@/server/auth/context";
import { hasPurchasedEbook } from "@/server/services/ebooks.service";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = findNetfenerEbook(slug);
  if (!book) return Response.json({ error: "Kitap bulunamadı." }, { status: 404, headers: privateHeaders });
  const user = await getAuthContext();
  if (!user) return Response.json({ error: "Kitabı indirmek için giriş yapın." }, { status: 401, headers: privateHeaders });
  if (!await hasPurchasedEbook(user.id, book.slug)) {
    return Response.json({ error: "Bu kitabı indirmek için satın almanız ve ödemenizin tamamlanmış olması gerekir." }, { status: 403, headers: privateHeaders });
  }
  // Only filenames in the catalogue can be read; user input never becomes a filesystem path.
  const data = await readFile(path.join(process.cwd(), "content", "ebooks", book.filename));
  return new Response(new Uint8Array(data), {
    headers: {
      ...privateHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${book.filename}"`,
      "Content-Length": String(data.byteLength),
    },
  });
}
