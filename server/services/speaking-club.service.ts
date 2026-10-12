import "server-only";
import { db } from "@/server/db";
import { getSetting, setSetting } from "@/server/services/settings.service";
import { cefrFromPercentage } from "@/lib/diagnostics/cefr";
import { CLUB_GROUPS, gradePlacement, groupForCefr, type ClubGroup } from "@/lib/speaking-club";
import { PLACEMENT_QUESTIONS } from "@/content/english-placement";

const roomKey = (g: ClubGroup, field: "url" | "schedule") => `speaking_club_${field}_${g}`;

/** The three level rooms; a group without its own schedule shows the general one. */
export async function getSpeakingClubRooms() {
  const [generalSchedule, note] = await Promise.all([getSetting("speaking_club_schedule", ""), getSetting("speaking_club_note", "")]);
  const rooms = await Promise.all(
    CLUB_GROUPS.map(async (g) => {
      const url = (await getSetting(roomKey(g.key, "url"), "")).trim();
      const schedule = (await getSetting(roomKey(g.key, "schedule"), "")).trim() || generalSchedule;
      return { ...g, url: /^https:\/\//i.test(url) ? url : "", schedule };
    }),
  );
  return { rooms, note };
}

export async function saveSpeakingClubRooms(input: { rooms: { key: ClubGroup; url: string; schedule: string }[]; note: string }) {
  for (const r of input.rooms) {
    if (r.url && !/^https:\/\//i.test(r.url)) throw new Error(`${r.key} odası için https ile başlayan bir bağlantı girin.`);
    await setSetting(roomKey(r.key, "url"), r.url.trim());
    await setSetting(roomKey(r.key, "schedule"), r.schedule.trim().slice(0, 200));
  }
  await setSetting("speaking_club_note", input.note.trim().slice(0, 600));
}

export type SpeakingLevel = { cefr: string; group: ClubGroup; source: "PLACEMENT" | "LEVEL_TEST"; at: Date };

/**
 * The learner's level for grouping: the latest placement test, else the CEFR band of their latest
 * IELTS/TOEFL/PTE level test. Null when neither exists — they must take the placement test first.
 */
export async function speakingLevel(userId: string): Promise<SpeakingLevel | null> {
  const placement = await db.englishPlacement.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  if (placement) return { cefr: placement.cefr, group: groupForCefr(placement.cefr), source: "PLACEMENT", at: placement.createdAt };
  const attempt = await db.diagnosticAttempt.findFirst({
    where: { userId, kind: "FULL_DIAGNOSTIC", examFamily: "ACADEMIC_SKILLS", status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true, responses: { select: { isCorrect: true } } },
  });
  if (!attempt?.responses.length) return null;
  const pct = (attempt.responses.filter((r) => r.isCorrect).length / attempt.responses.length) * 100;
  const cefr = cefrFromPercentage(pct);
  return { cefr, group: groupForCefr(cefr), source: "LEVEL_TEST", at: attempt.completedAt ?? new Date() };
}

/** Grades and saves a placement test; returns the result. */
export async function submitPlacement(userId: string, answers: Record<string, number>) {
  const known = new Set(PLACEMENT_QUESTIONS.map((q) => q.id));
  const clean = Object.fromEntries(Object.entries(answers).filter(([id, v]) => known.has(id) && Number.isInteger(v) && v >= 0 && v <= 3));
  const result = gradePlacement(clean);
  await db.englishPlacement.create({ data: { userId, cefr: result.cefr, correct: result.correct, total: result.total, answers: clean } });
  return result;
}

/** How many learners are in each group (latest placement per learner), for the admin page. */
export async function speakingClubGroupCounts() {
  const latest = await db.englishPlacement.findMany({ distinct: ["userId"], orderBy: [{ userId: "asc" }, { createdAt: "desc" }], select: { cefr: true } });
  const counts: Record<ClubGroup, number> = { A: 0, B: 0, C: 0 };
  for (const p of latest) counts[groupForCefr(p.cefr)] += 1;
  return counts;
}
