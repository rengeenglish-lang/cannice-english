import type { Metadata } from "next";
import { Flame, Trophy } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { syncEngagement, weeklyLeaderboard } from "@/server/services/engagement.service";
import { BADGES, POINTS } from "@/lib/engagement";
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
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const when = earned.get(b.key);
            const [have, goal] = b.progress(stats);
            return (
              <li key={b.key} className={`dashboard-panel flex gap-3 ${when ? "" : "opacity-70"}`}>
                <span className={`grid size-12 shrink-0 place-items-center rounded-full text-2xl ${when ? "bg-amber-100" : "bg-slate-100 grayscale"}`} aria-hidden="true">{b.emoji}</span>
                <div className="min-w-0">
                  <p className="font-extrabold">{b.title}</p>
                  <p className="text-xs text-[color:var(--muted)]">{b.description}</p>
                  {when ? (
                    <p className="mt-1 text-xs font-bold text-emerald-700">Kazanıldı · {when.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
                  ) : (
                    <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">{have}/{goal}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
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
