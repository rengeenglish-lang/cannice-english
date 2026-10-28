import "server-only";
import { db } from "@/server/db";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";

export async function rememberEbook(userId: string, slug: string) {
  if (!findNetfenerEbook(slug)) return;
  await db.userEbookSelection.upsert({ where: { userId_bookSlug: { userId, bookSlug: slug } }, create: { userId, bookSlug: slug }, update: {} });
}

export function listSelectedEbooks(userId: string) {
  return db.userEbookSelection.findMany({ where: { userId }, orderBy: { selectedAt: "asc" } });
}
