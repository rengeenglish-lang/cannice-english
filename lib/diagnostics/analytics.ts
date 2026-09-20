import "server-only";
import { db } from "@/server/db";
import type { Prisma } from "@/lib/generated/prisma/client";

export type DiagnosticAnalyticsEvent =
  | "goal_started"
  | "goal_completed"
  | "diagnostic_started"
  | "diagnostic_resumed"
  | "diagnostic_completed"
  | "results_viewed"
  | "recommended_content_opened"
  | "premium_recommendation_clicked"
  | "group_lesson_clicked"
  | "roadmap_item_started"
  | "mastery_check_started"
  | "mastery_check_completed"
  | "roadmap_item_completed";

/** Minimal internal event log — no third-party SDK, this codebase has none and adding one is unnecessary. */
export async function logEvent(event: DiagnosticAnalyticsEvent, userId?: string, metadata?: Record<string, unknown>) {
  await db.analyticsEvent.create({ data: { event, userId, metadata: metadata as Prisma.InputJsonValue } }).catch(() => undefined);
}
