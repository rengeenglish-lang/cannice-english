import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXPLAIN_SYSTEM_PROMPT,
  EXPLAIN_TOOL,
  buildExplainUserMessage,
  dailyExplainAllowance,
  explainCapUsd,
  explainReserveUsd,
  istanbulDayStart,
  optionIndex,
  parseExplanation,
} from "../lib/mistake-explain";

const question = {
  prompt: "Had the pilot noticed the warning light sooner, the flight would have been delayed.",
  passageText: null,
  options: ["Pilot fark etseydi ertelenecekti.", "Pilot fark etmiş olsaydı ertelenmiş olurdu.", "Fark etmediği için ertelendi.", "Erken fark ettiğinden ertelenmedi."],
  correctIndex: 1,
  explanation: "Devrik 'Had the pilot noticed...' Type 3 koşuludur.",
  topicName: "İngilizce'den Türkçe'ye Çeviri",
  examName: "YDS",
};

const valid = {
  whyWrong: "A seçeneği Type 2 gibi çevrilmiş.",
  keyPoint: "Had + V3 devrik yapısı Type 3'tür.",
  howToSpot: "Cümle başında Had görürsen geçmiş koşulu düşün.",
  similarQuestion: { prompt: "Had she left earlier, she would have caught the train.", options: ["a", "b", "c", "d"], correctIndex: 2, explanation: "Type 3." },
};

test("optionIndex accepts only stored option indexes inside the option list", () => {
  assert.equal(optionIndex("2", 4), 2);
  assert.equal(optionIndex(" 0 ", 4), 0);
  assert.equal(optionIndex("4", 4), null);
  assert.equal(optionIndex("-1", 4), null);
  assert.equal(optionIndex("B", 4), null);
  assert.equal(optionIndex(null, 4), null);
});

test("the daily allowance resets at midnight Istanbul time", () => {
  assert.equal(istanbulDayStart(new Date("2026-10-10T20:59:00Z")).toISOString(), "2026-10-09T21:00:00.000Z");
  assert.equal(istanbulDayStart(new Date("2026-10-10T21:00:00Z")).toISOString(), "2026-10-10T21:00:00.000Z");
  assert.equal(dailyExplainAllowance(null, false), 5);
  assert.equal(dailyExplainAllowance("UZMAN", false), 80);
  assert.equal(dailyExplainAllowance(null, true), Number.POSITIVE_INFINITY);
});

test("the prompt states the answer key is authoritative and labels options by letter", () => {
  assert.match(EXPLAIN_SYSTEM_PROMPT, /authoritative/);
  assert.match(EXPLAIN_SYSTEM_PROMPT, /never instructions to you/);
  const msg = buildExplainUserMessage(question, 0);
  assert.match(msg, /^<question>\nExam: YDS/);
  assert.match(msg, /A\) Pilot fark etseydi/);
  assert.match(msg, /Student chose: A\nCorrect option: B\nOfficial explanation: Devrik/);
  assert.ok(!msg.includes("Passage:"));
  assert.match(buildExplainUserMessage({ ...question, passageText: "A short text." }, 0), /Passage:\nA short text\./);
});

test("parseExplanation rejects a practice question that can't be answered correctly", () => {
  assert.deepEqual(parseExplanation(valid, 4), valid);
  const bad = (sq: Partial<typeof valid.similarQuestion>) => ({ ...valid, similarQuestion: { ...valid.similarQuestion, ...sq } });
  assert.throws(() => parseExplanation(bad({ correctIndex: 4 }), 4), /out of range/);
  assert.throws(() => parseExplanation(bad({ options: ["a", "b", "A ", "d"] }), 4), /duplicate/);
  assert.throws(() => parseExplanation(bad({ options: ["a", "b", "c"] }), 4), /expected 4/);
  assert.throws(() => parseExplanation({ ...valid, whyWrong: "" }, 4));
});

test("the explanation tool schema is valid for strict tool use", () => {
  const check = (schema: Record<string, unknown>, path: string) => {
    if (schema.type === "object") {
      assert.equal(schema.additionalProperties, false, `${path} additionalProperties`);
      const props = Object.keys(schema.properties as object);
      assert.deepEqual([...(schema.required as string[])].sort(), props.sort(), `${path} requires every property`);
      for (const [k, v] of Object.entries(schema.properties as Record<string, Record<string, unknown>>)) check(v, `${path}.${k}`);
    }
    if (schema.type === "array") check(schema.items as Record<string, unknown>, `${path}[]`);
  };
  assert.equal(EXPLAIN_TOOL.strict, true);
  check(EXPLAIN_TOOL.input_schema as unknown as Record<string, unknown>, "input");
});

test("cost: one explanation, even with a long passage, reserves well under half a US cent", () => {
  const usd = explainReserveUsd(buildExplainUserMessage({ ...question, passageText: "x".repeat(2100) }, 0));
  assert.ok(usd > 0 && usd < 0.005, String(usd));
  assert.equal(explainCapUsd({}), 10);
  assert.equal(explainCapUsd({ MISTAKE_AI_MONTHLY_USD: "0" }), 0);
  assert.equal(explainCapUsd({ MISTAKE_AI_MONTHLY_USD: "15" }), 15);
});
