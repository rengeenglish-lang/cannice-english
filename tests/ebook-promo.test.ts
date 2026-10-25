import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ebookFreePromoEndsAt, isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";

const original = process.env.EBOOK_FREE_PROMO_ENDS_AT;
afterEach(() => {
  if (original === undefined) delete process.env.EBOOK_FREE_PROMO_ENDS_AT;
  else process.env.EBOOK_FREE_PROMO_ENDS_AT = original;
});

test("the free e-book promotion runs for a month from launch and then stops", () => {
  delete process.env.EBOOK_FREE_PROMO_ENDS_AT;
  assert.equal(isEbookFreePromoActive(new Date("2026-10-25T12:00:00+03:00")), true);
  assert.equal(isEbookFreePromoActive(new Date("2026-11-25T23:00:00+03:00")), true);
  assert.equal(isEbookFreePromoActive(new Date("2026-11-26T00:00:01+03:00")), false);
});

test("the end date can be overridden and a bad value falls back to the default", () => {
  process.env.EBOOK_FREE_PROMO_ENDS_AT = "2026-12-31T23:59:59+03:00";
  assert.equal(isEbookFreePromoActive(new Date("2026-12-01T00:00:00+03:00")), true);
  process.env.EBOOK_FREE_PROMO_ENDS_AT = "not a date";
  assert.equal(ebookFreePromoEndsAt().toISOString(), new Date("2026-11-25T23:59:59+03:00").toISOString());
});
