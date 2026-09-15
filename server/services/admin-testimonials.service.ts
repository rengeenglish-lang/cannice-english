import "server-only";
import { db } from "@/server/db";
import { testimonialSchema } from "@/lib/validation/admin";
import type { z } from "zod";

export function listTestimonialsForAdmin() {
  return db.testimonial.findMany({ include: { examType: true }, orderBy: { displayOrder: "asc" } });
}

export function getTestimonial(id: string) {
  return db.testimonial.findUnique({ where: { id } });
}

function toData(input: z.infer<typeof testimonialSchema>) {
  return {
    studentName: input.studentName,
    studentPhotoUrl: input.studentPhotoUrl || null,
    examTypeId: input.examTypeId || null,
    resultSummary: input.resultSummary || null,
    quote: input.quote,
    rating: input.rating,
    isPublished: input.isPublished,
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
  };
}

export async function createTestimonial(raw: Record<string, unknown>) {
  const input = testimonialSchema.parse(raw);
  return db.testimonial.create({ data: toData(input) });
}

export async function updateTestimonial(id: string, raw: Record<string, unknown>) {
  const input = testimonialSchema.parse(raw);
  return db.testimonial.update({ where: { id }, data: toData(input) });
}

export async function deleteTestimonial(id: string) {
  return db.testimonial.delete({ where: { id } });
}
