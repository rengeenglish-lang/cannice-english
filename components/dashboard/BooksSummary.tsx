import Link from "next/link";
import { listSelectedEbooks } from "@/server/services/ebook-library.service";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
export async function BooksSummary({ userId }: { userId: string }) {
  const selected = await listSelectedEbooks(userId);
  if (!selected.length) return null;
  const first = findNetfenerEbook(selected[0].bookSlug);
  return <section className="dashboard-panel mb-6 flex flex-wrap items-center justify-between gap-4" aria-label="Kitapların">
    <div><p className="eyebrow">Kitapların hazır</p><h2 className="mt-1 text-lg font-semibold">{first?.title ?? "Kütüphanen"}{selected.length > 1 ? ` ve ${selected.length - 1} kitap daha` : ""}</h2><p className="mt-1 text-sm text-[color:var(--muted)]">Online okuma, PDF indirme ve basılı kitap seçeneklerin.</p></div><Link className="primary-button" href="/dashboard/books">Kitaplarımı aç</Link>
  </section>;
}
