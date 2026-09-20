import "server-only";
import { db } from "@/server/db";

/**
 * Which active DiagnosticTopics have zero matching free/premium content — computed live in one
 * pass (not an N+1 per-topic count, not a stale log table).
 */
export async function topicsMissingContent(): Promise<Set<string>> {
  const [topics, lessons, products] = await Promise.all([
    db.diagnosticTopic.findMany({ where: { isActive: true }, select: { id: true } }),
    db.topicLesson.findMany({ select: { diagnosticTopicIds: true } }),
    db.product.findMany({ where: { isPublished: true }, select: { diagnosticTopicIds: true } }),
  ]);
  const covered = new Set<string>();
  for (const l of lessons) for (const id of l.diagnosticTopicIds) covered.add(id);
  for (const p of products) for (const id of p.diagnosticTopicIds) covered.add(id);
  return new Set(topics.map((t) => t.id).filter((id) => !covered.has(id)));
}
