import "server-only";
import { db } from "@/server/db";
import { blogPostSchema, blogCategorySchema } from "@/lib/validation/admin";
import type { z } from "zod";

export function listBlogPostsForAdmin() {
  return db.blogPost.findMany({ where: { seoDraft: { is: null } }, include: { category: true }, orderBy: { createdAt: "desc" } });
}

export function getBlogPost(id: string) {
  return db.blogPost.findFirst({ where: { id, seoDraft: { is: null } } });
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
  await guardSeoDraft(id);
  const input = blogPostSchema.parse(raw);
  const existing = await db.blogPost.findUniqueOrThrow({ where: { id } });
  const data = toData(input);
  return db.blogPost.update({
    where: { id },
    data: { ...data, publishedAt: input.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null },
  });
}

export async function deleteBlogPost(id: string) {
  await guardSeoDraft(id);
  return db.blogPost.delete({ where: { id } });
}

// SEO-managed drafts remain in BlogPost but cannot bypass the studio through
// the legacy staff editor. Existing ordinary blog behavior is unchanged.
async function guardSeoDraft(postId: string) {
  if (await db.seoArticleDraft.findUnique({where:{postId},select:{id:true}}))
    throw new Error("SEO taslakları Makale stüdyosundan yönetilir; bu editörden yayınlanamaz veya silinemez.");
}
