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
  return (
    <section className="max-w-4xl space-y-6">
      <Link className="ghost-button" href="/admin/seo/studio">
        ← Makale stüdyosu
      </Link>
      <h2 className="text-2xl font-bold">{item.post.title}</h2>
      <p role="status">{STAGE_LABELS[item.stage]}</p>
      {item.published ? (
        <p className="dashboard-panel p-5">
          Bu yazı yayında; stüdyo salt okunur.
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
          İnceleme yayın izni değildir. Otomatik yayın kapalı; yayın ve
          zamanlama Faz 4 kapsamındadır.
        </p>
      </section>
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
      <section className="dashboard-panel p-5">
        <h3 className="font-bold">Arama sonucu taslağı</h3>
        <p className="break-all text-sm">netfener.com/blog/{item.post.slug}</p>
        <p className="font-bold">{item.post.seoTitle || item.post.title}</p>
        <p>{item.post.seoDescription || "SEO açıklaması henüz yok."}</p>
        <p className="mt-2 text-sm">
          Bu bir önizlemedir; Google görünümü veya dizine eklenme garantisi
          değildir.
        </p>
      </section>
    </section>
  );
}
