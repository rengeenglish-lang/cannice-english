import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { NETFENER_EBOOKS, findNetfenerEbook, netfenerEbooksForExam } from "../lib/netfener-ebooks";
import { NETFENER_EBOOK_PITCH, findEbookPitch } from "../lib/netfener-ebook-copy";
import { NETFENER_BUNDLES, bundlesContainingEbook, bundleBooks, findNetfenerBundle } from "../lib/netfener-bundles";
import { EBOOK_EDITIONS, editionSlug, slugsGranting, findNetfenerEdition } from "../lib/netfener-ebook-editions";

test("catalogue files exist and match the supported exam groups", async () => {
  assert.equal(NETFENER_EBOOKS.length, 7);
  for (const book of NETFENER_EBOOKS) {
    const pdf = await fs.readFile(path.join(process.cwd(), "content/ebooks", book.filename));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    await fs.access(path.join(process.cwd(), "public", book.cover));
  }
  assert.equal(netfenerEbooksForExam("yokdil-saglik-bilimleri").length, 5);
  assert.deepEqual(netfenerEbooksForExam("yds").map((b) => b.slug), ["cumlenin-icini-gor", "kelimenin-izini-sur", "paragrafin-isigini-yak", "paragrafin-isigini-yak-cilt-2"]);
  assert.deepEqual(netfenerEbooksForExam("yokdil-fen-bilimleri").map((b) => b.slug), ["cumlenin-icini-gor", "kelimenin-izini-sur", "paragrafin-isigini-yak", "paragrafin-isigini-yak-cilt-2", "yokdil-fen"]);
  assert.deepEqual(netfenerEbooksForExam("yokdil-sosyal-bilimler").map((b) => b.slug), ["cumlenin-icini-gor", "kelimenin-izini-sur", "paragrafin-isigini-yak", "paragrafin-isigini-yak-cilt-2", "yokdil-sosyal"]);
  assert.equal(netfenerEbooksForExam("ielts").length, 0);
  assert.equal(findNetfenerEbook("../../secret"), undefined);
});

test("every book carries sales copy, and the copy describes a real book", () => {
  assert.equal(Object.keys(NETFENER_EBOOK_PITCH).length, NETFENER_EBOOKS.length);
  for (const book of NETFENER_EBOOKS) {
    const pitch = findEbookPitch(book.slug);
    assert.ok(pitch, `${book.slug}: no sales copy`);
    assert.ok(pitch.lead.length > 120, `${book.slug}: lead too thin to sell with`);
    assert.ok(pitch.closing.length > 40, `${book.slug}: no closing line`);
    assert.ok(pitch.sections.length >= 4, `${book.slug}: fewer than four sections`);
    for (const section of pitch.sections) {
      assert.ok(section.title.length > 0 && section.body.length > 80, `${book.slug}: thin section`);
    }
    // The page count on the card and the one the copy advertises must not disagree.
    const pages = pitch.facts.find((fact) => fact.label === "Sayfa");
    assert.equal(pages?.value, String(book.pages), `${book.slug}: page count disagrees with the catalogue`);
  }
  assert.equal(findEbookPitch("../../secret"), undefined);
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
    if (name === "@/lib/netfener-bundles") return { NETFENER_BUNDLES, bundlesContainingEbook };
    if (name === "@/lib/netfener-ebook-editions") return { EBOOK_EDITIONS, editionSlug, slugsGranting };
    if (name === "@/server/db") return { db: { orderItem: { findFirst: async ({ where }: { where: { order: { userId: string; status: string }; product: { slug: { in: string[] }; category: string } } }) =>
      order.userId === where.order.userId && order.status === where.order.status && where.product.slug.in.includes(order.slug) && order.category === where.product.category ? { id: "paid-item" } : null,
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

test("bundles list real books and a bundle purchase unlocks each of them", async () => {
  assert.ok(NETFENER_BUNDLES.length >= 4);
  const slugs = new Set<string>();
  for (const bundle of NETFENER_BUNDLES) {
    assert.equal(slugs.has(bundle.slug), false, `${bundle.slug}: duplicate bundle slug`);
    slugs.add(bundle.slug);
    assert.equal(findNetfenerEbook(bundle.slug), undefined, `${bundle.slug}: collides with a book slug`);
    assert.ok(bundle.books.length >= 2, `${bundle.slug}: a bundle needs at least two books`);
    assert.equal(new Set(bundle.books).size, bundle.books.length, `${bundle.slug}: repeats a book`);
    // every listed book must exist, or the card would render a hole where a cover goes
    assert.equal(bundleBooks(bundle).length, bundle.books.length, `${bundle.slug}: unknown book slug`);
  }
  assert.equal(findNetfenerBundle("../../secret"), undefined);
  for (const book of NETFENER_EBOOKS) {
    for (const bundleSlug of bundlesContainingEbook(book.slug)) {
      assert.ok(findNetfenerBundle(bundleSlug), `${book.slug}: maps to a bundle that does not exist`);
    }
  }

  const source = await fs.readFile("server/services/ebooks.service.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exported: { hasPurchasedEbook?: (user: string, slug: string) => Promise<boolean> } = {};
  // The buyer owns the bundle row only — never the individual book row.
  const owned = "set-netfener-kutuphanesi";
  vm.runInNewContext(code, { exports: exported, require(name: string) {
    if (name === "server-only") return {};
    if (name === "@/lib/netfener-ebooks") return { NETFENER_EBOOKS, findNetfenerEbook };
    if (name === "@/lib/netfener-bundles") return { NETFENER_BUNDLES, bundlesContainingEbook };
    if (name === "@/lib/netfener-ebook-editions") return { EBOOK_EDITIONS, editionSlug, slugsGranting };
    if (name === "@/server/db") return { db: { orderItem: { findFirst: async ({ where }: { where: { product: { slug: { in: string[] } } } }) =>
      where.product.slug.in.includes(owned) ? { id: "paid-bundle" } : null } } };
    throw new Error(name);
  } });
  const owns = exported.hasPurchasedEbook!;
  for (const book of NETFENER_EBOOKS) {
    assert.equal(await owns("buyer", book.slug), true, `${book.slug}: library bundle did not unlock it`);
  }
});

test("editions: a heavier purchase covers the lighter one, and print stands alone", () => {
  for (const book of NETFENER_EBOOKS) {
    assert.equal(editionSlug(book.slug, "pdf"), book.slug, "the PDF edition must keep the historic slug");
    assert.equal(editionSlug(book.slug, "online"), `${book.slug}-online`);
    assert.equal(editionSlug(book.slug, "print"), `${book.slug}-basili`);
    // reading online is granted by any of the three purchases
    const online: string[] = slugsGranting(book.slug, "online");
    for (const edition of EBOOK_EDITIONS) assert.ok(online.includes(editionSlug(book.slug, edition)), `${book.slug}: ${edition} should grant online`);
    // the download is not granted by the cheaper online edition
    const pdf: string[] = slugsGranting(book.slug, "pdf");
    assert.deepEqual(pdf, [book.slug]);
    const onlineSlug = editionSlug(book.slug, "online");
    assert.equal(pdf.some((granted) => granted === onlineSlug), false, `${book.slug}: online must not unlock the PDF`);
    // every edition slug leads back to exactly this book and this edition
    for (const edition of EBOOK_EDITIONS) {
      assert.deepEqual(findNetfenerEdition(editionSlug(book.slug, edition)), { book, edition }, `${book.slug}: ${edition} slug does not lead back`);
    }
    // an edition slug must never collide with another book or a bundle
    for (const edition of EBOOK_EDITIONS) {
      const slug = editionSlug(book.slug, edition);
      if (edition !== "pdf") assert.equal(findNetfenerEbook(slug), undefined, `${slug}: collides with a book slug`);
      assert.equal(findNetfenerBundle(slug), undefined, `${slug}: collides with a bundle slug`);
    }
  }
  // slugs that are not ours stay not ours, suffix or no suffix
  for (const slug of ["ielts-reading-practice-book", "set-netfener-kutuphanesi", "the-ultimate-vocabulary-builder-online", "../../secret", "-basili"]) {
    assert.equal(findNetfenerEdition(slug), undefined, `${slug}: must not be read as one of our books`);
  }
});

test("cart requires login and a set price, without promising plan access to paid books", async () => {
  type Issue = { level: string; message: string };
  type Details = { typeLabel: string; href: string };
  type Inspect = (cart: unknown, user: unknown) => Promise<{ issues: Issue[]; details: Map<string, Details>; blocking: boolean }>;
  const source = await fs.readFile("server/services/cart-checks.service.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  // what the buyer is entitled to before this purchase, per edition
  let alreadyOwns = false;
  const exported: { inspectCart?: Inspect } = {};
  vm.runInNewContext(code, { exports: exported, Map, Number, Boolean, require(name: string) {
    if (name === "server-only") return {};
    if (name === "@/lib/netfener-ebook-editions") return { findNetfenerEdition };
    if (name === "@/server/services/ebooks.service") return { hasEbookAccess: async () => alreadyOwns };
    if (name === "@/server/db") return { db: { orderItem: { findMany: async () => [] } } };
    if (name === "@/server/services/plans.service") return { getPlanAccess: async () => ({ can: () => true }) };
    if (["@/server/services/group-availability.service", "@/lib/diagnostics/access", "@/lib/billing", "@/lib/availability", "@/lib/plans"].includes(name)) return {};
    throw new Error(name);
  } });
  const product = { id: "book-id", slug: "yokdil-saglik", title: "YÖKDİL Sağlık", category: "BOOK", isPublished: true, salePrice: 100, book: { format: "PDF", digitalFileUrl: "/api/ebooks/yokdil-saglik" } };
  const cart = { items: [{ id: "item", productId: product.id, product }] };
  const inspect = exported.inspectCart!;
  const member = { id: "subscriber", role: "STUDENT" };
  assert.equal((await inspect(cart, null)).blocking, true);
  const signedIn = await inspect(cart, member);
  assert.equal(signedIn.blocking, false);
  assert.equal(signedIn.issues.length, 0);
  // a plan does not quietly turn one of our books into a free download
  assert.equal(signedIn.details.get("item")!.typeLabel, "E-Kitap (PDF)");
  product.salePrice = 0;
  assert.equal((await inspect(cart, member)).blocking, true);
  product.salePrice = 100;

  // the online edition sells under its own slug, and the same rules have to reach it
  const online = { ...product, id: "online-id", slug: editionSlug("yokdil-saglik", "online"), title: "YÖKDİL Sağlık — online", book: null };
  const onlineCart = { items: [{ id: "item", productId: online.id, product: online }] };
  assert.equal((await inspect(onlineCart, null)).blocking, true, "an edition must not be bought signed out");
  const buying = await inspect(onlineCart, member);
  assert.equal(buying.blocking, false);
  assert.equal(buying.details.get("item")!.typeLabel, "E-Kitap (online okuma)");
  assert.equal(buying.details.get("item")!.href, "/kaynaklar/e-kitaplar/onizleme/yokdil-saglik");
  alreadyOwns = true;
  assert.equal((await inspect(onlineCart, member)).blocking, true, "buying a book you can already read must be blocked");
  // but another printed copy is a reasonable thing to order
  const print = { ...online, id: "print-id", slug: editionSlug("yokdil-saglik", "print") };
  const printCart = { items: [{ id: "item", productId: print.id, product: print }] };
  const reorder = await inspect(printCart, member);
  assert.equal(reorder.blocking, false);
  assert.equal(reorder.details.get("item")!.typeLabel, "Basılı Kitap");
  alreadyOwns = false;
});

test("page images are gated per book, and the online edition is what unlocks them", async () => {
  const source = await fs.readFile("app/api/ebooks/[slug]/sayfa/[page]/route.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  let signedIn = false;
  let entitled = false;
  const asked: { slug: string; edition: string }[] = [];
  const rendered: { slug: string; page: number }[] = [];
  const image = new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]);
  const exported: { GET?: (request: Request, context: { params: Promise<{ slug: string; page: string }> }) => Promise<Response> } = {};
  vm.runInNewContext(code, { exports: exported, Response, Uint8Array, String, Number, require(name: string) {
    if (name === "@/server/auth/context") return { getAuthContext: async () => signedIn ? { id: "test-user" } : null };
    if (name === "@/server/services/ebooks.service") return { hasEbookAccess: async (_user: string, slug: string, edition: string) => { asked.push({ slug, edition }); return entitled; } };
    if (name === "@/server/services/ebook-pages.service") return { renderEbookPage: async (slug: string, page: number) => {
      // the real service refuses a page outside the book, and the route must turn that into a 404
      if (!Number.isInteger(page) || page < 1 || page > 135) throw new Error("Page out of range");
      rendered.push({ slug, page });
      return image;
    } };
    if (name === "@/lib/netfener-ebooks") return { findNetfenerEbook };
    throw new Error(`Unexpected dependency: ${name}`);
  } });
  const get = (slug: string, page: string) => exported.GET!(new Request(`https://example.test/api/ebooks/${slug}/sayfa/${page}`), { params: Promise.resolve({ slug, page }) });

  assert.equal((await get("../../secret", "1")).status, 404);
  assert.equal((await get("paragrafin-isigini-yak", "1")).status, 401);
  signedIn = true;
  assert.equal((await get("paragrafin-isigini-yak", "1")).status, 403);
  // nothing is rasterised for a visitor who has not bought the book
  assert.deepEqual(rendered, []);
  assert.deepEqual(asked, [{ slug: "paragrafin-isigini-yak", edition: "online" }]);

  entitled = true;
  const response = await get("paragrafin-isigini-yak", "7");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  // the buyer's own browser may keep pages it has turned to; shared caches must not
  assert.equal(response.headers.get("cache-control"), "private, max-age=3600");
  assert.equal(response.headers.get("content-length"), String(image.byteLength));
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), image);
  assert.deepEqual(rendered, [{ slug: "paragrafin-isigini-yak", page: 7 }]);

  for (const page of ["0", "999999", "abc", "-1", "1.5"]) {
    assert.equal((await get("paragrafin-isigini-yak", page)).status, 404, `page ${page} should not render`);
  }
  assert.equal(rendered.length, 1);
});
