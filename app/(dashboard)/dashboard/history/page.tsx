import { redirect } from "next/navigation";

/** "Geçmiş Sorular" was renamed to Hatalarım; the attempt list itself now lives in İlerleme Raporu. */
export default function HistoryPage() {
  redirect("/dashboard/hatalarim");
}
