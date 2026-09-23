import "server-only";
import { db } from "@/server/db";
import { createNotification } from "@/server/services/notifications.service";

/**
 * Sends the one-time "ödeme zamanı geldi" notification for every monthly group-lesson enrollment
 * whose paid month has ended. Idempotent — renewalNoticeSentAt is stamped per billing period and
 * cleared again when the student pays. Runs lazily on every dashboard load (scoped to that
 * student) and daily for everyone from the /api/cron/billing route, so a student who never logs
 * in still gets the notice waiting for them.
 */
export async function syncBillingNotices(userId?: string) {
  const now = new Date();
  const due = await db.enrollment.findMany({
    where: {
      ...(userId ? { userId } : {}),
      status: "ACTIVE",
      paidThrough: { lte: now },
      renewalNoticeSentAt: null,
    },
    include: { course: { include: { product: { select: { title: true } } } } },
    take: 500,
  });
  for (const enrollment of due) {
    // Claim the row first so two concurrent runs can't both notify.
    const claimed = await db.enrollment.updateMany({
      where: { id: enrollment.id, renewalNoticeSentAt: null },
      data: { renewalNoticeSentAt: now },
    });
    if (claimed.count === 0) continue;
    await createNotification(enrollment.userId, {
      title: "Canlı ders ödemenin zamanı geldi",
      body: `${enrollment.course.product.title} için bir aylık ödeme dönemin doldu. Derslerine kesintisiz devam etmek için 1 gün içinde ödemeni yap; aksi hâlde canlı ders erişimin durdurulur.`,
      href: "/dashboard/live-sessions",
    });
  }
  return due.length;
}
