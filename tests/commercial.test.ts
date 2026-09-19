import { test } from "node:test";
import assert from "node:assert/strict";
import { launchPrice, addBillingPeriod } from "../lib/commercial";
import { canUseTool, hasCapability, type AccessGrant } from "../lib/entitlements";
import { availability } from "../lib/availability";
const now = new Date("2026-09-19T00:00:00Z");
const grant = (capability: AccessGrant["capability"], extra = {}): AccessGrant => ({ capability, startsAt: new Date("2026-09-01Z"), expiresAt: new Date("2026-10-01Z"), revokedAt: null, ...extra });
test("free content is public; paid tools are denied by default", () => {
 assert.equal(canUseTool("FREE", [], now), true);
 assert.equal(hasCapability("FREE_CONTENT", [], now), true);
 assert.equal(canUseTool("PREMIUM", [], now), false);
});
test("one Premium grant spans ordinary Premium tools but excludes group-only tools", () => {
 const grants = [grant("PREMIUM_SIMULATIONS")];
 assert.equal(canUseTool("PREMIUM", grants, now), true);
 assert.equal(hasCapability("PERFORMANCE_ANALYTICS", grants, now), true);
 assert.equal(canUseTool("GROUP_INCLUDED", grants, now), false);
});
test("group access covers standard tools, not separate products or another group's lesson", () => {
 const grants = [grant("GROUP_FULL_ACCESS")];
 assert.equal(canUseTool("PREMIUM", grants, now), true);
 assert.equal(canUseTool("GROUP_INCLUDED", grants, now), true);
 assert.equal(canUseTool("SEPARATE_PURCHASE", grants, now), false);
 assert.equal(hasCapability("GROUP_LESSONS", grants, now), false);
 assert.equal(hasCapability("HOMEWORK", grants, now), true);
});
test("expiry is exclusive, future and revoked grants deny access", () => {
 for (const extra of [{ expiresAt: now }, { startsAt: new Date("2026-09-20Z") }, { revokedAt: now }]) {
  assert.equal(canUseTool("PREMIUM", [grant("GROUP_FULL_ACCESS", extra)], now), false);
 }
});
test("approved pricing and billing are independent of programme duration", () => {
 assert.equal(launchPrice("PREMIUM", "QUARTERLY"), 119900);
 assert.equal(launchPrice("GROUP", "SIX_MONTH"), 849000);
 assert.throws(() => launchPrice("GROUP", "ANNUAL"));
 assert.equal(addBillingPeriod(new Date("2028-01-31T12:00:00Z"), "MONTHLY").toISOString(), "2028-02-29T12:00:00.000Z");
});
test("display overrides cannot fabricate public occupancy", () => {
 const result = availability({ capacity: 10, startsAt: new Date("2027-01-01Z"), enrollmentOpen: true, cancelled: false, displayedOccupancy: 10, useDisplayedOccupancy: true }, 0, now);
 assert.equal(result.displayed, 0);
 assert.equal(result.simulated, false);
 assert.equal(result.status, "AVAILABLE");
});
