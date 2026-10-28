"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./EbookPreviewSlider.module.css";

/** A single, viewport-sized book page. Navigation never scrolls through a stack of images. */
export function EbookPreviewSlider({ slug, title, cover, pageCount = 10 }: {
  slug: string;
  title: string;
  cover: string;
  pageCount?: number;
}) {
  const [page, setPage] = useState(1);
  const [failedPage, setFailedPage] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const imageId = useId();
  const total = Math.max(1, pageCount);
  function goTo(next: number) {
    setPage(Math.max(1, Math.min(total, next)));
  }

  return (
    <section className={styles.slider} aria-label={`${title}: önizleme`} aria-roledescription="slayt gösterisi">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Kitabın içine göz at</p>
          <h2 className={styles.title}>Ücretsiz önizleme</h2>
        </div>
        <span className={styles.counter} aria-live="polite" aria-atomic="true">Sayfa {page} / {total}</span>
      </header>
      <div
        className={styles.stage}
        tabIndex={0}
        role="group"
        aria-label="Kitap sayfası. Yön tuşlarıyla veya kaydırarak sayfa değiştirin."
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); goTo(page + 1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); goTo(page - 1); }
          if (event.key === "Home") { event.preventDefault(); goTo(1); }
          if (event.key === "End") { event.preventDefault(); goTo(total); }
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || event.touches.length) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(page + (dx < 0 ? 1 : -1));
        }}
      >
        {failedPage === page ? (
          <div className={styles.error} role="status">
            <p>Bu sayfa yüklenemedi.</p>
            <a className="secondary-button" href={`/ebooks/previews/${slug}.pdf`} target="_blank" rel="noopener noreferrer">Önizlemeyi PDF olarak aç</a>
            <button type="button" className="ghost-button" onClick={() => setFailedPage(null)}>Tekrar dene</button>
          </div>
        ) : (
          <Image
            id={imageId}
            key={page}
            unoptimized
            src={`/ebooks/previews/${slug}-${page}.jpg?cover=${encodeURIComponent(cover)}`}
            alt={`${title}, önizleme sayfası ${page}`}
            width={827}
            height={1170}
            sizes="(max-width: 640px) 90vw, 650px"
            className={styles.page}
            draggable={false}
            onError={() => setFailedPage(page)}
          />
        )}
      </div>
      <footer className={styles.controls}>
        <button type="button" className="secondary-button" aria-controls={imageId} aria-label="Önceki sayfa" disabled={page === 1} onClick={() => goTo(page - 1)}><ChevronLeft size={18} aria-hidden="true" /><span>Önceki</span></button>
        <label className={styles.jump}>Sayfa
          <select aria-label="Önizleme sayfası seç" value={page} onChange={(event) => goTo(Number(event.target.value))}>
            {Array.from({ length: total }, (_, index) => <option key={index} value={index + 1}>{index + 1} / {total}</option>)}
          </select>
        </label>
        <button type="button" className="secondary-button" aria-controls={imageId} aria-label="Sonraki sayfa" disabled={page === total} onClick={() => goTo(page + 1)}><span>Sonraki</span><ChevronRight size={18} aria-hidden="true" /></button>
      </footer>
      <p className={styles.hint}>Sayfaları oklarla, yön tuşlarıyla veya sağa–sola kaydırarak inceleyin.</p>
    </section>
  );
}
