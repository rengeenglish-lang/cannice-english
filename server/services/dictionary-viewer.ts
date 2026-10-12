import "server-only";
import { db } from "@/server/db";
import { getAuthContext } from "@/server/auth/context";

/** Who is looking, and which of these Kelime Motoru words they already study. */
export async function dictionaryViewer(lexiconIds: string[]) {
  const user = await getAuthContext().catch(() => null);
  if (!user || !lexiconIds.length) return { signedIn: Boolean(user), learning: new Set<string>() };
  const rows = await db.lexiconWordState.findMany({ where: { userId: user.id, wordId: { in: lexiconIds }, status: { not: null } }, select: { wordId: true } });
  return { signedIn: true, learning: new Set(rows.map((r) => r.wordId)) };
}
