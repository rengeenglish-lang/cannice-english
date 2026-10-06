import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { emptyBrief, type DraftContent } from "../lib/seo/studio";
import {
  TEMP_SLUG_PREFIX,
  buildArticleJsonLd,
  istanbulWindow,
  jsonLdScript,
  publishGate,
  scheduleWindowError,
} from "../lib/seo/publishing";
import {
  createSeoDraft,
  saveSeoBrief,
  saveSeoDraftContent,
  reviewSeoDraft,
  getSeoDraft,
} from "../server/services/seo/studio.service";
import {
  approveSeoDraft,
  cancelSeoSchedule,
  getPublishingState,
  getSeoCalendar,
  publishSeoDraftNow,
  restoreSeoVersion,
  revokeSeoApproval,
  runDueSeoPublications,
  scheduleSeoDraft,
  unpublishSeoDraft,
} from "../server/services/seo/publishing.service";
import { getBlogRedirectSlug } from "../server/services/catalog.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

const brief = {
  ...emptyBrief({ keyword: "YDS reading", languageCode: "en", market: "TR", intent: "INFORMATIONAL" }),
  reader: "YDS students",
  problem: "Reading unfamiliar passages",
  goal: "Identify the main argument",
  outline: "Read the question\nCompare evidence",
  differentiation: "Explain answers using a short original example",
  sources: "Editor verifies examples against official exam guidance",
  minWords: 100,
  maxWords: 300,
};
const body = (tag: string) =>
  Array.from({ length: 4 }, (_, i) =>
    `Section ${i + 1}\n` + Array.from({ length: 30 }, (_, j) => `${tag}${i}word${j}`).join(" "),
  ).join("\n\n");
const article = (slug: string, tag = "alpha"): DraftContent => ({
  title: "YDS reading strategies",
  slug,
  excerpt: "A practical introduction to careful reading.",
  content: body(tag),
  seoTitle: "YDS reading strategies for students",
  seoDescription:
    "Learn to identify the main argument, compare evidence and review your answers with a practical reading checklist.",
});

test("publishing gate, schedule window, Istanbul windows and JSON-LD are deterministic and truthful", () => {
  const post = article("yds-gate");
  const base = {
    post,
    brief,
    minimumQualityScore: 85,
    reviewedCurrent: true,
    approvedCurrent: true,
    slugTaken: false,
    linksValid: true,
    ctaValid: true,
  };
  assert.equal(publishGate(base).ok, true);
  for (const [override, id] of [
    [{ reviewedCurrent: false }, "reviewed"],
    [{ approvedCurrent: false }, "approved"],
    [{ slugTaken: true }, "slug"],
    [{ linksValid: false }, "links"],
    [{ ctaValid: false }, "links"],
    [{ post: { ...post, slug: TEMP_SLUG_PREFIX + "x" } }, "slug"],
    [{ post: { ...post, seoDescription: "" } }, "metadata"],
    [{ post: { ...post, content: post.content + "\n\nTODO" } }, "sections"],
    [{ minimumQualityScore: 101 }, "score"],
  ] as const) {
    const gate = publishGate({ ...base, ...override });
    assert.equal(gate.ok, false, id);
    assert.equal(gate.checks.find((c) => c.id === id)?.passed, false, id);
  }
  const now = new Date("2026-10-07T10:00:00Z");
  assert.ok(scheduleWindowError(new Date("2026-10-07T10:02:00Z"), now));
  assert.equal(scheduleWindowError(new Date("2026-10-07T10:10:00Z"), now), null);
  assert.ok(scheduleWindowError(new Date("2027-02-07T10:00:00Z"), now));
  assert.ok(scheduleWindowError(new Date("nope"), now));
  const day = istanbulWindow(new Date("2026-10-07T22:30:00Z"), "day"); // 01:30 on 8 Oct in Istanbul
  assert.equal(day.start.toISOString(), "2026-10-07T21:00:00.000Z");
  assert.equal(day.end.toISOString(), "2026-10-08T21:00:00.000Z");
  const week = istanbulWindow(new Date("2026-10-07T10:00:00Z"), "week"); // Wednesday
  assert.equal(week.start.toISOString(), "2026-10-04T21:00:00.000Z"); // Monday 5 Oct 00:00 Istanbul
  assert.equal(week.end.toISOString(), "2026-10-11T21:00:00.000Z");
  const ld = buildArticleJsonLd({
    siteUrl: "https://netfener.com/",
    slug: "yds-gate",
    title: "A </script><b> title",
    description: "d",
    imageUrl: "/img/a.png",
    authorName: "Editor",
    publishedAt: new Date("2026-10-07T10:00:00Z"),
    modifiedAt: new Date("2026-10-08T10:00:00Z"),
    languageCode: "tr",
  });
  const graph = ld["@graph"] as { "@type": string; [k: string]: unknown }[];
  assert.deepEqual(graph.map((g) => g["@type"]), ["BlogPosting", "BreadcrumbList"]);
  assert.equal(graph[0].image, "https://netfener.com/img/a.png");
  assert.equal((graph[0].mainEntityOfPage as { "@id": string })["@id"], "https://netfener.com/blog/yds-gate");
  const script = jsonLdScript(ld);
  assert.equal(script.includes("</script>"), false);
  assert.equal(JSON.parse(script)["@graph"][0].headline, "A </script><b> title");
  assert.equal(JSON.stringify(ld).includes("FAQPage"), false);
});

async function fixture() {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Pub admin", email: `pub-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Pub teacher", email: `pub-t-${stamp}@example.test`, role: "TEACHER" } });
  const keyword = await db.seoKeyword.create({
    data: { keyword: "YDS reading " + stamp, normalized: stamp, languageCode: "en", market: "TR", intent: "INFORMATIONAL", sourceNote: "test" },
  });
  const { id } = await createSeoDraft(admin.id, keyword.id);
  const draft = await db.seoArticleDraft.findUniqueOrThrow({ where: { id } });
  return { stamp, admin, teacher, keyword, id, postId: draft.postId };
}
async function toReviewed(f: Awaited<ReturnType<typeof fixture>>, post: DraftContent) {
  let d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
  await saveSeoBrief(f.admin.id, { id: f.id, revision: d.revision, brief, ready: true });
  d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
  await saveSeoDraftContent(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), post });
  d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
  await reviewSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), factsChecked: true });
  return db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
}
async function cleanup(f: Awaited<ReturnType<typeof fixture>>) {
  await db.blogPost.deleteMany({ where: { authorId: f.admin.id } });
  await db.seoKeyword.deleteMany({ where: { id: f.keyword.id } });
  await db.seoActivityLog.deleteMany({ where: { actorId: { in: [f.admin.id, f.teacher.id] } } });
  await db.user.deleteMany({ where: { id: { in: [f.admin.id, f.teacher.id] } } });
}

test("approval, publish, history, restore, unpublish and URL stability", async () => {
  const f = await fixture();
  const slug = "pub-flow-" + f.stamp.slice(0, 8);
  try {
    let d = await toReviewed(f, article(slug));
    // Permissions: teachers and unknown actors cannot touch publishing.
    await assert.rejects(() => approveSeoDraft(f.teacher.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true }));
    await assert.rejects(() => getPublishingState(f.teacher.id, f.id));
    // Publishing without approval is refused by the gate.
    await assert.rejects(() => publishSeoDraftNow(f.admin.id, { id: f.id, revision: d.revision, confirmed: true }), /Yayın kapısı/);
    // The confirmation must be explicit.
    await assert.rejects(() => approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: false }));
    // Stale tabs lose.
    await assert.rejects(() => approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision - 1, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true }), /başka bir sekmede/);
    await approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true });
    assert.equal((await getSeoDraft(f.admin.id, f.id))!.stage, "APPROVED");
    assert.equal((await db.blogPost.findUniqueOrThrow({ where: { id: f.postId } })).status, "DRAFT");

    // Editing after approval voids it.
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await saveSeoDraftContent(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), post: article(slug, "beta") });
    const voided = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id } });
    assert.equal(voided.approvedHash, null);
    assert.equal((await getSeoDraft(f.admin.id, f.id))!.stage, "DRAFT");
    await assert.rejects(() => publishSeoDraftNow(f.admin.id, { id: f.id, revision: voided.revision, confirmed: true }), /Yayın kapısı/);

    // Re-review, approve, schedule validation, then publish now.
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await reviewSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), factsChecked: true });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await assert.rejects(() => scheduleSeoDraft(f.admin.id, { id: f.id, revision: d.revision, scheduledFor: new Date(Date.now() + 60_000).toISOString() }), /en az/);
    await revokeSeoApproval(f.admin.id, { id: f.id, revision: d.revision });
    assert.equal((await getSeoDraft(f.admin.id, f.id))!.stage, "REVIEWED");
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    const out = await publishSeoDraftNow(f.admin.id, { id: f.id, revision: d.revision, confirmed: true });
    assert.equal(out.slug, slug);
    const live = await db.blogPost.findUniqueOrThrow({ where: { id: f.postId } });
    assert.equal(live.status, "PUBLISHED");
    assert.ok(live.publishedAt);
    // Studio and legacy editor cannot modify live content.
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await assert.rejects(() => saveSeoDraftContent(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), post: article(slug, "gamma") }), /Yayındaki/);
    assert.equal((await getSeoCalendar(f.admin.id)).find((r) => r.id === f.id)?.status, "PUBLISHED");

    // Version history recorded edits and the publication; unpublish makes it editable again.
    let state = await getPublishingState(f.admin.id, f.id);
    assert.deepEqual(state!.versions.map((v) => v.reason).reverse(), ["EDIT", "EDIT", "PUBLISHED"]);
    assert.equal(state!.versions[0].editor, "Pub admin");
    await unpublishSeoDraft(f.admin.id, { id: f.id, revision: d.revision, confirmed: true });
    assert.equal((await db.blogPost.findUniqueOrThrow({ where: { id: f.postId } })).status, "DRAFT");
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    assert.equal(d.approvedHash, null);

    // Slug change after publication keeps the old URL resolving; the history can be restored.
    const newSlug = slug + "-v2";
    await saveSeoDraftContent(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), post: article(newSlug, "delta") });
    assert.equal(await getBlogRedirectSlug(slug), null, "redirect only serves published posts");
    await db.blogPost.update({ where: { id: f.postId }, data: { status: "PUBLISHED" } });
    assert.equal(await getBlogRedirectSlug(slug), newSlug);
    await db.blogPost.update({ where: { id: f.postId }, data: { status: "DRAFT" } });
    // Another article's slug cannot be taken.
    const other = await db.blogPost.create({ data: { title: "Other", slug: slug + "-other", excerpt: "", content: "", authorId: f.admin.id } });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    state = await getPublishingState(f.admin.id, f.id);
    const oldest = state!.versions.find((v) => v.reason === "EDIT")!;
    const first = state!.versions[state!.versions.length - 1];
    await assert.rejects(() => saveSeoDraftContent(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), post: article(slug + "-other", "epsilon") }), /kullanılıyor/);
    await db.blogPost.delete({ where: { id: other.id } });
    // Restoring the first version moves the slug back and removes the redirect for the restored slug.
    await restoreSeoVersion(f.admin.id, { id: f.id, revision: d.revision, versionId: first.id, postUpdatedAt: d.post.updatedAt.toISOString() });
    const restored = await db.blogPost.findUniqueOrThrow({ where: { id: f.postId } });
    assert.equal(restored.slug, slug);
    assert.ok(oldest);
    assert.equal(await db.seoSlugRedirect.count({ where: { fromSlug: slug } }), 0);
    assert.equal(await db.seoSlugRedirect.count({ where: { fromSlug: newSlug, postId: f.postId } }), 1);
    state = await getPublishingState(f.admin.id, f.id);
    assert.equal(state!.versions[0].reason, "RESTORED");
    // Versions of other articles are not restorable here.
    const f2 = await fixture();
    try {
      const d2 = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f2.id }, include: { post: true } });
      await assert.rejects(() => restoreSeoVersion(f2.admin.id, { id: f2.id, revision: d2.revision, versionId: first.id, postUpdatedAt: d2.post.updatedAt.toISOString() }), /Sürüm bulunamadı/);
    } finally {
      await cleanup(f2);
    }
  } finally {
    await cleanup(f);
  }
});

test("scheduling limits, cancellation, cron publication, failure parking and approver checks", async () => {
  const f = await fixture();
  const slug = "pub-sched-" + f.stamp.slice(0, 8);
  const original = await db.appSetting.findUnique({ where: { key: "seo_autopilot_v1" } });
  try {
    let d = await toReviewed(f, article(slug));
    await approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    const when = new Date(Date.now() + 3 * 86_400_000);
    await scheduleSeoDraft(f.admin.id, { id: f.id, revision: d.revision, scheduledFor: when.toISOString() });
    assert.equal((await getSeoDraft(f.admin.id, f.id))!.stage, "SCHEDULED");
    // Not due yet: the cron leaves it alone.
    assert.deepEqual((await runDueSeoPublications(new Date())).published, []);
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await cancelSeoSchedule(f.admin.id, { id: f.id, revision: d.revision });
    assert.equal((await getSeoDraft(f.admin.id, f.id))!.stage, "APPROVED");

    // Daily limit: with a limit of 0 nothing can be scheduled.
    await db.appSetting.upsert({
      where: { key: "seo_autopilot_v1" },
      create: { key: "seo_autopilot_v1", value: JSON.stringify({ revision: 1, settings: { mode: "ASSISTED", paused: true, languageCode: "tr-TR", targetMarkets: ["TR"], enabledExamIds: [], provider: "NONE", model: "", monthlyBudgetUsd: 0, dailyArticleLimit: 0, weeklyArticleLimit: 0, minimumQualityScore: 85, minimumRelevanceScore: 80, excludedKeywords: [], excludedTopics: [] } }) },
      update: { value: JSON.stringify({ revision: 1, settings: { mode: "ASSISTED", paused: true, languageCode: "tr-TR", targetMarkets: ["TR"], enabledExamIds: [], provider: "NONE", model: "", monthlyBudgetUsd: 0, dailyArticleLimit: 0, weeklyArticleLimit: 0, minimumQualityScore: 85, minimumRelevanceScore: 80, excludedKeywords: [], excludedTopics: [] } }) },
    });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await assert.rejects(() => scheduleSeoDraft(f.admin.id, { id: f.id, revision: d.revision, scheduledFor: when.toISOString() }), /sınırı/);
    await db.appSetting.update({ where: { key: "seo_autopilot_v1" }, data: { value: JSON.stringify({ revision: 2, settings: { mode: "ASSISTED", paused: true, languageCode: "tr-TR", targetMarkets: ["TR"], enabledExamIds: [], provider: "NONE", model: "", monthlyBudgetUsd: 0, dailyArticleLimit: 5, weeklyArticleLimit: 10, minimumQualityScore: 85, minimumRelevanceScore: 80, excludedKeywords: [], excludedTopics: [] } }) } });
    await scheduleSeoDraft(f.admin.id, { id: f.id, revision: d.revision, scheduledFor: when.toISOString() });

    // The time arrives: cron publishes only after re-running the gate.
    const later = new Date(when.getTime() + 60_000);
    const run = await runDueSeoPublications(later);
    assert.deepEqual(run.published, [slug]);
    const live = await db.blogPost.findUniqueOrThrow({ where: { id: f.postId } });
    assert.equal(live.status, "PUBLISHED");
    assert.equal((await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id } })).scheduledFor, null);
    assert.equal(await db.seoActivityLog.count({ where: { action: "ARTICLE_PUBLISHED", actorId: f.admin.id } }), 1);
    // Running again publishes nothing (idempotent).
    assert.deepEqual((await runDueSeoPublications(later)).published, []);

    // A demoted approver invalidates a due schedule: the article is parked with a visible reason.
    await unpublishSeoDraft(f.admin.id, { id: f.id, revision: (await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id } })).revision, confirmed: true });
    d = await toReviewed(f, article(slug, "zeta"));
    await approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true });
    d = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    await scheduleSeoDraft(f.admin.id, { id: f.id, revision: d.revision, scheduledFor: when.toISOString() });
    await db.user.update({ where: { id: f.admin.id }, data: { isActive: false } });
    const parked = await runDueSeoPublications(later);
    assert.deepEqual(parked.published, []);
    assert.equal(parked.failures.length, 1);
    const row = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id }, include: { post: true } });
    assert.equal(row.scheduledFor, null);
    assert.match(row.scheduleError ?? "", /etkin değil/);
    assert.equal(row.post.status, "DRAFT");
    // Parked schedule cannot be run by hand without an active admin either.
    await assert.rejects(() => publishSeoDraftNow(f.admin.id, { id: f.id, revision: row.revision, confirmed: true }));
  } finally {
    if (original) await db.appSetting.update({ where: { key: "seo_autopilot_v1" }, data: { value: original.value } });
    else await db.appSetting.deleteMany({ where: { key: "seo_autopilot_v1" } });
    await cleanup(f);
  }
});

test("approval fails closed when the slug is claimed by another article's redirect", async () => {
  const f = await fixture();
  const slug = "pub-gate-" + f.stamp.slice(0, 8);
  const other = await db.blogPost.create({ data: { title: "Other", slug: slug + "-o", excerpt: "", content: "", authorId: f.admin.id } });
  try {
    const d = await toReviewed(f, article(slug));
    await db.seoSlugRedirect.create({ data: { fromSlug: slug, postId: other.id } });
    await assert.rejects(
      () => approveSeoDraft(f.admin.id, { id: f.id, revision: d.revision, postUpdatedAt: d.post.updatedAt.toISOString(), confirmed: true }),
      /benzersiz/,
    );
    assert.equal((await db.seoArticleDraft.findUniqueOrThrow({ where: { id: f.id } })).approvedHash, null);
    const state = await getPublishingState(f.admin.id, f.id);
    assert.equal(state!.gate.checks.find((c) => c.id === "slug")?.passed, false);
  } finally {
    await db.blogPost.deleteMany({ where: { id: other.id } });
    await cleanup(f);
  }
});
