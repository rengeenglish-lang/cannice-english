/**
 * Puts the series covers (scripts/ebook-covers/designs.ts) on the Netfener books:
 *   public/ebooks/covers/<slug>.jpg     the cover the shop shows
 *   public/ebooks/previews/<slug>-1.jpg preview page 1
 *   page 1 of content/ebooks/<book>.pdf and of public/ebooks/previews/<slug>.pdf (vector), and the
 *   last page too for books whose last page is a back cover.
 * The phrasal verbs guide is skipped: its own generator renders the same design.
 *
 *   npx tsx scripts/build-ebook-covers.mts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as mupdf from "mupdf";
import { chromium } from "playwright";
import { NETFENER_EBOOKS } from "../lib/netfener-ebooks";
import { COVERS, COVER_CSS, backCoverHtml, coverHtml } from "./ebook-covers/designs";

const page = (html: string) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${COVER_CSS} body{margin:0}</style></head><body>${html}</body></html>`;

/** Replaces page `index` (0-based; -1 = last) of a PDF with page 0 of `source`. */
function replacePage(doc: mupdf.PDFDocument, index: number, source: mupdf.PDFDocument) {
  const at = index < 0 ? doc.countPages() - 1 : index;
  doc.deletePage(at);
  doc.graftPage(at, source, 0);
}

async function main() {
  await mkdir("public/ebooks/covers", { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.25 });
  const tab = await ctx.newPage();
  const render = async (html: string) => {
    await tab.setContent(page(html), { waitUntil: "load" });
    const jpeg = await tab.screenshot({ type: "jpeg", quality: 88, scale: "device" });
    const pdf = mupdf.Document.openDocument(await tab.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true }), "application/pdf") as mupdf.PDFDocument;
    return { jpeg, pdf };
  };

  for (const design of COVERS) {
    if (design.slug === "phrasal-verbs") continue;
    const book = NETFENER_EBOOKS.find((b) => b.slug === design.slug);
    if (!book) throw new Error(`No catalogue entry for ${design.slug}`);
    const front = await render(coverHtml(design));
    const back = design.back ? await render(backCoverHtml(design)) : null;
    await writeFile(`public/ebooks/covers/${design.slug}.jpg`, front.jpeg);
    await writeFile(`public/ebooks/previews/${design.slug}-1.jpg`, front.jpeg);

    for (const target of [`content/ebooks/${book.filename}`, `public/ebooks/previews/${book.slug}.pdf`]) {
      const doc = mupdf.Document.openDocument(await readFile(target), "application/pdf") as mupdf.PDFDocument;
      const count = doc.countPages();
      replacePage(doc, 0, front.pdf);
      // Only the full book ends on its back cover; the preview ends on a sample page.
      if (back && target.startsWith("content/")) replacePage(doc, -1, back.pdf);
      if (doc.countPages() !== count) throw new Error(`${target}: page count changed`);
      await writeFile(target, doc.saveToBuffer("garbage=compact,compress").asUint8Array());
    }
    console.log(`cover ${design.slug}${back ? " + back cover" : ""}`);
  }
  await browser.close();
}

void main();
