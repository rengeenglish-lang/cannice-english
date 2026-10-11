import "server-only";
import { db } from "@/server/db";
import { setSetting } from "@/server/services/settings.service";
import { archivePdf } from "@/server/google/drive";
import { renderInvoicePdf } from "@/server/invoices/pdf";
import { invoiceFileName, type InvoiceBuyer, type InvoiceLine, type InvoiceSeller, type InvoiceView } from "@/lib/invoices/render";
import { parseShippingAddress } from "@/lib/shipping";

/**
 * In-house invoices. Netfener's company is registered in Kenya, so Turkish e-Fatura/e-Arşiv (GİB)
 * doesn't apply; every paid order gets a sequentially numbered invoice, kept in the database (so
 * it can be rebuilt at any time) and archived as a PDF in Google Drive, one folder per customer.
 */

// ---------- seller settings (Yönetim → Faturalar) ----------

const SELLER_KEYS: Record<keyof InvoiceSeller, string> = {
  name: "invoice_seller_name",
  address: "invoice_seller_address",
  country: "invoice_seller_country",
  taxId: "invoice_seller_tax_id",
  trVatNumber: "invoice_seller_tr_vat",
  email: "invoice_seller_email",
  phone: "invoice_seller_phone",
  note: "invoice_seller_note",
};
const TAX_RATE_KEY = "invoice_tax_rate";

export async function getInvoiceSettings() {
  const rows = await db.appSetting.findMany({ where: { key: { in: [...Object.values(SELLER_KEYS), TAX_RATE_KEY] } } });
  const get = (key: string, fallback = "") => rows.find((r) => r.key === key)?.value ?? fallback;
  const seller = Object.fromEntries(Object.entries(SELLER_KEYS).map(([field, key]) => [field, get(key, field === "country" ? "Kenya" : "")])) as InvoiceSeller;
  // Site prices include 20% KDV (lib/tax.ts); set 0 to print invoices without a tax line.
  const taxRate = Number(get(TAX_RATE_KEY, "20"));
  return { seller, taxRate: Number.isFinite(taxRate) && taxRate >= 0 && taxRate < 100 ? taxRate : 20 };
}

export async function saveInvoiceSettings(seller: InvoiceSeller, taxRate: number) {
  await Promise.all([
    ...Object.entries(SELLER_KEYS).map(([field, key]) => setSetting(key, seller[field as keyof InvoiceSeller].trim())),
    setSetting(TAX_RATE_KEY, String(taxRate)),
  ]);
}

// ---------- issuing ----------

const istanbulYear = (d: Date) => Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Istanbul", year: "numeric" }).format(d));
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Issues the invoice for a paid order, once (the order id is unique on invoices). Seller details and
 * the tax rate are snapshotted, so later settings changes never alter an issued invoice.
 */
export async function issueInvoiceForOrder(orderId: string) {
  const existing = await db.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true, user: { select: { name: true, email: true, phone: true } } } });
  if (!order || order.status !== "PAID") return null;
  const email = order.user?.email ?? order.guestEmail;
  if (!email) return null;
  const { seller, taxRate } = await getInvoiceSettings();
  const address = parseShippingAddress(order.shippingAddress);
  const buyer: InvoiceBuyer = {
    name: order.user?.name ?? order.guestName ?? email,
    email,
    phone: order.user?.phone ?? order.guestPhone ?? null,
    address: address ? [address.line1, address.line2, `${address.district} / ${address.city}`, address.postalCode].filter(Boolean).join(", ") : null,
  };
  const items: InvoiceLine[] = order.items.map((i) => ({ title: i.titleSnapshot, quantity: i.quantity, unitPrice: Number(i.unitPrice), lineTotal: Number(i.lineTotal) }));
  const total = Number(order.total);
  const taxAmount = taxRate > 0 ? round2(total - total / (1 + taxRate / 100)) : 0;
  const issuedAt = new Date();
  const year = istanbulYear(issuedAt);
  try {
    return await db.$transaction(async (tx) => {
      const seq = await tx.invoiceSequence.upsert({ where: { year }, create: { year, last: 1 }, update: { last: { increment: 1 } } });
      return tx.invoice.create({
        data: {
          number: `NF-${year}-${String(seq.last).padStart(6, "0")}`,
          orderId,
          userId: order.userId,
          issuedAt,
          currency: order.currency,
          subtotal: order.subtotal,
          discountTotal: order.discountTotal,
          shippingTotal: order.shippingTotal,
          total: order.total,
          taxRate,
          taxAmount,
          paymentMethod: order.payment?.provider ?? "MANUAL",
          seller,
          buyer,
          items,
        },
      });
    });
  } catch (error) {
    // Two simultaneous approvals: the other one issued it (its number is used, ours rolled back).
    if ((error as { code?: string }).code === "P2002") return db.invoice.findUnique({ where: { orderId } });
    throw error;
  }
}

/** A refunded order's invoice is marked void (never deleted or renumbered) and re-archived. */
export async function voidInvoiceForOrder(orderId: string) {
  return db.invoice.updateMany({ where: { orderId, status: "ISSUED" }, data: { status: "VOID", voidedAt: new Date(), driveDirty: true } });
}

export async function setEtimsNumber(invoiceId: string, etimsNumber: string) {
  return db.invoice.update({ where: { id: invoiceId }, data: { etimsNumber: etimsNumber.trim() || null, driveDirty: true } });
}

// ---------- reading ----------

type InvoiceRow = NonNullable<Awaited<ReturnType<typeof db.invoice.findUnique>>>;

export function toInvoiceView(row: InvoiceRow): InvoiceView {
  return {
    number: row.number,
    orderNo: row.orderId.slice(-8).toUpperCase(),
    issuedAt: row.issuedAt,
    status: row.status,
    voidedAt: row.voidedAt,
    paymentMethod: row.paymentMethod,
    seller: row.seller as unknown as InvoiceSeller,
    buyer: row.buyer as unknown as InvoiceBuyer,
    items: row.items as unknown as InvoiceLine[],
    subtotal: Number(row.subtotal),
    discountTotal: Number(row.discountTotal),
    shippingTotal: Number(row.shippingTotal),
    total: Number(row.total),
    taxRate: Number(row.taxRate),
    taxAmount: Number(row.taxAmount),
    etimsNumber: row.etimsNumber,
  };
}

/** The PDF for a viewer: the buyer (signed in, or a guest order with no account) or staff. */
export async function invoicePdfFor(invoiceId: string, viewer: { id: string; role: string } | null) {
  const row = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!row) return null;
  const isStaff = viewer?.role === "ADMIN" || viewer?.role === "TEACHER";
  const isOwner = row.userId ? viewer?.id === row.userId : false;
  if (!isStaff && !isOwner) return null;
  const view = toInvoiceView(row);
  return { fileName: invoiceFileName(view), pdf: await renderInvoicePdf(view) };
}

export function listInvoices(take = 200) {
  return db.invoice.findMany({ orderBy: { issuedAt: "desc" }, take });
}

// ---------- Google Drive archive ----------

/** Archives (or refreshes) one invoice's PDF in Drive; records the error instead of throwing. */
export async function syncInvoiceToDrive(invoiceId: string) {
  const row = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!row) return false;
  const view = toInvoiceView(row);
  try {
    const fileId = await archivePdf({
      customerKey: view.buyer.email.toLowerCase(),
      customerName: `${view.buyer.name} (${view.buyer.email})`,
      fileName: invoiceFileName(view),
      pdf: await renderInvoicePdf(view),
      fileId: row.driveFileId,
    });
    if (!fileId) return false; // Drive not connected yet: stays dirty, synced once it is
    await db.invoice.update({ where: { id: row.id }, data: { driveFileId: fileId, driveSyncedAt: new Date(), driveDirty: false, driveError: null } });
    return true;
  } catch (error) {
    await db.invoice.update({ where: { id: row.id }, data: { driveError: error instanceof Error ? error.message.slice(0, 300) : "Drive error" } });
    return false;
  }
}

/** Hourly: archive new invoices and refresh changed ones, a batch at a time. */
export async function syncDirtyInvoices(limit = 20) {
  const dirty = await db.invoice.findMany({ where: { driveDirty: true }, orderBy: { issuedAt: "asc" }, take: limit, select: { id: true } });
  let synced = 0;
  for (const { id } of dirty) if (await syncInvoiceToDrive(id)) synced += 1;
  return synced;
}

/** One-off: invoices for orders that were paid before invoicing existed. */
export async function backfillInvoices() {
  const orders = await db.order.findMany({ where: { status: "PAID", invoice: null }, orderBy: { createdAt: "asc" }, select: { id: true } });
  let issued = 0;
  for (const { id } of orders) if (await issueInvoiceForOrder(id)) issued += 1;
  return issued;
}
