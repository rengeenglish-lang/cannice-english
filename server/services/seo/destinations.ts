import "server-only";
import { db, type TransactionClient } from "@/server/db";
import { SEO_ROUTES } from "@/lib/seo/routes";
/** Database/route validation, never an HTTP fetch of editor-supplied URLs. */
export async function resolveDestination(id: string, tx: TransactionClient = db) {
  const item = await tx.seoContentItem.findUnique({ where: { id } });
  if (!item?.available) return null;
  let url: string | undefined;
  let title: string | undefined;
  if (item.sourceType === "BLOG") {
    const row = await tx.blogPost.findUnique({ where: { id: item.sourceId } });
    if (row?.status === "PUBLISHED") { url = `/blog/${encodeURIComponent(row.slug)}`; title = row.title; }
  } else if (item.sourceType === "EXAM") {
    const row = await tx.examType.findUnique({ where: { id: item.sourceId } });
    if (row?.active) { url = `/exams/${encodeURIComponent(row.slug)}`; title = row.name; }
  } else if (item.sourceType === "TOPIC") {
    const row = await tx.examTopic.findUnique({ where: { id: item.sourceId }, include: { examType: true } });
    if (row?.examType.active) { url = `/konu-anlatim?exam=${encodeURIComponent(row.examType.slug)}&topic=${encodeURIComponent(row.slug)}`; title = row.name; }
  } else if (item.sourceType === "PRODUCT") {
    const row = await tx.product.findUnique({ where: { id: item.sourceId } });
    if (row?.isPublished && row.category !== "PLAN") { url = `/${row.category === "BOOK" ? "books" : "packages"}/${encodeURIComponent(row.slug)}`; title = row.title; }
  } else if (item.sourceType === "ROUTE") {
    const row = SEO_ROUTES.find(r => r[0] === item.sourceId);
    if (row) { url = row[0]; title = row[1]; }
  }
  // Renamed destinations require a fresh inventory and deliberate reapproval.
  if (!url || url !== item.url || !title) return null;
  return { id, url, title, access: item.access, sourceType: item.sourceType, sourceId: item.sourceId };
}
