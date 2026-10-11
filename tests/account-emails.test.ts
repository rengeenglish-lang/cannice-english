import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { verifyPassword, hashPassword } from "../server/auth/password";
import { hashToken, newToken, isTokenShaped, cartUnsubscribeToken, verifyCartUnsubscribeToken } from "../lib/auth/tokens";
import { renderOrderAwaitingTransferEmail, renderPasswordResetEmail } from "../lib/email/templates";
import { isResetTokenValid, requestPasswordReset, resendVerification, resetPassword, verifyEmailToken } from "../server/services/account-email.service";
import { sendOrderAwaitingTransfer, sendOrderPaid, runTransactionalEmailCron } from "../server/services/transactional-email.service";
import { markOrderPaid } from "../server/services/orders.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");

// Resend is replaced by a recorder: every email the code sends lands in `outbox`.
const outbox: { to: string; subject: string; text: string; tags?: { value: string }[] }[] = [];
const realFetch = globalThis.fetch;
before(() => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.EMAIL_FROM = "Netfener <bildirim@netfener.com>";
  process.env.AUTH_SECRET ??= "test-secret-test-secret-test-secret-123";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).startsWith("https://api.resend.com/")) {
      const body = JSON.parse(String(init?.body));
      outbox.push({ to: body.to[0], subject: body.subject, text: body.text, tags: body.tags });
      return new Response(JSON.stringify({ id: `email_${outbox.length}` }), { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;
});
after(async () => {
  globalThis.fetch = realFetch;
  await db.$disconnect();
});

const sentTo = (email: string) => outbox.filter((m) => m.to === email);

async function makeUser(extra: Record<string, unknown> = {}) {
  const email = `acct-${randomUUID()}@example.test`;
  return db.user.create({ data: { email, name: "Ayşe Yılmaz", password: await hashPassword("old-password-1"), role: "STUDENT", ...extra } });
}

async function plantToken(userId: string, kind: "PASSWORD_RESET" | "EMAIL_VERIFY", ttlMs = 60_000) {
  const token = newToken();
  await db.authToken.create({ data: { userId, kind, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + ttlMs) } });
  return token;
}

test("tokens: shape check, hashing and the cart opt-out signature", () => {
  const token = newToken();
  assert.ok(isTokenShaped(token));
  assert.ok(!isTokenShaped("short") && !isTokenShaped(undefined) && !isTokenShaped(`${token}x`));
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), token);
  const signed = cartUnsubscribeToken("user_1", "secret");
  assert.equal(verifyCartUnsubscribeToken(signed, "secret"), "user_1");
  assert.equal(verifyCartUnsubscribeToken(signed, "other"), null);
  assert.equal(verifyCartUnsubscribeToken(signed.replace(/.$/, "A"), "secret"), null);
});

test("templates escape names and carry the links", () => {
  const reset = renderPasswordResetEmail({ name: "<b>Ali</b> Veli", resetUrl: "https://netfener.com/sifre-sifirla?t=abc", siteUrl: "https://netfener.com" });
  assert.ok(reset.html.includes("&lt;b&gt;Ali&lt;/b&gt;") && !reset.html.includes("<b>Ali</b>"));
  assert.ok(reset.text.includes("https://netfener.com/sifre-sifirla?t=abc"));
  const order = renderOrderAwaitingTransferEmail({
    order: { id: "cmabcdefgh12345678", name: "Ali", items: [{ title: "YDS Paket", quantity: 1, lineTotal: 499 }], total: 499 },
    paymentUrl: "https://netfener.com/checkout/received?order=x",
    siteUrl: "https://netfener.com",
  });
  assert.ok(order.text.includes("TR50 0011 1000 0000 0168 5407 94"));
  assert.ok(order.subject.includes("#12345678"));
  assert.ok(!order.text.includes("Can Nice"), "the recipient name stays off emails, as on the page");
});

test("password reset: emailed, single use, expires, rate limited, and verifies the address", async () => {
  const user = await makeUser();
  try {
    await requestPasswordReset(`  ${user.email.toUpperCase()} `);
    assert.equal(sentTo(user.email).length, 1);
    assert.match(sentTo(user.email)[0].text, /\/sifre-sifirla\?t=[A-Za-z0-9_-]{43}/);
    // Unknown addresses look the same from outside and send nothing.
    await requestPasswordReset(`nobody-${randomUUID()}@example.test`);

    const token = await plantToken(user.id, "PASSWORD_RESET");
    assert.ok(await isResetTokenValid(token));
    assert.ok(await resetPassword(token, "new-password-2"));
    const after1 = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    assert.ok(await verifyPassword("new-password-2", after1.password!));
    assert.ok(after1.emailVerifiedAt, "reaching the reset link proves the address");
    assert.equal(await resetPassword(token, "third-password-3"), false, "a link works once");
    assert.equal(await isResetTokenValid(token), false);

    const expired = await plantToken(user.id, "PASSWORD_RESET", -1000);
    assert.equal(await resetPassword(expired, "x-password-4"), false);
    const wrongKind = await plantToken(user.id, "EMAIL_VERIFY");
    assert.equal(await resetPassword(wrongKind, "x-password-5"), false);

    // At most three reset emails an hour (one request + three planted tokens already count).
    const before = sentTo(user.email).length;
    await requestPasswordReset(user.email);
    assert.equal(sentTo(user.email).length, before);
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});

test("email verification: link verifies once; resend respects state", async () => {
  const user = await makeUser();
  try {
    assert.equal(await resendVerification(user.id), "sent");
    const token = await plantToken(user.id, "EMAIL_VERIFY");
    assert.ok(await verifyEmailToken(token));
    assert.ok((await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt);
    assert.equal(await verifyEmailToken(token), false);
    assert.equal(await resendVerification(user.id), "verified");
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});

test("order emails: havale instructions once, paid confirmation once (guests too)", async () => {
  const user = await makeUser();
  const product = await db.product.create({ data: { slug: `mail-${randomUUID()}`, title: "Test e-kitap", category: "BOOK", basePrice: 499, salePrice: 499 } });
  const guestEmail = `guest-${randomUUID()}@example.test`;
  const mk = (data: Record<string, unknown>, provider: string) =>
    db.order.create({
      data: {
        status: "AWAITING_PAYMENT",
        subtotal: 499,
        total: 499,
        ...data,
        items: { create: [{ productId: product.id, titleSnapshot: "Test e-kitap", unitPrice: 499, quantity: 1, lineTotal: 499 }] },
        payment: { create: { provider, amount: 499 } },
      },
    });
  const havale = await mk({ userId: user.id }, "MANUAL");
  const card = await mk({ guestEmail, guestName: "Misafir" }, "PAYPAL");
  try {
    assert.ok(await sendOrderAwaitingTransfer(havale.id));
    assert.equal(await sendOrderAwaitingTransfer(havale.id), false, "sent once");
    assert.equal(await sendOrderAwaitingTransfer(card.id), false, "card orders get no transfer instructions");
    assert.match(sentTo(user.email)[0].subject, /havale bilgileri/);

    await markOrderPaid(havale.id);
    await markOrderPaid(havale.id); // a second approval click
    const paid = sentTo(user.email).filter((m) => /onaylandı/.test(m.subject));
    assert.equal(paid.length, 1);
    assert.ok(paid[0].text.includes(`/orders/${havale.id}/receipt`));

    await markOrderPaid(card.id);
    assert.equal(sentTo(guestEmail).filter((m) => /Ödemen alındı/.test(m.subject)).length, 1);
    assert.equal(await sendOrderPaid(card.id), false);
  } finally {
    await db.order.deleteMany({ where: { id: { in: [havale.id, card.id] } } });
    await db.emailLog.deleteMany({ where: { key: { in: [`order-awaiting:${havale.id}`, `order-paid:${havale.id}`, `order-paid:${card.id}`] } } });
    await db.product.delete({ where: { id: product.id } });
    await db.user.delete({ where: { id: user.id } });
  }
});

test("cron: lesson reminders per window and abandoned-cart reminder with opt-out", async () => {
  const enrolled = await makeUser();
  const booked = await makeUser();
  const outsider = await makeUser();
  const shopper = await makeUser();
  const optedOut = await makeUser({ cartReminderOptOut: true });
  const product = await db.product.create({
    data: { slug: `mail-group-${randomUUID()}`, title: "YDS Grup", category: "PREP_GROUP", basePrice: 0, salePrice: 0, course: { create: { deliveryFormat: "LIVE_ONLY" } } },
    include: { course: true },
  });
  const courseId = product.course!.id;
  const now = new Date();
  const H = 60 * 60 * 1000;
  try {
    await db.enrollment.create({ data: { userId: enrolled.id, courseId, status: "ACTIVE" } });
    const tomorrow = await db.liveSession.create({ data: { courseId, title: "Okuma", startsAt: new Date(now.getTime() + 20 * H), endsAt: new Date(now.getTime() + 21 * H), meetingUrl: "https://meet.example/a" } });
    const soon = await db.liveSession.create({ data: { courseId, title: "Gramer", startsAt: new Date(now.getTime() + H), endsAt: new Date(now.getTime() + 2 * H), meetingUrl: "https://meet.example/b" } });
    await db.liveSession.create({ data: { courseId, title: "Arada", startsAt: new Date(now.getTime() + 6 * H), endsAt: new Date(now.getTime() + 7 * H) } });
    await db.liveSession.create({ data: { courseId, title: "İptal", startsAt: new Date(now.getTime() + H), endsAt: new Date(now.getTime() + 2 * H), cancelled: true } });
    await db.groupLessonEnrollment.create({ data: { slotId: soon.id, studentId: booked.id } });

    const old = new Date(now.getTime() - 5 * H);
    for (const u of [shopper, optedOut]) {
      await db.cart.create({ data: { userId: u.id, updatedAt: old, items: { create: [{ productId: product.id, unitPriceSnapshot: 499, createdAt: old }] } } });
    }

    await runTransactionalEmailCron(now);
    await runTransactionalEmailCron(now); // overlapping run: nothing doubles

    const subjects = (email: string) => sentTo(email).map((m) => m.subject).sort();
    assert.deepEqual(subjects(enrolled.email), ["Dersin birazdan başlıyor: Gramer", "Yarın dersin var: Okuma"]);
    assert.deepEqual(subjects(booked.email), ["Dersin birazdan başlıyor: Gramer"]);
    assert.ok(sentTo(enrolled.email).find((m) => m.subject.startsWith("Dersin birazdan"))!.text.includes("https://meet.example/b"));
    assert.ok(!sentTo(enrolled.email).find((m) => m.subject.startsWith("Yarın"))!.text.includes("https://meet.example/a"), "the join link waits for the last reminder");
    assert.deepEqual(subjects(outsider.email), []);
    assert.deepEqual(subjects(shopper.email), ["Sepetinde seni bekleyenler var"]);
    assert.deepEqual(subjects(optedOut.email), []);
    void tomorrow;
  } finally {
    const ids = [enrolled, booked, outsider, shopper, optedOut].map((u) => u.id);
    await db.groupLessonEnrollment.deleteMany({ where: { studentId: { in: ids } } });
    await db.liveSession.deleteMany({ where: { courseId } });
    await db.enrollment.deleteMany({ where: { courseId } });
    await db.cart.deleteMany({ where: { userId: { in: ids } } });
    await db.emailLog.deleteMany({ where: { to: { in: [enrolled, booked, outsider, shopper, optedOut].map((u) => u.email) } } });
    await db.product.delete({ where: { id: product.id } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
});

test("Google sign-in verifies the address and keeps a verified account's password", async () => {
  const { resolveGoogleUser } = await import("../server/auth/google");
  const verified = await makeUser({ emailVerifiedAt: new Date() });
  const unverified = await makeUser();
  try {
    const a = await resolveGoogleUser({ email: verified.email, emailVerified: true });
    assert.ok(a.ok && !a.passwordCleared);
    assert.ok((await db.user.findUniqueOrThrow({ where: { id: verified.id } })).password);
    const b = await resolveGoogleUser({ email: unverified.email, emailVerified: true });
    assert.ok(b.ok && b.passwordCleared);
    const after2 = await db.user.findUniqueOrThrow({ where: { id: unverified.id } });
    assert.equal(after2.password, null);
    assert.ok(after2.emailVerifiedAt);
  } finally {
    await db.user.deleteMany({ where: { id: { in: [verified.id, unverified.id] } } });
  }
});
