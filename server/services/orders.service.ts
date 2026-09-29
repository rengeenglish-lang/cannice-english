import "server-only";
import { db } from "@/server/db";
import { createNotification } from "@/server/services/notifications.service";
import { grantPlanForOrderItem } from "@/server/services/plans.service";
import { enrollGroupSlotAndSeries } from "@/server/services/group-availability.service";
import { isMonthlyBilledCategory, nextPaidThrough } from "@/lib/billing";
import { NETFENER_EBOOKS } from "@/lib/netfener-ebooks";
import { editionSlug } from "@/lib/netfener-ebook-editions";

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

/** Our printed editions; the older print books are matched by their format instead. */
const PRINTED_SLUGS = NETFENER_EBOOKS.map((book) => editionSlug(book.slug, "print"));

/**
 * The print queue: paid orders holding something that has to be printed and posted, oldest first.
 * This is what the fulfilment partner works from, so it carries the address the buyer gave.
 */
export function listPrintOrders() {
  return db.order.findMany({
    where: {
      status: "PAID",
      // Everything that arrives in a parcel: our printed editions, plus the older print books.
      items: { some: { product: { OR: [{ slug: { in: PRINTED_SLUGS } }, { book: { format: { in: ["PRINT", "PRINT_AND_PDF"] } } }] } } },
    },
    orderBy: { createdAt: "asc" },
    include: {
      items: { include: { product: { select: { slug: true, book: { select: { format: true } } } } } },
      user: { select: { name: true, email: true } },
    },
  });
}

export async function markOrderPaid(orderId: string, opts?: { providerRef?: string }) {
  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { product: { include: { course: true } } } } },
    });
    // Idempotent: a PayPal capture retry or a double click in the admin panel must not grant a
    // second plan period or push a group lesson's paidThrough forward twice.
    if (order.status === "PAID") return { enrolled: 0, skippedGuest: !order.userId, userId: null, slotBookings: [] };

    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.payment.update({ where: { orderId: order.id }, data: { status: "SUCCEEDED", paidAt: new Date(), ...(opts?.providerRef ? { providerRef: opts.providerRef } : {}) } });

    if (!order.userId) return { enrolled: 0, skippedGuest: true, userId: null, slotBookings: [] };

    let enrolled = 0;
    const slotBookings: string[] = [];
    for (const item of order.items) {
      if (item.product.category === "PLAN") {
        await grantPlanForOrderItem(tx, order.userId, item, item.product);
        continue;
      }
      const course = item.product.course;
      if (!course) continue;
      const existing = await tx.enrollment.findUnique({ where: { userId_courseId: { userId: order.userId, courseId: course.id } } });
      // Hazırlık grupları are billed monthly: each paid unit extends paidThrough by one calendar month.
      let billing = {};
      if (isMonthlyBilledCategory(item.product.category)) {
        let paidThrough = existing?.paidThrough ?? null;
        for (let n = 0; n < Math.max(1, item.quantity); n++) paidThrough = nextPaidThrough(paidThrough);
        billing = { paidThrough, renewalNoticeSentAt: null };
      }
      const enrollment = await tx.enrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: course.id } },
        update: { status: "ACTIVE", orderItemId: item.id, ...billing },
        create: { userId: order.userId, courseId: course.id, orderItemId: item.id, status: "ACTIVE", ...billing },
      });
      if (enrollment) enrolled += 1;
      if (item.groupSlotId) slotBookings.push(item.groupSlotId);
    }

    return { enrolled, skippedGuest: false, userId: order.userId, slotBookings };
  });

  if (result.userId) {
    await createNotification(result.userId, { title: "Ödemeniz onaylandı", body: "Siparişiniz onaylandı, dersleriniz hesabınızda hazır.", href: "/dashboard/orders" });
    // "Gruba Katıl" purchases book their chosen group straight away, so it shows up in Canlı
    // Derslerim without a second confirmation step. A seat can fill up between checkout and a
    // manual (havale) approval, in which case the student is told to pick another time.
    for (const slotId of result.slotBookings) {
      try {
        await enrollGroupSlotAndSeries(slotId, result.userId);
      } catch (error) {
        await createNotification(result.userId, {
          title: "Grup dersi kaydınız tamamlanamadı",
          body: `${error instanceof Error ? error.message : "Seçtiğiniz grup artık müsait değil."} Ödemeniz geçerli; lütfen haftalık takvimden başka bir saat seçin.`,
          href: "/group-lessons",
        });
      }
    }
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
      await tx.planSubscription.updateMany({ where: { orderItemId: item.id }, data: { status: "REVOKED" } });
    }
    return order;
  });

  if (order.userId) {
    await createNotification(order.userId, { title: "Siparişiniz iade edildi", href: "/dashboard/orders" });
  }
}
