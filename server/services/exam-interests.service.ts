import "server-only";
import { db } from "@/server/db";
import { dayKey } from "@/lib/engagement";
import { countdownFor, parseInterests, slugForCode, type InterestCode } from "@/lib/exam-interests";

const toKey = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function getExamInterests(userId: string) {
  const rows = await db.userExamInterest.findMany({ where: { userId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  return rows.map((r) => ({ code: r.examCode as InterestCode, examDate: toKey(r.examDate) }));
}

/** Replaces the learner's exams (0–2). Throws with a Turkish message on invalid input. */
export async function setExamInterests(userId: string, raw: { code: string; examDate?: string | null }[]) {
  const interests = parseInterests(raw);
  await db.$transaction([
    db.userExamInterest.deleteMany({ where: { userId } }),
    db.userExamInterest.createMany({
      data: interests.map((i, position) => ({ userId, examCode: i.code, examDate: i.examDate ? new Date(`${i.examDate}T00:00:00Z`) : null, position })),
    }),
  ]);
  return interests;
}

/** Countdowns for the bar under the navbar; empty when the learner hasn't chosen exams. */
export async function examCountdowns(userId: string, now = new Date()) {
  const today = dayKey(now);
  return (await getExamInterests(userId)).map((i) => countdownFor(i, today));
}

/** The bar's data plus whole days left per exam, so the server render matches the first client paint. */
export async function examCountdownBar(userId: string, now = new Date()) {
  const items = await examCountdowns(userId, now);
  const initialDays = Object.fromEntries(
    items.map((c) => [c.code, c.state === "DATE" ? Math.max(0, Math.floor((new Date(c.target).getTime() - now.getTime()) / 86_400_000)) : 0]),
  );
  return { items, initialDays };
}

/** A sensible first choice for the picker: the exam of the learner's active goal or coaching plan. */
export async function suggestedInterest(userId: string): Promise<InterestCode | null> {
  const goal = await db.examGoal.findFirst({ where: { userId, isActive: true }, select: { examType: { select: { code: true } } } });
  if (goal) return goal.examType.code as InterestCode;
  const coaching = await db.coachingProfile.findUnique({ where: { userId }, select: { contentExamSlug: true } });
  if (!coaching?.contentExamSlug) return null;
  const codes: InterestCode[] = ["YDS", "YOKDIL_SOSYAL", "YOKDIL_SAGLIK", "YOKDIL_FEN", "IELTS", "TOEFL", "PTE"];
  return codes.find((c) => slugForCode(c) === coaching.contentExamSlug) ?? null;
}
