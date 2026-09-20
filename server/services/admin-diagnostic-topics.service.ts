import "server-only";
import { db, type TransactionClient } from "@/server/db";
import { diagnosticTopicSchema, parseSlugList } from "@/lib/validation/admin";

export function listTopicsForAdmin() {
  return db.diagnosticTopic.findMany({
    include: { parent: true, dependsOn: { include: { dependsOnTopic: true } } },
    orderBy: [{ kind: "asc" }, { displayOrder: "asc" }],
  });
}

export function getTopicForEdit(id: string) {
  return db.diagnosticTopic.findUnique({
    where: { id },
    include: { parent: true, dependsOn: { include: { dependsOnTopic: true } } },
  });
}

async function assertNoCycle(tx: TransactionClient, topicId: string, newDependsOnIds: string[]) {
  const otherEdges = await tx.topicDependency.findMany({ where: { topicId: { not: topicId } } });
  const adjacency = new Map<string, string[]>();
  for (const e of otherEdges) {
    if (!adjacency.has(e.topicId)) adjacency.set(e.topicId, []);
    adjacency.get(e.topicId)!.push(e.dependsOnTopicId);
  }
  const visited = new Set<string>();
  const stack = [...newDependsOnIds];
  while (stack.length) {
    const node = stack.pop()!;
    if (node === topicId) throw new Error("Bu bağımlılık bir döngü oluşturur — daha önce seçilen bir konu, dolaylı olarak bu konuya bağlı.");
    if (visited.has(node)) continue;
    visited.add(node);
    stack.push(...(adjacency.get(node) ?? []));
  }
}

async function resolveSlugsToIds(tx: TransactionClient, slugs: string[]) {
  if (slugs.length === 0) return [];
  const topics = await tx.diagnosticTopic.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const missing = slugs.filter((s) => !topics.some((t) => t.slug === s));
  if (missing.length) throw new Error(`Bulunamayan konu slug'ı: ${missing.join(", ")}`);
  return topics.map((t) => t.id);
}

async function saveDependencies(tx: TransactionClient, topicId: string, dependsOnIds: string[]) {
  await assertNoCycle(tx, topicId, dependsOnIds);
  await tx.topicDependency.deleteMany({ where: { topicId } });
  for (const dependsOnTopicId of dependsOnIds) {
    await tx.topicDependency.create({ data: { topicId, dependsOnTopicId } });
  }
}

export async function createTopic(raw: Record<string, unknown>) {
  const input = diagnosticTopicSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const parentTopicId = input.parentSlug
      ? (await tx.diagnosticTopic.findUnique({ where: { slug: input.parentSlug }, select: { id: true } }))?.id ?? null
      : null;
    const topic = await tx.diagnosticTopic.create({
      data: {
        slug: input.slug,
        name: input.name,
        kind: input.kind,
        examFamilies: input.examFamilies,
        parentTopicId,
        importanceWeight: input.importanceWeight,
        estimatedMinutes: input.estimatedMinutes === "" || input.estimatedMinutes === undefined ? null : Number(input.estimatedMinutes),
        description: input.description || null,
        displayOrder: input.displayOrder,
      },
    });
    const dependsOnIds = await resolveSlugsToIds(tx, parseSlugList(input.dependsOnSlugs));
    if (dependsOnIds.length) await saveDependencies(tx, topic.id, dependsOnIds);
    return topic;
  });
}

export async function updateTopic(id: string, raw: Record<string, unknown>) {
  const input = diagnosticTopicSchema.parse(raw);
  return db.$transaction(async (tx) => {
    const parentTopicId = input.parentSlug
      ? (await tx.diagnosticTopic.findUnique({ where: { slug: input.parentSlug }, select: { id: true } }))?.id ?? null
      : null;
    const topic = await tx.diagnosticTopic.update({
      where: { id },
      data: {
        slug: input.slug,
        name: input.name,
        kind: input.kind,
        examFamilies: input.examFamilies,
        parentTopicId,
        importanceWeight: input.importanceWeight,
        estimatedMinutes: input.estimatedMinutes === "" || input.estimatedMinutes === undefined ? null : Number(input.estimatedMinutes),
        description: input.description || null,
        displayOrder: input.displayOrder,
      },
    });
    const dependsOnIds = await resolveSlugsToIds(tx, parseSlugList(input.dependsOnSlugs));
    await saveDependencies(tx, id, dependsOnIds);
    return topic;
  });
}

/** Never hard-deleted — array-based tags and frozen attempt question orders can't safely survive a delete. */
export async function deactivateTopic(id: string) {
  return db.diagnosticTopic.update({ where: { id }, data: { isActive: false } });
}

export async function reactivateTopic(id: string) {
  return db.diagnosticTopic.update({ where: { id }, data: { isActive: true } });
}
