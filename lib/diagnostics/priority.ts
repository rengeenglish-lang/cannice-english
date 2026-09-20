import { DiagnosticSeverity } from "@/lib/generated/prisma/enums";
import { MIN_EVIDENCE_FOR_CRITICAL } from "@/lib/diagnostics/attempt-config";

const SEVERITY_WEIGHT: Record<DiagnosticSeverity, number> = {
  CRITICAL: 3,
  NEEDS_IMPROVEMENT: 2,
  DEVELOPING: 1,
  STRONG: 0,
};

/** Turkish labels — severity must always render with icon + label + color, never color alone. */
export const SEVERITY_LABEL_TR: Record<DiagnosticSeverity, string> = {
  CRITICAL: "Kritik",
  NEEDS_IMPROVEMENT: "Geliştirilmeli",
  DEVELOPING: "Orta",
  STRONG: "İyi",
};

export const SEVERITY_ICON: Record<DiagnosticSeverity, string> = {
  CRITICAL: "🔴",
  NEEDS_IMPROVEMENT: "🟠",
  DEVELOPING: "🟡",
  STRONG: "🟢",
};

export function severityFromAccuracy(accuracy: number, questionsAnswered: number): DiagnosticSeverity {
  const raw: DiagnosticSeverity =
    accuracy >= 0.8 ? "STRONG" : accuracy >= 0.6 ? "DEVELOPING" : accuracy >= 0.4 ? "NEEDS_IMPROVEMENT" : "CRITICAL";
  // Not enough evidence to justify the two most alarming labels — cap at DEVELOPING instead.
  if (questionsAnswered < MIN_EVIDENCE_FOR_CRITICAL && (raw === "CRITICAL" || raw === "NEEDS_IMPROVEMENT")) {
    return "DEVELOPING";
  }
  return raw;
}

export type TopicResultInput = {
  topicId: string;
  severity: DiagnosticSeverity;
  importanceWeight: number;
};

export type TopicDependencyEdge = { topicId: string; dependsOnTopicId: string };

export type RankedTopic = { topicId: string; priorityRank: number; severity: DiagnosticSeverity };

/**
 * Ranks topics that need work (non-STRONG) by severity × importance, respecting prerequisites:
 * a topic that depends on another weak topic is never ranked ahead of its prerequisite.
 * Priority-weighted Kahn's algorithm — falls back to score order if a dependency cycle
 * somehow reaches this point (cycles are rejected at write-time, this is just defensive).
 */
export function rankRoadmapTopics(results: TopicResultInput[], dependencies: TopicDependencyEdge[]): RankedTopic[] {
  const weak = results.filter((r) => r.severity !== "STRONG");
  const weakIds = new Set(weak.map((r) => r.topicId));
  const scoreOf = (r: TopicResultInput) => SEVERITY_WEIGHT[r.severity] * Math.max(1, r.importanceWeight);

  const remaining = new Map(weak.map((r) => [r.topicId, r]));
  const dependsOnWithin = new Map<string, Set<string>>();
  for (const r of weak) dependsOnWithin.set(r.topicId, new Set());
  for (const edge of dependencies) {
    if (weakIds.has(edge.topicId) && weakIds.has(edge.dependsOnTopicId)) {
      dependsOnWithin.get(edge.topicId)!.add(edge.dependsOnTopicId);
    }
  }

  const ranked: RankedTopic[] = [];
  const resolved = new Set<string>();
  while (remaining.size > 0) {
    const eligible = [...remaining.values()].filter((r) => [...(dependsOnWithin.get(r.topicId) ?? [])].every((dep) => resolved.has(dep)));
    const pickFrom = eligible.length > 0 ? eligible : [...remaining.values()]; // defensive: break any residual cycle by score
    pickFrom.sort((a, b) => scoreOf(b) - scoreOf(a));
    const next = pickFrom[0];
    ranked.push({ topicId: next.topicId, priorityRank: ranked.length + 1, severity: next.severity });
    resolved.add(next.topicId);
    remaining.delete(next.topicId);
  }
  return ranked;
}
