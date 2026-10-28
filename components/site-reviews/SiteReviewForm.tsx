"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { Star, Upload, Video, PenLine } from "lucide-react";
import { requestReviewUploadAction, submitSiteReviewAction, type SiteReviewFormState } from "@/app/actions/site-reviews";
import {
  REVIEW_MAX_CHARS,
  REVIEW_MIN_CHARS,
  REWARD_PERCENT,
  TEXT_REWARD_MIN_CHARS,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_SECONDS,
  VIDEO_TYPES,
  exceedsVideoLimit,
  VIDEO_USAGE_CONSENT_TEXT,
  type ReviewKind,
} from "@/lib/site-reviews";

const EXAMS = [
  ["", "Seçmek istemiyorum"],
  ["YDS", "YDS / e-YDS"],
  ["YOKDIL_SOSYAL", "YÖKDİL Sosyal"],
  ["YOKDIL_SAGLIK", "YÖKDİL Sağlık"],
  ["YOKDIL_FEN", "YÖKDİL Fen"],
  ["IELTS", "IELTS"],
  ["TOEFL", "TOEFL"],
  ["PTE", "PTE"],
] as const;

/** Length of a local video file in seconds, or null when the browser can't tell. */
function readDuration(file: File) {
  return new Promise<number | null>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (v: number | null) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => done(null);
    setTimeout(() => done(null), 15000);
    video.src = url;
  });
}

/** PUT straight to R2 with progress (fetch has no upload progress). */
function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Yükleme başarısız (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Bağlantı hatası, yükleme yarıda kaldı."));
    xhr.send(file);
  });
}

export function SiteReviewForm({
  defaultName,
  promotionOn,
  rewarded,
  emailVerified,
  uploadsAvailable,
}: {
  defaultName: string;
  promotionOn: boolean;
  rewarded: Record<ReviewKind, boolean>;
  emailVerified: boolean;
  uploadsAvailable: boolean;
}) {
  const [state, action, pending] = useActionState(submitSiteReviewAction, { status: "idle" } as SiteReviewFormState);
  const [kind, setKind] = useState<ReviewKind>("TEXT");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [videoMode, setVideoMode] = useState<"upload" | "link">(uploadsAvailable ? "upload" : "link");
  const [videoKey, setVideoKey] = useState("");
  const [videoSeconds, setVideoSeconds] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const rewardOpen = promotionOn && emailVerified && !rewarded[kind];
  const length = body.trim().length;

  async function onFile(file: File | undefined) {
    setUploadError("");
    setVideoKey("");
    if (!file) return;
    if (!(VIDEO_TYPES as readonly string[]).includes(file.type)) return setUploadError("Yalnızca MP4 veya WebM video yükleyebilirsin. iPhone'da Ayarlar → Kamera → Formatlar → \"En Uyumlu\" seçeneğini kullan.");
    if (file.size > VIDEO_MAX_BYTES) return setUploadError("Video en fazla 200 MB olabilir. Daha kısa ya da 720p bir kayıt dene.");
    const seconds = await readDuration(file);
    if (seconds !== null && exceedsVideoLimit(seconds)) {
      if (fileRef.current) fileRef.current.value = "";
      return setUploadError(`Bu video ${Math.round(seconds)} saniye. Video yorum en fazla ${VIDEO_MAX_SECONDS} saniye olabilir; lütfen kısaltıp tekrar yükle.`);
    }
    setVideoSeconds(seconds === null ? null : Math.round(seconds));
    const ticket = await requestReviewUploadAction(file.type, file.size);
    if (!ticket.ok) return setUploadError(ticket.message);
    try {
      setProgress(0);
      await uploadWithProgress(ticket.url, file, setProgress);
      setVideoKey(ticket.key);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Yükleme başarısız.");
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (state.status === "success") {
    return (
      <div className="dashboard-panel space-y-3 text-center">
        <p className="text-lg font-extrabold">Teşekkürler! 🎉</p>
        <p className="text-sm text-[color:var(--muted)]">{state.message} Onaylandığında sitede yayınlanacak ve sana haber vereceğiz.</p>
        {state.ebookUnlocked ? <div className="space-y-3">
          {state.trialEndsAt ? <p className="text-sm">Dijital deneme bitişi: {new Date(state.trialEndsAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}. Kart veya otomatik yenileme yok.</p> : null}
          <Link href="/dashboard/books" className="primary-button">Tüm kitaplarımı aç</Link>
          <Link href="/dashboard" className="secondary-button">Netfener’i dene</Link>
        </div> : null}
        {state.couponCode ? (
          <div className="mx-auto max-w-sm rounded-2xl border-2 border-dashed border-[color:var(--brand)] p-4">
            <p className="text-sm font-bold">%{state.percent} plan indirimin</p>
            <p className="mt-1 select-all font-mono text-2xl font-black tracking-wider">{state.couponCode}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Dilediğin bir planı sepete ekleyip bu kodu gir. 90 gün geçerli, tek kullanımlık.</p>
            <Link href="/planlar" className="primary-button mt-3 text-sm">Planları gör</Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="dashboard-panel space-y-5">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="videoKey" value={videoKey} />
      <input type="hidden" name="videoSeconds" value={videoSeconds ?? ""} />

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Yorum türü">
        {(["TEXT", "VIDEO"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`rounded-2xl border p-3 text-left text-sm transition ${kind === k ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5" : "border-[color:var(--border)]"}`}
          >
            <span className="flex items-center gap-2 font-extrabold">
              {k === "TEXT" ? <PenLine size={16} aria-hidden="true" /> : <Video size={16} aria-hidden="true" />}
              {k === "TEXT" ? "Yazılı yorum" : "Video yorum"}
            </span>
            {promotionOn ? (
              <span className="mt-1 block text-xs text-[color:var(--muted)]">
                {rewarded[k] ? "Ödülünü aldın" : k === "TEXT" ? `%${REWARD_PERCENT.TEXT} plan indirimi (en az ${TEXT_REWARD_MIN_CHARS} karakter)` : `%${REWARD_PERCENT.VIDEO} plan indirimi — en fazla ${VIDEO_MAX_SECONDS} saniye`}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {promotionOn && !emailVerified ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Ödül kazanmak için önce e-posta adresini doğrula (panelin üstündeki bağlantıdan).</p>
      ) : null}

      <div>
        <p className="label">Puanın</p>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Puan">
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} type="button" onClick={() => setRating(v)} aria-label={`${v} yıldız`} aria-pressed={rating === v} className="p-0.5">
              <Star size={26} className={rating >= v ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-[color:var(--border-strong)]"} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">
          Yorumda görünecek adın
          <input name="displayName" defaultValue={defaultName} required maxLength={60} className="auth-input mt-1" />
        </label>
        <label className="label">
          Hazırlandığın sınav
          <select name="examCode" className="auth-input mt-1" defaultValue="">
            {EXAMS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {kind === "VIDEO" ? (
        <div className="space-y-3 rounded-2xl border border-[color:var(--border)] p-4">
          <p className="rounded-xl bg-amber-50 p-2 text-sm font-bold text-amber-900">⏱ Video yorum en fazla {VIDEO_MAX_SECONDS} saniye olmalıdır. Daha uzun videolar kabul edilmez.</p>
          {uploadsAvailable ? (
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={() => setVideoMode("upload")} className={`rounded-full px-3 py-1 font-bold ${videoMode === "upload" ? "bg-[color:var(--brand)] text-white" : "border border-[color:var(--border)]"}`}>Video yükle</button>
              <button type="button" onClick={() => setVideoMode("link")} className={`rounded-full px-3 py-1 font-bold ${videoMode === "link" ? "bg-[color:var(--brand)] text-white" : "border border-[color:var(--border)]"}`}>Bağlantı paylaş</button>
            </div>
          ) : null}
          {videoMode === "upload" ? (
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                <Upload size={16} aria-hidden="true" /> MP4 veya WebM · en fazla {VIDEO_MAX_SECONDS} saniye · en fazla 200 MB
                <input ref={fileRef} type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              {progress !== null ? (
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-[color:var(--brand)] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{videoKey ? `Video yüklendi ✓${videoSeconds ? ` (${videoSeconds} sn)` : ""}` : `Yükleniyor… %${progress}`}</p>
                </div>
              ) : null}
              {uploadError ? <p className="mt-2 text-sm font-semibold text-[color:var(--danger)]">{uploadError}</p> : null}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="label">
                Video bağlantısı (YouTube — liste dışı olabilir —, Instagram, TikTok veya Google Drive)
                <input name="videoLink" type="url" placeholder="https://youtu.be/…" className="auth-input mt-1" />
              </label>
              <label className="flex items-start gap-2 text-xs font-semibold">
                <input type="checkbox" name="confirmsMaxLength" required className="mt-0.5 size-4 shrink-0" />
                <span>Videom {VIDEO_MAX_SECONDS} saniyeyi geçmiyor. Daha uzun videolar yayınlanmaz ve bağlı ödül iptal edilir.</span>
              </label>
            </div>
          )}
          <label className="flex items-start gap-2 text-xs leading-5">
            <input type="checkbox" name="usageConsent" required className="mt-0.5 size-4 shrink-0" />
            <span>{VIDEO_USAGE_CONSENT_TEXT}</span>
          </label>
        </div>
      ) : null}

      <label className="label block">
        {kind === "VIDEO" ? "Kısa bir not (isteğe bağlı)" : "Yorumun"}
        <textarea
          name="body"
          rows={kind === "VIDEO" ? 3 : 8}
          maxLength={REVIEW_MAX_CHARS}
          required={kind === "TEXT"}
          minLength={kind === "TEXT" ? REVIEW_MIN_CHARS : undefined}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={kind === "TEXT" ? "Hangi sınava hazırlandın, neleri kullandın, neler işine yaradı, neleri geliştirmeliyiz?" : ""}
          className="auth-input mt-1"
        />
        {kind === "TEXT" ? (
          <span className={`mt-1 block text-xs ${rewardOpen && length < TEXT_REWARD_MIN_CHARS ? "text-amber-700" : "text-[color:var(--muted)]"}`}>
            {length} karakter{rewardOpen ? (length >= TEXT_REWARD_MIN_CHARS ? " — %50 indirim için yeterli ✓" : ` — %50 indirim için ${TEXT_REWARD_MIN_CHARS - length} karakter daha`) : ""}
          </span>
        ) : null}
      </label>

      <p className="text-xs text-[color:var(--muted)]">
        Ödül, yorumunun olumlu ya da olumsuz olmasına bağlı değildir. Dürüst görüşün bizim için en değerlisi. Yorumlar yayından önce incelenir; ödül alan yorumlarda sağlanan hediye veya indirim açıkça belirtilir. Uygunsuz ya da konuyla ilgisiz yorumlar yayınlanmaz ve bağlı kupon iptal edilir.
      </p>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending || rating === 0 || (kind === "VIDEO" && videoMode === "upload" && !videoKey)}
        className="primary-button w-full justify-center"
      >
        {pending ? "Gönderiliyor…" : "Yorumu gönder"}
      </button>
    </form>
  );
}
