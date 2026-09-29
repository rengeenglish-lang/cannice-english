/**
 * Long-form sales copy for the e-book pages. Every claim here describes something a
 * reader can find in that book: counts come from the PDF, feature names from its pages.
 */
export type EbookFact = { label: string; value: string };
export type EbookSection = { title: string; body: string; bullets?: readonly string[] };
export type EbookPitch = {
  lead: string;
  facts: readonly EbookFact[];
  sections: readonly EbookSection[];
  closing: string;
};

export const NETFENER_EBOOK_PITCH: Record<string, EbookPitch> = {
  "cumlenin-icini-gor": {
    lead: "Cümlenin İçini Gör, YDS ve YÖKDİL'in dilbilgisi sorularını ezberle değil, cümlenin yapısını görerek çözmek için hazırlandı. Kitabın tek bir iddiası var: kelimelerin arasında kaybolmadan önce cümlenin motorunu gör.",
    facts: [
      { label: "Sayfa", value: "144" },
      { label: "Modül", value: "17" },
      { label: "Adım", value: "9" },
      { label: "Format", value: "PDF" },
    ],
    sections: [
      {
        title: "Tanı testiyle başlar, rotanı sana çizer",
        body: "Kitap 00. modülde sınavın mantığını ve bir tanı testini verir. Testin sonucu, hangi modülden başlayacağını gösteren kişisel bir rotaya dönüşür. Baştan sona okumak zorunda değilsin; en çok kaybettiğin yapıdan başlayabilirsin.",
      },
      {
        title: "On yedi durak, tek sistem",
        body: "00 başlangıç modülü ve 16 konu modülü, YDS ve YÖKDİL'de puan getiren yapıları sırayla ele alır. Her modülün adı, o yapının sınavdaki işini anlatır:",
        bullets: [
          "Cümlenin Motoru — özne-yüklem uyumu ve cümle iskeleti",
          "Zaman Makinesi — Present Perfect ile Past Simple ayrımı ve ötesi",
          "Görünmez Özne — edilgen yapı ve modal + pasif",
          "Anlam Savaşları — zıtlık, sebep, koşul, amaç, sonuç ve zaman ilişkileri",
          "Sessiz Tuzaklar — bağımlı edatlar",
          "İhtimaller Dünyası — şart cümleleri ve mixed conditionals",
        ],
      },
      {
        title: "Gör • Çöz • Hatırla",
        body: "Her modül aynı üç hamleyi tekrarlar: yapıyı görsel olarak göster, sınav sorusunda çöz, sonra hatırlamayı kolaylaştıracak biçimde özetle. Dokuz adımlık bu sistem, kitabın sonuna kadar değişmez; bu yüzden onuncu modüle geldiğinde ne yapacağını zaten biliyorsundur.",
      },
      {
        title: "Karma kontrolle biter",
        body: "Modüller bittiğinde yapılar karışık sırayla önüne gelir. Gerçek sınavda da soru tipini kimse söylemez; karma kontrol, tanıdığın yapıyı adıyla çağırabildiğini ölçer.",
      },
    ],
    closing: "Dilbilgisini konu konu bilen ama sınavda hâlâ iki şık arasında kalanlar için yazıldı.",
  },

  "kelimenin-izini-sur": {
    lead: "Kelimenin İzini Sür, akademik İngilizcenin en çok iş gören kelimelerini tek tek ezberletmek yerine ailesiyle, göreviyle ve sınavdaki doğal eşiyle öğretir. Bir kelimeyi bildiğini, onu cümlede doğru biçimiyle seçebildiğinde anlarsın.",
    facts: [
      { label: "Sayfa", value: "282" },
      { label: "Ünite", value: "25" },
      { label: "Kelime ailesi", value: "125" },
      { label: "Çalışma sayfası", value: "250" },
    ],
    sections: [
      {
        title: "Beş aile, on sayfa, bir tema",
        body: "Her ünite beş kelime ailesini bir temanın altında toplar ve on sayfa sürer. Üniteler rastgele dizilmez; akademik bir metnin kurulma sırasını izler: önce sistemi tanımla, sonra veriyi oku, iddianı kur, argümanı yapılandır ve sonuca var.",
      },
      {
        title: "Netfener Kelime Rotası",
        body: "Her kelime aynı dört adımdan geçer; sayfanın üstünde bu rota her zaman görünür durur:",
        bullets: [
          "Anlamı Gör — kelimeyi örnek cümlede ve Türkçe karşılığıyla tanı",
          "Aileyi Tanı — fiil, isim, sıfat, zarf ve olumsuz biçimleri bir tabloda gör",
          "İpucunu Bul — boşluğun hangi türü istediğini belirleyen sinyalleri oku",
          "Sınavda Seç — aynı ailenin şıklar arasında nasıl karşına çıktığını çalış",
        ],
      },
      {
        title: "Aynı aile, farklı görev",
        body: "Her kelimenin tablosunda biçim, görev ve sınavda doğal eşi yan yana verilir: rely on evidence, reliance on imports, reliable data, the reliability of a test. Ardından gelen anlam ayrımı bölümü, birbirine en çok karıştırılan iki biçimi karşı karşıya koyar.",
      },
      {
        title: "Kelime Radarı ve çalışma sayfaları",
        body: "Her aile için iki çalışma sayfası vardır: toplam 250 sayfa uygulama. Boşluk doldurma, biçim seçme, cümle tamamlama ve çeldirici analizli sorularla kelimeyi tanımaktan seçmeye geçersin.",
      },
    ],
    closing: "Kelime listesi ezberleyip sınavda yine yanlış biçimi işaretleyenler için hazırlandı.",
  },

  "paragrafin-isigini-yak": {
    lead: "Paragrafın Işığını Yak 1, YDS ve YÖKDİL'in okuma bölümünde paragrafı doğru okumayı ve doğru şıkkı gerekçesiyle seçmeyi öğretir. Sınav her cümleyi çevirmeni değil, yazarın iddiasını taşıyan cümleyi bulmanı ister.",
    facts: [
      { label: "Sayfa", value: "135" },
      { label: "Ünite", value: "10" },
      { label: "Özgün metin", value: "40" },
      { label: "Soru", value: "200" },
    ],
    sections: [
      {
        title: "Her metin üç sayfada işlenir",
        body: "Birinci sayfada metin, altında Okuma Rotası ve numaralı Paragraf İzi; ikinci sayfada beş soru; üçüncü sayfada çözüm. Günde bir metin çalışan bir öğrenci kitabı on haftada bitirir.",
      },
      {
        title: "Çözüm sayfası cevabı değil, gerekçeyi verir",
        body: "Doğru şıkkı bilmek yetmez; onu neyin kanıtladığını bilmek gerekir. Bu yüzden her çözüm sayfasında:",
        bullets: [
          "Cevabı taşıyan cümle metinden alınır ve altı çizilir",
          "Doğru şık altın renkle ve DOĞRU CEVAP etiketiyle işaretlenir",
          "Her yanlış şıkkın hangi çeldirici türü olduğu adıyla yazılır",
          "Ünitenin kelime listesi ve Kendini Teşhis Et kutusu sayfayı kapatır",
        ],
      },
      {
        title: "Dört alan, tek yöntem",
        body: "Metinler sosyal bilimler, sağlık bilimleri, fen bilimleri ve genel akademik alanlardan gelir. Hangi YÖKDİL alanına girersen gir, tanıdık bir zeminde çalışır; yöntemi ise alan değiştirdiğinde de aynı kalır.",
      },
      {
        title: "Anahtar tahminle bulunamaz",
        body: "Her metnin beş cevabı A'dan E'ye harflerin tam bir permütasyonudur. Şıkları saymak ya da harf dağılımını kollamak işe yaramaz; tek yol metne dönmektir.",
      },
      {
        title: "Kitabın başında çalışma planı",
        body: "Dört adımlı okuma rotası — haritayı çıkar, soruyu oku, kanıtı bul, çeldiriciyi ele — ve 1., 3., 7. ve 21. günlere yayılan tekrar planı ilk sayfalarda verilir.",
      },
    ],
    closing: "Metni anladığını sanıp yine de iki şık arasında kalanlar için yazıldı.",
  },

  "paragrafin-isigini-yak-cilt-2": {
    lead: "Paragrafın Işığını Yak 2, birinci cildin bıraktığı yerden başlar. Sınavın zor paragrafları bilgi değil karar sorar: iki metni karşılaştırmak, söylenmeyen varsayımı görmek, bir iddianın kanıtıyla ne kadar örtüştüğünü ölçmek.",
    facts: [
      { label: "Sayfa", value: "135" },
      { label: "Ünite", value: "10" },
      { label: "Özgün metin", value: "40" },
      { label: "Soru", value: "200" },
    ],
    sections: [
      {
        title: "On ileri beceri, on ünite",
        body: "Her ünite tek bir karar türünü adıyla çalıştırır ve dört özgün metinle pekiştirir. Ünite adları, sınavda karşına çıkan soruyu değil, o soruyu çözmek için yapman gereken işi anlatır:",
        bullets: [
          "İki metni karşılaştır — tarafların tam olarak nerede ayrıldığını göster",
          "Varsayımı görünür kıl — iddianın ayakta durması için gereken sessiz cümleyi bul",
          "Argümanı değerlendir — kanıtın desteklediği iddia ile kurulan iddiayı ayır",
          "Süreci ve sırayı kur — adımların bağımlılığını çöz",
          "Kavramın tarihini izle — bir terimin anlamı ne zaman değişti",
          "Sayıyı metinde yorumla — yüzde ile puanı, ortalama ile dağılımı ayır",
          "Tanımı ve sınırı ayırt et — kavganın çıktığı yer sınırdır",
          "Örneğin gücünü ölç — hangi örnek neyi kanıtlar",
          "Uzun metinle çalış — 320 kelimenin üzerindeki metinlerde dayanıklılık",
          "Karma deneme — soru tipini kimsenin söylemediği bir set",
        ],
      },
      {
        title: "Aynı üç sayfalık düzen",
        body: "Metin, sorular ve çözüm sırası birinci ciltteki gibidir: altı çizili kanıt cümlesi, altın renkli doğru cevap, adıyla anılan çeldirici, kelime listesi ve teşhis kutusu. Cilt değişir, yöntem değişmez.",
      },
      {
        title: "Uzun metin ünitesi",
        body: "19. ünitenin metinleri diğerlerinden belirgin biçimde uzundur. Amaç hız değil dayanıklılık: iddianın geç geldiği paragraflarda sona vardığında başı hatırlayabilmek.",
      },
      {
        title: "Tamamı özgün",
        body: "Kırk metnin tamamı Netfener için yazılmıştır. Kitap ÖSYM tarafından yayımlanmış sınav sorularından alıntı içermez ve birinci ciltteki hiçbir metni tekrar etmez.",
      },
    ],
    closing: "Birinci cildi bitirmiş, artık kolay paragrafta değil zor paragrafta puan arayanlar için.",
  },

  "yokdil-saglik": {
    lead: "YÖKDİL Sağlık, sağlık bilimleri metinlerini terim terim çevirmek yerine bir çalışmanın kimi kapsadığını, neyi karşılaştırdığını ve iddiasını nereye kadar götürdüğünü okumayı öğretir.",
    facts: [
      { label: "Sayfa", value: "89" },
      { label: "Bölüm", value: "16" },
      { label: "Özgün soru", value: "201" },
      { label: "Tam deneme", value: "80 soru" },
    ],
    sections: [
      {
        title: "Dil bölümlerinden sınav görevlerine",
        body: "İlk bölümler akademik cümlenin yapısını kurar: isim grupları, zaman ve edilgen anlatım, neden-karşıtlık-sonuç bağlantıları, olasılık ve koşullar, fiil kalıpları ve edat ilişkileri. Sonraki bölümler doğrudan sınav görevlerine geçer: cümle tamamlama, iki yönlü çeviri, paragraf tamamlama ve anlam bütünlüğü.",
      },
      {
        title: "Dört adımlı çalışma düzeni",
        body: "Kitabın başında tarif edilen çalışma düzeni her bölümde aynı biçimde uygulanır; soruyu çözmek kadar, çözdükten sonra ne yaptığın da bu düzenin parçasıdır:",
        bullets: [
          "Önce kısa bir tahmin — şıklara bakmadan gereken ilişkiyi söyle",
          "Kanıtı işaretle — kararını zaman, özne, bağlaç veya sözcük eşleşmesiyle gerekçelendir",
          "Çözümü geri bildirim olarak kullan — doğru yaptığında da çözümü oku",
          "Aralıklı geri dön — ilk çalışmanın ardından planlı tekrar",
        ],
      },
      {
        title: "Açıklamalı çözümler",
        body: "201 özgün sorunun çözümleri Türkçedir ve yalnızca doğru harfi vermez; yanlış seçeneğin cümleye eklediği anlamı ya da bozduğu yapıyı gösterir.",
      },
      {
        title: "Tam deneme ve sonrası",
        body: "Kitap 80 soruluk bir tam denemeyle biter. Denemenin ardından gelen sonuç okuma rotası, hangi bölüme dönmen gerektiğini söyler; son sayfadaki tek sayfalık kontrol listesi sınav sabahı için hazırlanmıştır.",
      },
    ],
    closing: "Sağlık bilimleri alanında YÖKDİL'e hazırlananlar için, dil ve sınav pratiğini tek kitapta birleştirir.",
  },

  "yokdil-fen": {
    lead: "YÖKDİL Fen Bilimleri, bilimsel metnin kendine özgü dilini — deneyin anlatımını, uzun ad gruplarını, temkinli iddiayı — sınavda karar verilebilir hâle getirir.",
    facts: [
      { label: "Sayfa", value: "100" },
      { label: "Bölüm", value: "16" },
      { label: "Özgün soru", value: "155" },
      { label: "Tam deneme", value: "80 soru" },
    ],
    sections: [
      {
        title: "Başlangıç taraması ve kişisel rota",
        body: "Kitap kısa bir başlangıç taramasıyla açılır. Sonucuna göre önerilen kişisel rota, hangi bölümlere öncelik vereceğini gösterir; zamanın kısıtlıysa en çok kaybettiğin yerden başlarsın.",
      },
      {
        title: "Bilimsel metnin yapı taşları",
        body: "On beş öğretim bölümü, fen metinlerinde en sık iş gören yapıları sırayla ele alır:",
        bullets: [
          "Bilimsel kelimeyi bağlamdan çözmek",
          "Deneyin dili: etken ve edilgen",
          "Uzun ad gruplarını açmak",
          "Olasılık, zorunluluk ve bilimsel temkin",
          "Koşullar, sınırlar ve varsayımlar",
          "Okuma: iddiayı kanıttan ayırmak",
        ],
      },
      {
        title: "Sınav görevleri ve kelime defteri",
        body: "Cümle tamamlama, cloze, iki yönlü çeviri, paragraf tamamlama ve anlam bütünlüğü bölümleri sınavın soru tiplerini birebir çalıştırır. Aralarındaki bilimsel kelime defteri, metinlerde geçen terimleri bağlamlarıyla toplar.",
      },
      {
        title: "Tam deneme ve son kontrol",
        body: "80 soruluk tam deneme, cevap anahtarı ve sonuçtan çalışma rotasına geçiş bölümü kitabı kapatır. Tek sayfalık son kontrol listesi sınavdan önceki güne bırakılabilir.",
      },
    ],
    closing: "Fen bilimleri alanında YÖKDİL'e hazırlananlar için, bilimsel İngilizceyi sınav kararına çeviren bir kaynak.",
  },

  "yokdil-sosyal": {
    lead: "YÖKDİL Sosyal Bilimler, toplumsal metinlerdeki iddiayı, kanıtı ve yazarın tutumunu ayırt etmeyi öğretir. Sosyal bilimlerde cümle çoğu zaman bir olguyu değil, bir yorumu taşır.",
    facts: [
      { label: "Sayfa", value: "96" },
      { label: "Bölüm", value: "16" },
      { label: "Özgün soru", value: "139" },
      { label: "Tam deneme", value: "80 soru" },
    ],
    sections: [
      {
        title: "Başlangıç taraması ve kişisel rota",
        body: "Kitap bir başlangıç taramasıyla açılır ve sonucuna göre kişisel bir çalışma rotası önerir. Hangi bölümden başlayacağın tahmine değil, kendi yanlışlarına dayanır.",
      },
      {
        title: "Toplumsal metnin dili",
        body: "Öğretim bölümleri, sosyal bilimler metinlerinde en çok iş gören yapıları ele alır:",
        bullets: [
          "Toplumsal kavramları bağlamdan okumak",
          "Eylemi kim yapıyor? Edilgen ve sorumluluk",
          "Tarih, değişim ve zaman çizgisi",
          "Bağlaçlar: yazarın düşünce yönü",
          "İddia, kanıt ve temkinli dil",
          "Koşullar, varsayımlar ve alternatif geçmiş",
        ],
      },
      {
        title: "Sınav görevleri ve kelime defteri",
        body: "Cümle tamamlama, cloze, çeviri, paragraf tamamlama ve anlam bütünlüğü bölümleri sınav formatını doğrudan çalıştırır. Sosyal bilimler kelime defteri, terimleri geçtikleri bağlamla birlikte toplar.",
      },
      {
        title: "Okuma bölümü ve tam deneme",
        body: "Okuma bölümü ana fikir, çıkarım ve yazar tutumu sorularını ayrı ayrı ele alır. Kitap 80 soruluk tam deneme, cevap anahtarı ve sonuçtan çalışma rotasına geçişle biter.",
      },
    ],
    closing: "Sosyal bilimler alanında YÖKDİL'e hazırlananlar için, dil çalışmasıyla sınav pratiğini aynı kitapta birleştirir.",
  },
};

export function findEbookPitch(slug: string): EbookPitch | undefined {
  return NETFENER_EBOOK_PITCH[slug];
}
