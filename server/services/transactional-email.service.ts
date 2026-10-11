import "server-only";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { emailConfigured } from "@/server/email/send";
import { sendOnce } from "@/server/email/transactional";
import { billingState } from "@/lib/billing";
import { cartUnsubscribeToken } from "@/lib/auth/tokens";
import {
  renderCartReminderEmail,
  renderOrderAwaitingTransferEmail,
  renderOrderPaidEmail,
  renderSessionReminderEmail,
  type OrderSummary,
} from "@/lib/email/templates";

const site = () => getSiteUrl().replace(/\/$/, "");

async function loadOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true, user: { select: { name: true, email: true } } },
  });
  if (!order) return null;
  const to = order.user?.email ?? order.guestEmail;
  if (!to) return null;
  const summary: OrderSummary = {
    id: order.id,
    name: order.user?.name ?? order.guestName ?? "",
    items: order.items.map((i) => ({ title: i.titleSnapshot, quantity: i.quantity, lineTotal: Number(i.lineTotal) })),
    total: Number(order.total),
  };
  return { order, to, summary };
}

/** Havale/EFT order placed: payment instructions. Card orders get nothing until they are paid. */
export async function sendOrderAwaitingTransfer(orderId: string) {
  const loaded = await loadOrder(orderId);
  if (!loaded || loaded.order.payment?.provider !== "MANUAL" || loaded.order.status !== "AWAITING_PAYMENT") return false;
  const content = renderOrderAwaitingTransferEmail({ order: loaded.summary, paymentUrl: `${site()}/checkout/received?order=${orderId}`, siteUrl: site() });
  return sendOnce(`order-awaiting:${orderId}`, "ORDER_AWAITING_TRANSFER", loaded.to, content);
}

/** Card payment captured or havale approved: confirmation with the receipt link. */
export async function sendOrderPaid(orderId: string) {
  const loaded = await loadOrder(orderId);
  if (!loaded || loaded.order.status !== "PAID") return false;
  const content = renderOrderPaidEmail({
    order: loaded.summary,
    viaTransfer: loaded.order.payment?.provider === "MANUAL",
    receiptUrl: `${site()}/orders/${orderId}/receipt`,
    accessUrl: `${site()}${loaded.order.userId ? "/dashboard/orders" : "/kaynaklar"}`,
    siteUrl: site(),
  });
  return sendOnce(`order-paid:${orderId}`, "ORDER_PAID", loaded.to, content);
}

// ---------- hourly cron: class reminders + abandoned carts ----------

const HOUR = 60 * 60 * 1000;

/**
 * Two reminders per live lesson and student: the day before (lesson 12–26 h away) and shortly
 * before (lesson within 2 h). The log key makes each one go out once however often the cron runs.
 * Students are those with an active, paid-up enrollment in the course plus anyone booked into
 * that group slot; cancelled lessons are skipped.
 */
async function sendSessionReminders(now: Date) {
  const sessions = await db.liveSession.findMany({
    where: { cancelled: false, startsAt: { gt: now, lte: new Date(now.getTime() + 26 * HOUR) } },
    select: {
      id: true,
      title: true,
      startsAt: true,
      meetingUrl: true,
      course: {
        select: {
          product: { select: { title: true } },
          enrollments: { where: { status: "ACTIVE" }, select: { paidThrough: true, user: { select: { id: true, name: true, email: true, isActive: true } } } },
        },
      },
      bookings: { where: { status: "ACTIVE" }, select: { student: { select: { id: true, name: true, email: true, isActive: true } } } },
    },
  });
  let sent = 0;
  for (const s of sessions) {
    const untilStart = s.startsAt.getTime() - now.getTime();
    const soon = untilStart <= 2 * HOUR;
    if (!soon && untilStart < 12 * HOUR) continue; // between the two windows: nothing due yet
    const students = new Map<string, { name: string; email: string }>();
    for (const e of s.course.enrollments) {
      if (e.user.isActive && billingState(e.paidThrough, now) !== "LOCKED") students.set(e.user.id, e.user);
    }
    for (const b of s.bookings) if (b.student.isActive) students.set(b.student.id, b.student);
    const title = s.title || s.course.product.title;
    for (const [userId, student] of students) {
      const content = renderSessionReminderEmail({
        name: student.name,
        title,
        startsAt: s.startsAt,
        soon,
        // The join link only goes out in the last reminder, like the page that opens it 30 min before.
        meetingUrl: soon ? s.meetingUrl : null,
        siteUrl: site(),
      });
      if (await sendOnce(`session-${soon ? "soon" : "day"}:${s.id}:${userId}`, soon ? "SESSION_SOON" : "SESSION_DAY", student.email, content)) sent += 1;
    }
  }
  return sent;
}

/**
 * One reminder per abandoned cart: a signed-in student's cart whose last addition was 3 h to 3 days
 * ago, with no order placed since. Adding to the cart afterwards counts as a new abandonment (the
 * key holds the last activity), so a student is reminded at most once per cart state.
 */
async function sendCartReminders(now: Date) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return 0;
  const carts = await db.cart.findMany({
    where: {
      userId: { not: null },
      items: { some: { createdAt: { gte: new Date(now.getTime() - 72 * HOUR) } } },
      user: { isActive: true, cartReminderOptOut: false },
    },
    select: {
      id: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true } },
      items: { select: { createdAt: true, unitPriceSnapshot: true, quantity: true, product: { select: { title: true } } } },
    },
    take: 200,
  });
  let sent = 0;
  for (const cart of carts) {
    if (!cart.user) continue;
    // Adding an item doesn't touch the cart row, so the last activity is the newest item or update.
    const lastActivity = new Date(Math.max(cart.updatedAt.getTime(), ...cart.items.map((i) => i.createdAt.getTime())));
    if (now.getTime() - lastActivity.getTime() < 3 * HOUR) continue;
    const ordered = await db.order.count({ where: { userId: cart.user.id, createdAt: { gte: lastActivity } } });
    if (ordered) continue;
    const unsubscribeUrl = `${site()}/api/email/cart-unsubscribe?t=${encodeURIComponent(cartUnsubscribeToken(cart.user.id, secret))}`;
    const content = renderCartReminderEmail({
      name: cart.user.name,
      items: cart.items.map((i) => ({ title: i.product.title, price: Number(i.unitPriceSnapshot) * i.quantity })),
      siteUrl: site(),
      unsubscribeUrl,
    });
    if (await sendOnce(`cart:${cart.id}:${lastActivity.toISOString()}`, "CART_REMINDER", cart.user.email, content, { unsubscribeUrl })) sent += 1;
  }
  return sent;
}

export async function runTransactionalEmailCron(now = new Date()) {
  if (!emailConfigured()) return { skipped: "email not configured" };
  const sessionReminders = await sendSessionReminders(now);
  const cartReminders = await sendCartReminders(now);
  return { sessionReminders, cartReminders };
}
