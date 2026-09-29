import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";

/**
 * Page images for the online reader, rasterised from the PDF on demand.
 *
 * The book file itself never reaches the browser — that separation is what the online
 * edition sells, and why the reader cannot simply hand the PDF to a client-side viewer.
 */
type Mupdf = typeof import("mupdf");

let mupdfPromise: Promise<Mupdf> | undefined;
function loadMupdf(): Promise<Mupdf> {
  // WASM, so it is loaded once per lambda and kept for later pages of the same session.
  mupdfPromise ??= import("mupdf");
  return mupdfPromise;
}

type OpenBook = { document: InstanceType<Mupdf["Document"]>; pageCount: number };
const books = new Map<string, Promise<OpenBook>>();

async function openBook(slug: string): Promise<OpenBook> {
  const existing = books.get(slug);
  if (existing) return existing;
  const opening = (async () => {
    const book = findNetfenerEbook(slug);
    if (!book) throw new Error(`Unknown book: ${slug}`);
    const mupdf = await loadMupdf();
    // Only catalogue filenames are ever read; user input never becomes a filesystem path.
    const bytes = await readFile(path.join(process.cwd(), "content", "ebooks", book.filename));
    const document = mupdf.Document.openDocument(bytes, "application/pdf");
    return { document, pageCount: document.countPages() };
  })();
  books.set(slug, opening);
  opening.catch(() => books.delete(slug));
  return opening;
}

export async function ebookPageCount(slug: string): Promise<number> {
  return (await openBook(slug)).pageCount;
}

/** One page as a JPEG. `page` is 1-based, matching what the reader shows the reader. */
export async function renderEbookPage(slug: string, page: number, scale = 1.5): Promise<Uint8Array> {
  const { document, pageCount } = await openBook(slug);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) throw new Error("Page out of range");
  const mupdf = await loadMupdf();
  const loaded = document.loadPage(page - 1);
  const pixmap = loaded.toPixmap(
    mupdf.Matrix.scale(scale, scale),
    mupdf.ColorSpace.DeviceRGB,
    false,
    true,
  );
  const jpeg = pixmap.asJPEG(62);
  pixmap.destroy();
  loaded.destroy();
  return jpeg;
}
