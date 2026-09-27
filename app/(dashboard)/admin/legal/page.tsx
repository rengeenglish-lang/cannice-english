import Link from "next/link";
import { forbidden, notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getLegalEditor } from "@/server/services/legal-content.service";
import { LegalContentEditor } from "@/components/admin/LegalContentEditor";
export const metadata = { title: "Hukuki Belgeler", robots: { index: false, follow: false } };
export default async function AdminLegalPage({ searchParams }: { searchParams: Promise<{ document?: string }> }) {
  const actor = await getAuthContext();
  if (!actor) redirect("/sign-in");
  if (actor.role !== "ADMIN") forbidden();
  const { bundle, documents, history } = await getLegalEditor(actor.id);
  const target = (await searchParams).document ?? "mesafeli-satis-sozlesmesi";
  if (target !== "checkout" && !Object.hasOwn(documents, target)) notFound();
  const document = target === "checkout" ? undefined : bundle.documents[target]?.draft ?? documents[target];
  return <div className="space-y-6"><header><p className="eyebrow">Yönetim</p><h1 className="page-title">Hukuki Belgeler ve Ödeme Onayları</h1><p className="page-copy">Belgeleri düzenleyin, taslağı önizleyin ve hazır olduğunda yayımlayın.</p></header>
    <nav aria-label="Düzenlenecek belge" className="flex flex-wrap gap-2">{[...Object.entries(documents).map(([key, doc]) => ({ key, title: doc.title })), { key: "checkout", title: "Ödeme Onay Metinleri" }].map((item) => <Link key={item.key} href={`/admin/legal?document=${item.key}`} aria-current={target === item.key ? "page" : undefined} className={`${target === item.key ? "primary-button" : "ghost-button"} text-sm`}>{item.title}</Link>)}</nav>
    {target !== "checkout" ? <div className="flex flex-wrap gap-4 text-sm"><span>Sitedeki durum: <strong>{documents[target].draft !== false ? "Taslak" : "Yayımlanmış"}</strong></span><Link href={`/legal/${target}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Sitedeki belgeyi aç (yeni sekme)</Link></div> : null}
    <LegalContentEditor key={target} target={target} revision={bundle.revision} document={document} wording={bundle.wording.draft} />
    <section className="dashboard-panel p-5"><h2 className="text-lg font-bold">Son Değişiklikler</h2>{history.length ? <ul className="mt-4 space-y-3">{history.map((entry) => <li key={entry.revision} className="rounded-lg border border-[color:var(--border)] p-3 text-sm"><strong>{entry.target === "checkout" ? "Ödeme Onay Metinleri" : documents[entry.target]?.title}</strong><p>{entry.action === "PUBLISH" ? "Yayımlandı" : "Taslak kaydedildi"} · {entry.actorName} · {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(entry.at))} · Sürüm {entry.revision}</p></li>)}</ul> : <p className="mt-3 text-sm text-[color:var(--muted)]">Henüz yönetim panelinden yapılan değişiklik yok.</p>}</section>
  </div>;
}
