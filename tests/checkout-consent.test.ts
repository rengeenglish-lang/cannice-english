import assert from "node:assert/strict";
import test from "node:test";
import { consentRequirements, acceptCheckoutConsents, CHECKOUT_CONSENT_VERSION, CHECKOUT_CONSENT_TEXT } from "../lib/checkout-consent";
const now = new Date("2026-09-27T10:00:00Z");
const form = (...fields: string[]) => { const value = new FormData(); value.set("consentVersion", CHECKOUT_CONSENT_VERSION); fields.forEach((field) => value.set(field, "on")); return value; };
test("physical or deferred delivery does not ask for immediate digital consent", () => {
  assert.deepEqual(consentRequirements([{ productId: "physical", immediateDigital: false, liveStartsAt: null }], now), { immediateDigital: false, earlyService: false });
});
test("live consent applies before, but not at or beyond, the 14-day boundary", () => {
  const check = (offset: number) => consentRequirements([{ productId: "live", immediateDigital: false, liveStartsAt: new Date(now.getTime()+offset) }], now).earlyService;
  assert.equal(check(0), true); assert.equal(check(14*86400000-1), true);
  assert.equal(check(14*86400000), false); assert.equal(check(-1), false);
});
test("mixed baskets require both separate consents without assuming all live services are digital content", () => {
  const requirements = consentRequirements([{ productId: "ebook", immediateDigital: true, liveStartsAt: null }, { productId: "lesson", immediateDigital: false, liveStartsAt: new Date("2026-10-01") }], now);
  assert.deepEqual(requirements, { immediateDigital: true, earlyService: true });
  assert.throws(() => acceptCheckoutConsents(requirements, form("agreementConsent"), now), /Dijital/);
  assert.throws(() => acceptCheckoutConsents(requirements, form("agreementConsent", "immediateDigitalConsent"), now), /14 gün/);
  const receipt = acceptCheckoutConsents(requirements, form("agreementConsent", "immediateDigitalConsent", "earlyServiceConsent"), now);
  assert.equal(receipt.acceptedAt, now.toISOString());
  assert.equal(receipt.immediateDigital.text, CHECKOUT_CONSENT_TEXT.immediateDigital);
  assert.equal(receipt.earlyService.accepted, true);
});
test("agreement is mandatory even when conditional consents are unnecessary", () => {
  assert.throws(() => acceptCheckoutConsents({ immediateDigital: false, earlyService: false }, form(), now), /Sözleşme/);
  const invalid = form(); invalid.set("agreementConsent", "true");
  assert.throws(() => acceptCheckoutConsents({ immediateDigital: false, earlyService: false }, invalid, now));
});
test("irrelevant submitted flags are not recorded as meaningful consent", () => {
  const receipt = acceptCheckoutConsents({ immediateDigital: false, earlyService: false }, form("agreementConsent", "immediateDigitalConsent", "earlyServiceConsent"), now);
  assert.equal(receipt.immediateDigital.accepted, false); assert.equal(receipt.earlyService.text, null);
});
test("stale checkout wording is rejected for fresh review", () => {
  const stale = form("agreementConsent"); stale.set("consentVersion", "old");
  assert.throws(() => acceptCheckoutConsents({ immediateDigital: false, earlyService: false }, stale, now), /güncellendi/);
});

test("every consent information link resolves to an existing document and section", async () => {
  const { CONSENT_INFORMATION_LINKS } = await import("../lib/checkout-consent");
  const { LEGAL_DOCS } = await import("../content/legal-terms");
  for (const links of Object.values(CONSENT_INFORMATION_LINKS)) {
    for (const link of links) {
      const [path, anchor] = link.href.split("#");
      const document = LEGAL_DOCS[path.replace("/legal/", "")];
      assert.ok(document, link.href);
      if (anchor) assert.ok(document.sections?.some((section) => section.id === anchor), link.href);
    }
  }
  const receipt = acceptCheckoutConsents({ immediateDigital: true, earlyService: true }, form("agreementConsent", "immediateDigitalConsent", "earlyServiceConsent"), now);
  assert.deepEqual(receipt.earlyService.informationLinks, CONSENT_INFORMATION_LINKS.earlyServiceConsent);
});
