import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getPlanAccess, remainingMockExamStarts } from "@/server/services/plans.service";
import { findOpenAttempt } from "@/server/services/online-deneme.service";
import { startOnlineDenemeAction } from "@/app/actions/online-deneme";
import { DENEME_LOADERS, PLANNED_DENEME_COUNT } from "@/content/yds-denemeler/registry";
import { ModePicker } from "@/components/online-deneme/ModePicker";

function minutesUntil(deadline: Date) {
  return Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 60_000));
}

export async function generateMetadata({ params }: { params: Promise<{ no: string }> }): Promise<Metadata> {
  const { no } = await params;
  return { title: `YDS Denemesi ${Number(no) || ""}` };
}

export default async function DenemeStartPage({ params }: { params: Promise<{ no: string }> }) {
  const { no: raw } = await params;
  const no = Number(raw);
  if (!Number.isInteger(no) || !DENEME_LOADERS[no]) notFound();
  const user = await getAuthContext();
  if (!user) return null;

  const access = await getPlanAccess(user);
  const [open, remaining] = await Promise.all([findOpenAttempt(user.id, no), access.can("MOCK_EXAMS") ? remainingMockExamStarts(user.id, access) : Promise.resolve(0)]);
  const minutesLeft = open ? minutesUntil(open.deadlineAt) : null;
  const blocked = !access.can("MOCK_EXAMS") || (!open && remaining !== null && remaining <= 0);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-7 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/yds-denemeleri" className="text-sm font-bold text-[color:var(--accent-strong)]">← Deneme listesi</Link>
        <span className="text-sm font-bold text-[color:var(--muted)]">Online YDS Denemesi · {no} / {PLANNED_DENEME_COUNT}</span>
      </div>

      <section className="flex flex-wrap items-end justify-between gap-6 rounded-3xl bg-[color:var(--night)] p-8 text-white sm:p-10">
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-[0.22em] text-white/70">YDS · TAM DENEME</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Deneme {no}</h1>
          <p className="mt-2 text-white/80">80 soru · 180 dakika · Her doğru 1,25 puan, yanlış götürmez</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            ["80", "soru"],
            ["180 dk", "tek oturum"],
            ["Anında", "puan ve çözümler"],
          ].map(([big, small]) => (
            <div key={small} className="min-w-28 rounded-2xl border border-white/20 px-5 py-3">
              <p className="text-2xl font-black">{big}</p>
              <p className="text-xs text-white/70">{small}</p>
            </div>
          ))}
        </div>
      </section>

      <form action={startOnlineDenemeAction} className="space-y-7">
        <input type="hidden" name="denemeNo" value={no} />
        <ModePicker initial={open?.mode ?? "KLASIK"} />

        <div className="rounded-2xl border border-[color:var(--gold)] bg-[color:var(--gold-soft)] p-5 text-sm leading-7 text-[color:var(--foreground)]">
          <p className="font-extrabold">Başlamadan önce</p>
          <ul className="mt-1 list-disc pl-5">
            <li>Süre başladığında durdurulamaz. Sayfayı kapatsan da sayaç sunucuda işlemeye devam eder.</li>
            <li>180 dakika dolduğunda deneme kilitlenir: o ana kadar işaretlediğin cevaplar puanlanır, yeni cevap verilemez.</li>
            <li>Her cevap işaretlediğin anda kaydedilir. Puanın ve her sorunun çözümü bitirdiğin anda açılır.</li>
          </ul>
        </div>

        {blocked ? (
          <div className="dashboard-panel flex flex-wrap items-center justify-between gap-4">
            <p className="page-copy">
              {access.can("MOCK_EXAMS") ? "Bu plan dönemindeki deneme hakkının tamamını kullandın." : "Online denemeler tüm Deneme Sınavı planlarına dahildir."}
            </p>
            <Link href="/dashboard/mock-exam#planlar" className="primary-button">Planları gör</Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="primary-button px-7 py-4 text-base">
              {open ? "Denemeye devam et" : "Denemeyi başlat"}
            </button>
            <span className="text-sm text-[color:var(--muted)]">
              {open
                ? `Bu denemede ${minutesLeft} dakikan kaldı.`
                : remaining !== null
                  ? `Başlattığın anda 180:00 geri sayımı başlar. Bu dönemde ${remaining} deneme hakkın var.`
                  : "Başlattığın anda 180:00 geri sayımı başlar."}
            </span>
          </div>
        )}
      </form>
    </main>
  );
}
