import "server-only";
import { db } from "@/server/db";
import type { SuggestionInput } from "@/lib/coaching/suggestion-prompt";

export const SUGGESTIONS_PER_DAY = 5;
const DAY = 86_400_000;

/** "Koçluk için önerin var mı?" — a free-form idea from the student, a few per day at most. */
export async function submitSuggestion(userId: string, raw: string, now = new Date()) {
  const message = raw.trim().slice(0, 2000);
  if (message.length < 3) return { ok: false as const, reason: "EMPTY" as const };
  const recent = await db.coachingFeedback.count({ where: { userId, kind: "SUGGESTION", createdAt: { gt: new Date(now.getTime() - DAY) } } });
  if (recent >= SUGGESTIONS_PER_DAY) return { ok: false as const, reason: "LIMIT" as const };
  await db.coachingFeedback.create({ data: { userId, kind: "SUGGESTION", message } });
  return { ok: true as const };
}

/** A report survey is worth a look only when something in it wasn't fine. */
const worthReading = { OR: [{ kind: { in: ["ADVICE", "SUGGESTION"] } }, { message: { not: null } }, { useful: false }, { workloadRealistic: false }, { reminderFrequency: { in: ["TOO_MANY", "TOO_FEW"] } }] };

export type SuggestionRow = SuggestionInput & { handledAt: Date | null };

/** Gelen Koçluk Önerileri, newest first, with what each refers to and the student's (anonymous) settings. */
export async function listSuggestions(handled: boolean, take = 200): Promise<SuggestionRow[]> {
  const rows = await db.coachingFeedback.findMany({
    where: { AND: [worthReading, { handledAt: handled ? { not: null } : null }] },
    orderBy: { createdAt: "desc" },
    take,
  });
  const proposalIds: string[] = [];
  const reportIds: string[] = [];
  for (const r of rows) {
    const ref = r.kind === "REPORT" && r.refId ? `report:${r.refId}` : r.refId ?? "";
    const [type, id] = ref.split(":");
    if (type === "proposal" && id) proposalIds.push(id);
    if (type === "report" && id) reportIds.push(id);
  }
  const [proposals, reports, profiles] = await Promise.all([
    db.planProposal.findMany({ where: { id: { in: proposalIds } }, select: { id: true, summary: true, reason: true } }),
    db.coachingReport.findMany({ where: { id: { in: reportIds } }, select: { id: true, data: true, periodStart: true, periodEnd: true } }),
    db.coachingProfile.findMany({
      where: { userId: { in: [...new Set(rows.map((r) => r.userId))] } },
      select: { userId: true, pathway: true, examVersion: true, currentLevel: true, targetScore: true, studyDays: true, dailyMinutes: true, frequency: true },
    }),
  ]);
  const proposalById = new Map(proposals.map((p) => [p.id, `${p.summary} (gerekçe: ${p.reason})`]));
  const reportById = new Map(
    reports.map((r) => {
      const rec = (r.data as { recommendation?: { tr?: string } } | null)?.recommendation?.tr;
      return [r.id, `${r.periodStart.toISOString().slice(0, 10)} – ${r.periodEnd.toISOString().slice(0, 10)} haftalık raporu${rec ? `; önerisi: ${rec}` : ""}`];
    }),
  );
  const profileByUser = new Map(profiles.map(({ userId, ...p }) => [userId, p]));

  return rows.map((r) => {
    const ref = r.kind === "REPORT" && r.refId ? `report:${r.refId}` : r.refId ?? "";
    const [type, id] = ref.split(":");
    const text = type === "proposal" ? proposalById.get(id) : type === "report" ? reportById.get(id) : undefined;
    return {
      id: r.id,
      kind: r.kind,
      message: r.message,
      useful: r.useful,
      workloadRealistic: r.workloadRealistic,
      reminderFrequency: r.reminderFrequency,
      createdAt: r.createdAt,
      handledAt: r.handledAt,
      about: text ? { type: type as "proposal" | "report", text } : null,
      student: profileByUser.get(r.userId) ?? null,
    };
  });
}

export function setSuggestionHandled(id: string, handled: boolean) {
  return db.coachingFeedback.updateMany({ where: { id }, data: { handledAt: handled ? new Date() : null } });
}

export function countOpenSuggestions() {
  return db.coachingFeedback.count({ where: { AND: [worthReading, { handledAt: null }] } });
}
