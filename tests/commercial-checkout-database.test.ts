import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { createCommercialCheckout, closeCommercialOrder, configureCommercialSales, configureCohortSales, commercialOrderForUser } from "../server/services/commercial-checkout.service";
import { markOrderPaid } from "../server/services/orders.service";
import { getAccessGrants, hasCourseAccess } from "../server/services/access.service";
import { canUseTool } from "../lib/entitlements";
import { addBillingPeriod } from "../lib/commercial";
const url = new URL(process.env.DATABASE_URL!);
if (!["127.0.0.1", "localhost"].includes(url.hostname) || !url.pathname.endsWith("_test")) throw new Error("Requires isolated local *_test database");
after(async () => db.$disconnect());
const request = (kind: "GROUP" | "PREMIUM", cohortId?: string) => ({ kind, interval: "MONTHLY", cohortId, requestKey: randomUUID() });
async function fixture() {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Admin", email: `a${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Teacher", email: `t${stamp}@example.test`, role: "TEACHER" } });
  const students = await Promise.all(Array.from({ length: 12 }, (_, i) => db.user.create({ data: { name: `Student ${i}`, email: `s${i}${stamp}@example.test` } })));
  const product = await db.product.create({ data: { slug: stamp, title: "Checkout fixture", category: "PREP_GROUP", basePrice: 1990, salePrice: 1990, course: { create: { curriculumKey: `fixture-${stamp}`, curriculumTargetMinutes: 15000 } } }, include: { course: true } });
  // Academic publication is tested by curriculum-database; only the published state is a fixture here.
  await db.course.update({ where: { id: product.course!.id }, data: { curriculumPublishedAt: new Date() } });
  const cohort = await db.programmeCohort.create({ data: { title: "Checkout test", courseId: product.course!.id, teacherId: teacher.id, startsAt: new Date(Date.now()+86400000), expectedEndsAt: new Date(Date.now()+400*86400000), status: "OPEN" } });
  await db.commercialPrice.upsert({ where: { kind_interval: { kind: "GROUP", interval: "MONTHLY" } }, create: { kind: "GROUP", interval: "MONTHLY", amountMinor: 199000 }, update: { checkoutEnabled: false } });
  await db.commercialPrice.upsert({ where: { kind_interval: { kind: "PREMIUM", interval: "MONTHLY" } }, create: { kind: "PREMIUM", interval: "MONTHLY", amountMinor: 49900 }, update: { checkoutEnabled: false } });
  return { admin, teacher, students, product, cohort };
}
test("commercial checkout reserves final seat transactionally; only approved payments grant access", async () => {
  const { admin, teacher, students, cohort, product } = await fixture();
  await assert.rejects(createCommercialCheckout(students[0].id, request("GROUP", cohort.id)), /satışa açık/);
  await assert.rejects(configureCommercialSales(teacher.id, "GROUP", "MONTHLY", true), /Yönetici/);
  await configureCommercialSales(admin.id, "GROUP", "MONTHLY", true);
  await configureCohortSales(admin.id, cohort.id, { salesEnabled: true, graceDays: 2, seatHoldMinutes: 60 });
  await assert.rejects(createCommercialCheckout(students[0].id, { ...request("GROUP", cohort.id), amountMinor: 1 }));
  await assert.rejects(createCommercialCheckout(students[0].id, { ...request("GROUP", cohort.id), interval: "ANNUAL" }));
  const firstInput = request("GROUP", cohort.id);
  const first = await createCommercialCheckout(students[0].id, firstInput);
  assert.deepEqual(await createCommercialCheckout(students[0].id, firstInput), first);
  assert.equal(await db.seatReservation.count({ where: { orderId: first.orderId } }), 1);
  assert.equal((await getAccessGrants(students[0].id)).length, 0);
  assert.equal(await hasCourseAccess(students[0].id, product.course!.id), false);
  assert.equal(await commercialOrderForUser(students[1].id, first.orderId), null);
  const order = await db.order.findUniqueOrThrow({ where: { id: first.orderId } });
  assert.equal(order.total.toString(), "1990");
  await assert.rejects(markOrderPaid(first.orderId, teacher.id), /yönetici/);
  await Promise.all([markOrderPaid(first.orderId, admin.id), markOrderPaid(first.orderId, admin.id)]);
  assert.equal(await db.accessGrant.count({ where: { userId: students[0].id } }), 1);
  assert.equal(await db.commercialAudit.count({ where: { targetId: first.orderId, action: "PAYMENT_APPROVED" } }), 1);
  const grants = await getAccessGrants(students[0].id);
  assert.equal(canUseTool("PREMIUM", grants), true);
  assert.equal(canUseTool("GROUP_INCLUDED", grants), true);
  assert.equal(canUseTool("SEPARATE_PURCHASE", grants), false);
  assert.equal(await hasCourseAccess(students[0].id, product.course!.id), true);
  for (const student of students.slice(1,9)) {
    const checkout = await createCommercialCheckout(student.id, request("GROUP", cohort.id));
    await markOrderPaid(checkout.orderId, admin.id);
  }
  const race = await Promise.allSettled(students.slice(9,11).map((s) => createCommercialCheckout(s.id, request("GROUP", cohort.id))));
  assert.equal(race.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(race.filter((r) => r.status === "rejected").length, 1);
  const winner = race.find((r) => r.status === "fulfilled")!;
  assert.equal(winner.status, "fulfilled");
  if (winner.status !== "fulfilled") throw new Error("Missing winner");
  assert.equal(await db.cohortEnrollment.count({ where: { cohortId: cohort.id, status: "CONFIRMED" } }), 9);
  await assert.rejects(db.programmeCohort.update({ where: { id: cohort.id }, data: { maximumCapacity: 9 } }), /Capacity/);
  await markOrderPaid(winner.value.orderId, admin.id);
  assert.equal(await db.cohortEnrollment.count({ where: { cohortId: cohort.id, status: "CONFIRMED" } }), 10);
  await assert.rejects(createCommercialCheckout(students[11].id, request("GROUP", cohort.id)), /kontenjan/);
  // A renewal does not need an eleventh seat; its entitlement begins at the previous paid-through.
  const originalItem = await db.orderItem.findFirstOrThrow({ where: { orderId: first.orderId } });
  const renewal = await createCommercialCheckout(students[0].id, request("GROUP", cohort.id));
  assert.equal(await db.seatReservation.count({ where: { orderId: renewal.orderId } }), 0);
  await markOrderPaid(renewal.orderId, admin.id);
  const renewalItem = await db.orderItem.findFirstOrThrow({ where: { orderId: renewal.orderId } });
  assert.equal(renewalItem.periodStartsAt!.toISOString(), originalItem.paidThrough!.toISOString());
  assert.equal(renewalItem.paidThrough!.toISOString(), addBillingPeriod(originalItem.paidThrough!, "MONTHLY").toISOString());
  assert.equal(await db.cohortEnrollment.count({ where: { cohortId: cohort.id, status: "CONFIRMED" } }), 10);
  // Refunding current term must not activate a future renewal early.
  await closeCommercialOrder(admin.id, first.orderId, "REFUNDED", "Verified manual refund");
  assert.equal((await getAccessGrants(students[0].id)).length, 0);
  assert.equal(await hasCourseAccess(students[0].id, product.course!.id), false);
  assert.equal(await db.enrollment.count({ where: { userId: students[0].id } }), 1); // history retained
  await closeCommercialOrder(admin.id, renewal.orderId, "REFUNDED", "Verified manual refund");
  assert.equal(await db.cohortEnrollment.count({ where: { cohortId: cohort.id, status: "CONFIRMED" } }), 9);
});
test("expired reservation sends received payment to review; failure never grants access", async () => {
  const { admin, students, cohort } = await fixture();
  await configureCommercialSales(admin.id, "GROUP", "MONTHLY", true);
  await configureCohortSales(admin.id, cohort.id, { salesEnabled: true, graceDays: 0, seatHoldMinutes: 5 });
  const checkout = await createCommercialCheckout(students[0].id, request("GROUP", cohort.id));
  await db.seatReservation.update({ where: { orderId: checkout.orderId }, data: { createdAt: new Date(Date.now()-600000), expiresAt: new Date(Date.now()-1000) } });
  await markOrderPaid(checkout.orderId, admin.id);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: checkout.orderId } })).status, "PAYMENT_REVIEW");
  assert.equal((await db.payment.findUniqueOrThrow({ where: { orderId: checkout.orderId } })).status, "SUCCEEDED");
  assert.equal((await getAccessGrants(students[0].id)).length, 0);
  assert.equal(await db.enrollment.count({ where: { userId: students[0].id } }), 0);
  await markOrderPaid(checkout.orderId, admin.id); // idempotent review
  await closeCommercialOrder(admin.id, checkout.orderId, "REFUNDED", "Late payment refunded");
  const failed = await createCommercialCheckout(students[1].id, request("GROUP", cohort.id));
  await closeCommercialOrder(admin.id, failed.orderId, "FAILED", "Payment did not arrive");
  await assert.rejects(markOrderPaid(failed.orderId, admin.id), /uygun değil/);
  assert.equal((await getAccessGrants(students[1].id)).length, 0);
  assert.ok((await db.seatReservation.findUniqueOrThrow({ where: { orderId: failed.orderId } })).releasedAt);
});
test("Premium manual approval and expiry honor paid periods and revocation", async () => {
  const { admin, students } = await fixture();
  await db.learningTool.upsert({ where: { key: "test-premium" }, create: { key: "test-premium", name: "Test tool", policy: "PREMIUM", enabled: true }, update: { enabled: true } });
  await configureCommercialSales(admin.id, "PREMIUM", "MONTHLY", true);
  const first = await createCommercialCheckout(students[0].id, request("PREMIUM"));
  assert.equal((await getAccessGrants(students[0].id)).length, 0);
  await markOrderPaid(first.orderId, admin.id);
  assert.equal(canUseTool("PREMIUM", await getAccessGrants(students[0].id)), true);
  const grant = await db.accessGrant.findFirstOrThrow({ where: { userId: students[0].id } });
  assert.equal((await getAccessGrants(students[0].id, grant.expiresAt)).length, 0);
  await closeCommercialOrder(admin.id, first.orderId, "REFUNDED", "Refund verified");
  assert.equal((await getAccessGrants(students[0].id)).length, 0);
  assert.ok((await db.membershipSubscription.findFirstOrThrow({ where: { userId: students[0].id } })).revokedAt);
});
