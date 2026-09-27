import type { LegalDoc } from "@/content/legal-terms";
import { SUPPORT_EMAIL } from "@/lib/social";

/**
 * İade Politikası and Kullanım Koşulları. Written to match how the platform actually works:
 * plans (lib/plans.ts), monthly group billing (lib/billing.ts), PayPal + havale checkout,
 * refunds processed manually by staff (orders.service.ts → markOrderRefunded), product-specific windows.
 * Have a lawyer review before relying on them.
 */

export const REFUND_POLICY: LegalDoc = {
  title: "İade Politikası",
  updatedAt: "27 Eylül 2026",
  draft: false,
  body: "Bu politika, Netfener üzerinden satın aldığınız planlar, konu anlatımları, canlı grup dersleri, kaynaklar ve kitaplar için hangi durumlarda ve nasıl iade yapıldığını açıklar. Amacımız, memnun kalmadığınız bir satın alımdan adil ve hızlı bir şekilde vazgeçebilmenizi sağlamaktır.",
  sections: [
    {
      heading: "1. İade süresi",
      paragraphs: [
        "Plan kapsamında erişilen kaynaklar, kitaplar, konu anlatımları ve canlı grup dersleri yalnızca satın alınan planın iade koşullarına tabidir. Bu içeriklerin ayrı satışlarına ilişkin iade süreleri ve iade yapılmaması kuralı, plan kapsamında sağlanan erişime uygulanmaz. Plandan bağımsız olarak ayrıca satın alınan ürün ve hizmetlerde ise ilgili ürün veya hizmetin kendi iade koşulları geçerlidir.",
        "Netfener’in isteğe bağlı iade politikası kapsamında Başlangıç planı ve ayrı satın alınan konu anlatımları için 7 takvim günü; Çırak ve Uzman planları için 14 takvim günü içinde iade talep edilebilir. Ayrı satın alınan kaynaklar ve kitaplar için isteğe bağlı iade yapılmaz. Ayrı satın alınan canlı grup derslerinin koşulları aşağıda ayrıca açıklanmıştır.",
        "Bu politikadaki başvuru süreleri ödemenin onaylandığı tarihten itibaren hesaplanır. PayPal için ödemenin tamamlandığı, havale için ödemenin onaylandığı tarih esas alınır. İlgili süre geçtikten sonra isteğe bağlı iade talebi kabul edilmez. Yasal cayma hakkının bulunduğu durumlarda kanuni süre ve başlangıç tarihi uygulanır; bu politika yasal hakları kısaltmaz.",
      ],
    },
    {
      heading: "2. Deneme sınavı planları (Başlangıç, Çırak, Uzman)",
      paragraphs: [
        "Başlangıç planı için ödemenin onayından itibaren 7 gün; Çırak ve Uzman planları için 14 gün içinde, planı kullanmaya başlamış olsanız da başlamamış olsanız da iade talep edebilirsiniz.",
        "Planın hiç kullanılmadığı durumlarda (hiç deneme başlatılmamış, konu anlatımı dersi tamamlanmamış, pratik seti çözülmemiş ve plana dahil e-kitap indirilmemişse) ödediğiniz tutarın tamamı iade edilir.",
        "Plan kullanılmaya başlandıysa, planın toplam süresine oranla kullandığınız günlerin bedeli düşülerek kalan tutar iade edilir. Plan kapsamındaki kitap, kaynak, konu anlatımı ve canlı grup dersi kullanımı için ayrıca ürün veya ders bedeli kesintisi yapılmaz.",
        "Planlar otomatik yenilenmez; bu nedenle iptal etmeniz gereken bir abonelik veya ileride yapılacak bir çekim bulunmaz.",
      ],
    },
    {
      heading: "3. Ayrı satın alınan canlı grup dersleri",
      paragraphs: [
        "Plandan bağımsız olarak satın alınan canlı grup dersleri aylık olarak ücretlendirilir ve her ödeme bir takvim ayını kapsar. Her aylık ödeme için, ödeme tarihinden itibaren 14 gün içinde iade talep edebilirsiniz.",
        "Aylık dönem içinde henüz hiçbir ders gerçekleşmemişse ödemenin tamamı iade edilir. Ders gerçekleşmişse, o döneme ait gerçekleşmiş derslerin bedeli (katılıp katılmadığınızdan bağımsız olarak) düşülür ve kalan tutar iade edilir.",
        "Aylık ödemenizi yapmadığınızda grubunuza erişim durur; ödenmemiş dönemler için sizden herhangi bir ücret talep edilmez ve iade konusu olmaz.",
      ],
    },
    {
      heading: "4. Ayrı satın alınan kaynaklar ve kitaplar",
      paragraphs: [
        "Plandan bağımsız olarak satın alınan kaynaklar, çalışma materyalleri ve kitaplar için isteğe bağlı iade yapılmaz. Elektronik ortamda anında teslim edilen PDF/e-kitap ve diğer dijital kaynaklarda, Mesafeli Sözleşmeler Yönetmeliği’ndeki cayma hakkı istisnasının koşulları sağlandığında cayma hakkı kullanılamaz.",
        "Bu kural, ayıplı veya teslim edilmeyen içeriklere ilişkin yasal hakları ortadan kaldırmaz. Basılı kitaplarda ve cayma hakkı istisnasına girmeyen diğer satışlarda kanuni cayma ve iade hakları geçerlidir. Ayrı satın alınan konu anlatımları aşağıdaki 7 günlük iade koşuluna tabidir.",
      ],
    },
    {
      heading: "5. Konu anlatımları",
      paragraphs: [
        "Ayrı satın alınan konu anlatımları için ödemenin onaylandığı tarihten itibaren 7 takvim günü içinde iade talep edilebilir. Talep süresi içinde Yardım Masası üzerinden başvuru yapılması yeterlidir; incelemenin bu süre içinde tamamlanması gerekmez.",
        "Bir planın içinde sunulan konu anlatımları için ayrı bir iade süresi başlamaz; satın alınan planın iade süresi ve iade tutarına ilişkin koşulları uygulanır. Kanundan doğan haklar saklıdır.",
      ],
    },
    {
      heading: "6. Hizmetin sunulamaması",
      paragraphs: [
        "Bir canlı ders bizim tarafımızdan iptal edilir ve telafi dersi yapılmazsa, o dersin bedeli süreye bakılmaksızın iade edilir veya bir sonraki aylık ödemenizden düşülür.",
        "Teknik bir arıza nedeniyle satın aldığınız içeriğe uzun süre erişemezseniz ve sorunu makul bir sürede çözemezsek, erişemediğiniz sürenin bedelini iade ederiz ya da planınızın süresini aynı gün sayısı kadar uzatırız.",
      ],
    },
    {
      heading: "7. İade talebi nasıl yapılır?",
      paragraphs: [
        `Yardım Masası'ndaki canlı destek üzerinden veya ${SUPPORT_EMAIL} adresine e-posta göndererek iade talebinde bulunabilirsiniz. Talebinizde hesabınıza kayıtlı e-posta adresini, sipariş numaranızı (Siparişlerim sayfasında yer alır) ve varsa iade gerekçenizi belirtin.`,
        "Talebinizi en geç 3 iş günü içinde inceleyip iade tutarını ve varsa yapılan kesintileri size yazılı olarak bildiririz. İnceleme ve onay süreci, başvurunun bize ulaştığı tarihten başlayan 7 takvim günlük toplam iade süresinin içindedir; bu süreyi uzatmaz veya yeniden başlatmaz.",
      ],
    },
    {
      heading: "8. İade ödemesi",
      paragraphs: [
        "İade koşullarını karşılayan tüm başvurularda iadeler, talebin bize ulaştığı tarihten itibaren en geç 7 takvim günü içinde ödemeyi yaptığınız yöntemle gerçekleştirilir: PayPal ile yapılan ödemeler PayPal hesabınıza veya PayPal'da kullandığınız karta, banka havalesiyle yapılan ödemeler ise sizin adınıza kayıtlı ve bize bildirdiğiniz IBAN'a iade edilir.",
        "PayPal ödemeleri ABD doları üzerinden tahsil edildiğinden iade de aynı para birimiyle yapılır; kur farkları ve bankanızın uyguladığı ücretler Netfener'in kontrolünde değildir.",
        "İade tamamlandığında ilgili plan, grup dersi veya ürüne erişiminiz kapatılır ve durum hesabınıza bildirim olarak iletilir.",
      ],
    },
    {
      heading: "9. İndirimli ve kuponlu alımlar",
      paragraphs: [
        "Kupon veya kampanya indirimiyle yapılan alımlarda iade tutarı, fiilen ödediğiniz tutar üzerinden hesaplanır. Kullanılan kupon iade ile birlikte yeniden kullanıma açılmaz.",
      ],
    },
    {
      heading: "10. İletişim ve yürürlük",
      paragraphs: [
        "Bu güncelleme 27 Eylül 2026 ve sonrasında yapılan satın alımlar için geçerlidir. Daha önceki satın alımlarda, satın alma sırasında sunulan iade koşulları geriye dönük olarak daraltılmaz.",
        `Bu politikayla ilgili her türlü soru için Yardım Masası'na veya ${SUPPORT_EMAIL} adresine ulaşabilirsiniz. Bu politika, yürürlükteki tüketici mevzuatından doğan haklarınızı sınırlamaz; mevzuatın daha lehinize olduğu durumlarda mevzuat hükümleri uygulanır.`,
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDoc = {
  title: "Kullanım Koşulları",
  updatedAt: "23 Eylül 2026",
  draft: false,
  body: "Bu koşullar, Netfener web sitesini ve bu site üzerinden sunulan tüm eğitim hizmetlerini kullanımınızı düzenler. Siteye üye olarak veya siteyi kullanarak bu koşulları kabul etmiş olursunuz.",
  sections: [
    {
      heading: "1. Hizmetin kapsamı",
      paragraphs: [
        "Netfener; IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına hazırlanan öğrencilere konu anlatımları, seviye tespit sınavları, deneme sınavları, pratik sorular, ilerleme takibi, canlı grup dersleri, e-kitaplar ve çalışma materyalleri sunan çevrim içi bir eğitim platformudur.",
        "Platformda sunulan seviye tespit ve deneme sınavı sonuçları tahmini göstergelerdir; resmî sınav puanı, sertifika veya belirli bir sınav sonucunun garantisi değildir.",
      ],
    },
    {
      heading: "2. Üyelik ve hesap güvenliği",
      paragraphs: [
        "Üye olurken doğru ve güncel bilgi vermeniz gerekir. 18 yaşından küçükseniz, üyelik ve satın alma işlemleri için velinizin onayı gerekir.",
        "Hesabınız kişiseldir. Şifrenizin gizliliğinden siz sorumlusunuz; hesabınızı başkalarıyla paylaşamaz, devredemez veya satamazsınız. Hesabınızın izinsiz kullanıldığını fark ederseniz derhâl bize bildirin.",
        "Güvenlik amacıyla oturumlar belirli bir süre sonra otomatik olarak kapatılır.",
      ],
    },
    {
      heading: "3. Planlar ve erişim",
      paragraphs: [
        "Deneme sınavı planları (Başlangıç, Çırak, Uzman) ödemenin onaylanmasıyla başlar ve plan açıklamasında belirtilen takvim süresi boyunca geçerlidir. Her planın hangi özellikleri içerdiği plan kartlarında açıkça belirtilir; plana dahil olmayan özellikler ayrıca satın alınabilir.",
        "Başlangıç planında deneme sınavı hakkı 10 ile sınırlıdır; her yeni deneme başlatma bir hak kullanır. Uzman planın ücretsiz canlı ders hakları plan süresi içinde birer kez ve bir aylık dönem için kullanılabilir.",
        "Planlar otomatik yenilenmez. Süre sona erdiğinde plana bağlı içeriklere erişim kapanır; ilerleme kayıtlarınız, sonuçlarınız ve notlarınız hesabınızda saklanmaya devam eder.",
      ],
    },
    {
      heading: "4. Canlı grup dersleri",
      paragraphs: [
        "Canlı grup dersleri aylık olarak ücretlendirilir. Her ödeme bir takvim ayını kapsar. Ödeme döneminiz sona erdiğinde bildirim alırsınız; bildirimi izleyen 1 gün içinde ödeme yapılmazsa canlı derslere erişiminiz, ödeme yapılana kadar durdurulur.",
        "Ders saatleri, gruplar ve eğitmenler Canlı Derslerim sayfasında gösterilir. Zorunlu hallerde bir dersin saati değiştirilebilir veya ders iptal edilebilir; bu durumda önceden bilgilendirilir ve telafi dersi ya da İade Politikası'ndaki haklar sunulur.",
        "Derslerde diğer katılımcılara ve eğitmene saygılı davranmanız beklenir. Dersi bozucu, taciz edici veya ayrımcı davranışlarda bulunan kullanıcıların derse katılımı ücret iadesi yapılmaksızın sonlandırılabilir.",
        "Canlı dersler katılımcıların izni olmadan kaydedilemez, fotoğraflanamaz ve paylaşılamaz. Ders bağlantıları yalnızca kayıtlı öğrencinin kişisel kullanımı içindir.",
      ],
    },
    {
      heading: "5. Fikrî mülkiyet",
      paragraphs: [
        "Sitedeki konu anlatımları, sorular, açıklamalar, deneme sınavları, videolar, e-kitaplar ve diğer tüm içerikler Netfener'e veya lisans verenlerine aittir ve fikrî mülkiyet mevzuatıyla korunur.",
        "İçerikleri yalnızca kendi kişisel sınav hazırlığınız için kullanabilirsiniz. İçerikleri kopyalamak, çoğaltmak, yeniden satmak, başka sitelerde veya sosyal medyada yayımlamak, ders ya da kurs materyali olarak kullanmak ve otomatik araçlarla toplamak yasaktır.",
      ],
    },
    {
      heading: "6. Kabul edilemez kullanım",
      paragraphs: [
        "Siteyi hukuka aykırı amaçlarla kullanmak, sistemin güvenliğini aşmaya veya işleyişini bozmaya çalışmak, sınav sorularını ve cevaplarını toplu olarak paylaşmak, başkası adına hesap açmak ve öğretmenlere ya da destek ekibine gönderilen mesajlarda hakaret, taciz veya reklam içerikli ifadeler kullanmak yasaktır.",
        "Bu koşulların ihlali hâlinde hesabınızı önceden bildirimde bulunarak veya ciddi ihlallerde derhâl askıya alabilir ya da kapatabiliriz.",
      ],
    },
    {
      heading: "7. Ödemeler",
      paragraphs: [
        "Fiyatlar Türk lirası olarak ve KDV dahil gösterilir. Ödemeler PayPal veya banka havalesi ile yapılabilir. PayPal ödemelerinde tutar, gösterilen TL fiyatın güncel kur üzerinden ABD doları karşılığı olarak tahsil edilir.",
        "Havale ile verilen siparişlerde erişim, ödemenin ekibimiz tarafından onaylanmasıyla açılır. İadeler İade Politikası'na göre yapılır.",
      ],
    },
    {
      heading: "8. Kişisel veriler",
      paragraphs: [
        "Hesap bilgileriniz, sınav ve ilerleme kayıtlarınız ile site kullanım sıklığınız size kişiselleştirilmiş çalışma planı ve İlerleme Raporu sunmak için işlenir. Kişisel verilerinizin işlenmesine ilişkin ayrıntılar Aydınlatma Metni ve Gizlilik Sözleşmesi'nde yer alır.",
        "Canlı destek hizmeti üçüncü taraf bir sohbet sağlayıcısı aracılığıyla sunulur; canlı destekte paylaştığınız bilgiler bu sağlayıcının altyapısında işlenir. Canlı destekte şifre veya kart bilgisi paylaşmayın.",
      ],
    },
    {
      heading: "9. Sorumluluğun sınırlandırılması",
      paragraphs: [
        "Platformu kesintisiz ve hatasız sunmak için makul özeni gösteririz; ancak bakım, altyapı sağlayıcılarından kaynaklanan arızalar veya internet bağlantınızdaki sorunlar nedeniyle yaşanabilecek kesintilerden, mevzuatın izin verdiği ölçüde sorumlu değiliz.",
        "Platformu kullanmanız belirli bir sınav puanına ulaşacağınız anlamına gelmez; sınav sonucunuz sizin çalışmanıza ve sınav koşullarına bağlıdır.",
      ],
    },
    {
      heading: "10. Değişiklikler ve iletişim",
      paragraphs: [
        "Bu koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikleri site üzerinden veya hesabınıza bildirim göndererek duyururuz; güncelleme tarihinden sonra siteyi kullanmaya devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir. Değişiklikler, daha önce satın aldığınız planların kapsamını geriye dönük olarak daraltmaz.",
        `Bu koşullarla ilgili sorularınız için Yardım Masası'na veya ${SUPPORT_EMAIL} adresine ulaşabilirsiniz. Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir; tüketici uyuşmazlıklarında Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.`,
      ],
    },
  ],
};
