import "server-only";
import { createHash } from "node:crypto";
import { cache } from "react";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { CHECKOUT_CONSENT_VERSION } from "@/lib/checkout-consent";
import { LEGAL_CONTENT_KEY, initialLegalBundle, resolveLegalDocuments, validateLegalDocument, consentWordingSchema, type LegalBundle } from "@/lib/legal-content";

async function requireAdmin(actorId: string, client: TransactionClient = db) {
  const user = await client.user.findUnique({ where: { id: actorId }, select: { role: true, isActive: true } });
  if (!user?.isActive || user.role !== "ADMIN") throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
}
async function readBundle(client: TransactionClient = db): Promise<LegalBundle> {
  const row = await client.appSetting.findUnique({ where: { key: LEGAL_CONTENT_KEY } });
  return row ? JSON.parse(row.value) as LegalBundle : initialLegalBundle();
}
export const getPublishedLegalContent = cache(async () => {
  const bundle = await readBundle();
  const documents = resolveLegalDocuments(bundle);
  const text = bundle.wording.published;
  const version = createHash("sha256").update(JSON.stringify({ baseVersion: CHECKOUT_CONSENT_VERSION, documents, text })).digest("hex");
  return { documents, configuration: { version, text } };
});
export async function getLegalEditor(actorId: string) {
  await requireAdmin(actorId);
  const [bundle, history] = await Promise.all([
    readBundle(),
    db.appSetting.findMany({ where: { key: { startsWith: "legal_content_audit:" } }, orderBy: { updatedAt: "desc" }, take: 15, select: { value: true } }),
  ]);
  return { bundle, documents: resolveLegalDocuments(bundle), history: history.map((row) => {
    const item = JSON.parse(row.value) as { actorName: string; at: string; target: string; action: string; revision: number };
    return { actorName: item.actorName, at: item.at, target: item.target, action: item.action, revision: item.revision };
  }) };
}
export async function saveLegalContent(actorId: string, raw: unknown) {
  const input = z.object({ target: z.string().max(100), revision: z.number().int().min(0), operation: z.enum(["SAVE_DRAFT", "PUBLISH"]), content: z.unknown() }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireAdmin(actorId, tx);
    // All legal-editor writes serialize, and stale browser tabs cannot overwrite newer edits.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(782941, 1)`;
    const bundle = await readBundle(tx);
    if (bundle.revision !== input.revision) throw new Error("Başka bir düzenleme kaydedildi. Sayfayı yenileyip güncel sürümü açın; değişiklikleriniz henüz kaydedilmedi.");
    const at = new Date().toISOString();
    if (input.target === "checkout") {
      const wording = consentWordingSchema.parse(input.content);
      bundle.wording.draft = wording;
      if (input.operation === "PUBLISH") bundle.wording.published = wording;
    } else {
      const document = validateLegalDocument(input.target, input.content);
      const current = bundle.documents[input.target];
      bundle.documents[input.target] = { ...current, draft: { ...document, draft: true, updatedAt: at.slice(0, 10) }, ...(input.operation === "PUBLISH" ? { published: { ...document, draft: false, updatedAt: at.slice(0, 10) } } : {}) };
    }
    bundle.revision += 1;
    const value = JSON.stringify(bundle);
    await tx.appSetting.upsert({ where: { key: LEGAL_CONTENT_KEY }, create: { key: LEGAL_CONTENT_KEY, value }, update: { value } });
    const actor = await tx.user.findUniqueOrThrow({ where: { id: actorId }, select: { name: true } });
    await tx.appSetting.create({ data: { key: `legal_content_audit:${bundle.revision}`, value: JSON.stringify({ actorId, actorName: actor.name, at, target: input.target, action: input.operation, revision: bundle.revision, content: input.content }) } });
    return { revision: bundle.revision };
  }, { timeout: 10000 });
}
