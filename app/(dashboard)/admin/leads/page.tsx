import type { Metadata } from "next";
import { db } from "@/server/db";
import { markLeadContactedAction } from "@/app/actions/admin-leads";

export const metadata: Metadata = { title: "Gelen Talepler" };

export default async function AdminLeadsPage() {
  const leads = await db.callbackRequest.findMany({ include: { examType: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Gelen Talepler</h1>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Ad Soyad</th><th>Telefon</th><th>Sınav</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="font-bold text-[color:var(--foreground)]">{lead.name}</td>
                <td>{lead.phone}</td>
                <td>{lead.examType?.name ?? "—"}</td>
                <td>
                  <span className={`status rounded-full border px-3 py-1 text-xs font-bold ${lead.status === "NEW" ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]" : "border-[color:var(--border)] bg-slate-50 text-slate-500"}`}>
                    {lead.status === "NEW" ? "Yeni" : lead.status === "CONTACTED" ? "Arandı" : "Kapatıldı"}
                  </span>
                </td>
                <td>
                  {lead.status === "NEW" ? (
                    <form action={async () => { "use server"; await markLeadContactedAction(lead.id); }}>
                      <button type="submit" className="ghost-button">Arandı olarak işaretle</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">Henüz talep yok.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
