import { ClusterForm } from "@/components/admin/seo/SeoPlanningForms";
import { getClusters, getPlanningChoices } from "@/server/services/seo/planning.service";
import Link from "next/link";
import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getTopicMap } from "@/server/services/seo/intelligence.service";
export default async function TopicMapPage() {
  const actor = await getAuthContext();
  if (actor?.role !== "ADMIN") forbidden();
  const plan = await getClusters(actor.id);
  const choices = await getPlanningChoices(actor.id, plan.clusters.flatMap(c=>[c.pillarId,...c.supportingIds]));
  const map = await getTopicMap(actor.id);
  return <section className="max-w-4xl space-y-5">
    <h2 className="text-2xl font-bold">Editoryal konu haritası</h2>
    <p>Anahtar kelimeler sınav, dil, pazar ve arama amacına göre gruplanır. Bunlar otomatik anlamsal kümeler veya ölçülmüş arama talebi değildir. Anahtar kelimeleri düzenleyerek haritayı güncelleyebilirsiniz.</p>
    <Link className="ghost-button" href="/admin/seo/keywords">Anahtar kelimeleri düzenle</Link>
    <section className="dashboard-panel space-y-4 p-5">
      <h3 className="text-xl font-bold">Ana konu ve destekleyici sayfalar</h3>
      <p>İlk 200 envanter kaydı ve mevcut seçimler gösterilir. Kaydetme kaynakları yeniden kontrol eder. Kümeler editoryal plandır; sayfalara otomatik bağlantı eklemez.</p>
      {plan.status.filter(c=>c.invalidIds.length).map(c=><p role="alert" key={c.id}>Bir kümede artık kullanılamayan hedefler var. Seçimleri güncelleyin.</p>)}
      <ClusterForm key={plan.revision} revision={plan.revision} clusters={plan.clusters} choices={choices}/>
    </section>
    {map.limited ? <p role="alert">2.000 kayıt sınırı aşıldı; kısmi harita gösterilmiyor.</p> : null}
    {!map.groups.length && !map.limited ? <p>Henüz etkin anahtar kelime yok. Bir anahtar kelime ekleyerek başlayın.</p> : null}
    {map.groups.map(group => <section key={group.key} className="dashboard-panel space-y-3 p-5">
      <h3 className="font-bold break-words">{group.name}</h3>
      <p>{group.items.length} konu · {group.items.filter(i => !i.articleDraft).length} brief bekliyor</p>
      <ul className="space-y-2">{group.items.map(item => <li key={item.id} className="break-words">
        {item.articleDraft ? <Link className="underline focus-ring" href={`/admin/seo/studio/${item.articleDraft.id}`}>{item.keyword}</Link> : item.keyword}
        {" — "}{item.articleDraft ? item.articleDraft.post.status === "PUBLISHED" ? "Yayında" : "Taslak" : "Brief oluşturulmadı"}
      </li>)}</ul>
    </section>)}
  </section>;
}
