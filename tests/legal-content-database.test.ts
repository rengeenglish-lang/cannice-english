import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { getLegalEditor, getPublishedLegalContent, saveLegalContent } from "../server/services/legal-content.service";
import { acceptCheckoutConsents } from "../lib/checkout-consent";
const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test")) throw new Error("Requires isolated local *_test database");
after(async () => db.$disconnect());

test("legal editor: admin authorization, draft isolation, publication, conflict handling and historical consent", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Legal test admin", email: `a-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Teacher", email: `t-${stamp}@example.test`, role: "TEACHER" } });
  await assert.rejects(getLegalEditor(teacher.id), /yönetici/);
  const initial = await getLegalEditor(admin.id);
  const live = await getPublishedLegalContent();
  const content = { title: "Test ön bilgilendirme", body: "Only an isolated test fixture, never a production legal document.", sections: [] };
  await assert.rejects(saveLegalContent(teacher.id, { target: "on-bilgilendirme-formu", revision: initial.bundle.revision, operation: "PUBLISH", content }), /yönetici/);
  const draft = await saveLegalContent(admin.id, { target: "on-bilgilendirme-formu", revision: initial.bundle.revision, operation: "SAVE_DRAFT", content });
  assert.equal((await getPublishedLegalContent()).documents["on-bilgilendirme-formu"].body, live.documents["on-bilgilendirme-formu"].body);
  assert.equal((await getPublishedLegalContent()).configuration.version, live.configuration.version);
  assert.equal((await getLegalEditor(admin.id)).bundle.documents["on-bilgilendirme-formu"].draft.body, content.body);
  const published = await saveLegalContent(admin.id, { target: "on-bilgilendirme-formu", revision: draft.revision, operation: "PUBLISH", content });
  const updated = await getPublishedLegalContent();
  assert.equal(updated.documents["on-bilgilendirme-formu"].body, content.body);
  assert.equal(updated.documents["on-bilgilendirme-formu"].draft, false);
  assert.notEqual(updated.configuration.version, live.configuration.version);
  const stale = new FormData(); stale.set("consentVersion", live.configuration.version); stale.set("agreementConsent", "on");
  assert.throws(() => acceptCheckoutConsents({ immediateDigital: false, earlyService: false }, stale, new Date(), updated.configuration), /güncellendi/);
  stale.set("consentVersion", updated.configuration.version);
  const receipt = acceptCheckoutConsents({ immediateDigital: false, earlyService: false }, stale, new Date(), updated.configuration);
  const order = await db.order.create({ data: { userId: admin.id, subtotal: 0, total: 0, checkoutConsent: receipt } });
  const wording = { ...updated.configuration.text, agreement: "Test updated agreement wording for an isolated database only." };
  const changed = await saveLegalContent(admin.id, { target: "checkout", revision: published.revision, operation: "PUBLISH", content: wording });
  assert.equal((await getPublishedLegalContent()).configuration.text.agreement, wording.agreement);
  assert.deepEqual((await db.order.findUniqueOrThrow({ where: { id: order.id } })).checkoutConsent, receipt);
  await assert.rejects(saveLegalContent(admin.id, { target: "iade-politikasi", revision: changed.revision, operation: "PUBLISH", content }), /bölümler/);
  const competing = await Promise.allSettled([
    saveLegalContent(admin.id, { target: "on-bilgilendirme-formu", revision: changed.revision, operation: "SAVE_DRAFT", content: { ...content, title: "First draft" } }),
    saveLegalContent(admin.id, { target: "on-bilgilendirme-formu", revision: changed.revision, operation: "SAVE_DRAFT", content: { ...content, title: "Second draft" } }),
  ]);
  assert.equal(competing.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(competing.filter((r) => r.status === "rejected").length, 1);
  const final = await getLegalEditor(admin.id);
  assert.equal(final.bundle.revision, changed.revision+1);
  assert.equal(final.history[0].actorName, admin.name);
  await db.user.update({ where: { id: admin.id }, data: { isActive: false } });
  await assert.rejects(getLegalEditor(admin.id), /yönetici/);
});
