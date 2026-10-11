import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { allowedExamSlugs, canOpenExam, countdownFor, nextOfficialExam, parseInterests } from "../lib/exam-interests";
import { examCountdowns, getExamInterests, setExamInterests } from "../server/services/exam-interests.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

test("YDS learners count down to the next paper YDS or English e-YDS; YÖKDİL to the next YÖKDİL", () => {
  assert.equal(nextOfficialExam("YDS", "2026-10-11")?.name, "e-YDS 2026/11");
  assert.equal(nextOfficialExam("YDS", "2026-10-18")?.name, "2026-YDS/2");
  assert.equal(nextOfficialExam("YOKDIL_SAGLIK", "2026-03-01")?.name, "2026-YÖKDİL/1");
  assert.equal(nextOfficialExam("YOKDIL_FEN", "2026-10-11"), undefined, "no YÖKDİL left in 2026");
  assert.equal(nextOfficialExam("IELTS", "2026-10-11"), undefined);
});

test("countdowns: own date wins, ÖSYM fallback, waiting for the new calendar, IELTS needs a date", () => {
  const yds = countdownFor({ code: "YDS", examDate: null }, "2026-10-18");
  assert.ok(yds.state === "DATE" && yds.dateKey === "2026-11-22" && yds.source === "OSYM" && yds.target === "2026-11-22T10:15:00+03:00");
  const own = countdownFor({ code: "IELTS", examDate: "2026-12-05" }, "2026-10-11");
  assert.ok(own.state === "DATE" && own.source === "PERSONAL" && own.dateKey === "2026-12-05");
  assert.equal(countdownFor({ code: "IELTS", examDate: null }, "2026-10-11").state, "NEEDS_DATE");
  assert.equal(countdownFor({ code: "TOEFL", examDate: "2026-01-01" }, "2026-10-11").state, "NEEDS_DATE", "past own date is ignored");
  assert.equal(countdownFor({ code: "YOKDIL_SOSYAL", examDate: null }, "2026-10-11").state, "AWAITING_CALENDAR");
});

test("material access follows the chosen exams; no choice means no restriction", () => {
  assert.equal(allowedExamSlugs(null), null);
  assert.equal(allowedExamSlugs([]), null);
  const allowed = allowedExamSlugs(["YDS", "YOKDIL_SAGLIK"]);
  assert.ok(canOpenExam(allowed, "yds") && canOpenExam(allowed, "yokdil-saglik-bilimleri"));
  assert.ok(!canOpenExam(allowed, "ielts") && !canOpenExam(allowed, "yokdil-fen-bilimleri"));
  assert.ok(canOpenExam(null, "ielts"));
});

test("at most two exams, no repeats, unknown codes and bad dates dropped", () => {
  assert.deepEqual(parseInterests([{ code: "YDS" }, { code: "YDS" }, { code: "NOPE" }, { code: "IELTS", examDate: "05/12/2026" }]), [
    { code: "YDS", examDate: null },
    { code: "IELTS", examDate: null },
  ]);
  assert.throws(() => parseInterests([{ code: "YDS" }, { code: "IELTS" }, { code: "PTE" }]), /En fazla 2/);
});

test("saving replaces the previous choice and feeds the countdown bar", async () => {
  const user = await db.user.create({ data: { email: `int-${randomUUID()}@example.test`, name: "İlgi Test", role: "STUDENT" } });
  try {
    await setExamInterests(user.id, [{ code: "IELTS", examDate: "2026-12-05" }]);
    await setExamInterests(user.id, [{ code: "YDS" }, { code: "TOEFL", examDate: "2026-11-30" }]);
    assert.deepEqual(await getExamInterests(user.id), [
      { code: "YDS", examDate: null },
      { code: "TOEFL", examDate: "2026-11-30" },
    ]);
    const bar = await examCountdowns(user.id, new Date("2026-10-11T12:00:00Z"));
    assert.deepEqual(bar.map((c) => c.state), ["DATE", "DATE"]);
    await assert.rejects(setExamInterests(user.id, [{ code: "YDS" }, { code: "PTE" }, { code: "IELTS" }]), /En fazla 2/);
    assert.equal((await getExamInterests(user.id)).length, 2, "a rejected save changes nothing");
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});
