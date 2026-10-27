import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PLATFORM_EXAMS } from "@/lib/platform";
import styles from "./HomeJumbotron.module.css";

export function HomeJumbotron({ levelTestHref }: { levelTestHref: string }) {
  return (
    <section className={`home-jumbotron ${styles.hero}`} aria-labelledby="home-hero-title">
      <Image
        src="/images/marketing/netfener-group-study.webp"
        alt=""
        fill
        sizes="100vw"
        preload
        className={styles.photo}
      />
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow}>{PLATFORM_EXAMS.map((exam) => exam.name).join(" · ")}</p>
        <h1 id="home-hero-title" className={styles.title}>
          Sınavına hazırlan.<br /><span>Hedefine ulaş.</span>
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
      <svg className={styles.wave} viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 210C410 165 1080 130 1440 0V240H0Z" fill="white" fillOpacity=".12" />
        <path d="M0 240C530 185 1130 170 1440 35V240H0Z" fill="white" fillOpacity=".3" />
        <path d="M0 240C580 225 1180 170 1440 80V240H0Z" className={styles.waveFill} />
      </svg>
    </section>
  );
}
