"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { wordById } from "@/lib/vocabulary/content";
import { levelInfo, type LexiconLevelCode } from "@/lib/vocabulary/levels";
import { recordSetTest, saveWordNote, setWordStatus } from "@/server/services/lexicon.service";

const BASE = "/dashboard/kelime-motoru";

export async function markWordAction(wordId: string, status: "KNOWN" | "LEARNING" | null): Promise<{ ok: boolean }> {
  const user = await getAuthContext();
  const word = wordById(wordId);
  if (!user || !word) return { ok: false };
  await setWordStatus(user.id, word, status);
  return { ok: true };
}

export async function saveNoteAction(wordId: string, note: string): Promise<{ ok: boolean }> {
  const user = await getAuthContext();
  const word = wordById(wordId);
  if (!user || !word) return { ok: false };
  await saveWordNote(user.id, word, note);
  return { ok: true };
}

export async function saveTestAction(level: string, setNumber: number, score: number, total: number, wrongWordIds: string[]): Promise<{ ok: boolean }> {
  const user = await getAuthContext();
  const info = levelInfo(level);
  if (!user || !info || !Number.isInteger(setNumber) || setNumber < 1 || total < 1 || score < 0 || score > total) return { ok: false };
  await recordSetTest(user.id, info.code as LexiconLevelCode, setNumber, score, total, wrongWordIds.filter((id) => typeof id === "string").slice(0, 50));
  revalidatePath(BASE, "layout");
  return { ok: true };
}
