import type { DiagnosticQuestionSeed } from "../diagnostic-questions";

export const MOCK_YOKDIL_FEN: DiagnosticQuestionSeed[] = [
  // ============================================================
  // DENEME 1
  // ============================================================
  // ---- Kelime Bilgisi (8) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Unlike speed, which is a scalar quantity, ---- includes both magnitude and direction, making it essential for describing motion precisely.",
    options: ["mass", "velocity", "density", "volume"],
    correctIndex: 1,
    explanation:
      "'Velocity' (hız vektörü) hem büyüklük hem de yön içeren bir niceliktir; cümlede bu doğrudan tanımlanmıştır. 'Mass', 'density' ve 'volume' yön kavramı içermeyen skaler niceliklerdir.",
    tags: ["science-vocab-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "A ---- speeds up a chemical reaction without being consumed in the process itself.",
    options: ["catalyst", "solvent", "residue", "compound"],
    correctIndex: 0,
    explanation:
      "Bir katalizör (catalyst) tam olarak bu şekilde tanımlanır: reaksiyonu hızlandırır ama tüketilmez. 'Solvent' (çözücü), 'residue' (kalıntı) ve 'compound' (bileşik) bu özelliği taşımaz.",
    tags: ["definition-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Plants ---- sunlight, water, and carbon dioxide into glucose and oxygen through photosynthesis.",
    options: ["convert", "erode", "dilute", "corrode"],
    correctIndex: 0,
    explanation:
      "Fotosentezde bitkiler güneş ışığını, suyu ve karbondioksiti glikoz ve oksijene 'dönüştürür' (convert). 'Erode' (aşındırmak), 'dilute' (sulandırmak) ve 'corrode' (paslandırmak) bu sürece uymaz.",
    tags: ["biology-vocab"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The engineer increased the wrench's arm length to produce more ---- without applying additional force.",
    options: ["torque", "voltage", "friction", "density"],
    correctIndex: 0,
    explanation:
      "Tork (torque), kuvvet kolunun uzunluğuna bağlıdır; kol uzadıkça aynı kuvvetle daha fazla tork elde edilir. 'Voltage', 'friction' ve 'density' bu mekanik ilişkiyle ilgili değildir.",
    tags: ["engineering-vocab"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Unlike ductile metals that bend under stress, glass is ---- and shatters instead of deforming.",
    options: ["ductile", "brittle", "malleable", "elastic"],
    correctIndex: 1,
    explanation:
      "Cam, eğilmek yerine kırılır; bu özellik 'brittle' (kırılgan) kelimesiyle ifade edilir. 'Ductile' (çekilebilir), 'malleable' (dövülebilir) ve 'elastic' (esnek) ise eğilme/şekil değiştirme kapasitesini ima eder ve cümlenin başındaki karşılaştırmayla çelişir.",
    tags: ["materials-science-vocab"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The Earth takes approximately 365 days to complete one ---- around the Sun.",
    options: ["orbit", "eclipse", "axis", "surface"],
    correctIndex: 0,
    explanation:
      "Dünya'nın Güneş etrafındaki dönüş yolu 'orbit' (yörünge) olarak adlandırılır. 'Eclipse' (tutulma), 'axis' (eksen) ve 'surface' (yüzey) bu döngüsel hareketi tanımlamaz.",
    tags: ["astronomy-vocab"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Digestive ---- break down complex food molecules into simpler substances the body can absorb.",
    options: ["enzymes", "tissues", "vessels", "membranes"],
    correctIndex: 0,
    explanation:
      "Sindirim enzimleri (enzymes) karmaşık besin moleküllerini basit maddelere parçalar. 'Tissues' (dokular), 'vessels' (damarlar) ve 'membranes' (zarlar) bu parçalama işlevini görmez.",
    tags: ["biology-vocab"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "According to the formula, pressure is ---- to volume when temperature remains constant, meaning that as one increases, the other decreases.",
    options: ["directly proportional", "inversely proportional", "unrelated", "equivalent"],
    correctIndex: 1,
    explanation:
      "Boyle Yasasına göre sabit sıcaklıkta basınç ve hacim ters orantılıdır ('inversely proportional'); biri artarken diğeri azalır, tıpkı cümlede tanımlandığı gibi. 'Directly proportional' aynı yönde değişimi ifade eder ve cümledeki tanımla çelişir.",
    tags: ["physics-vocab"],
    mockSetNumber: 1,
  },
  // ---- Çeviri EN-TR (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Water boils at 100 degrees Celsius at sea level.",
    options: [
      "Su, deniz seviyesinde 100 santigrat derecede kaynar.",
      "Su, deniz seviyesinde 100 santigrat derecede donar.",
      "Su, deniz seviyesinde 100 santigrat dereceye kadar ısıtılmıştı.",
      "Su, deniz seviyesinin üzerinde 100 santigrat derecede kaynayacaktır.",
    ],
    correctIndex: 0,
    explanation:
      "'Boils' geniş zamanda genel bir bilimsel gerçeği anlatır ve 'kaynar' ile karşılanır; doğru seçenek A'dır. B 'donar' diyerek yanlış fiili kullanıyor, C geçmiş zamana kaydırıyor, D 'üzerinde' ve gelecek zaman ekleyerek metni çarpıtıyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The satellite was launched into orbit last week.",
    options: [
      "Uydu geçen hafta yörüngeye fırlatılacak.",
      "Uydu geçen hafta yörüngeye fırlatıldı.",
      "Uydu geçen hafta yörüngeye fırlatılıyor.",
      "Uydu geçen hafta yörüngeye fırlatılmış olacaktı.",
    ],
    correctIndex: 1,
    explanation:
      "'Was launched' basit geçmiş zamanda edilgen bir yapıdır ve doğru çevirisi 'fırlatıldı' olan B'dir. A gelecek zaman, C şimdiki zaman kullanıyor; D gereksiz karmaşık bir yapı kurup zamanla uyuşmuyor.",
    tags: ["passive-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "This compound reacts violently when exposed to moisture.",
    options: [
      "Bu bileşik neme maruz kaldığında şiddetli bir şekilde tepki verir.",
      "Bu bileşik neme maruz kalmıştı ve şiddetli bir şekilde tepki verecekti.",
      "Bu bileşik nemden korunduğunda şiddetli bir şekilde tepki verir.",
      "Bu bileşik neme maruz kalabilirdi ve şiddetli tepki vermişti.",
    ],
    correctIndex: 0,
    explanation:
      "'Reacts' geniş zamanda genel bir gerçeği anlatır ve doğru çeviri A'dır. B ve D gereksiz karmaşık zamanlar kullanıyor; C 'korunduğunda' diyerek anlamı tersine çeviriyor (maruz kalma değil korunma anlatıyor).",
    tags: ["present-simple-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Had the algorithm been optimized earlier, the system would not have crashed under heavy load.",
    options: [
      "Algoritma daha önce optimize edilseydi, sistem yoğun yük altında çökmezdi.",
      "Algoritma daha önce optimize edildiği için sistem yoğun yük altında hiç çökmedi.",
      "Algoritma optimize edilmediği için sistem yoğun yük altında çökecek.",
      "Algoritma optimize edilmeli ki sistem yoğun yük altında çökmesin.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle 3. tip (geçmişe yönelik gerçek dışı) koşul yapısındadır ('Had...been optimized... would not have crashed'); bu, gerçekte algoritmanın optimize edilmediğini ve sistemin çöktüğünü ima eder. Doğru çeviri bu gerçek-dışılığı 'edilseydi... çökmezdi' ile yansıtan A'dır. B durumu gerçekmiş gibi anlatarak anlamı tersine çeviriyor; C ve D farklı zaman/kip kullanıyor.",
    tags: ["conditional-translation"],
    mockSetNumber: 1,
  },
  // ---- Çeviri TR-EN (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Bilim insanları yeni bir gezegen keşfetti.",
    options: [
      "Scientists discovered a new planet.",
      "Scientists will discover a new planet.",
      "Scientists are discovering a new planet.",
      "Scientists had discovered a new planet.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle basit geçmiş zamandadır ('keşfetti'); bu doğrudan Simple Past ile karşılanır ('discovered'). B gelecek, C şimdiki zaman, D ise geçmişin öncesini (past perfect) ifade eder; hiçbiri orijinal zamanla örtüşmez.",
    tags: ["past-simple-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["modal-fiiller", "edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Köprünün taşıma kapasitesi mühendisler tarafından dikkatlice hesaplanmalıdır.",
    options: [
      "The bridge's load-bearing capacity must be carefully calculated by engineers.",
      "The bridge's load-bearing capacity was carefully calculated by engineers.",
      "Engineers carefully calculate the bridge's load-bearing capacity.",
      "The bridge's load-bearing capacity will carefully calculate engineers.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümlede zorunluluk bildiren '-melidir' eki ve edilgen yapı vardır; bu İngilizcede 'must be calculated' ile karşılanır. B geçmiş zaman kullanıyor, C etken çatıya çevirip zorunluluğu kaybediyor, D anlamsız/hatalı bir yapı kuruyor.",
    tags: ["modal-passive-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu bakteri türü, yüksek sıcaklıklarda hayatta kalabilir.",
    options: [
      "This species of bacteria can survive at high temperatures.",
      "This species of bacteria could not survive at high temperatures.",
      "This species of bacteria survived at high temperatures.",
      "This species of bacteria will have survived at high temperatures.",
    ],
    correctIndex: 0,
    explanation:
      "'Hayatta kalabilir' yetenek/olasılık bildiren 'can' ile karşılanır. B anlamı olumsuza çeviriyor, C basit geçmiş zaman kullanıyor, D karmaşık bir gelecek zaman yapısı kurup orijinal anlamla uyuşmuyor.",
    tags: ["modal-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt:
      "Eğer sera gazı emisyonları azaltılmazsa, küresel sıcaklıklar önümüzdeki yüzyılda önemli ölçüde artacaktır.",
    options: [
      "If greenhouse gas emissions are not reduced, global temperatures will rise significantly over the next century.",
      "If greenhouse gas emissions had not been reduced, global temperatures would have risen significantly over the next century.",
      "Unless greenhouse gas emissions were reduced, global temperatures rose significantly over the next century.",
      "Greenhouse gas emissions are not reduced because global temperatures rise significantly over the next century.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 1. tip koşul (gerçek/olası gelecek durum) yapısındadır; doğru çeviri 'If...are not reduced,...will rise' yapısını kullanan A'dır. B, 3. tip (geçmişe yönelik gerçek dışı) koşula çeviriyor; C zaman/kip uyumsuzluğu içeriyor; D neden-sonuç ilişkisini tersine çeviriyor.",
    tags: ["conditional-translation"],
    mockSetNumber: 1,
  },
  // ---- Okuma (4, tek parça) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre, rüzgar türbini kanatlarının dönmesini ne sağlar?",
    passageText:
      "Wind turbines convert the kinetic energy of moving air into electricity through a simple but elegant mechanism. As wind flows over the blades, it creates a difference in air pressure that causes them to rotate. This rotational motion spins a shaft connected to a generator, which then produces electrical power. The amount of energy a turbine can generate depends heavily on wind speed, because the power available in wind increases with the cube of its speed; even a modest increase in wind velocity can dramatically boost output. For this reason, engineers carefully study local wind patterns before selecting a site for a wind farm.",
    options: [
      "Kanatların üzerindeki hava basıncı farkı",
      "Jeneratörün ürettiği elektrik",
      "Şaftın dönüş hızı",
      "Rüzgar çiftliğinin konumu",
    ],
    correctIndex: 0,
    explanation:
      "Parçada açıkça 'it creates a difference in air pressure that causes them to rotate' deniyor; yani kanatların dönmesini sağlayan hava basıncı farkıdır.",
    tags: ["detail-question"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt:
      "Parçaya göre, rüzgar hızındaki küçük bir artış neden çıktıyı büyük ölçüde artırabilir?",
    passageText:
      "Wind turbines convert the kinetic energy of moving air into electricity through a simple but elegant mechanism. As wind flows over the blades, it creates a difference in air pressure that causes them to rotate. This rotational motion spins a shaft connected to a generator, which then produces electrical power. The amount of energy a turbine can generate depends heavily on wind speed, because the power available in wind increases with the cube of its speed; even a modest increase in wind velocity can dramatically boost output. For this reason, engineers carefully study local wind patterns before selecting a site for a wind farm.",
    options: [
      "Çünkü rüzgardaki güç, hızın küpüyle orantılı olarak artar.",
      "Çünkü jeneratörler yüksek hızlarda daha az yakıt tüketir.",
      "Çünkü kanatlar yüksek hızlarda daha hafif hale gelir.",
      "Çünkü mühendisler rüzgar hızını doğrudan kontrol edebilir.",
    ],
    correctIndex: 0,
    explanation:
      "Parçada 'the power available in wind increases with the cube of its speed' deniyor; bu yüzden küçük bir hız artışı çıktıyı orantısız şekilde artırır.",
    tags: ["detail-inference"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçanın temel amacı nedir?",
    passageText:
      "Wind turbines convert the kinetic energy of moving air into electricity through a simple but elegant mechanism. As wind flows over the blades, it creates a difference in air pressure that causes them to rotate. This rotational motion spins a shaft connected to a generator, which then produces electrical power. The amount of energy a turbine can generate depends heavily on wind speed, because the power available in wind increases with the cube of its speed; even a modest increase in wind velocity can dramatically boost output. For this reason, engineers carefully study local wind patterns before selecting a site for a wind farm.",
    options: [
      "Rüzgar türbinlerinin rüzgar enerjisini elektriğe nasıl dönüştürdüğünü ve rüzgar hızının önemini açıklamak",
      "Rüzgar çiftliklerinin çevresel zararlarını tartışmak",
      "Farklı jeneratör türlerini karşılaştırmak",
      "Rüzgar enerjisinin güneş enerjisinden neden daha ucuz olduğunu kanıtlamak",
    ],
    correctIndex: 0,
    explanation:
      "Parça baştan sona türbinlerin çalışma mekanizmasını ve rüzgar hızının çıktı üzerindeki etkisini anlatır; diğer seçeneklerden hiçbiri parçada ele alınmaz.",
    tags: ["main-idea"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçada geçen 'elegant' kelimesi bağlama göre en yakın olarak hangi anlama gelir?",
    passageText:
      "Wind turbines convert the kinetic energy of moving air into electricity through a simple but elegant mechanism. As wind flows over the blades, it creates a difference in air pressure that causes them to rotate. This rotational motion spins a shaft connected to a generator, which then produces electrical power. The amount of energy a turbine can generate depends heavily on wind speed, because the power available in wind increases with the cube of its speed; even a modest increase in wind velocity can dramatically boost output. For this reason, engineers carefully study local wind patterns before selecting a site for a wind farm.",
    options: ["karmaşık", "zarif/yalın ve etkili", "pahalı", "eski"],
    correctIndex: 1,
    explanation:
      "Parçada mekanizma 'simple but elegant' olarak nitelendiriliyor; bu bağlamda 'elegant', basit olmasına rağmen zekice tasarlanmış/yalın ve etkili anlamına gelir ve 'karmaşık' ifadesiyle zıttır.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 1,
  },

  // ============================================================
  // DENEME 2
  // ============================================================
  // ---- Kelime Bilgisi (8) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "A well-designed ---- can solve a complex problem in a fraction of the time a naive approach would require.",
    options: ["algorithm", "keyboard", "monitor", "password"],
    correctIndex: 0,
    explanation:
      "Bir algoritma (algorithm), bir problemi çözmek için izlenen adım adım prosedürdür; cümledeki tanım buna uyar. 'Keyboard', 'monitor' ve 'password' donanım/güvenlik terimleri olup anlamla ilgisizdir.",
    tags: ["computer-science-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "In the equation 3x + 5 = 11, the number 3 is called the ---- of x.",
    options: ["coefficient", "denominator", "exponent", "remainder"],
    correctIndex: 0,
    explanation:
      "Bir değişkeni çarpan sayı 'coefficient' (katsayı) olarak adlandırılır. 'Denominator' (payda), 'exponent' (üs) ve 'remainder' (kalan) farklı matematiksel kavramlardır.",
    tags: ["mathematics-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Unlike plastic, which can persist in landfills for centuries, paper is ---- and breaks down naturally within months.",
    options: ["biodegradable", "synthetic", "radioactive", "impermeable"],
    correctIndex: 0,
    explanation:
      "'Biodegradable' (biyolojik olarak çözünebilen) doğada kendiliğinden ayrışabilen maddeleri ifade eder; cümledeki 'breaks down naturally' bunu doğrular. 'Synthetic' (sentetik) zıt bir özelliktir; 'radioactive' ve 'impermeable' bağlamla ilgisizdir.",
    tags: ["environmental-science-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Removing a ---- wall without proper support can cause the entire structure to collapse.",
    options: ["load-bearing", "decorative", "temporary", "transparent"],
    correctIndex: 0,
    explanation:
      "Taşıyıcı duvar ('load-bearing wall') kaldırıldığında yapı çökebilir; cümledeki sonuç ('collapse') bunu doğrular. 'Decorative' (dekoratif), 'temporary' (geçici) ve 'transparent' (saydam) duvarlar bu riski taşımaz.",
    tags: ["civil-engineering-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "When the two solutions were mixed, a solid ---- formed at the bottom of the beaker almost immediately.",
    options: ["precipitate", "vapor", "solvent", "filtrate"],
    correctIndex: 0,
    explanation:
      "Bir kimyasal reaksiyon sonucu oluşan katı madde 'precipitate' (çökelti) olarak adlandırılır. 'Vapor' (buhar) katı değildir; 'solvent' (çözücü) ve 'filtrate' (süzüntü) burada oluşan katıyı tanımlamaz.",
    tags: ["chemistry-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Copper is widely used in electrical wiring because it is an excellent ---- of electricity.",
    options: ["insulator", "conductor", "barrier", "resistor"],
    correctIndex: 1,
    explanation:
      "Bakır, elektriği iyi ileten bir madde olduğu için 'conductor' (iletken) doğru cevaptır. 'Insulator' (yalıtkan) zıt anlamlıdır; 'barrier' ve 'resistor' bağlama uymaz.",
    tags: ["electrical-engineering-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The program will ---- through the list of values until it finds one that matches the search criteria.",
    options: ["iterate", "erase", "compress", "duplicate"],
    correctIndex: 0,
    explanation:
      "'Iterate' (sırayla/tekrar tekrar geçmek) bir listeyi adım adım tarama sürecini tam olarak tanımlar. 'Erase' (silmek), 'compress' (sıkıştırmak) ve 'duplicate' (çoğaltmak) bu döngüsel arama sürecini tanımlamaz.",
    tags: ["computer-science-vocab"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Engineers monitored the building closely after the ground beneath it began to ----, threatening the foundation's stability.",
    options: ["subside", "expand", "solidify", "elevate"],
    correctIndex: 0,
    explanation:
      "Zeminin çökmesi/alçalması 'subside' fiiliyle ifade edilir ve temel kararlılığını tehdit eder. 'Expand' (genişlemek) ve 'elevate' (yükselmek) anlamca ters yöndedir; 'solidify' (katılaşmak) bağlamla ilgisizdir.",
    tags: ["civil-engineering-vocab"],
    mockSetNumber: 2,
  },
  // ---- Çeviri EN-TR (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "The software update fixed several bugs in the previous version.",
    options: [
      "Yazılım güncellemesi, önceki sürümdeki birkaç hatayı düzeltti.",
      "Yazılım güncellemesi, önceki sürümdeki birkaç hatayı düzeltecek.",
      "Yazılım güncellemesi, önceki sürümde birkaç hata oluşturdu.",
      "Yazılım güncellemesi önceki sürümden daha yavaştı.",
    ],
    correctIndex: 0,
    explanation:
      "'Fixed' basit geçmiş zamandadır ve 'düzeltti' ile karşılanır; doğru seçenek A'dır. B gelecek zaman kullanıyor, C anlamı tersine çeviriyor (hata oluşturmak), D parçada olmayan bir bilgi ekliyor.",
    tags: ["past-simple-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Deforestation has accelerated soil erosion in many tropical regions.",
    options: [
      "Ormansızlaşma birçok tropikal bölgede toprak erozyonunu hızlandırmıştır.",
      "Ormansızlaşma birçok tropikal bölgede toprak erozyonunu yavaşlatmıştır.",
      "Toprak erozyonu birçok tropikal bölgede ormansızlaşmayı hızlandırmıştır.",
      "Ormansızlaşma birçok tropikal bölgede toprak erozyonunu önleyecektir.",
    ],
    correctIndex: 0,
    explanation:
      "'Accelerated' = hızlandırmıştır; doğru seçenek A'dır. B anlamı tersine çeviriyor (yavaşlatmak), C özne-nesne ilişkisini tersine çeviriyor, D yanlış zaman ve anlam ('önlemek') kullanıyor.",
    tags: ["present-perfect-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["modal-fiiller"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Each variable in the equation must be defined before the formula can be applied.",
    options: [
      "Formül uygulanabilmeden önce denklemdeki her değişken tanımlanmalıdır.",
      "Denklemdeki her değişken, formül uygulandıktan sonra tanımlanmıştır.",
      "Formül uygulanabilmeden önce denklemdeki her değişken tanımlanabilir.",
      "Denklemdeki her değişken tanımlanmasa da formül uygulanabilir.",
    ],
    correctIndex: 0,
    explanation:
      "'Must be defined' zorunluluk bildirir ve 'tanımlanmalıdır' ile karşılanır; doğru sıra ve anlam A'dadır. B sırayı tersine çeviriyor, C zorunluluğu olasılığa indirgiyor, D koşulu tamamen tersine çeviriyor.",
    tags: ["modal-passive-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Not until the server had been restarted did the application begin to function normally again.",
    options: [
      "Sunucu yeniden başlatılana kadar uygulama normal şekilde çalışıyordu.",
      "Sunucu yeniden başlatıldıktan sonra ancak uygulama normal şekilde çalışmaya başladı.",
      "Sunucu hiçbir zaman yeniden başlatılmadığı için uygulama çalışmaya başlamadı.",
      "Sunucu yeniden başlatılacağı için uygulama normal şekilde çalışmayacaktı.",
    ],
    correctIndex: 1,
    explanation:
      "Devrik yapı ('Not until...had been restarted did...begin') olayın ancak sunucu yeniden başlatıldıktan SONRA gerçekleştiğini anlatır; bu B'de doğru veriliyor. A, yeniden başlatmadan önce uygulamanın zaten çalıştığını söyleyerek anlamı tersine çeviriyor; C sunucunun hiç başlatılmadığını iddia ediyor (metinle çelişir); D olayın gerçekleşmeyeceğini belirtiyor.",
    tags: ["inversion-translation"],
    mockSetNumber: 2,
  },
  // ---- Çeviri TR-EN (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Mühendisler yeni köprüyü test etmek için bir simülasyon kullandılar.",
    options: [
      "Engineers used a simulation to test the new bridge.",
      "Engineers will use a simulation to test the new bridge.",
      "Engineers are using a simulation to test the new bridge.",
      "Engineers had used a simulation to test the new bridge before it opened.",
    ],
    correctIndex: 0,
    explanation:
      "'Kullandılar' basit geçmiş zaman bildirir; doğru çeviri 'used' kullanan A'dır. B gelecek, C şimdiki zaman kullanıyor; D metinde olmayan bir bilgi ('köprü açılmadan önce') ekliyor.",
    tags: ["past-simple-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu reaksiyon sırasında büyük miktarda ısı açığa çıkar.",
    options: [
      "A large amount of heat is released during this reaction.",
      "A large amount of heat was released during this reaction.",
      "A large amount of heat will be released during this reaction.",
      "A large amount of heat releases during this reaction itself.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zamanda edilgen bir olguyu anlatır ('açığa çıkar'); doğru çeviri şimdiki geniş zaman edilgen yapı olan 'is released' kullanan A'dır. B geçmiş, C gelecek zaman kullanıyor; D 'release' fiilini dilbilgisel olarak hatalı (etken) şekilde kullanıyor.",
    tags: ["passive-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "İki sayının çarpımı, her zaman toplamlarından büyük olmayabilir.",
    options: [
      "The product of two numbers may not always be greater than their sum.",
      "The product of two numbers is always greater than their sum.",
      "The sum of two numbers may not always be greater than their product.",
      "The product of two numbers will never be greater than their sum.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 'her zaman...olmayabilir' ile kısmi bir olasılık/istisna bildirir; bu 'may not always be' ile karşılanan A'da doğru yansıtılmıştır. B kesinlik ekliyor, C çarpım ve toplamın yerini değiştiriyor, D 'asla' diyerek kesin bir olumsuzluk ekliyor.",
    tags: ["modal-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati", "modal-fiiller"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt:
      "Zemin etüdü tamamlanmadan inşaata başlanmaması gerektiği mühendisler tarafından defalarca vurgulanmıştır.",
    options: [
      "It has been repeatedly emphasized by engineers that construction should not begin before the soil survey is completed.",
      "It was emphasized once by engineers that construction began before the soil survey was completed.",
      "Engineers repeatedly emphasized that construction had already begun before the soil survey was completed.",
      "It will be emphasized by engineers that construction should not begin before the soil survey is completed.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümledeki 'defalarca vurgulanmıştır' (tekrarlı, present perfect) ve 'başlanmaması gerektiği' (gerekliliğin olumsuzu) ifadeleri, İngilizcede 'has been repeatedly emphasized...should not begin' yapısını kullanan A'da doğru karşılanmıştır. B 'once' diyerek tekrarı kaybediyor ve zamanı değiştiriyor; C inşaatın zaten başladığını iddia ederek anlamı tersine çeviriyor; D gelecek zaman kullanıyor.",
    tags: ["passive-modal-translation"],
    mockSetNumber: 2,
  },
  // ---- Okuma (4, tek parça) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre, aşırı öğrenme (overfitting) durumunda bir model neyi ezberler?",
    passageText:
      "Machine learning models are trained on large datasets so that they can recognize patterns and make predictions on new, unseen data. However, if a model is trained for too long or with insufficient data, it may begin to memorize specific examples rather than learning general patterns, a problem known as overfitting. An overfitted model performs exceptionally well on its training data but poorly on new inputs, because it has essentially memorized noise rather than learned meaningful trends. To prevent this, engineers often split their data into separate training and testing sets, allowing them to evaluate how well the model generalizes before deploying it in real-world applications.",
    options: [
      "Genel örüntüleri",
      "Gürültüyü (noise) ve eğitim verisine özgü ayrıntıları",
      "Test verisinin tamamını",
      "Yalnızca yeni verileri",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'it has essentially memorized noise rather than learned meaningful trends' deniyor; yani model gürültüyü ve eğitim verisine özgü ayrıntıları ezberlemiştir.",
    tags: ["detail-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre, aşırı öğrenmiş (overfitted) bir model nasıl bir performans sergiler?",
    passageText:
      "Machine learning models are trained on large datasets so that they can recognize patterns and make predictions on new, unseen data. However, if a model is trained for too long or with insufficient data, it may begin to memorize specific examples rather than learning general patterns, a problem known as overfitting. An overfitted model performs exceptionally well on its training data but poorly on new inputs, because it has essentially memorized noise rather than learned meaningful trends. To prevent this, engineers often split their data into separate training and testing sets, allowing them to evaluate how well the model generalizes before deploying it in real-world applications.",
    options: [
      "Hem eğitim hem de yeni verilerde kötü performans gösterir.",
      "Eğitim verisinde iyi, yeni verilerde kötü performans gösterir.",
      "Eğitim verisinde kötü, yeni verilerde iyi performans gösterir.",
      "Her iki veri setinde de aynı performansı gösterir.",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'performs exceptionally well on its training data but poorly on new inputs' deniyor; bu B seçeneğiyle birebir örtüşür.",
    tags: ["detail-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçanın ana konusu nedir?",
    passageText:
      "Machine learning models are trained on large datasets so that they can recognize patterns and make predictions on new, unseen data. However, if a model is trained for too long or with insufficient data, it may begin to memorize specific examples rather than learning general patterns, a problem known as overfitting. An overfitted model performs exceptionally well on its training data but poorly on new inputs, because it has essentially memorized noise rather than learned meaningful trends. To prevent this, engineers often split their data into separate training and testing sets, allowing them to evaluate how well the model generalizes before deploying it in real-world applications.",
    options: [
      "Makine öğrenmesi modellerinin donanım gereksinimleri",
      "Aşırı öğrenme sorunu ve bunu önlemenin bir yolu",
      "Veri setlerinin nasıl toplandığı",
      "Yapay zekanın tarihi gelişimi",
    ],
    correctIndex: 1,
    explanation:
      "Parça, overfitting sorununu ve bunu önlemek için verinin eğitim/test olarak ayrılmasını anlatır; diğer konular parçada ele alınmaz.",
    tags: ["main-idea"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçada geçen 'generalizes' kelimesi bağlama göre en yakın olarak neyi ifade eder?",
    passageText:
      "Machine learning models are trained on large datasets so that they can recognize patterns and make predictions on new, unseen data. However, if a model is trained for too long or with insufficient data, it may begin to memorize specific examples rather than learning general patterns, a problem known as overfitting. An overfitted model performs exceptionally well on its training data but poorly on new inputs, because it has essentially memorized noise rather than learned meaningful trends. To prevent this, engineers often split their data into separate training and testing sets, allowing them to evaluate how well the model generalizes before deploying it in real-world applications.",
    options: [
      "Modelin yalnızca eğitim verisini ezberlemesi",
      "Modelin öğrendiklerini yeni/görülmemiş verilere başarıyla uygulayabilmesi",
      "Modelin eğitim süresinin kısalması",
      "Modelin veri setini küçültmesi",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'how well the model generalizes before deploying it' ifadesi, modelin öğrendiği örüntüleri yeni verilere ne kadar başarıyla uygulayabildiğini anlatır; bu, ezberlemenin (memorization) tam tersidir.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 2,
  },

  // ============================================================
  // DENEME 3
  // ============================================================
  // ---- Kelime Bilgisi (8) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "A ---- is generally defined as a group of organisms capable of interbreeding and producing fertile offspring.",
    options: ["species", "cell", "tissue", "organ"],
    correctIndex: 0,
    explanation:
      "Tür (species) tanımı tam olarak budur: birbirleriyle üreyip verimli döller üretebilen organizma grubu. 'Cell' (hücre), 'tissue' (doku) ve 'organ' farklı biyolojik organizasyon düzeyleridir.",
    tags: ["biology-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Over millions of years, layers of ---- accumulated at the bottom of the ancient lake, eventually forming sedimentary rock.",
    options: ["sediment", "lava", "magma", "vapor"],
    correctIndex: 0,
    explanation:
      "Tortul kayaçların temel maddesi 'sediment' (tortu/çökelti)dir; cümledeki 'sedimentary rock' bunu doğrular. 'Lava' ve 'magma' volkanik, 'vapor' ise buharla ilgilidir.",
    tags: ["geology-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Adding more resistors in series increases the total ---- of the circuit, thereby reducing the current that flows through it.",
    options: ["resistance", "voltage", "capacitance", "frequency"],
    correctIndex: 0,
    explanation:
      "Ohm Yasasına göre direnç (resistance) arttıkça, sabit voltajda akım azalır; cümledeki sonuç ('reducing the current') bunu doğrular. 'Voltage', 'capacitance' ve 'frequency' bu ilişkiyi doğrudan açıklamaz.",
    tags: ["electrical-engineering-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Because the truck has far greater mass than the bicycle, it carries significantly more ---- at the same speed.",
    options: ["momentum", "temperature", "volume", "wavelength"],
    correctIndex: 0,
    explanation:
      "Momentum, kütle ile hızın çarpımıdır; aynı hızda daha büyük kütleye sahip cisim daha fazla momentuma sahiptir. 'Temperature', 'volume' ve 'wavelength' bu ilişkiyle ilgili değildir.",
    tags: ["physics-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Repeated cycles of stress, even below the material's yield strength, can eventually cause metal ----, leading to sudden failure.",
    options: ["fatigue", "expansion", "polish", "insulation"],
    correctIndex: 0,
    explanation:
      "Metal yorulması (fatigue), tekrarlanan gerilme döngüleri sonucu malzemede biriken hasardır ve ani kırılmalara yol açabilir. 'Expansion' (genleşme), 'polish' (parlatma) ve 'insulation' (yalıtım) bu süreci tanımlamaz.",
    tags: ["materials-science-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Deforestation destroys the natural ---- of countless species, forcing them to migrate or face extinction.",
    options: ["habitat", "molecule", "current", "compound"],
    correctIndex: 0,
    explanation:
      "Doğal yaşam alanı 'habitat' olarak adlandırılır; cümledeki 'forcing them to migrate' bunu destekler. 'Molecule', 'current' ve 'compound' bu bağlamda anlam ifade etmez.",
    tags: ["biology-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "---- waves generated by the earthquake were detected by monitoring stations located hundreds of kilometers from the epicenter.",
    options: ["Seismic", "Thermal", "Acoustic", "Magnetic"],
    correctIndex: 0,
    explanation:
      "Deprem tarafından üretilen dalgalar 'seismic' (sismik) dalgalar olarak adlandırılır. 'Thermal' (ısıl), 'Acoustic' (sesle ilgili) ve 'Magnetic' (manyetik) bu bağlamdaki doğru terim değildir.",
    tags: ["geology-vocab"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "A changing magnetic field can ---- an electric current in a nearby conductor, a principle that underlies how generators work.",
    options: ["induce", "insulate", "erode", "dissolve"],
    correctIndex: 0,
    explanation:
      "Elektromanyetik indüksiyon ilkesine göre değişen bir manyetik alan yakındaki bir iletkende akım 'indükleyebilir' (induce). 'Insulate' (yalıtmak), 'erode' (aşındırmak) ve 'dissolve' (çözünmek) bu bağlamla ilgisizdir.",
    tags: ["physics-vocab"],
    mockSetNumber: 3,
  },
  // ---- Çeviri EN-TR (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "The human heart pumps blood throughout the entire body.",
    options: [
      "İnsan kalbi, kanı tüm vücuda pompalar.",
      "İnsan kalbi, kanı tüm vücuttan toplar.",
      "İnsan kalbi, kanı yalnızca beyne pompalayacaktır.",
      "İnsan kalbi, geçmişte kanı tüm vücuda pompalamıştı.",
    ],
    correctIndex: 0,
    explanation:
      "'Pumps' geniş zamanda genel bir gerçeği anlatır ve 'pompalar' ile karşılanır; doğru seçenek A'dır. B anlamı tersine çeviriyor (toplamak), C 'yalnızca beyne' ve gelecek zaman ekleyerek metni çarpıtıyor, D geçmiş zamana kaydırıyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The volcano had remained dormant for over two centuries before erupting unexpectedly.",
    options: [
      "Yanardağ, beklenmedik şekilde patlamadan önce iki asırdan fazla süredir sönmüş durumdaydı.",
      "Yanardağ, iki asırdan fazla süredir aktifti ve beklenmedik şekilde patlayacaktı.",
      "Yanardağ, beklenmedik şekilde patladıktan sonra iki asırdan fazla süre sönmüş kaldı.",
      "Yanardağ iki asır içinde beklenen bir patlama yaşadı.",
    ],
    correctIndex: 0,
    explanation:
      "'Had remained dormant...before erupting' (past perfect + geçmiş) patlamadan ÖNCE uzun süre sönmüş kaldığını anlatır; bu A'da doğru sırayla verilmiştir. B 'aktifti' diyerek anlamı tersine çeviriyor, C olay sırasını tersine çeviriyor, D 'beklenen' diyerek 'unexpectedly' ile çelişiyor.",
    tags: ["past-perfect-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Engineers selected titanium for the component because of its high strength-to-weight ratio.",
    options: [
      "Mühendisler, yüksek mukavemet/ağırlık oranı nedeniyle bileşen için titanyumu seçti.",
      "Mühendisler, düşük mukavemet/ağırlık oranı nedeniyle bileşen için titanyumu seçti.",
      "Mühendisler, yüksek mukavemet/ağırlık oranı nedeniyle bileşeni titanyumdan çıkardı.",
      "Mühendisler bileşen için titanyumu seçecekler çünkü mukavemet/ağırlık oranı yüksektir.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle basit geçmiş zamandadır ('selected') ve doğru neden-sonuç ilişkisini kurar; A doğrudur. B 'düşük' diyerek anlamı tersine çeviriyor, C 'çıkardı' diyerek anlamı tersine çeviriyor, D gereksiz yere gelecek zaman kullanıyor.",
    tags: ["past-simple-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Were it not for the protective ozone layer, harmful ultraviolet radiation would reach the Earth's surface largely unfiltered.",
    options: [
      "Koruyucu ozon tabakası olmasaydı, zararlı morötesi ışınlar Dünya yüzeyine büyük ölçüde süzülmeden ulaşırdı.",
      "Koruyucu ozon tabakası olduğu için, zararlı morötesi ışınlar Dünya yüzeyine hiç ulaşmaz.",
      "Koruyucu ozon tabakası olmadığından, zararlı morötesi ışınlar Dünya yüzeyine hiçbir zaman ulaşmamıştır.",
      "Koruyucu ozon tabakası olmasaydı, zararlı morötesi ışınlar Dünya yüzeyine hiç ulaşamazdı.",
    ],
    correctIndex: 0,
    explanation:
      "Devrik koşul yapısı ('Were it not for...') gerçek dışı bir durumu anlatır: ozon tabakası gerçekte vardır ve bu sayede ışınlar büyük ölçüde süzülür; eğer olmasaydı ışınlar süzülmeden ulaşırdı. Bu A'da doğru veriliyor. B durumu gerçekmiş gibi anlatıyor, C 'hiçbir zaman ulaşmamıştır' diyerek anlamı çarpıtıyor, D 'hiç ulaşamazdı' diyerek anlamı tam tersine çeviriyor.",
    tags: ["conditional-translation"],
    mockSetNumber: 3,
  },
  // ---- Çeviri TR-EN (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Bitkiler büyümek için güneş ışığına ihtiyaç duyar.",
    options: [
      "Plants need sunlight to grow.",
      "Plants needed sunlight to grow.",
      "Plants will need sunlight to grow.",
      "Plants do not need sunlight to grow.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zamanda genel bir gerçeği anlatır; doğru çeviri şimdiki geniş zaman kullanan A'dır. B geçmiş zaman, C gelecek zaman kullanıyor, D anlamı tersine çeviriyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu bölgedeki kayaçlar, milyonlarca yıl süren erozyon sonucunda şekillenmiştir.",
    options: [
      "The rocks in this region have been shaped by millions of years of erosion.",
      "The rocks in this region will be shaped by millions of years of erosion.",
      "The rocks in this region shaped millions of years of erosion.",
      "The rocks in this region were shaping millions of years of erosion.",
    ],
    correctIndex: 0,
    explanation:
      "'Şekillenmiştir' (present perfect, edilgen) 'have been shaped' ile karşılanır. B gelecek zaman kullanıyor; C ve D özne-nesne ilişkisini ve çatıyı bozuyor (kayaçlar erozyonu şekillendirmiyor, erozyon kayaçları şekillendiriyor).",
    tags: ["passive-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Devredeki arıza, aşırı yüklenmeden kaynaklanıyor olabilir.",
    options: [
      "The fault in the circuit may be caused by overloading.",
      "The fault in the circuit is definitely caused by overloading.",
      "The fault in the circuit caused the overloading.",
      "The fault in the circuit could not be caused by overloading.",
    ],
    correctIndex: 0,
    explanation:
      "'-ıyor olabilir' bir olasılık bildirir ve 'may be caused' ile karşılanır. B kesinlik ekliyor, C neden-sonuç ilişkisini tersine çeviriyor, D anlamı olumsuza çeviriyor.",
    tags: ["modal-passive-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Nesnenin hızı ölçülene kadar, ivmesi kesin olarak bilinemezdi.",
    options: [
      "Until the object's speed was measured, its acceleration could not be known for certain.",
      "Until the object's speed was measured, its acceleration was known for certain.",
      "After the object's speed was measured, its acceleration could not be known for certain.",
      "Until the object's speed is measured, its acceleration cannot be known for certain.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geçmiş zamanda bir imkansızlığı anlatır ('bilinemezdi'); bu 'could not be known' ile karşılanan A'da doğru verilmiştir. B anlamı tersine çeviriyor, C 'until'ı 'after' ile değiştirerek zaman ilişkisini bozuyor, D cümleyi geniş zamana taşıyarak orijinal geçmiş zaman anlamını kaybediyor.",
    tags: ["past-modal-translation"],
    mockSetNumber: 3,
  },
  // ---- Okuma (4, tek parça) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre, antibiyotik direncinin hızlanmasına ne sebep olur?",
    passageText:
      "Antibiotic resistance occurs when bacteria evolve mechanisms to survive drugs that once killed them effectively. This process is accelerated by the overuse of antibiotics in both medicine and agriculture. When a bacterial population is exposed to an antibiotic, most susceptible cells die, but any cells carrying a resistance mutation survive and reproduce, passing the trait to future generations. Over time, this natural selection can produce strains resistant to multiple drugs at once. Public health officials now consider antibiotic resistance one of the most urgent threats to global health, warning that once-routine infections could become difficult to cure.",
    options: [
      "Antibiyotiklerin tıpta ve tarımda aşırı kullanımı",
      "Bakterilerin doğal olarak azalması",
      "Yeni antibiyotiklerin keşfedilmesi",
      "Halk sağlığı yetkililerinin uyarıları",
    ],
    correctIndex: 0,
    explanation:
      "Parçada 'accelerated by the overuse of antibiotics in both medicine and agriculture' deniyor; süreci hızlandıran budur.",
    tags: ["detail-question"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre, bir bakteri popülasyonu antibiyotiğe maruz kaldığında ne olur?",
    passageText:
      "Antibiotic resistance occurs when bacteria evolve mechanisms to survive drugs that once killed them effectively. This process is accelerated by the overuse of antibiotics in both medicine and agriculture. When a bacterial population is exposed to an antibiotic, most susceptible cells die, but any cells carrying a resistance mutation survive and reproduce, passing the trait to future generations. Over time, this natural selection can produce strains resistant to multiple drugs at once. Public health officials now consider antibiotic resistance one of the most urgent threats to global health, warning that once-routine infections could become difficult to cure.",
    options: [
      "Tüm bakteriler hayatta kalır.",
      "Direnç mutasyonu taşıyan hücreler hayatta kalıp çoğalır.",
      "Bakterilerin tamamı anında ölür.",
      "Antibiyotik etkisiz hale gelir.",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'any cells carrying a resistance mutation survive and reproduce' deniyor; duyarlı hücreler ölürken dirençli olanlar hayatta kalıp çoğalır.",
    tags: ["detail-question"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "Antibiotic resistance occurs when bacteria evolve mechanisms to survive drugs that once killed them effectively. This process is accelerated by the overuse of antibiotics in both medicine and agriculture. When a bacterial population is exposed to an antibiotic, most susceptible cells die, but any cells carrying a resistance mutation survive and reproduce, passing the trait to future generations. Over time, this natural selection can produce strains resistant to multiple drugs at once. Public health officials now consider antibiotic resistance one of the most urgent threats to global health, warning that once-routine infections could become difficult to cure.",
    options: [
      "Antibiyotiklerin nasıl üretildiği",
      "Antibiyotik direncinin nasıl geliştiği ve neden ciddi bir tehdit oluşturduğu",
      "Tarımda kullanılan ilaç türleri",
      "Bakterilerin beslenme şekilleri",
    ],
    correctIndex: 1,
    explanation:
      "Parça, antibiyotik direncinin gelişim mekanizmasını ve bunun halk sağlığı açısından önemini anlatır; diğer konular parçada ele alınmaz.",
    tags: ["main-idea"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçadan aşağıdakilerden hangisi çıkarılabilir?",
    passageText:
      "Antibiotic resistance occurs when bacteria evolve mechanisms to survive drugs that once killed them effectively. This process is accelerated by the overuse of antibiotics in both medicine and agriculture. When a bacterial population is exposed to an antibiotic, most susceptible cells die, but any cells carrying a resistance mutation survive and reproduce, passing the trait to future generations. Over time, this natural selection can produce strains resistant to multiple drugs at once. Public health officials now consider antibiotic resistance one of the most urgent threats to global health, warning that once-routine infections could become difficult to cure.",
    options: [
      "Antibiyotik direnci, yeni tedaviler geliştirilmezse gelecekte enfeksiyonların tedavisini zorlaştırabilir.",
      "Antibiyotikler artık hiçbir enfeksiyona karşı etkili değildir.",
      "Tarımda antibiyotik kullanımı tamamen yasaklanmıştır.",
      "Bakteriler antibiyotiklere karşı direnç geliştiremez.",
    ],
    correctIndex: 0,
    explanation:
      "Parçadaki 'once-routine infections could become difficult to cure' uyarısı, yeni tedaviler geliştirilmezse gelecekte sorun yaşanabileceğini ima eder; diğer seçenekler metnin ötesine geçen kesin/yanlış iddialardır.",
    tags: ["inference"],
    mockSetNumber: 3,
  },

  // ============================================================
  // DENEME 4
  // ============================================================
  // ---- Kelime Bilgisi (8) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "The Moon's ---- pull on the Earth is the primary cause of ocean tides.",
    options: ["gravitational", "magnetic", "thermal", "chemical"],
    correctIndex: 0,
    explanation:
      "Gelgitlerin temel nedeni Ay'ın Dünya üzerindeki yerçekimsel ('gravitational') çekim kuvvetidir. 'Magnetic', 'thermal' ve 'chemical' bu olayı açıklamaz.",
    tags: ["astronomy-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The ---- of the two triangles' corresponding sides remained constant, confirming that the shapes were similar.",
    options: ["ratio", "remainder", "product", "root"],
    correctIndex: 0,
    explanation:
      "Benzer şekillerde karşılıklı kenarların oranı ('ratio') sabittir; bu benzerliğin tanımıdır. 'Remainder' (kalan), 'product' (çarpım) ve 'root' (kök) bu bağlama uymaz.",
    tags: ["mathematics-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Factories that ---- large quantities of carbon dioxide are increasingly required to install filtration systems.",
    options: ["emit", "absorb", "recycle", "filter"],
    correctIndex: 0,
    explanation:
      "'Emit' (yaymak/salmak) fabrikaların gaz salımını ifade eder; cümledeki 'filtration systems' gereksinimi bunu destekler. 'Absorb' (emmek) anlamca zıttır; 'recycle' ve 'filter' bağlamla tutarsızdır.",
    tags: ["environmental-science-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Sugar will ---- more quickly in hot water than in cold water because heat increases molecular movement.",
    options: ["dissolve", "evaporate", "condense", "freeze"],
    correctIndex: 0,
    explanation:
      "Şekerin suda çözünmesi 'dissolve' fiiliyle ifade edilir ve ısıyla hızlanır. 'Evaporate' (buharlaşmak), 'condense' (yoğunlaşmak) ve 'freeze' (donmak) farklı fiziksel süreçlerdir.",
    tags: ["chemistry-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Astronomers use a star's ----, rather than its apparent brightness, to determine its true energy output.",
    options: ["luminosity", "latitude", "velocity", "salinity"],
    correctIndex: 0,
    explanation:
      "Bir yıldızın gerçek enerji çıktısı 'luminosity' (parlaklık/ışınım gücü) ile ölçülür. 'Latitude' (enlem), 'velocity' (hız) ve 'salinity' (tuzluluk) bu bağlamla ilgisizdir.",
    tags: ["astronomy-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Sensitive data is often ---- before being transmitted over the internet to prevent unauthorized access.",
    options: ["encrypted", "deleted", "duplicated", "compressed"],
    correctIndex: 0,
    explanation:
      "Yetkisiz erişimi önlemek için verinin şifrelenmesi ('encrypted') anlatılıyor. 'Deleted' (silinmiş), 'duplicated' (çoğaltılmış) ve 'compressed' (sıkıştırılmış) güvenlik amacını karşılamaz.",
    tags: ["computer-science-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Without a proper ----, friction between the moving parts would cause the engine to overheat rapidly.",
    options: ["lubricant", "insulator", "conductor", "catalyst"],
    correctIndex: 0,
    explanation:
      "Yağlayıcı (lubricant) hareketli parçalar arasındaki sürtünmeyi azaltır; olmadığında aşırı ısınma olur. 'Insulator' ve 'conductor' elektrikle, 'catalyst' kimyasal reaksiyonlarla ilgilidir.",
    tags: ["mechanical-engineering-vocab"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Governments are investing in renewable energy to ---- the effects of climate change on vulnerable coastal communities.",
    options: ["mitigate", "intensify", "ignore", "accelerate"],
    correctIndex: 0,
    explanation:
      "'Mitigate' (hafifletmek/azaltmak) yenilenebilir enerjiye yatırımın amacıyla örtüşür. 'Intensify' (yoğunlaştırmak) ve 'accelerate' (hızlandırmak) anlamca zıttır, 'ignore' (görmezden gelmek) bağlamla çelişir.",
    tags: ["environmental-science-vocab"],
    mockSetNumber: 4,
  },
  // ---- Çeviri EN-TR (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "The telescope allows astronomers to observe distant galaxies.",
    options: [
      "Teleskop, gökbilimcilerin uzak galaksileri gözlemlemesine olanak tanır.",
      "Teleskop, gökbilimcilerin uzak galaksileri gözlemlemesine engel olur.",
      "Teleskop, gökbilimcilerin uzak galaksileri gözlemlemesine olanak tanıyacaktı.",
      "Teleskop, uzak galaksiler tarafından gözlemlendi.",
    ],
    correctIndex: 0,
    explanation:
      "'Allows' geniş zamanda olumlu bir imkanı bildirir; A doğru çeviridir. B anlamı tersine çeviriyor (engellemek), C gereksiz yere geçmişte kalan bir kip kullanıyor, D özne-nesne ilişkisini tamamen tersine çeviriyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["modal-fiiller"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "The experiment must be repeated under controlled conditions before the results can be considered reliable.",
    options: [
      "Sonuçların güvenilir kabul edilebilmesi için deneyin kontrollü koşullar altında tekrarlanması gerekir.",
      "Sonuçlar güvenilir kabul edildiği için deney kontrollü koşullar altında tekrarlandı.",
      "Deney kontrollü koşullar altında tekrarlanabilir ama sonuçlar zaten güvenilirdir.",
      "Sonuçların güvenilir kabul edilebilmesi için deneyin kontrolsüz koşullar altında tekrarlanması gerekir.",
    ],
    correctIndex: 0,
    explanation:
      "'Must be repeated' zorunluluk bildirir ve doğru koşulu ('controlled conditions') içerir; A doğrudur. B neden-sonuç ilişkisini ve zamanı bozuyor, C zaten güvenilir olduğunu iddia ederek koşulu geçersiz kılıyor, D 'kontrollü' yerine 'kontrolsüz' diyerek anlamı tersine çeviriyor.",
    tags: ["modal-passive-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "No solution exists for this equation within the set of real numbers.",
    options: [
      "Bu denklem için reel sayılar kümesinde hiçbir çözüm yoktur.",
      "Bu denklem için reel sayılar kümesinde birden fazla çözüm vardır.",
      "Bu denklem için karmaşık sayılar kümesinde hiçbir çözüm yoktur.",
      "Bu denklemin reel sayılar kümesinde bir çözümü olabilir.",
    ],
    correctIndex: 0,
    explanation:
      "'No solution exists...within the set of real numbers' ifadesi tam olarak A'da karşılanmıştır. B 'hiçbir' yerine 'birden fazla' diyerek anlamı tersine çeviriyor, C 'reel' yerine 'karmaşık' sayı kümesinden bahsediyor, D kesin bir olumsuzluğu belirsiz bir olasılığa dönüştürüyor.",
    tags: ["mathematics-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "So precisely was the component machined that it fit into the assembly without any adjustment.",
    options: [
      "Bileşen o kadar hassas bir şekilde işlenmişti ki herhangi bir ayarlama yapılmadan montaja oturdu.",
      "Bileşen o kadar kabaca işlenmişti ki montaja oturması için ayarlama gerekti.",
      "Bileşen hassas bir şekilde işlenecekti ve montaja kolayca oturacaktı.",
      "Bileşen montaja oturmadığı için yeniden işlenmesi gerekti.",
    ],
    correctIndex: 0,
    explanation:
      "Devrik yapı ('So precisely...that') sonucu vurgular: bileşen o kadar hassas işlenmişti ki ayarlamaya gerek kalmadı; bu A'da doğru verilmiştir. B 'kabaca' diyerek anlamı tersine çeviriyor, C gelecek zamana kaydırıyor, D metinde olmayan bir başarısızlığı anlatıyor.",
    tags: ["inversion-translation"],
    mockSetNumber: 4,
  },
  // ---- Çeviri TR-EN (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Yıldızlar, çekirdeklerindeki nükleer füzyon sayesinde ışık ve ısı üretir.",
    options: [
      "Stars produce light and heat through nuclear fusion in their cores.",
      "Stars produced light and heat through nuclear fusion in their cores.",
      "Stars will produce light and heat through nuclear fusion in their cores.",
      "Stars absorb light and heat through nuclear fusion in their cores.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zamanda genel bir bilimsel gerçeği anlatır; A geniş zamanla ('produce') bunu doğru karşılar. B geçmiş zaman, C gelecek zaman kullanıyor, D 'absorb' diyerek anlamı tersine çeviriyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt:
      "Yenilenebilir enerji kaynaklarına yatırım yapılmazsa, fosil yakıtlara olan bağımlılık artmaya devam edecektir.",
    options: [
      "If investments are not made in renewable energy sources, dependence on fossil fuels will continue to increase.",
      "If investments were not made in renewable energy sources, dependence on fossil fuels would continue to increase.",
      "Because investments are made in renewable energy sources, dependence on fossil fuels will decrease.",
      "Unless investments are made in renewable energy sources, dependence on fossil fuels stopped increasing.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 1. tip koşul (gerçek/olası gelecek) yapısındadır; doğru çeviri 'If...are not made...will continue' kullanan A'dır. B 2. tip (varsayımsal) koşula kaydırıyor, C neden-sonuç ve anlamı tamamen tersine çeviriyor, D zaman uyumsuzluğu içeriyor.",
    tags: ["conditional-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Kullanıcı verileri, üçüncü taraflarla paylaşılmadan önce şifrelenir.",
    options: [
      "User data is encrypted before being shared with third parties.",
      "User data was encrypted after being shared with third parties.",
      "User data will never be shared with third parties.",
      "User data encrypts itself before sharing with third parties.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zaman edilgen yapı kullanır ('şifrelenir'); bu 'is encrypted' ile karşılanan A'da doğru verilmiştir. B zaman ve sırayı değiştiriyor, C metinde olmayan kesin bir iddia ekliyor, D dilbilgisel olarak hatalı bir yapı kuruyor.",
    tags: ["passive-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt:
      "Eğer evren sonsuza dek genişlemeye devam ederse, galaksiler birbirinden gitgide daha da uzaklaşacaktır.",
    options: [
      "If the universe continues to expand forever, galaxies will move increasingly farther apart from one another.",
      "If the universe had continued to expand forever, galaxies would have moved increasingly farther apart from one another.",
      "Although the universe continues to expand forever, galaxies stay at the same distance from one another.",
      "If the universe stops expanding, galaxies will move increasingly farther apart from one another.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 1. tip koşul yapısındadır ('genişlemeye devam ederse...uzaklaşacaktır'); doğru çeviri A'dır. B 3. tip koşula kaydırıyor, C 'although' kullanarak anlamı çelişkili hale getiriyor, D koşulu tersine çeviriyor.",
    tags: ["conditional-translation"],
    mockSetNumber: 4,
  },
  // ---- Okuma (4, tek parça) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre, geçiş (transit) yöntemi neyi ölçerek çalışır?",
    passageText:
      "Astronomers detect many exoplanets using the transit method, which relies on measuring tiny dips in a star's brightness. When a planet passes directly between its host star and an observing telescope, it blocks a small fraction of the star's light, causing a brief, periodic dimming. By analyzing how much light is blocked and how often the dimming repeats, scientists can estimate the planet's size and the length of its orbit. This method has been remarkably successful, leading to the discovery of thousands of exoplanets, though it works best for planets whose orbits happen to be aligned edge-on as seen from Earth.",
    options: [
      "Yıldızın sıcaklığındaki değişimleri",
      "Yıldızın parlaklığındaki küçük düşüşleri",
      "Gezegenin kütlesini",
      "Teleskobun konumunu",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'measuring tiny dips in a star's brightness' deniyor; yöntem yıldızın parlaklığındaki küçük düşüşleri ölçer.",
    tags: ["detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt:
      "Parçaya göre, bilim insanları bir gezegenin boyutunu ve yörünge süresini nasıl tahmin eder?",
    passageText:
      "Astronomers detect many exoplanets using the transit method, which relies on measuring tiny dips in a star's brightness. When a planet passes directly between its host star and an observing telescope, it blocks a small fraction of the star's light, causing a brief, periodic dimming. By analyzing how much light is blocked and how often the dimming repeats, scientists can estimate the planet's size and the length of its orbit. This method has been remarkably successful, leading to the discovery of thousands of exoplanets, though it works best for planets whose orbits happen to be aligned edge-on as seen from Earth.",
    options: [
      "Yıldızın renginin değişimini inceleyerek",
      "Engellenen ışık miktarını ve karararmanın ne sıklıkta tekrarlandığını analiz ederek",
      "Gezegenin yüzey sıcaklığını ölçerek",
      "Yıldızın kütlesini doğrudan tartarak",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'By analyzing how much light is blocked and how often the dimming repeats, scientists can estimate the planet's size and the length of its orbit' deniyor.",
    tags: ["detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçanın ana konusu nedir?",
    passageText:
      "Astronomers detect many exoplanets using the transit method, which relies on measuring tiny dips in a star's brightness. When a planet passes directly between its host star and an observing telescope, it blocks a small fraction of the star's light, causing a brief, periodic dimming. By analyzing how much light is blocked and how often the dimming repeats, scientists can estimate the planet's size and the length of its orbit. This method has been remarkably successful, leading to the discovery of thousands of exoplanets, though it works best for planets whose orbits happen to be aligned edge-on as seen from Earth.",
    options: [
      "Yıldızların nasıl oluştuğu",
      "Geçiş yönteminin ötegezegenleri tespit etmede nasıl kullanıldığı",
      "Teleskopların tarihsel gelişimi",
      "Güneş sisteminin yaşı",
    ],
    correctIndex: 1,
    explanation:
      "Parça, geçiş yönteminin nasıl çalıştığını ve ötegezegen keşiflerindeki başarısını anlatır; diğer konular parçada ele alınmaz.",
    tags: ["main-idea"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçadan, geçiş yönteminin bir sınırlılığı hakkında ne çıkarılabilir?",
    passageText:
      "Astronomers detect many exoplanets using the transit method, which relies on measuring tiny dips in a star's brightness. When a planet passes directly between its host star and an observing telescope, it blocks a small fraction of the star's light, causing a brief, periodic dimming. By analyzing how much light is blocked and how often the dimming repeats, scientists can estimate the planet's size and the length of its orbit. This method has been remarkably successful, leading to the discovery of thousands of exoplanets, though it works best for planets whose orbits happen to be aligned edge-on as seen from Earth.",
    options: [
      "Yalnızca çok büyük yıldızlarda kullanılabilir.",
      "Yörüngesi Dünya'dan bakıldığında tam kenardan hizalı olmayan gezegenler için en iyi sonucu vermez.",
      "Hiçbir zaman gezegen keşfetmemiştir.",
      "Yalnızca güneş sistemimizdeki gezegenler için geçerlidir.",
    ],
    correctIndex: 1,
    explanation:
      "Parçanın sonunda yöntemin 'works best for planets whose orbits happen to be aligned edge-on as seen from Earth' olduğu belirtilir; bu, hizalanmamış yörüngeler için yöntemin daha az etkili olduğunu ima eder.",
    tags: ["inference"],
    mockSetNumber: 4,
  },

  // ============================================================
  // DENEME 5
  // ============================================================
  // ---- Kelime Bilgisi (8) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Steel is an ---- made primarily of iron and carbon, with the carbon content determining its hardness.",
    options: ["alloy", "isotope", "enzyme", "compound"],
    correctIndex: 0,
    explanation:
      "Alaşım (alloy), iki veya daha fazla metalin (burada demir ve karbon) karışımıdır. 'Compound' sabit oranlı kimyasal bağları ima eder ve alaşımlar için doğru terim değildir; 'isotope' ve 'enzyme' bağlamla ilgisizdir.",
    tags: ["materials-science-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Before construction begins, engineers must ensure the ---- is strong enough to support the entire weight of the building.",
    options: ["foundation", "ceiling", "corridor", "facade"],
    correctIndex: 0,
    explanation:
      "Temel (foundation) binanın ağırlığını taşıyan alt yapıdır. 'Ceiling' (tavan), 'corridor' (koridor) ve 'facade' (cephe) bu işlevi görmez.",
    tags: ["civil-engineering-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The cell ---- controls which substances can enter or leave the cell, acting as a selective barrier.",
    options: ["membrane", "nucleus", "chromosome", "cytoplasm"],
    correctIndex: 0,
    explanation:
      "Hücre zarı (membrane) seçici geçirgen bir bariyer olarak madde giriş çıkışını kontrol eder. 'Nucleus' (çekirdek), 'chromosome' (kromozom) ve 'cytoplasm' (sitoplazma) bu işlevi üstlenmez.",
    tags: ["biology-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Thick layers of foam are used to ---- the walls, reducing the amount of heat that escapes during winter.",
    options: ["insulate", "conduct", "amplify", "magnetize"],
    correctIndex: 0,
    explanation:
      "Yalıtmak (insulate) ısı kaybını azaltır; cümledeki sonuç ('reducing the amount of heat that escapes') bunu doğrular. 'Conduct' (iletmek) anlamca zıttır; 'amplify' ve 'magnetize' bağlamla ilgisizdir.",
    tags: ["physics-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Geologists identified more than a dozen distinct ---- in the canyon wall, each representing a different period of deposition.",
    options: ["strata", "craters", "glaciers", "deltas"],
    correctIndex: 0,
    explanation:
      "Tabakalar (strata), kanyon duvarındaki farklı çökelme dönemlerini temsil eden jeolojik katmanlardır. 'Craters' (krater), 'glaciers' (buzul) ve 'deltas' (delta) bu bağlamla ilgisizdir.",
    tags: ["geology-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The new pavement material is far more ---- than asphalt, lasting decades without significant cracking.",
    options: ["durable", "fragile", "flammable", "transparent"],
    correctIndex: 0,
    explanation:
      "Dayanıklı (durable) uzun ömürlü olmayı ifade eder; cümledeki 'lasting decades' bunu doğrular. 'Fragile' (kırılgan) anlamca zıttır; 'flammable' ve 'transparent' bağlamla ilgisizdir.",
    tags: ["civil-engineering-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt: "Diamond has an unusually high thermal ----, despite being an electrical insulator.",
    options: ["conductivity", "opacity", "elasticity", "salinity"],
    correctIndex: 0,
    explanation:
      "Elmasın yüksek ısıl iletkenliği (thermal conductivity) olağandışı bir özelliğidir. 'Opacity' (matlık), 'elasticity' (esneklik) ve 'salinity' (tuzluluk) bağlamla ilgisizdir.",
    tags: ["materials-science-vocab"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Because the membrane is selectively ----, small molecules like water can pass through while larger ones cannot.",
    options: ["permeable", "opaque", "rigid", "sterile"],
    correctIndex: 0,
    explanation:
      "Seçici geçirgen (selectively permeable) bir zar küçük moleküllerin geçmesine izin verir. 'Opaque' (mat/görünmez), 'rigid' (katı/esnemez) ve 'sterile' (steril) bu özelliği tanımlamaz.",
    tags: ["biology-vocab"],
    mockSetNumber: 5,
  },
  // ---- Çeviri EN-TR (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Concrete becomes significantly stronger as it cures over time.",
    options: [
      "Beton, zamanla kürlendikçe önemli ölçüde güçlenir.",
      "Beton, zamanla kürlendikçe önemli ölçüde zayıflar.",
      "Beton, kürlenmeden önce önemli ölçüde güçlüdür.",
      "Beton zamanla kürlenecek ve önemli ölçüde güçlenecekti.",
    ],
    correctIndex: 0,
    explanation:
      "'Becomes stronger' geniş zamanda olumlu bir değişimi anlatır; A doğrudur. B anlamı tersine çeviriyor (zayıflamak), C süreç sırasını tersine çeviriyor, D gereksiz karışık bir zaman kullanıyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "Certain species of bacteria can survive extreme conditions that would be lethal to most other organisms.",
    options: [
      "Bazı bakteri türleri, diğer çoğu organizma için ölümcül olacak aşırı koşullarda hayatta kalabilir.",
      "Bazı bakteri türleri, diğer çoğu organizma için ölümcül olacak aşırı koşullarda hayatta kalamaz.",
      "Tüm bakteri türleri, diğer çoğu organizma için ölümcül olacak aşırı koşullarda hayatta kalabilir.",
      "Bazı bakteri türleri, aşırı koşullarda diğer organizmaları öldürür.",
    ],
    correctIndex: 0,
    explanation:
      "'Can survive' yetenek bildirir ve 'hayatta kalabilir' ile karşılanır; A doğrudur. B anlamı tersine çeviriyor, C 'bazı' yerine 'tüm' diyerek genellemeyi bozuyor, D özneyi ve anlamı tamamen değiştiriyor.",
    tags: ["modal-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The canyon was carved over millions of years by the relentless force of flowing water.",
    options: [
      "Kanyon, akan suyun amansız gücüyle milyonlarca yıl boyunca oyulmuştur.",
      "Kanyon, akan suyun amansız gücüyle birkaç yıl içinde oyulmuştur.",
      "Kanyon, milyonlarca yıl boyunca rüzgarın amansız gücüyle oyulmuştur.",
      "Kanyon, akan suyun amansız gücünü milyonlarca yıl boyunca durdurmuştur.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'over millions of years' ve 'by...flowing water' unsurları A'da doğru şekilde verilmiştir. B süreyi çarpıtıyor, C 'su' yerine 'rüzgar' diyor, D anlamı tamamen tersine çeviriyor.",
    tags: ["passive-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Had the bridge's cables not been inspected regularly, corrosion might have gone unnoticed until it was too late.",
    options: [
      "Köprünün halatları düzenli olarak denetlenmeseydi, korozyon çok geç olana kadar fark edilmeyebilirdi.",
      "Köprünün halatları düzenli olarak denetlendiği için korozyon hiçbir zaman oluşmadı.",
      "Köprünün halatları düzenli olarak denetlenmediği için korozyon fark edilmeden yayıldı.",
      "Köprünün halatları düzenli olarak denetlenecek, böylece korozyon fark edilecekti.",
    ],
    correctIndex: 0,
    explanation:
      "3. tip (geçmişe yönelik gerçek dışı) koşul yapısı, halatların gerçekte düzenli denetlendiğini ve bu sayede korozyonun fark edildiğini ima eder; A bu gerçek-dışılığı doğru yansıtır. B durumu kesin bir gerçekmiş gibi anlatıyor, C denetlenmediğini iddia ederek metinle çelişiyor, D gelecek zamana kaydırıyor.",
    tags: ["conditional-translation"],
    mockSetNumber: 5,
  },
  // ---- Çeviri TR-EN (4) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Mühendisler, gökdelenin rüzgara karşı dayanıklılığını test ettiler.",
    options: [
      "Engineers tested the skyscraper's resistance to wind.",
      "Engineers will test the skyscraper's resistance to wind.",
      "Engineers are testing the skyscraper's resistance to wind.",
      "Engineers tested the skyscraper's resistance to earthquakes.",
    ],
    correctIndex: 0,
    explanation:
      "'Test ettiler' basit geçmiş zaman bildirir ve 'rüzgar'a atıf yapar; A hem zamanı hem de doğru unsuru ('wind') içerir. B gelecek, C şimdiki zaman kullanıyor, D 'wind' yerine 'earthquakes' diyerek metindeki bilgiyi değiştiriyor.",
    tags: ["past-simple-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu malzeme, yüksek sıcaklıklara maruz kaldığında şeklini kaybetmez.",
    options: [
      "This material does not lose its shape when exposed to high temperatures.",
      "This material loses its shape when exposed to high temperatures.",
      "This material did not lose its shape when exposed to high temperatures.",
      "This material will lose its shape when exposed to low temperatures.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zamanda olumsuz bir gerçek bildirir ('kaybetmez'); A bunu doğru karşılar. B anlamı olumluya çeviriyor, C geçmiş zaman kullanıyor, D hem zamanı hem de 'high' yerine 'low' kullanarak anlamı bozuyor.",
    tags: ["present-simple-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Yapının deprem güvenliği, her yıl düzenli olarak denetlenmektedir.",
    options: [
      "The structure's earthquake safety is regularly inspected every year.",
      "The structure's earthquake safety was regularly inspected every year.",
      "The structure's earthquake safety will be inspected only once.",
      "The structure's earthquake safety is rarely inspected.",
    ],
    correctIndex: 0,
    explanation:
      "'-mektedir' eki şimdiki zamanda süregelen bir eylemi bildirir; A 'is regularly inspected' ile bunu doğru karşılar. B geçmiş zamana kaydırıyor, C 'sadece bir kez' diyerek düzenliliği reddediyor, D 'nadiren' diyerek anlamı tersine çeviriyor.",
    tags: ["passive-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt:
      "Bağışıklık sistemi, vücuda giren patojenleri tanıyıp yok edecek şekilde tasarlanmış karmaşık bir savunma ağıdır.",
    options: [
      "The immune system is a complex defense network designed to recognize and destroy pathogens that enter the body.",
      "The immune system is a simple defense network designed to recognize and destroy pathogens that enter the body.",
      "The immune system is a complex defense network that pathogens use to enter the body.",
      "The immune system was a complex defense network designed to recognize and destroy pathogens that entered the body.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümledeki 'karmaşık' ve 'tanıyıp yok edecek şekilde tasarlanmış' unsurları A'da tam olarak karşılanmıştır. B 'complex' yerine 'simple' diyerek anlamı tersine çeviriyor, C özne-nesne ilişkisini bozarak patojenlerin bağışıklık sistemini kullandığını ima ediyor, D gereksiz yere geçmiş zamana kaydırıyor.",
    tags: ["biology-translation"],
    mockSetNumber: 5,
  },
  // ---- Okuma (4, tek parça) ----
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre, kendini onaran betondaki bakteriler ne zaman aktif hale gelir?",
    passageText:
      "Researchers have developed a new type of concrete capable of repairing its own cracks without human intervention. The material contains dormant bacteria embedded within capsules that remain inactive as long as the concrete stays dry and intact. When a crack forms and water seeps in, the bacteria are activated and begin producing limestone, which gradually fills the crack from the inside. Because untreated cracks often allow water and salts to corrode the steel reinforcement within concrete structures, this self-healing property could significantly extend the lifespan of bridges, tunnels, and buildings while reducing long-term maintenance costs.",
    options: [
      "Beton kuru kaldığı sürece",
      "Bir çatlak oluşup içine su sızdığında",
      "Beton ilk döküldüğünde",
      "Çelik donatı paslandığında",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'When a crack forms and water seeps in, the bacteria are activated' deniyor; bakteriler ancak bu koşulda aktive olur.",
    tags: ["detail-question"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre, aktive olan bakteriler ne üretir?",
    passageText:
      "Researchers have developed a new type of concrete capable of repairing its own cracks without human intervention. The material contains dormant bacteria embedded within capsules that remain inactive as long as the concrete stays dry and intact. When a crack forms and water seeps in, the bacteria are activated and begin producing limestone, which gradually fills the crack from the inside. Because untreated cracks often allow water and salts to corrode the steel reinforcement within concrete structures, this self-healing property could significantly extend the lifespan of bridges, tunnels, and buildings while reducing long-term maintenance costs.",
    options: ["Kireçtaşı (limestone)", "Çelik", "Tuz", "Su"],
    correctIndex: 0,
    explanation:
      "Parçada 'begin producing limestone, which gradually fills the crack' deniyor; bakteriler kireçtaşı üretir.",
    tags: ["detail-question"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "Researchers have developed a new type of concrete capable of repairing its own cracks without human intervention. The material contains dormant bacteria embedded within capsules that remain inactive as long as the concrete stays dry and intact. When a crack forms and water seeps in, the bacteria are activated and begin producing limestone, which gradually fills the crack from the inside. Because untreated cracks often allow water and salts to corrode the steel reinforcement within concrete structures, this self-healing property could significantly extend the lifespan of bridges, tunnels, and buildings while reducing long-term maintenance costs.",
    options: [
      "Betonun nasıl üretildiği",
      "Çatlakları kendiliğinden onarabilen yeni bir beton türü ve faydaları",
      "Çelik donatının nasıl paslandığı",
      "Köprü inşaatının maliyeti",
    ],
    correctIndex: 1,
    explanation:
      "Parça, kendini onaran betonun çalışma mekanizmasını ve sağladığı faydaları (bakım maliyetlerinin azalması, ömrün uzaması) anlatır.",
    tags: ["main-idea"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_FEN",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçadan aşağıdakilerden hangisi çıkarılabilir?",
    passageText:
      "Researchers have developed a new type of concrete capable of repairing its own cracks without human intervention. The material contains dormant bacteria embedded within capsules that remain inactive as long as the concrete stays dry and intact. When a crack forms and water seeps in, the bacteria are activated and begin producing limestone, which gradually fills the crack from the inside. Because untreated cracks often allow water and salts to corrode the steel reinforcement within concrete structures, this self-healing property could significantly extend the lifespan of bridges, tunnels, and buildings while reducing long-term maintenance costs.",
    options: [
      "Kendini onaran beton, geleneksel betona göre yapıların ömrünü uzatabilir.",
      "Kendini onaran beton, su ile hiçbir zaman temas etmemelidir.",
      "Bakteriler beton kuruduktan hemen sonra ölür.",
      "Çelik donatı artık hiçbir yapıda kullanılmamaktadır.",
    ],
    correctIndex: 0,
    explanation:
      "Parçada, onarılmamış çatlakların çelik donatıyı korozyona uğrattığı ve kendini onaran özelliğin yapıların ömrünü uzatabileceği belirtilir; bu A'daki çıkarımı destekler. Diğer seçenekler metinle çelişir veya metinde belirtilmez.",
    tags: ["inference"],
    mockSetNumber: 5,
  },
];
