import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_NAV_ITEMS, NAV_GROUPS, currentLabel, isActive } from "../lib/seo/nav";
import { SEO_SECTIONS } from "../lib/seo/settings";

test("every SEO section is reachable from exactly one navigation entry", () => {
  const slugs = ALL_NAV_ITEMS.map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const [slug] of SEO_SECTIONS) assert.ok(slugs.includes(slug), `${slug} missing from navigation`);
  assert.ok(slugs.includes("topics"));
  assert.equal(new Set(ALL_NAV_ITEMS.map((i) => i.href)).size, ALL_NAV_ITEMS.length);
  for (const g of NAV_GROUPS) assert.ok(g.items.some((i) => !i.soon), `${g.id} has no usable link`);
  for (const i of ALL_NAV_ITEMS) assert.ok(i.hint.length > 5);
});
test("active-state matching handles nested studio pages without false positives", () => {
  assert.equal(isActive("/admin/seo/studio/abc", "/admin/seo/studio"), true);
  assert.equal(isActive("/admin/seo/studios", "/admin/seo/studio"), false);
  assert.equal(currentLabel("/admin/seo/studio/abc"), "Makale stüdyosu");
  assert.equal(currentLabel("/admin/seo/quick-wins"), "Hızlı kazanımlar");
});

import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { getSeoAttention } from "../server/services/seo/dashboard.service";
test("attention counts reflect article stages and are admin-only", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Nav admin", email: `nav-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Nav teacher", email: `nav-t-${stamp}@example.test`, role: "TEACHER" } });
  const kw = await db.seoKeyword.create({ data: { keyword: "nav " + stamp, normalized: stamp, languageCode: "tr", market: "TR", intent: "INFORMATIONAL", sourceNote: "t" } });
  const post = await db.blogPost.create({ data: { title: "t", slug: "nav-" + stamp, excerpt: "", content: "", authorId: admin.id } });
  try {
    const before = await getSeoAttention(admin.id);
    await db.seoArticleDraft.create({ data: { keywordId: kw.id, postId: post.id, brief: {}, approvedHash: "h", reviewedHash: "h" } });
    const after = await getSeoAttention(admin.id);
    assert.equal(after.studio.approved, before.studio.approved + 1);
    assert.equal(after.studio.needsBrief, before.studio.needsBrief + 1);
    assert.equal(after.studio.reviewed, before.studio.reviewed);
    await assert.rejects(() => getSeoAttention(teacher.id));
  } finally {
    await db.blogPost.deleteMany({ where: { authorId: admin.id } });
    await db.seoKeyword.deleteMany({ where: { id: kw.id } });
    await db.user.deleteMany({ where: { id: { in: [admin.id, teacher.id] } } });
    await db.$disconnect();
  }
});
