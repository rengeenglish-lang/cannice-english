import Link from "next/link";
import { getPerformanceReport, gscStatus, listSnapshots } from "@/server/services/seo/performance.service";
import { ACTION_LABELS, KIND_LABELS, type PerfRow, type SnapshotKind } from "@/lib/seo/performance";
import { SearchDataForm } from "./SeoPerformanceForms";
const pct = (n: number) => `%${(n * 100).toFixed(1)}`;
const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);
const dateFmt = (d: Date) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "UTC" }).format(d);
function RowLabel({ r }: { r: PerfRow }) {
  return <span className="break-all font-semibold">{r.query ? (r.page ? `${r.query} → ${r.page}` : r.query) : r.page}</span>;
}
function Empty() {
  return (
    <p className="dashboard-panel p-5">
      Henüz Search Console verisi yok. <Link className="underline" href="/admin/seo/performance">Performans</Link> sayfasından bir dönem içe aktarın; veri uydurulmaz.
    </p>
  );
}
export async function SeoPerformancePage({ actorId, view }: { actorId: string; view: "performance" | "quick-wins" | "refresh" }) {
  const report = await getPerformanceReport(actorId);
  if (view === "quick-wins")
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Hızlı kazanımlar</h2>
        <p>Konum 5–20 arasında ve en az 100 gösterimi olan satırlar. Beklenen tıklama oranı bir editoryal tahmindir (konuma göre kaba tablo); Google verisi veya tahmin garantisi değildir.</p>
        {!report.snapshot ? <Empty /> : (
          <>
            <WinTable title="Sayfalar" rows={report.pageQuickWins} />
            <WinTable
              title={report.queryQuickWinsSource === "PAGE_QUERIES" ? "Sayfa + sorgu" : "Sorgular"}
              rows={report.queryQuickWins}
              empty={report.queryQuickWinsSource ? undefined : "Sorgu verisi içe aktarılmadı."}
            />
            <section className="dashboard-panel space-y-2 p-5">
              <h3 className="text-lg font-bold">Takip edilmeyen sorgular ({report.untracked.length})</h3>
              <p className="text-sm">100+ gösterimi olup anahtar kelime listenizde bulunmayanlar; içerik boşluğu adayıdır. <Link className="underline" href="/admin/seo/keywords">Anahtar kelimeler</Link>’den ekleyebilirsiniz.</p>
              <ul>{report.untracked.map((r) => <li key={r.query}>{r.query} · {fmt(r.impressions)} gösterim · konum {r.position.toFixed(1)}</li>)}</ul>
            </section>
          </>
        )}
      </section>
    );
  if (view === "refresh")
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-bold">İçerik yenileme</h2>
        <p>Düşüş, düşük TO, ikinci sayfa konumu, kısa metin ve iç bağlantı eksiği kurallarıyla üretilen öneriler. Yeniden yazma, birleştirme, CTA ve güncellik değerlendirmesi henüz yapılmaz (dönüşüm verisi ve anlamsal analiz gerekir).</p>
        {!report.snapshot ? <Empty /> : report.recommendations.length ? (
          <ul className="space-y-3">
            {report.recommendations.map((r) => (
              <li key={r.page} className="dashboard-panel space-y-2 p-5">
                <p className="break-all font-bold">{r.page}</p>
                <p>{r.actions.map((a) => ACTION_LABELS[a]).join(" · ")}</p>
                <ul className="list-disc pl-5 text-sm">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
                {r.draftId ? <Link className="ghost-button" href={`/admin/seo/studio/${r.draftId}`}>Makale stüdyosunda aç</Link> : null}
              </li>
            ))}
          </ul>
        ) : <p className="dashboard-panel p-5">Yeterli veriye dayalı bir öneri yok: {ACTION_LABELS.NO_ACTION}.</p>}
      </section>
    );
  const snapshots = await listSnapshots(actorId);
  const gsc = gscStatus();
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">Performans</h2>
      <p>Search Console verisi anlık görüntü olarak saklanır; sıralama garantisi veya canlı veri değildir. Gösterim/tıklama yalnızca içe aktardığınız dönemleri kapsar.</p>
      {report.snapshot && report.period ? (
        <section className="dashboard-panel space-y-2 p-5" aria-label="Son dönem">
          <h3 className="text-lg font-bold">Son sayfa verisi: {report.period.start} – {report.period.end}</h3>
          <p>{fmt(report.totals.clicks)} tıklama · {fmt(report.totals.impressions)} gösterim · {fmt(report.pageCount)} sayfa</p>
          {report.decayAvailable ? null : <p>Düşüş analizi için hemen önceki eşit uzunlukta bir dönemin anlık görüntüsü gerekir; küçük veri kümelerinde uyarı üretilmez.</p>}
        </section>
      ) : <Empty />}
      {report.decay.length ? (
        <section className="dashboard-panel space-y-3 p-5" aria-label="İçerik düşüşü">
          <h3 className="text-lg font-bold">Düşen sayfalar ({report.decay.length})</h3>
          <ul className="space-y-2">
            {report.decay.map((d) => (
              <li key={d.page}>
                <strong>{d.severity === "HIGH" ? "Yüksek" : "Orta"}</strong> · <span className="break-all">{d.page}</span>
                <ul className="list-disc pl-5 text-sm">{d.signals.map((s) => <li key={s}>{s}</li>)}</ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="dashboard-panel space-y-3 p-5">
        <h3 className="text-lg font-bold">Search Console’dan çek</h3>
        <p>{gsc.configured ? "Servis hesabı tanımlı. Veri genellikle 2–3 gün gecikmeli olur." : "Bağlı değil. Sunucu ortamında GSC_SERVICE_ACCOUNT_JSON ve GSC_SITE_URL tanımlandığında etkinleşir; hesabın e-postası Search Console mülkünde kullanıcı olarak eklenmelidir."}</p>
        <SearchDataForm mode="sync" gscConfigured={gsc.configured} />
      </section>
      <section className="dashboard-panel space-y-3 p-5">
        <h3 className="text-lg font-bold">CSV içe aktar</h3>
        <p>Search Console → Performans → Dışa aktar. İlk sütun sayfa/sorgu, ardından tıklama, gösterim, TO, konum. Aynı tür ve dönem yeniden aktarılırsa öncekinin yerini alır.</p>
        <SearchDataForm mode="csv" gscConfigured={gsc.configured} />
      </section>
      <section className="dashboard-panel space-y-2 p-5" aria-label="Anlık görüntüler">
        <h3 className="text-lg font-bold">Anlık görüntüler</h3>
        {snapshots.length ? (
          <ul>
            {snapshots.map((s) => (
              <li key={s.id}>{KIND_LABELS[s.kind as SnapshotKind] ?? s.kind} · {dateFmt(s.periodStart)} – {dateFmt(s.periodEnd)} · {fmt(s.rowCount)} satır{s.droppedRows ? ` (${s.droppedRows} atlandı)` : ""} · {s.source === "CSV" ? "CSV" : "API"}</li>
            ))}
          </ul>
        ) : <p>Kayıt yok.</p>}
      </section>
    </section>
  );
}
function WinTable({ title, rows, empty }: { title: string; rows: (PerfRow & { action: keyof typeof ACTION_LABELS; reason: string })[]; empty?: string }) {
  return (
    <section className="dashboard-panel space-y-3 p-5" aria-label={title}>
      <h3 className="text-lg font-bold">{title} ({rows.length})</h3>
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.page + r.query}>
              <RowLabel r={r} />
              <p className="text-sm">Konum {r.position.toFixed(1)} · {fmt(r.impressions)} gösterim · {fmt(r.clicks)} tıklama · TO {pct(r.ctr)}</p>
              <p className="text-sm"><strong>{ACTION_LABELS[r.action]}:</strong> {r.reason}</p>
            </li>
          ))}
        </ul>
      ) : <p>{empty ?? "Eşiği geçen satır yok."}</p>}
    </section>
  );
}
