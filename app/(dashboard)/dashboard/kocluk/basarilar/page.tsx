import type { Metadata } from "next";
import { Flame, Trophy } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { syncEngagement, weeklyLeaderboard } from "@/server/services/engagement.service";
import { BADGES, BADGE_TIERS, POINTS, type BadgeTier } from "@/lib/engagement";

const TIER_STYLE: Record<BadgeTier, { frame: string; medal: string; earned: string }> = {
  BRONZE: { frame: "border-orange-200 bg-orange-50/50", medal: "bg-orange-100 text-orange-800", earned: "border-orange-300" },
  SILVER: { frame: "border-slate-300 bg-slate-50/70", medal: "bg-slate-200 text-slate-700", earned: "border-slate-400" },
  GOLD: { frame: "border-amber-300 bg-amber-50/60", medal: "bg-amber-100 text-amber-800", earned: "border-amber-400" },
  PLATINUM: { frame: "border-cyan-300 bg-cyan-50/50", medal: "bg-cyan-100 text-cyan-800", earned: "border-cyan-400" },
};
import { setLeaderboardOptInAction } from "@/app/actions/engagement";

export const metadata: Metadata = { title: "Başarılar" };

export default async function AchievementsPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const [{ streak, stats, earned }, board, me] = await Promise.all([
    syncEngagement(user.id),
    weeklyLeaderboard(),
    db.user.findUnique({ where: { id: user.id }, select: { leaderboardOptIn: true } }),
  ]);
  const mine = board.find((r) => r.userId === user.id);
  const top = board.slice(0, 10);
  const optIn = me?.leaderboardOptIn ?? false;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="dashboard-panel flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-orange-100 text-orange-600"><Flame size={26} aria-hidden="true" /></span>
          <div>
            <p className="text-3xl font-black">{streak.current} gün</p>
            <p className="text-sm text-[color:var(--muted)]">Çalışma serin{streak.current === 0 ? " — bugün çalışarak başlat" : ""}</p>
          </div>
        </div>
        <div className="dashboard-panel">
          <p className="text-3xl font-black">{streak.best} gün</p>
          <p className="text-sm text-[color:var(--muted)]">En uzun serin</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-3xl font-black">{earned.size}/{BADGES.length}</p>
          <p className="text-sm text-[color:var(--muted)]">Kazanılan rozet</p>
        </div>
      </section>
      <p className="-mt-4 text-xs text-[color:var(--muted)]">Bir gün “çalışılmış” sayılır: koçluk görevi, Konu Anlatımı dersi, kelime tekrarı, hata defteri tekrarı veya bir sınav tamamladığında.</p>

      <section>
        <h2 className="section-title !text-lg">Rozetler</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Bronzdan Platine dört seviye. Her rozet sitedeki gerçek çalışmandan otomatik gelir.</p>
        <div className="mt-4 space-y-6">
          {BADGE_TIERS.map((t) => {
            const list = BADGES.filter((b) => b.tier === t.tier);
            const got = list.filter((b) => earned.has(b.key)).length;
            const style = TIER_STYLE[t.tier];
            return (
              <div key={t.tier} className={`rounded-3xl border p-4 sm:p-5 ${style.frame}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-10 place-items-center rounded-full text-sm font-black ${style.medal}`} aria-hidden="true">{t.name.charAt(0)}</span>
                    <div>
                      <h3 className="text-lg font-extrabold">{t.name}</h3>
                      <p className="text-xs text-[color:var(--muted)]">{t.blurb}</p>
                    </div>
                  </div>
                  <div className="min-w-[9rem] text-right">
                    <p className="text-sm font-bold">{got}/{list.length} rozet</p>
                    <progress className="learning-progress mt-1 w-full" value={got} max={list.length} aria-label={`${t.name}: ${got}/${list.length}`} />
                  </div>
                </div>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {list.map((b) => {
                    const when = earned.get(b.key);
                    const [have, goal] = b.progress(stats);
                    return (
                      <li key={b.key} className={`flex gap-3 rounded-2xl border bg-[color:var(--surface)] p-3 ${when ? style.earned : "border-[color:var(--border)] opacity-75"}`}>
                        <span className={`grid size-11 shrink-0 place-items-center rounded-full text-xl ${when ? style.medal : "bg-slate-100 grayscale"}`} aria-hidden="true">{b.emoji}</span>
                        <div className="min-w-0">
                          <p className="font-extrabold leading-tight">{b.title}</p>
                          <p className="mt-0.5 text-xs text-[color:var(--muted)]">{b.description}</p>
                          {when ? (
                            <p className="mt-1 text-xs font-bold text-emerald-700">Kazanıldı · {when.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
                          ) : (
                            <>
                              <progress className="learning-progress mt-1.5 w-full" value={have} max={goal} aria-label={`${b.title}: ${have}/${goal}`} />
                              <p className="mt-0.5 text-[11px] font-semibold text-[color:var(--muted)]">{have}/{goal}</p>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title !text-lg">Haftanın liderlik tablosu</h2>
            <p className="text-xs text-[color:var(--muted)]">
              Pazartesiden bu yana: görev {POINTS.task}, ders {POINTS.lesson}, sınav {POINTS.test}, hata tekrarı {POINTS.mistake}, kelime tekrarı {POINTS.vocab} puan.
            </p>
          </div>
          <form action={setLeaderboardOptInAction.bind(null, !optIn)}>
            <button className="ghost-button text-xs">{optIn ? "Adımı gizle" : "Tabloda adımı göster"}</button>
          </form>
        </div>
        {top.length ? (
          <ol className="mt-3 divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-white">
            {top.map((r) => (
              <li key={r.userId} className={`flex items-center gap-3 px-4 py-3 ${r.userId === user.id ? "bg-amber-50 font-bold" : ""}`}>
                <span className="w-8 text-center text-lg">{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span>
                <span className="flex-1">{r.userId === user.id ? `${r.name} (sen)` : r.name}</span>
                <span className="font-black">{r.points} puan</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[color:var(--muted)]">Bu hafta henüz kimse puan toplamadı. İlk sen ol!</p>
        )}
        <p className="mt-3 flex items-center gap-2 text-sm">
          <Trophy size={16} className="text-amber-600" aria-hidden="true" />
          {mine ? (mine.rank > 10 ? `Bu hafta ${mine.rank}. sıradasın (${mine.points} puan).` : `Bu hafta ${mine.rank}. sıradasın.`) : "Bu hafta henüz puanın yok; bir görev veya ders tamamlayarak tabloya gir."}
        </p>
        <p className="mt-1 text-xs text-[color:var(--muted)]">
          Adını göstermeyi seçmezsen tabloda “Netfener öğrencisi” olarak görünürsün; seçersen yalnızca adın ve soyadının baş harfi görünür.
        </p>
      </section>
    </div>
  );
}
