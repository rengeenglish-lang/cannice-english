"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1320px] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="eyebrow">Bir şeyler ters gitti</p>
      <h1 className="page-title">Beklenmeyen bir hata oluştu</h1>
      <button type="button" onClick={() => reset()} className="primary-button">Tekrar Dene</button>
    </main>
  );
}
