import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import {
  emptyBrief,
  briefIssues,
  inspectDraft,
  manualPrompt,
  DEFAULT_BRAND,
  type DraftContent,
  BRAND_KEY,
} from "../lib/seo/studio";
import {
  createSeoDraft,
  saveSeoBrief,
  saveSeoDraftContent,
  reviewSeoDraft,
  getSeoDraft,
  getSeoStudio,
  saveSeoBrand,
} from "../server/services/seo/studio.service";
import {
  updateBlogPost,
  deleteBlogPost,
  getBlogPost,
  listBlogPostsForAdmin,
} from "../server/services/admin-blog.service";
const url = new URL(process.env.DATABASE_URL!);
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  !url.pathname.endsWith("_test")
)
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());
const starter = emptyBrief({
  keyword: "YDS reading",
  languageCode: "en",
  market: "TR",
  intent: "INFORMATIONAL",
});
const brief = {
  ...starter,
  reader: "YDS students",
  problem: "Reading unfamiliar passages",
  goal: "Identify the main argument",
  outline: "Read the question\nCompare evidence",
  differentiation: "Explain answers using a short original example",
  sources: "Editor will verify examples against official exam guidance",
  minWords: 100,
  maxWords: 300,
};
const content = Array.from(
  { length: 4 },
  (_, i) =>
    `Section ${i + 1}\n` +
    Array.from({ length: 30 }, (_, j) => `practice${i}word${j}`).join(" "),
).join("\n\n");
const post: DraftContent = {
  title: "YDS reading strategies",
  slug: "yds-reading-strategies",
  excerpt: "A practical introduction to careful reading.",
  content,
  seoTitle: "YDS reading strategies for students",
  seoDescription:
    "Learn to identify the main argument, compare evidence and review your answers with a practical reading checklist.",
};
test("manual briefs, grounded prompt and deterministic editorial checks", () => {
  assert.ok(briefIssues(starter).length);
  assert.deepEqual(briefIssues(brief), []);
  assert.ok(
    manualPrompt(brief, DEFAULT_BRAND, null).includes(
      "verifiedCatalogueDestination",
    ),
  );
  assert.equal(
    inspectDraft(post, brief).checks.every((c) => !c.critical || c.passed),
    true,
  );
  const unsafe = inspectDraft(
    {
      ...post,
      content: content + "\n\n<script>alert(1)</script>\n\n[KAYNAK GEREKLİ]",
    },
    brief,
  );
  assert.equal(unsafe.checks.find((c) => c.id === "markup")?.passed, false);
  assert.equal(
    unsafe.checks.find((c) => c.id === "placeholders")?.passed,
    false,
  );
  assert.equal(
    inspectDraft(
      { ...post, content: content + "\n\n" + content },
      brief,
    ).checks.find((c) => c.id === "repeat")?.passed,
    false,
  );
  assert.equal(
    inspectDraft(
      { ...post, seoTitle: "", seoDescription: "" },
      brief,
    ).checks.find((c) => c.id === "title")?.passed,
    false,
  );
});
test("manual studio isolation, revisions, review invalidation, slug uniqueness and no publishing", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({
    data: {
      name: "Studio test",
      email: `studio-${stamp}@example.test`,
      role: "ADMIN",
    },
  });
  const teacher = await db.user.create({
    data: {
      name: "Studio teacher",
      email: `studio-t-${stamp}@example.test`,
      role: "TEACHER",
    },
  });
  const student = await db.user.create({
    data: { name: "Studio student", email: `studio-s-${stamp}@example.test` },
  });
  const keyword = await db.seoKeyword.create({
    data: {
      keyword: "YDS reading",
      normalized: stamp,
      languageCode: "en",
      market: "TR",
      intent: "INFORMATIONAL",
      sourceNote: "Manual test",
    },
  });
  const previousBrand = await db.appSetting.findUnique({
    where: { key: BRAND_KEY },
  });
  let postId: string | undefined;
  try {
    for (const user of [teacher, student]) {
      await assert.rejects(createSeoDraft(user.id, keyword.id), /yönetici/);
      await assert.rejects(getSeoStudio(user.id), /yönetici/);
      await assert.rejects(getSeoDraft(user.id, "anything"), /yönetici/);
      await assert.rejects(saveSeoBrand(user.id, {}), /yönetici/);
      await assert.rejects(saveSeoBrief(user.id, {}), /yönetici/);
      await assert.rejects(saveSeoDraftContent(user.id, {}), /yönetici/);
      await assert.rejects(reviewSeoDraft(user.id, {}), /yönetici/);
    }
    const started = await createSeoDraft(admin.id, keyword.id);
    const id = started.id;
    assert.deepEqual(await createSeoDraft(admin.id, keyword.id), { id });
    let current = (await getSeoDraft(admin.id, id))!;
    postId = current.postId;
    assert.equal(current.stage, "BRIEF");
    assert.equal(current.prompt, null);
    assert.equal(await getBlogPost(postId), null);
    assert.equal(
      (await listBlogPostsForAdmin()).some((p) => p.id === postId),
      false,
    );
    await assert.rejects(updateBlogPost(postId, {}), /stüdyosundan/);
    await assert.rejects(deleteBlogPost(postId), /stüdyosundan/);
    await assert.rejects(
      saveSeoDraftContent(admin.id, {
        id,
        revision: 0,
        postUpdatedAt: current.postUpdatedAt,
        post,
      }),
      /Önce brief/,
    );
    await assert.rejects(
      saveSeoBrief(admin.id, { id, revision: 0, brief: starter, ready: true }),
      /tamamlayın/,
    );
    await assert.rejects(
      saveSeoBrief(admin.id, {
        id,
        revision: 0,
        brief: { ...brief, ctaItemId: "missing", ctaText: "Practice" },
        ready: true,
      }),
      /envanterde/,
    );
    await saveSeoBrief(admin.id, { id, revision: 0, brief, ready: true });
    await assert.rejects(
      saveSeoBrief(admin.id, { id, revision: 0, brief, ready: true }),
      /başka bir/,
    );
    current = (await getSeoDraft(admin.id, id))!;
    assert.ok(current.prompt?.includes("YDS reading"));
    const collision = await db.blogPost.create({
      data: {
        ...post,
        slug: `collision-${stamp}`,
        authorId: admin.id,
        status: "DRAFT",
      },
    });
    await assert.rejects(
      saveSeoDraftContent(admin.id, {
        id,
        revision: current.revision,
        postUpdatedAt: current.postUpdatedAt,
        post: { ...post, slug: collision.slug },
      }),
      /URL/,
    );
    await assert.rejects(
      saveSeoDraftContent(admin.id, {
        id,
        revision: current.revision,
        postUpdatedAt: new Date(0).toISOString(),
        post: { ...post, slug: `studio-${stamp}` },
      }),
      /editörde/,
    );
    await saveSeoDraftContent(admin.id, {
      id,
      revision: current.revision,
      postUpdatedAt: current.postUpdatedAt,
      post: { ...post, slug: `studio-${stamp}` },
    });
    current = (await getSeoDraft(admin.id, id))!;
    await assert.rejects(
      reviewSeoDraft(admin.id, {
        id,
        revision: current.revision,
        postUpdatedAt: current.postUpdatedAt,
        factsChecked: false,
      }),
    );
    await reviewSeoDraft(admin.id, {
      id,
      revision: current.revision,
      postUpdatedAt: current.postUpdatedAt,
      factsChecked: true,
    });
    current = (await getSeoDraft(admin.id, id))!;
    assert.equal(current.stage, "REVIEWED");
    assert.equal(
      (await db.blogPost.findUniqueOrThrow({ where: { id: postId } })).status,
      "DRAFT",
    );
    assert.equal(
      (await db.blogPost.findUniqueOrThrow({ where: { id: postId } }))
        .publishedAt,
      null,
    );
    await saveSeoDraftContent(admin.id, {
      id,
      revision: current.revision,
      postUpdatedAt: current.postUpdatedAt,
      post: {
        ...current.post,
        content: current.post.content + "\n\nRevised explanation.",
      },
    });
    current = (await getSeoDraft(admin.id, id))!;
    assert.equal(current.stage, "DRAFT");
    // Independent edit changes the content hash; review must never carry across.
    await reviewSeoDraft(admin.id, {
      id,
      revision: current.revision,
      postUpdatedAt: current.postUpdatedAt,
      factsChecked: true,
    });
    await db.blogPost.update({
      where: { id: postId },
      data: { seoDescription: "Externally changed" },
    });
    assert.equal((await getSeoDraft(admin.id, id))!.stage, "DRAFT");
    const initialBrand = (await getSeoStudio(admin.id)).brand;
    await saveSeoBrand(admin.id, {
      revision: initialBrand.revision,
      brand: DEFAULT_BRAND,
    });
    await assert.rejects(
      saveSeoBrand(admin.id, {
        revision: initialBrand.revision,
        brand: DEFAULT_BRAND,
      }),
      /değişti/,
    );
    const attempts = await Promise.allSettled([
      saveSeoBrand(admin.id, {
        revision: initialBrand.revision + 1,
        brand: DEFAULT_BRAND,
      }),
      saveSeoBrand(admin.id, {
        revision: initialBrand.revision + 1,
        brand: DEFAULT_BRAND,
      }),
    ]);
    assert.equal(attempts.filter((r) => r.status === "fulfilled").length, 1);
    await db.blogPost.update({
      where: { id: postId },
      data: { status: "PUBLISHED" },
    });
    current = (await getSeoDraft(admin.id, id))!;
    await assert.rejects(
      saveSeoDraftContent(admin.id, {
        id,
        revision: current.revision,
        postUpdatedAt: current.postUpdatedAt,
        post: current.post,
      }),
      /Yayındaki/,
    );
    assert.ok(
      await db.seoActivityLog.count({
        where: { actorId: admin.id, action: "DRAFT_REVIEWED" },
      }),
    );
    await db.user.update({
      where: { id: admin.id },
      data: { isActive: false },
    });
    await assert.rejects(getSeoDraft(admin.id, id), /yönetici/);
  } finally {
    await db.blogPost.deleteMany({ where: { authorId: admin.id } });
    await db.seoKeyword.delete({ where: { id: keyword.id } });
    await db.seoActivityLog.deleteMany({ where: { actorId: admin.id } });
    await db.user.deleteMany({
      where: { id: { in: [admin.id, teacher.id, student.id] } },
    });
    if (previousBrand)
      await db.appSetting.upsert({
        where: { key: BRAND_KEY },
        create: previousBrand,
        update: { value: previousBrand.value },
      });
    else await db.appSetting.deleteMany({ where: { key: BRAND_KEY } });
  }
});
