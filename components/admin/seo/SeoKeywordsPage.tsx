import Link from "next/link";
import { listSeoKeywords } from "@/server/services/seo/keywords.service";
import { SeoKeywordForm } from "./SeoKeywordForm";
import { INTENT_LABELS, type KeywordInput } from "@/lib/seo/keywords";
export async function SeoKeywordsPage({
  actorId,
  opportunities,
  query,
}: {
  actorId: string;
  opportunities: boolean;
  query: { q?: string; page?: string; archived?: string };
}) {
  const result = await listSeoKeywords(actorId, query);
  const section = opportunities ? "opportunities" : "keywords";
  const url = (page: number) =>
    `/admin/seo/${section}?page=${page}&q=${encodeURIComponent(result.q)}&archived=${query.archived === "true"}`;
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">
        {opportunities ? "İçerik fırsatları" : "Anahtar kelimeler"}
      </h2>
      <p>
        Öncelik değerlendirmesi mevcut envantere ve editörün seçtiği arama
        amacına dayanır. Arama hacmi ve sıralama olasılığı henüz bağlı değildir.
      </p>
      {result.truncated ? (
        <p role="status">
          Değerlendirme ilk 2.000 envanter kaydıyla sınırlıdır.
        </p>
      ) : null}
      {!opportunities ? (
        <details className="dashboard-panel p-5">
          <summary className="cursor-pointer font-bold">
            Anahtar kelime ekle
          </summary>
          <div className="mt-4">
            <SeoKeywordForm exams={result.exams} />
          </div>
        </details>
      ) : (
        <Link className="ghost-button" href="/admin/seo/keywords">
          Anahtar kelimeleri yönet
        </Link>
      )}
      <form className="flex flex-wrap items-end gap-3">
        <label>
          Kelime ara
          <input
            name="q"
            defaultValue={result.q}
            maxLength={100}
            className="block rounded-lg border p-3 focus-ring"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            name="archived"
            type="checkbox"
            value="true"
            defaultChecked={query.archived === "true"}
          />
          Arşivlenenler
        </label>
        <button className="ghost-button">Filtrele</button>
      </form>
      <p>
        {result.count} kayıt · Sayfa {result.page}
      </p>
      <ul className="space-y-4">
        {result.items.map((item) => (
          <li key={item.id} className="dashboard-panel space-y-3 p-5">
            <h3 className="text-lg font-bold">{item.keyword}</h3>
            <p>
              {item.languageCode} · {item.market} ·{" "}
              {INTENT_LABELS[item.intent] ?? item.intent}
            </p>
            <p className="whitespace-pre-wrap break-words">{item.sourceNote}</p>
            <p>
              <strong>İçerik uygunluğu: {item.assessment.relevance}/100</strong>{" "}
              · Arama hacmi: veri bağlı değil
            </p>
            <ul>
              {item.assessment.signals.map((s) => (
                <li key={s.label}>
                  {s.label}: {s.points}
                </li>
              ))}
            </ul>
            {item.assessment.duplicate ? (
              <p role="status" className="font-semibold">
                Benzer başlık bulundu. Yeni içerik yazmadan önce mevcut sayfayı
                güncelleme seçeneğini değerlendirin.
              </p>
            ) : null}
            <details>
              <summary className="cursor-pointer">
                İlgili envanter sayfaları ({item.assessment.related.length})
              </summary>
              <ul className="mt-2 space-y-2">
                {item.assessment.related.map((r) => (
                  <li key={r.id}>
                    <Link className="underline break-words" href={r.url}>
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {!item.assessment.related.length ? (
                <p>
                  İlgili kayıt yok. Envanter taramasını ve sınav seçimini
                  kontrol edin.
                </p>
              ) : null}
            </details>
            {!opportunities ? (
              <details>
                <summary className="cursor-pointer font-semibold">
                  Düzenle / arşivle
                </summary>
                <div className="mt-4">
                  <SeoKeywordForm
                    key={`${item.id}:${item.revision}`}
                    exams={result.exams}
                    initial={{
                      id: item.id,
                      keyword: item.keyword,
                      languageCode: item.languageCode,
                      market: item.market,
                      intent: item.intent as KeywordInput["intent"],
                      examId: item.examId,
                      sourceNote: item.sourceNote,
                      revision: item.revision,
                      archived: item.archived,
                    }}
                  />
                </div>
              </details>
            ) : null}
          </li>
        ))}
      </ul>
      {!result.items.length ? (
        <p className="dashboard-panel p-5">
          Henüz kayıt yok. Araştırdığınız bir anahtar kelimeyi ve öğrenci
          ihtiyacını ekleyerek başlayın.
        </p>
      ) : null}
      <nav aria-label="Anahtar kelime sayfaları" className="flex gap-4">
        {result.page > 1 ? (
          <Link className="ghost-button" href={url(result.page - 1)}>
            Önceki
          </Link>
        ) : null}
        {result.page * 30 < result.count ? (
          <Link className="ghost-button" href={url(result.page + 1)}>
            Sonraki
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
