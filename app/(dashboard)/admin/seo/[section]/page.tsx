import { SeoKeywordsPage } from "@/components/admin/seo/SeoKeywordsPage";
import { SeoCalendarPage } from "@/components/admin/seo/SeoCalendarPage";
import { SeoPerformancePage } from "@/components/admin/seo/SeoPerformancePage";
import { SeoStudioPage } from "@/components/admin/seo/SeoStudioPage";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import {
  getSeoOverview,
  getSeoAttention,
  listSeoInventory,
  listSeoActivity,
} from "@/server/services/seo/dashboard.service";
import { readGscConfig } from "@/lib/seo/gsc";
import { SeoSettingsForm } from "@/components/admin/seo/SeoSettingsForm";
import { SeoControls } from "@/components/admin/seo/SeoControls";
import { ACCESS_LABELS } from "@/lib/seo/inventory";
import { PROMPT_VERSION, SEO_PROMPTS } from "@/lib/seo/prompts";
const date = (value: Date) =>
  new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(value);
function Pagination({
  page,
  count,
  section,
  q = "",
}: {
  page: number;
  count: number;
  section: string;
  q?: string;
}) {
  const pages = Math.max(1, Math.ceil(count / 30));
  return (
    <nav aria-label="Sayfalar" className="flex flex-wrap items-center gap-4">
      <span>
        {count} kayıt · Sayfa {page} / {pages}
      </span>
      {page > 1 ? (
        <Link
          className="ghost-button"
          href={`/admin/seo/${section}?page=${page - 1}&q=${encodeURIComponent(q)}`}
        >
          Önceki
        </Link>
      ) : null}
      {page < pages ? (
        <Link
          className="ghost-button"
          href={`/admin/seo/${section}?page=${page + 1}&q=${encodeURIComponent(q)}`}
        >
          Sonraki
        </Link>
      ) : null}
    </nav>
  );
}
export default async function SeoSection({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string; q?: string; archived?: string }>;
}) {
  const actor = await getAuthContext();
  if (!actor || actor.role !== "ADMIN") forbidden();
  const { section } = await params;
  const query = await searchParams;
  if (section === "performance" || section === "refresh" || section === "quick-wins")
    return <SeoPerformancePage actorId={actor.id} view={section} />;
  if (section === "calendar") return <SeoCalendarPage actorId={actor.id} />;
  if (section === "studio")
    return <SeoStudioPage actorId={actor.id} page={query.page} />;
  if (["keywords", "opportunities"].includes(section))
    return (
      <SeoKeywordsPage
        actorId={actor.id}
        opportunities={section === "opportunities"}
        query={query}
      />
    );
  if (section === "inventory") {
    const { items, count, page, q } = await listSeoInventory(actor.id, query);
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Mevcut içerik envanteri</h2>
        <p className="text-sm">
          Veritabanı içeriği ve doğrulanmış araç rotaları. Bu sayı Google
          tarafından dizine eklenmiş sayfa sayısı değildir. Konu kayıtları ders
          gövdelerini içermez; bağlantılar yalnızca kaynak metindeki açık
          bağlantılardan çıkarılır.
        </p>
        <SeoControls kind="refresh" />
        <form className="flex flex-wrap gap-2">
          <label className="flex-1">
            Başlık veya URL
            <input
              name="q"
              defaultValue={q}
              maxLength={100}
              className="mt-1 w-full rounded-lg border border-[color:var(--border)] p-3 focus-ring"
            />
          </label>
          <button className="secondary-button self-end">Ara</button>
        </form>
        {items.length ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="dashboard-panel space-y-2 p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-bold">{item.title}</h3>
                  <span className="text-xs">
                    {item.sourceType} ·{" "}
                    {item.publication === "DRAFT" ? "Taslak" : "Yayında"}
                  </span>
                </div>
                {item.publication === "DRAFT" ? (
                  <p className="break-all text-sm">
                    {item.url} (halka açık değil)
                  </p>
                ) : (
                  <Link
                    className="block break-all text-sm underline focus-ring"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.url} ↗
                  </Link>
                )}
                <p className="text-sm">
                  {ACCESS_LABELS[item.access] ?? item.access} ·{" "}
                  {item.examSlug ?? "Genel"} · Dil:{" "}
                  {item.languageCode ?? "Kaynakta tanımlanmamış"}
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  Tarama: {date(item.scannedAt)}
                  {item.sourceUpdatedAt
                    ? ` · Kaynak güncelleme: ${date(item.sourceUpdatedAt)}`
                    : ""}
                </p>
                <details>
                  <summary className="cursor-pointer text-sm font-semibold">
                    SEO alanları ve kaynak bağlantıları
                  </summary>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div>
                      <dt className="font-bold">SEO başlığı</dt>
                      <dd>
                        {item.seoTitle || "Kaynakta ayrı SEO başlığı yok"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold">SEO açıklaması</dt>
                      <dd>
                        {item.seoDescription ||
                          "Kaynakta ayrı SEO açıklaması yok"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold">Konu</dt>
                      <dd>{item.topic || "Tanımlanmamış"}</dd>
                    </div>
                  </dl>
                  <ul className="mt-3 space-y-1 text-sm">
                    {Array.isArray(item.internalLinks) &&
                    item.internalLinks.length ? (
                      (
                        item.internalLinks as { url: string; anchor: string }[]
                      ).map((link) => (
                        <li key={link.url}>
                          <span>{link.anchor || "Bağlantı"}</span> →{" "}
                          <span className="break-all">{link.url}</span>
                        </li>
                      ))
                    ) : (
                      <li>
                        Kaynak metinde açık iç bağlantı bulunamadı. Site
                        genelindeki bağlantılar ayrıca taranmadı.
                      </li>
                    )}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dashboard-panel p-6">
            Kayıt bulunamadı. İlk kurulum için envanteri tarayın veya aramayı
            temizleyin.
          </p>
        )}
        <Pagination page={page} count={count} section={section} q={q} />
      </section>
    );
  }
  if (section === "activity") {
    const { items, count, page } = await listSeoActivity(actor.id, query.page);
    const labels: Record<string, string> = {
      LINKS_APPROVED: "İç bağlantılar onaylandı",
      CLUSTERS_SAVED: "Konu kümeleri kaydedildi",
      BRAND_SAVED: "Marka profili kaydedildi",
      KEYWORD_SAVED: "Anahtar kelime kaydedildi",
      DRAFT_CREATED: "Makale çalışma alanı oluşturuldu",
      BRIEF_SAVED: "Brief kaydedildi",
      DRAFT_SAVED: "Makale taslağı kaydedildi",
      DRAFT_REVIEWED: "Editör incelemesi kaydedildi",
      SETTINGS_SAVED: "Ayarlar kaydedildi",
      INVENTORY_REFRESHED: "Envanter tarandı",
      AUTOPILOT_PAUSED: "Autopilot duraklatıldı",
      DRAFT_APPROVED: "Yayın için onaylandı",
      APPROVAL_REVOKED: "Yayın onayı geri alındı",
      DRAFT_SCHEDULED: "Yayın zamanlandı",
      SCHEDULE_CANCELLED: "Zamanlama iptal edildi",
      SCHEDULE_FAILED: "Zamanlanmış yayın durduruldu",
      ARTICLE_PUBLISHED: "Makale yayınlandı",
      ARTICLE_UNPUBLISHED: "Makale yayından kaldırıldı",
      VERSION_RESTORED: "Sürüm geri yüklendi",
      SEARCH_SNAPSHOT_SAVED: "Search Console anlık görüntüsü kaydedildi",
    };
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">İşlem geçmişi</h2>
        {items.length ? (
          <ol className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="dashboard-panel p-5">
                <strong>{labels[item.action] ?? item.action}</strong>
                <p className="text-sm">
                  {item.actor?.name ?? "Silinmiş yönetici hesabı"} ·{" "}
                  {date(item.createdAt)}
                </p>
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer">
                    İşlem ayrıntıları
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {JSON.stringify(item.details, null, 2)}
                  </pre>
                </details>
              </li>
            ))}
          </ol>
        ) : (
          <p className="dashboard-panel p-6">
            Henüz SEO işlemi yok. Ayarları kaydettiğinizde veya envanteri
            taradığınızda burada görünür.
          </p>
        )}
        <Pagination page={page} count={count} section={section} />
      </section>
    );
  }
  if (!["overview", "settings"].includes(section)) notFound();
  const overview = await getSeoOverview(actor.id);
  const gscConnected = readGscConfig() !== null;
  if (section === "settings")
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-bold">SEO ayarları</h2>
        <SeoSettingsForm initial={overview.settings} exams={overview.exams} />
        <div className="dashboard-panel space-y-2 p-5">
          <h3 className="font-bold">Entegrasyon durumu</h3>
          <p>
            Search Console: {gscConnected ? "API bağlı" : "API bağlı değil (CSV içe aktarma kullanılabilir)"}.
            Organik dönüşüm ölçümü (Faz 6) ve görsel sağlayıcısı: henüz yok.
          </p>
          <p>İstem sürümü: {PROMPT_VERSION}</p>
          <p className="break-words text-sm">
            {Object.keys(SEO_PROMPTS).join(" · ")}
          </p>
        </div>
      </section>
    );
  const attention = await getSeoAttention(actor.id);
  const st = attention.studio;
  const todo: { text: string; href: string; urgent?: boolean }[] = [
    st.parked > 0 && { text: `${st.parked} planlanmış yayın durduruldu — nedenini görün`, href: "/admin/seo/calendar", urgent: true },
    st.approved > 0 && { text: `${st.approved} yazı yayın için onaylı; yayınlayın veya zamanlayın`, href: "/admin/seo/studio" },
    st.reviewed > 0 && { text: `${st.reviewed} yazı incelendi; yayın onayı bekliyor`, href: "/admin/seo/studio" },
    st.writing > 0 && { text: `${st.writing} yazı taslağı düzenleniyor veya inceleme bekliyor`, href: "/admin/seo/studio" },
    st.needsBrief > 0 && { text: `${st.needsBrief} makalenin briefi tamamlanmadı`, href: "/admin/seo/studio" },
    overview.missingBlogMetadata > 0 && { text: `${overview.missingBlogMetadata} yayındaki blog yazısında SEO başlığı/açıklaması eksik`, href: "/admin/blog" },
    overview.inventoryCount === 0 && { text: "İçerik envanteri henüz taranmadı (öneriler buna dayanır)", href: "/admin/seo/overview#envanter" },
    !attention.search.period && { text: attention.search.connected ? "Search Console verisi henüz çekilmedi" : "Search Console bağlı değil; CSV ile veri aktarabilirsiniz", href: "/admin/seo/performance" },
    attention.keywords === 0 && { text: "Henüz anahtar kelime yok — yazıya buradan başlanır", href: "/admin/seo/keywords" },
  ].filter((t): t is { text: string; href: string; urgent?: boolean } => Boolean(t));
  const tasks = [
    ["Yeni makale başlat", "Anahtar kelime seç → brief oluştur", "/admin/seo/keywords"],
    ["Yazıyı yayınla veya zamanla", "İncele, onayla, yayınla", "/admin/seo/studio"],
    ["Yayın takvimini gör", "Onaylı, zamanlanan, yayındaki yazılar", "/admin/seo/calendar"],
    ["Search Console verisi ekle", "API ile çek veya CSV içe aktar", "/admin/seo/performance"],
    ["Hızlı kazanımları bul", "Küçük değişiklikle tıklama artışı", "/admin/seo/quick-wins"],
    ["Eski yazıları iyileştir", "Düşen ve yenilenmesi gereken sayfalar", "/admin/seo/refresh"],
  ];
  const d = (v: Date) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "UTC" }).format(v);
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Başlangıç</h2>
      <section className="dashboard-panel space-y-3 p-5" aria-label="Sıradaki işler">
        <h3 className="text-lg font-bold">Sıradaki işler</h3>
        {todo.length ? (
          <ul className="space-y-2">
            {todo.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="underline">{t.text}</Link>
                {t.urgent ? <strong> · önemli</strong> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>Bekleyen iş yok.</p>
        )}
      </section>
      <section aria-label="Ne yapmak istiyorsun?" className="space-y-3">
        <h3 className="text-lg font-bold">Ne yapmak istiyorsun?</h3>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map(([title, hint, href]) => (
            <li key={href}>
              <Link href={href} className="dashboard-panel block h-full p-4 hover:shadow-md">
                <span className="font-bold">{title}</span>
                <span className="mt-1 block text-sm text-[color:var(--muted)]">{hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="dashboard-panel space-y-3 p-5" aria-label="Makale hattı">
        <h3 className="text-lg font-bold">Makale hattı</h3>
        <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Brief bekliyor", st.needsBrief],
            ["Yazılıyor", st.writing],
            ["İncelendi", st.reviewed],
            ["Onaylı", st.approved],
            ["Zamanlandı", st.scheduled],
            ["Yayında", st.published],
          ].map(([label, n]) => (
            <li key={label}>
              <p className="text-2xl font-bold">{n}</p>
              <p className="text-sm text-[color:var(--muted)]">{label}</p>
            </li>
          ))}
        </ol>
        <Link href="/admin/seo/studio" className="underline">Makale stüdyosunu aç</Link>
      </section>
      <section className="dashboard-panel space-y-3 p-5" aria-label="Arama verileri">
        <h3 className="text-lg font-bold">Arama verileri (Search Console)</h3>
        <p className="text-sm">
          {attention.search.connected ? "API bağlı." : "API bağlı değil (CSV ile veri aktarılabilir)."}{" "}
          Veriler yalnızca içe aktarılan dönemleri kapsar; canlı veri değildir.
        </p>
        {attention.search.period ? (
          <dl className="grid gap-3 sm:grid-cols-4">
            <div><dt className="text-sm">Dönem</dt><dd className="font-semibold">{d(attention.search.period.start)} – {d(attention.search.period.end)}</dd></div>
            <div><dt className="text-sm">Tıklama</dt><dd className="font-semibold">{attention.search.clicks}</dd></div>
            <div><dt className="text-sm">Gösterim</dt><dd className="font-semibold">{attention.search.impressions}</dd></div>
            <div><dt className="text-sm">Sayfa</dt><dd className="font-semibold">{attention.search.pages}</dd></div>
          </dl>
        ) : (
          <p className="text-sm">Henüz veri aktarılmadı.</p>
        )}
        <p className="text-sm">Organik kayıt/satış ölçümü (Faz 6) henüz yok; bu alanlarda veri gösterilmez.</p>
        <Link href="/admin/seo/performance" className="underline">Performans sayfasını aç</Link>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Envanterdeki içerik", overview.inventoryCount],
          ["Yayındaki blog yazısı", overview.publishedPosts],
          ["Mevcut blog taslağı", overview.draftPosts],
          ["SEO alanı eksik yayındaki blog", overview.missingBlogMetadata],
        ].map(([label, value]) => (
          <div key={label} className="dashboard-panel p-5">
            <p className="text-sm text-[color:var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <details id="envanter" className="dashboard-panel p-5" open={overview.inventoryCount === 0}>
        <summary className="cursor-pointer text-lg font-bold">İçerik envanteri ve kurulum</summary>
        <div className="mt-4 space-y-3">
          <p>
            <Link href="/admin/seo/settings" className="underline">Etkin sınavları, dil ve pazarları seçin</Link>; ardından envanteri tarayın. Tarama yalnızca kaynak veriyi okur.
          </p>
          <SeoControls kind="refresh" />
          <p className="text-sm">
            Son tarama: {overview.lastRefresh ? date(overview.lastRefresh.createdAt) : "Henüz çalıştırılmadı"} · Artık kaynakta bulunmayan kayıt: {overview.unavailable}
          </p>
          <p className="text-sm">
            Etkin sınavlar: {overview.exams.map((e) => e.name).join(", ") || "Henüz yok"}. YDT gibi koçluk seçenekleri otomatik olarak sınav kataloğuna eklenmez.
          </p>
          <Link className="underline" href="/admin/blog">Mevcut blog yönetimini aç</Link>
        </div>
      </details>
    </section>
  );
}
