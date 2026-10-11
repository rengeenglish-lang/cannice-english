import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { computeStreak, earnedBadges, leaderboardName, weekStartKey, weeklyPoints } from "../lib/engagement";
import { renderCertificateHtml, linkedInAddUrl } from "../lib/certificates/render";
import { syncCertificates, certificatePdf } from "../server/services/certificates.service";
import { syncEngagement, weeklyLeaderboard } from "../server/services/engagement.service";
import { applyReferral, getOrCreateReferralCode, rewardReferrer } from "../server/services/referrals.service";
import { validateCouponForOrder } from "../server/services/coupons.service";
import { markOrderPaid } from "../server/services/orders.service";
import { vapidKeys, savePushSubscription, pushToUser } from "../server/push/web-push";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
process.env.AUTH_SECRET ??= "test-secret-test-secret-test-secret-123";
after(() => db.$disconnect());

const makeUser = (name = "Ayşe Yılmaz") => db.user.create({ data: { email: `eng-${randomUUID()}@example.test`, name, role: "STUDENT" } });

test("streaks: today or yesterday keeps a run alive; best run is remembered", () => {
  assert.deepEqual(computeStreak(["2026-10-09", "2026-10-10", "2026-10-11"], "2026-10-11"), { current: 3, best: 3 });
  assert.deepEqual(computeStreak(["2026-10-09", "2026-10-10"], "2026-10-11"), { current: 2, best: 2 }, "today not studied yet");
  assert.deepEqual(computeStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-09"], "2026-10-11"), { current: 0, best: 4 });
  assert.deepEqual(computeStreak(["2026-10-31", "2026-11-01"], "2026-11-01"), { current: 2, best: 2 }, "across a month boundary");
});

test("weeks start Monday in Istanbul; names on the board are opt-in", () => {
  assert.equal(weekStartKey(new Date("2026-10-11T12:00:00Z")), "2026-10-05"); // a Sunday
  assert.equal(weekStartKey(new Date("2026-10-11T21:30:00Z")), "2026-10-12"); // already Monday 00:30 in Istanbul
  assert.equal(leaderboardName("Ayşe Nur Yılmaz", true), "Ayşe Y.");
  assert.equal(leaderboardName("ali içten", true), "ali İ.");
  assert.equal(leaderboardName("Ayşe Yılmaz", false), "Netfener öğrencisi");
  assert.equal(weeklyPoints({ tasks: 2, lessons: 3, tests: 1, mistakes: 4, vocab: 10 }), 20 + 15 + 20 + 8 + 10);
  assert.deepEqual(earnedBadges({ bestStreak: 7, tasksDone: 1, lessonsDone: 10, vocabMastered: 0, mistakesMastered: 0, testsDone: 0, certificates: 0 }), ["first-task", "streak-3", "streak-7", "lessons-10"]);
});

test("certificate HTML and LinkedIn link carry the right details", () => {
  const view = { code: "ABCDEFGH23", recipientName: "<b>Ali</b>", title: "YDS Konu Anlatımı", lessonCount: 12, issuedAt: new Date("2026-10-11T10:00:00Z"), verifyUrl: "https://netfener.com/sertifika/ABCDEFGH23" };
  const html = renderCertificateHtml(view);
  assert.ok(html.includes("&lt;b&gt;Ali") && html.includes("12 dersin") && html.includes("ABCDEFGH23"));
  const li = new URL(linkedInAddUrl(view));
  assert.equal(li.searchParams.get("certId"), "ABCDEFGH23");
  assert.equal(li.searchParams.get("organizationName"), "Netfener");
});

test("finishing every lesson of an exam's track issues one certificate, badges and leaderboard points", async () => {
  const user = await makeUser();
  const exam = await db.examType.findFirst({ where: { topics: { some: { lessons: { some: {} } } } }, select: { slug: true, topics: { select: { lessons: { select: { id: true } } } } } });
  assert.ok(exam, "test database has Konu Anlatımı lessons");
  const lessonIds = exam.topics.flatMap((t) => t.lessons.map((l) => l.id));
  try {
    assert.deepEqual(await syncCertificates(user.id), []);
    await db.topicLessonProgress.createMany({ data: lessonIds.map((topicLessonId) => ({ userId: user.id, topicLessonId, completedAt: new Date() })) });
    const issued = await syncCertificates(user.id);
    assert.equal(issued.filter((c) => c.refKey === exam.slug).length, 1);
    assert.deepEqual(await syncCertificates(user.id), [], "issued once");
    const cert = issued.find((c) => c.refKey === exam.slug)!;
    const pdf = await certificatePdf(cert.code);
    assert.ok(pdf && Buffer.from(pdf.pdf.slice(0, 5)).toString() === "%PDF-");
    assert.equal(await certificatePdf("NOTACODE00"), null);
    assert.equal((await db.notification.findMany({ where: { userId: user.id, title: "Sertifikan hazır!" } })).length, 1);

    const { streak, earned } = await syncEngagement(user.id);
    assert.equal(streak.current, 1);
    assert.ok(earned.has("certificate"));
    if (lessonIds.length >= 10) assert.ok(earned.has("lessons-10"));
    assert.equal((await db.notification.findMany({ where: { userId: user.id, dedupeKey: "badges" } })).length, 1, "badges share one running notification");

    const board = await weeklyLeaderboard();
    const me = board.find((r) => r.userId === user.id);
    assert.ok(me && me.points === lessonIds.length * 5 && me.name === "Netfener öğrencisi");
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});

test("referrals: friend gets a personal welcome coupon; inviter is rewarded once on the friend's first paid order", async () => {
  const inviter = await makeUser("Davet Eden");
  const friend = await makeUser("Yeni Arkadaş");
  const stranger = await makeUser("Başka Biri");
  const product = await db.product.create({ data: { slug: `ref-${randomUUID()}`, title: "Ref ürün", category: "BOOK", basePrice: 100, salePrice: 100 } });
  const orderIds: string[] = [];
  try {
    const code = await getOrCreateReferralCode(inviter.id);
    assert.match(code, /^[A-Z2-9]{8}$/);
    assert.equal(await getOrCreateReferralCode(inviter.id), code, "stable");
    assert.equal(await applyReferral(inviter.id, code), null, "no self-referral");
    const welcome = await applyReferral(friend.id, code);
    assert.ok(welcome && welcome.ownerUserId === friend.id && Number(welcome.value) === 15);
    assert.equal(await applyReferral(friend.id, code), null, "linked once");

    assert.equal((await validateCouponForOrder(welcome.code, 100, stranger.id)).ok, false, "personal coupons belong to one account");
    assert.equal((await validateCouponForOrder(welcome.code, 100, null)).ok, false);
    const ok = await validateCouponForOrder(welcome.code, 100, friend.id);
    assert.ok(ok.ok && ok.discount === 15);

    const mk = async () => {
      const o = await db.order.create({ data: { userId: friend.id, status: "AWAITING_PAYMENT", subtotal: 100, total: 100, items: { create: [{ productId: product.id, titleSnapshot: "Ref ürün", unitPrice: 100, quantity: 1, lineTotal: 100 }] }, payment: { create: { provider: "MANUAL", amount: 100 } } } });
      orderIds.push(o.id);
      return o;
    };
    await markOrderPaid((await mk()).id);
    await markOrderPaid((await mk()).id);
    const rewards = await db.coupon.findMany({ where: { ownerUserId: inviter.id } });
    assert.equal(rewards.length, 1, "rewarded once, on the first paid order");
    assert.equal(await rewardReferrer(orderIds[0]), null);
  } finally {
    await db.invoice.deleteMany({ where: { orderId: { in: orderIds } } });
    await db.order.deleteMany({ where: { id: { in: orderIds } } });
    await db.coupon.deleteMany({ where: { ownerUserId: { in: [inviter.id, friend.id] } } });
    await db.product.delete({ where: { id: product.id } });
    await db.user.deleteMany({ where: { id: { in: [friend.id, stranger.id, inviter.id] } } });
  }
});

test("push: one VAPID key pair is created and reused; users without devices get nothing", async () => {
  const user = await makeUser();
  try {
    const a = await vapidKeys();
    const b = await vapidKeys();
    assert.ok(a && b && a.publicKey === b.publicKey && a.privateKey === b.privateKey);
    assert.equal(await pushToUser(user.id, { title: "x" }), 0);
    await savePushSubscription(user.id, { endpoint: `https://push.example.test/${randomUUID()}`, keys: { p256dh: "p".repeat(20), auth: "a".repeat(16) } }, null);
    assert.equal(await db.pushSubscription.count({ where: { userId: user.id } }), 1);
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});
