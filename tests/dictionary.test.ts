import { test } from "node:test";
import assert from "node:assert/strict";
import { complete, dictionaryStats, search, suggest, wordOfTheDay } from "../lib/dictionary";
import { editDistance, fold, lemmaCandidates, termSlug, slugToQuery, turkishTerms } from "../lib/dictionary/text";

test("the index is built from Netfener's own content", () => {
  const s = dictionaryStats();
  assert.ok(s.entries > 6500, `entries ${s.entries}`);
  assert.ok(s.turkishTerms > 4000, `tr terms ${s.turkishTerms}`);
});

test("Turkish meanings split into searchable terms, notes in parentheses dropped", () => {
  assert.deepEqual(turkishTerms("(sorumluluk, iş) üstlenmek; (personel) işe almak"), ["üstlenmek", "işe almak"]);
  assert.equal(fold("Öğrenci Koşmak IŞIK"), "ogrenci kosmak isik");
});

test("English → Turkish with inflected forms and phrasal verbs", () => {
  const take = search("take");
  assert.ok(take.en.length > 0);
  assert.ok(take.phrases.some((e) => e.key === "take on"), "phrases containing the word");
  const went = search("went");
  assert.equal(went.lemma, "go");
  assert.ok(went.en.length > 0);
  assert.ok(search("carry out").en.some((e) => e.category === "PHRASAL"), "object placeholders ignored");
  assert.ok(search("Studies").lemma === "study" || search("studies").en.length > 0);
  assert.ok(lemmaCandidates("running").includes("run"));
  assert.ok(lemmaCandidates("took off").includes("take off"));
});

test("Turkish → English, accent-insensitive, plus meanings containing the word", () => {
  const r = search("üstlenmek");
  assert.ok(r.tr.some((e) => e.key === "take on"));
  assert.ok(search("ustlenmek").tr.length === r.tr.length, "works without Turkish characters");
  assert.ok(search("almak").trPhrases.length > 0);
});

test("field glossaries carry their category", () => {
  assert.ok(search("diagnosis").en.some((e) => e.category === "HEALTH"));
  assert.ok(search("teşhis").tr.some((e) => e.category === "HEALTH"));
});

test("typos get suggestions; autocomplete matches prefixes", () => {
  const r = search("recieve");
  assert.equal(r.en.length, 0);
  assert.ok(r.suggestions.includes("receive"), r.suggestions.join(","));
  assert.ok(suggest("hypotesis").includes("hypothesis"));
  assert.ok(complete("hypo").some((c) => c.term === "hypothesis"));
  assert.ok(complete("öğren").some((c) => c.lang === "tr"));
  assert.equal(editDistance("kitten", "sitting", 3), 3);
});

test("slugs round-trip and word of the day is stable", () => {
  assert.equal(slugToQuery(termSlug("Take Off")), "take off");
  assert.equal(slugToQuery(encodeURIComponent(termSlug("öğrenci"))), "öğrenci");
  assert.equal(wordOfTheDay("2026-10-12").id, wordOfTheDay("2026-10-12").id);
});
