import "server-only";
import { db } from "@/server/db";

export function listExamTypes() {
  return db.examType.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } });
}

export function getExamTypeBySlug(slug: string) {
  return db.examType.findUnique({ where: { slug } });
}

export function listProducts(params: { category?: "PREP_GROUP" | "MOCK_CAMP" | "STUDY_PACKAGE" | "TRANSLATION_SUPPORT" | "BOOK"; examTypeId?: string; featuredOnly?: boolean } = {}) {
  return db.product.findMany({
    where: {
      isPublished: true,
      ...(params.category ? { category: params.category } : {}),
      ...(params.examTypeId ? { examTypeId: params.examTypeId } : {}),
      ...(params.featuredOnly ? { isFeatured: true } : {}),
    },
    include: { examType: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
}

export function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      examType: true,
      course: {
        include: {
          modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" } } } },
          liveSessions: { orderBy: { startsAt: "asc" } },
        },
      },
      book: true,
    },
  });
}

export function listTestimonials(featuredOnly = false) {
  return db.testimonial.findMany({
    where: { isPublished: true, ...(featuredOnly ? { isFeatured: true } : {}) },
    include: { examType: true },
    orderBy: { displayOrder: "asc" },
    take: featuredOnly ? 6 : undefined,
  });
}

export function listPublishedBlogPosts(take = 3) {
  return db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    include: { category: true, author: true },
  });
}

export function getBlogPostBySlug(slug: string) {
  return db.blogPost.findUnique({ where: { slug }, include: { category: true, author: true } });
}
