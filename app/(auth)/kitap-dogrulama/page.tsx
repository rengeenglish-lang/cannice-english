import type { Metadata } from "next";
import { BookEmailConfirmation } from "@/components/auth/BookEmailConfirmation";
export const metadata: Metadata = { title: "Kitaplarını aç", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function BookConfirmationPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  return <div><h1 className="page-title mb-6 text-center">Kitapların seni bekliyor.</h1><BookEmailConfirmation token={t ?? ""} /></div>;
}
