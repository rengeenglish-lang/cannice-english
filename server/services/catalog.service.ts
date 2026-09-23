import "server-only";
import { db } from "@/server/db";

export function listExamTypes() {
  return db.examType.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });
}

export function getExamTypeBySlug(slug: string) {
  return db.examType.findUnique({ where: { slug } });
}

export function listProducts(
  params: {
    category?:
      | "PREP_GROUP"
      | "MOCK_CAMP"
      | "STUDY_PACKAGE"
      | "TRANSLATION_SUPPORT"
      | "BOOK";
    examTypeId?: string;
    featuredOnly?: boolean;
  } = {},
) {
  return db.product.findMany({
    where: {
      isPublished: true,
      // Plans are sold from /planlar and the Deneme Sınavı page, not the package catalogue.
      ...(params.category ? { category: params.category } : { category: { not: "PLAN" } }),
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
          modules: {
            orderBy: { position: "asc" },
            include: { lessons: { orderBy: { position: "asc" } } },
          },
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
  return db.blogPost.findUnique({
    where: { slug },
    include: { category: true, author: true },
  });
}

const homepageProductInclude = {
  examType: true,
  book: { select: { format: true, pageCount: true } },
  course: { select: { deliveryFormat: true } },
} as const;

/** Individual resources have their own shelf, separate from live groups. */
export function listHomepageProducts() {
  return db.product.findMany({
    where: { isPublished: true, category: { in: ["STUDY_PACKAGE", "BOOK"] } },
    include: homepageProductInclude,
    orderBy: [
      { isFeatured: "desc" },
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
    take: 3,
  });
}

export function listHomepageGroups() {
  return db.product.findMany({
    where: {
      isPublished: true,
      category: { in: ["PREP_GROUP", "MOCK_CAMP"] },
      course: { is: { deliveryFormat: { in: ["LIVE_ONLY", "HYBRID"] } } },
    },
    include: homepageProductInclude,
    orderBy: [
      { isFeatured: "desc" },
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
    take: 3,
  });
}
