import "server-only";
import { db } from "@/server/db";

export function listOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, user: { select: { name: true, email: true } } },
  });
}

export async function markOrderPaid(orderId: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { product: { include: { course: true } } } } },
    });

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
