"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="dashboard-panel space-y-4 p-6">
      <h2 className="text-lg font-bold">SEO verileri yüklenemedi</h2>
      <p>Geçici bağlantı sorunu olabilir. Kaydedilmiş içerikler korunur.</p>
      <button className="primary-button" onClick={reset}>
        Tekrar dene
      </button>
    </div>
  );
}
