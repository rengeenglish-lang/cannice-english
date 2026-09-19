import Link from "next/link";
import { ArrowRight, BookOpen, Check, FileText, GraduationCap, LineChart, Play, Sparkles, Users } from "lucide-react";
import type { listHomepageProducts } from "@/server/services/catalog.service";
import { formatTRY } from "@/lib/pricing";
import { PLATFORM_EXAMS, examLearningHref } from "@/lib/platform";
import { StudySample } from "./StudySample";
import { AvailabilityHome } from "@/components/availability/AvailabilityHome";

type HomeProduct = Awaited<ReturnType<typeof listHomepageProducts>>[number];

const PILLARS = [
  { label: "ÖĞREN", title: "Ücretsiz Konu Anlatımları", copy: "Konuları kendi hızında öğren. Tüm konu anlatımları ücretsizdir.", href: "/konu-anlatim", icon: BookOpen, badge: "ÜCRETSİZ" },
  { label: "PRATİK YAP", title: "Sınav pratiği", copy: "Soru tiplerini tanı, süreli görevlerle gerçek sınava hazırlan.", href: "/dashboard/speaking-practice", icon: Play, badge: "DENEME" },
  { label: "CANLI ÖĞREN", title: "Grup dersleri", copy: "Sınavına özel küçük gruplarda programlı ve canlı ilerle.", href: "/group-lessons", icon: Users, badge: "GRUP DERSİ" },
  { label: "GÜÇLEN", title: "Çalışma materyalleri", copy: "Soru bankaları, çalışma paketleri ve indirilebilir kaynaklar.", href: "/packages", icon: FileText, badge: "MATERYAL" },
] as const;

const JOURNEY = [
  { title: "Öğren", copy: "Ücretsiz konu anlatımları", href: "/konu-anlatim", icon: BookOpen },
  { title: "Pratik yap", copy: "Sorular ve simülasyonlar", href: "/dashboard/speaking-practice", icon: Play },
  { title: "Eksiklerini gör", copy: "İlerlemeni takip et", href: "/dashboard", icon: LineChart },
  { title: "Destek al", copy: "Grup dersi ve materyaller", href: "/group-lessons", icon: Users },
  { title: "Hedefine ulaş", copy: "Planlı çalışmaya devam et", href: "/exams", icon: GraduationCap },
] as const;

function ProductCard({ product, badge = "MATERYAL" }: { product: HomeProduct; badge?: string }) {
  const href = product.category === "BOOK" ? `/books/${product.slug}` : `/packages/${product.slug}`;
  return <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(7,27,52,.07)]">
    <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black tracking-wider text-blue-700">{badge}</span><span className="text-xs font-bold text-slate-500">{product.examType?.name ?? "İngilizce"}</span></div>
    <h3 className="mt-5 text-xl font-black tracking-tight">{product.title}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{product.shortDescription ?? product.description ?? "Sınav hazırlığınızı destekleyen çalışma kaynağı."}</p>
    <div className="mt-auto flex items-end justify-between gap-4 pt-7"><div>{badge === "MATERYAL" ? <><p className="text-xs font-bold text-slate-400">KDV dahil</p><p className="text-2xl font-black">{formatTRY(String(product.salePrice))}</p></> : <p className="text-sm font-black text-blue-700">Programı incele</p>}</div><Link href={href} className="primary-button px-4">İncele <ArrowRight size={17} /></Link></div>
  </article>;
}

export function MaterialsHome({ products, groups = [] }: { exams: unknown[]; products: HomeProduct[]; groups?: HomeProduct[] }) {
  return <main id="main-content" className="bg-white text-[color:var(--foreground)]">
    <section className="relative overflow-hidden bg-[#071b34] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(65,98,218,.55),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-[650px] w-full max-w-[1320px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
        <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-200">IELTS • TOEFL • YDS • YÖKDİL</p><h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-[-.055em] sm:text-7xl">Sınavına hazırlan.<br/><span className="text-blue-300">Hedefine ulaş.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Ücretsiz konu anlatımları, sınav pratiği, canlı grup dersleri ve çalışma materyalleri tek platformda.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#sinavini-sec" className="primary-button">Sınavını seç <ArrowRight size={18}/></Link><Link href="/konu-anlatim" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 px-6 text-sm font-bold hover:bg-white/10">Ücretsiz çalışmaya başla</Link></div></div>
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-7"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-blue-500"><Sparkles/></span><div><p className="text-xs font-bold uppercase tracking-widest text-blue-200">Cannice English</p><p className="text-xl font-black">Çalışma alanın hazır</p></div></div><div className="mt-6 grid grid-cols-2 gap-3">{PILLARS.map(({label,icon:Icon})=><div key={label} className="rounded-2xl bg-white/10 p-4"><Icon size={22} className="text-blue-300"/><p className="mt-3 text-sm font-extrabold">{label}</p></div>)}</div><p className="mt-5 flex items-center gap-2 text-sm text-blue-100"><Check size={18}/> Öğrenmek için ödeme yapman gerekmez.</p></div>
      </div>
    </section>

    <section id="sinavini-sec" className="mx-auto w-full max-w-[1320px] scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"><div className="text-center"><p className="eyebrow">Dört sınav · tek platform</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Hangi sınava hazırlanıyorsun?</h2><p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">Sınavını seç; o sınava ait öğrenme, pratik, ders ve materyal yollarını birlikte gör.</p></div><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{PLATFORM_EXAMS.map(({slug,name,description,color,soft,icon:Icon})=><Link key={slug} href={`/exams/${slug}`} className="group rounded-3xl border border-slate-200 p-6 shadow-[0_12px_35px_rgba(7,27,52,.07)] transition hover:-translate-y-1" style={{background:soft}}><span className="grid size-12 place-items-center rounded-2xl text-white" style={{background:color}}><Icon/></span><h3 className="mt-6 text-2xl font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold" style={{color}}>Sınav alanına gir <ArrowRight size={17} className="transition group-hover:translate-x-1"/></span></Link>)}</div></section>

    <section className="bg-slate-50"><div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8"><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{PILLARS.map(({label,title,copy,href,icon:Icon,badge})=><Link key={label} href={href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon/></span><span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black tracking-wider text-slate-600">{badge}</span></div><p className="mt-6 text-xs font-extrabold tracking-widest text-blue-700">{label}</p><h3 className="mt-2 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p></Link>)}</div></div></section>

    <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8"><div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]"><div><p className="eyebrow">Tamamı ücretsiz</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Ücretsiz Konu Anlatımları</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">Öğrenmek için ödeme yapmana gerek yok. Konuyu öğren, ardından sınav pratiğiyle kendini test et.</p></div><Link href="/konu-anlatim" className="secondary-button">Tüm konuları gör <ArrowRight size={18}/></Link></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{PLATFORM_EXAMS.map(exam=><Link key={exam.slug} href={examLearningHref(exam.slug)} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">ÜCRETSİZ</span><h3 className="mt-4 text-xl font-black">{exam.name}</h3><p className="mt-2 text-sm text-slate-600">Konu anlatımlarını keşfet</p></Link>)}</div></section>

    <section className="bg-[#071b34] text-white"><div className="mx-auto grid w-full max-w-[1320px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-xs font-extrabold uppercase tracking-widest text-blue-200">Gerçek sınava hazırlan</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Pratik yap, sınav akışını tanı.</h2><p className="mt-4 leading-7 text-slate-300">IELTS ve TOEFL Speaking simülasyonlarını kullan; YDS ve YÖKDİL için örnek sorularla öğrenme akışını dene.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/dashboard/speaking-practice/ielts" className="primary-button">IELTS Speaking</Link><Link href="/dashboard/speaking-practice/toefl" className="primary-button bg-white text-[#071b34] hover:bg-blue-50">TOEFL Speaking</Link></div></div><StudySample/></div></section>

    <AvailabilityHome />
    {groups.length ? <section className="mx-auto w-full max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8"><div className="mb-7 flex items-end justify-between"><div><p className="eyebrow">Canlı öğren</p><h2 className="mt-2 text-3xl font-black">Sınavına özel gruplar</h2></div><Link href="/group-lessons" className="font-bold text-blue-700">Tüm gruplar →</Link></div><div className="grid gap-5 md:grid-cols-3">{groups.map(product=><ProductCard key={product.id} product={product} badge="GRUP DERSİ"/>)}</div></section>:null}

    <section className="bg-slate-50"><div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">KAYNAKLARLA GÜÇLEN</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Çalışma Materyalleri</h2><p className="mt-3 max-w-2xl text-slate-600">Ücretsiz konu anlatımlarından ayrı, satın alınabilir soru bankaları ve çalışma paketleri.</p></div><Link href="/packages" className="secondary-button">Tüm materyalleri gör</Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{products.map(product=><ProductCard key={product.id} product={product}/>)}</div></div></section>

    <section className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8"><div className="text-center"><p className="eyebrow">Nasıl çalışır?</p><h2 className="mt-2 text-3xl font-black">Öğrenmeden hedefe uzanan tek akış</h2></div><div className="mt-9 grid gap-3 md:grid-cols-5">{JOURNEY.map(({title,copy,href,icon:Icon},i)=><Link key={title} href={href} className="rounded-2xl border border-slate-200 p-5"><span className="text-xs font-black text-blue-600">0{i+1}</span><Icon className="mt-5 text-blue-600"/><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p></Link>)}</div></section>

    <section className="mx-auto w-full max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-8"><div className="rounded-[2rem] bg-[#071b34] p-8 text-center text-white sm:p-12"><p className="text-xs font-extrabold uppercase tracking-widest text-blue-200">Sıradaki adım senin</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Hangi sınava hazırlanıyorsun?</h2><div className="mt-7 flex flex-wrap justify-center gap-3">{PLATFORM_EXAMS.map(exam=><Link key={exam.slug} href={`/exams/${exam.slug}`} className="inline-flex min-h-12 items-center rounded-xl bg-white px-6 text-sm font-black text-[#071b34] transition hover:-translate-y-1">{exam.name}</Link>)}</div></div></section>
  </main>;
}
