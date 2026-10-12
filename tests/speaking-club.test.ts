import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { PLACEMENT_BANDS, PLACEMENT_QUESTIONS } from "../content/english-placement";
import { gradePlacement, groupForCefr } from "../lib/speaking-club";
import { speakingLevel, submitPlacement, getSpeakingClubRooms, saveSpeakingClubRooms } from "../server/services/speaking-club.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

/** Answers that get `perBand[band]` questions right in each band (the rest wrong). */
function answersFor(perBand: Partial<Record<string, number>>) {
  const out: Record<string, number> = {};
  const used: Record<string, number> = {};
  for (const q of PLACEMENT_QUESTIONS) {
    used[q.band] = (used[q.band] ?? 0) + 1;
    out[q.id] = used[q.band] <= (perBand[q.band] ?? 0) ? q.answer : (q.answer + 1) % 4;
  }
  return out;
}

test("the test is well-formed: 5 questions per band, easiest first, unique ids, four options", () => {
  assert.equal(PLACEMENT_QUESTIONS.length, 30);
  for (const band of PLACEMENT_BANDS) assert.equal(PLACEMENT_QUESTIONS.filter((q) => q.band === band).length, 5, band);
  assert.equal(new Set(PLACEMENT_QUESTIONS.map((q) => q.id)).size, 30);
  assert.ok(PLACEMENT_QUESTIONS.every((q) => q.options.length === 4 && new Set(q.options).size === 4));
});

test("level = highest band reached without skipping one; groups A/B/C", () => {
  assert.equal(gradePlacement({}).cefr, "A1", "blank test → A1");
  assert.equal(gradePlacement(answersFor({ A1: 5, A2: 4, B1: 3, B2: 2, C1: 5 })).cefr, "B1", "lucky C1 guesses don't skip B2");
  const all = gradePlacement(answersFor({ A1: 5, A2: 5, B1: 5, B2: 5, C1: 5, C2: 5 }));
  assert.deepEqual([all.cefr, all.correct, all.group], ["C2", 30, "C"]);
  assert.equal(gradePlacement(answersFor({ A1: 3, A2: 3, B1: 3, B2: 3 })).group, "B");
  assert.deepEqual(["A1", "A2", "B1", "B2", "C1", "C2"].map(groupForCefr), ["A", "A", "B", "B", "C", "C"]);
});

test("unknown until tested; the latest placement counts; rooms are stored per group", async () => {
  const user = await db.user.create({ data: { email: `sc-${randomUUID()}@example.test`, name: "Konuşan", role: "STUDENT" } });
  try {
    assert.equal(await speakingLevel(user.id), null);
    const first = await submitPlacement(user.id, { ...answersFor({ A1: 5, A2: 4 }), bogus: 2 });
    assert.equal(first.cefr, "A2");
    assert.equal((await speakingLevel(user.id))!.group, "A");
    await new Promise((r) => setTimeout(r, 5));
    await submitPlacement(user.id, answersFor({ A1: 5, A2: 5, B1: 4, B2: 3, C1: 3 }));
    const level = (await speakingLevel(user.id))!;
    assert.deepEqual([level.cefr, level.group, level.source], ["C1", "C", "PLACEMENT"]);

    await saveSpeakingClubRooms({ rooms: [{ key: "A", url: "https://meet.jit.si/test-a", schedule: "Cuma 20:00" }, { key: "B", url: "", schedule: "" }, { key: "C", url: "https://meet.jit.si/test-c", schedule: "" }], note: "Not" });
    const { rooms } = await getSpeakingClubRooms();
    assert.equal(rooms.find((r) => r.key === "A")!.url, "https://meet.jit.si/test-a");
    assert.equal(rooms.find((r) => r.key === "B")!.url, "");
    await assert.rejects(saveSpeakingClubRooms({ rooms: [{ key: "A", url: "http://insecure", schedule: "" }], note: "" }), /https/);
  } finally {
    await db.appSetting.deleteMany({ where: { key: { startsWith: "speaking_club_" } } });
    await db.user.delete({ where: { id: user.id } });
  }
});
