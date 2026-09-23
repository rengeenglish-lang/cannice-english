import "server-only";
import { db } from "@/server/db";
import { billingState } from "@/lib/billing";

type EnrollmentLike = { status: string; expiresAt: Date | null; paidThrough: Date | null };

/**
 * Whether an enrollment currently grants access: ACTIVE, not expired, and — for monthly-billed
 * group lessons — not locked for non-payment (the 1-day grace after paidThrough still counts).
 */
export function enrollmentGrantsAccess(enrollment: EnrollmentLike | null | undefined, now: Date = new Date()): boolean {
  return Boolean(
    enrollment &&
      enrollment.status === "ACTIVE" &&
      (!enrollment.expiresAt || enrollment.expiresAt > now) &&
      billingState(enrollment.paidThrough, now) !== "LOCKED",
  );
}

/**
 * Shared entitlement check, factored out of the 3 places that previously hand-rolled this
 * identically: learning.service.ts (getEnrollmentForCourse), group-availability.service.ts
 * (enrollGroupSlot), and app/group-lessons/[id]/page.tsx.
 */
export async function hasActiveEnrollment(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
  return enrollmentGrantsAccess(enrollment);
}

/** Batch variant for the recommendation engine, which checks many products/courses at once. */
export async function activeEnrollmentCourseIds(userId: string, courseIds: string[]): Promise<Set<string>> {
  if (courseIds.length === 0) return new Set();
  const enrollments = await db.enrollment.findMany({
    where: { userId, courseId: { in: courseIds }, status: "ACTIVE" },
    select: { courseId: true, status: true, expiresAt: true, paidThrough: true },
  });
  const now = new Date();
  return new Set(enrollments.filter((e) => enrollmentGrantsAccess(e, now)).map((e) => e.courseId));
}
