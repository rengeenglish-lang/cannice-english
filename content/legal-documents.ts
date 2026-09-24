import type { LegalDoc } from "@/content/legal-terms";
import { LEGAL_ENTITY, sellerIdentityLines } from "@/lib/legal-entity";
import { SUPPORT_EMAIL } from "@/lib/social";

/**
 * Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu, Üyelik Sözleşmesi, Gizlilik Politikası, KVKK
 * Aydınlatma Metni, Açık Rıza Metni and Çerez Politikası. Structured on common Turkish e-commerce /
 * ed-tech practice (6502 sayılı TKHK, Mesafeli Sözleşmeler Yönetmeliği, 6698 sayılı KVKK) and
 * written to match how the platform works: plans (lib/plans.ts), monthly group billing
 * (lib/billing.ts), PayPal + havale checkout, the 14-day refund window in İade Politikası.
 * Fill in lib/legal-entity.ts and have a lawyer review before relying on them.
 */

const UPDATED = "24 Eylül 2026";
const brand = LEGAL_ENTITY.brand;

export const DISTANCE_SALES_AGREEMENT: LegalDoc = {
  title: "Mesafeli Satış Sözleşmesi",
  updatedAt: UPDATED,
  draft: false,
  body: `Bu sözleşme, ${brand} internet sitesi üzerinden elektronik ortamda satın aldığın planlar, canlı grup dersleri, dijital içerikler ve kitaplara ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca tarafların hak ve yükümlülüklerini düzenler. Siparişi onaylamadan önce bu sözleşmeyi ve Ön Bilgilendirme Formu'nu okuyup onaylaman gerekir.`,
  sections: [
    { heading: "1. Satıcı", paragraphs: sellerIdentityLines() },
    {
      heading: "2. Alıcı",
      paragraphs: [
        "Alıcı, siparişi veren ve üyelik ya da sipariş sırasında bildirdiği ad-soyad, e-posta ve telefon bilgileriyle tanımlanan kişidir (“Alıcı” veya “sen”). Sipariş ve fatura bilgileri, sipariş özetinde ve Siparişlerim sayfasında yer alır.",
      ],
    },
    {
      heading: "3. Sözleşmenin konusu",
      paragraphs: [
        "Sözleşmenin konusu; Alıcı'nın sitede seçtiği, nitelikleri ve satış fiyatı sipariş özetinde gösterilen ürün veya hizmetlerin satışı ve ifasıdır. Ürün ve hizmetler şunlardır:",
        "a) Deneme sınavı planları (Başlangıç, Çırak, Uzman): plan kartında belirtilen süre boyunca deneme sınavlarına, konu anlatımlarına, pratik sorulara ve plana dahil diğer içeriklere çevrim içi erişim.",
        "b) Canlı grup dersleri: seçilen gruba ait, aylık olarak ücretlendirilen çevrim içi canlı dersler.",
        "c) Dijital içerikler: e-kitaplar (PDF), kayıtlı dersler ve çalışma paketleri.",
        "d) Basılı kitaplar.",
      ],
    },
    {
      heading: "4. Fiyat ve ödeme",
      paragraphs: [
        "Tüm fiyatlar Türk lirası cinsinden ve KDV dahil gösterilir. Siparişte uygulanan fiyat, siparişin onaylandığı andaki fiyattır; kupon veya kampanya indirimleri sipariş özetinde ayrıca gösterilir.",
        "Ödeme PayPal (kart veya PayPal hesabı) ya da banka havalesi ile yapılır. PayPal ödemelerinde tutar, gösterilen TL fiyatın ödeme anındaki kur üzerinden ABD doları karşılığı olarak tahsil edilebilir; kur farkları ve bankanın uygulayacağı ücretler Satıcı'nın kontrolünde değildir.",
        "Canlı grup dersleri aylık ücretlendirilir; her ödeme bir takvim ayını kapsar ve bir sonraki ay için ödeme hatırlatması gönderilir. Planlar tek seferlik ödemedir ve otomatik yenilenmez.",
      ],
    },
    {
      heading: "5. İfa ve teslimat",
      paragraphs: [
        "Planlar, canlı grup dersleri ve dijital içerikler, ödemenin onaylanmasıyla birlikte Alıcı'nın hesabında erişime açılır. Havale ile verilen siparişlerde erişim, ödemenin Satıcı tarafından onaylanmasıyla açılır.",
        "Basılı kitaplar, ödemenin onaylanmasından itibaren en geç 30 gün içinde Alıcı'nın bildirdiği adrese kargo ile gönderilir. Teslimat süresi aşılırsa Alıcı siparişi iptal edebilir; ödediği tutar 14 gün içinde iade edilir.",
        "Canlı derslerin saatleri ve bağlantıları Canlı Derslerim sayfasında gösterilir. Zorunlu hallerde ders saati değiştirilebilir veya ders iptal edilebilir; bu durumda Alıcı önceden bilgilendirilir ve telafi dersi planlanır ya da iptal edilen dersin bedeli iade edilir.",
      ],
    },
    {
      heading: "6. 14 gün iade hakkı ve cayma hakkı",
      paragraphs: [
        `${brand}, yasal cayma hakkına ek olarak tüm satın alımlarda ödemenin onaylandığı tarihten itibaren 14 günlük iade hakkı tanır. İade tutarı ve koşulları İade Politikası'nda ayrıntılı olarak açıklanmıştır; özetle:`,
        "• Planlar: 14 gün içinde iade talep edilebilir. Plan hiç kullanılmadıysa ödenen tutarın tamamı, kullanılmaya başlandıysa kullanılan günlerin ve plana dahil indirilen e-kitapların bedeli düşülerek kalan tutar iade edilir.",
        "• Canlı grup dersleri: her aylık ödeme için 14 gün içinde iade talep edilebilir; o dönemde gerçekleşmiş derslerin bedeli düşülür.",
        "• Basılı kitaplar: teslim tarihinden itibaren 14 gün içinde, kullanılmamış ve yeniden satılabilir durumda olmak kaydıyla iade edilebilir.",
        "• Dijital içerikler: indirme veya izleme başlamadan önce 14 gün içinde koşulsuz iade edilebilir. Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca elektronik ortamda anında ifa edilen hizmetler ile tüketiciye anında teslim edilen gayrimaddi mallarda, ifaya Alıcı'nın onayıyla başlandıktan sonra yasal cayma hakkı kullanılamaz; Alıcı, siparişi onaylarken bu hususu kabul eder. Bu durumda iade, İade Politikası'ndaki kurallara göre yapılır.",
        `İade veya cayma talebi, Yardım Masası'ndaki canlı destek üzerinden ya da ${SUPPORT_EMAIL} adresine yazılı olarak iletilir. Satıcı, talebin kendisine ulaşmasından itibaren en geç 14 gün içinde iade tutarını ödemenin yapıldığı yönteme uygun şekilde iade eder.`,
      ],
    },
    {
      heading: "7. Tarafların yükümlülükleri",
      paragraphs: [
        "Satıcı, satın alınan ürün ve hizmetleri sipariş özetinde ve ürün sayfasında belirtilen niteliklere uygun olarak sunmakla yükümlüdür.",
        "Alıcı, hesabını ve içerikleri yalnızca kendi kişisel kullanımı için kullanır; içerikleri çoğaltamaz, paylaşamaz, yeniden satamaz. Kullanım kuralları Üyelik Sözleşmesi ve Kullanım Koşulları'nda yer alır.",
        "Seviye tespit ve deneme sınavı sonuçları tahmini göstergelerdir; Satıcı belirli bir sınav puanı veya sonucu taahhüt etmez.",
      ],
    },
    {
      heading: "8. Uyuşmazlıkların çözümü",
      paragraphs: [
        "Bu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dahilinde Alıcı'nın yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetleri, bu sınırları aşan durumlarda Tüketici Mahkemeleri yetkilidir.",
      ],
    },
    {
      heading: "9. Yürürlük",
      paragraphs: [
        "Alıcı, siparişi onaylamadan önce bu sözleşmeyi ve Ön Bilgilendirme Formu'nu okuduğunu ve kabul ettiğini ödeme sayfasındaki onay kutusunu işaretleyerek beyan eder. Sözleşme, siparişin onaylanmasıyla kurulur; sözleşmenin ve siparişin bir kopyası Alıcı'nın hesabında (Siparişlerim) saklanır.",
      ],
    },
  ],
};

export const PRE_INFORMATION_FORM: LegalDoc = {
  title: "Ön Bilgilendirme Formu",
  updatedAt: UPDATED,
  draft: false,
  body: "Mesafeli Sözleşmeler Yönetmeliği uyarınca, siparişini onaylamadan önce satıcı, ürün veya hizmetin temel nitelikleri, fiyatı, ödeme ve teslimat koşulları ile iade ve cayma hakkın hakkında bu formla bilgilendirilirsin.",
  sections: [
    { heading: "1. Satıcı bilgileri", paragraphs: sellerIdentityLines() },
    {
      heading: "2. Ürün veya hizmetin temel nitelikleri",
      paragraphs: [
        "Satın aldığın ürün veya hizmetin adı, türü (plan, canlı grup dersi, dijital içerik, basılı kitap), erişim süresi ve içeriği ürün sayfasında ve ödeme sayfasındaki sipariş özetinde gösterilir. Planların içerdiği özellikler Planlar sayfasındaki plan kartlarında listelenir.",
      ],
    },
    {
      heading: "3. Fiyat",
      paragraphs: [
        "Toplam fiyat, vergiler dahil olarak sipariş özetinde gösterilir. Kupon veya kampanya indirimleri toplam tutardan düşülerek ayrıca belirtilir. Canlı grup dersleri aylık ücretlendirilir; aylık tutar ürün sayfasında ve sepette “/ ay” ifadesiyle gösterilir.",
      ],
    },
    {
      heading: "4. Ödeme ve teslimat",
      paragraphs: [
        "Ödeme PayPal veya banka havalesi ile yapılır. Dijital hizmetler ödemenin onaylanmasıyla hesabında erişime açılır; basılı kitaplar en geç 30 gün içinde kargoyla gönderilir. Ek bir teslimat ücreti varsa sipariş özetinde gösterilir.",
      ],
    },
    {
      heading: "5. 14 gün iade hakkı",
      paragraphs: [
        "Ödemenin onaylandığı tarihten itibaren 14 gün içinde iade talep edebilirsin. Kullanılmamış planlarda ve içeriği açılmamış dijital ürünlerde ödediğin tutarın tamamı, kullanılmaya başlanmış planlarda ve canlı ders dönemlerinde kullanılan kısmın bedeli düşülerek kalan tutar iade edilir. Ayrıntılar İade Politikası'ndadır.",
        "Elektronik ortamda anında ifa edilen hizmetlerde ve anında teslim edilen dijital içeriklerde, ifaya senin onayınla başlandıktan sonra yasal cayma hakkı kullanılamaz (Mesafeli Sözleşmeler Yönetmeliği md. 15). Bu durumda iade, İade Politikası'ndaki koşullara göre yapılır.",
      ],
    },
    {
      heading: "6. Şikâyet ve başvuru",
      paragraphs: [
        `Şikâyet ve taleplerini Yardım Masası'ndan veya ${SUPPORT_EMAIL} adresinden iletebilirsin. Uyuşmazlıklarda yasal parasal sınırlar dahilinde Tüketici Hakem Heyetleri'ne veya Tüketici Mahkemeleri'ne başvurabilirsin.`,
      ],
    },
  ],
};

export const MEMBERSHIP_AGREEMENT: LegalDoc = {
  title: "Üyelik Sözleşmesi",
  updatedAt: UPDATED,
  draft: false,
  body: `Bu sözleşme, ${brand} platformuna üye olan kullanıcı (“Üye”) ile ${LEGAL_ENTITY.legalName} (“${brand}”) arasında, üyelik ilişkisinin koşullarını düzenler. Üye olarak bu sözleşmeyi kabul etmiş olursun.`,
  sections: [
    {
      heading: "1. Üyelik",
      paragraphs: [
        "Üyelik ücretsizdir. Üye olurken doğru ve güncel bilgi vermen gerekir. 18 yaşından küçük kullanıcıların üyelik ve satın alma işlemleri için veli veya vasi onayı gerekir.",
        "Her kişi yalnızca bir hesap açabilir. Hesap kişiseldir; başkasına devredilemez, paylaşılamaz veya satılamaz.",
      ],
    },
    {
      heading: "2. Ücretsiz ve ücretli hizmetler",
      paragraphs: [
        "Üyelikle birlikte seviye tespit sınavı, her sınavın ilk konu anlatımı, Ücretsiz Öğrenci Koçluğu ve ücretsiz araçlar gibi hizmetlerden yararlanabilirsin.",
        "Planlar, canlı grup dersleri, dijital içerikler ve kitaplar ücretlidir; bunların satın alınması Mesafeli Satış Sözleşmesi ve İade Politikası'na tabidir.",
      ],
    },
    {
      heading: "3. Üyenin yükümlülükleri",
      paragraphs: [
        "Şifrenin gizliliğinden sen sorumlusun. Hesabının izinsiz kullanıldığını fark edersen derhâl bize bildirmelisin.",
        "İçerikleri yalnızca kendi kişisel sınav hazırlığın için kullanabilirsin. İçerikleri kopyalamak, kaydetmek, çoğaltmak, yeniden satmak veya herkese açık ortamlarda paylaşmak yasaktır.",
        "Canlı derslerde ve mesajlaşmada diğer katılımcılara ve eğitmenlere saygılı davranmalısın; taciz edici, ayrımcı veya dersi bozucu davranışlar yasaktır.",
      ],
    },
    {
      heading: `4. ${brand}'in hakları ve yükümlülükleri`,
      paragraphs: [
        "Platformu makul özenle, kesintisiz sunmaya çalışırız; planlı bakım ve altyapı sağlayıcılarından kaynaklanan kesintiler olabilir.",
        "Bu sözleşmenin veya Kullanım Koşulları'nın ihlali hâlinde hesabını önceden bildirimde bulunarak, ağır ihlallerde derhâl askıya alabilir ya da kapatabiliriz. Kapatma, varsa ödediğin ücretlerin İade Politikası'na göre değerlendirilmesini engellemez.",
      ],
    },
    {
      heading: "5. Kişisel veriler ve iletişim",
      paragraphs: [
        "Kişisel verilerin Aydınlatma Metni ve Gizlilik Politikası'na uygun olarak işlenir. Kampanya ve duyuru içerikli ticari elektronik iletiler, yalnızca ayrıca onay vermen hâlinde gönderilir; onayını dilediğin zaman geri alabilirsin.",
      ],
    },
    {
      heading: "6. Üyeliğin sona ermesi",
      paragraphs: [
        `Üyeliğini dilediğin zaman ${SUPPORT_EMAIL} adresine yazarak sonlandırabilirsin. Üyeliğin sona erdiğinde hesabına bağlı erişimler kapanır; kişisel verilerin yasal saklama süreleri sonunda silinir veya anonim hâle getirilir.`,
      ],
    },
    {
      heading: "7. Değişiklikler ve uygulanacak hukuk",
      paragraphs: [
        "Bu sözleşmeyi güncelleyebiliriz; önemli değişiklikleri site üzerinden veya hesabına bildirim göndererek duyururuz. Sözleşme Türkiye Cumhuriyeti hukukuna tabidir; tüketici uyuşmazlıklarında Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.",
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDoc = {
  title: "Gizlilik Politikası",
  updatedAt: UPDATED,
  draft: false,
  body: `${brand} olarak gizliliğine önem veriyoruz. Bu politika, hangi bilgileri topladığımızı, neden kullandığımızı, kimlerle paylaştığımızı ve bilgilerini nasıl koruduğumuzu sade bir dille anlatır. Yasal ayrıntılar KVKK Aydınlatma Metni'nde yer alır.`,
  sections: [
    {
      heading: "1. Topladığımız bilgiler",
      paragraphs: [
        "Hesap bilgileri: ad-soyad, e-posta, şifre (şifrelenmiş olarak), isteğe bağlı olarak telefon, doğum tarihi, meslek ve eğitim durumu.",
        "Çalışma bilgileri: hedef sınavın, seviye tespit ve deneme sonuçların, çözdüğün sorular, hataların, notların, koçluk planın ve ilerleme kayıtların.",
        "Sipariş bilgileri: satın aldığın ürünler, tutarlar, ödeme yöntemi ve ödeme durumu. Kart bilgilerin bize ulaşmaz; kartla ödemeler PayPal altyapısında gerçekleşir.",
        "Teknik bilgiler: oturum çerezleri, site ziyaret sıklığı, tarayıcı ve cihaz bilgileri ile güvenlik kayıtları.",
      ],
    },
    {
      heading: "2. Bilgileri neden kullanıyoruz?",
      paragraphs: [
        "Hesabını oluşturmak ve güvenliğini sağlamak, satın aldığın hizmetleri sunmak, sana kişiselleştirilmiş çalışma planı ve İlerleme Raporu hazırlamak, siparişlerini ve iadelerini yönetmek, destek taleplerini yanıtlamak ve yasal yükümlülüklerimizi yerine getirmek için.",
      ],
    },
    {
      heading: "3. Kimlerle paylaşıyoruz?",
      paragraphs: [
        "Bilgilerini satmayız. Yalnızca hizmeti sunmak için çalıştığımız hizmet sağlayıcılarla, gereken ölçüde paylaşırız: barındırma ve veritabanı sağlayıcıları, ödeme altyapısı (PayPal), canlı destek sağlayıcısı ve e-posta altyapısı. Bu sağlayıcıların bir kısmının sunucuları yurt dışında bulunabilir; aktarım KVKK'nın 9. maddesine uygun olarak yapılır.",
        "Yasal zorunluluk hâlinde yetkili kamu kurum ve kuruluşlarıyla paylaşabiliriz.",
      ],
    },
    {
      heading: "4. Güvenlik ve saklama",
      paragraphs: [
        "Şifreler geri döndürülemez şekilde şifrelenir, bağlantılar HTTPS ile korunur ve verilere erişim yetkili personelle sınırlıdır.",
        "Bilgilerini hesabın açık olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca (örneğin fatura ve sipariş kayıtları için 10 yıl) saklarız; süre sonunda siler veya anonim hâle getiririz.",
      ],
    },
    {
      heading: "5. Hakların",
      paragraphs: [
        `Verilerine erişme, düzeltilmesini veya silinmesini isteme ve işlenmesine itiraz etme hakların vardır. Taleplerini ${SUPPORT_EMAIL} adresine iletebilirsin; ayrıntılar Aydınlatma Metni'ndedir. Çerezler hakkında bilgi için Çerez Politikası'na bakabilirsin.`,
      ],
    },
  ],
};

export const KVKK_NOTICE: LegalDoc = {
  title: "KVKK Aydınlatma Metni",
  updatedAt: UPDATED,
  draft: false,
  body: `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla ${LEGAL_ENTITY.legalName} (“${brand}”) olarak kişisel verilerini aşağıda açıklanan kapsamda işliyoruz.`,
  sections: [
    { heading: "1. Veri sorumlusu", paragraphs: sellerIdentityLines() },
    {
      heading: "2. İşlenen kişisel veri kategorileri",
      paragraphs: [
        "Kimlik (ad-soyad, isteğe bağlı T.C. kimlik numarası ve doğum tarihi), iletişim (e-posta, telefon), müşteri işlem (sipariş, ödeme durumu, iade talepleri), eğitim (hedef sınav, seviye, sınav sonuçları, çalışma ve koçluk kayıtları), mesleki bilgi (meslek, eğitim durumu), işlem güvenliği (oturum bilgileri, IP adresi, erişim kayıtları) ve pazarlama (yalnızca açık rıza vermen hâlinde iletişim tercihleri).",
        "18 yaşından küçük kullanıcılar için veli veya vasinin ad-soyad ve iletişim bilgileri işlenebilir.",
      ],
    },
    {
      heading: "3. İşleme amaçları",
      paragraphs: [
        "Üyelik ve hesap işlemlerinin yürütülmesi; satın alınan eğitim hizmetlerinin sunulması; seviye tespiti, çalışma planı, koçluk ve ilerleme raporlarının hazırlanması; canlı derslerin planlanması; sipariş, ödeme, fatura ve iade süreçlerinin yürütülmesi; destek taleplerinin yanıtlanması; bilgi güvenliğinin sağlanması; yasal yükümlülüklerin yerine getirilmesi ve yetkili kurumlara bilgi verilmesi; açık rızan varsa kampanya ve duyuruların iletilmesi.",
      ],
    },
    {
      heading: "4. Hukuki sebepler",
      paragraphs: [
        "Kişisel verilerin KVKK md. 5/2 uyarınca; bir sözleşmenin kurulması veya ifası (c), veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi (ç), bir hakkın tesisi, kullanılması veya korunması (e) ve temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaatimiz (f) hukuki sebeplerine dayanılarak işlenir. Ticari elektronik ileti gönderimi ve bu metinde sayılanlar dışındaki amaçlar için açık rızana (md. 5/1) başvurulur.",
      ],
    },
    {
      heading: "5. Aktarım",
      paragraphs: [
        "Kişisel verilerin; hizmetin sunulması amacıyla barındırma, veritabanı, ödeme (PayPal), canlı destek ve e-posta hizmeti aldığımız tedarikçilere, yasal zorunluluk hâlinde yetkili kamu kurum ve kuruluşlarına aktarılabilir. Tedarikçilerimizin bir kısmının sunucuları yurt dışında bulunduğundan, yurt dışına aktarım KVKK md. 9'da öngörülen şartlara (uygun güvenceler veya açık rıza) uygun olarak yapılır.",
      ],
    },
    {
      heading: "6. Toplama yöntemi",
      paragraphs: [
        "Kişisel verilerin; üyelik, sipariş, koçluk ve iletişim formları, platform kullanımın sırasında oluşan kayıtlar, çerezler ve canlı destek görüşmeleri aracılığıyla elektronik ortamda toplanır.",
      ],
    },
    {
      heading: "7. KVKK md. 11 kapsamındaki hakların",
      paragraphs: [
        "Kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini, KVKK md. 7 şartları çerçevesinde silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhine bir sonuç çıkmasına itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğraman hâlinde zararın giderilmesini talep etme haklarına sahipsin.",
        `Başvurularını ${SUPPORT_EMAIL} adresine kayıtlı e-posta adresinden veya ${LEGAL_ENTITY.address} adresine yazılı olarak iletebilirsin. Başvurular en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.`,
      ],
    },
  ],
};

export const EXPLICIT_CONSENT: LegalDoc = {
  title: "Açık Rıza Metni",
  updatedAt: UPDATED,
  draft: false,
  body: `KVKK Aydınlatma Metni'ni okudum. Aşağıda belirtilen işlemler için, ayrı ayrı ve özgür irademle açık rıza verebileceğimi; rıza vermemenin üyelik veya satın alma işlemlerimi etkilemeyeceğini ve rızamı dilediğim zaman ${SUPPORT_EMAIL} adresine yazarak geri alabileceğimi biliyorum.`,
  sections: [
    {
      heading: "1. Ticari elektronik ileti",
      paragraphs: [
        `${brand} tarafından kampanya, indirim, yeni ders ve sınav duyurularına ilişkin ticari elektronik iletilerin e-posta, SMS ve telefon yoluyla tarafıma gönderilmesine ve bu amaçla iletişim bilgilerimin işlenmesine onay veriyorum.`,
      ],
    },
    {
      heading: "2. Yurt dışına aktarım",
      paragraphs: [
        "Kişisel verilerimin, hizmetin sunulması amacıyla sunucuları yurt dışında bulunan barındırma, ödeme, canlı destek ve e-posta hizmet sağlayıcılarına, KVKK md. 9'da uygun güvencelerin bulunmadığı durumlarda açık rızama dayanılarak aktarılmasına onay veriyorum.",
      ],
    },
    {
      heading: "3. Başarı hikâyeleri",
      paragraphs: [
        "Paylaşmayı ayrıca kabul ettiğim hâllerde, adımın baş harfleri, sınav sonucum ve yorumumun sitede ve sosyal medya hesaplarında öğrenci görüşü olarak yayımlanmasına onay veriyorum.",
      ],
    },
  ],
};

export const COOKIE_POLICY: LegalDoc = {
  title: "Çerez Politikası",
  updatedAt: UPDATED,
  draft: false,
  body: `${brand} sitesi, düzgün çalışması ve deneyimini iyileştirmek için çerezler kullanır. Bu politika hangi çerezleri neden kullandığımızı açıklar.`,
  sections: [
    {
      heading: "1. Zorunlu çerezler",
      paragraphs: [
        "Oturumunu açık tutan, sepetini ve uygulanan kuponu hatırlayan ve güvenliği sağlayan çerezlerdir. Bu çerezler olmadan giriş yapma ve satın alma işlemleri çalışmaz; KVKK md. 5/2 kapsamında sözleşmenin ifası ve meşru menfaat sebeplerine dayanır.",
      ],
    },
    {
      heading: "2. İşlevsel çerezler",
      paragraphs: [
        "Canlı destek penceresinin çalışması ve tercihlerinin (örneğin sınav görünümü) hatırlanması için kullanılır. Canlı destek üçüncü taraf bir sağlayıcı tarafından sunulur ve kendi çerezlerini kullanabilir. Ders videoları, gizlilik odaklı gömülü oynatıcı (youtube-nocookie) ile gösterilir.",
      ],
    },
    {
      heading: "3. Reklam çerezleri",
      paragraphs: [
        "Şu anda reklam veya yeniden hedefleme çerezi kullanmıyoruz. İleride kullanmaya başlarsak, bu çerezler yalnızca açık rızanla etkinleştirilecek ve bu politika güncellenecektir.",
      ],
    },
    {
      heading: "4. Çerezleri yönetme",
      paragraphs: [
        "Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsin. Zorunlu çerezleri engellemen hâlinde giriş yapma ve ödeme gibi özellikler çalışmayabilir.",
      ],
    },
  ],
};
