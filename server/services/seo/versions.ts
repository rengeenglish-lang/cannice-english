import "server-only";
import type { TransactionClient } from "@/server/db";
import { inspectDraft, studioBriefSchema, type DraftContent } from "@/lib/seo/studio";

/**
 * Appends an immutable content snapshot. Callers hold the SEO write lock, so the next version
 * number cannot race. An unchanged EDIT is not recorded again.
 */
export async function recordSeoVersion(
  tx: TransactionClient,
  draftId: string,
  content: DraftContent,
  reason: "EDIT" | "PUBLISHED" | "UNPUBLISHED" | "RESTORED",
  actorId: string | null,
) {
  const last = await tx.seoArticleVersion.findFirst({
    where: { draftId },
    orderBy: { version: "desc" },
  });
  if (
    reason === "EDIT" &&
    last &&
    JSON.stringify(last.snapshot) === JSON.stringify(content)
  )
    return last.version;
  const draft = await tx.seoArticleDraft.findUnique({
    where: { id: draftId },
    select: { brief: true },
  });
  const brief = draft ? studioBriefSchema.safeParse(draft.brief) : null;
  const score = brief?.success ? inspectDraft(content, brief.data).score : null;
  const version = (last?.version ?? 0) + 1;
  await tx.seoArticleVersion.create({
    data: { draftId, version, reason, snapshot: content, score, actorId },
  });
  return version;
}
