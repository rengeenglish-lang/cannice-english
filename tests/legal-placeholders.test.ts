import { test } from "node:test";
import assert from "node:assert/strict";
import { fillLegalDoc, hasLegalGaps } from "../lib/legal-placeholders";
import { NETFENER_LEGAL_DOCS } from "../content/legal/netfener-legal";
import { legalDocumentSchema } from "../lib/legal-content";

const empty = { UNVAN: "", KRA_PIN: "", ADRES: "", EPOSTA: "destek@netfener.com", TELEFON: "", TR_KDV: "" };
const full = { UNVAN: "Netfener Ltd", KRA_PIN: "P051234567X", ADRES: "Westlands, Nairobi, Kenya", EPOSTA: "destek@netfener.com", TELEFON: "+254 700 000 000", TR_KDV: "" };
const text = (doc: ReturnType<typeof fillLegalDoc>) => [doc.body, ...(doc.sections ?? []).flatMap((s) => s.paragraphs)].join("\n");

test("company details fill the texts; missing ones show as gaps and keep TASLAK", () => {
  const draft = fillLegalDoc(NETFENER_LEGAL_DOCS["mesafeli-satis-sozlesmesi"], empty);
  assert.ok(text(draft).includes("[TİCARİ UNVAN]") && hasLegalGaps(draft));
  assert.ok(text(draft).includes("destek@netfener.com"));
  const done = fillLegalDoc(NETFENER_LEGAL_DOCS["mesafeli-satis-sozlesmesi"], full);
  assert.ok(!hasLegalGaps(done), "fully filled sales contract has no gaps");
  assert.ok(text(done).includes("Vergi numarası (Kenya KRA PIN): P051234567X"));
  assert.ok(!text(done).includes("{{"), "no raw tokens left");
  assert.ok(!text(done).includes("Türkiye KDV"), "the optional TR VAT line disappears when empty");
  assert.ok(text(fillLegalDoc(NETFENER_LEGAL_DOCS["mesafeli-satis-sozlesmesi"], { ...full, TR_KDV: "1234567890" })).includes("Türkiye KDV kayıt numarası: 1234567890"));
});

test("the KVKK text keeps its gaps until retention periods and the transfer mechanism are decided", () => {
  assert.ok(hasLegalGaps(fillLegalDoc(NETFENER_LEGAL_DOCS["aydinlatma-metni"], full)));
  for (const key of ["uyelik-sozlesmesi", "gizlilik-sozlesmesi", "acik-riza-metni"]) assert.ok(!hasLegalGaps(fillLegalDoc(NETFENER_LEGAL_DOCS[key], full)), key);
});

test("every text passes the legal editor's validation, so it can be edited and republished", () => {
  for (const [key, doc] of Object.entries(NETFENER_LEGAL_DOCS)) {
    assert.doesNotThrow(() => legalDocumentSchema.parse({ title: doc.title, body: doc.body, sections: doc.sections }), key);
  }
});
