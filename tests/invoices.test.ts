import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { seal, open } from "../lib/crypto/secret-box";
import { renderInvoiceHtml } from "../lib/invoices/render";
import { markOrderPaid, markOrderRefunded } from "../server/services/orders.service";
import { invoicePdfFor, issueInvoiceForOrder, syncDirtyInvoices } from "../server/services/invoices.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");

// Google is replaced by a recorder: token refresh, folder creation and uploads.
const calls: { method: string; url: string; body?: string }[] = [];
let nextId = 0;
const realFetch = globalThis.fetch;
before(async () => {
  process.env.AUTH_SECRET ??= "test-secret-test-secret-test-secret-123";
  process.env.GOOGLE_DRIVE_CLIENT_ID = "client";
  process.env.GOOGLE_DRIVE_CLIENT_SECRET = "secret";
  delete process.env.RESEND_API_KEY;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const u = String(input);
    if (u.startsWith("https://oauth2.googleapis.com/token")) return new Response(JSON.stringify({ access_token: "at" }), { status: 200 });
    if (u.startsWith("https://www.googleapis.com/")) {
      const method = init?.method ?? "GET";
      calls.push({ method, url: u, body: typeof init?.body === "string" ? init.body : init?.body ? Buffer.from(init.body as Buffer).toString("latin1").slice(0, 400) : undefined });
      if (method === "GET") return new Response(JSON.stringify({ id: "x", trashed: false }), { status: 200 });
      return new Response(JSON.stringify({ id: `drive_${++nextId}` }), { status: 200 });
    }
    return realFetch(input, init);
  }) as typeof fetch;
  await db.appSetting.upsert({ where: { key: "google_drive_refresh_token" }, create: { key: "google_drive_refresh_token", value: seal("rt", process.env.AUTH_SECRET!, "google-drive") }, update: { value: seal("rt", process.env.AUTH_SECRET!, "google-drive") } });
  await db.driveFolder.deleteMany({});
});
after(async () => {
  globalThis.fetch = realFetch;
  await db.appSetting.deleteMany({ where: { key: "google_drive_refresh_token" } });
  await db.driveFolder.deleteMany({});
  await db.$disconnect();
});

test("secret box round-trips and rejects tampering or the wrong key", () => {
  const sealed = seal("refresh-token", "k1", "p");
  assert.equal(open(sealed, "k1", "p"), "refresh-token");
  assert.equal(open(sealed, "k2", "p"), null);
  assert.equal(open(sealed, "k1", "other"), null);
  assert.equal(open(sealed.slice(0, -2) + "AA", "k1", "p"), null);
});

test("invoice HTML: escaped, bilingual, void stamp, tax line only when set", () => {
  const base = {
    number: "NF-2026-000001",
    orderNo: "ABCD1234",
    issuedAt: new Date("2026-10-11T10:00:00Z"),
    status: "ISSUED" as const,
    paymentMethod: "MANUAL",
    seller: { name: "Netfener Ltd", address: "Nairobi", country: "Kenya", taxId: "P051234567X", trVatNumber: "", email: "destek@netfener.com", phone: "", note: "" },
    buyer: { name: "<script>Ali</script>", email: "ali@example.test" },
    items: [{ title: "Kelimenin İzini Sür (PDF)", quantity: 1, unitPrice: 499, lineTotal: 499 }],
    subtotal: 499,
    discountTotal: 0,
    shippingTotal: 0,
    total: 499,
    taxRate: 20,
    taxAmount: 83.17,
  };
  const html = renderInvoiceHtml(base);
  assert.ok(html.includes("FATURA / INVOICE") && html.includes("KRA PIN: P051234567X"));
  assert.ok(html.includes("&lt;script&gt;") && !html.includes("<script>Ali"));
  assert.ok(html.includes("Dahil KDV %20") && html.includes("83,17 TL"));
  assert.ok(!html.includes("İPTAL"));
  const voided = renderInvoiceHtml({ ...base, status: "VOID", taxRate: 0, taxAmount: 0 });
  assert.ok(voided.includes("İPTAL EDİLDİ / VOID") && !voided.includes("Dahil KDV"));
});

test("paid orders get one sequential invoice, archived per customer; refunds void it", async () => {
  const buyer = await db.user.create({ data: { email: `inv-${randomUUID()}@example.test`, name: "Ayşe Yılmaz", role: "STUDENT" } });
  const other = await db.user.create({ data: { email: `inv-${randomUUID()}@example.test`, name: "Başka", role: "STUDENT" } });
  const product = await db.product.create({ data: { slug: `inv-${randomUUID()}`, title: "Test e-kitap", category: "BOOK", basePrice: 499, salePrice: 499 } });
  const mk = () =>
    db.order.create({
      data: {
        userId: buyer.id,
        status: "AWAITING_PAYMENT",
        subtotal: 499,
        total: 499,
        items: { create: [{ productId: product.id, titleSnapshot: "Test e-kitap", unitPrice: 499, quantity: 1, lineTotal: 499 }] },
        payment: { create: { provider: "MANUAL", amount: 499 } },
      },
    });
  const [a, b, unpaid] = [await mk(), await mk(), await mk()];
  try {
    calls.length = 0;
    await markOrderPaid(a.id);
    await markOrderPaid(a.id); // double approval
    await markOrderPaid(b.id);
    const invA = await db.invoice.findUniqueOrThrow({ where: { orderId: a.id } });
    const invB = await db.invoice.findUniqueOrThrow({ where: { orderId: b.id } });
    assert.match(invA.number, /^NF-\d{4}-\d{6}$/);
    // Other test files may pay orders at the same moment, so only the order is certain here.
    assert.ok(Number(invB.number.slice(-6)) > Number(invA.number.slice(-6)), "numbers increase");
    assert.equal(await issueInvoiceForOrder(unpaid.id), null, "no invoice before payment");
    assert.equal(Number(invA.taxAmount), 83.17);

    // Archived right away: root folder once, the customer's folder once, one upload per invoice.
    const folders = calls.filter((c) => c.method === "POST" && c.url.includes("/drive/v3/files?") && c.body?.includes("google-apps.folder"));
    assert.equal(folders.length, 2);
    assert.ok(folders[1].body!.includes("Ayşe Yılmaz"));
    assert.equal(calls.filter((c) => c.url.includes("/upload/drive/v3/files?uploadType=multipart")).length, 2);
    assert.ok(!invA.driveDirty && invA.driveFileId);

    // Only the buyer and staff can download; the PDF is real.
    assert.equal(await invoicePdfFor(invA.id, { id: other.id, role: "STUDENT" }), null);
    const pdf = await invoicePdfFor(invA.id, { id: buyer.id, role: "STUDENT" });
    assert.ok(pdf && Buffer.from(pdf.pdf.slice(0, 5)).toString() === "%PDF-");
    assert.ok(pdf.fileName.startsWith(invA.number));

    // Refund: void, same number, the Drive file updated in place.
    calls.length = 0;
    await markOrderRefunded(a.id);
    const voided = await db.invoice.findUniqueOrThrow({ where: { orderId: a.id } });
    assert.equal(voided.status, "VOID");
    assert.equal(voided.number, invA.number);
    assert.ok(calls.some((c) => c.method === "PATCH" && c.url.includes(`/upload/drive/v3/files/${invA.driveFileId}`)));
    assert.equal(await syncDirtyInvoices(), 0, "nothing left to archive");
  } finally {
    await db.invoice.deleteMany({ where: { orderId: { in: [a.id, b.id, unpaid.id] } } });
    await db.order.deleteMany({ where: { id: { in: [a.id, b.id, unpaid.id] } } });
    await db.product.delete({ where: { id: product.id } });
    await db.user.deleteMany({ where: { id: { in: [buyer.id, other.id] } } });
  }
});
