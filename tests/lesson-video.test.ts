import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { db } from "../server/db";
import { isAcceptableVideoField, lessonVideoSrc } from "../lib/lesson-video";
import { lessonVideoPlaybackUrl } from "../server/services/lesson-video.service";
import { presignUpload } from "../server/storage/r2";

// R2 settings are read when used, and signing is offline: fake credentials yield (never used) URLs.
Object.assign(process.env, { R2_ACCOUNT_ID: "testaccount", R2_ACCESS_KEY_ID: "AKIATEST", R2_SECRET_ACCESS_KEY: "secret", R2_LESSONS_BUCKET: "netfener-lessons", R2_REVIEWS_BUCKET: "netfener-reviews" });

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

test("stored videos get the access-checked route; external URLs pass through; admin field validation", () => {
  assert.equal(lessonVideoSrc("konu", "abc", "r2:konu/abc/1.mp4"), "/api/lesson-video/konu/abc");
  assert.equal(lessonVideoSrc("ders", "abc", "https://cdn.example/v.mp4"), "https://cdn.example/v.mp4");
  assert.equal(lessonVideoSrc("ders", "abc", null), null);
  assert.ok(isAcceptableVideoField("") && isAcceptableVideoField("r2:ders/x/1.mp4") && isAcceptableVideoField("https://youtu.be/x"));
  assert.equal(isAcceptableVideoField("javascript:alert(1)"), false);
});

test("signed R2 URLs are scoped to the bucket and expire", async () => {
  const u = new URL(await presignUpload("reviews", "reviews/u1/a b.mp4", "video/mp4", 600));
  assert.equal(u.host, "testaccount.r2.cloudflarestorage.com");
  assert.equal(u.pathname, "/netfener-reviews/reviews/u1/a%20b.mp4");
  assert.equal(u.searchParams.get("X-Amz-Expires"), "600");
  assert.ok(u.searchParams.get("X-Amz-Signature"));
  assert.match(u.searchParams.get("X-Amz-SignedHeaders") ?? "", /content-type/);
});

test("who may watch: free first topic for everyone, other topics for plans/staff, course lessons for previews and enrolled students", async () => {
  const exam = await db.examType.findFirstOrThrow({ select: { id: true } });
  const student = await db.user.create({ data: { email: `lv-${randomUUID()}@example.test`, name: "Öğrenci", role: "STUDENT" } });
  const teacher = await db.user.create({ data: { email: `lv-${randomUUID()}@example.test`, name: "Hoca", role: "TEACHER" } });
  const first = await db.examTopic.create({ data: { examTypeId: exam.id, name: "Önce", slug: `lv-a-${randomUUID()}`, displayOrder: -100000 } });
  const second = await db.examTopic.create({ data: { examTypeId: exam.id, name: "Sonra", slug: `lv-b-${randomUUID()}`, displayOrder: -99999 } });
  const freeLesson = await db.topicLesson.create({ data: { topicId: first.id, title: "Ücretsiz", videoUrl: "r2:konu/x/1.mp4" } });
  const paidLesson = await db.topicLesson.create({ data: { topicId: second.id, title: "Planlı", videoUrl: "r2:konu/y/1.mp4" } });
  const external = await db.topicLesson.create({ data: { topicId: second.id, title: "YouTube", videoUrl: "https://youtu.be/x" } });
  const product = await db.product.create({ data: { slug: `lv-${randomUUID()}`, title: "Kurs", category: "STUDY_PACKAGE", basePrice: 100, salePrice: 100, course: { create: { modules: { create: { title: "M", position: 0 } } } } }, include: { course: { include: { modules: true } } } });
  const moduleId = product.course!.modules[0].id;
  const preview = await db.recordedLesson.create({ data: { moduleId, title: "Örnek", position: 0, isPreviewable: true, videoUrl: "r2:ders/p/1.mp4" } });
  const locked = await db.recordedLesson.create({ data: { moduleId, title: "Kapalı", position: 1, videoUrl: "r2:ders/l/1.mp4" } });
  const viewer = { id: student.id, role: "STUDENT" };
  try {
    assert.match((await lessonVideoPlaybackUrl("konu", freeLesson.id, null))!, /konu\/x\/1\.mp4/, "first topic is free, even signed out");
    assert.equal(await lessonVideoPlaybackUrl("konu", paidLesson.id, viewer), null, "no plan");
    assert.ok(await lessonVideoPlaybackUrl("konu", paidLesson.id, { id: teacher.id, role: "TEACHER" }), "staff");
    assert.equal(await lessonVideoPlaybackUrl("konu", external.id, null), null, "external links are not proxied");
    assert.ok(await lessonVideoPlaybackUrl("ders", preview.id, null), "sample lesson");
    assert.equal(await lessonVideoPlaybackUrl("ders", locked.id, viewer), null, "not enrolled");
    await db.enrollment.create({ data: { userId: student.id, courseId: product.course!.id, status: "ACTIVE" } });
    const signed = new URL((await lessonVideoPlaybackUrl("ders", locked.id, viewer))!);
    assert.equal(signed.searchParams.get("X-Amz-Expires"), String(4 * 60 * 60));
  } finally {
    await db.enrollment.deleteMany({ where: { userId: student.id } });
    await db.product.delete({ where: { id: product.id } });
    await db.examTopic.deleteMany({ where: { id: { in: [first.id, second.id] } } });
    await db.user.deleteMany({ where: { id: { in: [student.id, teacher.id] } } });
  }
});
