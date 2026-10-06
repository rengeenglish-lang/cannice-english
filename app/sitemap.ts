import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [examTypes, products, blogPosts] = await Promise.all([
    db.examType.findMany({ where: { active: true }, select: { slug: true } }),
    db.product.findMany({ where: { isPublished: true, category: { not: "PLAN" } }, select: { slug: true, category: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, publishedAt: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/` },
    { url: `${base}/exams` },
    { url: `${base}/packages` },
    { url: `${base}/books` },
    { url: `${base}/blog` },
    { url: `${base}/tools` },
    { url: `${base}/group-lessons` },
    { url: `${base}/konu-anlatim` },
    { url: `${base}/about` },
    { url: `${base}/yardim` },
    { url: `${base}/planlar` },
    { url: `${base}/kocluk` },
    { url: `${base}/legal/iade-politikasi` },
    { url: `${base}/legal/kullanim-kosullari` },
    { url: `${base}/grammar` },
    { url: `${base}/campaigns` },
    { url: `${base}/kaynaklar` },
  ];

  const examRoutes: MetadataRoute.Sitemap = examTypes.map((exam) => ({ url: `${base}/exams/${exam.slug}` }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}${product.category === "BOOK" ? "/books/" : "/packages/"}${product.slug}`,
    lastModified: product.updatedAt,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
  }));

  return [...staticRoutes, ...examRoutes, ...productRoutes, ...blogRoutes];
}
