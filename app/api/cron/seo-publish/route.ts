import { revalidatePath } from "next/cache";
import { runDueSeoPublications } from "@/server/services/seo/publishing.service";

export const maxDuration = 60;

/**
 * Daily Vercel Cron (see vercel.json): publishes SEO articles that an administrator approved and
 * scheduled for a past time. It never creates, approves or schedules content. Same
 * `Authorization: Bearer $CRON_SECRET` guard as the other cron routes.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await runDueSeoPublications();
  if (result.published.length) {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    for (const slug of result.published) revalidatePath(`/blog/${slug}`);
  }
  return Response.json(result);
}
