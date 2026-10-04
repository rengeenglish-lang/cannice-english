import { createHash } from "node:crypto";

/** No network requests: imported text is untrusted data, never instructions or a URL to crawl. */
export function internalUrl(raw: string, origin: string): string | null {
  if (
    !raw ||
    /[\\\u0000-\u001f]/.test(raw) ||
    /^(?:javascript|data|mailto|tel):/i.test(raw)
  )
    return null;
  try {
    const base = new URL(origin);
    const url = new URL(raw, base);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== base.origin ||
      url.username ||
      url.password
    )
      return null;
    url.hash = "";
    url.searchParams.sort();
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
export function extractInternalLinks(text: string, origin: string) {
  const links = new Map<string, { url: string; anchor: string }>();
  const patterns = [
    /\[([^\]\n]{1,200})\]\(([^\s)]+)\)/g,
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  ];
  for (const [index, pattern] of patterns.entries()) {
    for (const match of text.matchAll(pattern)) {
      const raw = match[index === 0 ? 2 : 1];
      const url = internalUrl(raw, origin);
      if (!url) continue;
      const anchor = match[index === 0 ? 1 : 2]
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 200);
      links.set(url, { url, anchor });
      if (links.size >= 100) return [...links.values()];
    }
  }
  return [...links.values()];
}
export function contentHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export const ACCESS_LABELS: Record<string, string> = {
  PUBLIC: "Herkese açık",
  AUTH: "Giriş gerekli",
  PLAN: "Giriş ve plan gerekli",
  PREVIEW_OR_PLAN: "Önizleme / plan",
  PRODUCT: "Ürün sayfası; satın alma koşulları geçerli",
};
