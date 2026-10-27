import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, ClipboardCheck, Users } from "lucide-react";
import { PLATFORM_EXAMS } from "@/lib/platform";
import { LogoMark } from "@/components/brand/Logo";
import styles from "./HomeJumbotron.module.css";

export function HomeJumbotron({ levelTestHref }: { levelTestHref: string }) {
  return (
    <section className={`home-jumbotron ${styles.hero}`} aria-labelledby="home-hero-title">
      <div className={styles.photoPanel}>
        <Image
          src="/images/marketing/netfener-study-light.webp"
          alt=""
          fill
          sizes="(min-width: 1000px) 58vw, 100vw"
          preload
          className={styles.photo}
        />
        <div className={styles.photoCaption}>
          <span className={styles.captionMark} aria-hidden="true"><LogoMark size={27} /></span>
          <div><p>Çalışma alanın hazır.</p><span>Kendi hızında. Kendi hedefinle.</span></div>
        </div>
      </div>
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.fold} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.copy}>
        <p className={styles.eyebrow}><span /> İNGİLİZCE SINAV HAZIRLIĞI</p>
        <h1 id="home-hero-title" className={styles.title}>
          Sınavına hazırlan.<br /><span>Hedefine ulaş.</span>
        </h1>
        <p className={styles.description}>
          Konu anlatımları, deneme sınavları, canlı grup dersleri ve çalışma materyalleri tek platformda.
        </p>
        <div className={styles.examChoices} aria-label="Hazırlandığın sınavı seç">
          {PLATFORM_EXAMS.map(({ slug, name }) => <Link key={slug} href={`/exams/${slug}`}>{name}</Link>)}
        </div>
        <div className={styles.actions}>
          <Link href="#sinavini-sec" className={styles.primary}>Sınavını seç <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href={levelTestHref} className={styles.secondary}>Ücretsiz seviye tespiti <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <p className={styles.note}><Check size={17} aria-hidden="true" /> İlk konu her sınavda ücretsiz.</p>
        </div>
      </div>
      <div className={styles.pathway} aria-label="Çalışma yolları">
        <div className={styles.pathwayInner}>
          <p className={styles.pathwayLabel}>HEDEFİNE GİDEN<br /><strong>yolu birlikte açalım.</strong></p>
          <Link href="/konu-anlatim"><BookOpen size={23} aria-hidden="true" /><span><strong>Konuları öğren</strong><small>Açıklamalı konu anlatımları</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href={levelTestHref}><ClipboardCheck size={23} aria-hidden="true" /><span><strong>Başlangıcını belirle</strong><small>Ücretsiz seviye tespiti</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/group-lessons"><Users size={23} aria-hidden="true" /><span><strong>Birlikte ilerle</strong><small>Canlı grup dersleri</small></span><ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
