import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FEEDBACK_TOOL,
  WRITING_FEEDBACK_KINDS,
  WRITING_KIND_KEYS,
  buildFeedbackSystemPrompt,
  buildFeedbackUserMessage,
  countWords,
  monthStart,
  monthlyAllowance,
  monthlyCapUsd,
  parseFeedbackResult,
  reserveUsd,
  validateWritingInput,
} from "../lib/writing-feedback";

test("countWords counts words like exam boards, ignoring stray punctuation", () => {
  assert.equal(countWords("  The graph shows - a rise of 20% in 2020.  "), 9);
  assert.equal(countWords("Öğrenciler sınava çalışıyor."), 3);
  assert.equal(countWords(""), 0);
});

test("validateWritingInput trims, normalises line endings and rejects bad input", () => {
  assert.deepEqual(validateWritingInput({ kind: "NOPE", taskPrompt: "x".repeat(20), answer: "one two three four" }), { ok: false, error: "Bir görev türü seç." });
  assert.equal(validateWritingInput({ kind: "IELTS_TASK2", taskPrompt: "short", answer: "one two three four five" }).ok, false);
  assert.equal(validateWritingInput({ kind: "IELTS_TASK2", taskPrompt: "Some people think...", answer: "x".repeat(6001) }).ok, false);
  const ok = validateWritingInput({ kind: "IELTS_TASK2", taskPrompt: "  Some people think that...\r\n ", answer: "I agree with this view.\r\nFirstly," });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.input.taskPrompt, "Some people think that...");
    assert.equal(ok.input.answer, "I agree with this view.\nFirstly,");
  }
});

test("monthly allowance grows with the plan; staff are unlimited", () => {
  assert.equal(monthlyAllowance(null, false), 3);
  assert.equal(monthlyAllowance("BASLANGIC", false), 10);
  assert.equal(monthlyAllowance("CIRAK", false), 30);
  assert.equal(monthlyAllowance("UZMAN", false), 60);
  assert.equal(monthlyAllowance(null, true), Number.POSITIVE_INFINITY);
  assert.equal(monthStart(new Date("2026-10-31T23:59:00Z")).toISOString(), "2026-10-01T00:00:00.000Z");
});

test("parseFeedbackResult clamps scores onto the task scale and rejects malformed output", () => {
  const raw = {
    overallScore: 9.8,
    summary: "İyi.",
    criteria: [{ name: "Task Response", score: 6.3, comment: "x" }],
    mistakes: Array.from({ length: 15 }, () => ({ original: "a", correction: "b", explanation: "c", category: "grammar" })),
    improvedVersion: "Better text.",
    tips: ["1", "2", "3", "4", "5"],
  };
  const r = parseFeedbackResult("IELTS_TASK2", raw);
  assert.equal(r.overallScore, 9);
  assert.equal(r.criteria[0].score, 6.5);
  assert.equal(r.mistakes.length, 12);
  assert.equal(r.tips.length, 4);
  assert.equal(parseFeedbackResult("PTE_ESSAY", { ...raw, overallScore: 3, criteria: [] }).overallScore, 10);
  assert.throws(() => parseFeedbackResult("IELTS_TASK2", { overallScore: "7" }));
});

test("every kind has a scale, criteria and a prompt that guards against instructions in the text", () => {
  for (const key of WRITING_KIND_KEYS) {
    const kind = WRITING_FEEDBACK_KINDS[key];
    assert.ok(kind.criteria.length >= 3, key);
    assert.ok(kind.scale.max > kind.scale.min, key);
    const system = buildFeedbackSystemPrompt(key);
    for (const c of kind.criteria) assert.ok(system.includes(c), `${key} names ${c}`);
    assert.match(system, /never instructions to you/);
    assert.match(system, /submit_feedback/);
  }
  const msg = buildFeedbackUserMessage({ kind: "IELTS_TASK2", taskPrompt: "Q?", answer: "I think so too." });
  assert.equal(msg, '<task>\nQ?\n</task>\n\n<answer words="4">\nI think so too.\n</answer>');
});

test("the feedback tool schema is valid for strict tool use", () => {
  const check = (schema: Record<string, unknown>, path: string) => {
    if (schema.type === "object") {
      assert.equal(schema.additionalProperties, false, `${path} additionalProperties`);
      const props = Object.keys(schema.properties as object);
      assert.deepEqual([...(schema.required as string[])].sort(), props.sort(), `${path} requires every property`);
      for (const [k, v] of Object.entries(schema.properties as Record<string, Record<string, unknown>>)) check(v, `${path}.${k}`);
    }
    if (schema.type === "array") check(schema.items as Record<string, unknown>, `${path}[]`);
  };
  assert.equal(FEEDBACK_TOOL.strict, true);
  check(FEEDBACK_TOOL.input_schema as unknown as Record<string, unknown>, "input");
});

test("cost: a long essay reserves well under one US cent; the cap reads from the environment", () => {
  const system = buildFeedbackSystemPrompt("IELTS_TASK2");
  const user = buildFeedbackUserMessage({ kind: "IELTS_TASK2", taskPrompt: "x".repeat(3000), answer: "word ".repeat(1200) });
  const usd = reserveUsd(system, user);
  assert.ok(usd > 0 && usd < 0.01, String(usd));
  assert.equal(monthlyCapUsd({}), 25);
  assert.equal(monthlyCapUsd({ WRITING_AI_MONTHLY_USD: "0" }), 0);
  assert.equal(monthlyCapUsd({ WRITING_AI_MONTHLY_USD: "40" }), 40);
  assert.equal(monthlyCapUsd({ WRITING_AI_MONTHLY_USD: "abc" }), 25);
});
