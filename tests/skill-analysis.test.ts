import { test } from "node:test";
import assert from "node:assert/strict";
import { creditSeconds, formatStudyMinutes, recommendedMinutes } from "../lib/diagnostics/skill-analysis";

test("recommended study time scales the topic estimate by how weak the result was", () => {
  assert.equal(recommendedMinutes(600, "CRITICAL"), 600);
  assert.equal(recommendedMinutes(600, "NEEDS_IMPROVEMENT"), 450);
  assert.equal(recommendedMinutes(600, "DEVELOPING"), 300);
  assert.equal(recommendedMinutes(90, "STRONG"), 30, "rounded to 15-minute steps");
  assert.equal(recommendedMinutes(20, "STRONG"), 15, "never below 15 minutes");
  assert.equal(recommendedMinutes(null, "CRITICAL"), null);
});

test("a timer report is credited no faster than real time and never more than a minute", () => {
  const now = new Date("2026-10-11T10:00:00Z");
  assert.equal(creditSeconds(30, null, now), 30, "first report");
  assert.equal(creditSeconds(500, null, now), 60, "capped");
  assert.equal(creditSeconds(30, new Date(now.getTime() - 30_000), now), 30);
  // A second tab or a replayed request right after the last report adds almost nothing.
  assert.equal(creditSeconds(30, new Date(now.getTime() - 2_000), now), 7);
  assert.equal(creditSeconds(-5, null, now), 0);
  assert.equal(creditSeconds(Number.NaN, null, now), 0);
});

test("study minutes read naturally in Turkish", () => {
  assert.equal(formatStudyMinutes(0), "0 dk");
  assert.equal(formatStudyMinutes(45), "45 dk");
  assert.equal(formatStudyMinutes(60), "1 sa");
  assert.equal(formatStudyMinutes(135), "2 sa 15 dk");
});
