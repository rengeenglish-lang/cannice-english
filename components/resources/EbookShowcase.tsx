"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { NetfenerEbook } from "@/lib/netfener-ebooks";
import styles from "./EbookShowcase.module.css";

export function EbookShowcase({ book }: { book: NetfenerEbook }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  function preview() {
    setPage(1);
    setOpen(true);
    dialog.current?.showModal();
  }
  return <div className={styles.showcase}>
    <button type="button" className={styles.stage} onClick={preview} aria-label={book.title + ": 3 sayfalık önizlemeyi aç"}>
      <span className={styles.book}>
        <span className={styles.front}><Image src={book.cover} alt={book.title + " kitap kapağı"} fill sizes="240px" /></span>
        <span className={styles.back} aria-hidden="true"><strong>NETFENER</strong><span>{book.title}</span><small>{book.subtitle}</small><span className={styles.backRule} /><small>netfener.com</small></span>
        <span className={styles.spine} aria-hidden="true">{book.title} · NETFENER</span>
        <span className={styles.pages} aria-hidden="true" />
        <span className={styles.top} aria-hidden="true" />
        <span className={styles.bottom} aria-hidden="true" />
      </span>
    </button>
    <p className={styles.hint}>360° keşfet · Önizlemek için dokun</p>
    <button type="button" className="secondary-button" onClick={preview}>İlk 3 sayfayı incele</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
      onClose={() => setOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); setPage(p => Math.min(3, p + 1)); }
        if (event.key === "ArrowLeft") { event.preventDefault(); setPage(p => Math.max(1, p - 1)); }
      }}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div><p className="eyebrow">Ücretsiz önizleme</p><h2 id={titleId}>{book.title}</h2></div>
          <button type="button" className="ghost-button" onClick={() => dialog.current?.close()} aria-label="Önizlemeyi kapat">Kapat ✕</button>
        </header>
        <div className={styles.reader}>
          {open ? <Image key={page} src={`/ebooks/previews/${book.slug}-${page}.jpg?cover=${encodeURIComponent(book.cover)}`} alt={`${book.title}, önizleme sayfası ${page}`} width={827} height={1170} sizes="(max-width: 760px) 92vw, 700px" className={styles.previewPage} /> : null}
        </div>
        <footer className={styles.navigation}>
          <button type="button" className="secondary-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Önceki</button>
          <span aria-live="polite">Sayfa {page} / 3</span>
          <button type="button" className="secondary-button" disabled={page === 3} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
        </footer>
      </div>
    </dialog>
  </div>;
}
