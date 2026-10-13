export const CAPABILITIES = ["FREE_CONTENT", "PREMIUM_SIMULATIONS", "QUESTION_BANK", "PERFORMANCE_ANALYTICS", "STUDY_TOOLS", "DIGITAL_RESOURCES", "HOMEWORK", "TEACHER_FEEDBACK", "GROUP_LESSONS", "GROUP_FULL_ACCESS"] as const;
export type Capability = typeof CAPABILITIES[number];
export type AccessPolicy = "FREE" | "PREMIUM" | "GROUP_INCLUDED" | "SEPARATE_PURCHASE";
export type AccessGrant = { capability: Capability; startsAt: Date; expiresAt: Date; revokedAt: Date | null };
const PREMIUM_CAPABILITIES: readonly Capability[] = ["PREMIUM_SIMULATIONS", "QUESTION_BANK", "PERFORMANCE_ANALYTICS", "STUDY_TOOLS"];
export function activeGrant(grant: AccessGrant, now: Date) {
  return !grant.revokedAt && grant.startsAt <= now && now < grant.expiresAt;
}
/** Group access does not confer ownership of separate products or another group's seat. */
export function canUseTool(policy: AccessPolicy, grants: AccessGrant[], now = new Date(), separatelyPurchased = false) {
  if (policy === "FREE") return true;
  if (policy === "SEPARATE_PURCHASE") return separatelyPurchased;
  const active = grants.filter(g => activeGrant(g, now));
  if (active.some(g => g.capability === "GROUP_FULL_ACCESS")) return true;
  return policy === "PREMIUM" && active.some(g => g.capability === "PREMIUM_SIMULATIONS");
}
export function hasCapability(capability: Capability, grants: AccessGrant[], now = new Date()) {
  if (capability === "FREE_CONTENT") return true;
  const active = grants.filter(g => activeGrant(g, now));
  if (active.some(g => g.capability === capability)) return true;
  // Joining an actual class still needs enrollment and teacher/lesson authorization.
  if (capability === "GROUP_LESSONS") return false;
  if (active.some(g => g.capability === "GROUP_FULL_ACCESS")) return true;
  return PREMIUM_CAPABILITIES.includes(capability) && active.some(g => g.capability === "PREMIUM_SIMULATIONS");
}
