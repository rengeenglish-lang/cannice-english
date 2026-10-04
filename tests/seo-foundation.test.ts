import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { DEFAULT_SEO_SETTINGS, seoSettingsSchema } from "../lib/seo/settings";
import {
  internalUrl,
  extractInternalLinks,
  contentHash,
} from "../lib/seo/inventory";
import { SEO_ROUTES } from "../lib/seo/routes";
import {
  parseProviderOutput,
  metadataSchema,
  intentSchema,
} from "../lib/seo/providers";
import { SEO_PROMPTS, promptFor, type SeoOperation } from "../lib/seo/prompts";
import { getSeoProvider } from "../server/seo/provider";

test("phase 1 defaults fail closed and cannot enable full automatic publishing", () => {
  assert.equal(seoSettingsSchema.parse(DEFAULT_SEO_SETTINGS).mode, "ASSISTED");
  for (const patch of [
    { mode: "FULL_AUTOPILOT" },
    { paused: false },
    { monthlyBudgetUsd: -1 },
    { weeklyArticleLimit: 0 },
    { apiKey: "never-store-keys" },
    { targetMarkets: ["invalid"] },
    { languageCode: "not a locale" },
    { provider: "OPENAI", model: "" },
  ]) {
    assert.equal(
      seoSettingsSchema.safeParse({ ...DEFAULT_SEO_SETTINGS, ...patch })
        .success,
      false,
    );
  }
  assert.throws(
    () => getSeoProvider(DEFAULT_SEO_SETTINGS),
    /henüz etkin değil/,
  );
});
test("internal links normalize only same-origin URLs and never fetch untrusted input", () => {
  const origin = "https://netfener.com";
  assert.equal(
    internalUrl("/konu-anlatim?topic=reading&exam=ielts#first", origin),
    "/konu-anlatim?exam=ielts&topic=reading",
  );
  for (const value of [
    "javascript:alert(1)",
    "//evil.example",
    "https://evil.example/x",
    "data:text/html,hi",
    "/\\evil.example",
    "https://user:pass@netfener.com/x",
  ])
    assert.equal(internalUrl(value, origin), null);
  assert.deepEqual(
    extractInternalLinks(
      '[Test](/tools/dictionary) <a href="https://netfener.com/blog/test">Read</a> [Bad](https://evil.example)',
      origin,
    ),
    [
      { url: "/tools/dictionary", anchor: "Test" },
      { url: "/blog/test", anchor: "Read" },
    ],
  );
  assert.notEqual(contentHash("before"), contentHash("after"));
});
test("curated inventory routes exist in repository and are unique", () => {
  assert.equal(new Set(SEO_ROUTES.map((r) => r[0])).size, SEO_ROUTES.length);
  for (const route of SEO_ROUTES) assert.ok(existsSync(route[3]), route[3]);
});
test("provider results require typed schemas and versioned grounding prompts", () => {
  assert.equal(parseProviderOutput(intentSchema, "PRACTICE"), "PRACTICE");
  assert.throws(() => parseProviderOutput(intentSchema, "MADE_UP"));
  assert.throws(() =>
    parseProviderOutput(metadataSchema, {
      title: "X",
      description: "Y",
      canonicalPath: "javascript:alert(1)",
      ogTitle: "X",
      ogDescription: "Y",
    }),
  );
  for (const name of Object.keys(SEO_PROMPTS) as SeoOperation[]) {
    const prompt = promptFor(name);
    assert.ok(prompt.version);
    assert.match(prompt.system, /untrusted source data/);
    assert.match(prompt.system, /Never invent/);
  }
});
