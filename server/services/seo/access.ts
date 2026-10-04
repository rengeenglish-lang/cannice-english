import "server-only";
import { db, type TransactionClient } from "@/server/db";
export async function requireSeoAdmin(
  actorId: string,
  client: TransactionClient = db,
) {
  const actor = await client.user.findUnique({
    where: { id: actorId },
    select: { id: true, role: true, isActive: true },
  });
  if (!actor?.isActive || actor.role !== "ADMIN")
    throw new Error("SEO yönetimi için etkin yönetici hesabı gerekir.");
  return actor;
}
export async function lockSeoWrites(tx: TransactionClient) {
  const [row] = await tx.$queryRaw<
    { locked: boolean }[]
  >`SELECT pg_try_advisory_xact_lock(782942, 1) AS locked`;
  if (!row?.locked)
    throw new Error(
      "Başka bir SEO işlemi sürüyor. Lütfen biraz sonra tekrar deneyin.",
    );
}
export async function checkSeoRateLimit(
  tx: TransactionClient,
  actorId: string,
  action: string,
) {
  const since = new Date(Date.now() - 60_000);
  const count = await tx.seoActivityLog.count({
    where: { actorId, action, createdAt: { gte: since } },
  });
  if (count >= (action === "INVENTORY_REFRESHED" ? 1 : 10))
    throw new Error("Çok sık işlem yapıldı. Bir dakika sonra tekrar deneyin.");
}
