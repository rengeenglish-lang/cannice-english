import "server-only";
import { db } from "@/server/db";
import { getPlanAccess } from "@/server/services/plans.service";
import { enrollmentGrantsAccess } from "@/lib/diagnostics/access";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  deleteObject,
  headObject,
  presignDownload,
  presignUploadPart,
  r2Configured,
} from "@/server/storage/r2";
import {
  LESSON_VIDEO_MAX_BYTES,
  LESSON_VIDEO_PART_BYTES,
  LESSON_VIDEO_TYPES,
  R2_VIDEO_PREFIX,
  isStoredVideo,
  storedVideoKey,
  type LessonVideoKind,
} from "@/lib/lesson-video";

export const lessonUploadsAvailable = () => r2Configured("lessons");

async function currentVideoUrl(kind: LessonVideoKind, id: string) {
  const lesson =
    kind === "konu"
      ? await db.topicLesson.findUnique({ where: { id }, select: { videoUrl: true } })
      : await db.recordedLesson.findUnique({ where: { id }, select: { videoUrl: true } });
  if (!lesson) throw new Error("Ders bulunamadı.");
  return lesson.videoUrl;
}

async function setVideoUrl(kind: LessonVideoKind, id: string, videoUrl: string | null) {
  if (kind === "konu") await db.topicLesson.update({ where: { id }, data: { videoUrl } });
  else await db.recordedLesson.update({ where: { id }, data: { videoUrl } });
}

const keyPrefix = (kind: LessonVideoKind, id: string) => `${kind}/${id}/`;

/** Starts a multipart upload of a lesson video straight from the admin's browser to R2. */
export async function startLessonVideoUpload(kind: LessonVideoKind, id: string, contentType: string, size: number) {
  if (!lessonUploadsAvailable()) throw new Error("Video depolama bu ortamda ayarlı değil.");
  if (!(LESSON_VIDEO_TYPES as readonly string[]).includes(contentType)) throw new Error("Yalnızca MP4 (H.264) veya WebM yükleyebilirsiniz.");
  if (!Number.isFinite(size) || size <= 0 || size > LESSON_VIDEO_MAX_BYTES) throw new Error("Video en fazla 8 GB olabilir.");
  await currentVideoUrl(kind, id);
  const key = `${keyPrefix(kind, id)}${Date.now()}.${contentType === "video/webm" ? "webm" : "mp4"}`;
  const uploadId = await createMultipartUpload("lessons", key, contentType);
  return { key, uploadId, partSize: LESSON_VIDEO_PART_BYTES, parts: Math.ceil(size / LESSON_VIDEO_PART_BYTES) };
}

function assertKey(kind: LessonVideoKind, id: string, key: string) {
  if (!key.startsWith(keyPrefix(kind, id)) || key.includes("..")) throw new Error("Geçersiz yükleme.");
}

export function signLessonVideoPart(kind: LessonVideoKind, id: string, key: string, uploadId: string, partNumber: number) {
  assertKey(kind, id, key);
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) throw new Error("Geçersiz parça.");
  return presignUploadPart("lessons", key, uploadId, partNumber);
}

/** Finishes the upload, points the lesson at the new file and removes the one it replaces. */
export async function completeLessonVideoUpload(kind: LessonVideoKind, id: string, key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
  assertKey(kind, id, key);
  await completeMultipartUpload("lessons", key, uploadId, parts);
  const head = await headObject("lessons", key);
  if (!head?.size) throw new Error("Yüklenen dosya bulunamadı.");
  const previous = await currentVideoUrl(kind, id);
  await setVideoUrl(kind, id, `${R2_VIDEO_PREFIX}${key}`);
  if (isStoredVideo(previous)) await deleteObject("lessons", storedVideoKey(previous)).catch(() => undefined);
  return { size: head.size };
}

export async function cancelLessonVideoUpload(kind: LessonVideoKind, id: string, key: string, uploadId: string) {
  assertKey(kind, id, key);
  await abortMultipartUpload("lessons", key, uploadId);
}

export async function removeLessonVideo(kind: LessonVideoKind, id: string) {
  const previous = await currentVideoUrl(kind, id);
  if (!isStoredVideo(previous)) return;
  await setVideoUrl(kind, id, null);
  await deleteObject("lessons", storedVideoKey(previous)).catch(() => undefined);
}

/**
 * Signed playback URL for a stored lesson video, or null when the viewer may not watch it.
 * Konu Anlatımı: staff, plan holders, or anyone for the free first topic of each exam.
 * Course lessons: staff, sample ("örnek") lessons, or students whose enrollment grants access.
 */
export async function lessonVideoPlaybackUrl(kind: LessonVideoKind, id: string, viewer: { id: string; role: string } | null) {
  const staff = viewer?.role === "ADMIN" || viewer?.role === "TEACHER";
  if (kind === "konu") {
    const lesson = await db.topicLesson.findUnique({ where: { id }, select: { videoUrl: true, topicId: true, topic: { select: { examTypeId: true } } } });
    if (!lesson || !isStoredVideo(lesson.videoUrl)) return null;
    let allowed = staff;
    if (!allowed) {
      const first = await db.examTopic.findFirst({ where: { examTypeId: lesson.topic.examTypeId }, orderBy: { displayOrder: "asc" }, select: { id: true } });
      allowed = first?.id === lesson.topicId || (await getPlanAccess(viewer)).can("KONU_ANLATIMI");
    }
    return allowed ? presignDownload("lessons", storedVideoKey(lesson.videoUrl), 4 * 60 * 60) : null;
  }
  const lesson = await db.recordedLesson.findUnique({ where: { id }, select: { videoUrl: true, isPreviewable: true, module: { select: { courseId: true } } } });
  if (!lesson || !isStoredVideo(lesson.videoUrl)) return null;
  let allowed = staff || lesson.isPreviewable;
  if (!allowed && viewer) {
    const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId: viewer.id, courseId: lesson.module.courseId } } });
    allowed = enrollmentGrantsAccess(enrollment);
  }
  return allowed ? presignDownload("lessons", storedVideoKey(lesson.videoUrl), 4 * 60 * 60) : null;
}
