import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { ExamType } from "@/lib/generated/prisma/client";
import type { listHomepageProducts } from "@/server/services/catalog.service";
import { EXAM_META } from "@/lib/exam-types";
import { formatTRY } from "@/lib/pricing";
import { StudySample } from "./StudySample";
import { AvailabilityHome } from "@/components/availability/AvailabilityHome";
import styles from "./MaterialsHome.module.css";

type HomeProduct = Awaited<ReturnType<typeof listHomepageProducts>>[number];

const LEVELS: Record<string, string> = {
  BEGINNER_TO_ADVANCED: "Başlangıçtan ileri seviyeye",
  INTERMEDIATE_ADVANCED: "Orta ve ileri seviye",
  JUNIOR: "Başlangıç seviyesi",
  SENIOR: "İleri seviye",
};
const CATEGORIES: Record<string, string> = {
  STUDY_PACKAGE: "Çalışma paketi",
  BOOK: "Kitap & kaynak",
  PREP_GROUP: "Hazırlık grubu",
  MOCK_CAMP: "Soru & deneme",
  TRANSLATION_SUPPORT: "Çeviri desteği",
};

function deliveryLabel(product: HomeProduct) {
  if (product.book)
    return {
      PDF: "PDF",
      PRINT: "Basılı kitap",
      PRINT_AND_PDF: "Basılı kitap + PDF",
    }[product.book.format];
  if (product.course)
    return {
      HYBRID: "Kayıtlı + canlı ders",
      RECORDED_ONLY: "Kayıtlı ders",
      LIVE_ONLY: "Canlı ders",
    }[product.course.deliveryFormat];
  return CATEGORIES[product.category];
}

function ResourceCard({
  product,
  index,
}: {
  product: HomeProduct;
  index: number;
}) {
  const href =
    product.category === "BOOK"
      ? `/books/${product.slug}`
      : `/packages/${product.slug}`;
  const color = product.examType
    ? EXAM_META[product.examType.code].solid
    : "#226151";
  return (
    <article
      className={styles.productCard}
      style={{ "--resource-color": color } as CSSProperties}
    >
      <div className={styles.productCover}>
        <div className={styles.coverTop}>
          <span>CANNICE / ENGLISH</span>
          <BookOpen size={22} aria-hidden="true" />
        </div>
        <span className={styles.coverCategory}>
          {CATEGORIES[product.category]}
        </span>
        <h3>
          <Link href={href}>{product.title}</Link>
        </h3>
        <div className={styles.coverBottom}>
          <span>{product.examType?.name ?? "İngilizce"}</span>
          <span aria-hidden="true">0{index + 1}</span>
        </div>
      </div>
      <div className={styles.productBody}>
        <div className={styles.productTags}>
          <span>{deliveryLabel(product)}</span>
          {product.book?.pageCount ? (
            <span>{product.book.pageCount} sayfa</span>
          ) : null}
        </div>
        <p className={styles.productDescription}>
          {product.shortDescription ??
            product.subtitle ??
            "İçeriği ve kapsamı ürün sayfasında inceleyin."}
        </p>
        {product.level ? (
          <p className={styles.productLevel}>
            <Check size={15} aria-hidden="true" />
            {LEVELS[product.level] ?? product.level}
          </p>
        ) : null}
        <div className={styles.productPrice}>
          <div>
            {Number(product.basePrice) > Number(product.salePrice) ? (
              <del>{formatTRY(String(product.basePrice))}</del>
            ) : null}
            <strong>{formatTRY(String(product.salePrice))}</strong>
            <small>KDV dahil</small>
          </div>
          <Link
            href={href}
            className={styles.productLink}
            aria-label={`${product.title} — İçeriği incele`}
          >
            İçeriği incele <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MaterialsHome({
  exams,
  products,
  groups = [],
}: {
  exams: ExamType[];
  products: HomeProduct[];
  groups?: HomeProduct[];
}) {
  return (
    <main id="main-content" className={styles.home}>
      <a href="#materials" className={styles.skipLink}>
        Materyallere geç
      </a>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.overline}>
              <span className={styles.statusDot} /> HEDEFİNİZE GİDEN YOL BURADA
            </p>
            <h1 id="home-title">
              İngilizce sınavlarına
              <br />
              <em>bir adım önde</em>
              <br />
              hazırlanın.
            </h1>
            <p className={styles.heroDescription}>
              İngilizce sınav hazırlığınız için tek tek seçebileceğiniz
              materyaller ve canlı grup dersleri. Kendi başınıza çalışın ya da
              bir grupla ilerleyin; size uygun yolu seçin.
            </p>
            <div className={styles.heroButtons}>
              <Link href="#materials" className={styles.buttonDark}>
                Materyalleri keşfet{" "}
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <Link href="#sample" className={styles.textLink}>
                Önce bir alıştırma deneyin{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.heroNote}>
              <Check size={15} aria-hidden="true" /> Örnek alıştırmayı üye
              olmadan deneyebilirsiniz.
            </p>
          </div>
          <div
            className={styles.learningVisual}
            aria-label="Cannice English çalışma yolları"
          >
            <div className={styles.visualTop}>
              <span>CANNICE ENGLISH</span>
              <span>LEARN · PRACTISE · PROGRESS</span>
            </div>
            <div className={styles.visualBrand} aria-hidden="true">
              C<span>e.</span>
              <Sparkles size={64} />
            </div>
            <p>
              Bugünün çalışması.
              <br />
              <strong>Yarının fırsatları.</strong>
            </p>
            <div className={styles.visualCards}>
              <Link href="#materials">
                <BookOpen size={25} />
                <span>
                  Size ait kaynaklar<strong>Kendi temponuzda çalışın</strong>
                </span>
                <ArrowUpRight size={20} />
              </Link>
              <Link href="#live-groups">
                <Users size={25} />
                <span>
                  Canlı grup dersleri<strong>Birlikte ilerleyin</strong>
                </span>
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.heroFoot}>
          <span>HAZIRLIK, BİRİKEN KÜÇÜK ADIMLARDIR.</span>
          <Link href="#exam-path">
            Kendi yolunuzu bulun <ArrowDown size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <AvailabilityHome />
      <section
        id="exam-path"
        className={styles.examSection}
        aria-labelledby="exam-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.overline}>01 / Sizin hedefiniz</p>
            <h2 id="exam-title">Hangi sınav için buradasınız?</h2>
          </div>
          <p>
            Sınavınızı seçin.
            <br />
            İlgili kaynaklara doğrudan ulaşın.
          </p>
        </div>
        <div className={styles.examLinks}>
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/packages?exam=${encodeURIComponent(exam.slug)}`}
              style={
                { "--exam-color": EXAM_META[exam.code].solid } as CSSProperties
              }
            >
              <BookOpen size={24} aria-hidden="true" />
              <span>{exam.name}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
          {exams.length === 0 ? (
            <Link href="/packages">
              Tüm kaynakları keşfet{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>
      <section
        className={styles.offerPaths}
        aria-label="Çalışma yolunuzu seçin"
      >
        <Link href="#materials">
          <BookOpen size={26} aria-hidden="true" />
          <div>
            <span>KENDİ TEMPONUZDA</span>
            <h2>Materyalinizi seçin.</h2>
            <p>İhtiyacınız olan kitap veya çalışma paketini ayrı ayrı alın.</p>
          </div>
          <ArrowUpRight size={22} aria-hidden="true" />
        </Link>
        <Link href="#live-groups">
          <Users size={26} aria-hidden="true" />
          <div>
            <span>BİRLİKTE İLERLEYİN</span>
            <h2>Canlı gruba katılın.</h2>
            <p>
              Hedefinize uygun grubun içeriğini ve ders programını inceleyin.
            </p>
          </div>
          <ArrowUpRight size={22} aria-hidden="true" />
        </Link>
      </section>
      <section
        id="materials"
        className={styles.materialsSection}
        aria-labelledby="materials-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.overline}>02 / Kaynak rafınız</p>
            <h2 id="materials-title">
              Bir sonraki adımınız
              <br />
              <em>bu rafta olabilir.</em>
            </h2>
          </div>
          <div>
            <p>
              İçeriği, seviyeyi ve fiyatı karşılaştırın.
              <br />
              Size uygun olanla başlayın.
            </p>
            <Link href="/packages" className={styles.textLink}>
              Tüm paketleri gör <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.productGrid}>
          {products.map((product, index) => (
            <ResourceCard key={product.id} product={product} index={index} />
          ))}
        </div>
        {products.length === 0 ? (
          <div className={styles.emptyShelf}>
            <BookOpen size={32} aria-hidden="true" />
            <h3>Kaynak rafımız hazırlanıyor.</h3>
            <p>
              Bu sırada konu anlatımlarını keşfedebilir, aşağıdaki alıştırmayla
              başlayabilirsiniz.
            </p>
            <Link href="/konu-anlatim" className={styles.textLink}>
              Konu anlatımlarına git <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
        <div className={styles.shelfFooter}>
          <span>
            <FileText size={17} aria-hidden="true" /> Kitap mı arıyorsunuz?
          </span>
          <Link href="/books" className={styles.textLink}>
            Kitap ve kaynak koleksiyonunu aç{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        id="live-groups"
        className={styles.liveGroupsSection}
        aria-labelledby="groups-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.overline}>Birlikte öğrenmek isteyenlere</p>
            <h2 id="groups-title">
              Kendi hedefiniz.
              <br />
              <em>Birlikte attığınız adımlar.</em>
            </h2>
          </div>
          <p>
            Canlı grup derslerini karşılaştırın.
            <br />
            İçerik ve programı inceleyerek grubunuzu seçin.
          </p>
        </div>
        <div className={styles.productGrid}>
          {groups.map((product, index) => (
            <ResourceCard key={product.id} product={product} index={index} />
          ))}
        </div>
        {groups.length === 0 ? (
          <div className={styles.emptyShelf}>
            <Users size={28} aria-hidden="true" />
            <h3>Yeni gruplar burada duyurulacak.</h3>
            <p>
              Yayımlanmış bir canlı grup olduğunda içeriğini ve programını
              burada görebileceksiniz.
            </p>
            <Link href="#sample" className={styles.textLink}>
              Bu sırada bir alıştırma deneyin{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </section>
      <section
        id="sample"
        className={styles.sampleSection}
        aria-labelledby="sample-title"
      >
        <div className={styles.sampleInner}>
          <div className={styles.sampleCopy}>
            <p className={styles.overline}>03 / Küçük bir başlangıç</p>
            <h2 id="sample-title">
              Sadece bakmayın.
              <br />
              <em>Bir de deneyin.</em>
            </h2>
            <p>
              Bir soru seçin, cevabınızı işaretleyin ve açıklamayı okuyun. Doğru
              cevabı bulmak kadar, neden doğru olduğunu anlamak da önemli.
            </p>
            <div className={styles.sampleSteps}>
              <span>
                01 <strong>Deneyin</strong>
              </span>
              <span>
                02 <strong>Nedenini öğrenin</strong>
              </span>
              <span>
                03 <strong>Devam edin</strong>
              </span>
            </div>
            <Link href="/konu-anlatim" className={styles.sampleLibrary}>
              Konu anlatım kütüphanesini keşfet{" "}
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <small>
              Bu kısa tanıtım alıştırmaları bir ücretli paketin tamamını temsil
              etmez. Paket kapsamını ürün sayfasında inceleyin.
            </small>
          </div>
          <StudySample />
        </div>
      </section>
      <section
        className={styles.approachSection}
        aria-labelledby="approach-title"
      >
        <div>
          <p className={styles.overline}>Daha düzenli bir hazırlık</p>
          <h2 id="approach-title">
            Bir kaynak yığını değil,
            <br />
            <em>kendinize ait bir çalışma düzeni.</em>
          </h2>
        </div>
        <div className={styles.approachList}>
          <article>
            <BookOpen aria-hidden="true" />
            <div>
              <h3>Önce konuyu anlayın.</h3>
              <p>
                Konu anlatımlarında çalışmak istediğiniz başlığı bulun.
                Temelinizi adım adım güçlendirin.
              </p>
            </div>
            <span aria-hidden="true">01</span>
          </article>
          <article>
            <Layers aria-hidden="true" />
            <div>
              <h3>İhtiyacınıza göre seçin.</h3>
              <p>
                Kitap, çalışma paketi veya ders desteği. Formatı ve kapsamı
                karşılaştırarak karar verin.
              </p>
            </div>
            <span aria-hidden="true">02</span>
          </article>
          <article>
            <Check aria-hidden="true" />
            <div>
              <h3>Küçük adımlarla ilerleyin.</h3>
              <p>
                Öğrendiklerinizi düzenli tekrar ve alıştırmayla pekiştirin.
                Çalışma temponuzu siz belirleyin.
              </p>
            </div>
            <span aria-hidden="true">03</span>
          </article>
        </div>
      </section>
      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div>
          <p className={styles.overline}>Aklınızda soru kalmasın</p>
          <h2 id="faq-title">Başlamadan önce.</h2>
          <p>
            İhtiyacınızı bilerek,
            <br />
            içiniz rahat seçin.
          </p>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>
              Hangi kaynağı seçmeliyim?<span aria-hidden="true">+</span>
            </summary>
            <p>
              Önce sınavınızı seçin. Ardından ürünün seviyesini, açıklamasını ve
              formatını karşılaştırın. Konu anlatımları ve bu sayfadaki
              alıştırmalar, çalışmak istediğiniz alanları belirlemenize yardımcı
              olabilir.
            </p>
          </details>
          <details>
            <summary>
              Kaynaklar PDF mi, basılı mı, online mı?
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              Format ürüne göre değişir. Kitaplar PDF, basılı veya her iki
              formatta olabilir; ders paketleri kayıtlı, canlı veya karma
              olabilir. Ürün kartındaki formatı ve ayrıntı sayfasındaki kapsamı
              kontrol edin.
            </p>
          </details>
          <details>
            <summary>
              Satın almadan önce deneyebilir miyim?
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              Bu sayfadaki tanıtım alıştırmalarını ve{" "}
              <Link href="/konu-anlatim">konu anlatımlarını</Link> üye olmadan
              inceleyebilirsiniz. Tanıtım alıştırmaları her ücretli ürünün
              kapsamını temsil etmez.
            </p>
          </details>
          <details>
            <summary>
              Sipariş ve ödeme nasıl işliyor?<span aria-hidden="true">+</span>
            </summary>
            <p>
              Ürünü inceleyip sepete ekledikten sonra siparişinizi
              oluşturabilirsiniz. Online ödeme altyapısı şu anda kurulum
              aşamasında. Siparişiniz ödeme bekleniyor durumunda kaydedilir;
              ekip ödeme ve erişim adımları için sizinle iletişime geçer.
            </p>
          </details>
          <details>
            <summary>
              Erişim süresi ve iade koşulları nedir?
              <span aria-hidden="true">+</span>
            </summary>
            <p>
              Erişim ve teslim koşullarını seçtiğiniz ürün için sipariş
              öncesinde netleştirin. İade koşullarını{" "}
              <Link href="/legal/mesafeli-satis-sozlesmesi">
                Mesafeli Satış Sözleşmesi
              </Link>{" "}
              üzerinden inceleyebilirsiniz.
            </p>
          </details>
        </div>
      </section>
      <section className={styles.finalSection} aria-labelledby="final-title">
        <div className={styles.finalMark} aria-hidden="true">
          C<span>/</span>E
        </div>
        <div>
          <p className={styles.overline}>Sıradaki adım sizin</p>
          <h2 id="final-title">
            Çalışma masanız hazır.
            <br />
            <em>İlk kaynağınızı seçelim.</em>
          </h2>
        </div>
        <Link href="/packages" className={styles.buttonDark}>
          Kaynakları keşfet <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
