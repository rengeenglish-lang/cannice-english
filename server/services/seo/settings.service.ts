import "server-only";
import { db, type TransactionClient } from "@/server/db";
import {
  DEFAULT_SEO_SETTINGS,
  SEO_SETTINGS_KEY,
  seoSettingsEnvelopeSchema,
} from "@/lib/seo/settings";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";

export async function readSeoSettings(tx: TransactionClient = db) {
  const row = await tx.appSetting.findUnique({
    where: { key: SEO_SETTINGS_KEY },
  });
  return row
    ? seoSettingsEnvelopeSchema.parse(JSON.parse(row.value))
    : { revision: 0, settings: DEFAULT_SEO_SETTINGS };
}
export async function getSeoSettings(actorId: string) {
  await requireSeoAdmin(actorId);
  return readSeoSettings();
}
export async function saveSeoSettings(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = seoSettingsEnvelopeSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "SETTINGS_SAVED");
    const current = await readSeoSettings(tx);
    if (current.revision !== input.revision)
      throw new Error("Ayarlar başka bir sekmede değişti. Sayfayı yenileyin.");
    const ids = [...new Set(input.settings.enabledExamIds)];
    const valid = await tx.examType.count({
      where: { id: { in: ids }, active: true },
    });
    if (valid !== ids.length)
      throw new Error("Yalnızca mevcut etkin sınavlar seçilebilir.");
    const next = {
      revision: current.revision + 1,
      settings: { ...input.settings, enabledExamIds: ids },
    };
    const value = JSON.stringify(next);
    await tx.appSetting.upsert({
      where: { key: SEO_SETTINGS_KEY },
      create: { key: SEO_SETTINGS_KEY, value },
      update: { value },
    });
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "SETTINGS_SAVED",
        details: { revision: next.revision, settings: next.settings },
      },
    });
    return next;
  });
}
export async function pauseSeo(actorId: string) {
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "AUTOPILOT_PAUSED");
    const current = await readSeoSettings(tx);
    const next = {
      revision: current.revision + 1,
      settings: { ...current.settings, paused: true as const },
    };
    const value = JSON.stringify(next);
    await tx.appSetting.upsert({
      where: { key: SEO_SETTINGS_KEY },
      create: { key: SEO_SETTINGS_KEY, value },
      update: { value },
    });
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "AUTOPILOT_PAUSED",
        details: { revision: next.revision },
      },
    });
    return next;
  });
}
