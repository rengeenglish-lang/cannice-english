"use client";

import { useState } from "react";

export function InviteShare({ url, percent }: { url: string; percent: number }) {
  const [copied, setCopied] = useState(false);
  const text = `Netfener'de İngilizce sınavlarına hazırlanıyorum. Bu bağlantıyla üye olursan ilk siparişinde %${percent} indirim kazanırsın: ${url}`;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input readOnly value={url} className="auth-input min-w-0 flex-1 font-mono text-sm" aria-label="Davet bağlantın" onFocus={(e) => e.target.select()} />
        <button
          type="button"
          className="primary-button text-sm"
          onClick={() => {
            void navigator.clipboard?.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="secondary-button text-sm">WhatsApp&apos;ta paylaş</a>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="secondary-button text-sm">Telegram&apos;da paylaş</a>
        <a href={`mailto:?subject=${encodeURIComponent("Netfener daveti")}&body=${encodeURIComponent(text)}`} className="secondary-button text-sm">E-posta ile gönder</a>
      </div>
    </div>
  );
}
