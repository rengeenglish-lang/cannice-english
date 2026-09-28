import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { NETFENER_EBOOKS, findNetfenerEbook, netfenerEbooksForExam } from "../lib/netfener-ebooks";

test("catalogue files exist and match the supported exam groups", async () => {
  assert.equal(NETFENER_EBOOKS.length, 5);
  for (const book of NETFENER_EBOOKS) {
    const pdf = await fs.readFile(path.join(process.cwd(), "content/ebooks", book.filename));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    await fs.access(path.join(process.cwd(), "public", book.cover));
  }
  assert.equal(netfenerEbooksForExam("yokdil-saglik-bilimleri").length, 3);
  assert.deepEqual(netfenerEbooksForExam("yds").map((b) => b.slug), ["cumlenin-icini-gor", "kelimenin-izini-sur"]);
  assert.deepEqual(netfenerEbooksForExam("yokdil-fen-bilimleri").map((b) => b.slug), ["cumlenin-icini-gor", "kelimenin-izini-sur", "yokdil-fen"]);
  assert.deepEqual(netfenerEbooksForExam("yokdil-sosyal-bilimler").map((b) => b.slug), ["cumlenin-icini-gor", "kelimenin-izini-sur", "yokdil-sosyal"]);
  assert.equal(netfenerEbooksForExam("ielts").length, 0);
  assert.equal(findNetfenerEbook("../../secret"), undefined);
});

test("download endpoint enforces access before reading files and serves the exact PDF", async () => {
  const source = await fs.readFile("app/api/ebooks/[slug]/route.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  let signedIn = false;
  let entitled = false;
  let reads = 0;
  const exported: { GET?: (request: Request, context: { params: Promise<{ slug: string }> }) => Promise<Response> } = {};
  const sandbox = {
    exports: exported, Response, Uint8Array, process: { cwd: () => process.cwd() },
    require(name: string) {
      if (name === "node:fs/promises") return { readFile: async (file: string) => { reads++; return fs.readFile(file); } };
      if (name === "node:path") return path;
      if (name === "@/server/auth/context") return { getAuthContext: async () => signedIn ? { id: "test-user" } : null };
      if (name === "@/server/services/ebooks.service") return { hasPurchasedEbook: async () => entitled };
      if (name === "@/lib/netfener-ebooks") return { findNetfenerEbook };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(code, sandbox);
  const get = (slug: string) => exported.GET!(new Request("https://example.test/api/ebooks/" + slug), { params: Promise.resolve({ slug }) });
  assert.equal((await get("../../secret")).status, 404);
  assert.equal((await get("yokdil-saglik")).status, 401);
  signedIn = true;
  assert.equal((await get("yokdil-saglik")).status, 403);
  assert.equal(reads, 0);
  entitled = true;
  for (const book of NETFENER_EBOOKS) {
    const response = await get(book.slug);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.match(response.headers.get("content-disposition")!, /^attachment; filename="netfener-/);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(bytes, await fs.readFile(path.join("content/ebooks", book.filename)));
  }
});


test("purchase entitlement requires this account, this book and a paid order", async () => {
  const source = await fs.readFile("server/services/ebooks.service.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  let order = { userId: "buyer", status: "PAID", slug: "yokdil-saglik", category: "BOOK" };
  const exported: { hasPurchasedEbook?: (user: string, slug: string) => Promise<boolean> } = {};
  vm.runInNewContext(code, { exports: exported, require(name: string) {
    if (name === "server-only") return {};
    if (name === "@/lib/netfener-ebooks") return { NETFENER_EBOOKS, findNetfenerEbook };
    if (name === "@/server/db") return { db: { orderItem: { findFirst: async ({ where }: { where: { order: { userId: string; status: string }; product: { slug: string; category: string } } }) =>
      order.userId === where.order.userId && order.status === where.order.status && order.slug === where.product.slug && order.category === where.product.category ? { id: "paid-item" } : null,
    } } };
    throw new Error(name);
  } });
  const owns = exported.hasPurchasedEbook!;
  assert.equal(await owns("buyer", "yokdil-saglik"), true);
  assert.equal(await owns("other-user", "yokdil-saglik"), false);
  assert.equal(await owns("buyer", "cumlenin-icini-gor"), false);
  assert.equal(await owns("", "yokdil-saglik"), false);
  for (const status of ["PENDING", "AWAITING_PAYMENT", "REFUNDED", "CANCELLED"]) {
    order = { ...order, status };
    assert.equal(await owns("buyer", "yokdil-saglik"), false);
  }
  order = { ...order, status: "PAID", category: "PLAN" };
  assert.equal(await owns("buyer", "yokdil-saglik"), false);
});

test("cart requires login and a set price, without promising plan access to paid books", async () => {
  const source = await fs.readFile("server/services/cart-checks.service.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  type Issue = { level: string; message: string };
  const exported: { inspectCart?: (cart: unknown, user: unknown) => Promise<{ issues: Issue[]; blocking: boolean }> } = {};
  vm.runInNewContext(code, { exports: exported, require(name: string) {
    if (name === "server-only") return {};
    if (name === "@/lib/netfener-ebooks") return { findNetfenerEbook };
    if (name === "@/server/db") return { db: { orderItem: { findMany: async () => [] } } };
    if (name === "@/server/services/plans.service") return { getPlanAccess: async () => ({ can: () => true }) };
    if (["@/server/services/group-availability.service", "@/lib/diagnostics/access", "@/lib/billing", "@/lib/availability", "@/lib/plans"].includes(name)) return {};
    throw new Error(name);
  } });
  const product = { id: "book-id", slug: "yokdil-saglik", title: "YÖKDİL Sağlık", category: "BOOK", isPublished: true, salePrice: 100, book: { format: "PDF", digitalFileUrl: "/api/ebooks/yokdil-saglik" } };
  const cart = { items: [{ id: "item", productId: product.id, product }] };
  const inspect = exported.inspectCart!;
  assert.equal((await inspect(cart, null)).blocking, true);
  const member = await inspect(cart, { id: "subscriber", role: "STUDENT" });
  assert.equal(member.blocking, false);
  assert.equal(member.issues.length, 0);
  product.salePrice = 0;
  assert.equal((await inspect(cart, { id: "subscriber", role: "STUDENT" })).blocking, true);
});
