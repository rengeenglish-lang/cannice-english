import "server-only";
import { z } from "zod";

const databaseSchema = z.string().refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), "DATABASE_URL must be a PostgreSQL URL");

export function getDatabaseUrl() {
  const result = databaseSchema.safeParse(process.env.DATABASE_URL);
  if (!result.success) throw new Error("DATABASE_URL is required and must be a PostgreSQL connection URL");
  return result.data;
}

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) throw new Error("AUTH_SECRET must contain at least 32 characters in production");
  return secret;
}

export function validateCanonicalUrl() {
  if (process.env.NODE_ENV !== "production") return;
  const parsed = z.url().safeParse(process.env.AUTH_URL);
  if (!parsed.success || !parsed.data.startsWith("https://")) throw new Error("AUTH_URL must be the canonical HTTPS application URL in production");
}

/** The canonical site origin, for sitemap/robots/Open Graph URLs — same source of truth as Auth.js's own canonical URL, with a local-dev fallback since AUTH_URL isn't required outside production. */
export function getSiteUrl() {
  const url = process.env.AUTH_URL;
  if (url && url.startsWith("https://")) return url;
  return "http://localhost:3001";
}
