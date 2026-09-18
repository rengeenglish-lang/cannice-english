import test from "node:test";
import assert from "node:assert/strict";
import { summarizeLearning } from "../lib/learning-overview.ts";
const modules = [
  {
    lessons: [
      { id: "a", title: "First" },
      { id: "b", title: "Second" },
    ],
  },
  { lessons: [{ id: "c", title: "Third" }] },
];
test("empty courses do not invent progress or a next lesson", () => {
  assert.deepEqual(summarizeLearning([], []), {
    total: 0,
    completed: 0,
    percent: 0,
    nextLesson: null,
  });
});
test("ignores stale and duplicate progress when choosing next lesson", () => {
  const summary = summarizeLearning(modules, [
    { recordedLessonId: "a", completedAt: new Date() },
    { recordedLessonId: "a", completedAt: new Date() },
    { recordedLessonId: "removed", completedAt: new Date() },
    { recordedLessonId: "b", completedAt: null },
  ]);
  assert.equal(summary.completed, 1);
  assert.equal(summary.percent, 33);
  assert.equal(summary.nextLesson.id, "b");
});
test("fully completed courses have no next lesson", () => {
  const summary = summarizeLearning(
    modules,
    ["a", "b", "c"].map((id) => ({
      recordedLessonId: id,
      completedAt: new Date(),
    })),
  );
  assert.equal(summary.percent, 100);
  assert.equal(summary.nextLesson, null);
});
