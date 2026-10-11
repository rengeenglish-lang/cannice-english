"use client";

import { useState } from "react";

/** Share buttons for a certificate: LinkedIn (add to profile), WhatsApp and copy link. */
export function ShareCertificate({ url, linkedIn, title }: { url: string; linkedIn: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Netfener'de ${title} programını tamamladım! ${url}`;
  const btn = "inline-flex min-h-9 items-center rounded-lg border border-[color:var(--border)] px-3 text-xs font-bold transition hover:bg-[color:var(--canvas)]";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={linkedIn} target="_blank" rel="noopener noreferrer" className={`${btn} text-[#0a66c2]`}>LinkedIn&apos;e ekle</a>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={`${btn} text-[#128c4a]`}>WhatsApp&apos;ta paylaş</a>
      <button
        type="button"
        className={btn}
        onClick={() => {
          void navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
      >
        {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}
      </button>
    </div>
  );
}
