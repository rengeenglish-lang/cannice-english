import { test } from "node:test";
import assert from "node:assert/strict";
import { PLACEMENT_BANDS, PLACEMENT_QUESTIONS } from "../content/english-placement";
import { gradePlacement } from "../lib/speaking-club";

test("general English covers every CEFR band and grades each sequential level", () => {
  assert.equal(new Set(PLACEMENT_QUESTIONS.map((q) => q.id)).size, 30);
  for (const [index, band] of PLACEMENT_BANDS.entries()) {
    assert.equal(PLACEMENT_QUESTIONS.filter((q) => q.band === band).length, 5);
    const passed = new Set(PLACEMENT_BANDS.slice(0, index + 1));
    const answers = Object.fromEntries(PLACEMENT_QUESTIONS.filter((q) => passed.has(q.band)).map((q) => [q.id, q.answer]));
    assert.equal(gradePlacement(answers).cefr, band);
    assert.equal(gradePlacement(answers).correct, (index + 1) * 5);
  }
});

test("blank answers and isolated advanced answers cannot skip earlier levels", () => {
  assert.equal(gradePlacement({}).correct, 0);
  const advancedOnly = Object.fromEntries(PLACEMENT_QUESTIONS.filter((q) => q.band === "C2").map((q) => [q.id, q.answer]));
  assert.equal(gradePlacement(advancedOnly).cefr, "A1");
});
