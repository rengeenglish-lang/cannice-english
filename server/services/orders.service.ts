import "server-only";
import { db } from "@/server/db";
import { createNotification } from "@/server/services/notifications.service";

export function listOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, user: { select: { name: true, email: true } } },
  });
}

export function getOrderForAdmin(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { items: true, payment: true, user: { select: { name: true, email: true } } },
  });
}

export async function markOrderPaid(orderId: string) {
  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { product: { include: { course: true } } } } },
    });

    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.payment.update({ where: { orderId: order.id }, data: { status: "SUCCEEDED", paidAt: new Date() } });

    if (!order.userId) return { enrolled: 0, skippedGuest: true, userId: null };

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

    return { enrolled, skippedGuest: false, userId: order.userId };
  });

  if (result.userId) {
    await createNotification(result.userId, { title: "Ödemeniz onaylandı", body: "Siparişiniz onaylandı, dersleriniz hesabınızda hazır.", href: "/dashboard/orders" });
  }
  return result;
}

/** Only reachable before payment — no money has moved, so this is a plain status change. */
export async function markOrderCancelled(orderId: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.status !== "PENDING" && order.status !== "AWAITING_PAYMENT") {
    throw new Error("Sadece ödeme bekleyen siparişler iptal edilebilir.");
  }
  const updated = await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  if (order.userId) {
    await createNotification(order.userId, { title: "Siparişiniz iptal edildi", href: "/dashboard/orders" });
  }
  return updated;
}

/**
 * There is no payment gateway yet (see .env.example), so this only records that a refund
 * happened outside the system (bank transfer back to the customer, handled by staff) and revokes
 * the access it granted — it never moves money itself.
 */
export async function markOrderRefunded(orderId: string) {
  const order = await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    if (order.status !== "PAID") throw new Error("Sadece ödenmiş siparişler iade edilebilir.");

    await tx.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
    await tx.payment.update({ where: { orderId }, data: { status: "REFUNDED" } });

    for (const item of order.items) {
      await tx.enrollment.updateMany({ where: { orderItemId: item.id }, data: { status: "REVOKED" } });
    }
    return order;
  });

  if (order.userId) {
    await createNotification(order.userId, { title: "Siparişiniz iade edildi", href: "/dashboard/orders" });
  }
}
