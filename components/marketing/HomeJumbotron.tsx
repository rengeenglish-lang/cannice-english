import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
      </div>
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.fold} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.copy}>
        <p className={styles.eyebrow}><span /> BEŞ SINAV. TEK ODAK: SENİN HEDEFİN.</p>
        <h1 id="home-hero-title" className={styles.title}>
          Sınavına<br />hazırlan.<br /><span>Hedefine ulaş.</span>
        </h1>
        <p className={styles.description}>
          Konu anlatımları, deneme sınavları, canlı grup dersleri ve çalışma materyalleri tek platformda.
        </p>
        <div className={styles.actions}>
          <Link href="#sinavini-sec" className={styles.primary}>Sınavını seç <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href={levelTestHref} className={styles.secondary}>Ücretsiz seviye tespiti</Link>
        </div>
        <p className={styles.note}><Check size={17} aria-hidden="true" /> İlk konu her sınavda ücretsiz.</p>
        </div>
      </div>
      <div className={styles.pathway} aria-label="Çalışma yolları">
        <div className={styles.pathwayInner}>
          <p className={styles.pathwayLabel}>HAZIRLIĞININ<br />HER ADIMINDA.</p>
          <Link href="/konu-anlatim"><span>01</span> Konuyu öğren <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href={levelTestHref}><span>02</span> Seviyeni gör <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/group-lessons"><span>03</span> Birlikte ilerle <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
