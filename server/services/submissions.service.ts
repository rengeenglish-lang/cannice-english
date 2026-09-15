import "server-only";
import { db } from "@/server/db";
import { submitPracticeExamSchema, reviewSubmissionSchema } from "@/lib/validation/submissions";

export function listSubmissionsForEnrollment(enrollmentId: string) {
  return db.practiceSubmission.findMany({ where: { enrollmentId }, orderBy: { submittedAt: "desc" } });
}

export function listSubmissionsForAdmin() {
  return db.practiceSubmission.findMany({
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    include: { enrollment: { include: { user: true, course: { include: { product: true } } } } },
  });
}

export function getSubmissionForAdmin(id: string) {
  return db.practiceSubmission.findUnique({
    where: { id },
    include: { enrollment: { include: { user: true, course: { include: { product: true } } } } },
  });
}

export async function createSubmission(enrollmentId: string, raw: Record<string, unknown>) {
  const input = submitPracticeExamSchema.parse(raw);
  return db.practiceSubmission.create({ data: { enrollmentId, title: input.title, studentAnswer: input.studentAnswer } });
}

export async function reviewSubmission(id: string, raw: Record<string, unknown>) {
  const input = reviewSubmissionSchema.parse(raw);
  return db.practiceSubmission.update({
    where: { id },
    data: {
      teacherFeedback: input.teacherFeedback,
      score: input.score === "" || input.score === undefined ? null : input.score,
      status: "REVIEWED",
      reviewedAt: new Date(),
    },
  });
}

export function countPendingSubmissions() {
  return db.practiceSubmission.count({ where: { status: "PENDING" } });
}
