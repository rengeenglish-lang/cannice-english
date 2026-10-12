import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { defaultDisplayName, normaliseVideoLink, rewardBlocker, rewardPercentFor, scopedDiscount, youtubeEmbedUrl, TEXT_REWARD_MIN_CHARS } from "../lib/site-reviews";
import { approveSiteReview, createReviewVideoUpload, listPublishedSiteReviews, rejectSiteReview, setReviewPromotion, submitSiteReview } from "../server/services/site-reviews.service";
import { validateCouponForOrder } from "../server/services/coupons.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

const long = "Netfener ile YDS'ye hazırlandım. ".repeat(20);

test("reward rules: 50% for a comprehensive text review, 100% for a video; never for repeats, unverified emails or when the promotion is off", () => {
  assert.equal(rewardPercentFor("TEXT", "kısa ama dürüst bir yorum yazdım burada"), 0);
  assert.equal(rewardPercentFor("TEXT", "x".repeat(TEXT_REWARD_MIN_CHARS)), 50);
  assert.equal(rewardPercentFor("VIDEO", ""), 100);
  const base = { kind: "TEXT" as const, body: long, promotionOn: true, alreadyRewarded: false, emailVerified: true };
  assert.equal(rewardBlocker(base), null);
  assert.match(rewardBlocker({ ...base, promotionOn: false })!, /aktif değil/);
  assert.match(rewardBlocker({ ...base, alreadyRewarded: true })!, /daha önce/);
  assert.match(rewardBlocker({ ...base, emailVerified: false })!, /doğrula/);
});

test("video links, embeds, names and the one-plan discount", () => {
  assert.ok(normaliseVideoLink("https://youtu.be/dQw4w9WgXcQ"));
  assert.ok(normaliseVideoLink("https://www.instagram.com/reel/abc/"));
  assert.equal(normaliseVideoLink("http://youtube.com/watch?v=x"), null, "https only");
  assert.equal(normaliseVideoLink("https://evil.example/video"), null);
  assert.equal(youtubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(youtubeEmbedUrl("https://youtube.com/shorts/dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(youtubeEmbedUrl("https://instagram.com/reel/x"), null);
  assert.equal(defaultDisplayName("ayşe nur yılmaz"), "ayşe Y.");
  const lines = [{ category: "PLAN", unitPrice: 1499 }, { category: "PLAN", unitPrice: 2999 }, { category: "BOOK", unitPrice: 5000 }];
  assert.equal(scopedDiscount(50, lines, "PLAN"), 1499.5, "half of the most expensive plan only — never the book");
  assert.equal(scopedDiscount(100, lines, "PLAN"), 2999);
});

test("submitting, rewarding, coupon scope, moderation and withdrawal", async () => {
  const user = await db.user.create({ data: { email: `rev-${randomUUID()}@example.test`, name: "Yorum Yazan", role: "STUDENT", emailVerifiedAt: new Date() } });
  const other = await db.user.create({ data: { email: `rev-${randomUUID()}@example.test`, name: "Başka", role: "STUDENT", emailVerifiedAt: new Date() } });
  const admin = await db.user.create({ data: { email: `rev-${randomUUID()}@example.test`, name: "Admin", role: "ADMIN" } });
  try {
    await setReviewPromotion(true);
    const text = await submitSiteReview(user, { kind: "TEXT", rating: 4, displayName: "Yorum Y.", body: long });
    assert.equal(text.percent, 50);
    assert.ok(text.coupon && text.coupon.ownerUserId === user.id && text.coupon.appliesTo === "PLAN" && text.coupon.maxRedemptions === 1);
    const again = await submitSiteReview(user, { kind: "TEXT", rating: 5, displayName: "Yorum Y.", body: long });
    assert.equal(again.coupon, null, "one text reward per learner");

    await assert.rejects(submitSiteReview(user, { kind: "VIDEO", rating: 5, displayName: "Yorum Y.", body: "", videoLink: "https://youtu.be/dQw4w9WgXcQ" }), /yayın iznini/);
    await assert.rejects(submitSiteReview(user, { kind: "VIDEO", rating: 5, displayName: "Yorum Y.", body: "", videoLink: "https://evil.example/v", usageConsent: true, confirmsMaxLength: true }), /bağlantısı/);
    await assert.rejects(submitSiteReview(user, { kind: "VIDEO", rating: 5, displayName: "Yorum Y.", body: "", videoLink: "https://youtu.be/dQw4w9WgXcQ", usageConsent: true }), /90 saniye/, "links need the length confirmation");
    const video = await submitSiteReview(user, { kind: "VIDEO", rating: 2, displayName: "Yorum Y.", body: "", videoLink: "https://youtu.be/dQw4w9WgXcQ", usageConsent: true, confirmsMaxLength: true });
    assert.equal(video.percent, 100, "a low rating earns the same reward");
    assert.ok(video.review.usageConsentAt && video.review.usageConsentText);

    const plans = [{ category: "PLAN", unitPrice: 2999, quantity: 1 }, { category: "BOOK", unitPrice: 300, quantity: 1 }];
    const ok = await validateCouponForOrder(video.coupon!.code, 3299, user.id, plans);
    assert.ok(ok.ok && ok.discount === 2999, "100% of the plan, not the book");
    assert.equal((await validateCouponForOrder(video.coupon!.code, 300, user.id, [{ category: "BOOK", unitPrice: 300, quantity: 1 }])).ok, false, "plans only");
    assert.equal((await validateCouponForOrder(video.coupon!.code, 3299, other.id, plans)).ok, false, "personal");

    assert.equal((await listPublishedSiteReviews()).some((r) => r.id === text.review.id), false, "hidden until approved");
    await approveSiteReview(text.review.id, admin.id);
    assert.equal((await listPublishedSiteReviews()).some((r) => r.id === text.review.id), true);

    const { withdrawn } = await rejectSiteReview(video.review.id, admin.id, "Video açılmıyor");
    assert.equal(withdrawn, true);
    assert.equal((await validateCouponForOrder(video.coupon!.code, 3299, user.id, plans)).ok, false, "withdrawn coupon no longer works");
    await approveSiteReview(video.review.id, admin.id);
    assert.equal((await validateCouponForOrder(video.coupon!.code, 3299, user.id, plans)).ok, true, "approval restores an unused reward");

    await setReviewPromotion(false);
    const off = await submitSiteReview(other, { kind: "TEXT", rating: 5, displayName: "B.", body: long });
    assert.equal(off.coupon, null);
    assert.match(off.rewardMessage!, /aktif değil/);
    await assert.rejects(createReviewVideoUpload(user.id, "video/mp4", 1000), /henüz açık değil|Yalnızca/);
  } finally {
    await setReviewPromotion(false);
    const ids = [user.id, other.id];
    const rewards = await db.siteReview.findMany({ where: { userId: { in: ids } }, select: { rewardCouponId: true } });
    await db.siteReview.deleteMany({ where: { userId: { in: ids } } });
    await db.coupon.deleteMany({ where: { id: { in: rewards.flatMap((r) => (r.rewardCouponId ? [r.rewardCouponId] : [])) } } });
    await db.user.deleteMany({ where: { id: { in: [...ids, admin.id] } } });
  }
});
