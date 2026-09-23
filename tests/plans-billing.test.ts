import { test } from "node:test";
import assert from "node:assert/strict";
import { addMonths, planAllows, minimumTierFor, perkCandidatesForCourse } from "../lib/plans";
import { billingState, nextPaidThrough, RENEWAL_GRACE_MS } from "../lib/billing";
import { cefrFromPercentage } from "../lib/diagnostics/cefr";
import { practiceSectionForTopic } from "../lib/practice-sections";

const d = (iso: string) => new Date(iso);

test("addMonths is a calendar month (30 or 31 days) and clamps to month end", () => {
  assert.equal(addMonths(d("2026-01-15T10:00:00Z"), 1).toISOString(), "2026-02-15T10:00:00.000Z");
  assert.equal(addMonths(d("2026-03-15T10:00:00Z"), 1).getTime() - d("2026-03-15T10:00:00Z").getTime(), 31 * 86400000);
  assert.equal(addMonths(d("2026-04-15T10:00:00Z"), 1).getTime() - d("2026-04-15T10:00:00Z").getTime(), 30 * 86400000);
  assert.equal(addMonths(d("2026-01-31T00:00:00Z"), 1).toISOString(), "2026-02-28T00:00:00.000Z");
  assert.equal(addMonths(d("2026-11-30T00:00:00Z"), 4).toISOString(), "2027-03-30T00:00:00.000Z");
});

test("billing: notice at paidThrough, lock one day later", () => {
  const paid = d("2026-10-01T12:00:00Z");
  assert.equal(billingState(null), "ACTIVE");
  assert.equal(billingState(paid, d("2026-09-30T12:00:00Z")), "ACTIVE");
  assert.equal(billingState(paid, d("2026-10-01T12:00:00Z")), "PAYMENT_DUE");
  assert.equal(billingState(paid, new Date(paid.getTime() + RENEWAL_GRACE_MS - 1)), "PAYMENT_DUE");
  assert.equal(billingState(paid, new Date(paid.getTime() + RENEWAL_GRACE_MS)), "LOCKED");
});

test("renewal continues from paidThrough unless already locked", () => {
  const paid = d("2026-10-01T12:00:00Z");
  assert.equal(nextPaidThrough(null, d("2026-09-10T00:00:00Z")).toISOString(), "2026-10-10T00:00:00.000Z");
  assert.equal(nextPaidThrough(paid, d("2026-09-20T00:00:00Z")).toISOString(), "2026-11-01T12:00:00.000Z");
  assert.equal(nextPaidThrough(paid, d("2026-10-02T00:00:00Z")).toISOString(), "2026-11-01T12:00:00.000Z");
  assert.equal(nextPaidThrough(paid, d("2026-10-20T00:00:00Z")).toISOString(), "2026-11-20T00:00:00.000Z");
});

test("plan features match the plan cards", () => {
  assert.equal(planAllows(null, "KONU_ANLATIMI"), false);
  assert.equal(planAllows("BASLANGIC", "MOCK_EXAMS"), true);
  assert.equal(planAllows("BASLANGIC", "UNLIMITED_MOCK_EXAMS"), false);
  assert.equal(planAllows("BASLANGIC", "PRACTICE_QUESTIONS"), false);
  assert.equal(planAllows("BASLANGIC", "FREE_MATERIALS"), false);
  assert.equal(planAllows("CIRAK", "PRACTICE_QUESTIONS"), true);
  assert.equal(planAllows("CIRAK", "FREE_MATERIALS"), true);
  assert.equal(planAllows("CIRAK", "LIVE_LESSON_PERKS"), false);
  assert.equal(planAllows("UZMAN", "LIVE_LESSON_PERKS"), true);
  assert.equal(minimumTierFor("PRACTICE_QUESTIONS"), "CIRAK");
});

test("Uzman perk candidates prefer the most specific perk", () => {
  assert.deepEqual(perkCandidatesForCourse({ isSpeakingClub: true, category: "PREP_GROUP" }), ["SPEAKING_CLUB", "ELECTIVE_LIVE"]);
  assert.deepEqual(perkCandidatesForCourse({ isSpeakingClub: false, category: "PREP_GROUP" }), ["SYSTEMATIC_LIVE", "ELECTIVE_LIVE"]);
  assert.deepEqual(perkCandidatesForCourse({ isSpeakingClub: false, category: "MOCK_CAMP" }), ["ELECTIVE_LIVE"]);
});

test("CEFR bands and practice sections", () => {
  assert.equal(cefrFromPercentage(0), "A1");
  assert.equal(cefrFromPercentage(45), "B1");
  assert.equal(cefrFromPercentage(75), "C1");
  assert.equal(cefrFromPercentage(100), "C2");
  assert.equal(practiceSectionForTopic({ slug: "zamanlar", parentSlug: "dil-bilgisi" }), "grammar");
  assert.equal(practiceSectionForTopic({ slug: "ceviri-en-tr" }), "reading");
  assert.equal(practiceSectionForTopic({ slug: "ielts-reading-tfng", parentSlug: "ielts-reading" }), "reading");
  assert.equal(practiceSectionForTopic({ slug: "ielts-listening-maps" }), "listening");
});
