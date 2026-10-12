"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import {
  cancelLessonVideoUpload,
  completeLessonVideoUpload,
  removeLessonVideo,
  signLessonVideoPart,
  startLessonVideoUpload,
} from "@/server/services/lesson-video.service";
import type { LessonVideoKind } from "@/lib/lesson-video";

type Result<T> = ({ ok: true } & T) | { ok: false; message: string };

async function staffOnly() {
  const user = await getAuthContext();
  if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) throw new Error("Bu işlem için yetkiniz yok.");
}

const kindOf = (k: string): LessonVideoKind => (k === "ders" ? "ders" : "konu");

async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    await staffOnly();
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "İşlem başarısız." };
  }
}

export async function startLessonVideoUploadAction(kind: string, id: string, contentType: string, size: number) {
  return attempt(() => startLessonVideoUpload(kindOf(kind), id, contentType, size));
}

export async function signLessonVideoPartAction(kind: string, id: string, key: string, uploadId: string, partNumber: number) {
  return attempt(async () => ({ url: await signLessonVideoPart(kindOf(kind), id, key, uploadId, partNumber) }));
}

export async function completeLessonVideoUploadAction(kind: string, id: string, key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
  const result = await attempt(() => completeLessonVideoUpload(kindOf(kind), id, key, uploadId, parts));
  revalidatePath("/admin", "layout");
  return result;
}

export async function cancelLessonVideoUploadAction(kind: string, id: string, key: string, uploadId: string) {
  return attempt(async () => (await cancelLessonVideoUpload(kindOf(kind), id, key, uploadId), {}));
}

export async function removeLessonVideoAction(kind: string, id: string) {
  const result = await attempt(async () => (await removeLessonVideo(kindOf(kind), id), {}));
  revalidatePath("/admin", "layout");
  return result;
}
