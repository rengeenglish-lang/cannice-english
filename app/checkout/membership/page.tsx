import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { CommercialForm } from "@/components/checkout/CommercialForm";
import { startMembershipCheckout } from "@/app/actions/commercial-checkout";
import { formatTRY } from "@/lib/pricing";
const intervals: Record<string, string> = { MONTHLY: "1 ay", QUARTERLY: "3 ay", SIX_MONTH: "6 ay", ANNUAL: "12 ay" };
export const metadata = { title: "Üyelik ve Program Ödemesi" };
export default async function MembershipCheckout({ searchParams }: { searchParams: Promise<{ cohort?: string }> }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in?callbackUrl=/checkout/membership");
  const { cohort: selected } = await searchParams;
  const [prices, cohorts, orders] = await Promise.all([
    db.commercialPrice.findMany({ where: { active: true }, orderBy: { amountMinor: "asc" } }),
    db.programmeCohort.findMany({ where: { salesEnabled: true, course: { curriculumPublishedAt: { not: null } }, teacher: { isActive: true }, expectedEndsAt: { gt: new Date() }, OR: [{ status: "OPEN" }, { status: "CLOSED", enrollments: { some: { studentId: user.id, status: "CONFIRMED" } } }] }, select: { id: true, title: true, maximumCapacity: true, _count: { select: { enrollments: { where: { status: "CONFIRMED" } }, reservations: { where: { releasedAt: null, expiresAt: { gt: new Date() } } } } } } }),
    db.order.findMany({ where: { userId: user.id, commercialKind: { not: null } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, status: true, items: { select: { titleSnapshot: true } } } }),
  ]);
  return <main className="inner-page mx-auto max-w-5xl px-4 py-12">
    <p className="eyebrow">Ödeme seçenekleri</p><h1 className="page-title">Kendi hızınızda veya öğretmenle hazırlanın</h1>
    <p className="page-copy">Konu anlatımları %100 ücretsiz. Üyelik ödemeleri ekibimiz tarafından doğrulandıktan sonra erişiminiz açılır.</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">{(["PREMIUM", "GROUP"] as const).map((kind) => {
      const options = prices.filter((p) => p.kind === kind && p.checkoutEnabled);
      const available = options.length > 0 && (kind === "PREMIUM" || cohorts.length > 0);
      return <section key={kind} className="panel space-y-4"><h2 className="text-2xl font-bold">{kind === "PREMIUM" ? "Tek Premium Üyelik" : "250 Saatlik Tam Hazırlık Programı"}</h2>
        <p>{kind === "PREMIUM" ? "Tek üyelik ile desteklenen Premium öğrenci araçlarına erişim." : "Canlı küçük grup ve aktif ödeme döneminiz boyunca tüm standart platform araçlarına erişim. 250 saat, canlı ders ve yapılandırılmış çalışmanın toplamıdır."}</p>
        {available ? <CommercialForm action={startMembershipCheckout} label="Ödeme Talebi Oluştur">
          <input type="hidden" name="kind" value={kind} /><input type="hidden" name="requestKey" value={crypto.randomUUID()} />
          {kind === "GROUP" ? <label className="block">Grup<select name="cohortId" defaultValue={selected} required className="mt-2 block w-full rounded-lg border p-3">{cohorts.map((c) => <option key={c.id} value={c.id}>{c.title} — {c._count.enrollments}/{c.maximumCapacity} kayıtlı; {c._count.reservations} geçici rezervasyon</option>)}</select></label> : null}
          <label className="block">Ödeme dönemi<select name="interval" required className="mt-2 block w-full rounded-lg border p-3">{options.map((p) => <option key={p.id} value={p.interval}>{intervals[p.interval]} — {formatTRY((p.amountMinor/100).toFixed(2))}</option>)}</select></label>
          <p className="text-sm">Ödeme dönemi program süresinden ayrıdır. Grup kontenjanı ödeme talebinde geçici olarak ayrılır; kesin kayıt ödeme onayından sonra oluşur.</p>
        </CommercialForm> : <p role="status" className="rounded-xl bg-slate-50 p-4">Bu seçenek henüz satışa açık değil. <Link href="/" className="underline">Ücretsiz öğrenmeye devam edin.</Link></p>}
      </section>;
    })}</div>
    {orders.length ? <section className="panel mt-8"><h2 className="text-xl font-bold">Ödeme taleplerim</h2><ul className="mt-4 space-y-3">{orders.map((o) => <li key={o.id}><Link className="underline" href={`/checkout/membership/${o.id}`}>{o.items[0]?.titleSnapshot} — {o.id.slice(-8)}</Link></li>)}</ul></section> : null}
  </main>;
}
