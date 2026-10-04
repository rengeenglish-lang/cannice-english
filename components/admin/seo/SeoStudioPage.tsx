import Link from "next/link";
import { getSeoStudio } from "@/server/services/seo/studio.service";
import { SeoBrandForm } from "./SeoStudioForms";
export async function SeoStudioPage({
  actorId,
  page,
}: {
  actorId: string;
  page?: string;
}) {
  const result = await getSeoStudio(actorId, page);
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">Makale stüdyosu</h2>
      <p>
        Anahtar kelime → brief → ChatGPT’de yaz → buraya yapıştır → kontrol et.
        API ücreti yok; içerik otomatik yayınlanmaz.
      </p>
      <Link className="primary-button" href="/admin/seo/keywords">
        Anahtar kelimeden brief başlat
      </Link>
      <details className="dashboard-panel p-5">
        <summary className="cursor-pointer font-bold">
          Marka profili ve hedef kitle
        </summary>
        <div className="mt-4">
          <SeoBrandForm initial={result.brand} />
        </div>
      </details>
      <ul className="space-y-3">
        {result.items.map((item) => (
          <li key={item.id} className="dashboard-panel space-y-2 p-5">
            <h3 className="font-bold">{item.post.title}</h3>
            <p>
              {item.keyword.keyword} ·{" "}
              {item.post.status === "PUBLISHED"
                ? "Yayında"
                : item.briefReady
                  ? "Taslak çalışma alanı"
                  : "Brief hazırlanıyor"}
            </p>
            <Link
              className="ghost-button"
              href={`/admin/seo/studio/${item.id}`}
            >
              Briefi ve yazıyı aç
            </Link>
          </li>
        ))}
      </ul>
      {!result.items.length ? (
        <p className="dashboard-panel p-5">
          Henüz makale çalışma alanı yok. Anahtar kelimelerden “Brief oluştur /
          aç” seçin.
        </p>
      ) : null}
      <nav aria-label="Stüdyo sayfaları" className="flex gap-4">
        <span>
          {result.count} taslak · Sayfa {result.page}
        </span>
        {result.page > 1 ? (
          <Link href={`/admin/seo/studio?page=${result.page - 1}`}>Önceki</Link>
        ) : null}
        {result.page * 20 < result.count ? (
          <Link href={`/admin/seo/studio?page=${result.page + 1}`}>
            Sonraki
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
