import { createSign } from "node:crypto";
import { z } from "zod";
import { MAX_IMPORT_ROWS, type PerfRow, type SnapshotKind, normalizePage } from "./performance";

export const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/webmasters/v3/sites";
const PAGE_SIZE = 5000;

const credentialsSchema = z.object({
  client_email: z.email(),
  private_key: z.string().includes("BEGIN PRIVATE KEY"),
});
const siteSchema = z.string().regex(/^(sc-domain:[a-z0-9.-]+|https:\/\/[a-z0-9.-]+\/?)$/i);

export type GscConfig = { clientEmail: string; privateKey: string; site: string };
/** Reads server-side credentials. Returns null (integration visibly unavailable) unless both are valid. */
export function readGscConfig(env: Record<string, string | undefined> = process.env): GscConfig | null {
  try {
    const raw = env.GSC_SERVICE_ACCOUNT_JSON;
    const site = siteSchema.safeParse(env.GSC_SITE_URL);
    if (!raw || !site.success) return null;
    const c = credentialsSchema.parse(JSON.parse(raw));
    return { clientEmail: c.client_email, privateKey: c.private_key, site: site.data };
  } catch {
    return null;
  }
}

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");
export function signServiceJwt(config: GscConfig, nowSeconds: number) {
  const head = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64(
    JSON.stringify({ iss: config.clientEmail, scope: GSC_SCOPE, aud: TOKEN_URL, iat: nowSeconds, exp: nowSeconds + 3000 }),
  );
  const signature = createSign("RSA-SHA256").update(`${head}.${claim}`).sign(config.privateKey);
  return `${head}.${claim}.${b64(signature)}`;
}

type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;
const rowsSchema = z.object({
  rows: z
    .array(
      z.object({
        keys: z.array(z.string()),
        clicks: z.number(),
        impressions: z.number(),
        ctr: z.number(),
        position: z.number(),
      }),
    )
    .optional(),
});
const DIMENSIONS: Record<SnapshotKind, string[]> = {
  PAGES: ["page"],
  QUERIES: ["query"],
  PAGE_QUERIES: ["page", "query"],
};

export class GscError extends Error {}

/**
 * Fetches one period for one kind. Refuses (rather than returning a partial snapshot) when the
 * result would exceed MAX_IMPORT_ROWS. Error messages never include credentials or response bodies.
 */
export async function fetchGscRows(
  config: GscConfig,
  kind: SnapshotKind,
  period: { start: string; end: string },
  siteHost: string,
  fetchImpl: Fetch = fetch as unknown as Fetch,
  now = Date.now(),
) {
  const tokenRes = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signServiceJwt(config, Math.floor(now / 1000)),
    }).toString(),
  });
  if (!tokenRes.ok) throw new GscError(`Google kimlik doğrulaması başarısız (HTTP ${tokenRes.status}).`);
  const token = z.object({ access_token: z.string().min(10) }).safeParse(await tokenRes.json());
  if (!token.success) throw new GscError("Google kimlik doğrulama yanıtı geçersiz.");
  const rows: PerfRow[] = [];
  let dropped = 0;
  for (let startRow = 0; ; startRow += PAGE_SIZE) {
    const res = await fetchImpl(`${API}/${encodeURIComponent(config.site)}/searchAnalytics/query`, {
      method: "POST",
      headers: { authorization: `Bearer ${token.data.access_token}`, "content-type": "application/json" },
      body: JSON.stringify({
        startDate: period.start,
        endDate: period.end,
        dimensions: DIMENSIONS[kind],
        rowLimit: PAGE_SIZE,
        startRow,
        dataState: "final",
      }),
    });
    if (!res.ok) throw new GscError(`Search Console isteği başarısız (HTTP ${res.status}). Hesabın siteye erişimini kontrol edin.`);
    const parsed = rowsSchema.safeParse(await res.json());
    if (!parsed.success) throw new GscError("Search Console yanıtı beklenen biçimde değil.");
    const batch = parsed.data.rows ?? [];
    for (const r of batch) {
      const page = kind === "QUERIES" ? "" : normalizePage(r.keys[0] ?? "", siteHost);
      const query = kind === "PAGES" ? "" : (kind === "QUERIES" ? r.keys[0] : r.keys[1]) ?? "";
      if (page === null || (kind !== "PAGES" && !query) || r.clicks > r.impressions || r.ctr < 0 || r.ctr > 1) {
        dropped++;
        continue;
      }
      rows.push({ page, query: query.slice(0, 300), clicks: Math.round(r.clicks), impressions: Math.round(r.impressions), ctr: r.ctr, position: r.position });
    }
    if (rows.length + dropped > MAX_IMPORT_ROWS)
      throw new GscError("Sonuç çok büyük; kısmi anlık görüntü kaydedilmedi. Daha kısa dönem seçin.");
    if (batch.length < PAGE_SIZE) break;
  }
  return { rows, dropped };
}
