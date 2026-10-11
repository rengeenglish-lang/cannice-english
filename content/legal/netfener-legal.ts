import type { LegalDoc } from "@/content/legal-terms";

/**
 * Netfener's legal texts (draft v1.0, 11 Ekim 2026), from the owner's "Netfener Hukuki Metinler
 * Taslağı". Paragraph conventions for the legal page: "• " = list item, "> " = quoted consent text.
 *
 * {{TOKENS}} are filled at render time from Yönetim → Faturalar (company details) and the support
 * address (lib/legal-placeholders.ts). A required token that is still empty shows as a bracketed
 * gap and keeps the page's TASLAK badge; {{?TOKEN}} paragraphs are dropped when empty. The company
 * is registered in Kenya, so the Turkish-only MERSİS and KEP lines of the draft are left out.
 */
const UPDATED = "11 Ekim 2026";

const PROVIDER_LINES = [
  "• Ticari unvan: {{UNVAN}}",
  "• Marka: Netfener",
  "• Vergi numarası (Kenya KRA PIN): {{KRA_PIN}}",
  "• {{?TR_KDV}}",
  "• Adres: {{ADRES}}",
  "• E-posta: {{EPOSTA}}",
  "• Telefon: {{TELEFON}}",
];

export const NETFENER_LEGAL_DOCS: Record<string, LegalDoc> = {
  "mesafeli-satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    updatedAt: UPDATED,
    draft: false,
    body: "Bu sözleşme, Netfener üzerinden elektronik ortamda satın alınan dijital içerik, abonelik, deneme sınavı ve canlı ders hizmetlerinin satışı, sunumu, ödeme koşulları, cayma hakkı ve tarafların hak ve yükümlülüklerini düzenler.",
    sections: [
      { heading: "1. Taraflar", paragraphs: ["1.1. Sağlayıcı", ...PROVIDER_LINES, "• İnternet sitesi: https://netfener.com", "1.2. Alıcı", "Alıcı; sipariş veya üyelik sırasında bildirdiği ad, soyad, adres, e-posta, telefon ve fatura bilgileri bulunan gerçek veya tüzel kişidir. Alıcı, verdiği bilgilerin doğru ve güncel olduğunu kabul eder.", "Sağlayıcı ve Alıcı birlikte “Taraflar” olarak anılacaktır."] },
      {
        heading: "2. Sözleşmenin Konusu",
        paragraphs: [
          "Bu sözleşme; Alıcı'nın Netfener üzerinden elektronik ortamda sipariş verdiği aşağıdaki ürün ve hizmetlerin satışı, sunumu, ifası, ödeme koşulları, cayma hakkı ve tarafların hak ve yükümlülüklerini düzenler:",
          "• IELTS, TOEFL, PTE, YDS ve YÖKDİL sınavlarına yönelik çevrim içi çalışma içerikleri,",
          "• aylık, üç aylık veya yıllık dijital abonelikler,",
          "• çevrim içi deneme sınavları ve sınav simülasyonları,",
          "• indirilebilir veya platform üzerinden erişilebilen dijital çalışma materyalleri,",
          "• canlı çevrim içi bireysel veya grup dersleri,",
          "• paketler, kampanyalar ve bunlara bağlı ek dijital hizmetler.",
          "Siparişin temel nitelikleri, kullanım süresi, kapsamı, kontenjanı, vergiler dâhil toplam bedeli ve varsa kampanya koşulları ödeme öncesindeki sipariş özetinde ayrıca gösterilir. Sipariş özeti bu sözleşmenin ayrılmaz parçasıdır.",
        ],
      },
      {
        heading: "3. Sözleşmenin Kurulması",
        paragraphs: [
          "Alıcı; sipariş özetini, Ön Bilgilendirme Formu'nu ve bu sözleşmeyi okuyup elektronik ortamda onayladıktan ve ödeme işlemi başarıyla tamamlandıktan sonra sözleşme kurulur. Sağlayıcı, sözleşmenin kurulduğunu ve siparişin alındığını kalıcı veri saklayıcısı yoluyla Alıcı'ya bildirir.",
          "Alıcı, ödeme yükümlülüğü doğuran sipariş düğmesine basmadan önce siparişin ücretli olduğunu, toplam bedeli ve sözleşmenin temel unsurlarını gördüğünü kabul eder.",
        ],
      },
      {
        heading: "4. Fiyat ve Ödeme",
        paragraphs: [
          "4.1. Ürün veya hizmetin tüm vergiler dâhil toplam fiyatı ödeme sayfasında gösterilir.",
          "4.2. Ödeme, sitede sunulan banka/kredi kartı veya diğer ödeme yöntemlerinden biriyle yapılır. Ödeme işlemleri üçüncü taraf ödeme kuruluşları tarafından yürütülebilir.",
          "4.3. Banka veya ödeme kuruluşunun işlemi reddetmesi hâlinde sipariş tamamlanmaz.",
          "4.4. Aboneliğin otomatik yenilenmesi söz konusuysa yenileme dönemi, yenileme bedeli ve iptal yöntemi satın alma ekranında açıkça gösterilir. Otomatik yenileme, Alıcı'nın ayrı ve açık onayı olmadan etkinleştirilmez.",
          "4.5. Kampanya, indirim ve kuponlar yalnızca açıklanan süre ve koşullarda geçerlidir; nakde çevrilemez.",
        ],
      },
      {
        heading: "5. Teslim ve İfa",
        paragraphs: [
          "5.1. Dijital içerik veya abonelik erişimi, ödeme onayından sonra kullanıcı hesabında etkinleştirilir veya kayıtlı e-posta adresine erişim bilgisi gönderilir.",
          "5.2. Canlı dersler, satın alma ekranında belirtilen gün ve saatlerde çevrim içi olarak gerçekleştirilir. Bağlantı bilgileri kullanıcı paneli veya e-posta üzerinden paylaşılır.",
          "5.3. Alıcı, hizmetten yararlanmak için gerekli internet bağlantısı, uyumlu cihaz, güncel tarayıcı, mikrofon ve gerektiğinde kamera gibi teknik imkânları kendisi sağlar.",
          "5.4. Planlı bakım, güvenlik güncellemesi veya zorunlu teknik çalışma nedeniyle kısa süreli erişim kesintileri yaşanabilir. Sağlayıcı makul ölçüde önceden bilgilendirme yapmaya ve hizmet sürekliliğini sağlamaya çalışır.",
        ],
      },
      {
        heading: "6. Cayma Hakkı",
        paragraphs: [
          "6.1. Alıcı, mevzuatta öngörülen istisnalar saklı kalmak üzere, mesafeli hizmet sözleşmesinin kurulduğu tarihten itibaren on dört gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.",
          "6.2. Cayma bildirimi, süre dolmadan önce {{EPOSTA}} adresine veya {{ADRES}} adresine açık bir beyanla gönderilmelidir. Bildirimde ad-soyad, sipariş numarası, satın alınan hizmet ve iletişim bilgileri bulunmalıdır.",
          "6.3. Cayma hakkının geçerli biçimde kullanılması hâlinde, mevzuatta belirlenen süre ve yönteme uygun olarak tahsil edilen bedel iade edilir.",
        ],
      },
      {
        heading: "7. Cayma Hakkının İstisnaları ve Dijital İçerik",
        paragraphs: [
          "Aşağıdaki hâllerde, ilgili mevzuatın izin verdiği ölçüde cayma hakkı kullanılamaz:",
          "• Alıcı'nın önceden açık onayıyla cayma süresi dolmadan ifasına başlanan ve Alıcı'nın cayma hakkını kaybedeceğini kabul ettiği hizmetler,",
          "• elektronik ortamda anında ifa edilen hizmetler,",
          "• tüketiciye anında teslim edilen gayrimaddi mallar ve erişime açılan dijital içerikler,",
          "• belirli bir tarihte veya dönemde yapılması gereken ve rezervasyon/kontenjan ayrılan canlı dersler bakımından mevzuatta öngörülen istisnalar.",
          "Dijital içeriğin veya hizmetin cayma süresi içinde hemen başlaması isteniyorsa ödeme öncesinde Alıcı'dan, önceden işaretlenmemiş ayrı bir kutuyla şu onay alınır ve işlem kaydı saklanır:",
          "> “Satın aldığım dijital içerik/hizmetin on dört günlük cayma süresi dolmadan hemen sunulmasına açıkça onay veriyorum. İfanın veya dijital erişimin başlamasıyla, mevzuatın öngördüğü hâllerde cayma hakkımı kaybedebileceğim konusunda bilgilendirildim.”",
        ],
      },
      {
        heading: "8. Canlı Ders İptali ve Değişiklik",
        paragraphs: [
          "8.1. Canlı derslere ilişkin iptal, erteleme ve telafi koşulları satın alma ekranında ayrıca belirtilir.",
          "8.2. Sağlayıcı kaynaklı iptal hâlinde Alıcı'ya telafi dersi, uygun başka oturum veya kullanılmayan hizmete karşılık gelen bedel iadesi seçeneklerinden uygun olanı sunulur.",
          "8.3. Alıcı'nın derse katılmaması, bağlantıyı zamanında açmaması veya kendi cihazı/internetinden kaynaklanan sorunlar, aksi paket koşullarında belirtilmedikçe Sağlayıcı kaynaklı iptal sayılmaz.",
          "8.4. Grup derslerinde asgari katılımcı sayısına ulaşılamaması hâlinde ders ertelenebilir, başka gruba aktarım önerilebilir veya ilgili bedel iade edilebilir.",
        ],
      },
      {
        heading: "9. İçerik Kullanım Lisansı ve Fikri Haklar",
        paragraphs: [
          "9.1. Satın alınan içerikler Alıcı'ya yalnızca kişisel, sınırlı, devredilemez ve ticari olmayan kullanım hakkı verir.",
          "9.2. İçeriklerin çoğaltılması, ekran kaydı alınması, paylaşılması, yeniden satılması, toplu hesap kullanımı, kamuya iletilmesi veya üçüncü kişilere erişim sağlanması yasaktır.",
          "9.3. Bu yükümlülüklerin ihlali hâlinde erişim askıya alınabilir veya sonlandırılabilir; Sağlayıcı'nın yasal hakları saklıdır.",
        ],
      },
      {
        heading: "10. Ayıplı Hizmet ve Destek",
        paragraphs: [
          "Alıcı, hizmetin sözleşmeye aykırı veya teknik olarak kullanılamaz olduğunu düşünüyorsa {{EPOSTA}} üzerinden destek talebi oluşturabilir. Sağlayıcı talebi inceleyerek erişimin yeniden sağlanması, hatanın giderilmesi, telafi veya mevzuatın gerektirdiği diğer çözümleri sunar.",
          "Netfener; belirli bir sınav puanı, yerleştirme, kabul, akademik başarı veya iş sonucu garanti etmez. Sonuçlar öğrencinin başlangıç seviyesi, çalışması, devamlılığı ve sınav koşulları dâhil birçok etkene bağlıdır.",
        ],
      },
      { heading: "11. Mücbir Sebep", paragraphs: ["Doğal afet, salgın, savaş, kamu otoritesi kararı, genel internet/altyapı arızası, siber saldırı veya tarafların makul kontrolü dışında gelişen benzeri olaylar nedeniyle yükümlülüğün yerine getirilememesi hâlinde etkilenen yükümlülük olay süresince askıya alınabilir. Taraflar zararı azaltmak için makul çabayı gösterir."] },
      { heading: "12. Kişisel Veriler", paragraphs: ["Kişisel veriler, Netfener Aydınlatma Metni ve ilgili mevzuata uygun olarak işlenir. Ödeme kartı bilgileri Netfener tarafından saklanmaz; ödeme kuruluşunun güvenli altyapısında işlenir."] },
      { heading: "13. Başvuru ve Uyuşmazlık Çözümü", paragraphs: ["Alıcı, talep ve şikâyetlerini {{EPOSTA}} ve {{TELEFON}} üzerinden iletebilir. Tüketici uyuşmazlıklarında, parasal sınırlar çerçevesinde tüketici hakem heyetine; tüketici mahkemelerinde dava açılmadan önce mevzuatın öngördüğü hâllerde arabuluculuğa ve ardından tüketici mahkemesine başvurulabilir."] },
      { heading: "14. Yürürlük", paragraphs: ["Alıcı, sipariş vermeden önce Ön Bilgilendirme Formu'nu ve bu sözleşmeyi okuyup kabul ettiğini elektronik ortamda beyan eder. Sözleşme, siparişin onaylandığı tarihte yürürlüğe girer."] },
    ],
  },

  "uyelik-sozlesmesi": {
    title: "Üyelik Sözleşmesi",
    updatedAt: UPDATED,
    draft: false,
    body: "Bu Üyelik Sözleşmesi, Netfener'i işleten {{UNVAN}} (“Netfener”) ile netfener.com üzerinde hesap oluşturan kullanıcı (“Üye”) arasında kurulur. Üye, kayıt sırasında sözleşmeyi okuyup onaylayarak hükümleri kabul eder.",
    sections: [
      { heading: "1. Hizmetin Kapsamı", paragraphs: ["Netfener; İngilizce sınavlarına hazırlık içerikleri, konu anlatımları, soru ve deneme sistemleri, performans raporları, dijital materyaller, abonelikler ve canlı çevrim içi dersler sunabilir. Bazı hizmetler ücretsiz, bazıları ücretli olabilir. Güncel kapsam ilgili ürün veya paket sayfasında belirtilir."] },
      {
        heading: "2. Üyelik Şartları",
        paragraphs: [
          "2.1. Üye doğru, eksiksiz ve güncel bilgi vermelidir.",
          "2.2. On sekiz yaşından küçük kullanıcılar, üyelik ve ücretli satın alma işlemlerini veli/yasal temsilci gözetimi ve onayıyla gerçekleştirmelidir.",
          "2.3. Her üyelik kişiye özeldir. Hesabın paylaşılması, satılması, kiralanması veya üçüncü kişiye kullandırılması yasaktır.",
          "2.4. Üye, şifresinin gizliliğinden ve hesabı üzerinden yapılan işlemlerden sorumludur. Yetkisiz kullanım şüphesini derhâl Netfener'e bildirmelidir.",
        ],
      },
      {
        heading: "3. Kullanım Kuralları",
        paragraphs: [
          "Üye;",
          "• platformu hukuka ve amacına uygun kullanmayı,",
          "• sınav, soru bankası, video, ders notu ve diğer içerikleri kopyalamamayı veya dağıtmamayı,",
          "• otomatik veri çekme, bot, kazıma, tersine mühendislik veya güvenlik aşma yöntemleri kullanmamayı,",
          "• başka kullanıcıları rahatsız etmemeyi, canlı derslerde saygılı davranmayı,",
          "• öğretmenlerin veya diğer öğrencilerin görüntü/ses kaydını izinsiz almamayı,",
          "• hesabına veya platforma zararlı yazılım yüklememeyi",
          "kabul eder.",
        ],
      },
      {
        heading: "4. Ücretli Hizmetler ve Abonelik",
        paragraphs: [
          "4.1. Ücretli hizmetlerin bedeli, süresi, kapsamı ve yenileme koşulları satın alma sayfasında gösterilir.",
          "4.2. Üyelik hesabının ücretsiz olması, ücretli içeriklere otomatik erişim sağlamaz.",
          "4.3. Abonelik otomatik yenileniyorsa Üye, yenileme tarihinden önce hesabından iptal edebilir. İptal, aksi açıkça belirtilmedikçe mevcut ücretli dönemin sonunda yürürlüğe girer.",
          "4.4. Satın alma işlemleri ayrıca Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'na tabidir.",
        ],
      },
      { heading: "5. Canlı Dersler", paragraphs: ["Üye canlı derse zamanında, uygun cihaz ve bağlantıyla katılmalıdır. Ders bağlantısını üçüncü kişilerle paylaşamaz. Grup derslerinde eğitimin düzeni için kamera/mikrofon kullanım kuralları öğretmen tarafından belirlenebilir. Ders kayıt altına alınacaksa katılımcılara önceden bilgi verilir ve gerekli hukuki şartlar sağlanır."] },
      { heading: "6. Fikri Mülkiyet", paragraphs: ["Netfener markası, yazılımı, tasarımı, metinleri, videoları, soruları, denemeleri, grafik ve diğer içerikleri üzerindeki fikri ve sınai haklar Netfener'e veya ilgili hak sahiplerine aittir. Üyeye yalnızca üyelik veya satın alma süresince kişisel kullanım izni verilir."] },
      { heading: "7. Hizmet Değişiklikleri", paragraphs: ["Netfener, hizmet kalitesini ve güvenliği korumak amacıyla teknik özelliklerde ve ücretsiz içeriklerde değişiklik yapabilir. Ücretli bir paketin temel niteliğini Üye aleyhine önemli ölçüde etkileyen değişikliklerde Üye bilgilendirilir ve mevzuattan doğan hakları korunur."] },
      {
        heading: "8. Hesabın Askıya Alınması veya Sonlandırılması",
        paragraphs: [
          "Netfener; güvenlik riski, ödeme sahteciliği, hesap paylaşımı, telif ihlali, kötüye kullanım veya sözleşmeye aykırılık hâlinde hesabı geçici olarak askıya alabilir. Ağır veya tekrarlanan ihlallerde hesap sonlandırılabilir. Mümkün olan hâllerde Üye'ye gerekçe ve itiraz kanalı bildirilir.",
          "Üye, hesabının silinmesini hesabındaki ayarlar veya {{EPOSTA}} üzerinden talep edebilir. Kanuni saklama yükümlülükleri kapsamındaki kayıtlar gerekli süre boyunca saklanabilir.",
        ],
      },
      { heading: "9. Sorumluluk Sınırları", paragraphs: ["Netfener belirli bir sınav sonucunu garanti etmez. Kesintisiz ve hatasız hizmet için makul önlemler alınır; ancak üçüncü taraf altyapı, internet, kullanıcı cihazı veya mücbir sebeplerden doğan kesintilerden kanunen izin verilen ölçüde sorumlu tutulamaz. Emredici tüketici hukuku hükümleri saklıdır."] },
      { heading: "10. Bildirimler", paragraphs: ["Üyelik ve hizmet bildirimleri, Üye'nin kayıtlı e-posta adresine veya kullanıcı paneline gönderilebilir. Ticari elektronik iletiler yalnızca mevzuata uygun onay bulunduğunda gönderilir; Üye dilediği zaman ileti tercihlerini değiştirebilir."] },
      { heading: "11. Uygulanacak Hukuk", paragraphs: ["Sözleşmeye Türkiye Cumhuriyeti hukuku uygulanır. Tüketici sıfatını taşıyan Üye'nin emredici tüketici mevzuatından doğan hakları saklıdır."] },
      { heading: "12. Yürürlük", paragraphs: ["Bu sözleşme, Üye'nin kayıt sırasında onay vermesiyle yürürlüğe girer."] },
    ],
  },

  "gizlilik-sozlesmesi": {
    title: "Gizlilik Politikası",
    updatedAt: UPDATED,
    draft: false,
    body: "Bu Gizlilik Politikası, Netfener web sitesi ve hizmetleri kullanılırken kişisel bilgilerin nasıl ele alındığını, platform güvenliğini ve kullanıcıların gizlilik tercihlerini genel olarak açıklar. KVKK kapsamındaki ayrıntılı veri işleme bilgileri için ayrıca Aydınlatma Metni incelenmelidir.",
    sections: [
      {
        heading: "1. Toplanan Bilgi Türleri",
        paragraphs: [
          "Netfener aşağıdaki bilgi türlerini işleyebilir:",
          "• hesap bilgileri: ad, soyad, e-posta, telefon, şifrelenmiş parola,",
          "• profil ve eğitim bilgileri: hedef sınav, seviye, çalışma tercihleri,",
          "• işlem bilgileri: sipariş, abonelik, fatura, ödeme durumu,",
          "• öğrenme verileri: çözülen sorular, yanıtlar, puanlar, ilerleme ve performans raporları,",
          "• canlı ders bilgileri: rezervasyon, katılım ve ders iletişim kayıtları,",
          "• teknik veriler: IP adresi, cihaz, tarayıcı, oturum ve güvenlik kayıtları,",
          "• destek bilgileri: talep, şikâyet ve yazışmalar,",
          "• pazarlama tercihleri: ticari ileti onayı ve kanal tercihleri.",
          "Netfener, ödeme kartı numarasını saklamaz; ödeme bilgileri yetkili ödeme hizmet sağlayıcısı tarafından işlenir.",
        ],
      },
      { heading: "2. Bilgilerin Kullanım Amaçları", paragraphs: ["Bilgiler; hesap oluşturma, kimlik ve oturum güvenliği, satın alma ve ödeme süreçleri, içerik erişimi, ders planlama, kişiselleştirilmiş çalışma önerileri, performans raporlama, müşteri desteği, dolandırıcılığın önlenmesi, yasal yükümlülüklerin yerine getirilmesi ve izin verilmişse pazarlama iletişimi amaçlarıyla kullanılabilir."] },
      {
        heading: "3. Çerezler",
        paragraphs: [
          "Netfener;",
          "• oturum açma ve güvenlik için zorunlu çerezler,",
          "• tercihlerin hatırlanması için işlevsel çerezler,",
          "• performansın ölçülmesi için analitik çerezler,",
          "• açık onay bulunduğunda reklam/pazarlama çerezleri",
          "kullanabilir. Zorunlu olmayan çerezler, kullanıcının tercihine göre etkinleştirilir. Ayrıntılar Çerez Politikası'nda yer alır.",
        ],
      },
      {
        heading: "4. Üçüncü Taraf Hizmetleri",
        paragraphs: [
          "Barındırma, veri tabanı, ödeme, e-posta, canlı ders, analiz ve müşteri desteği için üçüncü taraf hizmetlerden yararlanılabilir. Bu sağlayıcılarla yalnızca hizmet için gerekli veriler paylaşılır ve uygun veri güvenliği sözleşmeleri yapılır.",
          "Yurt dışındaki bir hizmet sağlayıcının kullanılması hâlinde, kişisel veri aktarımı yürürlükteki KVKK yurt dışı aktarım şartlarına uygun hukuki mekanizmaya dayandırılır. Kullanılan sağlayıcılar Aydınlatma Metni'nde listelenir.",
        ],
      },
      { heading: "5. Güvenlik", paragraphs: ["Netfener; erişim kontrolü, şifreleme, güvenli bağlantı, kayıt tutma, yedekleme ve yetki sınırlandırması gibi makul teknik ve idari önlemler uygular. Buna rağmen internet üzerinden veri aktarımının mutlak biçimde risksiz olmadığı unutulmamalıdır."] },
      { heading: "6. Saklama ve Silme", paragraphs: ["Bilgiler, işleme amacı ve yasal yükümlülük için gerekli süre boyunca saklanır. Süre sona erdiğinde kişisel veriler ilgili mevzuata uygun şekilde silinir, yok edilir veya anonim hâle getirilir."] },
      { heading: "7. Çocukların Gizliliği", paragraphs: ["On sekiz yaşından küçük kullanıcıların ücretli işlem yapması veli/yasal temsilci gözetimine tabidir. Çocuklara ait veriler yalnızca hizmet için gerekli ölçüde ve uygun koruma tedbirleriyle işlenir. Çocuklara yönelik pazarlama yapılmaz ve gereksiz profil oluşturulmaz."] },
      { heading: "8. Kullanıcı Tercihleri", paragraphs: ["Kullanıcılar hesap bilgilerini güncelleyebilir, pazarlama iletilerinden çıkabilir, çerez tercihlerini değiştirebilir ve KVKK kapsamındaki haklarını kullanmak için Netfener'e başvurabilir."] },
      { heading: "9. Değişiklikler ve İletişim", paragraphs: ["Politika güncellendiğinde yeni sürüm bu sayfada yayımlanır; önemli değişiklikler uygun kanallardan duyurulur. Sorular için: {{EPOSTA}}, {{TELEFON}}, {{ADRES}}."] },
    ],
  },

  "aydinlatma-metni": {
    title: "KVKK Aydınlatma Metni",
    updatedAt: UPDATED,
    draft: false,
    body: "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla aşağıda bilgileri yer alan işletme tarafından işlenmektedir.",
    sections: [
      { heading: "1. Veri Sorumlusu", paragraphs: ["• Veri sorumlusu: {{UNVAN}}", "• Marka: Netfener", "• Adres: {{ADRES}}", "• E-posta: {{EPOSTA}}", "• Telefon: {{TELEFON}}"] },
      {
        heading: "2. İşlenen Kişisel Veri Kategorileri",
        paragraphs: [
          "Faaliyetin niteliğine göre aşağıdaki veriler işlenebilir:",
          "• Kimlik: ad, soyad, doğum yılı/yaş bilgisi gerektiği ölçüde,",
          "• İletişim: e-posta, telefon, adres,",
          "• Müşteri işlem: sipariş, abonelik, paket, fatura ve talep kayıtları,",
          "• Finans: ödeme durumu, işlem ve iade bilgileri; kart bilgilerinin tamamı ödeme kuruluşu tarafından işlenir,",
          "• Eğitim ve kullanım: hedef sınav, seviye, soru yanıtları, sonuçlar, çalışma ilerlemesi,",
          "• İşlem güvenliği: IP, cihaz, tarayıcı, giriş ve hata kayıtları,",
          "• Görsel/işitsel: yalnızca kayıt alınan çevrim içi ders veya destek görüşmelerinde, önceden bilgi verilmesi ve uygun hukuki şart bulunması hâlinde,",
          "• Hukuki işlem: başvuru, ihtar, uyuşmazlık ve yasal takip kayıtları,",
          "• Pazarlama: ileti izinleri, kampanya etkileşimleri ve tercihler.",
        ],
      },
      {
        heading: "3. İşleme Amaçları",
        paragraphs: [
          "Kişisel verileriniz;",
          "• üyelik hesabının oluşturulması ve yönetilmesi,",
          "• kimlik doğrulama ve hesap güvenliği,",
          "• satın alma, abonelik, ödeme, faturalama ve iade süreçleri,",
          "• dijital içerik ve sınav sistemine erişim sağlanması,",
          "• canlı derslerin planlanması ve yürütülmesi,",
          "• öğrenci ilerlemesinin ve performansının raporlanması,",
          "• destek talep ve şikâyetlerinin sonuçlandırılması,",
          "• bilgi güvenliği, hata tespiti ve kötüye kullanımın önlenmesi,",
          "• hukuki ve mali yükümlülüklerin yerine getirilmesi,",
          "• açık rıza veya ilgili mevzuatta öngörülen başka bir şart bulunduğunda kampanya ve tanıtım iletilerinin gönderilmesi",
          "amaçlarıyla işlenir.",
        ],
      },
      {
        heading: "4. Hukuki Sebepler ve Toplama Yöntemi",
        paragraphs: [
          "Veriler; üyelik ve satın alma formları, kullanıcı paneli, ödeme ve ders sistemleri, destek kanalları, çerezler ve sistem kayıtları aracılığıyla otomatik veya kısmen otomatik yollarla toplanabilir.",
          "İşleme faaliyetleri, somut sürece göre KVKK'nın 5 ve 6'ncı maddelerinde yer alan;",
          "• sözleşmenin kurulması veya ifası için gerekli olma,",
          "• veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi,",
          "• bir hakkın tesisi, kullanılması veya korunması,",
          "• temel hak ve özgürlüklere zarar vermemek kaydıyla meşru menfaat,",
          "• kanunlarda açıkça öngörülme,",
          "• gerekli hâllerde ilgili kişinin açık rızası",
          "hukuki sebeplerine dayanır. Açık rıza, yalnızca gerçekten gerekli olan ve başka bir işleme şartına dayanmayan faaliyetler için ayrıca alınır.",
        ],
      },
      {
        heading: "5. Verilerin Aktarılması",
        paragraphs: [
          "Kişisel veriler, amaçla sınırlı ve gerekli ölçüde;",
          "• ödeme kuruluşlarına ve bankalara,",
          "• barındırma, veri tabanı, e-posta, analiz, canlı ders ve destek hizmeti sağlayıcılarına,",
          "• mali müşavir, avukat ve yetkili danışmanlara,",
          "• kanunen yetkili kamu kurumları ve adli mercilere",
          "aktarılabilir.",
          "Netfener'in hizmet sunmak için kullandığı başlıca sağlayıcılar şunlardır:",
          "• Vercel Inc. (ABD; sunucu bölgesi Frankfurt, Almanya): web sitesinin barındırılması,",
          "• Neon (veri tabanı; Frankfurt, Almanya): hesap, sipariş ve öğrenme verilerinin saklanması,",
          "• PayPal: kart ödemelerinin işlenmesi,",
          "• Resend (ABD): hesap, sipariş ve ders e-postalarının gönderilmesi,",
          "• Anthropic (ABD): öğrencinin istediği yapay zekâ destekli yazma ve hata açıklaması geri bildirimleri,",
          "• Tawk.to: canlı destek sohbeti,",
          "• Google (ABD): faturaların Google Drive'da arşivlenmesi ve canlı derslerde kullanılabilen Google Meet,",
          "• Zoom (ABD): canlı derslerde kullanılabilen görüntülü görüşme,",
          "• YouTube (Google): ders videolarının gizlilik geliştirilmiş modda gösterilmesi.",
          "Yurt dışına veri aktarımı, KVKK'nın güncel yurt dışı aktarım hükümlerinde yer alan uygun güvence veya diğer geçerli mekanizmalardan birine dayandırılır: [AKTARIM MEKANİZMASI — hukukçu tarafından belirlenecek].",
        ],
      },
      {
        heading: "6. Saklama Süreleri",
        paragraphs: [
          "Veriler, işleme amacı için gerekli süre ve tabi olunan mali, ticari ve hukuki saklama yükümlülükleri boyunca tutulur:",
          "• Üyelik ve hesap kayıtları: [HESAP AKTİF OLDUĞU SÜRE + YASAL SÜRE]",
          "• Sipariş, fatura ve ödeme kayıtları: [İLGİLİ MALİ MEVZUAT SÜRESİ]",
          "• Destek ve şikâyet kayıtları: [SÜRE]",
          "• Sistem güvenliği kayıtları: [SÜRE]",
          "• Pazarlama izin/ret kayıtları: [MEVZUATTAKİ SÜRE]",
          "Süre sonunda veriler silinir, yok edilir veya anonim hâle getirilir.",
        ],
      },
      {
        heading: "7. İlgili Kişinin Hakları",
        paragraphs: [
          "KVKK'nın 11'inci maddesi uyarınca veri sorumlusuna başvurarak;",
          "• kişisel verilerinizin işlenip işlenmediğini öğrenme,",
          "• işlenmişse buna ilişkin bilgi talep etme,",
          "• işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,",
          "• yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,",
          "• eksik veya yanlış işlenmişse düzeltilmesini isteme,",
          "• şartları oluşmuşsa silinmesini veya yok edilmesini isteme,",
          "• düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı kişilere bildirilmesini isteme,",
          "• yalnızca otomatik sistemlerle analiz sonucu aleyhe bir sonucun ortaya çıkmasına itiraz etme,",
          "• kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
          "haklarına sahipsiniz.",
        ],
      },
      {
        heading: "8. Başvuru Yöntemi",
        paragraphs: [
          "Başvurularınızı kimliğinizi doğrulamaya elverişli bilgilerle birlikte;",
          "• {{ADRES}} adresine yazılı olarak,",
          "• sistemde kayıtlı e-posta adresinizden {{EPOSTA}} adresine",
          "iletebilirsiniz. Başvuruda talep konusu açıkça belirtilmelidir. Başvurular, ilgili mevzuatta öngörülen süre içinde sonuçlandırılır.",
        ],
      },
    ],
  },

  "acik-riza-metni": {
    title: "Açık Rıza Metni",
    updatedAt: UPDATED,
    draft: false,
    body: "Aşağıdaki onaylar isteğe bağlıdır; üyelik veya satın alma için zorunlu değildir. Her biri ayrı ve önceden işaretlenmemiş kutularla alınır ve dilediğiniz zaman geri çekilebilir.",
    sections: [
      {
        heading: "A. Ticari Elektronik İleti Onayı",
        paragraphs: [
          "> Netfener'in kampanya, indirim, yeni içerik, sınav programı, ders ve hizmet duyurularını tercih ettiğim kanallardan göndermesine; bu amaçla ad, soyad, e-posta adresi, telefon numarası ve ileti tercihlerimin işlenmesine izin veriyorum. Bu onayı dilediğim zaman iletilerdeki ret bağlantısı, hesabımdaki iletişim tercihleri veya {{EPOSTA}} üzerinden geri çekebileceğimi biliyorum.",
          "Tercihler ayrı ayrı seçilir:",
          "• E-posta almak istiyorum.",
          "• SMS almak istiyorum.",
          "• Telefonla aranmak istiyorum.",
        ],
      },
      {
        heading: "B. Zorunlu Olmayan Analitik ve Kişiselleştirme Onayı",
        paragraphs: [
          "> Netfener'deki kullanım ve öğrenme davranışlarımın; çalışma önerilerinin kişiselleştirilmesi, platform performansının ölçülmesi ve hizmetlerin geliştirilmesi amacıyla zorunlu olmayan analitik teknolojiler kullanılarak işlenmesine izin veriyorum. Bu tercihi çerez ayarlarından dilediğim zaman değiştirebileceğimi biliyorum.",
        ],
      },
      { heading: "Rızanın Geri Çekilmesi", paragraphs: ["İlgili kişi, açık rızasını kullanıcı hesabındaki tercihlerden veya {{EPOSTA}} adresine başvurarak geleceğe etkili şekilde geri çekebilir. Geri çekme öncesindeki hukuka uygun işlemler etkilenmez. Rızanın geri çekilmesi, rızaya bağlı olmayan temel üyelik ve satın alma hizmetlerini engellemez."] },
    ],
  },
};
