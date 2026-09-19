import "server-only";
import { db } from "@/server/db";
import { productSchema, moduleSchema, lessonSchema, liveSessionSchema } from "@/lib/validation/admin";
import type { z } from "zod";

const COURSE_CATEGORIES = ["PREP_GROUP", "MOCK_CAMP", "STUDY_PACKAGE", "TRANSLATION_SUPPORT"] as const;

export function listProductsForAdmin() {
  return db.product.findMany({ include: { examType: true }, orderBy: { displayOrder: "asc" } });
}

export function getProductForEdit(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      book: true,
      course: {
        include: {
          modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" } } } },
          liveSessions: { orderBy: { startsAt: "asc" } },
        },
      },
    },
  });
}

function productData(input: z.infer<typeof productSchema>) {
  return {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle || null,
    category: input.category,
    examTypeId: input.examTypeId || null,
    level: input.level || null,
    posterImageUrl: input.posterImageUrl || null,
    badgeLabel: input.badgeLabel || null,
    basePrice: input.basePrice,
    salePrice: input.salePrice,
    isPublished: input.isPublished,
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
    shortDescription: input.shortDescription || null,
    description: input.description || null,
  };
}

export async function createProduct(raw: Record<string, unknown>) {
  const input = productSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const product = await tx.product.create({ data: productData(input) });

    if (input.category === "BOOK") {
      await tx.book.create({
        data: {
          productId: product.id,
          author: input.author || "Cannice Hoca",
          format: (input.format as "PDF" | "PRINT" | "PRINT_AND_PDF") || "PDF",
          pageCount: input.pageCount ? Number(input.pageCount) : null,
          isbn: input.isbn || null,
          digitalFileUrl: input.digitalFileUrl || null,
        },
      });
    } else if ((COURSE_CATEGORIES as readonly string[]).includes(input.category)) {
      await tx.course.create({
        data: {
          productId: product.id,
          deliveryFormat: (input.deliveryFormat as "HYBRID" | "RECORDED_ONLY" | "LIVE_ONLY") || "HYBRID",
          syllabusSummary: input.syllabusSummary || null,
        },
      });
    }

    return product;
  });
}

export async function updateProduct(id: string, raw: Record<string, unknown>) {
  const input = productSchema.parse(raw);
  const course = await db.course.findUnique({ where: { productId: id } });
  if (course?.curriculumKey) throw new Error("Yapılandırılmış program için müfredat yönetimini kullanın.");
  return db.$transaction(async (tx) => {
    const product = await tx.product.update({ where: { id }, data: productData(input) });

    if (input.category === "BOOK") {
      await tx.book.upsert({
        where: { productId: id },
        update: {
          author: input.author || "Cannice Hoca",
          format: (input.format as "PDF" | "PRINT" | "PRINT_AND_PDF") || "PDF",
          pageCount: input.pageCount ? Number(input.pageCount) : null,
          isbn: input.isbn || null,
          digitalFileUrl: input.digitalFileUrl || null,
        },
        create: {
          productId: id,
          author: input.author || "Cannice Hoca",
          format: (input.format as "PDF" | "PRINT" | "PRINT_AND_PDF") || "PDF",
          pageCount: input.pageCount ? Number(input.pageCount) : null,
          isbn: input.isbn || null,
          digitalFileUrl: input.digitalFileUrl || null,
        },
      });
    } else if ((COURSE_CATEGORIES as readonly string[]).includes(input.category)) {
      await tx.course.upsert({
        where: { productId: id },
        update: {
          deliveryFormat: (input.deliveryFormat as "HYBRID" | "RECORDED_ONLY" | "LIVE_ONLY") || "HYBRID",
          syllabusSummary: input.syllabusSummary || null,
        },
        create: {
          productId: id,
          deliveryFormat: (input.deliveryFormat as "HYBRID" | "RECORDED_ONLY" | "LIVE_ONLY") || "HYBRID",
          syllabusSummary: input.syllabusSummary || null,
        },
      });
    }

    return product;
  });
}

export async function togglePublish(id: string) {
  const course = await db.course.findUnique({ where: { productId: id } });
  if (course?.curriculumKey) throw new Error("Program satışı kohort ve ödeme entegrasyonu tamamlanmadan açılamaz.");
  const product = await db.product.findUniqueOrThrow({ where: { id } });
  return db.product.update({ where: { id }, data: { isPublished: !product.isPublished } });
}

// ---- Course content management ----
async function requireLegacyCourse(courseId: string) {
  const course = await db.course.findUniqueOrThrow({ where: { id: courseId } });
  if (course.curriculumKey) throw new Error("Resmi müfredatı değiştirmek için yetkili müfredat yönetimini kullanın.");
}


export async function addModule(courseId: string, raw: Record<string, unknown>) {
  await requireLegacyCourse(courseId);
  const input = moduleSchema.parse(raw);
  const last = await db.courseModule.findFirst({ where: { courseId }, orderBy: { position: "desc" } });
  return db.courseModule.create({ data: { courseId, title: input.title, position: (last?.position ?? 0) + 1 } });
}

export async function deleteModule(moduleId: string) {
  const courseModule = await db.courseModule.findUniqueOrThrow({ where: { id: moduleId } });
  await requireLegacyCourse(courseModule.courseId);
  return db.courseModule.delete({ where: { id: moduleId } });
}

export async function addLesson(moduleId: string, raw: Record<string, unknown>) {
  const courseModule = await db.courseModule.findUniqueOrThrow({ where: { id: moduleId } });
  await requireLegacyCourse(courseModule.courseId);
  const input = lessonSchema.parse(raw);
  const last = await db.recordedLesson.findFirst({ where: { moduleId }, orderBy: { position: "desc" } });
  return db.recordedLesson.create({
    data: {
      moduleId,
      title: input.title,
      position: (last?.position ?? 0) + 1,
      durationMinutes: input.durationMinutes ? Number(input.durationMinutes) : null,
      isPreviewable: input.isPreviewable,
      videoUrl: input.videoUrl || null,
      description: input.description || null,
    },
  });
}

export async function deleteLesson(lessonId: string) {
  const lesson = await db.recordedLesson.findUniqueOrThrow({ where: { id: lessonId }, include: { module: true } });
  await requireLegacyCourse(lesson.module.courseId);
  return db.recordedLesson.delete({ where: { id: lessonId } });
}

export async function addLiveSession(courseId: string, raw: Record<string, unknown>) {
  const input = liveSessionSchema.parse(raw);
  return db.liveSession.create({
    data: {
      courseId,
      title: input.title,
      cohortLabel: input.cohortLabel || null,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      meetingUrl: input.meetingUrl || null,
      capacity: input.capacity ? Number(input.capacity) : null,
    },
  });
}

export async function deleteLiveSession(id: string) {
  const session = await db.liveSession.findUnique({ where: { id } });
  if (session?.cohortId || session?.availabilityEnabled) throw new Error("Bu dersi grup dersleri takviminden yönetin.");
  return db.liveSession.delete({ where: { id } });
}
