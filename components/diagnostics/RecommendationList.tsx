import Link from "next/link";
import { Lock } from "lucide-react";
import type { TopicRecommendations } from "@/lib/diagnostics/recommendations";

export function RecommendationList({ recs }: { recs: TopicRecommendations | undefined }) {
  if (!recs || (recs.free.length === 0 && recs.premium.length === 0 && recs.groupLessons.length === 0)) {
    return <p className="text-sm text-[color:var(--muted)]">Bu konu için kaynaklar yakında eklenecek.</p>;
  }
  return (
    <div className="space-y-4">
      {recs.free.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--accent-strong)]">Konu Anlatımı</p>
          <ul className="space-y-2">
            {recs.free.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <Link href={`/konu-anlatim?exam=${r.examSlug}&topic=${r.topicSlug}`} className="text-sm font-semibold text-[color:var(--accent-strong)] hover:underline">
                  {r.title}
                </Link>
                {r.access === "preview" ? (
                  <span className="rounded-full bg-[color:var(--success-soft)] px-2 py-0.5 text-[11px] font-bold text-[color:var(--success)]">Ücretsiz önizleme</span>
                ) : r.access === "plan" ? (
                  <Link href="/planlar" className="inline-flex items-center gap-1 rounded-full bg-[color:var(--canvas)] px-2 py-0.5 text-[11px] font-bold text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
                    <Lock size={11} aria-hidden="true" /> Plana dahil
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {recs.premium.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">Premium</p>
          <ul className="space-y-2">
            {recs.premium.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{p.title}</span>
                <Link href={`/packages/${p.slug}`} className={p.hasAccess ? "secondary-button text-xs" : "primary-button text-xs"}>
                  {p.hasAccess ? "Başla" : "İncele"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {recs.groupLessons.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Canlı Grup Dersi</p>
          {recs.groupLessons.map((g) => (
            <div key={g.slotId} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] p-3">
              <div>
                <p className="text-sm font-bold">{g.title}</p>
                <p className="text-xs text-[color:var(--muted)]">{new Date(g.startsAt).toLocaleString("tr-TR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <Link href={g.hasAccess ? `/group-lessons/${g.slotId}` : `/packages/${g.productSlug}`} className="ghost-button text-xs">
                Grup Dersine Katıl
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
