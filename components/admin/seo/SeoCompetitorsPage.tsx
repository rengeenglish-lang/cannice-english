import Link from "next/link";
import { getCompetitorReport } from "@/server/services/seo/competitors.service";
import { AddCompetitorForm, ImportTopicsForm, RemoveCompetitor, SerpForm, ToggleCompetitor, TrackGapButton } from "./SeoCompetitorForms";
const KIND: Record<string, string> = { OWN: "Netfener", COMPETITOR: "Tanımlı rakip", GENERIC: "Genel platform", CANDIDATE: "Rakip adayı" };

export async function SeoCompetitorsPage({ actorId }: { actorId: string }) {
  const r = await getCompetitorReport(actorId);
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Rakipler</h2>
      <p>
        Rakip analizi yalnızca <strong>sizin girdiğiniz</strong> verilere dayanır (başlık, adres, arama sonucunda gördükleriniz). Araç rakip sitelerini taramaz, makale
        metni saklamaz ve hiçbir içeriği kopyalamaz; yalnızca stratejik karşılaştırma yapar. Eşleştirme sözcük örtüşmesidir (anlamsal değil) ve arama hacmi hakkında bilgi vermez.
      </p>
      <section className="dashboard-panel space-y-3 p-5" aria-label="Rakip ekle">
        <h3 className="text-lg font-bold">Rakip ekle</h3>
        <AddCompetitorForm />
      </section>
      <section className="space-y-3" aria-label="Rakipler">
        <h3 className="text-lg font-bold">Tanımlı rakipler ({r.competitors.length})</h3>
        {r.competitors.length ? (
          <ul className="space-y-3">
            {r.competitors.map((c) => (
              <li key={c.id} className="dashboard-panel space-y-3 p-5">
                <p className="font-bold">{c.name} · <span className="break-all font-normal">{c.domain}</span> {c.active ? "" : "· pasif"}</p>
                {c.notes ? <p className="text-sm">{c.notes}</p> : null}
                <p className="text-sm">{c.topics} konu · {c.serp} arama sonucu kaydı</p>
                <ImportTopicsForm id={c.id} name={c.domain} />
                <div className="flex flex-wrap gap-4">
                  <ToggleCompetitor id={c.id} active={c.active} />
                  <RemoveCompetitor id={c.id} name={c.name} />
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="dashboard-panel p-5">Henüz rakip yok.</p>}
      </section>
      <section className="dashboard-panel space-y-3 p-5" aria-label="İçerik boşlukları">
        <h3 className="text-lg font-bold">İçerik boşlukları ({r.gapTotal})</h3>
        <p className="text-sm">Rakiplerin işlediği ancak {r.inventoryCount} sayfalık Netfener envanterinde yeterince karşılığı olmayan konular. Önce <Link href="/admin/seo/overview#envanter" className="underline">envanteri taratın</Link>. Çok rakipte geçen konular üstte.</p>
        {r.gaps.length ? (
          <ul className="space-y-3">
            {r.gaps.map((g) => (
              <li key={g.normalized} className="space-y-1">
                <p className="font-semibold">{g.title}</p>
                <p className="text-sm">{g.competitors.length} rakip: {g.competitors.join(", ")}{g.nearest ? ` · en yakın sayfamız: ${g.nearest.title} (%${Math.round(g.nearest.coverage * 100)} örtüşme)` : " · benzer sayfamız yok"}</p>
                {g.tracked ? <p className="text-sm">Zaten anahtar kelime olarak takipte.</p> : <TrackGapButton title={g.title} />}
              </li>
            ))}
          </ul>
        ) : <p>{r.competitors.some((c) => c.topics) ? "Boşluk bulunamadı." : "Önce bir rakibin konularını içe aktarın."}</p>}
      </section>
      <section className="dashboard-panel space-y-3 p-5" aria-label="SERP araştırması">
        <h3 className="text-lg font-bold">Arama sonucu (SERP) kayıtları</h3>
        <p className="text-sm">Bir anahtar kelime için Google’da gördüğünüz ilk sonuçları sırayla girin. Hangi sitelerin tekrar tekrar çıktığı aşağıda özetlenir; tanımsız sık siteler “rakip adayı” olarak işaretlenir.</p>
        <SerpForm keywords={r.keywordChoices} />
        {r.serpSummary.length ? (
          <ul className="space-y-1">
            {r.serpSummary.map((d) => (
              <li key={d.domain}><strong className="break-all">{d.domain}</strong> · {KIND[d.kind]} · {d.keywords} anahtar kelimede · en iyi sıra {d.bestRank} · ortalama {d.averageRank.toFixed(1)}</li>
            ))}
          </ul>
        ) : null}
        {r.serpKeywords.length ? (
          <details>
            <summary className="cursor-pointer font-bold">Kayıtlı sonuçlar ({r.serpKeywords.length} anahtar kelime)</summary>
            <ul className="mt-2 space-y-2">
              {r.serpKeywords.map((k) => (
                <li key={k.id}><strong>{k.keyword}</strong><ol className="list-decimal pl-5 text-sm">{k.results.map((x) => <li key={x.rank}>{x.title} — {x.domain}</li>)}</ol></li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </section>
  );
}
