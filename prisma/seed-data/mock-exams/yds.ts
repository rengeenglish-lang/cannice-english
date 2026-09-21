import type { DiagnosticQuestionSeed } from "../diagnostic-questions";

export const MOCK_YDS: DiagnosticQuestionSeed[] = [
  // ============================================================
  // DENEME 1
  // ============================================================

  // -- Kelime Bilgisi --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Despite repeated warnings from environmental groups, the factory continued to ---- toxic waste into the river.",
    options: ["discharge", "decorate", "dismiss", "discount"],
    correctIndex: 0,
    explanation:
      "'toxic waste into the river' ifadesiyle birlikte kullanılan doğru fiil 'discharge' (boşaltmak/salmak)'tır. 'Decorate' (süslemek), 'dismiss' (görevden almak) ve 'discount' (indirim yapmak) bağlama uymaz.",
    tags: ["synonym-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The company's ---- growth over the past five years attracted the attention of several international investors.",
    options: ["rapid", "rapidly", "rapidity", "rapids"],
    correctIndex: 0,
    explanation:
      "Boşluk, ismi ('growth') niteleyen bir sıfat gerektirir; 'rapid' doğru sözcük türüdür. 'Rapidly' bir zarf, 'rapidity' bir isim, 'rapids' ise ('nehir sığlıkları' anlamında) ilgisiz bir isimdir.",
    tags: ["word-form"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Before reaching a final verdict, the jury had to ---- all the evidence presented during the trial.",
    options: ["weigh", "weight", "way", "wait"],
    correctIndex: 0,
    explanation:
      "'weigh the evidence' (kanıtları tartmak/değerlendirmek) sabit bir collocation'dır. 'Weight' bir isim, 'way' ve 'wait' ise anlamca bağlama uymayan sesteş kelimelerdir.",
    tags: ["collocation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The negotiations broke ---- after neither side was willing to compromise on the price, and the meeting ended without any agreement.",
    options: ["down", "along", "through", "back"],
    correctIndex: 0,
    explanation:
      "'break down' (çökmek/başarısız olmak) görüşmelerin sonuçsuz kalmasını anlatan doğru phrasal verb'dür; cümlenin sonunda anlaşmaya varılamadığı belirtilir. 'Break through' tam tersi bir anlam taşır (çığır açmak), 'along' ve 'back' bu fiille bu şekilde kullanılmaz.",
    tags: ["phrasal-verb"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Her ---- to detail made her the ideal candidate for the position of quality control manager.",
    options: ["attention", "intention", "attendance", "tendency"],
    correctIndex: 0,
    explanation:
      "'attention to detail' (detaylara dikkat) sabit bir ifadedir ve kalite kontrol yöneticiliği için aranan niteliği tanımlar. Diğer isimler bu kalıpta kullanılmaz.",
    tags: ["fixed-expression"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The professor's argument, though ---- on the surface, contained several logical inconsistencies once examined closely.",
    options: ["compelling", "repulsive", "arbitrary", "negligible"],
    correctIndex: 0,
    explanation:
      "'though' zıtlık kurar: yüzeyde ikna edici ('compelling') görünse de yakından incelenince mantık hataları içerdiği anlatılır. Diğer seçenekler bu zıtlığı kurmaz ve bağlamla uyuşmaz.",
    tags: ["contrast-clue"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The government's reluctance to ---- the new regulations has drawn sharp criticism from environmental activists.",
    options: ["enforce", "force", "reinforce", "enforcement"],
    correctIndex: 0,
    explanation:
      "'enforce regulations' (yönetmelikleri uygulamak/yürürlüğe koymak) doğru collocation'dır. 'Reinforce' (güçlendirmek) farklı bir anlam taşır, 'force' bu isimle bu şekilde kullanılmaz, 'enforcement' ise 'to' sonrası gereken fiil yerine isimdir.",
    tags: ["collocation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Many economists believe that the current inflation rate is merely a ---- phenomenon that will subside once supply chains stabilize.",
    options: ["permanent", "transient", "chronic", "perpetual"],
    correctIndex: 1,
    explanation:
      "'will subside' (azalacak/geçecek) ifadesi geçici bir durumu ima eder; bu da 'transient' (geçici) ile örtüşür. 'Permanent', 'chronic' ve 'perpetual' kalıcılık anlamı taşır ve 'will subside' ile çelişir.",
    tags: ["contextual-inference"],
    mockSetNumber: 1,
  },

  // -- Çeviri (EN → TR) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "The new policy will take effect starting next January.",
    options: [
      "Yeni politika geçen Ocak ayından itibaren yürürlükteydi.",
      "Yeni politika gelecek yıl Ocak ayından itibaren yürürlüğe girecek.",
      "Yeni politika her yıl Ocak ayında gözden geçirilir.",
      "Yeni politika bu Ocak ayında yürürlükten kalkacak.",
    ],
    correctIndex: 1,
    explanation:
      "'will take effect' gelecek zamanı ve 'yürürlüğe girme' anlamını taşır; B bunu doğru yansıtır. A geçmiş zaman, C farklı bir eylem (gözden geçirme), D ise tam tersi bir anlam (yürürlükten kalkma) içerir.",
    tags: ["future-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "Although the results were promising, the researchers decided to conduct further trials before publishing their findings.",
    options: [
      "Sonuçlar umut verici olsa da araştırmacılar bulgularını yayımlamadan önce ek denemeler yapmaya karar verdiler.",
      "Sonuçlar umut verici olduğu için araştırmacılar bulgularını hemen yayımladılar.",
      "Sonuçlar umut verici olmasa da araştırmacılar ek denemelere gerek görmediler.",
      "Araştırmacılar umut verici sonuçlar elde edinceye kadar denemelerine devam edeceklerdi.",
    ],
    correctIndex: 0,
    explanation:
      "'Although' zıtlık kurar ('olsa da'); 'decided to conduct further trials before publishing' ise yayımlamadan önce ek deneme yapma kararını bildirir. A her iki unsuru da doğru karşılar. B zıtlığı yok sayıp tersini söylüyor, C anlamı tersine çeviriyor, D farklı bir zaman/yapı kuruyor.",
    tags: ["concession-clause"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["sifat-cumlecikleri", "edilgen-cati"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "The bridge, which had been damaged by the storm, was finally repaired last week.",
    options: [
      "Fırtına tarafından hasar gören köprü nihayet geçen hafta onarıldı.",
      "Köprü fırtınadan önce onarılmıştı.",
      "Köprü geçen hafta fırtına yüzünden hasar gördü.",
      "Köprü gelecek hafta onarılacak.",
    ],
    correctIndex: 0,
    explanation:
      "'which had been damaged' (önce gerçekleşmiş edilgen bir durum) köprüyü tanımlar, 'was finally repaired last week' ise ana fiildir. A her iki zaman/çatı unsurunu da doğru sırayla verir. B zaman sırasını tersine çevirir, C farklı bir olay anlatır, D yanlış zaman (gelecek) kullanır.",
    tags: ["past-perfect-passive"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Had the committee reviewed the proposal more carefully, the budget overrun could have been avoided.",
    options: [
      "Komite teklifi daha dikkatli incelemiş olsaydı, bütçe aşımı önlenebilirdi.",
      "Komite teklifi dikkatli inceledi ve bütçe aşımını önledi.",
      "Komite teklifi incelemediği için bütçe aşımı kaçınılmazdı.",
      "Komite teklifi daha dikkatli inceleseydi, bütçe aşımını önleyecekti.",
    ],
    correctIndex: 0,
    explanation:
      "'Had the committee reviewed... could have been avoided' 3. tip koşul cümlesidir (geçmişe yönelik gerçekleşmemiş bir durum); A bunu doğru yansıtır. D 'önleyecekti' diyerek kesinlik ifade eder, oysa İngilizce cümle 'could have been avoided' ile olasılık belirtir; B ve C zıt/farklı anlamlar taşır.",
    tags: ["third-conditional"],
    mockSetNumber: 1,
  },

  // -- Çeviri (TR → EN) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Yeni fabrika, bölgede yüzlerce kişiye istihdam sağlayacak.",
    options: [
      "The new factory will provide employment for hundreds of people in the region.",
      "The new factory provided employment for hundreds of people in the region.",
      "The new factory has provided employment for hundreds of people in the region.",
      "The new factory would have provided employment for hundreds of people in the region.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle gelecek zaman bildirir ('sağlayacak'); bu doğrudan İngilizce basit gelecek zamana ('will provide') karşılık gelir. B geçmiş zaman, C yakın geçmiş/şimdiki zaman, D gerçekleşmemiş bir geçmiş durumu ifade eder.",
    tags: ["future-simple-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Uzmanlar, iklim değişikliğinin tarımsal üretimi olumsuz etkilediğini savunuyorlar.",
    options: [
      "Experts argued that climate change had negatively affected agricultural production.",
      "Experts argue that climate change is negatively affecting agricultural production.",
      "Experts will argue that climate change negatively affects agricultural production.",
      "Experts have argued that climate change would negatively affect agricultural production.",
    ],
    correctIndex: 1,
    explanation:
      "Türkçe cümle şimdiki zamanda süregelen bir iddiayı bildirir ('savunuyorlar'); B bunu 'argue... is negatively affecting' ile doğru karşılar. A ve D geçmiş zaman, C gelecek zaman kullanır ve orijinal anlamdan sapar.",
    tags: ["present-continuous-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu tür kararlar genellikle üst yönetim tarafından alınır.",
    options: [
      "Such decisions are usually made by senior management.",
      "Such decisions were usually made by senior management.",
      "Such decisions are rarely made by senior management.",
      "Such decisions will usually be made by senior management.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zamanlı edilgen bir yapı kurar ('alınır'); A bunu 'are usually made' ile doğru zaman ve çatıyla karşılar. B geçmiş zaman, D gelecek zaman kullanır; C ise 'genellikle' yerine 'nadiren' diyerek anlamı tersine çevirir.",
    tags: ["passive-present-simple-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt:
      "Eğer araştırmacılar bu verileri daha önce paylaşmış olsalardı, salgın çok daha hızlı kontrol altına alınabilirdi.",
    options: [
      "If the researchers had shared this data earlier, the outbreak could have been brought under control much faster.",
      "If the researchers share this data earlier, the outbreak can be brought under control much faster.",
      "If the researchers shared this data earlier, the outbreak would be brought under control much faster.",
      "The researchers shared this data earlier, so the outbreak was brought under control much faster.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 3. tip koşul yapısındadır ('paylaşmış olsalardı... kontrol altına alınabilirdi'); A bu yapıyı 'had shared... could have been brought' ile doğru karşılar. B 1. tip, C 2. tip koşul kurar, D ise koşulu kaldırıp gerçekleşmiş bir olay gibi anlatır.",
    tags: ["third-conditional-translation"],
    mockSetNumber: 1,
  },

  // -- Okuma --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre, güneş paneli üretim maliyetlerindeki düşüşün başlıca nedeni nedir?",
    passageText:
      "Over the past decade, the cost of solar panel production has fallen by more than eighty percent, making solar power one of the cheapest sources of electricity in many parts of the world. This dramatic drop has been driven largely by improvements in manufacturing technology and increased competition among producers. However, experts caution that widespread adoption still depends on solving the problem of energy storage, since solar power cannot be generated at night or during cloudy weather.",
    options: [
      "Devlet sübvansiyonlarının artması",
      "Üretim teknolojisindeki gelişmeler ve üreticiler arası rekabet",
      "Güneş enerjisine olan talebin azalması",
      "Fosil yakıt fiyatlarının düşmesi",
    ],
    correctIndex: 1,
    explanation:
      "Parçada düşüşün büyük ölçüde ('largely') üretim teknolojisindeki gelişmeler ve üreticiler arasındaki artan rekabetten kaynaklandığı belirtilmiştir.",
    tags: ["cause-effect-detail"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre, güneş enerjisinin geniş çapta benimsenmesinin önündeki temel engel nedir?",
    passageText:
      "Over the past decade, the cost of solar panel production has fallen by more than eighty percent, making solar power one of the cheapest sources of electricity in many parts of the world. This dramatic drop has been driven largely by improvements in manufacturing technology and increased competition among producers. However, experts caution that widespread adoption still depends on solving the problem of energy storage, since solar power cannot be generated at night or during cloudy weather.",
    options: [
      "Panellerin hâlâ çok pahalı olması",
      "Enerji depolama sorununun çözülememiş olması",
      "Üreticilerin yeterince rekabetçi olmaması",
      "Güneş panellerinin dayanıksız olması",
    ],
    correctIndex: 1,
    explanation:
      "Parça, güneş enerjisinin gece veya bulutlu havalarda üretilemediğini, bu yüzden yaygın kullanımının enerji depolama sorununun çözümüne bağlı olduğunu belirtir.",
    tags: ["detail-question"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçada geçen 'dramatic' kelimesi bağlama göre en yakın olarak hangi anlama gelir?",
    passageText:
      "Over the past decade, the cost of solar panel production has fallen by more than eighty percent, making solar power one of the cheapest sources of electricity in many parts of the world. This dramatic drop has been driven largely by improvements in manufacturing technology and increased competition among producers. However, experts caution that widespread adoption still depends on solving the problem of energy storage, since solar power cannot be generated at night or during cloudy weather.",
    options: ["önemsiz", "çarpıcı/belirgin", "yavaş", "geçici"],
    correctIndex: 1,
    explanation:
      "'dramatic drop' ifadesi maliyetteki 'yüzde seksenden fazla' düşüşü nitelendirir; bu büyüklükte bir değişim 'çarpıcı/belirgin' anlamına gelen 'dramatic' ile örtüşür.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "Over the past decade, the cost of solar panel production has fallen by more than eighty percent, making solar power one of the cheapest sources of electricity in many parts of the world. This dramatic drop has been driven largely by improvements in manufacturing technology and increased competition among producers. However, experts caution that widespread adoption still depends on solving the problem of energy storage, since solar power cannot be generated at night or during cloudy weather.",
    options: [
      "Güneş enerjisi artık dünyadaki en pahalı elektrik kaynağıdır.",
      "Üretim maliyetleri büyük ölçüde düşmüş olsa da güneş enerjisinin yaygınlaşması hâlâ depolama sorununa bağlıdır.",
      "Enerji depolama sorunu tamamen çözülmüştür.",
      "Güneş panelleri artık gece de elektrik üretebilmektedir.",
    ],
    correctIndex: 1,
    explanation:
      "Parça hem maliyetlerdeki büyük düşüşü hem de yaygın benimsenmenin önündeki temel engeli (depolama sorunu) anlatır; bu ikisini birleştiren B doğru ana fikirdir. Diğer seçenekler metinle çelişir.",
    tags: ["main-idea"],
    mockSetNumber: 1,
  },

  // ============================================================
  // DENEME 2
  // ============================================================

  // -- Kelime Bilgisi --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Archaeologists were astonished to find that the ancient city's drainage system was remarkably ---- for its time, rivaling modern engineering standards.",
    options: ["primitive", "sophisticated", "fragile", "accidental"],
    correctIndex: 1,
    explanation:
      "'rivaling modern engineering standards' ifadesi sistemin çok gelişmiş olduğunu gösterir; bu yüzden 'sophisticated' (gelişmiş/karmaşık) doğru seçenektir. 'Primitive' (ilkel) ve 'fragile' (kırılgan) bu övgüyle çelişir.",
    tags: ["synonym-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The university has decided to ---- its admissions criteria in order to attract a more diverse group of applicants.",
    options: ["revise", "resign", "reverse", "resist"],
    correctIndex: 0,
    explanation:
      "'revise' (gözden geçirmek/değiştirmek) cümledeki amaca (daha çeşitli başvuru sahipleri çekmek) uygun tek fiildir; diğerleri bağlamla uyuşmaz.",
    tags: ["word-choice"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The new algorithm can ---- patterns in massive datasets that would take a human analyst years to detect.",
    options: ["identify", "identical", "identity", "identifiable"],
    correctIndex: 0,
    explanation:
      "Boşluk 'can' yardımcı fiilinden sonra bir fiil kökü gerektirir; 'identify' (belirlemek/tanımlamak) doğru fiil biçimidir. Diğerleri sıfat veya isim biçimleridir.",
    tags: ["word-form"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "City planners have proposed a new zoning law to ---- unchecked urban sprawl into the surrounding farmland.",
    options: ["curb", "curl", "curve", "cure"],
    correctIndex: 0,
    explanation:
      "'curb' (sınırlamak/dizginlemek) kentsel yayılmayı durdurma amacına uyar. Diğer seçenekler ('curl' kıvırmak, 'curve' eğri, 'cure' tedavi etmek) anlamca bağlama uymaz.",
    tags: ["vocabulary"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Despite the doctor's reassurances, the patient remained ---- about the side effects of the new medication.",
    options: ["apprehensive", "apparent", "appreciative", "indifferent"],
    correctIndex: 0,
    explanation:
      "'Despite the doctor's reassurances' (doktorun güvence vermesine rağmen) zıtlık kurar; hastanın hâlâ endişeli olduğu anlaşılır, bu da 'apprehensive' (endişeli/çekingen) ile örtüşür. 'Indifferent' (kayıtsız) ve diğerleri bu zıtlığı karşılamaz.",
    tags: ["contrast-clue"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The senator's speech was widely criticized for being ---- , offering vague promises without any concrete plan of action.",
    options: ["substantive", "hollow", "meticulous", "decisive"],
    correctIndex: 1,
    explanation:
      "'offering vague promises without any concrete plan' ifadesi konuşmanın içerik bakımından boş olduğunu gösterir; bu da 'hollow' (içi boş/anlamsız) ile örtüşür. 'Substantive' (esaslı) ve 'meticulous' (titiz) tam tersini ifade eder.",
    tags: ["contextual-inference"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The two companies have agreed to ---- forces in order to compete more effectively against larger rivals.",
    options: ["join", "attach", "connect", "widen"],
    correctIndex: 0,
    explanation:
      "'join forces' (güçlerini birleştirmek) sabit bir deyimdir; diğer fiiller bu isimle bu anlamda kullanılmaz.",
    tags: ["collocation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The committee's findings were later found to be ---- , as several key statistics had been miscalculated.",
    options: ["flawed", "flawless", "flawlessly", "flaw"],
    correctIndex: 0,
    explanation:
      "'as several key statistics had been miscalculated' bulguların hatalı olduğunu açıklar; bu yüzden 'flawed' (kusurlu/hatalı) doğrudur. 'Flawless' (kusursuz) anlamca terstir, diğerleri sözcük türü olarak uymaz.",
    tags: ["word-form"],
    mockSetNumber: 2,
  },

  // -- Çeviri (EN → TR) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "The museum recently acquired a rare collection of medieval manuscripts.",
    options: [
      "Müze yakın zamanda nadir bir ortaçağ el yazması koleksiyonu edindi.",
      "Müze geçen yıl nadir bir ortaçağ el yazması koleksiyonunu sattı.",
      "Müze gelecek ay nadir bir ortaçağ el yazması koleksiyonu edinecek.",
      "Müzede nadir ortaçağ el yazmaları hiç bulunmuyor.",
    ],
    correctIndex: 0,
    explanation:
      "'recently acquired' yakın geçmişte gerçekleşmiş bir edinme eylemini belirtir; A bunu doğru zaman ve anlamla karşılar. B 'sattı' diyerek tam tersini söyler, C gelecek zaman kullanır, D ise metinle çelişir.",
    tags: ["past-simple-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri", "baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "Unless significant changes are made to the curriculum, student engagement is likely to keep declining.",
    options: [
      "Müfredatta önemli değişiklikler yapılmazsa, öğrenci katılımının azalmaya devam etmesi muhtemeldir.",
      "Müfredatta önemli değişiklikler yapıldığı için öğrenci katılımı artmıştır.",
      "Müfredatta önemli değişiklikler yapılırsa, öğrenci katılımı azalacaktır.",
      "Müfredatta hiçbir zaman değişiklik yapılmayacağı için öğrenci katılımı sabit kalacaktır.",
    ],
    correctIndex: 0,
    explanation:
      "'Unless' olumsuz koşul bildirir ('yapılmazsa'); 'likely to keep declining' ise azalmanın süreceğini belirtir. A bu iki unsuru da doğru verir. C koşulu ters çevirir, B ve D farklı/çelişkili anlamlar taşır.",
    tags: ["conditional-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["sifat-cumlecikleri", "edilgen-cati"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "The report, which was compiled by an independent panel, revealed several flaws in the current system.",
    options: [
      "Bağımsız bir kurul tarafından derlenen rapor, mevcut sistemdeki çeşitli kusurları ortaya çıkardı.",
      "Rapor bağımsız bir kurul tarafından derlenecek ve sistemdeki kusurları ortaya çıkaracak.",
      "Mevcut sistemdeki kusurlar, bağımsız bir kurul tarafından giderildi.",
      "Bağımsız bir kurul, raporu henüz derlemedi.",
    ],
    correctIndex: 0,
    explanation:
      "'which was compiled' geçmiş zamanlı edilgen bir sıfat cümleciğidir ve raporu tanımlar; 'revealed' ana fiildir. A her iki unsuru da doğru sırayla verir. B gelecek zaman, C farklı bir eylem (kusurların giderilmesi), D ise metinle çelişen bir olumsuzluk içerir.",
    tags: ["relative-clause-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Not only did the survey reveal widespread dissatisfaction, but it also exposed a troubling lack of communication between departments.",
    options: [
      "Anket sadece yaygın memnuniyetsizliği değil, aynı zamanda departmanlar arasındaki endişe verici iletişim eksikliğini de ortaya çıkardı.",
      "Anket, departmanlar arasındaki iletişim eksikliğini gidermek için yapıldı.",
      "Anket yaygın memnuniyetsizliği ortaya çıkardı, ancak departmanlar arasında herhangi bir iletişim sorunu bulunmadı.",
      "Anket departmanlar arasındaki iletişimi incelemek amacıyla planlanmıştı ama tamamlanamadı.",
    ],
    correctIndex: 0,
    explanation:
      "'Not only... but also' yapısı iki bilgiyi birlikte vurgular: hem yaygın memnuniyetsizlik hem de iletişim eksikliği. A bu iki unsuru da doğru aktarır. C ikinci kısmı yok sayıp çelişki yaratır, B ve D metinde olmayan amaç/durumlar ekler.",
    tags: ["not-only-but-also"],
    mockSetNumber: 2,
  },

  // -- Çeviri (TR → EN) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Şirket, önümüzdeki yıl üç yeni şube açmayı planlıyor.",
    options: [
      "The company is planning to open three new branches next year.",
      "The company opened three new branches last year.",
      "The company has opened three new branches so far.",
      "The company will have opened three new branches by next year.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle şimdiki zamanda bir planı bildirir ('planlıyor'); A bunu 'is planning to open' ile doğru karşılar. B ve C geçmiş zaman, D ise gelecekte tamamlanmış olacak bir eylemi ifade eden farklı bir yapı kullanır.",
    tags: ["present-continuous-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["modal-fiiller", "edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Yeterli kanıt olmadan hiç kimse suçlu ilan edilemez.",
    options: [
      "No one can be declared guilty without sufficient evidence.",
      "Someone can be declared guilty without sufficient evidence.",
      "No one was declared guilty without sufficient evidence.",
      "No one will be declared guilty without sufficient evidence.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geniş zamanlı, olumsuz ve edilgen bir genel kural bildirir ('ilan edilemez'); A 'can be declared' ile bu geniş zamanlı olasılık/yetkinlik anlamını doğru verir. B anlamı tersine çevirir, C geçmiş zaman, D gelecek zaman kullanır.",
    tags: ["modal-passive-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["modal-fiiller"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Yönetim, çalışanların geri bildirimlerini dikkate almadan kararı almış olmalı.",
    options: [
      "The management must have made the decision without taking employees' feedback into account.",
      "The management must make the decision without taking employees' feedback into account.",
      "The management should have made the decision without taking employees' feedback into account.",
      "The management could not have made the decision without taking employees' feedback into account.",
    ],
    correctIndex: 0,
    explanation:
      "'almış olmalı' geçmişe yönelik güçlü bir tahmin/çıkarım bildirir; bu yapı İngilizcede 'must have + V3' ile karşılanır. A doğru modal yapıyı kullanır. B geniş zaman, C farklı bir modal anlam (tavsiye/pişmanlık), D ise anlamı tersine çevirir.",
    tags: ["modal-perfect-translation"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Bilim insanları bu tedaviyi geliştirmemiş olsalardı, milyonlarca insan hayatını kaybedebilirdi.",
    options: [
      "If scientists had not developed this treatment, millions of people could have lost their lives.",
      "If scientists do not develop this treatment, millions of people will lose their lives.",
      "If scientists had not developed this treatment, millions of people would lose their lives.",
      "Scientists did not develop this treatment, so millions of people lost their lives.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 3. tip koşul yapısındadır ('geliştirmemiş olsalardı... kaybedebilirdi'); A bunu 'had not developed... could have lost' ile doğru karşılar. B 1. tip koşul, C ana cümlede yanlış zaman kullanır ('would have lost' gerekirdi), D ise koşulu kaldırıp gerçekleşmiş bir olay gibi sunar.",
    tags: ["third-conditional-translation"],
    mockSetNumber: 2,
  },

  // -- Okuma --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre uyku, öğrenme sürecinde hangi işlevi görür?",
    passageText:
      "Recent studies in neuroscience suggest that sleep plays a crucial role in consolidating memories formed during the day. While a person sleeps, the brain replays and strengthens neural connections associated with newly learned information, effectively transferring it from short-term to long-term storage. Researchers have found that participants who were deprived of sleep after learning a task performed significantly worse on recall tests the following day than those who slept normally. These findings suggest that adequate sleep may be just as important for learning as the initial study session itself.",
    options: [
      "Yeni bilgilerin unutulmasını hızlandırır",
      "Öğrenilen bilgilerin kısa süreli bellekten uzun süreli belleğe aktarılmasına yardımcı olur",
      "Beyindeki sinirsel bağlantıları tamamen siler",
      "Öğrenme sürecini tamamen durdurur",
    ],
    correctIndex: 1,
    explanation:
      "Parçada uykunun, yeni öğrenilen bilgiyle ilişkili sinirsel bağlantıları güçlendirerek bilgiyi kısa süreli bellekten uzun süreli belleğe aktardığı belirtilmiştir.",
    tags: ["detail-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt:
      "Parçaya göre, bir görevi öğrendikten sonra uykudan yoksun bırakılan katılımcılarla ilgili ne söylenebilir?",
    passageText:
      "Recent studies in neuroscience suggest that sleep plays a crucial role in consolidating memories formed during the day. While a person sleeps, the brain replays and strengthens neural connections associated with newly learned information, effectively transferring it from short-term to long-term storage. Researchers have found that participants who were deprived of sleep after learning a task performed significantly worse on recall tests the following day than those who slept normally. These findings suggest that adequate sleep may be just as important for learning as the initial study session itself.",
    options: [
      "Ertesi gün hatırlama testlerinde normal uyuyanlardan daha iyi performans gösterdiler",
      "Ertesi gün hatırlama testlerinde normal uyuyanlardan belirgin şekilde daha kötü performans gösterdiler",
      "Herhangi bir performans farkı gözlenmedi",
      "Testlere katılmayı reddettiler",
    ],
    correctIndex: 1,
    explanation:
      "Parçada, öğrenmeden sonra uykudan yoksun bırakılan katılımcıların ertesi gün hatırlama testlerinde normal uyuyanlara göre 'significantly worse' (belirgin şekilde daha kötü) performans gösterdiği açıkça belirtilmiştir.",
    tags: ["detail-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçada geçen 'consolidating' kelimesi bağlama göre en yakın olarak hangi anlama gelir?",
    passageText:
      "Recent studies in neuroscience suggest that sleep plays a crucial role in consolidating memories formed during the day. While a person sleeps, the brain replays and strengthens neural connections associated with newly learned information, effectively transferring it from short-term to long-term storage. Researchers have found that participants who were deprived of sleep after learning a task performed significantly worse on recall tests the following day than those who slept normally. These findings suggest that adequate sleep may be just as important for learning as the initial study session itself.",
    options: ["zayıflatmak", "pekiştirmek/sağlamlaştırmak", "unutmak", "ertelemek"],
    correctIndex: 1,
    explanation:
      "Parça, uykunun anıları 'consolidating' sürecinde rol oynadığını ve ardından bağlantıları güçlendirdiğini ('strengthens') anlatır; bu nedenle kelime 'pekiştirmek/sağlamlaştırmak' anlamına gelir.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "Recent studies in neuroscience suggest that sleep plays a crucial role in consolidating memories formed during the day. While a person sleeps, the brain replays and strengthens neural connections associated with newly learned information, effectively transferring it from short-term to long-term storage. Researchers have found that participants who were deprived of sleep after learning a task performed significantly worse on recall tests the following day than those who slept normally. These findings suggest that adequate sleep may be just as important for learning as the initial study session itself.",
    options: [
      "Uyku, öğrenmeyle hiçbir şekilde ilişkili değildir.",
      "Yeterli uyku, bilgilerin pekiştirilmesi açısından öğrenme süreci kadar önemli olabilir.",
      "Kısa süreli bellek, uzun süreli bellekten daha güvenilirdir.",
      "Katılımcıların tamamı uykusuzluktan etkilenmemiştir.",
    ],
    correctIndex: 1,
    explanation:
      "Parça, uykunun bellek pekiştirmedeki rolünü ve uyku eksikliğinin hatırlama performansını nasıl düşürdüğünü anlatarak, yeterli uykunun öğrenme kadar önemli olabileceği sonucuna varır; bu da B seçeneğiyle örtüşür.",
    tags: ["main-idea"],
    mockSetNumber: 2,
  },

  // ============================================================
  // DENEME 3
  // ============================================================

  // -- Kelime Bilgisi --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The new employee was praised for her ability to ---- complex financial data into a clear, concise report.",
    options: ["condense", "expand", "complicate", "duplicate"],
    correctIndex: 0,
    explanation:
      "Karmaşık finansal verilerin 'clear, concise report'a (açık, öz bir rapora) dönüştürülmesi anlatılır; bu da 'condense' (özetlemek/kısaltmak) ile örtüşür. 'Expand' (genişletmek) ve 'complicate' (karmaşıklaştırmak) tam tersini ifade eder.",
    tags: ["synonym-in-context"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The judge's ruling set a legal ---- that will influence how similar cases are handled in the future.",
    options: ["precedent", "president", "precession", "precedence"],
    correctIndex: 0,
    explanation:
      "'precedent' (emsal/içtihat) hukuki bağlamda gelecekteki benzer davaları etkileyecek bir karar için doğru terimdir. 'President' (başkan) ve 'precession' (yörünge sapması) anlamca uymaz; 'precedence' (öncelik) ise farklı bir kavramdır.",
    tags: ["word-choice"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Athletes must ---- to a strict training regimen if they hope to compete at an international level.",
    options: ["adhere", "adhesive", "adherence", "adherent"],
    correctIndex: 0,
    explanation:
      "Boşluk 'must' yardımcı fiilinden sonra bir fiil gerektirir; 'adhere (to)' (bağlı kalmak/uymak) doğru fiil biçimidir. Diğerleri sıfat veya isim biçimleridir.",
    tags: ["word-form"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt: "The two rival firms eventually ---- an agreement after months of tense negotiation.",
    options: ["hammered out", "hammered down", "hammered up", "hammered into"],
    correctIndex: 0,
    explanation:
      "'hammer out an agreement' (zorlu bir süreç sonunda anlaşmaya varmak) sabit bir deyimdir; diğer parçacıklar bu fiille bu anlamda kullanılmaz.",
    tags: ["phrasal-verb"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The senator was accused of being ---- on the issue, changing her position depending on which audience she addressed.",
    options: ["consistent", "inconsistent", "resistant", "persistent"],
    correctIndex: 1,
    explanation:
      "'changing her position depending on which audience' ifadesi tutarsızlığı gösterir; bu da 'inconsistent' (tutarsız) ile örtüşür. 'Consistent' (tutarlı) tam tersini ifade eder.",
    tags: ["contextual-inference"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The finance minister's optimistic forecast turned out to be wildly ---- once the actual figures were released.",
    options: ["accurate", "inaccurate", "precise", "exact"],
    correctIndex: 1,
    explanation:
      "'once the actual figures were released' zıt bir sonucu ima eder; tahminin gerçek rakamlarla uyuşmadığı anlaşılır, bu da 'inaccurate' (yanlış/hatalı) ile örtüşür. 'Accurate', 'precise' ve 'exact' tam tersini ifade eder.",
    tags: ["contrast-clue"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Rather than addressing the root cause of the problem, the new policy merely ---- the symptoms.",
    options: ["treats", "cures", "eliminates", "resolves"],
    correctIndex: 0,
    explanation:
      "'Rather than addressing the root cause' ifadesiyle kurulan zıtlık, politikanın sorunu kökünden çözmediğini, sadece belirtilerle ilgilendiğini gösterir; bu da 'treats the symptoms' (belirtileri hafifletmek) deyimiyle örtüşür. 'Cures', 'eliminates' ve 'resolves' sorunun tamamen çözüldüğünü ima eder ve cümledeki zıtlıkla çelişir.",
    tags: ["idiom"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The committee's proposal was met with ---- opposition from local residents who feared it would disrupt the neighborhood.",
    options: ["fervent", "faint", "feeble", "favorable"],
    correctIndex: 0,
    explanation:
      "'feared it would disrupt the neighborhood' ifadesi güçlü bir tepkiyi ima eder; bu da 'fervent' (ateşli/şiddetli) ile örtüşür. 'Faint' ve 'feeble' zayıf bir tepkiyi, 'favorable' ise olumlu bir tepkiyi ifade eder ve bağlamla çelişir.",
    tags: ["synonym-in-context"],
    mockSetNumber: 3,
  },

  // -- Çeviri (EN → TR) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Archaeologists discovered the remains of an ancient trading post along the old caravan route.",
    options: [
      "Arkeologlar, eski kervan yolu boyunca antik bir ticaret merkezinin kalıntılarını keşfetti.",
      "Arkeologlar antik bir ticaret merkezi inşa etti.",
      "Arkeologlar eski kervan yolunu yeniden açacaklar.",
      "Antik ticaret merkezinin kalıntıları hiçbir zaman bulunamadı.",
    ],
    correctIndex: 0,
    explanation:
      "'discovered the remains' (kalıntıları keşfetti) geçmiş zamanlı bir buluşu ifade eder; A bunu doğru karşılar. B farklı bir eylem (inşa etme), C gelecek zaman, D ise metinle doğrudan çelişir.",
    tags: ["past-simple-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "As trade routes expanded, cities along the way grew wealthier and more culturally diverse.",
    options: [
      "Ticaret yolları genişledikçe, yol üzerindeki şehirler daha zengin ve kültürel olarak daha çeşitli hale geldi.",
      "Ticaret yolları daraldıkça, yol üzerindeki şehirler yoksullaştı.",
      "Ticaret yolları genişlemeden önce, şehirler zaten zengindi.",
      "Ticaret yolları genişleyecek ve şehirler zenginleşecek.",
    ],
    correctIndex: 0,
    explanation:
      "'As' burada eşzamanlı bir gelişimi bildirir ('genişledikçe... hale geldi'); A bu ilişkiyi ve geçmiş zamanı doğru verir. B anlamı tersine çevirir, C farklı bir zaman ilişkisi kurar, D gelecek zaman kullanır.",
    tags: ["time-clause-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "Goods that were once considered luxuries gradually became accessible to ordinary people.",
    options: [
      "Bir zamanlar lüks sayılan mallar, zamanla sıradan insanlar için de erişilebilir hale geldi.",
      "Mallar hâlâ sadece zenginler için erişilebilir durumda.",
      "Lüks mallar, sıradan insanlar tarafından hiçbir zaman satın alınmadı.",
      "Mallar gelecekte sıradan insanlar için erişilebilir hale gelecek.",
    ],
    correctIndex: 0,
    explanation:
      "'were once considered luxuries' (bir zamanlar lüks sayılırdı) ve 'gradually became accessible' (zamanla erişilebilir hale geldi) ifadeleri A'da doğru şekilde verilmiştir. B, C ve D metnin zamanını veya anlamını değiştirir.",
    tags: ["past-passive-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Had it not been for the merchants who braved the harsh desert conditions, many of these cultural exchanges would never have taken place.",
    options: [
      "Zorlu çöl koşullarına göğüs geren tüccarlar olmasaydı, bu kültürel alışverişlerin birçoğu hiçbir zaman gerçekleşmezdi.",
      "Tüccarlar zorlu çöl koşullarına göğüs gerdiği için kültürel alışverişler arttı.",
      "Zorlu çöl koşulları, tüccarların kültürel alışveriş yapmasını kolaylaştırdı.",
      "Tüccarlar çöl koşullarından kaçındığı için kültürel alışverişler azaldı.",
    ],
    correctIndex: 0,
    explanation:
      "'Had it not been for...' geçmişe yönelik gerçekleşmemiş bir varsayımsal koşul kurar ('...olmasaydı... gerçekleşmezdi'); A bu 3. tip koşul anlamını doğru verir. B, C ve D cümlenin varsayımsal/olumsuz yapısını yok sayarak farklı, gerçekleşmiş gibi sunulan anlamlar üretir.",
    tags: ["inverted-conditional"],
    mockSetNumber: 3,
  },

  // -- Çeviri (TR → EN) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Tarihçiler, bu belgenin on beşinci yüzyıla ait olduğunu düşünüyorlar.",
    options: [
      "Historians think that this document dates back to the fifteenth century.",
      "Historians thought that this document dated back to the fifteenth century.",
      "Historians will think that this document dates back to the fifteenth century.",
      "Historians have thought that this document dated back to the fifteenth century.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle şimdiki zamanda bir görüşü bildirir ('düşünüyorlar'); A 'think that... dates' ile bunu doğru karşılar. B geçmiş zaman, C gelecek zaman kullanır; D farklı bir zaman ilişkisi kurar.",
    tags: ["present-simple-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu şehir, stratejik konumu sayesinde yüzyıllar boyunca önemli bir ticaret merkezi olmuştur.",
    options: [
      "Thanks to its strategic location, this city has been an important trade center for centuries.",
      "Thanks to its strategic location, this city was an important trade center for a century.",
      "Despite its strategic location, this city has never been an important trade center.",
      "This city will become an important trade center thanks to its strategic location.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geçmişten günümüze süregelen bir durumu bildirir ('olmuştur'); A bunu 'has been... for centuries' ile Present Perfect kullanarak doğru karşılar. B süre ve zaman uyumunu bozar, C anlamı tersine çevirir, D gelecek zaman kullanır.",
    tags: ["present-perfect-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu bölgedeki kazı çalışmaları, önümüzdeki yaz tamamlanmış olacak.",
    options: [
      "The excavation work in this region will have been completed by next summer.",
      "The excavation work in this region was completed last summer.",
      "The excavation work in this region is being completed this summer.",
      "The excavation work in this region will be completed by next summer.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 'tamamlanmış olacak' diyerek gelecekte belirli bir zamana kadar tamamlanmış olacak bir eylemi bildirir; bu, Future Perfect ('will have been completed') ile karşılanır, yani A doğrudur. D 'will be completed' basit gelecek zamanı kullanır ve 'tamamlanmış olma' vurgusunu taşımaz; B geçmiş, C şimdiki zaman kullanır.",
    tags: ["future-perfect-translation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Eğer o dönemde yazılı kayıtlar tutulmasaydı, bu olaylar hakkında hiçbir şey bilmiyor olurduk.",
    options: [
      "If written records had not been kept during that period, we would know nothing about these events.",
      "If written records are not kept during that period, we know nothing about these events.",
      "If written records had not been kept during that period, we would have known nothing about these events.",
      "Written records were not kept during that period, so we know nothing about these events.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle karma koşul yapısındadır: koşul geçmişe ('tutulmasaydı'), sonuç ise şimdiki zamana ('bilmiyor olurduk') yöneliktir. Bu, 'If + had not been kept (geçmiş koşul)... would know (şimdiki sonuç)' karma koşuluyla karşılanır, yani A doğrudur. C ana cümlede 'would have known' kullanarak sonucu da geçmişe taşır ve karma yapıyı bozar; B ve D farklı zaman/yapılar kurar.",
    tags: ["mixed-conditional"],
    mockSetNumber: 3,
  },

  // -- Okuma --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre İpek Yolu tam olarak nedir?",
    passageText:
      "The Silk Road was not a single road but a vast network of trade routes connecting East Asia to the Mediterranean world for over a thousand years. Along with silk, merchants carried spices, precious stones, and, just as importantly, ideas, religions, and technologies from one civilization to another. Cities such as Samarkand and Kashgar flourished as bustling hubs where travelers from different cultures exchanged goods and knowledge. Although the rise of sea trade eventually diminished the importance of these overland routes, the Silk Road's legacy as one of history's greatest engines of cultural exchange endures to this day.",
    options: [
      "Tek bir yol",
      "Doğu Asya'yı Akdeniz dünyasına bağlayan geniş bir ticaret yolları ağı",
      "Sadece deniz ticaret rotalarından oluşan bir sistem",
      "Yalnızca ipek taşımak için kullanılan bir güzergah",
    ],
    correctIndex: 1,
    explanation:
      "Parçada İpek Yolu'nun 'tek bir yol değil' ('not a single road but'), Doğu Asya'yı Akdeniz dünyasına bağlayan geniş bir ticaret yolları ağı olduğu açıkça belirtilmiştir.",
    tags: ["detail-question"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre, deniz ticaretinin yükselişi ne gibi bir etki yarattı?",
    passageText:
      "The Silk Road was not a single road but a vast network of trade routes connecting East Asia to the Mediterranean world for over a thousand years. Along with silk, merchants carried spices, precious stones, and, just as importantly, ideas, religions, and technologies from one civilization to another. Cities such as Samarkand and Kashgar flourished as bustling hubs where travelers from different cultures exchanged goods and knowledge. Although the rise of sea trade eventually diminished the importance of these overland routes, the Silk Road's legacy as one of history's greatest engines of cultural exchange endures to this day.",
    options: [
      "Kara ticaret yollarının önemini artırdı",
      "Kara ticaret yollarının önemini azalttı",
      "İpek Yolu'nu tamamen ortadan kaldırdı",
      "Semerkant ve Kaşgar şehirlerini büyüttü",
    ],
    correctIndex: 1,
    explanation:
      "Parçada 'the rise of sea trade eventually diminished the importance of these overland routes' ifadesiyle deniz ticaretinin kara yollarının önemini azalttığı belirtilmiştir.",
    tags: ["cause-effect-detail"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçada geçen 'flourished' kelimesi bağlama göre en yakın olarak hangi anlama gelir?",
    passageText:
      "The Silk Road was not a single road but a vast network of trade routes connecting East Asia to the Mediterranean world for over a thousand years. Along with silk, merchants carried spices, precious stones, and, just as importantly, ideas, religions, and technologies from one civilization to another. Cities such as Samarkand and Kashgar flourished as bustling hubs where travelers from different cultures exchanged goods and knowledge. Although the rise of sea trade eventually diminished the importance of these overland routes, the Silk Road's legacy as one of history's greatest engines of cultural exchange endures to this day.",
    options: ["çöktü", "gelişip zenginleşti", "terk edildi", "küçüldü"],
    correctIndex: 1,
    explanation:
      "Semerkant ve Kaşgar'ın 'bustling hubs' (hareketli merkezler) olarak tanımlanmasından, bu şehirlerin 'flourished' ifadesinin olumlu bir gelişimi anlattığı anlaşılır; bu nedenle kelime 'gelişip zenginleşti' anlamına gelir.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "The Silk Road was not a single road but a vast network of trade routes connecting East Asia to the Mediterranean world for over a thousand years. Along with silk, merchants carried spices, precious stones, and, just as importantly, ideas, religions, and technologies from one civilization to another. Cities such as Samarkand and Kashgar flourished as bustling hubs where travelers from different cultures exchanged goods and knowledge. Although the rise of sea trade eventually diminished the importance of these overland routes, the Silk Road's legacy as one of history's greatest engines of cultural exchange endures to this day.",
    options: [
      "İpek Yolu sadece ipek ticareti için kullanılan kısa ömürlü bir güzergahtı.",
      "İpek Yolu, mal ticaretinin yanı sıra fikir ve kültürlerin de yayılmasını sağlayan, tarihin en önemli kültürel etkileşim ağlarından biriydi.",
      "Deniz ticareti hiçbir zaman kara ticaretinin yerini alamamıştır.",
      "Semerkant ve Kaşgar, İpek Yolu'ndan hiç faydalanmamıştır.",
    ],
    correctIndex: 1,
    explanation:
      "Parça, İpek Yolu'nun sadece mal değil fikir, din ve teknoloji alışverişini de sağladığını ve tarihin en büyük kültürel etkileşim motorlarından biri olarak mirasının günümüze kadar sürdüğünü anlatır; bu da B seçeneğiyle örtüşür.",
    tags: ["main-idea"],
    mockSetNumber: 3,
  },

  // ============================================================
  // DENEME 4
  // ============================================================

  // -- Kelime Bilgisi --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "The company's new advertising campaign was designed to ---- environmentally conscious consumers.",
    options: ["appeal to", "appeal for", "appeal with", "appeal against"],
    correctIndex: 0,
    explanation:
      "'appeal to (someone)' (birinin ilgisini çekmek/hoşuna gitmek) doğru edat yapısıdır; diğer edat kombinasyonları bu anlamda kullanılmaz.",
    tags: ["preposition-collocation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Despite the airline's ---- , hundreds of passengers were left stranded at the airport overnight.",
    options: ["assurances", "assurance", "assured", "assuredly"],
    correctIndex: 0,
    explanation:
      "Boşluk 'the airline's' iyelik ekinden sonra bir isim gerektirir; 'hundreds of passengers' ile uyumlu olarak çoğul bir isim olan 'assurances' (güvenceler) doğrudur. Diğerleri sözcük türü olarak uymaz.",
    tags: ["word-form"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Manufacturers are under increasing pressure to ---- their products to meet stricter environmental standards.",
    options: ["adapt", "adopt", "adept", "adapting"],
    correctIndex: 0,
    explanation:
      "'adapt' (uyarlamak) ürünleri yeni standartlara uygun hale getirme anlamına uyar. 'Adopt' (benimsemek) farklı bir anlam taşır ve bu bağlamda ürünler için kullanılmaz; 'adept' bir sıfattır.",
    tags: ["confusable-words"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The novelist's latest work has received ---- reviews, with critics praising its originality almost unanimously.",
    options: ["scathing", "glowing", "lukewarm", "mixed"],
    correctIndex: 1,
    explanation:
      "'critics praising its originality almost unanimously' olumlu bir tepkiyi gösterir; bu da 'glowing' (parlak/övgü dolu) ile örtüşür. 'Scathing' (acımasız/eleştirel) tam tersini ifade eder.",
    tags: ["synonym-in-context"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt: "The two departments have been ---- heads over who is responsible for the budget shortfall.",
    options: ["butting", "batting", "bidding", "beating"],
    correctIndex: 0,
    explanation:
      "'butt heads' (fikir ayrılığına düşmek/çatışmak) sabit bir deyimdir; kimin sorumlu olduğu konusunda anlaşmazlık yaşandığını anlatır. Diğer fiiller bu isimle bu anlamda kullanılmaz.",
    tags: ["idiom"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt: "The report's conclusions were based on ---- evidence, making it difficult to draw any firm conclusions.",
    options: ["conclusive", "inconclusive", "decisive", "compelling"],
    correctIndex: 1,
    explanation:
      "'making it difficult to draw any firm conclusions' ifadesi kanıtların yetersiz/belirsiz olduğunu gösterir; bu da 'inconclusive' (sonuca varılamayan/belirsiz) ile örtüşür. 'Conclusive' ve 'decisive' tam tersini ifade eder.",
    tags: ["contrast-clue"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt: "The startup's rapid success can be ---- to its founder's willingness to take calculated risks.",
    options: ["attributed", "contributed", "distributed", "retributed"],
    correctIndex: 0,
    explanation:
      "'attribute X to Y' (X'i Y'ye bağlamak/atfetmek) sabit bir yapıdır ve başarının nedenini açıklamak için doğru fiildir. Diğer seçenekler bu yapıda kullanılmaz veya ('retributed' gibi) geçerli bir kelime değildir.",
    tags: ["collocation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt: "Critics argue that the new tax policy disproportionately ---- low-income households.",
    options: ["benefits", "burdens", "ignores", "rewards"],
    correctIndex: 1,
    explanation:
      "'disproportionately' (orantısız biçimde) ile birlikte düşük gelirli hanelerin olumsuz etkilendiği eleştirisi yapılır; bu da 'burdens' (yük getirmek) ile örtüşür. 'Benefits' ve 'rewards' olumlu bir etkiyi ifade eder ve eleştiri bağlamıyla çelişir.",
    tags: ["contextual-inference"],
    mockSetNumber: 4,
  },

  // -- Çeviri (EN → TR) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Marine biologists have long been fascinated by the intelligence of octopuses.",
    options: [
      "Deniz biyologları uzun zamandır ahtapotların zekasına hayran kalmıştır.",
      "Deniz biyologları ahtapotların zekasıyla hiç ilgilenmedi.",
      "Deniz biyologları gelecekte ahtapotların zekasını inceleyecek.",
      "Ahtapotlar deniz biyologlarının zekasına hayran kaldı.",
    ],
    correctIndex: 0,
    explanation:
      "'have long been fascinated by' Present Perfect ile süregelen bir ilgiyi belirtir; A bunu doğru karşılar. B anlamı tersine çevirir, C gelecek zaman kullanır, D öznenin yerini değiştirerek anlamı bozar.",
    tags: ["present-perfect-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "Even though octopuses lack a centralized brain structure like vertebrates, they display remarkably complex problem-solving abilities.",
    options: [
      "Ahtapotlar, omurgalılar gibi merkezi bir beyin yapısından yoksun olsalar da, dikkat çekici derecede karmaşık problem çözme yetenekleri sergilerler.",
      "Ahtapotların omurgalılar gibi merkezi bir beyin yapısı vardır, bu yüzden karmaşık problemler çözebilirler.",
      "Ahtapotlar merkezi bir beyin yapısına sahip olmadıkları için hiçbir problemi çözemezler.",
      "Omurgalılar, ahtapotlar gibi merkezi bir beyin yapısından yoksundur.",
    ],
    correctIndex: 0,
    explanation:
      "'Even though' zıtlık kurar: merkezi beyin yapısı olmamasına rağmen karmaşık problem çözme becerisi gösterirler. A bu zıtlığı doğru verir. B ilk kısmı tersine çevirir, C anlamı olumsuza çevirir, D özneleri karıştırır.",
    tags: ["concession-clause"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "The ability to change color instantly allows octopuses to camouflage themselves against a wide range of backgrounds.",
    options: [
      "Anında renk değiştirme yeteneği, ahtapotların çok çeşitli arka planlara karşı kamufle olmasını sağlar.",
      "Ahtapotlar renk değiştiremedikleri için kamufle olamazlar.",
      "Ahtapotlar sadece tek bir arka plana karşı kamufle olabilir.",
      "Renk değiştirme yeteneği ahtapotların avlanmasını engeller.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle, anında renk değiştirme yeteneğinin ahtapotların çeşitli arka planlara karşı kamufle olmasını sağladığını belirtir; A bunu doğru aktarır. B, C ve D metinle çelişen veya metinde olmayan bilgiler içerir.",
    tags: ["ability-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Not until researchers observed octopuses using coconut shells as portable shelters did scientists fully appreciate the extent of their tool use.",
    options: [
      "Bilim insanları, ahtapotların hindistan cevizi kabuklarını taşınabilir sığınak olarak kullandığını gözlemleyene kadar, alet kullanımlarının boyutunu tam olarak takdir edemediler.",
      "Bilim insanları ahtapotların alet kullanımını her zaman tam olarak anlamıştır.",
      "Ahtapotlar hindistan cevizi kabuklarını hiçbir zaman sığınak olarak kullanmamıştır.",
      "Bilim insanları hindistan cevizi kabuklarını sığınak olarak kullanmaya başladı.",
    ],
    correctIndex: 0,
    explanation:
      "'Not until X did Y' devrik yapısı 'X olana kadar Y gerçekleşmedi' anlamına gelir; burada bilim insanları ahtapotların kabuk kullanımını gözlemleyene kadar alet kullanımının boyutunu anlamadıkları belirtilir. A bunu doğru verir; B tam tersini söyler, C ve D metinle çelişir/konu dışıdır.",
    tags: ["inversion-translation"],
    mockSetNumber: 4,
  },

  // -- Çeviri (TR → EN) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Bilim insanları, bu türün nesli tükenmekte olduğunu açıkladılar.",
    options: [
      "Scientists announced that this species is going extinct.",
      "Scientists announced that this species went extinct.",
      "Scientists will announce that this species is going extinct.",
      "Scientists have announced that this species will go extinct.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümlede 'açıkladılar' (geçmiş zaman) ve içerik olarak 'tükenmekte olduğu' (şimdiki zamanda süregelen bir durum) bildirilir; A 'announced that... is going extinct' ile bu yapıyı doğru verir. B içerik cümlesini de geçmişe taşıyarak anlamı değiştirir, C ve D yanlış zamanlar kullanır.",
    tags: ["reported-speech-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri", "baglaclar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu tür canlılar, doğal yaşam alanları yok edilmedikçe hayatta kalmaya devam edecektir.",
    options: [
      "These creatures will continue to survive unless their natural habitats are destroyed.",
      "These creatures continued to survive because their natural habitats were destroyed.",
      "These creatures will continue to survive if their natural habitats are destroyed.",
      "These creatures survived even though their natural habitats were destroyed.",
    ],
    correctIndex: 0,
    explanation:
      "'yok edilmedikçe' olumsuz bir koşul bildirir ('unless'); A bunu 'unless their natural habitats are destroyed' ile doğru karşılar. C 'if' kullanarak koşulun anlamını tersine çevirir, B ve D geçmiş zaman kullanır ve farklı anlamlar üretir.",
    tags: ["unless-clause-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar", "edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu davranış, daha önce sadece memelilerde gözlemlenmişti.",
    options: [
      "This behavior had previously been observed only in mammals.",
      "This behavior is previously observed only in mammals.",
      "This behavior will have been observed only in mammals.",
      "This behavior has never been observed in mammals.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geçmişte belirli bir zamandan önce gerçekleşmiş bir durumu bildirir ('gözlemlenmişti' - Past Perfect); A bunu 'had previously been observed' ile doğru karşılar. B zaman uyumsuzdur, C gelecek zaman, D ise anlamı tamamen tersine çevirir.",
    tags: ["past-perfect-passive-translation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt:
      "Araştırmacılar bu davranışı daha erken keşfetmiş olsalardı, koruma stratejileri çok daha önce değiştirilebilirdi.",
    options: [
      "Had researchers discovered this behavior earlier, conservation strategies could have been changed much sooner.",
      "If researchers discover this behavior earlier, conservation strategies can be changed much sooner.",
      "Researchers discovered this behavior earlier, so conservation strategies were changed much sooner.",
      "Had researchers discovered this behavior earlier, conservation strategies would change much sooner.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 3. tip koşul yapısındadır ('keşfetmiş olsalardı... değiştirilebilirdi'); A devrik yapı ('Had researchers discovered') ve doğru sonuç yapısı ('could have been changed') ile bunu tam karşılar. B 1. tip koşul, C koşulu kaldırıp gerçekleşmiş gibi sunar, D ana cümlede yanlış zaman kullanır ('would have changed' gerekirdi).",
    tags: ["inverted-third-conditional"],
    mockSetNumber: 4,
  },

  // -- Okuma --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt: "Parçaya göre bir ahtapotun nöronlarının yaklaşık üçte ikisi nerede bulunur?",
    passageText:
      "Octopuses possess a strikingly different kind of intelligence compared to most other animals. Unlike vertebrates, whose neurons are concentrated in a single brain, roughly two-thirds of an octopus's neurons are distributed throughout its eight arms, allowing each arm to process information and make decisions with a surprising degree of independence. Laboratory experiments have shown that octopuses can solve puzzles, open jars to retrieve food, and even recognize individual human faces. Some researchers believe that studying octopus cognition could offer valuable insights into how intelligence might evolve along entirely different paths than it did in humans.",
    options: [
      "Tek bir merkezi beyinde",
      "Sekiz kolunun tamamına dağılmış şekilde",
      "Sadece gözlerinde",
      "Omurgasında",
    ],
    correctIndex: 1,
    explanation:
      "Parçada, bir ahtapotun nöronlarının yaklaşık üçte ikisinin sekiz kolu boyunca dağılmış olduğu ('distributed throughout its eight arms') açıkça belirtilmiştir.",
    tags: ["detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre laboratuvar deneyleri ahtapotların hangi yeteneklerini göstermiştir?",
    passageText:
      "Octopuses possess a strikingly different kind of intelligence compared to most other animals. Unlike vertebrates, whose neurons are concentrated in a single brain, roughly two-thirds of an octopus's neurons are distributed throughout its eight arms, allowing each arm to process information and make decisions with a surprising degree of independence. Laboratory experiments have shown that octopuses can solve puzzles, open jars to retrieve food, and even recognize individual human faces. Some researchers believe that studying octopus cognition could offer valuable insights into how intelligence might evolve along entirely different paths than it did in humans.",
    options: [
      "Sadece yüzme becerilerini",
      "Bulmacaları çözme, kavanoz açma ve insan yüzlerini tanıma gibi yetenekleri",
      "Sadece av avlama becerilerini",
      "Konuşma yeteneklerini",
    ],
    correctIndex: 1,
    explanation:
      "Parçada, ahtapotların bulmacaları çözebildiği, kavanoz açabildiği ve hatta bireysel insan yüzlerini tanıyabildiği belirtilmiştir.",
    tags: ["detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçada geçen 'strikingly' kelimesi bağlama göre en yakın olarak hangi anlama gelir?",
    passageText:
      "Octopuses possess a strikingly different kind of intelligence compared to most other animals. Unlike vertebrates, whose neurons are concentrated in a single brain, roughly two-thirds of an octopus's neurons are distributed throughout its eight arms, allowing each arm to process information and make decisions with a surprising degree of independence. Laboratory experiments have shown that octopuses can solve puzzles, open jars to retrieve food, and even recognize individual human faces. Some researchers believe that studying octopus cognition could offer valuable insights into how intelligence might evolve along entirely different paths than it did in humans.",
    options: ["belirsiz biçimde", "çarpıcı biçimde", "önemsiz biçimde", "yavaşça"],
    correctIndex: 1,
    explanation:
      "'strikingly different kind of intelligence' ifadesi, ahtapotların zekasının diğer hayvanlardan dikkat çekici/belirgin biçimde farklı olduğunu vurgular; bu da 'çarpıcı biçimde' anlamına gelen kullanımla örtüşür.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "Octopuses possess a strikingly different kind of intelligence compared to most other animals. Unlike vertebrates, whose neurons are concentrated in a single brain, roughly two-thirds of an octopus's neurons are distributed throughout its eight arms, allowing each arm to process information and make decisions with a surprising degree of independence. Laboratory experiments have shown that octopuses can solve puzzles, open jars to retrieve food, and even recognize individual human faces. Some researchers believe that studying octopus cognition could offer valuable insights into how intelligence might evolve along entirely different paths than it did in humans.",
    options: [
      "Ahtapotlar, omurgalı hayvanlardan çok daha az zekidir.",
      "Ahtapotların dağıtılmış sinir sistemi, zekanın insanlardakinden tamamen farklı biçimlerde gelişebileceğine dair değerli ipuçları sunabilir.",
      "Ahtapotların nöronlarının tamamı beyinlerinde toplanmıştır.",
      "Ahtapotlar hiçbir laboratuvar testini başarıyla tamamlayamamıştır.",
    ],
    correctIndex: 1,
    explanation:
      "Parça, ahtapotların farklı sinir sistemi yapısını ve gösterdikleri bilişsel yetenekleri anlatarak, bu durumun zekanın farklı yollarla evrimleşebileceğine dair ipuçları sunabileceği sonucuna varır; bu da B seçeneğiyle örtüşür.",
    tags: ["main-idea"],
    mockSetNumber: 4,
  },

  // ============================================================
  // DENEME 5
  // ============================================================

  // -- Kelime Bilgisi --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "The startup managed to ---- a significant share of the market within just two years of launching.",
    options: ["capture", "capable", "captive", "capsize"],
    correctIndex: 0,
    explanation:
      "'capture market share' (pazar payı elde etmek) sabit bir collocation'dır; 'capture' doğru fiildir. Diğerleri farklı sözcük türleri ya da anlamca uymayan kelimelerdir.",
    tags: ["collocation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "The recycling program was introduced to ---- the amount of plastic waste sent to landfills each year.",
    options: ["reduce", "produce", "induce", "seduce"],
    correctIndex: 0,
    explanation:
      "Geri dönüşüm programının amacı çöp sahalarına giden plastik atık miktarını azaltmaktır; bu da 'reduce' (azaltmak) ile örtüşür. Diğer fiiller anlamca bağlama uymaz.",
    tags: ["word-choice"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt: "The negotiations remained at a ---- for weeks, with neither side willing to make the first concession.",
    options: ["standstill", "standpoint", "standard", "standby"],
    correctIndex: 0,
    explanation:
      "'at a standstill' (durma noktasında/tıkanmış) ifadesi, hiçbir tarafın taviz vermeye yanaşmadığı bir durumu tanımlar; diğer seçenekler bu bağlamda kullanılmaz.",
    tags: ["idiom"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "The CEO's decision to relocate the factory overseas was met with ---- from labor unions.",
    options: ["approval", "resistance", "applause", "gratitude"],
    correctIndex: 1,
    explanation:
      "Fabrikanın yurt dışına taşınması kararının işçi sendikaları tarafından desteklenmesi beklenmez; 'resistance' (direniş) bu olumsuz tepkiyi doğru yansıtır. Diğer seçenekler olumlu bir tepkiyi ifade eder.",
    tags: ["contextual-inference"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt: "The professor's lecture ---- so heavily on jargon that most first-year students struggled to follow it.",
    options: ["relied", "relayed", "related", "released"],
    correctIndex: 0,
    explanation:
      "'rely heavily on jargon' (büyük ölçüde jargona dayanmak) doğru collocation'dır; öğrencilerin dersi takip etmekte zorlanmasının nedeni budur. Diğer fiiller anlamca uymaz.",
    tags: ["collocation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt: "The report's authors were careful to ---- their claims with solid statistical evidence.",
    options: ["substantiate", "subsidize", "substitute", "subordinate"],
    correctIndex: 0,
    explanation:
      "'substantiate a claim' (bir iddiayı kanıtlarla desteklemek) doğru collocation'dır; raporun sağlam istatistiksel kanıtlarla desteklendiği anlatılır. Diğer fiiller farklı anlamlar taşır.",
    tags: ["collocation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Although the two proposals appeared similar at first glance, a closer look revealed ---- differences in their long-term costs.",
    options: ["negligible", "marginal", "substantial", "minimal"],
    correctIndex: 2,
    explanation:
      "'Although... appeared similar' zıtlık kurar; 'a closer look revealed' ifadesinden sonra önemli bir farkın ortaya çıktığı anlaşılır, bu da 'substantial' (önemli/büyük) ile örtüşür. 'Negligible', 'marginal' ve 'minimal' küçük/önemsiz farkları ifade eder ve zıtlıkla uyuşmaz.",
    tags: ["contrast-clue"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt: "The company's quarterly earnings fell short of analysts' ---- , causing its stock price to drop sharply.",
    options: ["expectations", "exceptions", "expenses", "experiences"],
    correctIndex: 0,
    explanation:
      "'fall short of expectations' (beklentileri karşılayamamak) sabit bir ifadedir; hisse fiyatındaki düşüşün nedeni budur. Diğer kelimeler anlamca uymaz.",
    tags: ["collocation"],
    mockSetNumber: 5,
  },

  // -- Çeviri (EN → TR) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "More and more companies are allowing employees to work from home on a permanent basis.",
    options: [
      "Giderek daha fazla şirket, çalışanların kalıcı olarak evden çalışmasına izin veriyor.",
      "Giderek daha az şirket, çalışanların evden çalışmasına izin veriyor.",
      "Şirketler geçmişte çalışanların evden çalışmasına izin veriyordu.",
      "Şirketler gelecekte çalışanların evden çalışmasına izin verecek.",
    ],
    correctIndex: 0,
    explanation:
      "'More and more companies are allowing' şimdiki zamanda artan bir eğilimi bildirir; A bunu doğru karşılar. B anlamı tersine çevirir, C geçmiş zaman, D gelecek zaman kullanır.",
    tags: ["present-continuous-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["baglaclar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "While remote work offers greater flexibility, it can also blur the boundaries between professional and personal life.",
    options: [
      "Uzaktan çalışma daha fazla esneklik sunsa da, profesyonel ve kişisel yaşam arasındaki sınırları da bulanıklaştırabilir.",
      "Uzaktan çalışma esneklik sunmadığı için profesyonel ve kişisel yaşam arasındaki sınırlar net kalır.",
      "Uzaktan çalışma sadece esneklik sunar, başka hiçbir etkisi yoktur.",
      "Uzaktan çalışma profesyonel ve kişisel yaşam arasındaki sınırları tamamen ortadan kaldırmıştır.",
    ],
    correctIndex: 0,
    explanation:
      "'While' burada zıtlık kurar: esneklik sunmasına rağmen sınırları bulanıklaştırabilir. A bu zıtlığı doğru verir. B anlamı tersine çevirir, C ve D metinde olmayan kesinlikler ekler.",
    tags: ["concession-clause"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["sifat-cumlecikleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "Companies that have embraced flexible schedules report higher levels of employee satisfaction.",
    options: [
      "Esnek çalışma saatlerini benimseyen şirketler, daha yüksek düzeyde çalışan memnuniyeti bildiriyor.",
      "Esnek çalışma saatlerini reddeden şirketler daha yüksek çalışan memnuniyeti bildiriyor.",
      "Şirketler esnek çalışma saatlerini benimsemeyi planlıyor.",
      "Esnek çalışma saatleri çalışan memnuniyetini düşürmüştür.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle, esnek çalışma saatlerini benimseyen şirketlerin daha yüksek çalışan memnuniyeti bildirdiğini belirtir; A bunu doğru aktarır. B, C ve D metinle çelişir veya metinde olmayan bilgiler içerir.",
    tags: ["relative-clause-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Were it not for advances in digital communication technology, large-scale remote work would hardly have been feasible.",
    options: [
      "Dijital iletişim teknolojisindeki gelişmeler olmasaydı, büyük ölçekli uzaktan çalışma neredeyse mümkün olmazdı.",
      "Dijital iletişim teknolojisindeki gelişmeler sayesinde büyük ölçekli uzaktan çalışma mümkün oldu.",
      "Dijital iletişim teknolojisi hâlâ yeterince gelişmediği için uzaktan çalışma mümkün değil.",
      "Büyük ölçekli uzaktan çalışma, dijital teknolojiden bağımsız olarak her zaman mümkün olmuştur.",
    ],
    correctIndex: 0,
    explanation:
      "'Were it not for...' devrik yapısı, geçmişe yönelik gerçekleşmemiş bir varsayımı ifade eder ('...olmasaydı... mümkün olmazdı'); A bu 3. tip koşul anlamını doğru verir. B zıt bir ifadeyle olumlu bir gerçekleşmeyi anlatır, C ve D metnin varsayımsal yapısını yok sayar.",
    tags: ["inverted-conditional"],
    mockSetNumber: 5,
  },

  // -- Çeviri (TR → EN) --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Şirket, geçen yıl çalışanlarının yarısından fazlasını uzaktan çalışmaya geçirdi.",
    options: [
      "The company shifted more than half of its employees to remote work last year.",
      "The company will shift more than half of its employees to remote work next year.",
      "The company shifts more than half of its employees to remote work every year.",
      "The company has shifted more than half of its employees to remote work so far this year.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geçmiş zamanda tamamlanmış bir eylemi bildirir ('geçirdi... geçen yıl'); A 'shifted... last year' ile bunu doğru karşılar. B gelecek zaman, C geniş zaman, D ise farklı bir zaman dilimi ve yapı ('has shifted... so far') kullanır.",
    tags: ["past-simple-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Çalışanların verimliliği, ofise ne kadar sık gittiklerine bağlı görünmüyor.",
    options: [
      "Employees' productivity does not seem to depend on how often they go to the office.",
      "Employees' productivity seems to depend entirely on how often they go to the office.",
      "Employees' productivity depended on how often they went to the office.",
      "Employees will be more productive if they go to the office more often.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle olumsuz bir bağımlılık ilişkisi bildirir ('bağlı görünmüyor'); A 'does not seem to depend on' ile bunu doğru karşılar. B anlamı tersine çevirir, C geçmiş zaman kullanır, D metinde belirtilmeyen bir öneri/tahmin ekler.",
    tags: ["negative-inference-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu politika değişikliği, yönetim kurulu tarafından oybirliğiyle kabul edildi.",
    options: [
      "This policy change was unanimously approved by the board of directors.",
      "This policy change will be unanimously approved by the board of directors.",
      "This policy change was rejected by the board of directors.",
      "The board of directors is currently discussing this policy change.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle geçmiş zamanlı edilgen bir yapı kurar ('kabul edildi'); A bunu 'was unanimously approved' ile doğru karşılar. B gelecek zaman kullanır, C anlamı tersine çevirir, D farklı bir eylem (tartışma sürecinde olma) anlatır.",
    tags: ["past-passive-translation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["kosul-cumleleri"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Şirket bu geçişi daha dikkatli planlamış olsaydı, verimlilikteki düşüş büyük ölçüde önlenebilirdi.",
    options: [
      "Had the company planned this transition more carefully, the decline in productivity could have largely been avoided.",
      "If the company plans this transition more carefully, the decline in productivity can largely be avoided.",
      "The company planned this transition carefully, so the decline in productivity was avoided.",
      "Had the company planned this transition more carefully, the decline in productivity would largely be avoided.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle 3. tip koşul yapısındadır ('planlamış olsaydı... önlenebilirdi'); A devrik yapı ve doğru sonuç cümlesi ('could have largely been avoided') ile bunu tam karşılar. B 1. tip koşul kurar, C koşulu kaldırıp gerçekleşmiş gibi sunar, D ana cümlede yanlış zaman kullanır ('would have largely been avoided' gerekirdi).",
    tags: ["inverted-third-conditional"],
    mockSetNumber: 5,
  },

  // -- Okuma --
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    prompt:
      "Parçaya göre, erken dönem endişelerin aksine, çalışanların çoğu evden çalışırken nasıl bir performans göstermiştir?",
    passageText:
      "As remote work has become increasingly common, researchers have begun to examine its effects on employee productivity. Contrary to early fears that working from home would lead to distraction and reduced output, several large-scale studies have found that many employees are actually more productive outside the traditional office environment, partly because they save time otherwise spent commuting. However, the same studies note that remote work is not equally beneficial for everyone; employees who lack a quiet, dedicated workspace at home often report greater difficulty concentrating than their office-based colleagues.",
    options: [
      "Daha az üretken oldular",
      "Daha üretken oldular",
      "Performanslarında hiçbir değişiklik olmadı",
      "Tamamen çalışmayı bıraktılar",
    ],
    correctIndex: 1,
    explanation:
      "Parçada, erken dönem endişelerin aksine ('contrary to early fears'), birçok çalışanın geleneksel ofis ortamının dışında aslında daha üretken olduğu belirtilmiştir.",
    tags: ["detail-question"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçaya göre bazı çalışanların evden çalışırken odaklanmakta zorlanmasının nedeni nedir?",
    passageText:
      "As remote work has become increasingly common, researchers have begun to examine its effects on employee productivity. Contrary to early fears that working from home would lead to distraction and reduced output, several large-scale studies have found that many employees are actually more productive outside the traditional office environment, partly because they save time otherwise spent commuting. However, the same studies note that remote work is not equally beneficial for everyone; employees who lack a quiet, dedicated workspace at home often report greater difficulty concentrating than their office-based colleagues.",
    options: [
      "İşe gidip gelme süresinin uzun olması",
      "Evde sessiz ve ayrılmış bir çalışma alanının bulunmaması",
      "Yöneticileriyle iletişim kuramamaları",
      "İnternet bağlantılarının yavaş olması",
    ],
    correctIndex: 1,
    explanation:
      "Parçada, evde sessiz ve kendine ait bir çalışma alanına sahip olmayan çalışanların ofis tabanlı meslektaşlarına kıyasla odaklanmakta daha fazla güçlük çektiği belirtilmiştir.",
    tags: ["cause-effect-detail"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    prompt: "Parçada geçen 'contrary to' ifadesi bağlama göre en yakın olarak hangi anlama gelir?",
    passageText:
      "As remote work has become increasingly common, researchers have begun to examine its effects on employee productivity. Contrary to early fears that working from home would lead to distraction and reduced output, several large-scale studies have found that many employees are actually more productive outside the traditional office environment, partly because they save time otherwise spent commuting. However, the same studies note that remote work is not equally beneficial for everyone; employees who lack a quiet, dedicated workspace at home often report greater difficulty concentrating than their office-based colleagues.",
    options: ["ile aynı doğrultuda", "aksine/tersine", "sayesinde", "hakkında"],
    correctIndex: 1,
    explanation:
      "'Contrary to early fears' ifadesindeki 'contrary to', erken dönem endişelerin gerçekleşmediğini, sonucun beklenenin tersi olduğunu belirtmek için kullanılır; bu nedenle 'aksine/tersine' anlamına gelir.",
    tags: ["vocabulary-in-context"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YDS",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    prompt: "Parçanın ana fikri nedir?",
    passageText:
      "As remote work has become increasingly common, researchers have begun to examine its effects on employee productivity. Contrary to early fears that working from home would lead to distraction and reduced output, several large-scale studies have found that many employees are actually more productive outside the traditional office environment, partly because they save time otherwise spent commuting. However, the same studies note that remote work is not equally beneficial for everyone; employees who lack a quiet, dedicated workspace at home often report greater difficulty concentrating than their office-based colleagues.",
    options: [
      "Uzaktan çalışma herkes için eşit derecede olumsuz sonuçlar doğurmuştur.",
      "Uzaktan çalışma genel olarak üretkenliği artırabilir, ancak bu fayda uygun bir çalışma ortamına sahip olmayan çalışanlar için aynı ölçüde geçerli değildir.",
      "Çalışanların tamamı evde daha az üretken olmuştur.",
      "İşe gidip gelme süresi üretkenlik üzerinde hiçbir etkiye sahip değildir.",
    ],
    correctIndex: 1,
    explanation:
      "Parça, uzaktan çalışmanın genel olarak üretkenliği artırdığını ancak uygun çalışma koşullarına sahip olmayan çalışanlar için bu faydanın aynı ölçüde geçerli olmadığını anlatır; bu da B seçeneğiyle örtüşür.",
    tags: ["main-idea"],
    mockSetNumber: 5,
  },
];
