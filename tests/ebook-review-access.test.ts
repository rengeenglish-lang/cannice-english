import { after, afterEach, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { claimEbookDownload, canDownloadEbookPdf, canReadEbookOnline } from "../server/services/ebooks.service";
import { getEbookPromotionState } from "../server/services/ebook-review-reward.service";
import { submitSiteReview, setReviewPromotion, listPublishedSiteReviews } from "../server/services/site-reviews.service";
import { consumeBookSigninToken, sendWelcomeVerification } from "../server/services/account-email.service";
import { rememberEbook } from "../server/services/ebook-library.service";
import { NETFENER_EBOOKS } from "../lib/netfener-ebooks";
import { ebookFromNextPath, ebookLibraryHref } from "../lib/ebook-library";
import { hashToken, newToken } from "../lib/auth/tokens";

const target = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(target.hostname) || !target.pathname.endsWith("_test")) throw new Error("Requires an isolated localhost *_test database");
const users: string[] = [];
const originalFetch = globalThis.fetch;
const outbox: { text: string; subject: string }[] = [];
const activeUntil = "2099-12-31T23:59:59+03:00";
before(async () => {
  process.env.EBOOK_FREE_PROMO_ENDS_AT = activeUntil;
  process.env.RESEND_API_KEY = "re_isolated_test";
  process.env.EMAIL_FROM = "Netfener <test@example.test>";
  await setReviewPromotion(false);
  globalThis.fetch = (async (_input, init) => { outbox.push(JSON.parse(String(init?.body))); return Response.json({ id: "isolated-email" }); }) as typeof fetch;
});
afterEach(() => { process.env.EBOOK_FREE_PROMO_ENDS_AT = activeUntil; });
after(async () => {
  globalThis.fetch = originalFetch;
  await db.order.deleteMany({ where: { userId: { in: users } } });
  await db.user.deleteMany({ where: { id: { in: users } } });
  await db.$disconnect();
});
async function account(verified = true) {
  const user = await db.user.create({ data: { name: "Kitap Testi", email: `ebook-${randomUUID()}@example.test`, emailVerifiedAt: verified ? new Date() : null } });
  users.push(user.id); return user;
}
const reviewInput = (rating: number) => ({ kind: "TEXT" as const, rating, displayName: "Kitap T.", body: "Örnek sayfaları ve ilk kitabı inceledim. Bazı açıklamalar yararlıydı, daha fazla çözümlü örnek görmek isterim." });

test("first PDF is atomic across concurrent requests; repeat downloads do not consume another book", async () => {
  const user = await account();
  const a = NETFENER_EBOOKS[0].slug, b = NETFENER_EBOOKS[5].slug;
  assert.equal(await canDownloadEbookPdf(undefined, a), false);
  assert.equal(await canReadEbookOnline(undefined, a), false);
  assert.equal(await canDownloadEbookPdf(user.id, a), false, "GET does not reserve a book");
  const results = await Promise.all([claimEbookDownload(user.id, a), claimEbookDownload(user.id, b)]);
  assert.equal(results.filter(Boolean).length, 1);
  const state = await getEbookPromotionState(user.id);
  const first = state.firstBookSlug!;
  const other = first === a ? b : a;
  assert.equal(await claimEbookDownload(user.id, first), true);
  assert.equal(await canDownloadEbookPdf(user.id, first), true);
  assert.equal(await claimEbookDownload(user.id, other), false);
  assert.equal(await canDownloadEbookPdf(user.id, other), false);
  assert.equal(await canReadEbookOnline(user.id, other), true, "verified members may read online");
  assert.equal(await claimEbookDownload(user.id, "../../secret"), false);
});

test("an honest one-star pending review immediately unlocks books and exactly one seven-day trial", async () => {
  const user = await account();
  await claimEbookDownload(user.id, NETFENER_EBOOKS[0].slug);
  const paid = await db.planSubscription.create({ data: { userId: user.id, tier: "UZMAN", startsAt: new Date(), expiresAt: new Date(Date.now() + 30 * 86400000) } });
  const [first, second] = await Promise.all([submitSiteReview(user, reviewInput(1)), submitSiteReview(user, reviewInput(5))]);
  assert.equal(first.review.status, "PENDING");
  assert.equal(second.review.status, "PENDING");
  const state = await getEbookPromotionState(user.id);
  assert.equal(state.reviewUnlocked, true);
  for (const book of NETFENER_EBOOKS) assert.equal(await canDownloadEbookPdf(user.id, book.slug), true);
  const trials = await db.planSubscription.findMany({ where: { userId: user.id, tier: "CIRAK" } });
  assert.equal(trials.length, 1);
  assert.equal(trials[0].expiresAt.getTime() - trials[0].startsAt.getTime(), 7 * 86400000);
  assert.equal(trials[0].orderItemId, null);
  assert.equal((await db.planSubscription.findUniqueOrThrow({ where: { id: paid.id } })).expiresAt.getTime(), paid.expiresAt.getTime());
  await submitSiteReview(user, reviewInput(2));
  assert.equal(await db.planSubscription.count({ where: { userId: user.id, tier: "CIRAK" } }), 1);
  const rewarded = await db.ebookPromotionAccess.findUniqueOrThrow({ where: { userId: user.id } });
  await db.siteReview.update({ where: { id: rewarded.reviewId! }, data: { status: "APPROVED" } });
  const publicReview = (await listPublishedSiteReviews()).find(item => item.id === rewarded.reviewId)!;
  assert.equal(publicReview.ebookRewarded, true);
  assert.equal("ebookPromotionAccess" in publicReview, false);
});

test("unverified accounts and expired campaigns cannot bypass the free-book gate", async () => {
  const user = await account(false);
  const slug = NETFENER_EBOOKS[0].slug;
  assert.equal(await claimEbookDownload(user.id, slug), false);
  assert.equal(await canReadEbookOnline(user.id, slug), false);
  await submitSiteReview(user, reviewInput(1));
  assert.equal((await getEbookPromotionState(user.id)).reviewUnlocked, false);
  assert.equal(await db.planSubscription.count({ where: { userId: user.id } }), 0);
  await db.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  assert.equal((await getEbookPromotionState(user.id)).reviewUnlocked, true, "the existing review counts after email confirmation");
  process.env.EBOOK_FREE_PROMO_ENDS_AT = "2000-01-01T00:00:00Z";
  assert.equal(await canDownloadEbookPdf(user.id, slug), false);
  assert.equal(await canReadEbookOnline(user.id, slug), false);
  const other = await account();
  await submitSiteReview(other, reviewInput(5));
  assert.equal(await db.planSubscription.count({ where: { userId: other.id } }), 0);
});

test("paid PDF purchases keep working and do not consume a promotional first book", async () => {
  const user = await account(false);
  const slug = NETFENER_EBOOKS[10].slug;
  const product = await db.product.upsert({ where: { slug }, update: {}, create: { slug, title: "Test PDF", category: "BOOK", basePrice: 100, salePrice: 100 } });
  await db.order.create({ data: { userId: user.id, status: "PAID", subtotal: 100, total: 100, items: { create: { productId: product.id, titleSnapshot: product.title, unitPrice: 100, lineTotal: 100 } } } });
  process.env.EBOOK_FREE_PROMO_ENDS_AT = "2000-01-01T00:00:00Z";
  assert.equal(await claimEbookDownload(user.id, slug), true);
  assert.equal(await canDownloadEbookPdf(user.id, slug), true);
  assert.equal(await canReadEbookOnline(user.id, slug), true);
  assert.equal(await db.ebookPromotionAccess.findUnique({ where: { userId: user.id } }), null);
});

test("chosen books survive signup; emailed sign-in links are short-lived, purpose-bound and single-use", async () => {
  const user = await account(false), book = NETFENER_EBOOKS[5];
  await rememberEbook(user.id, book.slug); await rememberEbook(user.id, book.slug);
  assert.equal(await db.userEbookSelection.count({ where: { userId: user.id } }), 1);
  assert.equal(ebookFromNextPath(ebookLibraryHref(book.slug))?.slug, book.slug);
  assert.equal(ebookFromNextPath("//evil.test/dashboard/books?book=" + book.slug), undefined);
  assert.equal(ebookFromNextPath("https://evil.test/dashboard/books?book=" + book.slug), undefined);
  await sendWelcomeVerification(user, book);
  const message = outbox.at(-1)!;
  assert(message.subject.includes(book.title));
  assert(message.text.includes("30 dakika"));
  const token = message.text.match(/kitap-dogrulama\?t=([\w-]{43})/)![1];
  const row = await db.authToken.findUniqueOrThrow({ where: { tokenHash: hashToken(token) } });
  assert.equal(row.kind, "BOOK_SIGNIN");
  assert(row.expiresAt.getTime() - Date.now() <= 30 * 60000);
  const results = await Promise.all([consumeBookSigninToken(token), consumeBookSigninToken(token)]);
  assert.equal(results.filter(Boolean).length, 1);
  assert((await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt);
  assert.equal(await consumeBookSigninToken(token), null);
  for (const kind of ["EMAIL_VERIFY", "BOOK_SIGNIN"] as const) {
    const invalid = newToken();
    await db.authToken.create({ data: { userId: user.id, kind, tokenHash: hashToken(invalid), expiresAt: new Date(kind === "EMAIL_VERIFY" ? Date.now() + 60000 : Date.now() - 1) } });
    assert.equal(await consumeBookSigninToken(invalid), null);
  }
});
