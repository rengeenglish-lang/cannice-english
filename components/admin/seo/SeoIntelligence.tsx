import Link from "next/link";
import { getDraftIntelligence } from "@/server/services/seo/intelligence.service";
import { ACCESS_LABELS } from "@/lib/seo/inventory";
export async function SeoIntelligence({ actorId, id }: { actorId: string; id: string }) {
  const report = await getDraftIntelligence(actorId, id);
  if (!report) return null;
  const sections = [{ title: "İlgili öğrenme sayfaları", rows: report.links }, { title: "İlgili ürün ve programlar", rows: report.products }];
  return <section className="dashboard-panel space-y-4 p-5" aria-label="İçerik bağlantı önerileri">
    <h3 className="text-lg font-bold">İçerik bağlantı önerileri</h3>
    <p className="text-sm">Başlık kelimeleri ve sınav eşleşmesine dayalı editör önerileri. Anlamsal analiz veya Google sıralama verisi değildir. Kaynak sayfayı inceleyip uygun bağlantıyı briefte seçin. Metne otomatik bağlantı eklenmez.</p>
    <p className="text-sm">Envanter: {report.scannedAt?.toISOString().slice(0, 10) ?? "Henüz taranmadı"}. <Link className="underline" href="/admin/seo/inventory">Envanteri güncelle</Link></p>
    {report.limited ? <p role="alert">2.000 kayıt sınırı aşıldı; eksik öneri sunulmadı.</p> : null}
    {report.overlaps.length ? <div className="rounded-lg border border-[color:var(--border)] p-3">
      <h4 className="font-bold">Olası konu çakışması</h4>
      <p className="text-sm">Yeni yazı yerine mevcut içeriği geliştirmeyi veya briefin özgün katkısını netleştirmeyi değerlendirin.</p>
      <ul>{report.overlaps.map(i => <li key={i.id}><Link className="underline" href={i.url}>{i.title}</Link> — ortak kelimeler: {i.matched.join(", ")}</li>)}</ul>
    </div> : <p>Envanterde belirgin başlık çakışması bulunmadı; bu özgünlük garantisi değildir.</p>}
    {sections.map(({title, rows}) => <div key={title}>
      <h4 className="font-bold">{title}</h4>
      {rows.length ? <ul className="mt-2 space-y-3">{rows.map(i => <li key={i.id} className="rounded-lg border border-[color:var(--border)] p-3 break-words">
        <Link href={i.url} className="font-semibold underline focus-ring">{i.title}</Link>
        <p className="text-sm">{ACCESS_LABELS[i.access] ?? i.access}</p>
        <p className="text-sm">{i.sameExam ? "Aynı sınav. " : ""}{i.matched.length ? `Ortak kelimeler: ${i.matched.join(", ")}` : "Başlık kelime eşleşmesi yok; uygunluğu kontrol edin."}</p>
        {!i.languageCode ? <p className="text-sm">Kaynak dili tanımlanmamış; dili doğrulayın.</p> : null}
      </li>)}</ul> : <p className="text-sm">Uygun kayıt bulunamadı. Envanteri ve anahtar kelimenin sınavını kontrol edin.</p>}
    </div>)}
  </section>;
}
