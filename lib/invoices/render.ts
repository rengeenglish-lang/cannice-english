/**
 * The invoice as HTML (laid out to an A4 PDF by server/invoices/pdf.ts). Pure, so its content is
 * unit-tested. Bilingual headings (Turkish buyers, Kenyan seller); amounts in TL.
 */
export type InvoiceSeller = {
  name: string;
  address: string;
  country: string;
  taxId: string;
  /** Turkish VAT registration for foreign e-service providers, when the company has one. */
  trVatNumber: string;
  email: string;
  phone: string;
  note: string;
};

export type InvoiceBuyer = { name: string; email: string; phone?: string | null; address?: string | null };
export type InvoiceLine = { title: string; quantity: number; unitPrice: number; lineTotal: number };

export type InvoiceView = {
  number: string;
  orderNo: string;
  issuedAt: Date;
  status: "ISSUED" | "VOID";
  voidedAt?: Date | null;
  paymentMethod: string;
  seller: InvoiceSeller;
  buyer: InvoiceBuyer;
  items: InvoiceLine[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  taxRate: number;
  taxAmount: number;
  etimsNumber?: string | null;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tl = (n: number) => `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} TL`;
const date = (d: Date) => new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
const lines = (...parts: (string | null | undefined)[]) => parts.filter((p) => p && p.trim()).map((p) => esc(p!.trim())).join("<br>");

export const PAYMENT_LABELS: Record<string, string> = { PAYPAL: "Kredi kartı / Credit card", MANUAL: "Havale-EFT / Bank transfer" };

export function invoiceFileName(v: Pick<InvoiceView, "number" | "issuedAt">) {
  return `${v.number} - ${v.issuedAt.toISOString().slice(0, 10)}.pdf`;
}

export function renderInvoiceHtml(v: InvoiceView) {
  const s = v.seller;
  const rows = v.items
    .map((i) => `<tr><td>${esc(i.title)}</td><td class="r">${i.quantity}</td><td class="r">${tl(i.unitPrice)}</td><td class="r">${tl(i.lineTotal)}</td></tr>`)
    .join("");
  const totals = [
    ["Ara toplam / Subtotal", tl(v.subtotal)],
    ...(v.discountTotal > 0 ? [["İndirim / Discount", `-${tl(v.discountTotal)}`]] : []),
    ...(v.shippingTotal > 0 ? [["Kargo / Shipping", tl(v.shippingTotal)]] : []),
    ...(v.taxAmount > 0 ? [[`Dahil KDV %${v.taxRate} / VAT included`, tl(v.taxAmount)]] : []),
  ];
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;font-size:9.5pt;color:#10291c;margin:0}
.top{width:100%;border-bottom:2pt solid #0b6b3a;padding-bottom:8pt}
h1{font-size:20pt;color:#0b6b3a;margin:0}
.muted{color:#55665c;font-size:8.5pt}
table{border-collapse:collapse;width:100%}
.meta td{padding:2pt 0;vertical-align:top}
.items th{background:#edf5ef;text-align:left;padding:5pt;border-bottom:1pt solid #b9d3c2;font-size:8.5pt}
.items td{padding:5pt;border-bottom:0.5pt solid #d8e8dd}
.r{text-align:right}
.totals td{padding:3pt 5pt}
.grand td{font-weight:bold;font-size:11pt;border-top:1pt solid #0b6b3a}
.void{color:#b42318;font-size:16pt;font-weight:bold;border:2pt solid #b42318;padding:4pt;text-align:center}
.box{border:0.5pt solid #d8e8dd;padding:6pt}
</style></head><body>
<table class="top"><tr><td><h1>FATURA / INVOICE</h1><div class="muted">Netfener</div></td>
<td class="r"><b>No:</b> ${esc(v.number)}<br><b>Tarih / Date:</b> ${date(v.issuedAt)}<br><b>Sipariş / Order:</b> #${esc(v.orderNo)}${v.etimsNumber ? `<br><b>KRA eTIMS:</b> ${esc(v.etimsNumber)}` : ""}</td></tr></table>
${v.status === "VOID" ? `<p class="void">İPTAL EDİLDİ / VOID${v.voidedAt ? ` — ${date(v.voidedAt)}` : ""}</p>` : ""}
<table class="meta" style="margin-top:12pt"><tr>
<td style="width:50%;padding-right:8pt"><div class="box"><b>Satıcı / Seller</b><br>${lines(s.name, s.address, s.country)}${s.taxId ? `<br>KRA PIN: ${esc(s.taxId)}` : ""}${s.trVatNumber ? `<br>TR KDV No / VAT ID: ${esc(s.trVatNumber)}` : ""}${s.email || s.phone ? `<br>${lines([s.email, s.phone].filter(Boolean).join(" · "))}` : ""}</div></td>
<td style="width:50%;padding-left:8pt"><div class="box"><b>Alıcı / Buyer</b><br>${lines(v.buyer.name, v.buyer.address, v.buyer.email, v.buyer.phone)}</div></td>
</tr></table>
<table class="items" style="margin-top:14pt"><tr><th>Açıklama / Description</th><th class="r">Adet / Qty</th><th class="r">Birim / Unit</th><th class="r">Tutar / Amount</th></tr>${rows}</table>
<table class="totals" style="margin-top:6pt">${totals.map(([k, val]) => `<tr><td width="45%"></td><td class="r">${esc(k)}</td><td class="r" width="22%">${val}</td></tr>`).join("")}
<tr class="grand"><td width="45%" style="border-top:none"></td><td class="r">Genel toplam / Total</td><td class="r" width="22%">${tl(v.total)}</td></tr></table>
<p class="muted" style="margin-top:14pt">Ödeme / Payment: ${esc(PAYMENT_LABELS[v.paymentMethod] ?? v.paymentMethod)} — Para birimi / Currency: TRY</p>
${s.note ? `<p class="muted">${esc(s.note)}</p>` : ""}
</body></html>`;
}
