import { readAutomation } from "@/server/services/seo/automation.service";
import { listJobs } from "@/server/services/seo/jobs.service";
import { getBudgetReport } from "@/server/services/seo/budget.service";
import { gscStatus } from "@/server/services/seo/performance.service";
import { readSeoSettings } from "@/server/services/seo/settings.service";
import { claudeConfig } from "@/server/seo/claude";
import { JOB_LABELS, STATUS_LABELS } from "@/lib/seo/automation";
import { AutoGenerateToggle, AutoPublishToggle, AutoSyncToggle, EmergencyStopButton, JobButton, RunNowButton } from "./SeoAutomationControls";
const when = (d: Date | null) => (d ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(d) : "—");
const usd = (n: number) => `$${n.toFixed(2)}`;

export async function SeoAutomationPage({ actorId }: { actorId: string }) {
  const [auto, jobs, budget, seo] = await Promise.all([readAutomation(), listJobs(actorId), getBudgetReport(actorId), readSeoSettings()]);
  const cfg = seo.settings;
  const ready = [
    { ok: cfg.provider === "ANTHROPIC" && cfg.model.length > 0, label: "Ayarlar’da sağlayıcı ANTHROPIC ve model adı (örn. claude-sonnet-5-5)" },
    { ok: Boolean(claudeConfig()), label: "Sunucuda ANTHROPIC_API_KEY ile SEO_AI_INPUT_USD_PER_MTOK / SEO_AI_OUTPUT_USD_PER_MTOK tanımlı" },
    { ok: cfg.monthlyBudgetUsd > 0, label: "Ayarlar’da aylık AI bütçesi 0’dan büyük" },
  ];
  const canGenerate = ready.every((r) => r.ok) && !auto.state.emergencyStop;
  const { state, revision } = auto;
  const b = budget.state;
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">Otomasyon</h2>
      <p>
        Bu sayfa otomatik işleri yönetir. <strong>Veri işleri</strong> (Search Console eşitleme, envanter taraması) yalnızca okur. <strong>Makale üretimi</strong> Claude ile
        yapılır ve her çağrı önce AI bütçesinden rezervasyon yapar; bütçe asla aşılmaz. Üretilen yazı, ancak <strong>yayın kapısındaki tüm kontroller</strong> ve en düşük kontrol
        listesi puanı ({cfg.minimumQualityScore}) geçilirse — ve yalnızca otomatik yayın açıksa — kendiliğinden yayınlanır. Geçmeyen yazı incelemeye bırakılır.
        Acil durdurma her şeyi anında durdurur.
      </p>
      <section className="dashboard-panel space-y-3 p-5" aria-label="Durum">
        <h3 className="text-lg font-bold">Durum: {state.emergencyStop ? "ACİL DURDURULDU" : "Normal"}</h3>
        <p className="text-sm">
          {state.emergencyStop
            ? "İş çalıştırma ve zamanlanmış otomatik yayın durduruldu. Taslaklar, zamanlamalar ve ölçümler korunur; elle yayın hâlâ mümkündür."
            : "Acil durdurma tüm bekleyen işleri iptal eder ve zamanlanmış otomatik yayını durdurur; hiçbir şey silinmez."}
        </p>
        <EmergencyStopButton stopped={state.emergencyStop} revision={revision} />
        <div className="border-t border-[color:var(--border)] pt-3">
          <p className="mb-2 text-sm">
            Otomatik veri eşitleme: <strong>{state.autoSync ? "açık" : "kapalı"}</strong>. Açıkken 3 saatte bir çalışma son 28 günü ve öncesindeki 28 günü Search Console’dan çeker
            ({gscStatus().configured ? "API bağlı" : "API bağlı değil — yalnızca envanter taraması çalışır"}) ve içerik envanterini haftada bir tarar.
          </p>
          <AutoSyncToggle enabled={state.autoSync} revision={revision} disabled={state.emergencyStop} />
        </div>
      </section>
      <section className="dashboard-panel space-y-3 p-5" aria-label="Makale üretimi">
        <h3 className="text-lg font-bold">Claude ile makale üretimi</h3>
        <ul className="space-y-1 text-sm">
          {ready.map((r) => (
            <li key={r.label}>{r.ok ? "✓" : "✗"} {r.label}</li>
          ))}
        </ul>
        <p className="text-sm">
          Günlük sınır {cfg.dailyArticleLimit}, haftalık sınır {cfg.weeklyArticleLimit} makale (Ayarlar). Otomatik üretim: <strong>{state.autoGenerate ? "açık" : "kapalı"}</strong>
          {" "}· Otomatik yayın: <strong>{state.autoPublish ? "açık" : "kapalı"}</strong>.
          Üretim, anahtar kelime listesinin başından başlar; her kelime için bir kez yazılır ve mevcut taslakların üzerine asla yazılmaz.
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <AutoGenerateToggle enabled={state.autoGenerate} revision={revision} disabled={state.emergencyStop || !canGenerate} />
          <AutoPublishToggle enabled={state.autoPublish} revision={revision} disabled={state.emergencyStop || !state.autoGenerate} />
          <RunNowButton disabled={!canGenerate} />
        </div>
        <p className="text-sm">
          Bir kelimeyi hemen yazdırmak için “Anahtar kelimeler” sayfasında “Claude ile yazdır” düğmesini kullanın, ardından burada “Şimdi bir iş çalıştır”a basın.
        </p>
      </section>
      <section className="dashboard-panel space-y-3 p-5" aria-label="İşler">
        <h3 className="text-lg font-bold">Son işler</h3>
        {jobs.length ? (
          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j.id} className="space-y-1">
                <p>
                  <strong>{JOB_LABELS[j.type] ?? j.type}</strong> · {STATUS_LABELS[j.status] ?? j.status} · deneme {j.attempts}/{j.maxAttempts} · {j.status === "QUEUED" ? `planlanan ${when(j.runAt)}` : `bitiş ${when(j.finishedAt)}`}
                </p>
                {j.lastError ? <p className="text-sm text-[color:var(--danger)]">Hata: {j.lastError}</p> : null}
                {j.status === "FAILED" || j.status === "CANCELLED" ? <JobButton jobId={j.id} mode="retry" label="Yeniden dene" /> : null}
                {j.status === "QUEUED" ? <JobButton jobId={j.id} mode="cancel" label="İptal et" /> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>Henüz iş yok.</p>
        )}
      </section>
      <section className="dashboard-panel space-y-2 p-5" aria-label="AI maliyeti">
        <h3 className="text-lg font-bold">AI maliyeti ve bütçe</h3>
        <p className="text-sm">
          Sağlayıcı: {budget.provider === "NONE" ? "yapılandırılmadı" : budget.provider}. Her Claude çağrısı önce buradaki bütçeden rezervasyon yapar, bittiğinde gerçek maliyet
          yazılır; bütçe asla sessizce aşılmaz. Bütçe 0 = AI harcaması yok.
        </p>
        <p>
          {budget.month}: harcanan {usd(b.spent)} · rezerve {usd(b.reserved)} · aylık bütçe {b.cap > 0 ? usd(b.cap) : "tanımsız"}
          {b.ratio !== null ? ` · %${Math.round(b.ratio * 100)} kullanıldı` : ""}
          {b.warning >= 0.5 ? ` · uyarı eşiği: %${b.warning * 100}` : ""}
        </p>
        <p className="text-sm">Bugün {usd(budget.today)} · 7 gün {usd(budget.days7)} · 30 gün {usd(budget.days30)} · bu ay {budget.operations} işlem</p>
      </section>
    </section>
  );
}
