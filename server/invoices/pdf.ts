import "server-only";
import { renderInvoiceHtml, type InvoiceView } from "@/lib/invoices/render";

let mupdfPromise: Promise<typeof import("mupdf")> | undefined;

/** Lays the invoice HTML out on A4 with mupdf (already used for the e-books) and returns the PDF. */
export async function renderInvoicePdf(view: InvoiceView): Promise<Uint8Array> {
  mupdfPromise ??= import("mupdf");
  const mupdf = await mupdfPromise;
  const html = new TextEncoder().encode(renderInvoiceHtml(view));
  const doc = mupdf.Document.openDocument(html, "text/html");
  // A4 in points, with the margin applied by drawing the laid-out page inset.
  const margin = 40;
  doc.layout(595 - margin * 2, 842 - margin * 2, 10);
  const buffer = new mupdf.Buffer();
  const writer = new mupdf.DocumentWriter(buffer, "PDF", "compress");
  for (let i = 0; i < doc.countPages(); i++) {
    const page = doc.loadPage(i);
    const device = writer.beginPage([0, 0, 595, 842]);
    page.run(device, mupdf.Matrix.translate(margin, margin));
    writer.endPage();
  }
  writer.close();
  return buffer.asUint8Array();
}
