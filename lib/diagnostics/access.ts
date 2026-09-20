import "server-only";
import { db } from "@/server/db";

/**
 * Shared entitlement check, factored out of the 3 places that previously hand-rolled this
 * identically: learning.service.ts (getEnrollmentForCourse), group-availability.service.ts
 * (enrollGroupSlot), and app/group-lessons/[id]/page.tsx.
 */
export async function hasActiveEnrollment(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  return Boolean(enrollment && enrollment.status === "ACTIVE" && (!enrollment.expiresAt || enrollment.expiresAt > new Date()));
}

/** Batch variant for the recommendation engine, which checks many products/courses at once. */
export async function activeEnrollmentCourseIds(userId: string, courseIds: string[]): Promise<Set<string>> {
  if (courseIds.length === 0) return new Set();
  const enrollments = await db.enrollment.findMany({
    where: { userId, courseId: { in: courseIds }, status: "ACTIVE" },
    select: { courseId: true, expiresAt: true },
  });
  const now = new Date();
  return new Set(enrollments.filter((e) => !e.expiresAt || e.expiresAt > now).map((e) => e.courseId));
}
