import { z } from "zod";
import { looksLikeBot } from "@/lib/seo/attribution";
import { recordArticleView } from "@/server/services/seo/conversions.service";

const bodySchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{3,160}$/), ref: z.string().max(2000).optional() }).strict();

/**
 * Aggregate, cookie-free article view counter. Honors Do Not Track / Global Privacy Control,
 * ignores bots, and stores only a per-article per-day count split by search-engine referrer.
 */
export async function POST(request: Request) {
  const h = request.headers;
  if (h.get("sec-gpc") === "1" || h.get("dnt") === "1" || looksLikeBot(h.get("user-agent")))
    return new Response(null, { status: 204 });
  const length = Number(h.get("content-length") ?? 0);
  if (length > 4000) return new Response(null, { status: 413 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  await recordArticleView(parsed.data.slug, parsed.data.ref).catch(() => undefined);
  return new Response(null, { status: 204 });
}
