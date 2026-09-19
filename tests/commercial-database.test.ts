import { test, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../server/db";
import { markOrderPaid } from "../server/services/orders.service";
import { getAccessGrants } from "../server/services/access.service";
const url = new URL(process.env.DATABASE_URL!);
if (!["127.0.0.1", "localhost"].includes(url.hostname) || !url.pathname.endsWith("_test")) throw new Error("Requires isolated local *_test database");
after(async () => db.$disconnect());
test("manual payment approval: admin only, concurrent retries grant once, unpaid grants denied", async () => {
 const stamp = `${Date.now()}-${Math.random()}`;
 const admin = await db.user.create({ data: { name: "Test admin", email: `admin-${stamp}@example.test`, role: "ADMIN" } });
 const teacher = await db.user.create({ data: { name: "Test teacher", email: `teacher-${stamp}@example.test`, role: "TEACHER" } });
 const student = await db.user.create({ data: { name: "Test student", email: `student-${stamp}@example.test` } });
 const product = await db.product.create({ data: { slug: stamp, title: "Test course", category: "STUDY_PACKAGE", basePrice: 499, salePrice: 499, course: { create: {} } }, include: { course: true } });
 const order = await db.order.create({ data: { userId: student.id, status: "AWAITING_PAYMENT", subtotal: 499, total: 499, items: { create: { productId: product.id, titleSnapshot: product.title, unitPrice: 499, lineTotal: 499 } }, payment: { create: { amount: 499, status: "PENDING" } } }, include: { items: true } });
 try {
  await db.accessGrant.create({ data: { userId: student.id, orderItemId: order.items[0].id, capability: "PREMIUM_SIMULATIONS", startsAt: new Date(Date.now()-1000), expiresAt: new Date(Date.now()+60000) } });
  assert.equal((await getAccessGrants(student.id)).length, 0);
  await assert.rejects(markOrderPaid(order.id, teacher.id), /yönetici/);
  await Promise.all([markOrderPaid(order.id, admin.id), markOrderPaid(order.id, admin.id)]);
  assert.equal(await db.enrollment.count({ where: { userId: student.id, courseId: product.course!.id } }), 1);
  assert.equal(await db.commercialAudit.count({ where: { targetId: order.id, action: "PAYMENT_APPROVED" } }), 1);
  assert.equal((await getAccessGrants(student.id)).length, 1);
  await db.payment.update({ where: { orderId: order.id }, data: { status: "REFUNDED" } });
  assert.equal((await getAccessGrants(student.id)).length, 0);
  await assert.rejects(markOrderPaid(order.id, admin.id), /uygun değil/);
 } finally {
  await db.accessGrant.deleteMany({ where: { userId: student.id } });
  await db.enrollment.deleteMany({ where: { userId: student.id } });
  await db.commercialAudit.deleteMany({ where: { targetId: order.id } });
  await db.order.delete({ where: { id: order.id } });
  await db.product.delete({ where: { id: product.id } });
  await db.user.deleteMany({ where: { id: { in: [student.id, teacher.id, admin.id] } } });
 }
});
