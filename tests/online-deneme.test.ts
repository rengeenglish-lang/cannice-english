import { test, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../server/db";
import { loadKeyedDeneme, loadPaper } from "../lib/online-denemeler/paper";
import { gradeDeneme } from "../lib/online-denemeler/grading";
import { DENEME_LOADERS, RELEASED_DENEME_COUNT } from "../content/yds-denemeler/registry";
import { createAttempt, finishAttempt, saveAnswer, savedAnswers, settleAttempt, denemeOverview } from "../server/services/online-deneme.service";

after(async () => db.$disconnect());

test("every released deneme builds an 80-question A–E paper whose booklet pages cover 1–80 in order", async () => {
  assert.equal(RELEASED_DENEME_COUNT, Object.keys(DENEME_LOADERS).length);
  for (let no = 1; no <= RELEASED_DENEME_COUNT; no++) {
    const paper = await loadPaper(no);
    assert.ok(paper, `deneme ${no}`);
    assert.equal(paper.questions.length, 80);
    for (const q of paper.questions) {
      assert.equal(q.options.length, 5, `deneme ${no} soru ${q.n}`);
      // The browser copy never carries the key.
      assert.equal("answer" in q || "why" in q, false);
    }
    let expected = 1;
    for (const p of paper.pages) {
      assert.equal(p.from, expected);
      assert.ok(p.to >= p.from);
      expected = p.to + 1;
    }
    assert.equal(expected, 81);
    // A passage never straddles two booklet pages.
    for (const passage of paper.passages) {
      assert.ok(paper.pages.some((p) => p.from <= passage.from && p.to >= passage.to), `deneme ${no} parça ${passage.from}`);
    }
    assert.equal(paper.passages.filter((p) => p.kind === "cloze").length, 2);
    assert.equal(paper.passages.filter((p) => p.kind === "reading").length, 5);
    assert.match(paper.passages[0].text, /\(17\) ----/);
  }
});

test("grading follows YDS rules: 1.25 per correct, wrong and blank cost nothing", async () => {
  const keyed = (await loadKeyedDeneme(1))!;
  const all = gradeDeneme(keyed.questions, new Map(keyed.questions.map((q) => [q.n, q.answer])));
  assert.deepEqual([all.correct, all.wrong, all.blank, all.score], [80, 0, 0, 100]);
  const mixed = new Map<number, number | null>();
  keyed.questions.forEach((q, i) => mixed.set(q.n, i < 40 ? q.answer : i < 60 ? (q.answer + 1) % 5 : null));
  const g = gradeDeneme(keyed.questions, mixed);
  assert.deepEqual([g.correct, g.wrong, g.blank, g.score], [40, 20, 20, 50]);
  assert.equal(g.sections.reduce((s, x) => s + x.total, 0), 80);
});

test("the server clock locks a sitting: saves after the deadline are refused and the attempt is graded", async () => {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["127.0.0.1", "localhost"].includes(url.hostname) || !url.pathname.endsWith("_test")) return;
  const stamp = `${Date.now()}-${Math.random()}`;
  const user = await db.user.create({ data: { name: "Deneme", email: `d-${stamp}@example.test` } });
  const other = await db.user.create({ data: { name: "Other", email: `o-${stamp}@example.test` } });
  const keyed = (await loadKeyedDeneme(3))!;

  const attempt = await createAttempt(user.id, 3, "OPTIK");
  assert.equal(attempt.deadlineAt.getTime() - attempt.startedAt.getTime(), 180 * 60_000);
  assert.deepEqual(await saveAnswer(attempt.id, user.id, 1, { choice: keyed.questions[0].answer, flagged: false }), { ok: true });
  assert.deepEqual(await saveAnswer(attempt.id, user.id, 2, { choice: (keyed.questions[1].answer + 1) % 5, flagged: true }), { ok: true });
  assert.equal((await saveAnswer(attempt.id, user.id, 81, { choice: 0, flagged: false })).ok, false);
  assert.equal((await saveAnswer(attempt.id, user.id, 3, { choice: 5, flagged: false })).ok, false);
  // Someone else's attempt cannot be written to.
  assert.deepEqual(await saveAnswer(attempt.id, other.id, 3, { choice: 0, flagged: false }), { ok: false, locked: false, error: "Deneme bulunamadı." });
  assert.equal(Object.keys(await savedAnswers(attempt.id)).length, 2);

  // Time runs out (move the deadline into the past instead of waiting three hours).
  await db.onlineDenemeAttempt.update({ where: { id: attempt.id }, data: { deadlineAt: new Date(Date.now() - 60_000) } });
  assert.deepEqual(await saveAnswer(attempt.id, user.id, 3, { choice: 0, flagged: false }), { ok: false, locked: true });
  const locked = await db.onlineDenemeAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
  assert.equal(locked.status, "COMPLETED");
  assert.equal(locked.timedOut, true);
  assert.deepEqual([locked.correct, locked.wrong, locked.blank, Number(locked.score)], [1, 1, 78, 1.25]);
  assert.equal(Object.keys(await savedAnswers(attempt.id)).length, 2);

  // Finishing early is not a timeout; a walked-away sitting is settled by the overview.
  const early = await createAttempt(user.id, 4, "KLASIK");
  const done = await finishAttempt(early.id, user.id);
  assert.equal(done?.timedOut, false);
  const abandoned = await createAttempt(user.id, 5, "KLASIK");
  await db.onlineDenemeAttempt.update({ where: { id: abandoned.id }, data: { deadlineAt: new Date(Date.now() - 1000) } });
  const overview = await denemeOverview(user.id);
  assert.equal(overview.get(5)?.openId, null);
  assert.equal(overview.get(5)?.finished, 1);
  const settled = await settleAttempt(await db.onlineDenemeAttempt.findUniqueOrThrow({ where: { id: abandoned.id } }));
  assert.equal(settled.timedOut, true);

  await db.user.deleteMany({ where: { id: { in: [user.id, other.id] } } });
});
