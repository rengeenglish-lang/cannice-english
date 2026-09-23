import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { getAuthContext } from "@/server/auth/context";
import { getPlanAccess } from "@/server/services/plans.service";
import { RESOURCE_EXAMS, RESOURCE_TYPES, listResources } from "@/server/services/resources.service";

type Props = { params: Promise<{ tur: string; sinav: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tur, sinav } = await params;
  const type = RESOURCE_TYPES.find((t) => t.slug === tur);
  const exam = RESOURCE_EXAMS.find((e) => e.slug === sinav);
  return { title: type && exam ? `${exam.label} — ${type.label}` : "Kaynaklar" };
}

export default async function ResourceListPage({ params }: Props) {
  const { tur, sinav } = await params;
  const type = RESOURCE_TYPES.find((t) => t.slug === tur);
  const exam = RESOURCE_EXAMS.find((e) => e.slug === sinav);
  if (!type || !exam) notFound();
  const user = await getAuthContext();
  const access = await getPlanAccess(user);
  const items = await listResources(type.slug, exam.slug, user, access);
  const needsLogin = type.slug === "kayitli-kaynaklar" && !user;

  return (
    <main className="inner-page mx-auto w-full max-w-[1100px] px-4 py-14 sm:px-6 lg:px-8">
      <Link href={`/kaynaklar/${type.slug}`} className="ghost-button mb-4 -ml-4">← {type.label}</Link>
      <PageHero>
        <p className="eyebrow">{type.label}</p>
        <h1 className="page-title">{exam.label}</h1>
      </PageHero>
      {needsLogin ? (
        <div className="panel mt-8 text-center">
          <p className="font-bold">Kayıtlı kaynaklarını görmek için giriş yap.</p>
          <Link href={`/sign-in?next=${encodeURIComponent(`/kaynaklar/${type.slug}/${exam.slug}`)}`} className="primary-button mt-5">Giriş Yap</Link>
        </div>
      ) : items.length === 0 ? (
        <div className="panel mt-8 text-center">
          <p className="font-bold">Bu bölüme {exam.label.replace(" Kaynakları", "")} için kaynak çok yakında eklenecek.</p>
          <Link href="/kaynaklar" className="secondary-button mt-5">Diğer kaynaklara göz at</Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="panel flex flex-col gap-3">
              <span className="w-fit rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[10px] font-black tracking-wider text-[color:var(--brand)]">{item.badge}</span>
              <h2 className="text-lg font-extrabold">{item.title}</h2>
              {item.description ? <p className="text-sm leading-6 text-[color:var(--muted)]">{item.description}</p> : null}
              <div className="mt-auto pt-2">
                {item.href === "#" ? (
                  <p className="text-sm text-[color:var(--muted)]">İndirme bağlantısı yakında eklenecek.</p>
                ) : item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="primary-button text-xs">{item.cta} ↗</a>
                ) : (
                  <Link href={item.href} className="primary-button text-xs">{item.cta}</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
