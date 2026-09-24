import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1320px] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="eyebrow">403</p>
      <h1 className="page-title">Bu sayfaya erişim yetkin yok</h1>
      <Link href="/dashboard" className="primary-button">Panelime Dön</Link>
    </main>
  );
}
