import Link from "next/link";
import { getConversionReport } from "@/server/services/seo/conversions.service";
import { VALUE_WEIGHTS, WINDOWS } from "@/lib/seo/attribution";
const n = (v: number) => new Intl.NumberFormat("tr-TR").format(v);
const pct = (v: number | null) => (v === null ? "—" : `%${(v * 100).toFixed(1)}`);
const money = (r: Record<string, number>) =>
  Object.entries(r).map(([c, v]) => `${n(Math.round(v))} ${c}`).join(" + ") || "—";
const day = (d: Date) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "UTC" }).format(d);

export async function SeoConversionsPage({ actorId, days }: { actorId: string; days?: string }) {
  const r = await getConversionReport(actorId, days);
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold">Dönüşümler</h2>
      <p>
        Hangi blog yazısı kayıt, çalışma ve ödeme getiriyor? Ölçüm çerezsizdir: yazı başına günlük toplam görüntüleme ve yalnızca
        yazıdaki “Ücretsiz üye ol” bağlantısıyla gelen kayıtlar sayılır. Bağlantıyı kullanmadan sonradan kayıt olanlar sayılmaz;
        gerçek rakamlar bundan yüksek olabilir.
      </p>
      <nav aria-label="Dönem" className="flex gap-2">
        {WINDOWS.map((w) => (
          <Link key={w} href={`/admin/seo/conversions?days=${w}`} aria-current={w === r.days ? "page" : undefined} className={w === r.days ? "primary-button" : "ghost-button"}>
            Son {w} gün
          </Link>
        ))}
      </nav>
      <p className="text-sm">
        {r.trackingSince ? `Görüntüleme ölçümü ${day(r.trackingSince)} tarihinde başladı; öncesi için veri yoktur.` : "Henüz görüntüleme ölçülmedi. Yayındaki yazılar açıldıkça burada görünür."}
        {r.attributionCapReached ? " Not: çok sayıda ilişkilendirme olduğundan yalnızca en yeni 5.000 kayıt değerlendirildi." : ""}
      </p>
      <dl className="grid gap-3 sm:grid-cols-5">
        {[
          ["Görüntüleme", r.totals.views],
          ["Aramadan gelen", r.totals.organicViews],
          ["Kayıt", r.totals.registrations],
          ["Çalışma başlangıcı", r.totals.practiceStarts],
          ["Ödeme yapan", r.totals.purchasers],
        ].map(([label, value]) => (
          <div key={label} className="dashboard-panel p-4">
            <dt className="text-sm text-[color:var(--muted)]">{label}</dt>
            <dd className="text-2xl font-bold">{n(Number(value))}</dd>
          </div>
        ))}
      </dl>
      {r.items.length ? (
        <ol className="space-y-3" aria-label="Yazılar">
          {r.items.map((i) => (
            <li key={i.postId} className="dashboard-panel space-y-2 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="break-all font-bold">{i.title}</p>
                <p className="font-bold">{i.score === null ? "Değer puanı: yetersiz veri" : `Değer puanı: ${i.score}/100`}</p>
              </div>
              <p className="break-all text-sm text-[color:var(--muted)]">/blog/{i.slug}</p>
              <p className="text-sm">
                {n(i.views)} görüntüleme ({n(i.organicViews)} aramadan) · {n(i.registrations)} kayıt ({pct(i.registrationRate)}) ·{" "}
                {n(i.practiceStarts)} çalışma başlangıcı · {n(i.purchasers)} ödeme yapan · gelir {money(i.revenue)}
                {i.position !== null ? ` · ortalama konum ${i.position.toFixed(1)}` : ""}
              </p>
              {i.draftId ? <Link className="underline" href={`/admin/seo/studio/${i.draftId}`}>Makale stüdyosunda aç</Link> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="dashboard-panel p-5">Bu dönemde ölçülen yazı yok.</p>
      )}
      <details className="dashboard-panel p-5">
        <summary className="cursor-pointer font-bold">Değer puanı nasıl hesaplanır?</summary>
        <div className="mt-3 space-y-2 text-sm">
          <p>Trafiğe değil iş değerine bakar: 500 görüntülemeyle 30 kayıt, 10.000 görüntülemeyle 0 kayıttan daha yüksek puan alır. Her bileşen aşağıdaki referans hedefte tam puan verir; bunlar sabit editoryal varsayımlardır, ölçülmüş sektör verisi değildir.</p>
          <ul className="list-disc pl-5">
            {Object.values(VALUE_WEIGHTS).map((w) => (
              <li key={w.label}>{w.label}: ağırlık {w.weight} · hedef {w.target}</li>
            ))}
          </ul>
          <p>Arama sırası, yalnızca içe aktarılmış Search Console verisinde yazı için 100+ gösterim varsa hesaba katılır; yoksa ağırlıklar yeniden ölçeklenir. 20’den az görüntüleme ve hiç kayıt/ödeme yoksa puan verilmez. Gelir yalnızca TRY için puana girer; diğer para birimleri ayrı gösterilir, çevrilmez.</p>
          <p>Gizlilik: görüntüleme sayımında kimlik, çerez veya IP saklanmaz; tarayıcı “Do Not Track/GPC” gönderiyorsa sayılmaz. Kayıt ilişkilendirmesi hesapla bir yazı arasındaki tek bir bağdır ve hesap silinince silinir. Gizlilik metninizde bu ölçümü belirtmeniz önerilir.</p>
        </div>
      </details>
    </section>
  );
}
