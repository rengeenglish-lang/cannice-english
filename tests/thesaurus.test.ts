import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { normaliseThesaurusQuery, wordNetShard } from "../lib/thesaurus/text";

test("thesaurus query normalization and sharding are stable", () => {
  assert.equal(normaliseThesaurusQuery("  Well-Known  "), "well known");
  assert.equal(wordNetShard("happy"), "ha");
  assert.equal(wordNetShard("a"), "a_");
});

test("WordNet index contains broad synonym, antonym, and definition data", () => {
  const root = path.join(process.cwd(), "public", "wordnet");
  const meta = JSON.parse(fs.readFileSync(path.join(root, "meta.json"), "utf8"));
  assert.ok(meta.headwords > 140_000, `${meta.headwords} headwords`);
  assert.ok(meta.senses > 190_000, `${meta.senses} senses`);
  const happy = JSON.parse(fs.readFileSync(path.join(root, "ha.json"), "utf8")).happy;
  assert.ok(happy.some((sense: { d: string }) => sense.d.length > 0));
  assert.ok(happy.some((sense: { s: string[] }) => sense.s.length > 0));
  assert.ok(happy.some((sense: { a?: string[] }) => sense.a?.length));
});
