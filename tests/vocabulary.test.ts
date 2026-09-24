import { test } from "node:test";
import assert from "node:assert/strict";
import { A1 } from "../content/vocabulary/a1";
import { A2 } from "../content/vocabulary/a2";
import { B1 } from "../content/vocabulary/b1";
import { B2 } from "../content/vocabulary/b2";
import { C1 } from "../content/vocabulary/c1";
import type { LexiconEntry } from "../content/vocabulary/types";
import { blankOut, buildQuiz, type QuizWord } from "../lib/vocabulary/quiz";

const toQuiz = (entries: LexiconEntry[], level: string): QuizWord[] => entries.map(([word, pos, tr, exampleEn, exampleTr], i) => ({ id: `${level}-${i}`, word, pos, tr, exampleEn, exampleTr }));
const LEVELS = {
  A1: { entries: A1, target: 800 }, A2: { entries: A2, target: 1000 },
  B1: { entries: B1, target: 1200 },
  B2: { entries: B2, target: 1400 },
  C1: { entries: C1, target: 1600 },
};

for (const [code, { entries, target }] of Object.entries(LEVELS)) {
  test(`${code} has ${target} complete words in sets of 20`, () => {
    assert.equal(entries.length, target);
    for (const [w, pos, tr, en, trEx] of entries) assert.ok(w && pos && tr && en && trEx, `incomplete entry: ${w}`);
    const keys = entries.map(([w, pos]) => `${w.toLowerCase()}|${pos}`);
    assert.equal(new Set(keys).size, keys.length, "no word appears twice with the same part of speech");
  });
}

test("blankOut hides the whole word only", () => {
  assert.equal(blankOut("I have a red bag.", "red"), "I have a _____ bag.");
  assert.equal(blankOut("She reads every day.", "read"), null, "no partial-word matches");
  assert.equal(blankOut("Turn on the TV.", "television (TV)"), null);
});

for (const [code, { entries }] of Object.entries(LEVELS)) {
  test(`${code}: each set test has one valid question per word with four distinct options`, () => {
    const words = toQuiz(entries, code);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let s = 0; s < words.length / 20; s++) {
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
      assert.ok(quiz.some((q) => q.kind === "BLANK"), `${code} set ${s + 1} includes fill-in-the-blank`);
    }
  });
}
