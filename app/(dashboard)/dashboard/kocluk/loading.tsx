/** Lightweight skeleton while the coaching data refreshes (keeps slow connections informed). */
export default function CoachingLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Yükleniyor… / Loading…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="dashboard-panel animate-pulse">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-2/3 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
