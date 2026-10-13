import { requireAdministrator } from "@/server/auth/context";
import { db } from "@/server/db";
import { CommercialForm } from "@/components/checkout/CommercialForm";
import { configureSalesAction } from "@/app/actions/commercial-checkout";
import { formatTRY } from "@/lib/pricing";
const labels: Record<string, string> = { MONTHLY: "Aylık", QUARTERLY: "3 aylık", SIX_MONTH: "6 aylık", ANNUAL: "Yıllık" };
export default async function CommerceSettings() {
  await requireAdministrator();
  const [prices, cohorts] = await Promise.all([db.commercialPrice.findMany({ orderBy: [{ kind: "asc" }, { amountMinor: "asc" }] }), db.programmeCohort.findMany({ where: { status: { in: ["OPEN", "CLOSED", "DRAFT"] } }, take: 100, orderBy: { startsAt: "asc" } })]);
  return <div className="space-y-6"><h1 className="page-title">Üyelik Satış Ayarları</h1><p>Satışlar varsayılan olarak kapalıdır. Premium için çalışan araçlar, gruplar için yayımlanmış müfredat gerekir. Mevcut ödemelerin süreleri değişmez.</p>
    <div className="grid gap-4 sm:grid-cols-2">{prices.map((price) => <section className="dashboard-panel p-5" key={price.id}><h2 className="mb-4 font-bold">{price.kind === "GROUP" ? "Grup" : "Premium"} — {labels[price.interval]} — {formatTRY((price.amountMinor/100).toFixed(2))}</h2><CommercialForm action={configureSalesAction} label="Kaydet">
      <input type="hidden" name="kind" value={price.kind} /><input type="hidden" name="interval" value={price.interval} />
      <label className="flex gap-3"><input type="checkbox" name="enabled" defaultChecked={price.checkoutEnabled} />Satışa açık</label>
    </CommercialForm></section>)}</div>
    <h2 className="text-xl font-bold">Grup ödeme kuralları</h2>{!cohorts.length ? <p>Henüz yapılandırılacak grup yok.</p> : null}
    {cohorts.map((c) => <section className="dashboard-panel p-5" key={c.id}><h3 className="mb-4 font-bold">{c.title}</h3><CommercialForm action={configureSalesAction} label="Grup Ayarlarını Kaydet">
      <input type="hidden" name="cohortId" value={c.id} /><label className="flex gap-3"><input type="checkbox" name="enabled" defaultChecked={c.salesEnabled} />Satışa açık</label>
      <label className="block">Ödeme sonrası ek erişim süresi (gün)<input className="ml-3 rounded border p-2" name="graceDays" type="number" min="0" max="30" defaultValue={c.graceDays} required /></label>
      <label className="block">Geçici kontenjan süresi (dakika)<input className="ml-3 rounded border p-2" name="seatHoldMinutes" type="number" min="5" max="10080" defaultValue={c.seatHoldMinutes} required /></label>
    </CommercialForm></section>)}
  </div>;
}
