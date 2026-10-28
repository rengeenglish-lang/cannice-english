import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Check, Clock3, FileText, Play, Sparkles, Users } from "lucide-react";
import type { listHomepageProducts, listHomepageGroups } from "@/server/services/catalog.service";
import { formatTRY } from "@/lib/pricing";
import { isMonthlyBilledCategory } from "@/lib/billing";
import { PLATFORM_EXAMS } from "@/lib/platform";
import { findNetfenerEdition } from "@/lib/netfener-ebook-editions";
import { ebookFreePromoEndLabel, isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";
import { lessonDate, lessonTime } from "@/lib/availability";
import { StudySample } from "./StudySample";
import { SiteReviewsSection } from "@/components/site-reviews/SiteReviewsSection";
import type { PublicReview } from "@/components/site-reviews/SiteReviewCard";
import { AvailabilityHome } from "@/components/availability/AvailabilityHome";
import styles from "./MaterialsHome.module.css";

type HomeProduct = Awaited<ReturnType<typeof listHomepageProducts>>[number];
type HomeGroup = Awaited<ReturnType<typeof listHomepageGroups>>[number];

/** Return to the intended activity after registration. */
function memberHref(href: string, isSignedIn: boolean) {
  return isSignedIn ? href : `/register?next=${encodeURIComponent(href)}`;
}

const PILLARS = [
  { label: "ÖĞREN", title: "Konu Anlatımları", copy: "Konuları kendi hızında öğren. Her sınavın ilk konusu ücretsiz, tamamı planına dahil.", href: "/konu-anlatim", icon: BookOpen, badge: "İLK KONU ÜCRETSİZ", membersOnly: false },
  { label: "PRATİK YAP", title: "Sınav pratiği", copy: "Soru tiplerini tanı, süreli görevlerle gerçek sınava hazırlan.", href: "/dashboard/speaking-practice", icon: Play, badge: null, membersOnly: true },
  { label: "CANLI ÖĞREN", title: "Grup dersleri", copy: "Sınavına özel küçük gruplarda programlı ve canlı ilerle.", href: "/group-lessons", icon: Users, badge: null, membersOnly: false },
  { label: "GÜÇLEN", title: "Çalışma materyalleri", copy: "Soru bankaları, çalışma paketleri ve indirilebilir kaynaklar.", href: "/packages", icon: FileText, badge: null, membersOnly: false },
] as const;


const MEMBER_NOTE = "Ücretsiz üyelikle";

function ResourceCard({ product }: { product: HomeProduct }) {
  const edition = findNetfenerEdition(product.slug);
  const book = edition?.book;
  const href = book ? `/kaynaklar/e-kitaplar/onizleme/${book.slug}` : product.category === "BOOK" ? `/books/${product.slug}` : `/packages/${product.slug}`;
  const promo = Boolean(book && edition?.edition !== "print" && isEbookFreePromoActive());
  const cover = book?.cover ?? product.posterImageUrl;
  return <article className={styles.card}>
    <Link href={href} className={styles.bookStage} aria-label={`${product.title}: incele`}>
      {cover ? <Image src={cover} alt={`${product.title} kapağı`} width={220} height={310} sizes="220px" unoptimized className={book ? styles.bookCover : styles.artwork} /> : <div className={styles.resourceMark}><BookOpen size={48} strokeWidth={1.25} aria-hidden="true" /><span>{product.examType?.name ?? "Netfener"} · Çalışma paketi</span></div>}
    </Link>
    <div className={styles.cardBody}>
      <p className={styles.meta}>{product.examType?.name ?? "İngilizce"} · {book ? "Netfener e-kitapları" : "Çalışma kaynakları"}</p>
      <h3 className={styles.cardTitle}><Link href={href}>{product.title}</Link></h3>
      <p className={styles.cardCopy}>{product.shortDescription || product.description || "Sınav hazırlığını destekleyen çalışma kaynağı."}</p>
      {book ? <div className={styles.facts}>
        <span className={styles.fact}><FileText size={15} aria-hidden="true" />{book.pages} sayfa · {edition?.edition === "print" ? "Basılı kitap" : edition?.edition === "online" ? "Online okuma" : "PDF e-kitap"}</span>
        <Link href={href} className={styles.previewLink}>10 sayfayı ücretsiz incele <ArrowRight size={14} aria-hidden="true" /></Link>
      </div> : null}
      <div className={styles.cardFooter}>
        <div>
          <p className={styles.meta}>{promo ? `${ebookFreePromoEndLabel()} tarihine kadar` : "KDV dahil"}</p>
          <p className={styles.price}>{promo ? "Ücretsiz" : formatTRY(String(product.salePrice))}</p>
          {promo ? <p className={styles.meta}>Online okuma ve PDF</p> : null}
        </div>
        <Link href={href} className="secondary-button">{book ? "Kitabı incele" : "Kaynağı incele"} <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>;
}

function GroupCard({ product }: { product: HomeGroup }) {
  const sessions = product.course?.liveSessions ?? [];
  const minutes = sessions.reduce((sum, session) => sum + Math.round((session.endsAt.getTime() - session.startsAt.getTime()) / 60000), 0);
  const instructors = [...new Set(sessions.flatMap(session => session.instructor?.name ? [session.instructor.name] : []))];
  const monthly = isMonthlyBilledCategory(product.category);
  return <article className={styles.card}>
    <div className={styles.cardBody}>
      <p className={styles.meta}>{product.examType?.name ?? "İngilizce"} · Canlı grup dersi</p>
      <h3 className={styles.cardTitle}>{product.title}</h3>
      <p className={styles.cardCopy}>{product.course?.syllabusSummary || product.shortDescription || product.description}</p>
      <div className={styles.facts}>
        {sessions.length ? <>
          <span className={styles.fact}><CalendarDays size={15} aria-hidden="true" />Sonraki ders: {lessonDate(sessions[0].startsAt)}, {lessonTime(sessions[0].startsAt)} (TR)</span>
          <span className={styles.fact}><Clock3 size={15} aria-hidden="true" />Açık takvimde {sessions.length} ders · toplam {minutes} dakika</span>
        </> : <span className={styles.fact}><CalendarDays size={15} aria-hidden="true" />Güncel programı ders detayında inceleyin.</span>}
        {instructors.length ? <span className={styles.fact}><Users size={15} aria-hidden="true" />Eğitmen: {instructors.join(", ")}</span> : null}
      </div>
      <div className={styles.cardFooter}>
        <div>
          <p className={styles.meta}>KDV dahil{monthly ? " · aylık ücret" : " · paket ücreti"}</p>
          <p className={styles.price}>{formatTRY(String(product.salePrice))}{monthly ? <small> / ay</small> : null}</p>
          <p className={styles.meta}>İçerik ve katılım koşullarını inceleyin.</p>
        </div>
        <Link href={`/packages/${product.slug}`} className="secondary-button">Program ve kapsam <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>;
}

export function MaterialsHome({ products, groups = [], reviews = [], isSignedIn = false }: { products: HomeProduct[]; groups?: HomeGroup[]; reviews?: PublicReview[]; isSignedIn?: boolean }) {
  const levelTestHref = memberHref("/seviye-tespit", isSignedIn);
  return <main id="main-content" className={styles.home}>

    <section className="relative overflow-hidden bg-[#071b34] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgb(var(--glow-rgb)/.32),transparent_32%)]" />
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

    <div className={styles.trust} aria-label="Başlamadan önce">
      <div className={styles.trustInner}>
        <span className={styles.trustItem}><BookOpen size={18} aria-hidden="true" />Her sınavda ilk konu ücretsiz</span>
        <Link href="/kaynaklar/e-kitaplar" className={styles.trustItem}><FileText size={18} aria-hidden="true" />Kitapları satın almadan inceleyin</Link>
        <Link href="/kocluk" className={styles.trustItem}><Users size={18} aria-hidden="true" />Ücretsiz öğrenci koçluğu</Link>
      </div>
    </div>

    <section id="sinavini-sec" className={`${styles.section} scroll-mt-24`} aria-labelledby="exam-choice-title">
      <p className={styles.eyebrow}>Beş sınav · tek platform</p>
      <h2 id="exam-choice-title" className={styles.heading}>Hazırlık yolunu sınavına göre seç.</h2>
      <p className={styles.copy}>Konu anlatımları, sınav pratiği ve kaynaklar. İhtiyacın olan her şeye kendi sınav alanından ulaş.</p>
      <div className={styles.examGrid}>
        {PLATFORM_EXAMS.map(({ slug, name, description, icon: Icon }) => <Link key={slug} href={`/exams/${slug}`} className={styles.examCard}>
          <span className={styles.examIcon}><Icon size={22} aria-hidden="true" /></span>
          <h3>{name}</h3><p>{description}</p>
          <span className={styles.examLink}>Sınavı keşfet <ArrowRight size={15} aria-hidden="true" /></span>
        </Link>)}
      </div>
    </section>

    <section className={styles.tinted} aria-labelledby="practice-title">
      <div className={`${styles.section} ${styles.practice}`}>
        <div>
          <p className={styles.eyebrow}>Önce deneyimle</p>
          <h2 id="practice-title" className={styles.heading}>Bir soruyla başla.<br />Nasıl öğrendiğini keşfet.</h2>
          <p className={styles.copy}>Örnek soruyu hemen çöz, açıklamasını incele. Konu anlatımları ve sınav pratiğiyle çalışmana devam et.</p>
          <ol className={styles.steps}>
            <li className={styles.step}><span>1</span><div><h3>Konuyu öğren</h3><p>Her sınavın ilk konu anlatımı ücretsiz.</p></div></li>
            <li className={styles.step}><span>2</span><div><h3>Pratikle pekiştir</h3><p>Sorulara ve Speaking simülasyonlarına ücretsiz üyelikle eriş.</p></div></li>
            <li className={styles.step}><span>3</span><div><h3>Çalışmanı planla</h3><p>Koçluk, grup dersleri ve kaynaklarla hazırlığını destekle.</p></div></li>
          </ol>
          <div className={styles.actions}>
            <Link href="/konu-anlatim" className="primary-button">İlk konuyu incele <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href={memberHref("/dashboard/speaking-practice", isSignedIn)} className="secondary-button">Speaking pratiği</Link>
          </div>
        </div>
        <StudySample />
      </div>
    </section>

    <AvailabilityHome />
    {groups.length ? <section className={styles.section} aria-labelledby="group-plans-title">
      <div className={styles.sectionHeader}>
        <div><p className={styles.eyebrow}>Programlı, canlı öğrenme</p><h2 id="group-plans-title" className={styles.heading}>Sana uygun programı bul.</h2><p className={styles.copy}>Ders takvimini, eğitmeni ve kapsamı karşılaştır; hazırlığına uygun grubu seç.</p></div>
        <Link href="/group-lessons" className="secondary-button">Tüm grup dersleri <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <div className={styles.grid}>{groups.map(product => <GroupCard key={product.id} product={product} />)}</div>
    </section> : null}

    {products.length ? <section className={styles.tinted} aria-labelledby="resources-title">
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>Netfener kütüphanesi</p><h2 id="resources-title" className={styles.heading}>İçeriğini gör. Kaynağını seç.</h2><p className={styles.copy}>Kitap kapaklarının ötesine geç: örnek sayfaları ve açıklamalı uygulamaları incele, ihtiyacına uygun kaynakla devam et.</p></div>
          <Link href="/kaynaklar" className="secondary-button">Tüm kaynaklar <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className={styles.grid}>{products.map(product => <ResourceCard key={product.id} product={product} />)}</div>
      </div>
    </section> : null}

    <SiteReviewsSection reviews={reviews} className="py-16" />

    <section className={styles.section} aria-labelledby="next-step-title">
      <div className={styles.closing}>
        <div><p className={styles.eyebrow}>Sıradaki adım senin</p><h2 id="next-step-title" className={styles.heading}>Hazırlığa nereden başlayacağını öğren.</h2><p className={styles.copy}>Seviyeni gör, hedeflerine uygun çalışma yolunu seç.</p></div>
        <div className={styles.actions}><Link href={levelTestHref} className="primary-button">Ücretsiz seviye tespiti <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/planlar" className="secondary-button">Planları incele</Link></div>
      </div>
    </section>
  </main>;
}
