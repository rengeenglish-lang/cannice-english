/**
 * Lesson videos uploaded to the private R2 lessons bucket are stored in the lesson's existing
 * `videoUrl` field as "r2:<object key>"; any other value is an external URL (e.g. YouTube) as before.
 * Players never see the key: they get an access-checked route that redirects to a short-lived
 * signed URL.
 */
export const R2_VIDEO_PREFIX = "r2:";
export type LessonVideoKind = "konu" | "ders";

export const LESSON_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;
export const LESSON_VIDEO_MAX_BYTES = 8 * 1024 * 1024 * 1024;
/** Multipart part size: big enough for few requests, small enough to retry cheaply. */
export const LESSON_VIDEO_PART_BYTES = 64 * 1024 * 1024;

export const isStoredVideo = (videoUrl: string | null | undefined): videoUrl is string => Boolean(videoUrl?.startsWith(R2_VIDEO_PREFIX));
export const storedVideoKey = (videoUrl: string) => videoUrl.slice(R2_VIDEO_PREFIX.length);

/** What a <video> element should load for this lesson. */
export function lessonVideoSrc(kind: LessonVideoKind, lessonId: string, videoUrl: string | null | undefined) {
  if (!videoUrl) return null;
  return isStoredVideo(videoUrl) ? `/api/lesson-video/${kind}/${lessonId}` : videoUrl;
}

/** Admin forms: an empty field, an https URL, or a stored "r2:" reference (kept as-is). */
export function isAcceptableVideoField(value: string) {
  if (value === "" || isStoredVideo(value)) return true;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
