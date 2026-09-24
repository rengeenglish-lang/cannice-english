import { test } from "node:test";
import assert from "node:assert/strict";
import { A1 } from "../content/vocabulary/a1";
import { blankOut, buildQuiz, type QuizWord } from "../lib/vocabulary/quiz";

const words: QuizWord[] = A1.map(([word, pos, tr, exampleEn, exampleTr], i) => ({ id: `a1-${i}`, word, pos, tr, exampleEn, exampleTr }));

test("A1 has 800 complete words in 40 sets of 20", () => {
  assert.equal(A1.length, 800);
  for (const [w, pos, tr, en, trEx] of A1) assert.ok(w && pos && tr && en && trEx, `incomplete entry: ${w}`);
  const keys = A1.map(([w, pos]) => `${w.toLowerCase()}|${pos}`);
  assert.equal(new Set(keys).size, keys.length, "no word appears twice with the same part of speech");
});

test("blankOut hides the whole word only", () => {
  assert.equal(blankOut("I have a red bag.", "red"), "I have a _____ bag.");
  assert.equal(blankOut("She reads every day.", "read"), null, "no partial-word matches");
  assert.equal(blankOut("Turn on the TV.", "television (TV)"), null);
});

test("each set test has one valid question per word with four distinct options", () => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let s = 0; s < 40; s++) {
    const set = words.slice(s * 20, s * 20 + 20);
    const quiz = buildQuiz(set, words, rand);
    assert.equal(quiz.length, 20);
    assert.deepEqual(new Set(quiz.map((q) => q.wordId)), new Set(set.map((w) => w.id)));
    for (const q of quiz) {
      assert.equal(q.options.length, 4, `set ${s + 1} ${q.wordId}`);
      assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4, `duplicate options in ${q.prompt}`);
      const w = set.find((x) => x.id === q.wordId)!;
      assert.equal(q.options[q.answer], q.kind === "MEANING" ? w.tr : w.word);
    }
    assert.ok(quiz.some((q) => q.kind === "BLANK"), `set ${s + 1} includes fill-in-the-blank`);
  }
});
