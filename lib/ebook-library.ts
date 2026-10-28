import { findNetfenerEbook } from "@/lib/netfener-ebooks";

export function ebookLibraryHref(slug?: string) {
  return slug && findNetfenerEbook(slug) ? `/dashboard/books?book=${encodeURIComponent(slug)}` : "/dashboard/books";
}

export function ebookFromNextPath(next: unknown) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return undefined;
  try {
    const url = new URL(next, "https://netfener.com");
    return url.origin === "https://netfener.com" && url.pathname === "/dashboard/books" ? findNetfenerEbook(url.searchParams.get("book") ?? "") : undefined;
  } catch { return undefined; }
}
