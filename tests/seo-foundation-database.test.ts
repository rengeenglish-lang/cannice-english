import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import {
  getSeoSettings,
  saveSeoSettings,
  pauseSeo,
} from "../server/services/seo/settings.service";
import { refreshSeoInventory } from "../server/services/seo/inventory.service";
import {
  getSeoOverview,
  listSeoInventory,
  listSeoActivity,
} from "../server/services/seo/dashboard.service";
import { SEO_SETTINGS_KEY, DEFAULT_SEO_SETTINGS } from "../lib/seo/settings";
const url = new URL(process.env.DATABASE_URL!);
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  !url.pathname.endsWith("_test")
)
  throw new Error("Requires an isolated local *_test database");
after(async () => db.$disconnect());
test("SEO authorization, settings conflicts, inventory lifecycle, non-destructive refresh and audit", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({
    data: {
      name: "SEO test admin",
      email: `seo-${stamp}@example.test`,
      role: "ADMIN",
    },
  });
  const teacher = await db.user.create({
    data: {
      name: "SEO teacher fixture",
      email: `teacher-${stamp}@example.test`,
      role: "TEACHER",
    },
  });
  const student = await db.user.create({
    data: {
      name: "SEO student fixture",
      email: `student-${stamp}@example.test`,
    },
  });
  for (const actor of [teacher, student]) {
    await assert.rejects(getSeoOverview(actor.id), /yönetici/);
    await assert.rejects(getSeoSettings(actor.id), /yönetici/);
    await assert.rejects(listSeoInventory(actor.id, {}), /yönetici/);
    await assert.rejects(listSeoActivity(actor.id, 1), /yönetici/);
    await assert.rejects(refreshSeoInventory(actor.id), /yönetici/);
    await assert.rejects(
      saveSeoSettings(actor.id, {
        revision: 0,
        settings: DEFAULT_SEO_SETTINGS,
      }),
      /yönetici/,
    );
    await assert.rejects(pauseSeo(actor.id), /yönetici/);
  }
  const initial = await getSeoSettings(admin.id);
  assert.equal(initial.settings.paused, true);
  await assert.rejects(
    saveSeoSettings(admin.id, {
      revision: initial.revision,
      settings: { ...initial.settings, enabledExamIds: ["missing-exam"] },
    }),
    /mevcut etkin/,
  );
  const concurrent = await Promise.allSettled(
    [1, 2].map(() =>
      saveSeoSettings(admin.id, {
        revision: initial.revision,
        settings: initial.settings,
      }),
    ),
  );
  assert.equal(concurrent.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(concurrent.filter((r) => r.status === "rejected").length, 1);
  const saved = await getSeoSettings(admin.id);
  assert.equal(saved.revision, initial.revision + 1);
  await assert.rejects(
    saveSeoSettings(admin.id, {
      revision: initial.revision,
      settings: initial.settings,
    }),
    /başka bir sekmede/,
  );
  const blog = await db.blogPost.create({
    data: {
      authorId: admin.id,
      title: `SEO isolated fixture ${stamp}`,
      slug: `seo-${stamp}`,
      excerpt: "Test content only",
      content: "[Dictionary](/tools/dictionary)",
      status: "PUBLISHED",
    },
  });
  const draft = await db.blogPost.create({
    data: {
      authorId: admin.id,
      title: "SEO draft fixture",
      slug: `draft-${stamp}`,
      excerpt: "Test draft only",
      content: "Never published by SEO inventory",
      status: "DRAFT",
    },
  });
  const product = await db.product.create({
    data: {
      title: "SEO test book",
      slug: `book-${stamp}`,
      category: "BOOK",
      basePrice: 1,
      salePrice: 1,
    },
  });
  const refreshed = await refreshSeoInventory(admin.id);
  assert.ok(refreshed.count >= 3);
  const indexed = await db.seoContentItem.findUniqueOrThrow({
    where: { sourceKey: `BLOG:${blog.id}` },
  });
  assert.deepEqual(indexed.internalLinks, [
    { url: "/tools/dictionary", anchor: "Dictionary" },
  ]);
  assert.equal(
    (
      await db.seoContentItem.findUniqueOrThrow({
        where: { sourceKey: `BLOG:${draft.id}` },
      })
    ).publication,
    "DRAFT",
  );
  assert.deepEqual(
    await db.blogPost.findUniqueOrThrow({ where: { id: blog.id } }),
    blog,
  );
  await assert.rejects(refreshSeoInventory(admin.id), /Çok sık/);
  await db.seoActivityLog.updateMany({
    where: { actorId: admin.id, action: "INVENTORY_REFRESHED" },
    data: { createdAt: new Date(Date.now() - 120000) },
  });
  await db.product.update({
    where: { id: product.id },
    data: { isPublished: false },
  });
  await db.blogPost.update({
    where: { id: blog.id },
    data: { content: "Updated fixture body" },
  });
  await refreshSeoInventory(admin.id);
  const changed = await db.seoContentItem.findUniqueOrThrow({
    where: { sourceKey: `BLOG:${blog.id}` },
  });
  assert.equal(changed.id, indexed.id);
  assert.notEqual(changed.contentHash, indexed.contentHash);
  assert.equal(
    (
      await db.seoContentItem.findUniqueOrThrow({
        where: { sourceKey: `PRODUCT:${product.id}` },
      })
    ).available,
    false,
  );
  const inventory = await listSeoInventory(admin.id, {
    q: `SEO isolated fixture ${stamp}`,
    page: 999,
  });
  assert.equal(inventory.page, 1);
  assert.equal(inventory.items.length, 1);
  assert.equal(
    (await listSeoActivity(admin.id, 1)).items[0].actor?.name,
    admin.name,
  );
  const paused = await pauseSeo(admin.id);
  assert.equal(paused.settings.paused, true);
  assert.ok(
    await db.appSetting.findUnique({ where: { key: SEO_SETTINGS_KEY } }),
  );
  await db.user.update({ where: { id: admin.id }, data: { isActive: false } });
  await assert.rejects(getSeoOverview(admin.id), /yönetici/);
  await assert.rejects(pauseSeo(admin.id), /yönetici/);
});
