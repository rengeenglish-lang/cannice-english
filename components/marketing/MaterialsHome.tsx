import Link from "next/link";
import { ArrowRight, BookOpen, Check, FileText, GraduationCap, LineChart, Play, Sparkles, Users } from "lucide-react";
import type { listHomepageProducts, listTestimonials } from "@/server/services/catalog.service";
import { formatTRY } from "@/lib/pricing";
import { isMonthlyBilledCategory } from "@/lib/billing";
import { PLATFORM_EXAMS } from "@/lib/platform";
import { StudySample } from "./StudySample";
import { TestimonialsSection } from "./TestimonialsSection";
import { AvailabilityHome } from "@/components/availability/AvailabilityHome";

type HomeProduct = Awaited<ReturnType<typeof listHomepageProducts>>[number];
type HomeTestimonial = Awaited<ReturnType<typeof listTestimonials>>[number];

/** Member-only destinations: logged-out visitors go through registration and land on the target afterwards. */
function memberHref(href: string, isSignedIn: boolean) {
  return isSignedIn ? href : `/register?next=${encodeURIComponent(href)}`;
}

const PILLARS = [
  { label: "ÖĞREN", title: "Konu Anlatımları", copy: "Konuları kendi hızında öğren. Her sınavın ilk konusu ücretsiz, tamamı planına dahil.", href: "/konu-anlatim", icon: BookOpen, badge: "İLK KONU ÜCRETSİZ", membersOnly: false },
  { label: "PRATİK YAP", title: "Sınav pratiği", copy: "Soru tiplerini tanı, süreli görevlerle gerçek sınava hazırlan.", href: "/dashboard/speaking-practice", icon: Play, badge: null, membersOnly: true },
  { label: "CANLI ÖĞREN", title: "Grup dersleri", copy: "Sınavına özel küçük gruplarda programlı ve canlı ilerle.", href: "/group-lessons", icon: Users, badge: null, membersOnly: false },
  { label: "GÜÇLEN", title: "Çalışma materyalleri", copy: "Soru bankaları, çalışma paketleri ve indirilebilir kaynaklar.", href: "/packages", icon: FileText, badge: null, membersOnly: false },
] as const;

const JOURNEY = [
  { title: "Öğren", copy: "Konu anlatımları", href: "/konu-anlatim", icon: BookOpen, membersOnly: false },
  { title: "Pratik yap", copy: "Sorular ve simülasyonlar", href: "/dashboard/speaking-practice", icon: Play, membersOnly: true },
  { title: "Eksiklerini gör", copy: "İlerlemeni takip et", href: "/dashboard", icon: LineChart, membersOnly: true },
  { title: "Destek al", copy: "Grup dersi ve materyaller", href: "/group-lessons", icon: Users, membersOnly: false },
  { title: "Hedefine ulaş", copy: "Planlı çalışmaya devam et", href: "/exams", icon: GraduationCap, membersOnly: false },
] as const;

const MEMBER_NOTE = "Ücretsiz üyelikle";

function ProductCard({ product, isGroup = false }: { product: HomeProduct; isGroup?: boolean }) {
  const href = product.category === "BOOK" ? `/books/${product.slug}` : `/packages/${product.slug}`;
  const monthly = isGroup && isMonthlyBilledCategory(product.category);
  return <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(7,27,52,.07)]">
    <p className="text-xs font-bold text-slate-500">{product.examType?.name ?? "İngilizce"}</p>
    <h3 className="mt-2 text-xl font-black tracking-tight">{product.title}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{product.shortDescription || product.description || "Sınav hazırlığını destekleyen çalışma kaynağı."}</p>
    <div className="mt-auto flex items-end justify-between gap-4 pt-7">
      <div><p className="text-xs font-bold text-slate-400">KDV dahil</p><p className="text-2xl font-black">{formatTRY(String(product.salePrice))}{monthly ? <span className="text-sm font-bold text-slate-500"> / ay</span> : null}</p></div>
      <Link href={href} className="primary-button px-4">İncele <ArrowRight size={17} /></Link>
    </div>
  </article>;
}

export function MaterialsHome({ products, groups = [], testimonials = [], isSignedIn = false }: { products: HomeProduct[]; groups?: HomeProduct[]; testimonials?: HomeTestimonial[]; isSignedIn?: boolean }) {
  const levelTestHref = memberHref("/seviye-tespit", isSignedIn);
  return <main id="main-content" className="bg-white text-[color:var(--foreground)]">
    <section className="relative overflow-hidden bg-[#071b34] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(65,98,218,.55),transparent_32%)]" />
      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-12 px-4 py-14 sm:px-6 lg:min-h-[650px] lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-200">{PLATFORM_EXAMS.map((exam) => exam.name).join(" • ")}</p>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.04] tracking-[-.03em] sm:text-7xl">Sınavına hazırlan.<br/><span className="text-blue-300">Hedefine ulaş.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Konu anlatımları, deneme sınavları, canlı grup dersleri ve çalışma materyalleri tek platformda.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#sinavini-sec" className="primary-button">Sınavını seç <ArrowRight size={18}/></Link>
            <Link href={levelTestHref} className="inline-flex min-h-12 items-center rounded-xl border border-white/30 px-6 text-sm font-bold hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30">Ücretsiz seviye tespiti</Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-blue-100"><Check size={18}/> İlk konu her sınavda ücretsiz.</p>
        </div>
        <div className="hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-7 lg:block">
          <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-blue-500"><Sparkles/></span><div><p className="text-xs font-bold uppercase tracking-widest text-blue-200">Netfener</p><p className="text-xl font-black">Çalışma alanın hazır</p></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3">{PILLARS.map(({label,href,membersOnly,icon:Icon})=><Link key={label} href={membersOnly ? memberHref(href, isSignedIn) : href} className="group rounded-2xl bg-white/10 p-4 transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"><Icon size={22} className="text-blue-300"/><p className="mt-3 flex items-center justify-between gap-2 text-sm font-extrabold">{label}<ArrowRight size={16} className="text-blue-200 transition group-hover:translate-x-1"/></p>{membersOnly && !isSignedIn ? <p className="mt-1 text-xs text-blue-200">{MEMBER_NOTE}</p> : null}</Link>)}</div>
        </div>
      </div>
    </section>

    <section id="sinavini-sec" className="mx-auto w-full max-w-[1320px] scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="text-center"><p className="eyebrow">Beş sınav · tek platform</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Hangi sınava hazırlanıyorsun?</h2><p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">Sınavını seç; o sınava ait öğrenme, pratik, ders ve materyal yollarını birlikte gör.</p></div><div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">{PLATFORM_EXAMS.map(({slug,name,description,color,soft,icon:Icon})=><Link key={slug} href={`/exams/${slug}`} className="group rounded-3xl border border-slate-200 p-4 shadow-[0_12px_35px_rgba(7,27,52,.07)] transition last:col-span-2 hover:-translate-y-1 sm:p-6 lg:last:col-span-1" style={{background:soft}}><span className="grid size-10 place-items-center rounded-2xl text-white sm:size-12" style={{background:color}}><Icon/></span><h3 className="mt-4 text-xl font-black sm:mt-6 sm:text-2xl">{name}</h3><p className="mt-2 hidden text-sm leading-6 text-slate-600 sm:block">{description}</p><span className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold sm:mt-5" style={{color}}><span className="sr-only sm:not-sr-only">Sınav alanına gir</span><ArrowRight size={17} aria-hidden="true" className="transition group-hover:translate-x-1"/></span></Link>)}</div></section>

    <TestimonialsSection testimonials={testimonials} className="pb-14 sm:pb-16" />

    <section className="bg-slate-50"><div className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">{PILLARS.map(({label,title,copy,href,membersOnly,icon:Icon,badge})=>{const gated = membersOnly && !isSignedIn; const tag = gated ? MEMBER_NOTE.toLocaleUpperCase("tr-TR") : badge; return <Link key={label} href={membersOnly ? memberHref(href, isSignedIn) : href} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-700 sm:size-11"><Icon/></span>{tag ? <span className="hidden whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black tracking-wide text-emerald-700 sm:inline-block">{tag}</span> : null}</div><p className="mt-5 text-xs font-extrabold tracking-widest text-blue-700 sm:mt-6">{label}</p><h3 className="mt-2 text-lg font-black sm:text-xl">{title}</h3>{tag ? <p className="mt-1 text-xs font-bold text-emerald-700 sm:hidden">{gated ? MEMBER_NOTE : "İlk konu ücretsiz"}</p> : null}<p className="mt-3 hidden text-sm leading-6 text-slate-600 sm:block">{copy}</p></Link>;})}</div></div></section>

    <section className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]"><div><p className="eyebrow">İlk konu ücretsiz</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Konu Anlatımları</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">Her sınavın ilk konusunu ücretsiz incele; tüm konulara planınla eriş. Konuyu öğren, ardından sınav pratiğiyle kendini test et.</p></div><Link href="/konu-anlatim" className="secondary-button">Tüm konuları gör <ArrowRight size={18}/></Link></div></section>

    <section className="bg-[#071b34] text-white"><div className="mx-auto grid w-full max-w-[1320px] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="text-xs font-extrabold uppercase tracking-widest text-blue-200">Gerçek sınava hazırlan</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Pratik yap, sınav akışını tanı.</h2><p className="mt-4 leading-7 text-slate-300">IELTS ve TOEFL Speaking simülasyonlarını kullan; YDS ve YÖKDİL için örnek sorularla öğrenme akışını dene.</p><div className="mt-7 flex flex-wrap gap-3"><Link href={memberHref("/dashboard/speaking-practice/ielts", isSignedIn)} className="primary-button">IELTS Speaking</Link><Link href={memberHref("/dashboard/speaking-practice/toefl", isSignedIn)} className="primary-button bg-white text-[#071b34] hover:bg-blue-50">TOEFL Speaking</Link></div>{isSignedIn ? null : <p className="mt-4 text-sm text-blue-200">Speaking simülasyonları ücretsiz üyelikle açılır. Aşağıdaki örnek soruyu hemen deneyebilirsin.</p>}</div><StudySample/></div></section>

    <AvailabilityHome />
    {groups.length ? <section className="mx-auto w-full max-w-[1320px] px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Canlı öğren</p><h2 className="mt-2 text-3xl font-black">Sınavına özel gruplar</h2></div><Link href="/group-lessons" className="shrink-0 font-bold text-blue-700">Tüm gruplar →</Link></div><div className="grid gap-5 md:grid-cols-3">{groups.map(product=><ProductCard key={product.id} product={product} isGroup/>)}</div></section>:null}

    <section className="bg-slate-50"><div className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">KAYNAKLARLA GÜÇLEN</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Başarın için özenle hazırlanmış kaynaklar</h2><p className="mt-3 max-w-2xl text-slate-600">Konu anlatımlarından ayrı, satın alınabilir soru bankaları ve çalışma paketleri.</p></div><Link href="/kaynaklar" className="secondary-button">Tüm kaynakları gör</Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{products.map(product=><ProductCard key={product.id} product={product}/>)}</div></div></section>

    <section className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="text-center"><p className="eyebrow">Nasıl çalışır?</p><h2 className="mt-2 text-3xl font-black">Öğrenmeden hedefe uzanan tek akış</h2></div><ol className="-mx-4 mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0">{JOURNEY.map(({title,copy,href,membersOnly,icon:Icon},i)=><li key={title} className="w-[42%] shrink-0 snap-start md:w-auto"><Link href={membersOnly ? memberHref(href, isSignedIn) : href} className="block h-full rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200"><span className="text-xs font-black text-blue-600">0{i+1}</span><Icon className="mt-5 text-blue-600"/><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{copy}{membersOnly && !isSignedIn ? ` · ${MEMBER_NOTE}` : ""}</p></Link></li>)}</ol></section>

    <section className="mx-auto w-full max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-8"><div className="rounded-[2rem] bg-[#071b34] p-8 text-center text-white sm:p-12"><p className="text-xs font-extrabold uppercase tracking-widest text-blue-200">Sıradaki adım senin</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Seviyeni öğren, planını seç.</h2><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href={levelTestHref} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-[#071b34] transition hover:-translate-y-1">Ücretsiz seviye tespiti <ArrowRight size={17}/></Link><Link href="/planlar" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 px-6 text-sm font-black transition hover:bg-white/10">Planları incele</Link></div></div></section>
  </main>;
}
