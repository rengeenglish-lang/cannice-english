/**
 * Yardım Masası SSS. Every answer describes how the site actually behaves today (plans in
 * lib/plans.ts, monthly group billing in lib/billing.ts, PayPal + havale checkout, 14-day refund
 * window) — update it together with those rules.
 */
export type FaqCategory = { key: string; title: string; items: { q: string; a: string }[] };

export const HELP_FAQ: FaqCategory[] = [
  {
    key: "hesap",
    title: "Hesap ve Üyelik",
    items: [
      {
        q: "Nasıl üye olurum?",
        a: "Sağ üstteki “Üye Ol” butonuna tıklayın; adınızı, e-posta adresinizi ve bir şifre belirleyerek hesabınızı birkaç saniyede oluşturabilirsiniz. Üyelik ücretsizdir.",
      },
      {
        q: "Hesap bilgilerimi ve şifremi nasıl değiştiririm?",
        a: "Giriş yaptıktan sonra Çalışma Alanım → Hesap bilgilerim sayfasından ad, telefon ve eğitim bilgilerinizi güncelleyebilir, şifrenizi değiştirebilirsiniz.",
      },
      {
        q: "Şifremi unuttum, ne yapmalıyım?",
        a: "Yardım Masası üzerinden canlı destekle ya da e-postayla bize kayıtlı e-posta adresinizi iletin. Hesabın size ait olduğunu doğruladıktan sonra şifrenizi yenilemenize yardımcı oluyoruz.",
      },
      {
        q: "Neden oturumum kapandı?",
        a: "Güvenliğiniz için oturumlar 8 saat sonra otomatik olarak kapanır. Tekrar giriş yaptığınızda kaldığınız yerden devam edebilirsiniz; yarım kalan sınavlarınız kaybolmaz.",
      },
      {
        q: "Hesabımı silebilir miyim?",
        a: "Evet. Yardım Masası'na hesap silme talebinizi iletmeniz yeterlidir. Kişisel verileriniz KVKK kapsamında, yasal saklama yükümlülükleri dışında kalan kısmıyla silinir.",
      },
    ],
  },
  {
    key: "planlar",
    title: "Planlar",
    items: [
      {
        q: "Hangi planlar var, aralarındaki fark nedir?",
        a: "Üç plan sunuyoruz. Başlangıç: 10 deneme sınavı, konu anlatımı erişimi ve 1 aylık erişim (ek materyal ve kitaplar ayrı satın alınır). Çırak: tüm deneme sınavları, konu anlatımları, pratik sorular ve ücretsiz ek materyaller, 4 aylık erişim. Uzman: Çırak'taki her şeye ek olarak 1 ay ücretsiz konuşma kulübü, ücretsiz bir sistematik canlı ders ve istediğiniz bir canlı ders.",
      },
      {
        q: "Planım ne zaman başlar ve ne zaman biter?",
        a: "Planınız ödemeniz onaylandığı anda başlar. Süre takvim ayı olarak hesaplanır (örneğin 15 Mart'ta başlayan 1 aylık plan 15 Nisan'da biter). Bitiş tarihinizi Deneme Sınavı ve İlerleme Raporu sayfalarında görebilirsiniz.",
      },
      {
        q: "Planım otomatik olarak yenilenir mi?",
        a: "Hayır. Planlar tek seferlik ödemedir; kartınızdan otomatik çekim yapılmaz. Süre bitmeden aynı planı tekrar satın alırsanız yeni süre mevcut sürenizin sonuna eklenir.",
      },
      {
        q: "Planımı yükseltebilir miyim?",
        a: "Evet. Deneme Sınavı sayfasındaki plan kartlarından üst planı satın aldığınız anda yeni planın tüm özellikleri açılır. Kalan süreniz için kısmi iade veya mahsup yapılmaz; üst plan kendi süresiyle başlar.",
      },
      {
        q: "Başlangıç planındaki 10 deneme nasıl sayılır?",
        a: "Her yeni deneme başlatışınız bir hak kullanır; aynı denemeyi tekrar çözmek de yeni bir başlangıç sayılır. Yarım bıraktığınız bir denemeye devam etmek hak düşürmez. Kalan hakkınızı Deneme Sınavı sayfasında görebilirsiniz.",
      },
      {
        q: "Uzman plandaki ücretsiz canlı ders haklarını nasıl kullanırım?",
        a: "Grup dersleri takviminden bir ders saati seçin; ders sayfasında “Uzman planınla ücretsiz katıl” butonunu göreceksiniz. Konuşma kulübü, sistematik canlı ders ve istediğiniz canlı ders haklarının her biri bir kez ve bir aylık dönem için kullanılır. Ücretsiz ayın sonunda gruba devam etmek isterseniz aylık ödemeyle devam edebilirsiniz.",
      },
      {
        q: "Konu anlatımları ücretli mi?",
        a: "Her sınavın ilk konusunu ücretsiz önizleme olarak inceleyebilirsiniz. Tüm konu anlatımlarına erişim Başlangıç, Çırak ve Uzman planlarının hepsine dahildir.",
      },
    ],
  },
  {
    key: "odemeler",
    title: "Ödemeler",
    items: [
      {
        q: "Hangi ödeme yöntemlerini kullanabilirim?",
        a: "PayPal (PayPal hesabınız veya banka/kredi kartınızla) ve banka havalesi ile ödeme yapabilirsiniz. Fiyatlar Türk lirası olarak ve KDV dahil gösterilir. PayPal ödemelerinde tutar, gösterilen TL fiyatın güncel kur üzerinden ABD doları karşılığı olarak tahsil edilir; bankanız ayrıca kur farkı veya işlem ücreti yansıtabilir.",
      },
      {
        q: "Banka havalesiyle ödeme nasıl işliyor?",
        a: "Ödeme adımında “Banka Havalesi”ni seçtiğinizde siparişiniz “ödeme bekleniyor” durumunda oluşturulur ve ekibimiz havale bilgileri için sizinle iletişime geçer. Ödemeniz hesabımıza ulaşıp onaylandığında erişiminiz açılır ve size bildirim gönderilir.",
      },
      {
        q: "Canlı grup derslerinin ödemesi nasıl yapılır?",
        a: "Grup dersleri aylık ücretlidir. İlk ödemeniz “Gruba Katıl” butonuyla yapılır. Her ödeme bir takvim ayını kapsar (ayın uzunluğuna göre 30 veya 31 gün). Ay dolduğunda size bildirim gönderilir; bildirimden sonraki 1 gün içinde ödeme yapılmazsa canlı derse katılım butonu devre dışı kalır ve yerine “Devam etmek için öde” butonu çıkar. Ödemenizi yaptığınız anda erişiminiz yeniden açılır.",
      },
      {
        q: "Kupon kodumu nereye yazacağım?",
        a: "Ödeme sayfasındaki “Kupon Kodu” alanına kodu yazarak siparişi tamamlayın; indirim toplam tutardan düşülür. Güncel kampanyaları İndirimlerim sayfasında görebilirsiniz.",
      },
      {
        q: "Faturamı veya makbuzumu nereden alırım?",
        a: "Siparişlerim sayfasından ilgili siparişin makbuzunu görüntüleyip yazdırabilirsiniz. Kurumsal fatura ihtiyacınız varsa Yardım Masası'na yazın.",
      },
      {
        q: "Plan veya grup dersi almak için üye olmam gerekiyor mu?",
        a: "Evet. Planlar ve canlı grup dersleri hesabınıza tanımlandığı için ödeme öncesinde giriş yapmanız gerekir. Kitap gibi ürünleri üye olmadan da satın alabilirsiniz.",
      },
    ],
  },
  {
    key: "iadeler",
    title: "İadeler",
    items: [
      {
        q: "İade hakkım var mı?",
        a: "Başlangıç planı ve ayrı satın alınan konu anlatımları için 7 gün; Çırak ve Uzman planları için 14 gün içinde iade talep edebilirsiniz. Süre ödemenin onaylandığı tarihten itibaren hesaplanır. Plan kapsamında erişilen tüm içeriklerde yalnızca planın iade koşulları geçerlidir. Ayrı satın alınan kaynaklar ve kitaplarda isteğe bağlı iade yoktur; yasal haklar saklıdır. Ayrıntılar İade Politikası sayfamızdadır.",
      },
      {
        q: "İade talebini nasıl oluştururum?",
        a: "Yardım Masası'ndaki canlı destekten ya da e-postayla sipariş numaranızı ve iade gerekçenizi iletin. Sipariş numaranızı Siparişlerim sayfasında bulabilirsiniz.",
      },
      {
        q: "Param ne zaman ve nasıl iade edilir?",
        a: "İade koşullarını karşılayan tüm başvurularda iadeler, talebin bize ulaştığı tarihten itibaren en geç 7 takvim günü içinde, ödemeyi yaptığınız yöntemle yapılır: PayPal ödemeleri PayPal hesabınıza/kartınıza, havale ödemeleri bildirdiğiniz IBAN'a gönderilir. İnceleme ve onay bu süreyi yeniden başlatmaz. İade tamamlandığında ilgili plan, ders veya ürüne erişiminiz kapatılır.",
      },
      {
        q: "Canlı grup dersi ödemem iade edilir mi?",
        a: "Ayrı satın alınan canlı grup derslerinde aylık ödeme, ödeme tarihinden itibaren 14 gün içinde iade edilebilir; o döneme ait gerçekleşmiş derslerin bedeli düşülerek kalan tutar iade edilir. Plan kapsamında sunulan canlı grup derslerinde ise yalnızca planın iade koşulları uygulanır.",
      },
    ],
  },
  {
    key: "canli-dersler",
    title: "Canlı Dersler",
    items: [
      {
        q: "Bir gruba nasıl katılırım?",
        a: "Grup Dersleri takviminden size uygun ders saatini seçin ve “Gruba Katıl” butonuna tıklayın. Ödemeniz onaylandığında seçtiğiniz ders ve grubun sonraki haftalık dersleri Canlı Derslerim sayfanıza otomatik olarak eklenir.",
      },
      {
        q: "Derse nasıl bağlanırım?",
        a: "Canlı Derslerim sayfasında her dersin yanında “Derse Katıl” butonu bulunur. Buton, ders başlamadan 30 dakika önce aktif olur ve sizi eğitmenin paylaştığı çevrim içi ders odasına götürür.",
      },
      {
        q: "Öğretmenime nasıl ulaşırım?",
        a: "Canlı Derslerim sayfasındaki “Öğretmenine mesaj gönder” butonuyla sorunuzu doğrudan grubunuzun öğretmenine iletebilirsiniz. Yanıt geldiğinde bildirim alırsınız; tüm mesajlarınızı Mesajlarım sayfasında görebilirsiniz.",
      },
      {
        q: "Grup dolarsa ne olur?",
        a: "Her grubun sınırlı bir kontenjanı vardır. Dolu bir gruba kayıt alınmaz; ders sayfasında size en yakın uygun saatler önerilir. Ödeme ile onay arasında kontenjan dolarsa ödemeniz geçerli kalır ve başka bir saat seçmeniz için bilgilendirilirsiniz.",
      },
      {
        q: "Kaçırdığım dersin kaydını izleyebilir miyim?",
        a: "Ders kayıtlarının paylaşılıp paylaşılmadığı grubun kapsamına bağlıdır ve grup sayfasında belirtilir. Kaydı paylaşılan dersler grup sayfanızda yer alır.",
      },
    ],
  },
  {
    key: "seviye-tespit",
    title: "Seviye Tespit Sınavları",
    items: [
      {
        q: "Seviye tespit sınavı ücretli mi?",
        a: "Hayır, seviye tespit sınavları tüm üyelerimiz için ücretsizdir.",
      },
      {
        q: "Hangi seviye testleri var?",
        a: "Seviye Tespit → Yeni Test bölümünde iki seçenek bulunur: IELTS / TOEFL / PTE seviye testi (sonuç CEFR seviyesi olarak, A1–C2 aralığında gösterilir) ve YDS & YÖKDİL seviye testi (kelime, dil bilgisi, çeviri ve okuma konularındaki eksiklerinizi gösterir).",
      },
      {
        q: "Sonucum resmî bir sınav puanı mı?",
        a: "Hayır. Seviye tespit sonucu, eksiklerinizi belirlemek ve size doğru çalışma planını önermek için hesaplanan tahmini bir göstergedir; resmî bir sınav sonucu veya sertifika yerine geçmez.",
      },
      {
        q: "Aynı testi tekrar çözebilir miyim?",
        a: "Evet. Seviye Tespit → Tekrar Çöz bölümünden daha önce çözdüğünüz bir testi aynı sorularla yeniden çözebilir, gelişiminizi Sonuçlar ve Analiz sayfasında karşılaştırabilirsiniz.",
      },
      {
        q: "Sınavın ortasında çıkarsam ne olur?",
        a: "Her cevabınız anında kaydedilir. Seviye Tespit sayfasına döndüğünüzde “Kaldığın Yerden Devam Et” ile devam edebilirsiniz.",
      },
    ],
  },
  {
    key: "teknik",
    title: "Teknik Sorunlar",
    items: [
      {
        q: "Hangi tarayıcıları kullanabilirim?",
        a: "Chrome, Edge, Safari ve Firefox'un güncel sürümlerini öneriyoruz. Konuşma pratiği için mikrofon erişimine izin vermeniz ve Chrome ya da Edge kullanmanız en iyi sonucu verir.",
      },
      {
        q: "Deneme sınavı sırasında internetim koptu, ne olur?",
        a: "Verdiğiniz cevaplar her soruda kaydedilir. Bağlantınız geldiğinde sınava kaldığınız yerden devam edebilirsiniz. Deneme sınavlarında süre gerçek sınavdaki gibi işlemeye devam eder; süre dolduğunda sınav o ana kadarki cevaplarınızla otomatik olarak tamamlanır.",
      },
      {
        q: "Video açılmıyor veya sayfa düzgün yüklenmiyor.",
        a: "Sayfayı yenileyin, tarayıcı önbelleğini temizleyin veya farklı bir tarayıcı deneyin. Reklam engelleyici eklentiler bazı içerikleri engelleyebilir. Sorun devam ederse kullandığınız cihaz ve tarayıcı bilgisiyle birlikte bize yazın.",
      },
      {
        q: "Ödeme yaptım ama erişimim açılmadı.",
        a: "PayPal ödemelerinde erişim anında açılır; havale ödemelerinde ödemenin onaylanması gerekir. Siparişlerim sayfasında siparişinizin durumunu kontrol edin; “Ödendi” görünmesine rağmen erişiminiz yoksa sipariş numaranızla bize yazın.",
      },
      {
        q: "Bildirimleri nereden görebilirim?",
        a: "Ödeme onayları, grup dersi ödeme hatırlatmaları ve öğretmen yanıtları gibi tüm bildirimler hesabınızdaki bildirimler bölümünde listelenir.",
      },
    ],
  },
];
