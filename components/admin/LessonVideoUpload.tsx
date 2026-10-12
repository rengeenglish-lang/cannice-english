"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelLessonVideoUploadAction,
  completeLessonVideoUploadAction,
  removeLessonVideoAction,
  signLessonVideoPartAction,
  startLessonVideoUploadAction,
} from "@/app/actions/lesson-video";
import { LESSON_VIDEO_TYPES, isStoredVideo, type LessonVideoKind } from "@/lib/lesson-video";

function putPart(url: string, blob: Blob, onProgress: (loaded: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () => {
      const etag = xhr.getResponseHeader("ETag");
      if (xhr.status >= 200 && xhr.status < 300 && etag) resolve(etag);
      else reject(new Error(`Parça yüklenemedi (${xhr.status}${etag ? "" : ", ETag yok — R2 CORS ayarında ExposeHeaders: ETag olmalı"}).`));
    };
    xhr.onerror = () => reject(new Error("Bağlantı hatası."));
    xhr.send(blob);
  });
}

/**
 * Uploads a lesson video straight to the R2 lessons bucket in 64 MB parts (each retried up to 3
 * times), then attaches it to the lesson. Large files never pass through the site's servers.
 */
export function LessonVideoUpload({ kind, lessonId, videoUrl, available }: { kind: LessonVideoKind; lessonId: string; videoUrl: string | null; available: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const cancelled = useRef(false);
  const stored = isStoredVideo(videoUrl);

  async function upload(file: File) {
    setStatus("");
    if (!(LESSON_VIDEO_TYPES as readonly string[]).includes(file.type)) return setStatus("Yalnızca MP4 (H.264) veya WebM yükleyin.");
    setBusy(true);
    cancelled.current = false;
    const start = await startLessonVideoUploadAction(kind, lessonId, file.type, file.size);
    if (!start.ok) {
      setBusy(false);
      return setStatus(start.message);
    }
    const parts: { partNumber: number; etag: string }[] = [];
    let done = 0;
    try {
      for (let n = 1; n <= start.parts; n++) {
        if (cancelled.current) throw new Error("Yükleme iptal edildi.");
        const blob = file.slice((n - 1) * start.partSize, n * start.partSize);
        let etag = "";
        for (let tryNo = 1; !etag; tryNo++) {
          const signed = await signLessonVideoPartAction(kind, lessonId, start.key, start.uploadId, n);
          if (!signed.ok) throw new Error(signed.message);
          try {
            etag = await putPart(signed.url, blob, (loaded) => setProgress(Math.round(((done + loaded) / file.size) * 100)));
          } catch (e) {
            if (tryNo >= 3) throw e;
          }
        }
        done += blob.size;
        parts.push({ partNumber: n, etag });
      }
      setStatus("Tamamlanıyor…");
      const finished = await completeLessonVideoUploadAction(kind, lessonId, start.key, start.uploadId, parts);
      if (!finished.ok) throw new Error(finished.message);
      setStatus("Video yüklendi ✓");
      router.refresh();
    } catch (e) {
      await cancelLessonVideoUploadAction(kind, lessonId, start.key, start.uploadId);
      setStatus(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function remove() {
    if (!confirm("Bu dersin yüklenen videosu silinsin mi?")) return;
    setBusy(true);
    const r = await removeLessonVideoAction(kind, lessonId);
    setBusy(false);
    setStatus(r.ok ? "Video silindi." : r.message);
    router.refresh();
  }

  if (!available) return <p className="text-xs text-[color:var(--muted)]">Video yükleme bu ortamda kapalı (R2 ayarları yok). Video URL alanını kullanabilirsiniz.</p>;
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--border)] p-3 text-sm">
      <p className="font-bold">
        Ders videosu: {stored ? <span className="text-emerald-700">Netfener deposunda ✓</span> : videoUrl ? "harici bağlantı" : "yok"}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className={`secondary-button cursor-pointer text-xs ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {stored ? "Videoyu değiştir" : "Video yükle"} (MP4/WebM)
          <input type="file" accept="video/mp4,video/webm" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {stored && !busy ? <button type="button" onClick={remove} className="ghost-button text-xs text-[color:var(--danger)]">Videoyu sil</button> : null}
        {busy && progress !== null ? <button type="button" onClick={() => (cancelled.current = true)} className="ghost-button text-xs">İptal</button> : null}
      </div>
      {progress !== null ? (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-[color:var(--brand)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {status ? <p className="mt-1 text-xs">{progress !== null ? `%${progress} · ` : ""}{status}</p> : progress !== null ? <p className="mt-1 text-xs">Yükleniyor… %{progress}</p> : null}
      <p className="mt-1 text-[11px] text-[color:var(--muted)]">720p MP4 (H.264) önerilir; 45 dakikalık bir ders yaklaşık 0,5–1 GB tutar. Sayfadan ayrılmayın.</p>
    </div>
  );
}
