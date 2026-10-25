import { test } from "node:test";
import assert from "node:assert/strict";
import { complete, dictionaryStats, search, suggest, wordOfTheDay } from "../lib/dictionary";
import { editDistance, fold, headwordKey, lemmaCandidates, termSlug, slugToQuery, turkishTerms } from "../lib/dictionary/text";
import { A1 } from "../content/vocabulary/a1";
import { A2 } from "../content/vocabulary/a2";
import { B1 } from "../content/vocabulary/b1";
import { B2 } from "../content/vocabulary/b2";
import { C1 } from "../content/vocabulary/c1";
import { CORE_WORDS } from "../content/dictionary/core";
import { DOMAIN_GLOSSARY } from "../content/dictionary/domains";
import { EXTENDED_WORDS } from "../content/dictionary/extended";
import { ACADEMIC_WORDS } from "../content/dictionary/academic";
import { UNITS } from "../content/phrasal-verbs";
import { parseWiktionaryResult } from "../lib/dictionary/wiktionary";

test("the index is built from Netfener's own content", () => {
  const s = dictionaryStats();
  assert.ok(s.entries > 6500, `entries ${s.entries}`);
  assert.ok(s.turkishTerms > 4000, `tr terms ${s.turkishTerms}`);
});

test("dictionary expansion adds 100 headwords without repeating existing words", () => {
  const normalized = (word: string) => headwordKey(word).replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const existing = new Set([
    ...A1, ...A2, ...B1, ...B2, ...C1, ...CORE_WORDS,
  ].map(([word]) => normalized(word)));
  for (const [, word] of DOMAIN_GLOSSARY) existing.add(normalized(word));
  for (const unit of UNITS) for (const verb of unit.verbs) existing.add(normalized(verb.pv));

  assert.equal(EXTENDED_WORDS.length, 100);
  const added = EXTENDED_WORDS.map(([word]) => normalized(word));
  assert.equal(new Set(added).size, added.length, "expansion contains duplicate headwords");
  assert.deepEqual(added.filter((word) => existing.has(word)), [], "expansion repeats an existing headword");
});

test("academic batch adds headwords without repeating existing words", () => {
  const normalized = (word: string) => headwordKey(word).replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const existing = new Set([
    ...A1, ...A2, ...B1, ...B2, ...C1, ...CORE_WORDS, ...EXTENDED_WORDS,
  ].map(([word]) => normalized(word)));
  for (const [, word] of DOMAIN_GLOSSARY) existing.add(normalized(word));
  for (const unit of UNITS) for (const verb of unit.verbs) existing.add(normalized(verb.pv));

  const added = ACADEMIC_WORDS.map(([word]) => normalized(word));
  assert.equal(new Set(added).size, added.length, "academic batch contains duplicate headwords");
  assert.deepEqual(added.filter((word) => existing.has(word)), [], "academic batch repeats an existing headword");
  assert.ok(ACADEMIC_WORDS.every(([, , tr, en, trEx]) => tr && en && trEx), "every entry has a meaning and an example pair");
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
  assert.equal(complete("teş")[0].lang, "tr", "Turkish letters put Turkish terms first");
  assert.ok(complete("teş").some((c) => c.term.startsWith("teşhis")));
  assert.equal(complete("tes")[0].lang, "en");
  assert.equal(editDistance("kitten", "sitting", 3), 3);
});

test("slugs round-trip and word of the day is stable", () => {
  assert.equal(slugToQuery(termSlug("Take Off")), "take off");
  assert.equal(slugToQuery(encodeURIComponent(termSlug("öğrenci"))), "öğrenci");
  assert.equal(wordOfTheDay("2026-10-12").id, wordOfTheDay("2026-10-12").id);
});

test("licensed Wiktionary API responses are parsed defensively", () => {
  const result = parseWiktionaryResult({
    word: "serendipity",
    entries: [{
      partOfSpeech: "noun",
      pronunciations: [{ type: "ipa", text: "/test/" }, { type: "audio", text: "ignored" }],
      forms: [{ word: "serendipities", tags: ["plural"] }],
      senses: [{ definition: "A fortunate accidental discovery.", examples: ["A useful example."], synonyms: ["chance"], antonyms: [] }],
    }],
    source: { url: "https://en.wiktionary.org/wiki/serendipity" },
  });
  assert.equal(result?.entries[0].senses[0].definition, "A fortunate accidental discovery.");
  assert.deepEqual(result?.entries[0].pronunciations, ["/test/"]);
  assert.equal(parseWiktionaryResult({ word: "empty", entries: [] }), null);
});
