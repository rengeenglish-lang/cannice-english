/**
 * Replaces the old lighthouse icons inside "Kelimenin İzini Sür" with the Netfener N logo:
 * the small white lighthouse in the dark header of every word page, the large one on the title
 * page (page 2) and the one above the copyright text on page 3. Works on the full book and the 10-page preview, then re-renders the
 * preview JPGs from page 2 on (page 1 is the cover, made by build-ebook-covers.mts).
 *
 * Each icon is covered with the background colour it sits on and the logo is drawn as vector
 * paths in an extra content stream; the original content is wrapped in q/Q so its graphics state
 * can't leak into the overlay. Pages are found by looking for the icon's colours, so running the
 * script twice changes nothing the second time.
 *
 *   npx tsx scripts/replace-kelimenin-lighthouse.mts
 */
import { readFile, writeFile } from "node:fs/promises";
import * as mupdf from "mupdf";
import sharp from "sharp";

const BOOK = "content/ebooks/netfener-kelimenin-izini-sur.pdf";
const PREVIEW = "public/ebooks/previews/kelimenin-izini-sur.pdf";
const PREVIEW_JPG = (n: number) => `public/ebooks/previews/kelimenin-izini-sur-${n}.jpg`;

type Rgb = [number, number, number];
const HEADER_BG: Rgb = [18, 36, 58];
const PAPER_BG: Rgb = [245, 241, 230];
/** Where the icons are, in PDF points from the top-left (measured on the rendered pages). */
const HEADER_ICON = { x: 34, y: 19, w: 54, h: 52 };
const COPYRIGHT_ICON = { x: 65, y: 574, w: 38, h: 36 };
const TITLE_ICON = { x: 259, y: 111, w: 77, h: 73 };

/** The N logo (public/netfener-logo*.svg), 100×100 units. */
const LOGO_POLYGONS: { points: number[]; dark: Rgb; light: Rgb; opacity?: number }[] = [
  { points: [10, 15.6, 34, 49.4, 34, 56, 10, 66], dark: [19, 138, 67], light: [52, 196, 110] },
  { points: [66, 4, 90, 4, 90, 22, 66, 32], dark: [52, 196, 110], light: [103, 211, 146] },
  { points: [10, 72, 34, 62, 34, 96, 10, 96], dark: [11, 61, 42], light: [255, 255, 255] },
  { points: [66, 38, 90, 28, 90, 80.4, 66, 46.6], dark: [11, 61, 42], light: [255, 255, 255], opacity: 0.82 },
  { points: [10, 10, 36, 10, 90, 86, 64, 86], dark: [11, 61, 42], light: [255, 255, 255] },
];

const f = (n: number) => n.toFixed(2);
const rgb = (c: Rgb) => c.map((v) => (v / 255).toFixed(4)).join(" ");
const blend = (c: Rgb, bg: Rgb, a: number): Rgb => [0, 1, 2].map((i) => Math.round(c[i] * a + bg[i] * (1 - a))) as Rgb;

/** PDF operators: cover `box` with `bg`, then draw the logo centred in it. */
function overlay(pageHeight: number, box: { x: number; y: number; w: number; h: number }, bg: Rgb, onDark: boolean) {
  const ops = ["q", `${rgb(bg)} rg`, `${f(box.x)} ${f(pageHeight - box.y - box.h)} ${f(box.w)} ${f(box.h)} re f`];
  const size = Math.min(box.w, box.h) * 0.82;
  const scale = size / 100;
  const left = box.x + (box.w - size) / 2;
  const top = box.y + (box.h - size) / 2;
  ops.push("1 j", `${f(2 * scale)} w`);
  for (const p of LOGO_POLYGONS) {
    const colour = onDark ? p.light : p.dark;
    const c = p.opacity ? blend(colour, bg, p.opacity) : colour;
    ops.push(`${rgb(c)} rg ${rgb(c)} RG`);
    for (let i = 0; i < p.points.length; i += 2) {
      const x = left + p.points[i] * scale;
      const y = pageHeight - (top + p.points[i + 1] * scale);
      ops.push(`${f(x)} ${f(y)} ${i === 0 ? "m" : "l"}`);
    }
    ops.push("h B");
  }
  ops.push("Q");
  return ops.join("\n");
}

/** Counts pixels in `box` that are neither the background nor near it — i.e. an icon is drawn there. */
function inkIn(page: mupdf.Page, box: { x: number; y: number; w: number; h: number }, bg: Rgb) {
  const s = 2;
  const pix = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, [0, 0, box.w * s, box.h * s], false);
  pix.clear(255);
  const device = new mupdf.DrawDevice(mupdf.Matrix.identity, pix);
  page.run(device, mupdf.Matrix.concat(mupdf.Matrix.translate(-box.x, -box.y), mupdf.Matrix.scale(s, s)));
  device.close();
  const px = pix.getPixels();
  let ink = 0;
  for (let i = 0; i < px.length; i += 3) if (Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]) > 60) ink += 1;
  return ink;
}

/** True when the box still shows the lighthouse (cream/gold), not already the logo (white/greens). */
function hasLighthouse(page: mupdf.Page, box: { x: number; y: number; w: number; h: number }, bg: Rgb) {
  if (inkIn(page, box, bg) < 40) return false;
  const s = 2;
  const pix = new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB, [0, 0, box.w * s, box.h * s], false);
  pix.clear(255);
  const device = new mupdf.DrawDevice(mupdf.Matrix.identity, pix);
  page.run(device, mupdf.Matrix.concat(mupdf.Matrix.translate(-box.x, -box.y), mupdf.Matrix.scale(s, s)));
  device.close();
  const px = pix.getPixels();
  let gold = 0;
  let green = 0;
  for (let i = 0; i < px.length; i += 3) {
    const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
    if (r > 200 && g > 150 && b < 110) gold += 1; // the lighthouse's yellow rays/lamp
    if (g > r + 40 && g > b + 20) green += 1; // the N logo's greens
  }
  return gold > 20 && green < 20;
}

function stamp(doc: mupdf.PDFDocument, pageIndex: number, ops: string) {
  const pageObj = doc.findPage(pageIndex);
  const current = pageObj.get("Contents");
  const streams: mupdf.PDFObject[] = [];
  if (current.isArray()) for (let i = 0; i < current.length; i++) streams.push(current.get(i));
  else streams.push(current);
  const open = doc.addStream("q\n", {});
  const close = doc.addStream(`Q\n${ops}\n`, {});
  const contents = doc.newArray();
  contents.push(open);
  for (const s of streams) contents.push(s);
  contents.push(close);
  pageObj.put("Contents", contents);
}

/** Word pages carry the book title in their dark header (unit intro pages have "ÜNİTE" there instead). */
function hasTitleHeader(page: mupdf.Page) {
  return page.search("KELİMENİN İZİNİ SÜR", undefined).some((quads) => quads.some((q) => Math.min(q[1], q[3], q[5], q[7]) < 90));
}

async function fix(path: string) {
  const doc = mupdf.Document.openDocument(await readFile(path), "application/pdf") as mupdf.PDFDocument;
  const count = doc.countPages();
  let changed = 0;
  for (let i = 0; i < count; i++) {
    const page = doc.loadPage(i);
    const height = page.getBounds()[3];
    // The title page and the copyright page are pages 2 and 3 in both the book and its preview.
    const spot =
      i === 1 ? { box: TITLE_ICON, bg: PAPER_BG, dark: false } : i === 2 ? { box: COPYRIGHT_ICON, bg: PAPER_BG, dark: false } : hasTitleHeader(page) ? { box: HEADER_ICON, bg: HEADER_BG, dark: true } : null;
    if (!spot || !hasLighthouse(page, spot.box, spot.bg)) continue;
    stamp(doc, i, overlay(height, spot.box, spot.bg, spot.dark));
    changed += 1;
  }
  if (doc.countPages() !== count) throw new Error(`${path}: page count changed`);
  if (changed) await writeFile(path, doc.saveToBuffer("garbage=compact,compress").asUint8Array());
  console.log(`${path}: ${changed} of ${count} pages updated`);
  return doc;
}

async function main() {
  await fix(BOOK);
  const preview = await fix(PREVIEW);
  // Preview images: page 2 onwards, at the size the existing JPGs use (~990×1400).
  for (let i = 1; i < preview.countPages(); i++) {
    const page = preview.loadPage(i);
    const scale = 990 / page.getBounds()[2];
    const png = page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB, false, true).asPNG();
    await writeFile(PREVIEW_JPG(i + 1), await sharp(Buffer.from(png)).jpeg({ quality: 86, mozjpeg: true }).toBuffer());
  }
  console.log("preview JPGs re-rendered");
}

void main();
