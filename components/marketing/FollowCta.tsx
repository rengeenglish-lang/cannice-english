import { SOCIAL_LINKS } from "@/lib/social";

/** Small "follow us" card: daily words and exam tips on Telegram, plus the study group. */
export function FollowCta({ className = "" }: { className?: string }) {
  return (
    <aside className={`rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 ${className}`}>
      <p className="text-sm font-black">Her gün yeni kelime ve sınav ipucu</p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
        Telegram kanalımızda günlük sorular ve çalışma önerileri paylaşıyoruz; sohbet grubunda sorularını sorabilirsin.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={SOCIAL_LINKS.telegramChannel} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
          Kanalı takip et
        </a>
        <a href={SOCIAL_LINKS.telegramGroup} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-bold transition hover:border-[color:var(--brand)]">
          Sohbet grubuna katıl
        </a>
      </div>
    </aside>
  );
}
