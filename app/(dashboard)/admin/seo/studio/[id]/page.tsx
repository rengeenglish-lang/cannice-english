import { LinkPlanForm } from "@/components/admin/seo/SeoPlanningForms";
import { getPlanningChoices } from "@/server/services/seo/planning.service";
import { SeoIntelligence } from "@/components/admin/seo/SeoIntelligence";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getSeoDraft } from "@/server/services/seo/studio.service";
import {
  SeoBriefForm,
  SeoManualPrompt,
  SeoArticleForm,
  SeoReviewForm,
} from "@/components/admin/seo/SeoStudioForms";
import { STAGE_LABELS } from "@/lib/seo/studio";
import { getPublishingState } from "@/server/services/seo/publishing.service";
import {
  PublishingStepForm,
  ScheduleForm,
  RestoreVersionForm,
} from "@/components/admin/seo/SeoPublishingForms";
import { VERSION_REASONS } from "@/lib/seo/publishing";
const when = (v: string | Date) =>
  new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(v));
export default async function SeoArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await getAuthContext();
  if (actor?.role !== "ADMIN") forbidden();
  const { id } = await params;
  const item = await getSeoDraft(actor.id, id);
  if (!item) notFound();
  const publishing = await getPublishingState(actor.id, id);
  const choices = await getPlanningChoices(actor.id, item.approvedLinks.map(l => l.itemId));
  return (
    <section className="max-w-4xl space-y-6">
      <Link className="ghost-button" href="/admin/seo/studio">
        ← Makale stüdyosu
      </Link>
      <h2 className="text-2xl font-bold">{item.post.title}</h2>
      <p role="status">{STAGE_LABELS[item.stage]}</p>
      {item.published ? (
        <p className="dashboard-panel p-5">
          Bu yazı yayında; stüdyo salt okunur. Düzenlemek için aşağıdaki “Yayın”
          bölümünden yayından kaldırın; her sürüm geçmişte saklanır.
        </p>
      ) : null}
      <details open={!item.briefReady} className="dashboard-panel p-5">
        <summary className="cursor-pointer text-lg font-bold">
          1. Brief ve kaynaklar
        </summary>
        <div className="mt-4">
          {!item.published ? (
            <SeoBriefForm
              id={id}
              revision={item.revision}
              brief={item.brief}
              ready={item.briefReady}
              catalogue={item.catalogue}
            />
          ) : (
            <p className="whitespace-pre-wrap">{item.brief.outline}</p>
          )}
        </div>
      </details>
      <SeoIntelligence actorId={actor.id} id={id} />
      <section className="dashboard-panel space-y-4 p-5">
        <h3 className="text-lg font-bold">Onaylı iç bağlantılar</h3>
        <p>En fazla 12 bağlantı. Kaydetme hedefleri yeniden doğrular ve önceki editör incelemesini kaldırır. Metne otomatik eklenmez; yayın aşamasında kullanılacak bağlantı planıdır.</p>
        {!item.published ? <LinkPlanForm key={item.revision} id={id} revision={item.revision} links={item.approvedLinks.map(({itemId,label})=>({itemId,label}))} choices={choices}/> : null}
        <ul>{item.approvedLinks.map(l=><li key={l.itemId}>{l.destination ? <Link className="underline" href={l.destination.url}>{l.label}</Link> : <span role="alert">{l.label} — hedef artık kullanılamıyor; kaldırın veya yeniden seçin.</span>}</li>)}</ul>
      </section>
      {item.missingCta ? (
        <p role="alert">
          Seçilen bağlantı artık envanterde bulunmuyor. Briefteki bağlantıyı
          güncelleyin.
        </p>
      ) : null}
      {item.prompt ? (
        <details className="dashboard-panel p-5">
          <summary className="cursor-pointer text-lg font-bold">
            2. ChatGPT ile taslak hazırla
          </summary>
          <div className="mt-4">
            <SeoManualPrompt text={item.prompt} />
          </div>
        </details>
      ) : (
        <p>İstemi açmak için briefi tamamlayıp hazır olarak kaydedin.</p>
      )}
      {item.briefReady && !item.published ? (
        <details open className="dashboard-panel p-5">
          <summary className="cursor-pointer text-lg font-bold">
            3. Makale ve metaveriler
          </summary>
          <div className="mt-4">
            <SeoArticleForm
              id={id}
              revision={item.revision}
              postUpdatedAt={item.postUpdatedAt}
              post={item.post}
            />
          </div>
        </details>
      ) : null}
      <section
        className="dashboard-panel space-y-4 p-5"
        aria-label="Kaydedilmiş taslak kontrolleri"
      >
        <h3 className="text-lg font-bold">4. Kaydedilmiş taslağın kontrolü</h3>
        <p>
          <strong>Kontrol listesi: {item.report.score}/100</strong> ·{" "}
          {item.report.wordCount} kelime
        </p>
        <ul className="space-y-2">
          {item.report.checks.map((c) => (
            <li key={c.id}>
              {c.passed ? "✓ Tamam" : "Eksik"} — {c.label}
              {c.critical ? " (zorunlu)" : ""}
            </li>
          ))}
        </ul>
        {item.report.warnings.map((w) => (
          <p key={w} className="text-sm">
            {w}
          </p>
        ))}
        {item.briefReady && !item.published ? (
          <SeoReviewForm
            id={id}
            revision={item.revision}
            postUpdatedAt={item.postUpdatedAt}
            eligible={item.report.checks.every((c) => !c.critical || c.passed)}
          />
        ) : null}
        <p className="text-sm">
          İnceleme yayın izni değildir; yayın için aşağıdaki ayrı onay adımı gerekir.
        </p>
      </section>
      {publishing ? (
        <section className="dashboard-panel space-y-4 p-5" aria-label="Yayın">
          <h3 className="text-lg font-bold">5. Yayın</h3>
          <p>
            Yayın kapısı her işlemde güncel veriyle yeniden denetlenir; geçilemezse
            yazı yayınlanmaz ve düzeltme beklenir. Zorlama seçeneği yoktur.
          </p>
          <ul className="space-y-1">
            {publishing.gate.checks.map((c) => (
              <li key={c.id}>
                {c.passed ? "✓ Tamam" : "Eksik"} — {c.label}
              </li>
            ))}
          </ul>
          {item.scheduleError ? (
            <p role="alert">Zamanlanmış yayın durduruldu: {item.scheduleError}</p>
          ) : null}
          {item.published ? (
            <div className="space-y-2">
              <p>
                Yayında{publishing.publishedAt ? ` · ${when(publishing.publishedAt)}` : ""}.{" "}
                <Link className="underline" href={`/blog/${item.post.slug}`}>Yazıyı aç</Link>
              </p>
              <PublishingStepForm
                id={id}
                revision={item.revision}
                mode="unpublish"
                label="Yayından kaldır ve düzenle"
                confirmLabel="Yazının yayından kalkacağını ve bu adreste 404 döneceğini anlıyorum."
                tone="ghost-button"
              />
            </div>
          ) : item.stage === "SCHEDULED" ? (
            <div className="space-y-3">
              <p>
                Zamanlandı: <strong>{item.scheduledFor ? when(item.scheduledFor) : ""}</strong>.
                Vercel Cron 3 saatte bir çalışır; yazı zamanı geçtikten sonraki ilk çalışmada yayınlanır.
              </p>
              <PublishingStepForm id={id} revision={item.revision} mode="cancel" label="Zamanlamayı iptal et" tone="ghost-button" />
            </div>
          ) : item.stage === "APPROVED" ? (
            <div className="space-y-5">
              <p>Onaylandı{publishing.approvedAt ? ` · ${when(publishing.approvedAt)}` : ""}. Yazı henüz yayınlanmadı.</p>
              <div>
                <h4 className="font-bold">Zamanla</h4>
                <ScheduleForm id={id} revision={item.revision} current={null} />
              </div>
              <div>
                <h4 className="font-bold">Şimdi yayınla</h4>
                <PublishingStepForm
                  id={id}
                  revision={item.revision}
                  mode="publish"
                  label="Şimdi yayınla"
                  confirmLabel="Yazı herkese açık olacak ve site haritasına girecek; bunu onaylıyorum."
                />
              </div>
              <PublishingStepForm id={id} revision={item.revision} mode="revoke" label="Onayı geri al" tone="ghost-button" />
            </div>
          ) : item.stage === "REVIEWED" ? (
            <PublishingStepForm
              id={id}
              revision={item.revision}
              mode="approve"
              label="Yayın için onayla"
              confirmLabel="Metni, bağlantıları ve metaverileri yayınlanmaya hazır olarak onaylıyorum. Onay yazıyı yayınlamaz."
              extra={{ postUpdatedAt: item.postUpdatedAt }}
              disabled={!publishing.gate.checks.filter((c) => c.id !== "approved").every((c) => c.passed)}
            />
          ) : (
            <p>Onay için önce brief, makale ve editör incelemesi tamamlanmalı.</p>
          )}
        </section>
      ) : null}
      {publishing ? (
        <section className="dashboard-panel space-y-3 p-5" aria-label="Sürüm geçmişi">
          <h3 className="text-lg font-bold">Sürüm geçmişi</h3>
          {publishing.versions.length ? (
            <ol className="space-y-2">
              {publishing.versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3">
                  <span>
                    Sürüm {v.version} · {VERSION_REASONS[v.reason] ?? v.reason} · {when(v.createdAt)} · {v.editor}
                    {v.score !== null ? ` · kontrol listesi ${v.score}/100` : ""}
                  </span>
                  {!item.published ? (
                    <RestoreVersionForm
                      id={id}
                      revision={item.revision}
                      postUpdatedAt={item.postUpdatedAt}
                      versionId={v.id}
                      version={v.version}
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p>Henüz sürüm yok; ilk kayıttan sonra oluşur.</p>
          )}
          <p className="text-sm">Geri yükleme yalnızca taslak metni değiştirir ve yeniden inceleme/onay gerektirir. Performans bağlamı Faz 5’te (Search Console) eklenecek.</p>
        </section>
      ) : null}
      <details className="dashboard-panel p-5">
        <summary className="cursor-pointer font-bold">
          Kaydedilmiş metnin önizlemesi
        </summary>
        <article className="mt-4 space-y-4 break-words">
          <h3 className="text-xl font-bold">{item.post.title}</h3>
          {item.post.content.split(/\n\s*\n/).map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </article>
      </details>
      <section className="dashboard-panel space-y-4 p-5" aria-label="Önizlemeler">
        <h3 className="font-bold">Arama sonucu ve paylaşım önizlemesi</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Arama sonucu (masaüstü)</p>
            <p className="break-all text-sm">netfener.com › blog › {item.post.slug}</p>
            <p className="font-bold">{item.post.seoTitle || item.post.title}</p>
            <p>{item.post.seoDescription || "SEO açıklaması henüz yok."}</p>
          </div>
          <div className="max-w-[320px]">
            <p className="text-sm font-semibold">Arama sonucu (mobil, dar)</p>
            <p className="break-all text-xs">netfener.com › blog › {item.post.slug}</p>
            <p className="font-bold leading-snug">{item.post.seoTitle || item.post.title}</p>
            <p className="text-sm">{(item.post.seoDescription || "SEO açıklaması henüz yok.").slice(0, 120)}</p>
          </div>
        </div>
        <div className="max-w-md rounded-lg border border-[color:var(--border)] p-4">
          <p className="text-sm font-semibold">Sosyal paylaşım kartı</p>
          <p className="text-xs uppercase">netfener.com</p>
          <p className="font-bold">{item.post.seoTitle || item.post.title}</p>
          <p className="text-sm">{item.post.seoDescription || item.post.excerpt || "Açıklama yok."}</p>
        </div>
        <p className="text-sm">
          Bunlar önizlemedir; Google görünümü, sıralama veya dizine eklenme garantisi değildir.
        </p>
      </section>
    </section>
  );
}
