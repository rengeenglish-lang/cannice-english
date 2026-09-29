import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import { NETFENER_EBOOKS } from "../lib/netfener-ebooks";
import { editionSlug, findNetfenerEdition } from "../lib/netfener-ebook-editions";
import { FLAT_SHIPPING_TRY } from "../lib/pricing";
import { isShippedProduct, shippingTotalFor, formatShippingAddress, parseShippingAddress, shippingAddressSchema } from "../lib/shipping";

const ADDRESS = {
  name: "Ayşe Yılmaz",
  phone: "05321234567",
  line1: "Cumhuriyet Mah. Fener Sok. No 12",
  district: "Karşıyaka",
  city: "İzmir",
};

test("only physical things are shipped, and the fee is charged once per order", () => {
  for (const book of NETFENER_EBOOKS) {
    assert.equal(isShippedProduct({ slug: editionSlug(book.slug, "print") }), true, `${book.slug}: printed edition must ship`);
    assert.equal(isShippedProduct({ slug: editionSlug(book.slug, "online") }), false, `${book.slug}: online edition must not ship`);
    assert.equal(isShippedProduct({ slug: book.slug }), false, `${book.slug}: the PDF must not ship`);
  }
  // the older catalogue books are judged by their format instead
  assert.equal(isShippedProduct({ slug: "yds-deneme-sinavlari-kitabi", book: { format: "PRINT" } }), true);
  assert.equal(isShippedProduct({ slug: "yds-yokdil-kelime-defteri", book: { format: "PRINT_AND_PDF" } }), true);
  assert.equal(isShippedProduct({ slug: "the-ultimate-vocabulary-builder", book: { format: "PDF" } }), false);
  assert.equal(isShippedProduct({ slug: "set-netfener-kutuphanesi" }), false, "a bundle of e-books is not posted");

  assert.equal(shippingTotalFor([]), 0);
  assert.equal(shippingTotalFor([{ slug: "paragrafin-isigini-yak" }, { slug: "yokdil-fen-online" }]), 0, "a digital order must not be charged shipping");
  const threeBooks = [
    { slug: editionSlug("paragrafin-isigini-yak", "print") },
    { slug: editionSlug("yokdil-fen", "print") },
    { slug: "yds-deneme-sinavlari-kitabi", book: { format: "PRINT" } },
  ];
  assert.equal(shippingTotalFor(threeBooks), FLAT_SHIPPING_TRY, "one parcel, one flat fee");
});

test("an address is kept whole, and anything short of one is refused", () => {
  assert.deepEqual(parseShippingAddress(ADDRESS), ADDRESS);
  assert.equal(parseShippingAddress(null), null);
  assert.equal(parseShippingAddress({ ...ADDRESS, phone: "123" }), null, "a phone number that short is a typo");
  assert.equal(parseShippingAddress({ ...ADDRESS, city: "" }), null);
  assert.equal(shippingAddressSchema.safeParse({ ...ADDRESS, line1: "No 3" }).success, false, "an address line that short cannot be delivered to");
  assert.deepEqual(formatShippingAddress({ ...ADDRESS, postalCode: "35600", note: "Kapıcıya bırakılabilir" }), [
    "Ayşe Yılmaz",
    "05321234567",
    "Cumhuriyet Mah. Fener Sok. No 12",
    "Karşıyaka / İzmir 35600",
    "Kapıcıya bırakılabilir",
  ]);
});

/** Runs placeOrderAction against stubs, and hands back the order it tried to create. */
async function runCheckout(items: { slug: string; price: number; book?: { format: string } | null }[], form: Record<string, string>) {
  const source = await fs.readFile("app/actions/checkout.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const cart = {
    id: "cart-1",
    items: items.map((item, index) => ({
      id: `item-${index}`,
      productId: `product-${index}`,
      quantity: 1,
      unitPriceSnapshot: item.price,
      groupSlotId: null,
      product: { id: `product-${index}`, slug: item.slug, title: item.slug, category: "BOOK", isPublished: true, salePrice: item.price, book: item.book ?? null },
    })),
  };
  let created: Record<string, unknown> | undefined;
  const formData = new FormData();
  for (const [key, value] of Object.entries(form)) formData.set(key, value);

  const exported: { placeOrderAction?: (prev: unknown, data: FormData) => Promise<{ status: string; message?: string }> } = {};
  vm.runInNewContext(code, { exports: exported, FormData, console, require(name: string) {
    if (name === "@/auth") return { auth: async () => ({ user: { id: "buyer" } }) };
    if (name === "@/server/auth/context") return { getAuthContext: async () => ({ id: "buyer", role: "STUDENT" }) };
    if (name === "@/server/services/cart.service") return { getOrCreateCart: async () => cart, refreshCartPrices: async () => {} };
    if (name === "@/server/services/cart-checks.service") return { inspectCart: async () => ({ issues: [], blocking: false }) };
    if (name === "@/server/services/legal-content.service") return { getPublishedLegalContent: async () => ({ configuration: {}, documents: Object.fromEntries(["mesafeli-satis-sozlesmesi", "on-bilgilendirme-formu", "iade-politikasi"].map((key) => [key, { title: key, body: "", sections: [], draft: false }])) }) };
    if (name === "@/server/services/checkout-consent.service") return { getCheckoutConsentRequirements: async () => ({ requirements: {}, deliveries: [] }) };
    if (name === "@/lib/checkout-consent") return { acceptCheckoutConsents: () => ({ acceptedAt: "now" }) };
    if (name === "@/lib/netfener-ebook-editions") return { findNetfenerEdition };
    if (name === "@/lib/shipping") return { shippingAddressSchema, shippingTotalFor };
    if (name === "@/lib/validation/checkout") return { guestCheckoutSchema: { safeParse: () => ({ success: false }) } };
    if (name === "@/lib/cart") return { CART_COUPON_COOKIE: "coupon" };
    if (name === "@/lib/pricing") return { FLAT_SHIPPING_TRY };
    if (name === "@/server/services/coupons.service") return { validateCouponForOrder: async () => ({ ok: false, message: "yok" }), redeemCoupon: async () => {} };
    if (name === "@/server/db") return { db: {
      order: { create: async ({ data }: { data: Record<string, unknown> }) => { created = data; return { id: "order-1" }; } },
      cartItem: { deleteMany: async () => {} },
    } };
    if (name === "next/headers") return { cookies: async () => ({ delete: () => {} }) };
    if (name === "next/navigation") return { redirect: (to: string) => { throw new Error(`REDIRECT:${to}`); } };
    throw new Error(`Unexpected dependency: ${name}`);
  } });

  let result: { status: string; message?: string } | undefined;
  let redirected: string | undefined;
  try {
    result = await exported.placeOrderAction!({ status: "idle" }, formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.startsWith("REDIRECT:")) throw error;
    redirected = message.slice("REDIRECT:".length);
  }
  return { result, redirected, created };
}

test("a printed book adds the flat shipping fee and cannot be ordered without an address", async () => {
  const printed = { slug: editionSlug("paragrafin-isigini-yak", "print"), price: 449 };

  // no address typed in: the order must not be created at all
  const refused = await runCheckout([printed], { paymentMethod: "MANUAL" });
  assert.equal(refused.created, undefined, "an order with nowhere to ship to must not be written");
  assert.equal(refused.result?.status, "error");
  assert.match(refused.result!.message!, /adresi/i);

  const address = {
    shipName: ADDRESS.name, shipPhone: ADDRESS.phone, shipLine1: ADDRESS.line1,
    shipDistrict: ADDRESS.district, shipCity: ADDRESS.city, shipPostalCode: "", shipNote: "",
    paymentMethod: "MANUAL",
  };
  const placed = await runCheckout([printed], address);
  assert.equal(placed.result, undefined);
  assert.equal(placed.redirected, "/checkout/received?order=order-1");
  assert.equal(placed.created!.subtotal, 449);
  assert.equal(placed.created!.shippingTotal, FLAT_SHIPPING_TRY);
  assert.equal(placed.created!.total, 449 + FLAT_SHIPPING_TRY);
  // stored as JSON, so what lands in the column is the address without the empty optional fields
  assert.deepEqual(JSON.parse(JSON.stringify(placed.created!.shippingAddress)), ADDRESS);
  assert.equal((placed.created!.payment as { create: { amount: number } }).create.amount, 449 + FLAT_SHIPPING_TRY, "the buyer pays the shipping too");

  // a digital order is untouched by any of this
  const digital = await runCheckout([{ slug: "paragrafin-isigini-yak", price: 299 }], { paymentMethod: "MANUAL" });
  assert.equal(digital.redirected, "/checkout/received?order=order-1");
  assert.equal(digital.created!.shippingTotal, 0);
  assert.equal(digital.created!.total, 299);
  assert.equal(digital.created!.shippingAddress, undefined);
});

test("the print queue export carries the address and only the printed lines", async () => {
  const source = await fs.readFile("app/api/admin/baski-siparisleri/route.ts", "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  let role = "STUDENT";
  const orders = [{
    id: "order-9",
    createdAt: new Date("2026-09-29T08:00:00Z"),
    shippingAddress: { ...ADDRESS, note: 'Zile "iki kez" bas, virgül, tamam' },
    guestName: null, guestPhone: null, guestEmail: null,
    user: { name: "Ayşe Yılmaz", email: "ayse@example.com" },
    items: [
      { id: "i1", titleSnapshot: "Paragrafın Işığını Yak 1 — Basılı", quantity: 2, product: { slug: editionSlug("paragrafin-isigini-yak", "print"), book: null } },
      { id: "i2", titleSnapshot: "Paragrafın Işığını Yak 2", quantity: 1, product: { slug: "paragrafin-isigini-yak-cilt-2", book: null } },
    ],
  }];
  const exported: { GET?: () => Promise<Response> } = {};
  vm.runInNewContext(code, { exports: exported, Response, Date, require(name: string) {
    if (name === "@/server/auth/context") return { getAuthContext: async () => ({ id: "u", role }) };
    if (name === "@/server/services/orders.service") return { listPrintOrders: async () => orders };
    if (name === "@/lib/shipping") return { isShippedProduct, parseShippingAddress };
    throw new Error(`Unexpected dependency: ${name}`);
  } });

  assert.equal((await exported.GET!()).status, 403, "a student must not be able to read customer addresses");
  role = "ADMIN";
  const response = await exported.GET!();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type")!, /text\/csv/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  // read the bytes, because Response.text() strips the very marker being checked for
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf], "Excel needs the BOM to read Turkish characters");
  const csv = new TextDecoder().decode(bytes);
  const [header, row] = csv.trim().split("\n");
  assert.match(header, /^"Sipariş","Tarih"/);
  assert.ok(row.includes('"2026-09-29"'), row);
  assert.ok(row.includes('"Karşıyaka"') && row.includes('"İzmir"'), row);
  // a quote inside the note is doubled, so the comma cannot split the row
  assert.ok(row.includes('"Zile ""iki kez"" bas, virgül, tamam"'), row);
  assert.ok(row.includes('"Paragrafın Işığını Yak 1 — Basılı × 2"'), row);
  assert.equal(row.includes("Paragrafın Işığını Yak 2\""), false, "the e-book line does not go to the printer");
});
