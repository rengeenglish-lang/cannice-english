import Link from "next/link";
import { SpectrumRing } from "@/components/marketing/SpectrumRing";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--brand)] to-[color:var(--brand-strong)] text-white">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-[#0f9b8e] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 size-80 rounded-full bg-[#8b5cf6] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-64 rounded-full bg-[#f5590b] opacity-15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1320px] grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_auto] lg:px-8 lg:py-28">
        <div>
          <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white">
            Online Sınav İngilizcesi Hazırlık
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-.02em] text-balance sm:text-5xl lg:text-6xl">
            Sınav Engelini Güvenle Aşın
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
            Kayıtlı dersler, birebir ve grup dersleriyle; uzman Sınav İngilizcesi Öğretmenleri eşliğinde, gerçek sınav simülasyonları ve isabetli tahminlerle sınava tam hazır olun.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="primary-button">Ücretsiz Denemeye Başla</Link>
            <Link href="/packages" className="secondary-button border-white bg-transparent text-white hover:bg-white hover:text-[color:var(--brand)]">Paketleri İncele</Link>
          </div>
        </div>

        <div className="relative hidden size-64 shrink-0 items-center justify-center lg:flex">
          <SpectrumRing className="absolute inset-0 size-full" />
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-extrabold">5 Sınav</span>
            <span className="text-sm font-semibold text-white/70">Tek Platform</span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-[.1em] text-white/50">Her sınavın kendi rengi, kendi yolu</span>
          </div>
        </div>
      </div>
    </section>
  );
}
