import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1320px] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Aradığın sayfa bulunamadı</h1>
      <Link href="/" className="primary-button">Ana Sayfaya Dön</Link>
    </main>
  );
}
