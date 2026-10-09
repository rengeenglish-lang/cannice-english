import { db } from "@/server/db";
import { renderCover } from "@/server/seo/cover";

/** Generated on demand and cached by the CDN, so no image storage is needed. Only published articles have a cover. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug }, select: { id: true, title: true, status: true, category: { select: { name: true } } } });
  if (!post || post.status !== "PUBLISHED") return new Response("Not found", { status: 404 });
  const draft = await db.seoArticleDraft.findUnique({ where: { postId: post.id }, select: { keyword: { select: { exam: { select: { name: true } } } } } });
  const png = await renderCover({ title: post.title, label: (draft?.keyword.exam?.name ?? post.category?.name ?? "Netfener").toUpperCase() });
  return new Response(new Uint8Array(png), {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
