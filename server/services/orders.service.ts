import "server-only";
import { db } from "@/server/db";

export async function listOrders(actorId: string) {
  await assertAdministrator(actorId);
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, user: { select: { name: true, email: true } } },
  });
}

async function assertAdministrator(actorId: string) {
  const actor = await db.user.findUnique({ where: { id: actorId } });
  if (!actor?.isActive || !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Ödeme yönetimi için yönetici yetkisi gerekiyor.");
}
export async function markOrderPaid(orderId: string, actorId: string) {
  await assertAdministrator(actorId);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM orders WHERE id = ${orderId} FOR UPDATE`;
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { payment: true, items: { include: { product: { include: { course: true } } } } },
    });

    if (order.status === "PAID" && order.payment?.status === "SUCCEEDED") return { enrolled: 0, skippedGuest: !order.userId };
    if (order.status !== "AWAITING_PAYMENT" || !order.payment || order.payment.status !== "PENDING") throw new Error("Sipariş ödeme onayı için uygun değil.");
    if (!order.payment.amount.equals(order.total) || order.payment.currency !== order.currency) throw new Error("Ödeme tutarı siparişle eşleşmiyor.");
    await tx.commercialAudit.create({ data: { actorId, action: "PAYMENT_APPROVED", targetId: order.id, details: { amount: order.total.toString(), currency: order.currency } } });
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.payment.update({ where: { orderId: order.id }, data: { status: "SUCCEEDED", paidAt: new Date() } });

    if (!order.userId) return { enrolled: 0, skippedGuest: true };

    let enrolled = 0;
    for (const item of order.items) {
      const course = item.product.course;
      if (!course) continue;
      const enrollment = await tx.enrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: course.id } },
        update: { status: "ACTIVE", orderItemId: item.id },
        create: { userId: order.userId, courseId: course.id, orderItemId: item.id, status: "ACTIVE" },
      });
      if (enrollment) enrolled += 1;
    }

    return { enrolled, skippedGuest: false };
  });
}
