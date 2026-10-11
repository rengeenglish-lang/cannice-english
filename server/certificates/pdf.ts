import "server-only";
import { renderCertificateHtml, type CertificateView } from "@/lib/certificates/render";

let mupdfPromise: Promise<typeof import("mupdf")> | undefined;

/** Landscape A4 certificate PDF (mupdf, as for invoices and e-books). */
export async function renderCertificatePdf(view: CertificateView): Promise<Uint8Array> {
  mupdfPromise ??= import("mupdf");
  const mupdf = await mupdfPromise;
  const doc = mupdf.Document.openDocument(new TextEncoder().encode(renderCertificateHtml(view)), "text/html");
  const [w, h, margin] = [842, 595, 36];
  doc.layout(w - margin * 2, h - margin * 2, 10);
  const buffer = new mupdf.Buffer();
  const writer = new mupdf.DocumentWriter(buffer, "PDF", "compress");
  const page = doc.loadPage(0);
  const device = writer.beginPage([0, 0, w, h]);
  page.run(device, mupdf.Matrix.translate(margin, margin));
  writer.endPage();
  writer.close();
  return buffer.asUint8Array();
}
