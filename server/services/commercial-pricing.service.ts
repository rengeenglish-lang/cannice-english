import "server-only";
import { db } from "@/server/db";
import { launchPrice, type CommercialKind, type BillingInterval } from "@/lib/commercial";

export async function commercialPrice(kind: CommercialKind, interval: BillingInterval) {
  launchPrice(kind, interval); // Reject unsupported combinations, including annual group billing.
  const price = await db.commercialPrice.findUnique({ where: { kind_interval: { kind, interval } } });
  if (!price?.active) throw new Error("Bu ödeme seçeneği şu anda satışa açık değil.");
  return price;
}
export async function setCommercialPrice(actorId: string, kind: CommercialKind, interval: BillingInterval, amountMinor: number, reason: string) {
  launchPrice(kind, interval);
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0 || amountMinor > 100000000 || !reason.trim()) throw new Error("Geçerli tutar ve değişiklik nedeni gerekiyor.");
  return db.$transaction(async tx => {
    const actor = await tx.user.findUnique({ where: { id: actorId } });
    if (!actor?.isActive || !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) throw new Error("Yetkisiz işlem.");
    await tx.$queryRaw`SELECT id FROM commercial_prices WHERE kind = ${kind}::"CommercialKind" AND interval = ${interval}::"BillingInterval" FOR UPDATE`;
    const previous = await tx.commercialPrice.findUniqueOrThrow({ where: { kind_interval: { kind, interval } } });
    const next = await tx.commercialPrice.update({ where: { id: previous.id }, data: { amountMinor } });
    await tx.commercialAudit.create({ data: { actorId, action: "PRICE_CHANGED", targetId: next.id, details: { previous: previous.amountMinor, amountMinor, reason } } });
    return next;
  });
}
