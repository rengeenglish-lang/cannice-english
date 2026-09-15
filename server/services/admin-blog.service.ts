import "server-only";
import { db } from "@/server/db";
import { blogPostSchema, blogCategorySchema } from "@/lib/validation/admin";
import type { z } from "zod";

export function listBlogPostsForAdmin() {
  return db.blogPost.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
}

export function getBlogPost(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

export function listBlogCategories() {
  return db.blogCategory.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function createBlogCategory(raw: Record<string, unknown>) {
  const input = blogCategorySchema.parse(raw);
  return db.blogCategory.create({ data: input });
}

function toData(input: z.infer<typeof blogPostSchema>) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    coverImageUrl: input.coverImageUrl || null,
    categoryId: input.categoryId || null,
    tags: input.tags ? input.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    status: input.status,
    publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };
}

export async function createBlogPost(authorId: string, raw: Record<string, unknown>) {
  const input = blogPostSchema.parse(raw);
  return db.blogPost.create({ data: { ...toData(input), authorId } });
}

export async function updateBlogPost(id: string, raw: Record<string, unknown>) {
  const input = blogPostSchema.parse(raw);
  const existing = await db.blogPost.findUniqueOrThrow({ where: { id } });
  const data = toData(input);
  return db.blogPost.update({
    where: { id },
    data: { ...data, publishedAt: input.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null },
  });
}

export async function deleteBlogPost(id: string) {
  return db.blogPost.delete({ where: { id } });
}
