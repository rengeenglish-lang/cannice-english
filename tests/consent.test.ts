import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { parseCookieConsent, serializeCookieConsent, COOKIE_CONSENT_VERSION } from "../lib/consent";
import { recordTermsAcceptance, setMarketingConsents } from "../server/services/consent.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

test("cookie consent round-trips, and anything unknown or outdated counts as not chosen", () => {
  const raw = serializeCookieConsent({ functional: true, analytics: false, marketing: false }, new Date("2026-10-11T00:00:00Z"));
  assert.deepEqual(parseCookieConsent(raw), { v: COOKIE_CONSENT_VERSION, at: "2026-10-11T00:00:00.000Z", functional: true, analytics: false, marketing: false });
  assert.equal(parseCookieConsent(""), null);
  assert.equal(parseCookieConsent("not-json"), null);
  assert.equal(parseCookieConsent(encodeURIComponent(JSON.stringify({ v: 0, functional: true }))), null, "an older version asks again");
  assert.equal(parseCookieConsent(encodeURIComponent(JSON.stringify({ v: COOKIE_CONSENT_VERSION, functional: "yes" })))?.functional, false, "only a real true counts");
});

test("terms acceptance and each marketing channel are logged; only changes are logged later", async () => {
  const user = await db.user.create({ data: { email: `consent-${randomUUID()}@example.test`, name: "Rıza Test", role: "STUDENT" } });
  try {
    await recordTermsAcceptance(user.id, "REGISTER");
    await setMarketingConsents(user.id, { marketingEmail: true, marketingSms: false, marketingPhone: false }, "REGISTER");
    let row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    assert.ok(row.termsAcceptedAt && row.marketingEmail && !row.marketingSms);
    let logs = await db.consentLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    assert.deepEqual(logs.map((l) => `${l.kind}:${l.granted}`), ["TERMS:true", "MARKETING_EMAIL:true"]);

    assert.equal(await setMarketingConsents(user.id, { marketingEmail: true, marketingSms: false, marketingPhone: false }, "PROFILE"), 0, "no change, no log");
    assert.equal(await setMarketingConsents(user.id, { marketingEmail: false, marketingSms: true, marketingPhone: false }, "PROFILE"), 2);
    row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    assert.ok(!row.marketingEmail && row.marketingSms);
    logs = await db.consentLog.findMany({ where: { userId: user.id, source: "PROFILE" } });
    assert.deepEqual(logs.map((l) => `${l.kind}:${l.granted}`).sort(), ["MARKETING_EMAIL:false", "MARKETING_SMS:true"]);
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});
