import "server-only";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import type { Prisma } from "@/lib/generated/prisma/client";
import { contentHash, extractInternalLinks } from "@/lib/seo/inventory";
import { SEO_ROUTES } from "@/lib/seo/routes";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";

export const INVENTORY_LIMIT = 2000;
/** Bounded synchronous database-only refresh. Future crawling/generation must use durable jobs.
 * Fail instead of silently truncating; the previous complete snapshot survives any error.
 */
export async function refreshSeoInventory(actorId: string) {
  await requireSeoAdmin(actorId);
  return db.$transaction(
    async (tx) => {
      await requireSeoAdmin(actorId, tx);
      await lockSeoWrites(tx);
      await checkSeoRateLimit(tx, actorId, "INVENTORY_REFRESHED");
      const [posts, exams, products, topics] = await Promise.all([
        tx.blogPost.findMany({
          take: INVENTORY_LIMIT + 1,
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            content: true,
            status: true,
            seoTitle: true,
            seoDescription: true,
            publishedAt: true,
            updatedAt: true,
            category: { select: { name: true } },
          },
        }),
        tx.examType.findMany({
          where: { active: true },
          take: INVENTORY_LIMIT + 1,
          select: {
            id: true,
            slug: true,
            name: true,
            shortDescription: true,
            updatedAt: true,
          },
        }),
        tx.product.findMany({
          where: { isPublished: true, category: { not: "PLAN" } },
          take: INVENTORY_LIMIT + 1,
          select: {
            id: true,
            slug: true,
            title: true,
            shortDescription: true,
            description: true,
            category: true,
            updatedAt: true,
            examType: { select: { slug: true } },
          },
        }),
        tx.examTopic.findMany({
          where: { examType: { active: true } },
          take: INVENTORY_LIMIT + 1,
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            updatedAt: true,
            examType: { select: { slug: true } },
          },
        }),
      ]);
      if (
        posts.length +
          exams.length +
          products.length +
          topics.length +
          SEO_ROUTES.length >
        INVENTORY_LIMIT
      ) {
        throw new Error(
          "Envanter 2.000 kayıt sınırını aşıyor. Önce arka plan toplu tarama desteği eklenmeli; mevcut envanter korunuyor.",
        );
      }
      const scannedAt = new Date();
      const origin = getSiteUrl();
      const items: Prisma.SeoContentItemCreateManyInput[] = [];
      function add(
        input: Omit<
          Prisma.SeoContentItemCreateManyInput,
          "contentHash" | "internalLinks" | "scannedAt"
        >,
        body = "",
      ) {
        items.push({
          ...input,
          scannedAt,
          contentHash: contentHash({ ...input, body }),
          internalLinks: extractInternalLinks(body, origin),
          available: true,
        });
      }
      for (const [url, title, access] of SEO_ROUTES)
        add({
          sourceKey: `ROUTE:${url}`,
          sourceType: "ROUTE",
          sourceId: url,
          url,
          title,
          access,
          publication: "LIVE",
        });
      for (const post of posts)
        add(
          {
            sourceKey: `BLOG:${post.id}`,
            sourceType: "BLOG",
            sourceId: post.id,
            url: `/blog/${encodeURIComponent(post.slug)}`,
            title: post.title,
            excerpt: post.excerpt,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            access: "PUBLIC",
            publication: post.status,
            publishedAt: post.publishedAt,
            sourceUpdatedAt: post.updatedAt,
            topic: post.category?.name,
          },
          post.content,
        );
      for (const exam of exams)
        add(
          {
            sourceKey: `EXAM:${exam.id}`,
            sourceType: "EXAM",
            sourceId: exam.id,
            url: `/exams/${encodeURIComponent(exam.slug)}`,
            title: exam.name,
            excerpt: exam.shortDescription,
            examSlug: exam.slug,
            access: "PUBLIC",
            publication: "LIVE",
            sourceUpdatedAt: exam.updatedAt,
          },
          exam.shortDescription ?? "",
        );
      for (const product of products)
        add(
          {
            sourceKey: `PRODUCT:${product.id}`,
            sourceType: "PRODUCT",
            sourceId: product.id,
            url: `/${product.category === "BOOK" ? "books" : "packages"}/${encodeURIComponent(product.slug)}`,
            title: product.title,
            excerpt: product.shortDescription,
            examSlug: product.examType?.slug,
            access: "PRODUCT",
            publication: "PUBLISHED",
            sourceUpdatedAt: product.updatedAt,
          },
          product.description ?? "",
        );
      for (const topic of topics)
        add(
          {
            sourceKey: `TOPIC:${topic.id}`,
            sourceType: "TOPIC",
            sourceId: topic.id,
            url: `/konu-anlatim?exam=${encodeURIComponent(topic.examType.slug)}&topic=${encodeURIComponent(topic.slug)}`,
            title: topic.name,
            excerpt: topic.description,
            examSlug: topic.examType.slug,
            topic: topic.name,
            access: "PREVIEW_OR_PLAN",
            publication: "LIVE",
            sourceUpdatedAt: topic.updatedAt,
          },
          topic.description ?? "",
        );
      // Preserve stable IDs for future relationships. Removed sources remain auditable but unavailable.
      await tx.seoContentItem.updateMany({
        where: { available: true },
        data: { available: false },
      });
      for (const item of items) {
        await tx.seoContentItem.upsert({
          where: { sourceKey: item.sourceKey },
          create: item,
          update: item,
        });
      }
      await tx.seoActivityLog.create({
        data: {
          actorId,
          action: "INVENTORY_REFRESHED",
          details: {
            count: items.length,
            sources: {
              blogs: posts.length,
              exams: exams.length,
              products: products.length,
              topics: topics.length,
              routes: SEO_ROUTES.length,
            },
            scope:
              "Database metadata and curated routes; not Google index coverage or a full site crawl",
          },
        },
      });
      return { count: items.length, scannedAt };
    },
    { timeout: 30000 },
  );
}
