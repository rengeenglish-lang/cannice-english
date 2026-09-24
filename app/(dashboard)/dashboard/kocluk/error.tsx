"use client";
import Link from "next/link";

export default function CoachingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section role="alert" className="dashboard-panel text-center">
      <h1 className="section-title">Koçluk sayfası şu an yüklenemedi.</h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">Bağlantını kontrol edip tekrar dene. Verilerin kaybolmadı. / Coaching couldn&apos;t load right now; your data is safe.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="primary-button">Tekrar dene</button>
        <Link href="/dashboard" className="ghost-button">Çalışma alanım</Link>
      </div>
    </section>
  );
}
