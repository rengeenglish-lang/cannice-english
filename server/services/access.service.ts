import "server-only";
import { db } from "@/server/db";
import { canUseTool, hasCapability, type Capability } from "@/lib/entitlements";

export async function getAccessGrants(userId: string, now = new Date()) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!user?.isActive) return [];
  return db.accessGrant.findMany({ where: { userId, revokedAt: null, startsAt: { lte: now }, expiresAt: { gt: now }, OR: [{ capability: { not: "GROUP_FULL_ACCESS" } }, { orderItem: { cohort: { status: { in: ["OPEN", "CLOSED"] }, enrollments: { some: { studentId: userId, status: "CONFIRMED" } } } } }], orderItem: { order: { status: "PAID", payment: { status: "SUCCEEDED" } } } } });
}
export async function requireCapability(userId: string, capability: Capability) {
  if (!hasCapability(capability, await getAccessGrants(userId))) throw new Error("Bu araç için aktif erişim gerekiyor.");
}
export async function canAccessTool(userId: string | null, toolKey: string) {
  const tool = await db.learningTool.findUnique({ where: { key: toolKey } });
  if (!tool?.enabled) return false;
  const grants = userId ? await getAccessGrants(userId) : [];
  // Separate purchases must use the owning product's existing purchase check.
  return canUseTool(tool.policy, grants);
}

/** A renewal's future period must not bridge a refunded or unpaid gap. */
export async function hasCourseAccess(userId: string, courseId: string, client: import("@/server/db").TransactionClient = db) {
  const now = new Date();
  const enrollment = await client.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } }, include: { user: true, orderItem: true } });
  if (!enrollment?.user.isActive || enrollment.status !== "ACTIVE" || (enrollment.expiresAt && enrollment.expiresAt <= now)) return false;
  if (enrollment.orderItem?.purchaseType !== "GROUP_PROGRAM") return true;
  return Boolean(await client.accessGrant.findFirst({ where: { userId, capability: "GROUP_FULL_ACCESS", revokedAt: null, startsAt: { lte: now }, expiresAt: { gt: now }, orderItem: { order: { status: "PAID", payment: { status: "SUCCEEDED" } }, cohort: { courseId, status: { in: ["OPEN", "CLOSED"] }, enrollments: { some: { studentId: userId, status: "CONFIRMED" } } } } } }));
}
