import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { exceedsVideoLimit, mp4DurationSeconds } from "../lib/site-reviews";
import { submitSiteReview } from "../server/services/site-reviews.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

// Fake R2: settings are read when used; requests go to the stubbed fetch below, never the network.
Object.assign(process.env, { R2_ACCOUNT_ID: "testaccount", R2_ACCESS_KEY_ID: "AKIATEST", R2_SECRET_ACCESS_KEY: "secret", R2_REVIEWS_BUCKET: "netfener-reviews", R2_LESSONS_BUCKET: "netfener-lessons" });

/** A minimal MP4 "moov/mvhd" box saying the movie lasts `seconds`. */
function mp4(seconds: number, version: 0 | 1 = 0, padding = 64) {
  const size = version === 1 ? 120 : 108;
  const box = new Uint8Array(size);
  const v = new DataView(box.buffer);
  v.setUint32(0, size);
  box.set([0x6d, 0x76, 0x68, 0x64], 4);
  v.setUint8(8, version);
  if (version === 1) {
    v.setUint32(28, 1000);
    v.setBigUint64(32, BigInt(seconds * 1000));
  } else {
    v.setUint32(20, 600);
    v.setUint32(24, seconds * 600);
  }
  const out = new Uint8Array(padding + size);
  out.set(box, padding);
  return out;
}

test("reads the length from the MP4 header (both box versions) and ignores look-alike bytes", () => {
  assert.equal(mp4DurationSeconds(mp4(75)), 75);
  assert.equal(mp4DurationSeconds(mp4(91, 1)), 91);
  assert.equal(mp4DurationSeconds(new TextEncoder().encode("xxxxmvhd and some random video data that is long enough........")), null);
  assert.equal(exceedsVideoLimit(90), false);
  assert.equal(exceedsVideoLimit(90.4), false, "encoder slack");
  assert.equal(exceedsVideoLimit(91), true);
});

test("an uploaded video over 90 seconds is refused and deleted; one within the limit is accepted with its length", async () => {
  const user = await db.user.create({ data: { email: `rv-${randomUUID()}@example.test`, name: "Video", role: "STUDENT", emailVerifiedAt: new Date() } });
  let fileSeconds = 120;
  const deleted: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    if (req.method === "HEAD") return new Response(null, { status: 200, headers: { "content-length": "5000000" } });
    if (req.method === "DELETE") return (deleted.push(new URL(req.url).pathname), new Response(null, { status: 204 }));
    return new Response(mp4(fileSeconds), { status: 206 });
  }) as typeof fetch;
  const key = `reviews/${user.id}/clip.mp4`;
  try {
    await assert.rejects(
      submitSiteReview(user, { kind: "VIDEO", rating: 5, displayName: "V.", body: "", videoKey: key, usageConsent: true }),
      /en fazla 90 saniye/,
    );
    assert.equal(deleted.length, 1, "the over-long file is removed from R2");
    assert.equal(await db.siteReview.count({ where: { userId: user.id } }), 0);
    fileSeconds = 60;
    const ok = await submitSiteReview(user, { kind: "VIDEO", rating: 5, displayName: "V.", body: "", videoKey: key, usageConsent: true, videoSeconds: 999 });
    assert.equal(ok.review.videoSeconds, 60, "the file's own length wins over what the browser reported");
  } finally {
    globalThis.fetch = realFetch;
    const rewards = await db.siteReview.findMany({ where: { userId: user.id }, select: { rewardCouponId: true } });
    await db.siteReview.deleteMany({ where: { userId: user.id } });
    await db.coupon.deleteMany({ where: { id: { in: rewards.flatMap((r) => (r.rewardCouponId ? [r.rewardCouponId] : [])) } } });
    await db.user.delete({ where: { id: user.id } });
  }
});
