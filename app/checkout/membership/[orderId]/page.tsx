import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { commercialOrderForUser } from "@/server/services/commercial-checkout.service";
import { formatTRY } from "@/lib/pricing";
const labels: Record<string, string> = { AWAITING_PAYMENT: "Ödeme onayı bekleniyor", PAID: "Ödeme onaylandı", PAYMENT_REVIEW: "Ödeme alındı, kayıt incelemede", FAILED: "Ödeme başarısız", CANCELLED: "Ödeme talebi iptal edildi", REFUNDED: "İade kaydedildi" };
const date = (value: Date) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(value);
export default async function MembershipOrder({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthContext(); if (!user) redirect("/sign-in");
  const { orderId } = await params;
  const order = await commercialOrderForUser(user.id, orderId); if (!order) notFound();
  const item = order.items[0];
  return <main className="inner-page mx-auto max-w-2xl px-4 py-12"><section className="panel space-y-5">
    <p className="eyebrow">{item.titleSnapshot}</p><h1 className="page-title">{labels[order.status] ?? "Talep alındı"}</h1>
    <p className="text-2xl font-bold">{formatTRY(String(order.total))}</p><p className="break-all text-sm">Sipariş: {order.id}</p>
    {order.status === "AWAITING_PAYMENT" ? <><p>Bu talep hesabınızdan para çekmez. Ödeme yöntemi ve sipariş numaranızla ilgili bilgi için ekibimizle iletişime geçin. Erişim yalnızca gerçek ödeme doğrulandıktan sonra açılır.</p>
      {order.reservation ? <p>Geçici kontenjan süresi: <strong>{date(order.reservation.expiresAt)}</strong> (Türkiye saati). Süre dolduktan sonra ödeme yapmadan önce kontenjanı ekibimizle doğrulayın.</p> : null}</> : null}
    {order.status === "PAYMENT_REVIEW" ? <p>Ödemeniz kaydedildi ancak kontenjan veya program koşulları yeniden incelenmeli. Henüz erişim açılmadı. Kayıt veya iade için ekibimizle görüşün.</p> : null}
    {order.status === "PAID" ? <><p>Ödenen dönem bitişi: <strong>{item.paidThrough ? date(item.paidThrough) : "—"}</strong></p><p>Erişim dönemi: {item.periodStartsAt ? date(item.periodStartsAt) : "—"} – {item.accessExpiresAt ? date(item.accessExpiresAt) : "—"}</p>
      <Link className="primary-button inline-flex" href={item.cohort ? `/dashboard/courses/${item.cohort.courseId}` : "/dashboard"}>{item.cohort ? "Programıma Git" : "Çalışma Alanıma Git"}</Link></> : null}
    <Link href="/checkout/membership" className="ghost-button inline-flex">Ödeme seçeneklerine dön</Link>
  </section></main>;
}
