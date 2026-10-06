import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { classifyReferrer, looksLikeBot, parseSource, referrerHost, seoValueScore, sourceFor } from "../lib/seo/attribution";
import { getConversionReport, recordArticleView, recordRegistrationAttribution } from "../server/services/seo/conversions.service";
import { POST } from "../app/api/seo/view/route";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

test("source tags, referrer classes and bot detection are strict", () => {
  assert.equal(parseSource("blog.yds-reading"), "yds-reading");
  for (const bad of ["blog.", "blog.A", "blog.a b", "yds", "blog.x/../y", null, 5, "blog.ab"]) assert.equal(parseSource(bad), null, String(bad));
  assert.equal(parseSource(sourceFor("good-slug")), "good-slug");
  assert.equal(classifyReferrer(referrerHost("https://www.google.com.tr/")), "ORGANIC");
  assert.equal(classifyReferrer(referrerHost("https://duckduckgo.com/")), "ORGANIC");
  assert.equal(classifyReferrer(referrerHost("https://t.co/abc")), "OTHER");
  assert.equal(classifyReferrer(referrerHost("https://notgoogle.com/")), "OTHER");
  assert.equal(classifyReferrer(referrerHost("https://evilgoogle.com.attacker.example/")), "OTHER");
  assert.equal(classifyReferrer(referrerHost("not a url")), "OTHER");
  assert.equal(looksLikeBot("Googlebot/2.1"), true);
  assert.equal(looksLikeBot(null), true);
  assert.equal(looksLikeBot("Mozilla/5.0 (iPhone) Safari"), false);
});

test("value score rewards business outcomes over traffic and needs evidence", () => {
  const base = { practiceStarts: 0, purchases: 0, revenueTry: 0, position: null };
  const converting = seoValueScore({ ...base, views: 500, registrations: 30, practiceStarts: 12 })!;
  const traffic = seoValueScore({ ...base, views: 10000, registrations: 0 })!;
  assert.ok(converting > traffic, `${converting} should beat ${traffic}`);
  assert.equal(seoValueScore({ ...base, views: 5, registrations: 0 }), null);
  assert.ok(seoValueScore({ ...base, views: 100, registrations: 5, purchases: 2, revenueTry: 3000 })! > seoValueScore({ ...base, views: 100, registrations: 5 })!);
  const best = seoValueScore({ views: 2000, registrations: 100, practiceStarts: 50, purchases: 5, revenueTry: 9000, position: 1 })!;
  assert.equal(best, 100);
  // Ranking only counts when Search Console data exists; a missing position does not penalize.
  const withRank = seoValueScore({ ...base, views: 500, registrations: 30, position: 18 })!;
  const noRank = seoValueScore({ ...base, views: 500, registrations: 30, position: null })!;
  assert.ok(withRank < noRank);
  for (const v of [converting, traffic, withRank]) assert.ok(v >= 0 && v <= 100);
});

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/seo/view", { method: "POST", body: JSON.stringify(body), headers: { "user-agent": "Mozilla/5.0 Safari", "content-type": "application/json", ...headers } });

test("view counter is aggregate-only, honors privacy signals and ignores bots and non-public posts", async () => {
  const stamp = randomUUID();
  const author = await db.user.create({ data: { name: "View author", email: `view-${stamp}@example.test`, role: "ADMIN" } });
  const live = await db.blogPost.create({ data: { title: "Live", slug: `live-${stamp}`, excerpt: "", content: "", authorId: author.id, status: "PUBLISHED", publishedAt: new Date() } });
  const draft = await db.blogPost.create({ data: { title: "Draft", slug: `draft-${stamp}`, excerpt: "", content: "", authorId: author.id } });
  try {
    assert.equal((await POST(req({ slug: live.slug, ref: "https://www.google.com/" }))).status, 204);
    assert.equal((await POST(req({ slug: live.slug }))).status, 204);
    assert.equal((await POST(req({ slug: live.slug, ref: "https://www.google.com/" }, { "sec-gpc": "1" }))).status, 204);
    assert.equal((await POST(req({ slug: live.slug }, { dnt: "1" }))).status, 204);
    assert.equal((await POST(req({ slug: live.slug }, { "user-agent": "Googlebot/2.1" }))).status, 204);
    assert.equal((await POST(req({ slug: draft.slug }))).status, 204);
    assert.equal((await POST(req({ slug: "../x" }))).status, 400);
    assert.equal((await POST(req({ slug: live.slug, extra: 1 }))).status, 400);
    const rows = await db.seoArticleDay.findMany({ where: { postId: live.id } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].organicViews, 1);
    assert.equal(rows[0].otherViews, 1);
    assert.equal(await db.seoArticleDay.count({ where: { postId: draft.id } }), 0);
    assert.equal(await recordArticleView(draft.slug, undefined), false);
    assert.deepEqual(Object.keys(rows[0]).sort(), ["day", "id", "organicViews", "otherViews", "postId"]);
  } finally {
    await db.blogPost.deleteMany({ where: { authorId: author.id } });
    await db.user.deleteMany({ where: { id: author.id } });
  }
});

test("attribution is first-touch and the report ties registrations, practice and revenue to the article", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Conv admin", email: `conv-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Conv teacher", email: `conv-t-${stamp}@example.test`, role: "TEACHER" } });
  const buyer = await db.user.create({ data: { name: "Buyer", email: `buyer-${stamp}@example.test` } });
  const reader = await db.user.create({ data: { name: "Reader", email: `reader-${stamp}@example.test` } });
  const direct = await db.user.create({ data: { name: "Direct", email: `direct-${stamp}@example.test` } });
  const a = await db.blogPost.create({ data: { title: "Article A", slug: `a-${stamp}`, excerpt: "", content: "", authorId: admin.id, status: "PUBLISHED", publishedAt: new Date() } });
  const b = await db.blogPost.create({ data: { title: "Article B", slug: `b-${stamp}`, excerpt: "", content: "", authorId: admin.id, status: "PUBLISHED", publishedAt: new Date() } });
  const hidden = await db.blogPost.create({ data: { title: "Hidden", slug: `h-${stamp}`, excerpt: "", content: "", authorId: admin.id } });
  try {
    for (let i = 0; i < 40; i++) await recordArticleView(a.slug, i % 2 ? "https://www.google.com/" : undefined);
    for (let i = 0; i < 25; i++) await recordArticleView(b.slug, undefined);
    assert.equal(await recordRegistrationAttribution(buyer.id, sourceFor(a.slug)), true);
    assert.equal(await recordRegistrationAttribution(buyer.id, sourceFor(b.slug)), true); // first touch wins
    assert.equal((await db.seoAttribution.findUniqueOrThrow({ where: { userId: buyer.id } })).slug, a.slug);
    assert.equal(await recordRegistrationAttribution(reader.id, sourceFor(a.slug)), true);
    assert.equal(await recordRegistrationAttribution(direct.id, sourceFor(hidden.slug)), false); // not public
    assert.equal(await recordRegistrationAttribution(direct.id, "blog.nonexistent-slug"), false);
    assert.equal(await recordRegistrationAttribution(direct.id, "garbage"), false);
    assert.equal(await db.seoAttribution.count({ where: { userId: direct.id } }), 0);
    // Activity before the attribution does not count; after does.
    await db.analyticsEvent.create({ data: { userId: buyer.id, event: "practice_started", createdAt: new Date(Date.now() - 3600_000) } });
    await db.analyticsEvent.create({ data: { userId: buyer.id, event: "practice_started" } });
    await db.analyticsEvent.create({ data: { userId: buyer.id, event: "mock_exam_started" } });
    await db.analyticsEvent.create({ data: { userId: buyer.id, event: "results_viewed" } }); // not a start
    await db.order.create({ data: { userId: buyer.id, status: "PAID", subtotal: 1000, total: 1000, currency: "TRY" } });
    await db.order.create({ data: { userId: buyer.id, status: "PENDING", subtotal: 500, total: 500, currency: "TRY" } });
    await db.order.create({ data: { userId: buyer.id, status: "PAID", subtotal: 20, total: 20, currency: "USD" } });
    await db.order.create({ data: { userId: direct.id, status: "PAID", subtotal: 999, total: 999, currency: "TRY" } });
    await assert.rejects(() => getConversionReport(teacher.id, 30));
    const report = await getConversionReport(admin.id, 30);
    const ra = report.items.find((i) => i.postId === a.id)!;
    const rb = report.items.find((i) => i.postId === b.id)!;
    assert.equal(ra.views, 40);
    assert.equal(ra.organicViews, 20);
    assert.equal(ra.registrations, 2);
    assert.equal(ra.practiceStarts, 2);
    assert.equal(ra.purchasers, 1);
    assert.deepEqual(ra.revenue, { TRY: 1000, USD: 20 });
    assert.equal(rb.registrations, 0);
    assert.equal(rb.revenue.TRY, undefined);
    assert.ok(ra.score !== null && rb.score !== null && ra.score > rb.score);
    assert.equal(report.items.some((i) => i.postId === hidden.id), false);
    assert.equal((await getConversionReport(admin.id, "bogus")).days, 30);
    assert.equal((await getConversionReport(admin.id, 7)).days, 7);
    // Deleting the account removes its attribution.
    await db.user.delete({ where: { id: reader.id } });
    assert.equal(await db.seoAttribution.count({ where: { postId: a.id } }), 1);
  } finally {
    await db.order.deleteMany({ where: { userId: { in: [buyer.id, direct.id] } } });
    await db.analyticsEvent.deleteMany({ where: { userId: buyer.id } });
    await db.blogPost.deleteMany({ where: { authorId: admin.id } });
    await db.user.deleteMany({ where: { id: { in: [admin.id, teacher.id, buyer.id, reader.id, direct.id] } } });
  }
});
