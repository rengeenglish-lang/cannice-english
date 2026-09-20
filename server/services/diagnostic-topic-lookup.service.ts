import "server-only";
import { db } from "@/server/db";
import { parseSlugList } from "@/lib/validation/admin";

/** Resolves a comma-separated list of DiagnosticTopic slugs (admin form input) to ids. Unknown slugs are dropped, not errored — content authors may tag before a topic exists yet. */
export async function resolveDiagnosticTopicIds(slugsCsv: string | undefined): Promise<string[]> {
  const slugs = parseSlugList(slugsCsv);
  if (slugs.length === 0) return [];
  const topics = await db.diagnosticTopic.findMany({ where: { slug: { in: slugs } }, select: { id: true } });
  return topics.map((t) => t.id);
}
