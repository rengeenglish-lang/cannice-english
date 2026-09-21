import "server-only";
import { db } from "@/server/db";
import { reviewSubmissionSchema } from "@/lib/validation/submissions";

/** Writing/Speaking diagnostic answers are free text — never auto-graded, so they sit here until a teacher scores them. */
export function listPendingDiagnosticResponses() {
  return db.diagnosticResponse.findMany({
    where: { gradingStatus: { not: null } },
    orderBy: [{ gradingStatus: "asc" }, { answeredAt: "desc" }],
    include: {
      question: { include: { topic: true, examType: true } },
      attempt: { include: { user: true } },
    },
  });
}

export function getDiagnosticResponseForAdmin(id: string) {
  return db.diagnosticResponse.findUnique({
    where: { id },
    include: {
      question: { include: { topic: true, examType: true } },
      attempt: { include: { user: true } },
    },
  });
}

export async function reviewDiagnosticResponse(id: string, raw: Record<string, unknown>) {
  const input = reviewSubmissionSchema.parse(raw);
  return db.diagnosticResponse.update({
    where: { id },
    data: {
      teacherFeedback: input.teacherFeedback,
      score: input.score === "" || input.score === undefined ? null : input.score,
      gradingStatus: "REVIEWED",
      reviewedAt: new Date(),
    },
  });
}

export function countPendingDiagnosticResponses() {
  return db.diagnosticResponse.count({ where: { gradingStatus: "PENDING" } });
}
