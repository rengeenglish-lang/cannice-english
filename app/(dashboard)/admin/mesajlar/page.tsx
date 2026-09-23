import type { Metadata } from "next";
import { requireStaff } from "@/server/auth/context";
import { listMessagesForStaff } from "@/server/services/messages.service";
import { ReplyForm } from "@/components/messages/ReplyForm";

export const metadata: Metadata = { title: "Öğrenci Mesajları" };

export default async function AdminMessagesPage() {
  await requireStaff();
  const messages = await listMessagesForStaff();
  const waiting = messages.filter((m) => !m.repliedAt).length;
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Yönetim</p>
        <h1 className="page-title">Öğrenci mesajları</h1>
        <p className="page-copy">{waiting ? `${waiting} mesaj yanıt bekliyor.` : "Yanıt bekleyen mesaj yok."}</p>
      </div>
      {messages.length === 0 ? <p className="text-sm text-[color:var(--muted)]">Henüz mesaj yok.</p> : null}
      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="dashboard-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">{m.student.name} <span className="font-normal text-[color:var(--muted)]">({m.student.email})</span></p>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${m.repliedAt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                {m.repliedAt ? "Yanıtlandı" : "Yanıt bekliyor"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--muted)]">{m.course?.product.title ?? "Genel soru"} · {m.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.body}</p>
            {m.reply ? (
              <div className="mt-4 rounded-xl bg-[color:var(--brand-soft)] p-4 text-sm">
                <p className="text-xs font-bold text-[color:var(--brand)]">{m.repliedBy?.name ?? "Eğitmen"} yanıtı</p>
                <p className="mt-1 whitespace-pre-wrap">{m.reply}</p>
              </div>
            ) : (
              <ReplyForm messageId={m.id} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
