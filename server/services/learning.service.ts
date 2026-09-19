import "server-only";
import { db } from "@/server/db";

const visibleSessions = (userId: string) => ({
  AND: [{ OR: [{ cohortId: null }, { cohort: { status: { in: ["OPEN" as const, "CLOSED" as const] }, enrollments: { some: { studentId: userId, status: "CONFIRMED" as const } } } }] }],
  OR: [
    { availabilityEnabled: false },
    {
      availabilityEnabled: true,
      cancelled: false,
      bookings: { some: { studentId: userId, status: "ACTIVE" as const } },
    },
  ],
});

export function getEnrollmentForCourse(userId: string, courseId: string) {
  return db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      course: {
        include: {
          product: true,
          modules: {
            orderBy: { position: "asc" },
            include: { lessons: { orderBy: { position: "asc" } } },
          },
          liveSessions: {
            where: visibleSessions(userId),
            orderBy: { startsAt: "asc" },
          },
        },
      },
      lessonProgresses: true,
    },
  });
}

export function listEnrollmentsForUser(userId: string) {
  return db.enrollment.findMany({
    where: { userId, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    include: {
      course: {
        include: {
          product: true,
          modules: {
            orderBy: { position: "asc" },
            include: { lessons: { orderBy: { position: "asc" } } },
          },
          liveSessions: {
            where: { ...visibleSessions(userId), endsAt: { gte: new Date() } },
            orderBy: { startsAt: "asc" },
          },
        },
      },
      lessonProgresses: true,
    },
    orderBy: { grantedAt: "desc" },
  });
}

export async function toggleLessonProgress(
  enrollmentId: string,
  recordedLessonId: string,
) {
  const existing = await db.lessonProgress.findUnique({
    where: {
      enrollmentId_recordedLessonId: { enrollmentId, recordedLessonId },
    },
  });
  if (existing) {
    return db.lessonProgress.update({
      where: { id: existing.id },
      data: { completedAt: existing.completedAt ? null : new Date() },
    });
  }
  return db.lessonProgress.create({
    data: { enrollmentId, recordedLessonId, completedAt: new Date() },
  });
}
