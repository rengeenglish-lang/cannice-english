import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { NETFENER_EBOOKS, ebookAction, findNetfenerEbook, netfenerEbooksForExam } from "../lib/netfener-ebooks";
import { planAllows } from "../lib/plans";

test("catalogue files exist and match the supported exam groups", async () => {
  assert.equal(NETFENER_EBOOKS.length, 2);
  for (const book of NETFENER_EBOOKS) {
    const pdf = await fs.readFile(path.join(process.cwd(), "content/ebooks", book.filename));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    await fs.access(path.join(process.cwd(), "public", book.cover));
  }
  assert.equal(netfenerEbooksForExam("yokdil-saglik-bilimleri").length, 2);
  assert.deepEqual(netfenerEbooksForExam("yds").map((b) => b.slug), ["cumlenin-icini-gor"]);
  assert.equal(netfenerEbooksForExam("ielts").length, 0);
  assert.equal(findNetfenerEbook("../../secret"), undefined);
});

test("download buttons follow existing plan entitlements", () => {
  const book = NETFENER_EBOOKS[0];
  assert.equal(ebookAction(book, false, false).label, "Giriş yap");
  assert.equal(ebookAction(book, true, planAllows("BASLANGIC", "FREE_MATERIALS")).download, false);
  for (const tier of ["CIRAK", "UZMAN"] as const) {
    assert.equal(ebookAction(book, true, planAllows(tier, "FREE_MATERIALS")).href, `/api/ebooks/${book.slug}`);
  }
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
      if (name === "@/server/services/plans.service") return { getPlanAccess: async () => ({ can: (feature: string) => feature === "FREE_MATERIALS" && entitled }) };
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
