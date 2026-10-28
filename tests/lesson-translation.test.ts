import assert from "node:assert/strict";
import { test } from "node:test";
import { chunkForTranslation, parseGoogleTranslateResponse } from "@/lib/lesson-translation";

test("empty lesson text yields no translation chunks", () => {
  assert.deepEqual(chunkForTranslation("   "), []);
});

test("short text stays in one chunk", () => {
  assert.deepEqual(chunkForTranslation("Birinci.\n\nİkinci.", 100), ["Birinci.\n\nİkinci."]);
});

test("paragraphs are packed up to the limit and no chunk exceeds it", () => {
  const paragraphs = ["a".repeat(60), "b".repeat(60), "c".repeat(60)];
  const chunks = chunkForTranslation(paragraphs.join("\n\n"), 130);
  assert.deepEqual(chunks, ["a".repeat(60) + "\n\n" + "b".repeat(60), "c".repeat(60)]);
  for (const chunk of chunks) assert.ok(chunk.length <= 130);
});

test("an over-long paragraph is split on words", () => {
  const text = Array.from({ length: 50 }, (_, i) => `kelime${i}`).join(" ");
  const chunks = chunkForTranslation(text, 80);
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) assert.ok(chunk.length <= 80);
  assert.equal(chunks.join(" ").split(/\s+/).length, 50);
});

test("translated segments from the Google response are joined", () => {
  const payload = [[["Hello ", "Merhaba ", null, null, 1], ["world.", "dünya.", null, null, 1]], null, "tr"];
  assert.equal(parseGoogleTranslateResponse(payload), "Hello world.");
});

test("an unexpected response shape is rejected", () => {
  assert.equal(parseGoogleTranslateResponse({ error: "blocked" }), null);
  assert.equal(parseGoogleTranslateResponse([[]]), null);
});
