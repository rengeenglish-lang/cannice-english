"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EBOOK_REVIEW_UNLOCK_MESSAGE } from "@/lib/ebook-review-reward";

export function EbookDownloadButton({ slug, filename, reviewRequired = false, disabled = false }: { slug: string; filename: string; reviewRequired?: boolean; disabled?: boolean }) {
  const [message, setMessage] = useState("");
  const [gate, setGate] = useState(reviewRequired);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function download() {
    setPending(true); setMessage("");
    try {
      const response = await fetch(`/api/ebooks/${slug}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        if (result.code === "REVIEW_REQUIRED") setGate(true);
        setMessage(result.error ?? "İndirme başlatılamadı."); return;
      }
      const link = document.createElement("a");
      link.href = `/api/ebooks/${slug}`; link.download = filename;
      document.body.appendChild(link); link.click(); link.remove();
      setMessage("PDF indirmen başladı. Kitabını tekrar indirmek için bu düğmeyi kullanabilirsin.");
      router.refresh();
    } catch { setMessage("Bağlantı kurulamadı. Lütfen tekrar dene."); }
    finally { setPending(false); }
  }
  return <div className="space-y-3">
    {gate ? <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--canvas)] p-4 text-sm leading-6">
      <p>{EBOOK_REVIEW_UNLOCK_MESSAGE}</p>
      <Link className="primary-button mt-3" href={`/dashboard/reviews?book=${slug}#netfener-yorumu`}>Yorumumu paylaş ve tüm kitapları aç</Link>
    </div> : <button type="button" onClick={download} disabled={disabled || pending} className="secondary-button">{pending ? "PDF hazırlanıyor…" : "PDF indir"}</button>}
    {message ? <p role="status" className="text-sm text-[color:var(--muted)]">{message}</p> : null}
  </div>;
}
