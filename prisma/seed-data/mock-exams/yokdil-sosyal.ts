import type { DiagnosticQuestionSeed } from "../diagnostic-questions";

export const MOCK_YOKDIL_SOSYAL: DiagnosticQuestionSeed[] = [
  // ================================================================
  // DENEME 1 — Ekonomi / Sosyoloji ağırlıklı
  // ================================================================

  // --- Kelime Bilgisi (8) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Rising income ---- has become one of the most pressing challenges facing modern economies, as the gap between the wealthy and the poor continues to widen.",
    options: ["inequality", "equality", "uniformity", "abundance"],
    correctIndex: 0,
    explanation:
      "Cümlenin devamında zengin ve yoksul arasındaki farkın 'genişlemeye devam ettiği' belirtilir; bu, 'eşitsizlik' (inequality) anlamına gelen sözcüğü gerektirir. 'Equality' (eşitlik) bağlamla tam tersi bir anlam taşır.",
    tags: ["sosyal-vocab", "ekonomi", "synonym-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Before the merger could proceed, the two companies had to ---- an agreement on how shared resources would be divided.",
    options: ["reach", "do", "make", "take"],
    correctIndex: 0,
    explanation:
      "'Reach an agreement' (bir anlaşmaya varmak) doğru collocation'dır; 'do/make/take an agreement' İngilizcede kullanılmaz.",
    tags: ["sosyal-vocab", "hukuk", "collocation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The research team plans to ---- a large-scale survey to measure public attitudes toward immigration.",
    options: ["carry out", "carry on", "carry over", "carry away"],
    correctIndex: 0,
    explanation:
      "'Carry out a survey' (bir anket yürütmek) doğru phrasal verb kullanımıdır; 'carry on' devam etmek, 'carry over' bir sonraki döneme taşımak, 'carry away' sürüklemek anlamına gelir ve bağlama uymaz.",
    tags: ["sosyal-vocab", "sosyoloji", "phrasal-verb"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The government's economic ---- have been criticized for disproportionately benefiting large corporations.",
    options: ["policy", "policies", "politics", "policing"],
    correctIndex: 1,
    explanation:
      "Boşluktan sonra gelen 'have been criticized' çoğul bir özne gerektirir; bu nedenle çoğul isim olan 'policies' doğrudur. 'Policy' tekildir, 'politics' siyaset anlamına gelir, 'policing' ise polislik faaliyeti demektir.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "word-form"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Despite widespread ---- from opposition parties, the new tax bill passed narrowly in parliament.",
    options: ["backlash", "endorsement", "indifference", "consensus"],
    correctIndex: 0,
    explanation:
      "Yasanın 'güçlükle/dar farkla' geçmesi, ona karşı güçlü bir tepki olduğunu ima eder; bu nedenle 'backlash' (sert tepki) doğrudur. 'Endorsement' (destek) ve 'consensus' (uzlaşma) cümledeki zorlukla çelişir.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "synonym-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Many historians argue that the revolution was not a sudden event but rather the ---- of decades of social unrest.",
    options: ["culmination", "prevention", "coincidence", "repetition"],
    correctIndex: 0,
    explanation:
      "'Decades of social unrest' (on yıllarca süren toplumsal huzursuzluk) birikip bir sonuca ulaşma fikrini taşır; bu da 'culmination' (doruk noktası, sonuç) ile ifade edilir. Diğer seçenekler bu birikim fikrini karşılamaz.",
    tags: ["sosyal-vocab", "tarih", "synonym-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The professor's lecture on cognitive bias was so ---- that even non-specialists could follow the argument with ease.",
    options: ["lucid", "convoluted", "esoteric", "ambiguous"],
    correctIndex: 0,
    explanation:
      "'Even non-specialists could follow... with ease' ifadesi dersin açık ve anlaşılır olduğunu gösterir; bu da 'lucid' (berrak, anlaşılır) ile örtüşür. 'Convoluted' ve 'esoteric' karmaşık/anlaşılması güç anlamına gelir ve cümleyle çelişir.",
    tags: ["sosyal-vocab", "psikoloji", "synonym-in-context"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Anthropological fieldwork often requires researchers to ---- themselves in unfamiliar cultural settings for extended periods.",
    options: ["immerse", "isolate", "distance", "detach"],
    correctIndex: 0,
    explanation:
      "'Immerse oneself in' (kendini bir şeyin içine tamamen vermek) alan araştırmasının doğasına uygundur. 'Isolate/distance/detach' ise araştırmacının ortamdan uzaklaşması anlamına gelir ve bağlamla çelişir.",
    tags: ["sosyal-vocab", "antropoloji", "collocation"],
    mockSetNumber: 1,
  },

  // --- İngilizce'den Türkçe'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "The report was commissioned by the ministry to assess the impact of the new education policy.",
    options: [
      "Rapor, yeni eğitim politikasının etkisini değerlendirmek amacıyla bakanlık tarafından hazırlatıldı.",
      "Rapor, yeni eğitim politikasının etkisini değerlendirmek amacıyla bakanlık tarafından hazırlanacak.",
      "Bakanlık, yeni eğitim politikasının etkisini değerlendirmek için raporu kendisi hazırladı.",
      "Rapor, yeni eğitim politikasının etkisini değerlendirmek amacıyla bakanlığa sunuldu.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle geçmiş zamanda edilgen çatıdadır ('was commissioned'); doğru çeviri hem zamanı hem de 'bakanlık tarafından hazırlatıldı' anlamını doğru yansıtan A'dır. B yanlış zaman (gelecek), C bakanlığın raporu bizzat hazırladığını söyleyerek anlamı değiştirir, D ise 'sunuldu' diyerek farklı bir eylemi ifade eder.",
    tags: ["sosyal-vocab", "egitim", "passive-translation"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt:
      "Critics argue that the reform will exacerbate existing social inequalities rather than reduce them.",
    options: [
      "Eleştirmenler, reformun mevcut sosyal eşitsizlikleri azaltmak yerine daha da kötüleştireceğini savunuyor.",
      "Eleştirmenler, reformun mevcut sosyal eşitsizlikleri azaltacağını savunuyor.",
      "Eleştirmenler, reformun geçmişte sosyal eşitsizlikleri kötüleştirdiğini savunuyor.",
      "Destekçiler, reformun sosyal eşitsizlikleri azaltacağını savunuyor.",
    ],
    correctIndex: 0,
    explanation:
      "Cümlede 'exacerbate ... rather than reduce' (azaltmak yerine kötüleştirmek) karşıtlığı doğru şekilde yalnızca A'da korunmuştur. B anlamı tersine çevirir, C yanlış zaman kullanır, D ise özneyi ('eleştirmenler' yerine 'destekçiler') değiştirir.",
    tags: ["sosyal-vocab", "sosyoloji"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt:
      "A growing number of sociologists believe that social media has fundamentally altered the way people form political opinions.",
    options: [
      "Artan sayıda sosyolog, sosyal medyanın insanların siyasi görüş oluşturma biçimini kökten değiştirdiğine inanıyor.",
      "Birkaç sosyolog, sosyal medyanın insanların siyasi görüşlerini hiç etkilemediğine inanıyor.",
      "Artan sayıda sosyolog, sosyal medyanın gelecekte siyasi görüşleri değiştireceğine inanıyor.",
      "Artan sayıda gazeteci, sosyal medyanın siyasi görüşleri kökten değiştirdiğine inanıyor.",
    ],
    correctIndex: 0,
    explanation:
      "Doğru çeviri hem 'a growing number of sociologists' (artan sayıda sosyolog) hem de şimdiki zamanda gerçekleşmiş bir değişimi doğru yansıtan A'dır. B anlamı tersine çevirir, C yanlış zaman (gelecek) kullanır, D özneyi 'sosyolog' yerine 'gazeteci' yapar.",
    tags: ["sosyal-vocab", "medya-calismalari"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt:
      "The court's ruling set a precedent that will influence future cases involving digital privacy.",
    options: [
      "Mahkemenin kararı, dijital gizlilikle ilgili gelecekteki davaları etkileyecek bir emsal oluşturdu.",
      "Mahkemenin kararı, dijital gizlilikle ilgili geçmiş davaları etkileyen bir emsal oluşturdu.",
      "Mahkeme, dijital gizlilikle ilgili gelecekteki davalar hakkında henüz bir karar vermedi.",
      "Mahkemenin kararı, dijital gizlilikle hiçbir ilgisi olmayan bir emsal oluşturdu.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'will influence future cases' (gelecekteki davaları etkileyecek) ifadesi yalnızca A'da doğru yansıtılmıştır. B 'geçmiş davalar' diyerek zamanı değiştirir, C mahkemenin henüz karar vermediğini söyleyerek cümleyle çelişir, D ise dijital gizlilikle ilgisi olmadığını söyleyerek anlamı tersine çevirir.",
    tags: ["sosyal-vocab", "hukuk"],
    mockSetNumber: 1,
  },

  // --- Türkçe'den İngilizce'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Ekonomistler, enflasyonun önümüzdeki yıl yavaşlayacağını tahmin ediyor.",
    options: [
      "Economists predict that inflation will slow down next year.",
      "Economists predicted that inflation had slowed down last year.",
      "Economists doubt that inflation will slow down next year.",
      "Economists predict that inflation slowed down next year.",
    ],
    correctIndex: 0,
    explanation:
      "Türkçe cümle şimdiki zamanda bir tahmini ('tahmin ediyor') ve gelecekte olacak bir eylemi ('yavaşlayacağını') anlatır; bu ikisini birlikte doğru veren tek seçenek A'dır. B yanlış zaman, C 'tahmin' yerine 'şüphe' anlamı taşır, D ise gelecek zamanı geçmiş zamanla karıştırır.",
    tags: ["sosyal-vocab", "ekonomi", "zamanlar"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu yasa, yürürlüğe girdiğinden bu yana pek çok kez eleştirilmiştir.",
    options: [
      "This law has been criticized many times since it came into effect.",
      "This law will be criticized many times after it comes into effect.",
      "This law was criticized only once before it came into effect.",
      "This law has criticized many people since it came into effect.",
    ],
    correctIndex: 0,
    explanation:
      "'Yürürlüğe girdiğinden bu yana ... eleştirilmiştir' ifadesi present perfect ve edilgen çatı gerektirir; bu iki özelliği birlikte taşıyan tek seçenek A'dır. B gelecek zaman kullanır, C 'yalnızca bir kez' ve 'önce' diyerek anlamı değiştirir, D ise edilgen çatıyı etken çatıya çevirerek yasanın insanları eleştirdiğini söyler.",
    tags: ["sosyal-vocab", "hukuk", "edilgen-cati"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Eğitimciler, standartlaştırılmış sınavların öğrenci yaratıcılığını bastırdığını öne sürüyorlar.",
    options: [
      "Educators argue that standardized tests suppress students' creativity.",
      "Educators argue that standardized tests enhance students' creativity.",
      "Educators argued that standardized tests had suppressed students' creativity.",
      "Students argue that standardized tests suppress educators' creativity.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'bastırdığını' (suppress) fiili ve şimdiki zaman ('öne sürüyorlar') yalnızca A'da doğru korunmuştur. B anlamı tersine çevirir ('enhance'), C yanlış zaman kullanır, D ise özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "egitim"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Antropologlar, bu geleneğin yüzyıllardır değişmeden korunduğunu belirtiyor.",
    options: [
      "Anthropologists state that this tradition has been preserved unchanged for centuries.",
      "Anthropologists state that this tradition will be preserved unchanged for centuries.",
      "Anthropologists state that this tradition has changed significantly for centuries.",
      "Anthropologists doubt that this tradition has been preserved unchanged for centuries.",
    ],
    correctIndex: 0,
    explanation:
      "'Yüzyıllardır değişmeden korunduğunu belirtiyor' ifadesi present perfect, edilgen çatı ve 'belirtmek' (state, kesinlik bildiren bir fiil) gerektirir; bunların hepsini doğru veren tek seçenek A'dır. B yanlış zaman, C anlamı tersine çevirir, D ise 'belirtiyor' yerine 'şüphe ediyor' anlamı taşır.",
    tags: ["sosyal-vocab", "antropoloji", "edilgen-cati"],
    mockSetNumber: 1,
  },

  // --- Okuma (4 — tek parça, 4 soru) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    passageText:
      "Social mobility refers to the ability of individuals or families to move between different social and economic positions, typically measured across generations. In societies with high social mobility, a person's income or occupation is only weakly linked to that of their parents, suggesting that factors such as effort, education, and opportunity play a larger role than inherited privilege. Comparative studies have shown that countries with strong public education systems and accessible healthcare tend to exhibit higher rates of social mobility, whereas nations with pronounced income inequality and limited access to quality schooling often see social position passed down largely unchanged from one generation to the next.",
    prompt: "Parçaya göre, sosyal hareketlilik (social mobility) ne anlama gelmektedir?",
    options: [
      "Bireylerin veya ailelerin nesiller arasında farklı sosyal ve ekonomik konumlar arasında hareket edebilme yeteneği",
      "Bireylerin yaşadıkları şehri sıklıkla değiştirmesi",
      "Ailelerin gelirlerini sürekli aynı düzeyde tutma becerisi",
      "Toplumdaki suç oranlarının nesiller boyu değişimi",
    ],
    correctIndex: 0,
    explanation:
      "Parçanın ilk cümlesi sosyal hareketliliği doğrudan 'bireylerin veya ailelerin farklı sosyal ve ekonomik konumlar arasında hareket edebilme yeteneği' olarak tanımlar.",
    tags: ["sosyal-reading", "sosyoloji", "detail-question"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Social mobility refers to the ability of individuals or families to move between different social and economic positions, typically measured across generations. In societies with high social mobility, a person's income or occupation is only weakly linked to that of their parents, suggesting that factors such as effort, education, and opportunity play a larger role than inherited privilege. Comparative studies have shown that countries with strong public education systems and accessible healthcare tend to exhibit higher rates of social mobility, whereas nations with pronounced income inequality and limited access to quality schooling often see social position passed down largely unchanged from one generation to the next.",
    prompt:
      "Parçaya göre, sosyal hareketliliğin yüksek olduğu toplumlarda bir bireyin geliri neyle daha zayıf bir ilişki göstermektedir?",
    options: [
      "Ebeveynlerinin geliri veya mesleğiyle",
      "Kendi eğitim düzeyiyle",
      "Yaşadığı ülkenin nüfusuyla",
      "Çalıştığı sektörün büyüklüğüyle",
    ],
    correctIndex: 0,
    explanation:
      "Parçada 'a person's income or occupation is only weakly linked to that of their parents' (bir kişinin geliri veya mesleği, ebeveynlerinkiyle yalnızca zayıf bir bağ gösterir) ifadesi açıkça belirtilmiştir.",
    tags: ["sosyal-reading", "sosyoloji", "detail-question"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Social mobility refers to the ability of individuals or families to move between different social and economic positions, typically measured across generations. In societies with high social mobility, a person's income or occupation is only weakly linked to that of their parents, suggesting that factors such as effort, education, and opportunity play a larger role than inherited privilege. Comparative studies have shown that countries with strong public education systems and accessible healthcare tend to exhibit higher rates of social mobility, whereas nations with pronounced income inequality and limited access to quality schooling often see social position passed down largely unchanged from one generation to the next.",
    prompt:
      "Parçaya göre, yüksek sosyal hareketliliğe sahip toplumlarda kişinin konumunu belirlemede hangi etmenler daha büyük rol oynamaktadır?",
    options: [
      "Miras kalan ayrıcalık",
      "Çaba, eğitim ve fırsat",
      "Doğum yeri ve etnik köken",
      "Ailenin siyasi bağlantıları",
    ],
    correctIndex: 1,
    explanation:
      "Parça, bu tür toplumlarda 'effort, education, and opportunity' (çaba, eğitim ve fırsat) gibi etmenlerin miras kalan ayrıcalıktan daha büyük bir rol oynadığını belirtir.",
    tags: ["sosyal-reading", "sosyoloji", "detail-question"],
    mockSetNumber: 1,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "Social mobility refers to the ability of individuals or families to move between different social and economic positions, typically measured across generations. In societies with high social mobility, a person's income or occupation is only weakly linked to that of their parents, suggesting that factors such as effort, education, and opportunity play a larger role than inherited privilege. Comparative studies have shown that countries with strong public education systems and accessible healthcare tend to exhibit higher rates of social mobility, whereas nations with pronounced income inequality and limited access to quality schooling often see social position passed down largely unchanged from one generation to the next.",
    prompt:
      "Parçaya göre, güçlü kamu eğitimi ve erişilebilir sağlık hizmetlerine sahip ülkelerde ne gözlemlenmektedir?",
    options: [
      "Daha yüksek oranda sosyal hareketlilik",
      "Daha düşük oranda okuryazarlık",
      "Sosyal hareketliliğin tamamen ortadan kalkması",
      "Gelir eşitsizliğinin hızla artması",
    ],
    correctIndex: 0,
    explanation:
      "Parça, güçlü kamu eğitimi ve erişilebilir sağlık hizmetlerine sahip ülkelerin 'higher rates of social mobility' (daha yüksek oranda sosyal hareketlilik) sergilediğini belirtir; bu durum, gelir eşitsizliğinin yüksek olduğu ülkelerle karşıtlık oluşturur.",
    tags: ["sosyal-reading", "sosyoloji", "inference-question"],
    mockSetNumber: 1,
  },

  // ================================================================
  // DENEME 2 — Psikoloji / Eğitim ağırlıklı
  // ================================================================

  // --- Kelime Bilgisi (8) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Children who receive consistent praise for effort rather than innate ability tend to develop a more ---- mindset toward challenges.",
    options: ["resilient", "fragile", "indifferent", "passive"],
    correctIndex: 0,
    explanation:
      "Çabaya yönelik övgü almak, çocuklarda zorluklar karşısında 'dayanıklı/esnek' (resilient) bir bakış açısı geliştirir. 'Fragile' (kırılgan) ve 'passive' (edilgen) bu olumlu gelişimle çelişir.",
    tags: ["sosyal-vocab", "psikoloji", "synonym-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The results ---- serious concerns about the reliability of standardized testing.",
    options: ["raise", "rise", "arise", "risen"],
    correctIndex: 0,
    explanation:
      "Boşluktan sonra bir nesne ('concerns') geldiği için geçişli bir fiil gerekir; bu nedenle 'raise' doğrudur. 'Rise' ve 'arise' geçişsizdir ve nesne alamaz, 'risen' ise çekimli bir fiil değildir.",
    tags: ["sosyal-vocab", "egitim", "word-form"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The professor's argument was so ---- that students struggled to identify its central claim.",
    options: ["convoluted", "straightforward", "concise", "coherent"],
    correctIndex: 0,
    explanation:
      "Öğrencilerin 'merkezi iddiayı tespit etmekte zorlanması', argümanın karmaşık/dolambaçlı olduğunu gösterir; bu da 'convoluted' ile ifade edilir. 'Straightforward', 'concise' ve 'coherent' anlaşılır olmayı ima eder ve cümleyle çelişir.",
    tags: ["sosyal-vocab", "egitim", "synonym-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Teachers must ---- for the diverse learning needs of students in an inclusive classroom.",
    options: ["account", "count", "discount", "recount"],
    correctIndex: 0,
    explanation:
      "'Account for' (göz önünde bulundurmak, karşılamak) bağlama uyan doğru phrasal verb'dür. 'Count for', 'discount' ve 'recount' bu anlamı taşımaz.",
    tags: ["sosyal-vocab", "egitim", "phrasal-verb"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Early childhood experiences can have a ---- effect on personality development that persists into adulthood.",
    options: ["lasting", "temporary", "negligible", "reversible"],
    correctIndex: 0,
    explanation:
      "'Persists into adulthood' (yetişkinliğe kadar sürer) ifadesi kalıcı bir etkiyi ('lasting') ima eder. 'Temporary' (geçici) ve 'reversible' (geri döndürülebilir) bu süreklilikle çelişir.",
    tags: ["sosyal-vocab", "psikoloji", "synonym-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Despite the setback, the students showed remarkable ----, quickly adapting their study strategies to improve their grades.",
    options: ["resilience", "apathy", "complacency", "reluctance"],
    correctIndex: 0,
    explanation:
      "'Quickly adapting their study strategies' (çalışma stratejilerini hızla uyarlamak) bir aksiliğe rağmen gösterilen dayanıklılığı ('resilience') ima eder. 'Apathy' (ilgisizlik) ve 'reluctance' (isteksizlik) bu hızlı uyum ile çelişir.",
    tags: ["sosyal-vocab", "psikoloji", "synonym-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The curriculum reform was designed to ---- critical thinking rather than rote memorization.",
    options: ["foster", "discourage", "neglect", "suppress"],
    correctIndex: 0,
    explanation:
      "'Rather than rote memorization' (ezber yerine) zıtlığı, eleştirel düşüncenin teşvik edilmesini ('foster') gerektirir. 'Discourage' ve 'suppress' (caydırmak, bastırmak) reformun amacıyla çelişir.",
    tags: ["sosyal-vocab", "egitim", "synonym-in-context"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Psychologists caution against drawing firm conclusions from a single case study, as the findings may not be ---- to the wider population.",
    options: ["generalizable", "temporary", "coincidental", "anecdotal"],
    correctIndex: 0,
    explanation:
      "Tek bir vaka çalışmasından elde edilen bulguların geniş bir nüfusa uygulanabilirliği 'generalizable' (genellenebilir) ile ifade edilir. Diğer seçenekler bu bağlamda 'to the wider population' ile anlamlı bir birleşim oluşturmaz.",
    tags: ["sosyal-vocab", "psikoloji", "synonym-in-context"],
    mockSetNumber: 2,
  },

  // --- İngilizce'den Türkçe'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Psychologists have found that chronic stress can impair both memory and decision-making abilities.",
    options: [
      "Psikologlar, kronik stresin hem hafızayı hem de karar verme becerilerini bozabileceğini tespit etmiştir.",
      "Psikologlar, kronik stresin hafızayı geliştirdiğini tespit etmiştir.",
      "Psikologlar, kronik stresin gelecekte hafızayı bozacağını tahmin etmektedir.",
      "Psikologlar, akut stresin hafızayı bozabileceğini tespit etmiştir.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'impair both memory and decision-making abilities' (hem hafızayı hem karar verme becerilerini bozmak) ifadesi yalnızca A'da tam olarak korunmuştur. B anlamı tersine çevirir, C 'tespit' yerine 'tahmin' kullanır, D ise 'chronic' (kronik) yerine 'akut' der.",
    tags: ["sosyal-vocab", "psikoloji"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Teachers who set clear expectations tend to foster a more productive classroom environment.",
    options: [
      "Net beklentiler belirleyen öğretmenler, daha üretken bir sınıf ortamı oluşturma eğilimindedir.",
      "Net beklentiler belirlemeyen öğretmenler, daha üretken bir sınıf ortamı oluşturma eğilimindedir.",
      "Net beklentiler belirleyen öğrenciler, daha üretken bir sınıf ortamı oluşturma eğilimindedir.",
      "Net beklentiler belirleyen öğretmenler, daha az üretken bir sınıf ortamı oluşturma eğilimindedir.",
    ],
    correctIndex: 0,
    explanation:
      "Doğru çeviri özneyi ('öğretmenler'), olumlu ifadeyi ('belirleyen') ve sonucu ('daha üretken') doğru koruyan A'dır. B olumsuzluk ekler, C özneyi değiştirir, D sonucu tersine çevirir.",
    tags: ["sosyal-vocab", "egitim"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "The experiment was designed to determine whether financial incentives improve academic performance.",
    options: [
      "Deney, maddi teşviklerin akademik performansı artırıp artırmadığını belirlemek için tasarlanmıştır.",
      "Deney, maddi teşviklerin akademik performansı kesinlikle artırdığını kanıtlamak için tasarlanmıştır.",
      "Deney, akademik performansın maddi teşvikleri nasıl etkilediğini belirlemek için tasarlanmıştır.",
      "Deney, maddi teşviklerin akademik performansı artırıp artırmayacağını gelecekte belirleyecektir.",
    ],
    correctIndex: 0,
    explanation:
      "'Determine whether' (...olup olmadığını belirlemek) ifadesi bir belirsizliği araştırmayı ifade eder; bu nedenle A doğrudur. B kesinlik iddia ederek anlamı değiştirir, C neden-sonuç ilişkisini tersine çevirir, D yanlış zaman (gelecek) kullanır.",
    tags: ["sosyal-vocab", "egitim"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Some educators argue that excessive homework contributes to student burnout.",
    options: [
      "Bazı eğitimciler, aşırı ev ödevinin öğrenci tükenmişliğine katkıda bulunduğunu savunuyor.",
      "Bazı eğitimciler, aşırı ev ödevinin öğrenci tükenmişliğini önlediğini savunuyor.",
      "Bazı öğrenciler, aşırı ev ödevinin eğitimci tükenmişliğine katkıda bulunduğunu savunuyor.",
      "Bazı eğitimciler, yetersiz ev ödevinin öğrenci tükenmişliğine katkıda bulunduğunu savunuyor.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'excessive homework' (aşırı ev ödevi) ve 'contributes to burnout' (tükenmişliğe katkıda bulunur) ifadeleri yalnızca A'da doğru korunmuştur. B anlamı tersine çevirir, C özneyi değiştirir, D 'aşırı' yerine 'yetersiz' der.",
    tags: ["sosyal-vocab", "egitim"],
    mockSetNumber: 2,
  },

  // --- Türkçe'den İngilizce'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Araştırmacılar, uyku eksikliğinin bilişsel performansı olumsuz etkilediğini uzun süredir bilmektedir.",
    options: [
      "Researchers have long known that sleep deprivation negatively affects cognitive performance.",
      "Researchers will soon know that sleep deprivation negatively affects cognitive performance.",
      "Researchers have long known that sleep deprivation positively affects cognitive performance.",
      "Researchers have long doubted that sleep deprivation negatively affects cognitive performance.",
    ],
    correctIndex: 0,
    explanation:
      "'Uzun süredir bilmektedir' present perfect ile ifade edilir ve 'olumsuz etkilediğini' anlamı korunmalıdır; bu ikisini doğru veren tek seçenek A'dır. B yanlış zaman, C anlamı tersine çevirir, D 'bilmek' yerine 'şüphe etmek' kullanır.",
    tags: ["sosyal-vocab", "psikoloji", "zamanlar"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu terapi yöntemi, özellikle kaygı bozukluğu olan hastalarda etkili olduğu kanıtlanmıştır.",
    options: [
      "This method of therapy has been proven effective, particularly in patients with anxiety disorder.",
      "This method of therapy will be proven effective, particularly in patients with anxiety disorder.",
      "This method of therapy has been proven ineffective, particularly in patients with anxiety disorder.",
      "This method of therapy has proven that patients with anxiety disorder are effective.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle present perfect ve edilgen çatı gerektirir ('kanıtlanmıştır' → 'has been proven'); bu yapıyı doğru veren tek seçenek A'dır. B yanlış zaman, C anlamı tersine çevirir, D ise anlamsız bir yapı oluşturur.",
    tags: ["sosyal-vocab", "psikoloji", "edilgen-cati"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Okul öncesi eğitim, çocukların sosyal becerilerinin gelişiminde önemli bir rol oynar.",
    options: [
      "Preschool education plays an important role in the development of children's social skills.",
      "Preschool education played an important role in the development of children's social skills.",
      "Preschool education plays a minor role in the development of children's social skills.",
      "Children's social skills play an important role in the development of preschool education.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle geniş zamanda genel bir gerçeği anlatır ve 'önemli bir rol' ifadesini içerir; bu ikisini doğru veren tek seçenek A'dır. B yanlış zaman kullanır, C 'önemli' yerine 'küçük' der, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "egitim"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Uzmanlar, ekran süresinin çocuklar üzerindeki etkisi konusunda hemfikir değildir.",
    options: [
      "Experts do not agree on the effect of screen time on children.",
      "Experts agree on the effect of screen time on children.",
      "Experts did not agree on the effect of screen time on children in the past.",
      "Children do not agree on the effect of screen time on experts.",
    ],
    correctIndex: 0,
    explanation:
      "'Hemfikir değildir' olumsuzluğu ve şimdiki zaman yalnızca A'da doğru korunmuştur. B olumsuzluğu kaldırır, C 'geçmişte' ekleyerek durumun artık geçerli olmadığını ima eder, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "psikoloji"],
    mockSetNumber: 2,
  },

  // --- Okuma (4 — tek parça, 4 soru) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    passageText:
      "Behavioral economists have long observed that people do not always make decisions in the rational, self-interested manner traditional economic models assume. One well-documented example is the framing effect, in which individuals respond differently to logically equivalent choices depending on how those choices are presented. For instance, patients are more likely to consent to a medical procedure described as having a '90 percent survival rate' than one described as having a '10 percent mortality rate,' even though the two statements convey identical information. Such findings have prompted policymakers to consider how the wording of public health messages might be adjusted to encourage better decision-making.",
    prompt: "Parçaya göre, çerçeveleme etkisi (framing effect) nedir?",
    options: [
      "Bireylerin mantıksal olarak eşdeğer seçimlere, bu seçimlerin sunuluş biçimine göre farklı tepki vermesi",
      "İnsanların her zaman rasyonel kararlar vermesi",
      "Ekonomik modellerin gerçek davranışı mükemmel şekilde tahmin etmesi",
      "Hastaların tıbbi prosedürleri her zaman reddetmesi",
    ],
    correctIndex: 0,
    explanation:
      "Parça, çerçeveleme etkisini 'individuals respond differently to logically equivalent choices depending on how those choices are presented' (bireylerin mantıksal olarak eşdeğer seçimlere, sunuluş biçimine göre farklı tepki vermesi) olarak tanımlar.",
    tags: ["sosyal-reading", "psikoloji", "main-idea-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Behavioral economists have long observed that people do not always make decisions in the rational, self-interested manner traditional economic models assume. One well-documented example is the framing effect, in which individuals respond differently to logically equivalent choices depending on how those choices are presented. For instance, patients are more likely to consent to a medical procedure described as having a '90 percent survival rate' than one described as having a '10 percent mortality rate,' even though the two statements convey identical information. Such findings have prompted policymakers to consider how the wording of public health messages might be adjusted to encourage better decision-making.",
    prompt:
      "Parçadaki örneğe göre, hastalar hangi ifadeyle karşılaştıklarında bir tıbbi prosedürü kabul etmeye daha yatkındır?",
    options: [
      "'Yüzde 90 hayatta kalma oranı' ifadesiyle",
      "'Yüzde 10 hayatta kalma oranı' ifadesiyle",
      "'Yüzde 90 ölüm oranı' ifadesiyle",
      "Herhangi bir istatistik verilmediğinde",
    ],
    correctIndex: 0,
    explanation:
      "Parça, hastaların bir prosedürü '90 percent survival rate' (yüzde 90 hayatta kalma oranı) olarak sunulduğunda, aynı bilgiyi taşıyan '10 percent mortality rate' ifadesine göre daha kolay kabul ettiğini belirtir.",
    tags: ["sosyal-reading", "psikoloji", "detail-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Behavioral economists have long observed that people do not always make decisions in the rational, self-interested manner traditional economic models assume. One well-documented example is the framing effect, in which individuals respond differently to logically equivalent choices depending on how those choices are presented. For instance, patients are more likely to consent to a medical procedure described as having a '90 percent survival rate' than one described as having a '10 percent mortality rate,' even though the two statements convey identical information. Such findings have prompted policymakers to consider how the wording of public health messages might be adjusted to encourage better decision-making.",
    prompt: "Parçaya göre, geleneksel ekonomik modeller insan davranışı hakkında ne varsaymaktadır?",
    options: [
      "İnsanların her zaman rasyonel ve kendi çıkarına uygun kararlar verdiğini",
      "İnsanların kararlarının sunuluş biçiminden etkilendiğini",
      "İnsanların tıbbi kararlarda her zaman duygusal davrandığını",
      "İnsanların genellikle mantıksız olduğunu",
    ],
    correctIndex: 0,
    explanation:
      "Parça, geleneksel ekonomik modellerin insanların 'rational, self-interested manner' (rasyonel, kendi çıkarına uygun bir biçimde) karar verdiğini varsaydığını, ancak gerçek davranışın bundan saptığını belirtir.",
    tags: ["sosyal-reading", "psikoloji", "detail-question"],
    mockSetNumber: 2,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "Behavioral economists have long observed that people do not always make decisions in the rational, self-interested manner traditional economic models assume. One well-documented example is the framing effect, in which individuals respond differently to logically equivalent choices depending on how those choices are presented. For instance, patients are more likely to consent to a medical procedure described as having a '90 percent survival rate' than one described as having a '10 percent mortality rate,' even though the two statements convey identical information. Such findings have prompted policymakers to consider how the wording of public health messages might be adjusted to encourage better decision-making.",
    prompt: "Parçaya göre, bu tür bulgular politika yapıcıları hangi konuyu değerlendirmeye itmiştir?",
    options: [
      "Halk sağlığı mesajlarının ifade biçiminin daha iyi karar almayı teşvik edecek şekilde düzenlenmesini",
      "Tüm tıbbi prosedürlerin zorunlu hale getirilmesini",
      "Ekonomik modellerin tamamen terk edilmesini",
      "Hastalara istatistik verilmesinin yasaklanmasını",
    ],
    correctIndex: 0,
    explanation:
      "Parçanın son cümlesi, bu bulguların politika yapıcıları 'how the wording of public health messages might be adjusted to encourage better decision-making' (halk sağlığı mesajlarının ifade biçiminin daha iyi karar almayı teşvik edecek şekilde düzenlenmesi) konusunu değerlendirmeye ittiğini belirtir.",
    tags: ["sosyal-reading", "psikoloji", "inference-question"],
    mockSetNumber: 2,
  },

  // ================================================================
  // DENEME 3 — Siyaset Bilimi / Hukuk ağırlıklı
  // ================================================================

  // --- Kelime Bilgisi (8) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The new law aims to ---- decision-making power from local governments to the central authority.",
    options: ["transfer", "transform", "translate", "transmit"],
    correctIndex: 0,
    explanation:
      "'Transfer power' (yetkiyi aktarmak) bağlama uyan doğru fiildir. 'Transform' (dönüştürmek), 'translate' (çevirmek) ve 'transmit' (iletmek/yaymak) yetkinin bir yerden başka bir yere aktarılması anlamını taşımaz.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "synonym-in-context"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The prosecution failed to ---- enough evidence, so the jury acquitted the defendant.",
    options: ["present", "prevent", "pretend", "protest"],
    correctIndex: 0,
    explanation:
      "'Present evidence' (kanıt sunmak) doğru collocation'dır; jürinin sanığı beraat ettirmesi, yeterli kanıt sunulamadığını gösterir. 'Prevent', 'pretend' ve 'protest' bu bağlamda anlamsızdır.",
    tags: ["sosyal-vocab", "hukuk", "collocation"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The Supreme Court decided to ---- the law on the grounds that it violated constitutional rights.",
    options: ["strike down", "strike up", "strike off", "strike out"],
    correctIndex: 0,
    explanation:
      "'Strike down a law' (bir yasayı anayasaya aykırı bularak iptal etmek) hukuki bağlamda doğru phrasal verb'dür. 'Strike up' bir ilişki/konuşma başlatmak, 'strike off' bir kayıttan silmek, 'strike out' çizmek/silmek anlamına gelir.",
    tags: ["sosyal-vocab", "hukuk", "phrasal-verb"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The senator's ---- to the bill was based on constitutional concerns rather than political rivalry.",
    options: ["object", "objection", "objective", "objectionable"],
    correctIndex: 1,
    explanation:
      "Boşluk 'the senator's ---- to the bill' yapısında bir isim gerektirir; doğru isim 'objection' (itiraz)dır. 'Object' fiil/isim (nesne), 'objective' amaç/hedef, 'objectionable' ise bir sıfattır.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "word-form"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The treaty was ratified only after ---- negotiations that lasted nearly a decade.",
    options: ["protracted", "brief", "informal", "unanimous"],
    correctIndex: 0,
    explanation:
      "'Lasted nearly a decade' (neredeyse on yıl sürdü) ifadesi, müzakerelerin uzun sürdüğünü ('protracted') gösterir. 'Brief' (kısa) bu süreyle doğrudan çelişir.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "synonym-in-context"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Authoritarian regimes often ---- dissent through censorship and the suppression of independent media.",
    options: ["stifle", "encourage", "tolerate", "amplify"],
    correctIndex: 0,
    explanation:
      "Sansür ve bağımsız medyanın bastırılması, muhalefetin 'boğulduğunu/bastırıldığını' ('stifle') gösterir. 'Encourage' ve 'amplify' bu baskıyla çelişir.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "synonym-in-context"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The constitution grants citizens the right to ---- petition their government without fear of retribution.",
    options: ["freely", "free", "freeing", "freedom"],
    correctIndex: 0,
    explanation:
      "Boşluk, 'petition' fiilini niteleyen bir zarf gerektirir; doğru seçenek 'freely' (özgürce)'dir. 'Free' sıfat/fiil, 'freeing' ulaç, 'freedom' ise isimdir ve fiili niteleyemez.",
    tags: ["sosyal-vocab", "hukuk", "word-form"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Legal scholars continue to debate whether the ruling constitutes a genuine ---- from established precedent.",
    options: ["departure", "arrival", "continuation", "repetition"],
    correctIndex: 0,
    explanation:
      "Bir kararın yerleşik içtihattan 'ayrılması/sapması' 'departure' ile ifade edilir. 'Continuation' (devamı) ve 'repetition' (tekrarı) bu sapma fikriyle çelişir.",
    tags: ["sosyal-vocab", "hukuk", "synonym-in-context"],
    mockSetNumber: 3,
  },

  // --- İngilizce'den Türkçe'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "The constitution guarantees freedom of speech, but this right is not absolute.",
    options: [
      "Anayasa ifade özgürlüğünü güvence altına alır, ancak bu hak mutlak değildir.",
      "Anayasa ifade özgürlüğünü güvence altına almaz, ancak bu hak mutlaktır.",
      "Anayasa ifade özgürlüğünü gelecekte güvence altına alacaktır, ancak bu hak mutlak değildir.",
      "Anayasa ifade özgürlüğünü güvence altına alır ve bu hak tamamen mutlaktır.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'guarantees' (güvence altına alır, şimdiki zaman) ve 'not absolute' (mutlak değildir) ifadeleri yalnızca A'da doğru korunmuştur. B her iki olumlu/olumsuzluğu tersine çevirir, C yanlış zaman kullanır, D 'mutlak değildir' yerine 'tamamen mutlaktır' der.",
    tags: ["sosyal-vocab", "hukuk"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The senator was accused of abusing his authority for personal gain.",
    options: [
      "Senatörün, kişisel çıkar için yetkisini kötüye kullandığı iddia edildi.",
      "Senatör, kişisel çıkar için yetkisini kötüye kullandığını itiraf etti.",
      "Senatörün, kamu yararı için yetkisini kullandığı iddia edildi.",
      "Senatör, gelecekte yetkisini kötüye kullanmakla suçlanacak.",
    ],
    correctIndex: 0,
    explanation:
      "'Was accused of' (iddia edildi/suçlandı) edilgen yapısı ve 'kişisel çıkar' ifadesi yalnızca A'da doğru korunmuştur. B 'iddia edilmek' yerine 'itiraf etmek' der, C 'kişisel çıkar' yerine 'kamu yararı' der, D yanlış zaman (gelecek) kullanır.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "edilgen-cati"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The court's decision was met with strong criticism from civil rights groups.",
    options: [
      "Mahkemenin kararı, sivil haklar gruplarından güçlü eleştiri aldı.",
      "Mahkemenin kararı, sivil haklar gruplarından güçlü destek aldı.",
      "Mahkeme, sivil haklar gruplarının kararını güçlü bir şekilde eleştirdi.",
      "Mahkemenin kararı, gelecekte sivil haklar gruplarından eleştiri alacak.",
    ],
    correctIndex: 0,
    explanation:
      "'Met with strong criticism' (güçlü eleştiri aldı) ifadesi yalnızca A'da doğru korunmuştur. B 'eleştiri' yerine 'destek' der, C özne ile nesneyi yer değiştirir, D yanlış zaman (gelecek) kullanır.",
    tags: ["sosyal-vocab", "hukuk"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "Without an independent judiciary, the rule of law cannot be fully upheld.",
    options: [
      "Bağımsız bir yargı olmadan, hukukun üstünlüğü tam olarak sağlanamaz.",
      "Bağımsız bir yargı sayesinde, hukukun üstünlüğü tam olarak sağlanamaz.",
      "Bağımsız bir yargı olmadan, hukukun üstünlüğü kolaylıkla sağlanır.",
      "Bağımsız bir yargı olmadan, hukukun üstünlüğü geçmişte tam olarak sağlanmıştı.",
    ],
    correctIndex: 0,
    explanation:
      "Cümledeki 'without' (olmadan) koşulu ve 'cannot be fully upheld' (tam olarak sağlanamaz) olumsuzluğu yalnızca A'da doğru korunmuştur. B 'olmadan' yerine 'sayesinde' der, C anlamı tersine çevirir, D yanlış zaman kullanır.",
    tags: ["sosyal-vocab", "hukuk"],
    mockSetNumber: 3,
  },

  // --- Türkçe'den İngilizce'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Yasa, meclis tarafından oy çokluğuyla kabul edildi.",
    options: [
      "The law was passed by the parliament with a majority vote.",
      "The law will be passed by the parliament with a majority vote.",
      "The law was rejected by the parliament with a majority vote.",
      "The parliament was passed by the law with a majority vote.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle geçmiş zamanda edilgen çatıdadır ('kabul edildi' → 'was passed'); bu yapıyı doğru veren tek seçenek A'dır. B yanlış zaman, C 'kabul' yerine 'reddetmek' der, D özne ile nesneyi yer değiştirerek anlamsız bir cümle oluşturur.",
    tags: ["sosyal-vocab", "siyaset-bilimi", "edilgen-cati"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Mahkeme, davayı yetersiz kanıt nedeniyle reddetti.",
    options: [
      "The court dismissed the case due to insufficient evidence.",
      "The court will dismiss the case due to insufficient evidence.",
      "The court accepted the case due to insufficient evidence.",
      "The court dismissed the case due to sufficient evidence.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle geçmiş zamanda ve 'yetersiz kanıt nedeniyle reddetti' anlamını taşır; bu ikisini doğru veren tek seçenek A'dır. B yanlış zaman, C 'reddetti' yerine 'kabul etti' der, D 'yetersiz' yerine 'yeterli' der.",
    tags: ["sosyal-vocab", "hukuk"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Vatandaşlar, hükümetin şeffaflık eksikliğinden dolayı protesto düzenlediler.",
    options: [
      "Citizens organized protests due to the government's lack of transparency.",
      "Citizens will organize protests due to the government's lack of transparency.",
      "Citizens organized protests due to the government's high level of transparency.",
      "The government organized protests due to citizens' lack of transparency.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle geçmiş zamanda ve 'şeffaflık eksikliği' anlamını taşır; bu ikisini doğru veren tek seçenek A'dır. B yanlış zaman kullanır, C 'eksikliği' yerine 'yüksek düzeyi' der, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "siyaset-bilimi"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Bu antlaşma, iki ülke arasındaki gerilimi azaltmayı amaçlamaktadır.",
    options: [
      "This treaty aims to reduce tension between the two countries.",
      "This treaty aimed to reduce tension between the two countries in the past.",
      "This treaty aims to increase tension between the two countries.",
      "The two countries aim to reduce tension between this treaty.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle şimdiki zamanda bir amacı ('amaçlamaktadır') ve gerilimi azaltma fikrini ('azaltmayı') taşır; bunları doğru veren tek seçenek A'dır. B yanlış zaman/ek ifade kullanır, C 'azaltmayı' yerine 'artırmayı' der, D özne ile nesneyi anlamsız biçimde yer değiştirir.",
    tags: ["sosyal-vocab", "siyaset-bilimi"],
    mockSetNumber: 3,
  },

  // --- Okuma (4 — tek parça, 4 soru) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    passageText:
      "The doctrine of separation of powers divides governmental authority among three branches: the legislative, the executive, and the judicial. Each branch is granted distinct responsibilities and, crucially, the ability to check the others, preventing any single branch from accumulating excessive power. In many constitutional democracies, the judiciary plays a particularly important role through judicial review, the power to assess whether laws passed by the legislature conform to the constitution. Critics of judicial review argue that it grants unelected judges disproportionate influence over policy, while supporters contend that it serves as an essential safeguard against the erosion of constitutional rights.",
    prompt: "Parçaya göre, kuvvetler ayrılığı doktrini yönetim yetkisini kaç bölüme ayırmaktadır?",
    options: ["İki", "Üç", "Dört", "Beş"],
    correctIndex: 1,
    explanation: "Parçada yönetim yetkisinin 'üç' (three) bölüme; yasama, yürütme ve yargıya ayrıldığı açıkça belirtilmiştir.",
    tags: ["sosyal-reading", "siyaset-bilimi", "detail-question"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "The doctrine of separation of powers divides governmental authority among three branches: the legislative, the executive, and the judicial. Each branch is granted distinct responsibilities and, crucially, the ability to check the others, preventing any single branch from accumulating excessive power. In many constitutional democracies, the judiciary plays a particularly important role through judicial review, the power to assess whether laws passed by the legislature conform to the constitution. Critics of judicial review argue that it grants unelected judges disproportionate influence over policy, while supporters contend that it serves as an essential safeguard against the erosion of constitutional rights.",
    prompt: "Parçaya göre, yargı denetimi (judicial review) nedir?",
    options: [
      "Yasama tarafından çıkarılan yasaların anayasaya uygunluğunu değerlendirme yetkisi",
      "Yürütmenin yasama üzerindeki veto yetkisi",
      "Yargının kendi kararlarını denetleme süreci",
      "Vatandaşların mahkemelere doğrudan yasa önerme hakkı",
    ],
    correctIndex: 0,
    explanation:
      "Parça, yargı denetimini 'the power to assess whether laws passed by the legislature conform to the constitution' (yasama tarafından çıkarılan yasaların anayasaya uygunluğunu değerlendirme yetkisi) olarak tanımlar.",
    tags: ["sosyal-reading", "siyaset-bilimi", "detail-question"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "The doctrine of separation of powers divides governmental authority among three branches: the legislative, the executive, and the judicial. Each branch is granted distinct responsibilities and, crucially, the ability to check the others, preventing any single branch from accumulating excessive power. In many constitutional democracies, the judiciary plays a particularly important role through judicial review, the power to assess whether laws passed by the legislature conform to the constitution. Critics of judicial review argue that it grants unelected judges disproportionate influence over policy, while supporters contend that it serves as an essential safeguard against the erosion of constitutional rights.",
    prompt: "Parçaya göre, yargı denetimini eleştirenler ne öne sürmektedir?",
    options: [
      "Seçilmemiş yargıçların politika üzerinde orantısız bir etkiye sahip olduğunu",
      "Yargının hiçbir zaman yasaları değerlendirmemesi gerektiğini",
      "Anayasal hakların korunmasının gereksiz olduğunu",
      "Yürütmenin yasama üzerinde daha fazla yetkiye sahip olması gerektiğini",
    ],
    correctIndex: 0,
    explanation:
      "Parça, eleştirmenlerin yargı denetiminin 'unelected judges disproportionate influence over policy' (seçilmemiş yargıçlara politika üzerinde orantısız etki) verdiğini öne sürdüğünü belirtir.",
    tags: ["sosyal-reading", "siyaset-bilimi", "detail-question"],
    mockSetNumber: 3,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "The doctrine of separation of powers divides governmental authority among three branches: the legislative, the executive, and the judicial. Each branch is granted distinct responsibilities and, crucially, the ability to check the others, preventing any single branch from accumulating excessive power. In many constitutional democracies, the judiciary plays a particularly important role through judicial review, the power to assess whether laws passed by the legislature conform to the constitution. Critics of judicial review argue that it grants unelected judges disproportionate influence over policy, while supporters contend that it serves as an essential safeguard against the erosion of constitutional rights.",
    prompt: "Parçaya göre, kuvvetler ayrılığının temel amacı nedir?",
    options: [
      "Herhangi bir organın aşırı güç biriktirmesini önlemek",
      "Yürütmenin yasama üzerinde tam kontrol sağlamasını garanti etmek",
      "Yargının diğer organlardan tamamen bağımsız olmasını engellemek",
      "Vatandaşların doğrudan demokrasiyle yönetilmesini sağlamak",
    ],
    correctIndex: 0,
    explanation:
      "Parça, her bir organın diğerlerini denetleme yeteneğinin 'preventing any single branch from accumulating excessive power' (herhangi bir organın aşırı güç biriktirmesini önlemek) amacına hizmet ettiğini belirtir.",
    tags: ["sosyal-reading", "siyaset-bilimi", "inference-question"],
    mockSetNumber: 3,
  },

  // ================================================================
  // DENEME 4 — Tarih / Antropoloji ağırlıklı
  // ================================================================

  // --- Kelime Bilgisi (8) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Archaeological evidence suggests that early human societies were far more ---- than previously assumed, trading goods across vast distances.",
    options: ["interconnected", "isolated", "stagnant", "uniform"],
    correctIndex: 0,
    explanation:
      "'Trading goods across vast distances' (geniş mesafeler boyunca mal ticareti yapmak) toplulukların birbirine 'bağlantılı' ('interconnected') olduğunu gösterir. 'Isolated' (izole) bu bulguyla doğrudan çelişir.",
    tags: ["sosyal-vocab", "antropoloji", "synonym-in-context"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Historians ---- much of the empire's decline to internal corruption rather than external invasion.",
    options: ["attribute", "contribute", "distribute", "subscribe"],
    correctIndex: 0,
    explanation:
      "'Attribute A to B' (A'yı B'ye bağlamak) doğru collocation'dır; tarihçiler çöküşün nedenini iç yozlaşmaya bağlamaktadır. 'Contribute', 'distribute' ve 'subscribe' bu yapıda kullanılmaz.",
    tags: ["sosyal-vocab", "tarih", "collocation"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The tribe's oral history has been ---- down through generations for over a thousand years.",
    options: ["passed", "given", "thrown", "kept"],
    correctIndex: 0,
    explanation:
      "'Pass down' (nesilden nesile aktarmak) doğru phrasal verb'dür. 'Given down', 'thrown down' ve 'kept down' bu anlamda kullanılan yapılar değildir.",
    tags: ["sosyal-vocab", "antropoloji", "phrasal-verb"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The ---- of the ancient city remains a subject of ongoing archaeological investigation.",
    options: ["origin", "original", "originally", "originate"],
    correctIndex: 0,
    explanation:
      "Boşluk 'The ---- of the ancient city' yapısında bir isim gerektirir; doğru isim 'origin' (köken)dir. 'Original' sıfat, 'originally' zarf, 'originate' ise fiildir.",
    tags: ["sosyal-vocab", "tarih", "word-form"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The empire's rapid ---- was attributed to overextension and economic mismanagement.",
    options: ["decline", "expansion", "prosperity", "stability"],
    correctIndex: 0,
    explanation:
      "'Overextension and economic mismanagement' (aşırı yayılma ve ekonomik kötü yönetim) olumsuz nedenlerdir; bunların sonucu 'decline' (çöküş) olur. 'Expansion' (genişleme) ve 'prosperity' (refah) bu olumsuz nedenlerle çelişir.",
    tags: ["sosyal-vocab", "tarih", "synonym-in-context"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Anthropologists caution against imposing modern values when interpreting the ---- of ancient rituals.",
    options: ["significance", "absence", "prohibition", "uniformity"],
    correctIndex: 0,
    explanation:
      "Eski ritüellerin 'anlamını/önemini' ('significance') yorumlarken modern değerler dayatmaktan kaçınmak mantıklıdır. 'Absence' (yokluk) ve 'prohibition' (yasak) bağlamla uyumsuzdur.",
    tags: ["sosyal-vocab", "antropoloji", "synonym-in-context"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The migration patterns of early hunter-gatherer societies were largely ---- by the availability of seasonal resources.",
    options: ["determined", "prohibited", "ignored", "dismissed"],
    correctIndex: 0,
    explanation:
      "Göç örüntülerinin mevsimsel kaynakların bulunabilirliği tarafından 'belirlenmesi' ('determined') mantıklı bir neden-sonuç ilişkisi kurar. 'Prohibited' (yasaklanmış) ve 'ignored' (göz ardı edilmiş) bu ilişkiyi anlamsız kılar.",
    tags: ["sosyal-vocab", "antropoloji", "synonym-in-context"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Despite centuries of cultural exchange, many rural communities have managed to ---- their traditional customs largely intact.",
    options: ["preserve", "abandon", "ridicule", "forget"],
    correctIndex: 0,
    explanation:
      "'Largely intact' (büyük ölçüde bozulmadan) ifadesi, geleneklerin 'korunduğunu' ('preserve') gösterir. 'Abandon' (terk etmek) ve 'forget' (unutmak) bu süreklilikle çelişir.",
    tags: ["sosyal-vocab", "antropoloji", "synonym-in-context"],
    mockSetNumber: 4,
  },

  // --- İngilizce'den Türkçe'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Archaeologists recently discovered artifacts that challenge previous assumptions about early trade networks.",
    options: [
      "Arkeologlar yakın zamanda, erken dönem ticaret ağlarına ilişkin önceki varsayımlara meydan okuyan eserler keşfetti.",
      "Arkeologlar yakın zamanda, erken dönem ticaret ağlarına ilişkin önceki varsayımları doğrulayan eserler keşfetti.",
      "Arkeologlar geçen yüzyılda, erken dönem ticaret ağlarına ilişkin önceki varsayımlara meydan okuyan eserler keşfetti.",
      "Arkeologlar yakın zamanda erken dönem ticaret ağları hakkında hiçbir yeni eser bulamadı.",
    ],
    correctIndex: 0,
    explanation:
      "'Challenge previous assumptions' (önceki varsayımlara meydan okumak) ve 'recently' (yakın zamanda) ifadeleri yalnızca A'da doğru korunmuştur. B 'meydan okuyan' yerine 'doğrulayan' der, C zamanı değiştirir, D ise keşif yapılmadığını söyleyerek anlamı tersine çevirir.",
    tags: ["sosyal-vocab", "tarih"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The fall of the empire was the result of a combination of economic, military, and political factors.",
    options: [
      "İmparatorluğun çöküşü, ekonomik, askeri ve siyasi etmenlerin bir bileşiminin sonucuydu.",
      "İmparatorluğun yükselişi, ekonomik, askeri ve siyasi etmenlerin bir bileşiminin sonucuydu.",
      "İmparatorluğun çöküşü, yalnızca askeri yenilginin sonucuydu.",
      "İmparatorluğun çöküşü, gelecekte ekonomik, askeri ve siyasi etmenlerin bir sonucu olacaktır.",
    ],
    correctIndex: 0,
    explanation:
      "'The fall of the empire' (imparatorluğun çöküşü) ve 'a combination of ... factors' (etmenlerin bir bileşimi) ifadeleri yalnızca A'da doğru korunmuştur. B 'çöküş' yerine 'yükseliş' der, C yalnızca tek bir nedene indirger, D yanlış zaman (gelecek) kullanır.",
    tags: ["sosyal-vocab", "tarih"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Anthropological research shows that kinship structures vary considerably across cultures.",
    options: [
      "Antropolojik araştırmalar, akrabalık yapılarının kültürler arasında önemli ölçüde farklılık gösterdiğini ortaya koymaktadır.",
      "Antropolojik araştırmalar, akrabalık yapılarının tüm kültürlerde aynı olduğunu ortaya koymaktadır.",
      "Antropolojik araştırmalar, akrabalık yapılarının gelecekte farklılaşacağını tahmin etmektedir.",
      "Antropolojik araştırmalar, kültürlerin akrabalık yapılarından önemli ölçüde etkilendiğini ortaya koymaktadır.",
    ],
    correctIndex: 0,
    explanation:
      "'Vary considerably across cultures' (kültürler arasında önemli ölçüde farklılık göstermek) ifadesi yalnızca A'da doğru korunmuştur. B anlamı tersine çevirir, C 'ortaya koymaktadır' yerine 'tahmin etmektedir' der, D neden-sonuç ilişkisini tersine çevirir.",
    tags: ["sosyal-vocab", "antropoloji"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "By the nineteenth century, industrialization had transformed the economic structure of much of Europe.",
    options: [
      "On dokuzuncu yüzyıla gelindiğinde, sanayileşme Avrupa'nın büyük bölümünün ekonomik yapısını dönüştürmüştü.",
      "On dokuzuncu yüzyıla gelindiğinde, sanayileşme Avrupa'nın büyük bölümünün ekonomik yapısını dönüştürecek.",
      "On sekizinci yüzyıla gelindiğinde, sanayileşme Avrupa'nın büyük bölümünün ekonomik yapısını dönüştürmüştü.",
      "On dokuzuncu yüzyıla gelindiğinde, sanayileşme Avrupa'nın ekonomik yapısını hiç değiştirmemişti.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle past perfect'tir ('had transformed'); bu, on dokuzuncu yüzyıla gelindiğinde dönüşümün zaten tamamlanmış olduğunu belirtir ve yalnızca A bunu doğru yansıtır. B yanlış zaman (gelecek), C yanlış yüzyıl, D ise değişimin hiç gerçekleşmediğini söyleyerek anlamı tersine çevirir.",
    tags: ["sosyal-vocab", "tarih", "zamanlar"],
    mockSetNumber: 4,
  },

  // --- Türkçe'den İngilizce'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Tarihçiler, bu belgenin özgünlüğü konusunda hâlâ hemfikir değiller.",
    options: [
      "Historians still do not agree on the authenticity of this document.",
      "Historians still agree on the authenticity of this document.",
      "Historians no longer agree on the authenticity of this document.",
      "Historians will decide on the authenticity of this document.",
    ],
    correctIndex: 0,
    explanation:
      "'Hâlâ hemfikir değiller' ifadesi şimdiki zamanda süregelen bir anlaşmazlığı belirtir; bu, yalnızca A'da doğru korunmuştur. B olumsuzluğu kaldırır, C 'hâlâ' yerine 'artık değil' anlamı taşır, D ise farklı bir eylem ('karar vermek') önerir.",
    tags: ["sosyal-vocab", "tarih"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["zamanlar"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Bu kabile, yüzyıllar boyunca sözlü gelenek yoluyla tarihini nesilden nesile aktarmıştır.",
    options: [
      "This tribe has passed down its history from generation to generation through oral tradition for centuries.",
      "This tribe will pass down its history from generation to generation through oral tradition for centuries.",
      "This tribe has lost its history from generation to generation through oral tradition for centuries.",
      "This tribe has passed down its history only once through oral tradition.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle present perfect'tir ('aktarmıştır' → 'has passed down') ve 'yüzyıllar boyunca' sürekliliği vurgular; bunları doğru veren tek seçenek A'dır. B yanlış zaman, C 'aktarmıştır' yerine 'kaybetmiştir' der, D 'yüzyıllar boyunca' yerine 'yalnızca bir kez' der.",
    tags: ["sosyal-vocab", "antropoloji", "zamanlar"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Sömürgecilik, pek çok bölgenin ekonomik yapısını kalıcı olarak değiştirdi.",
    options: [
      "Colonialism permanently altered the economic structure of many regions.",
      "Colonialism temporarily altered the economic structure of many regions.",
      "Colonialism will permanently alter the economic structure of many regions.",
      "Many regions permanently altered the economic structure of colonialism.",
    ],
    correctIndex: 0,
    explanation:
      "'Kalıcı olarak değiştirdi' ifadesi geçmiş zaman ve süreklilik anlamı taşır; bunu doğru veren tek seçenek A'dır. B 'kalıcı' yerine 'geçici' der, C yanlış zaman (gelecek) kullanır, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "tarih"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Göçebe topluluklar, hayatta kalabilmek için çevreye hızla uyum sağlamak zorundaydı.",
    options: [
      "Nomadic communities had to adapt quickly to their environment in order to survive.",
      "Nomadic communities will have to adapt quickly to their environment in order to survive.",
      "Nomadic communities had to resist quickly to their environment in order to survive.",
      "Nomadic communities did not have to adapt to their environment in order to survive.",
    ],
    correctIndex: 0,
    explanation:
      "'Zorundaydı' geçmiş zamanda bir zorunluluğu ('had to') ifade eder ve 'uyum sağlamak' (adapt) korunmalıdır; bunları doğru veren tek seçenek A'dır. B yanlış zaman, C 'uyum sağlamak' yerine 'direnmek' der, D zorunluluğu olumsuzlayarak anlamı tersine çevirir.",
    tags: ["sosyal-vocab", "antropoloji"],
    mockSetNumber: 4,
  },

  // --- Okuma (4 — tek parça, 4 soru) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    passageText:
      "The Industrial Revolution, which began in Britain in the late eighteenth century, transformed not only how goods were produced but also how people lived. As factories multiplied, millions of rural workers migrated to rapidly growing cities in search of employment, often settling in overcrowded neighborhoods with poor sanitation. While industrialization eventually raised average living standards and created new middle-class occupations, its early decades were marked by long working hours, child labor, and hazardous conditions. These conditions eventually gave rise to labor movements that demanded better wages, safer workplaces, and legal protections for workers.",
    prompt: "Parçaya göre, Sanayi Devrimi nerede ve ne zaman başlamıştır?",
    options: [
      "On sekizinci yüzyılın sonlarında Britanya'da",
      "On dokuzuncu yüzyılın başlarında Fransa'da",
      "On yedinci yüzyılda Amerika'da",
      "Yirminci yüzyılın başında Almanya'da",
    ],
    correctIndex: 0,
    explanation:
      "Parçada Sanayi Devrimi'nin 'began in Britain in the late eighteenth century' (on sekizinci yüzyılın sonlarında Britanya'da başladığı) açıkça belirtilmiştir.",
    tags: ["sosyal-reading", "tarih", "detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "The Industrial Revolution, which began in Britain in the late eighteenth century, transformed not only how goods were produced but also how people lived. As factories multiplied, millions of rural workers migrated to rapidly growing cities in search of employment, often settling in overcrowded neighborhoods with poor sanitation. While industrialization eventually raised average living standards and created new middle-class occupations, its early decades were marked by long working hours, child labor, and hazardous conditions. These conditions eventually gave rise to labor movements that demanded better wages, safer workplaces, and legal protections for workers.",
    prompt: "Parçaya göre, kırsal işçiler neden büyüyen şehirlere göç etmiştir?",
    options: [
      "İstihdam arayışıyla",
      "Daha temiz bir çevre bulmak için",
      "Hükümet zorunlu tuttuğu için",
      "Tarım arazilerinin bollaşması nedeniyle",
    ],
    correctIndex: 0,
    explanation:
      "Parçada kırsal işçilerin şehirlere 'in search of employment' (istihdam arayışıyla) göç ettiği belirtilmiştir; ayrıca yerleştikleri mahallelerin sağlıksız olduğu vurgulanır, bu da 'daha temiz çevre' seçeneğini geçersiz kılar.",
    tags: ["sosyal-reading", "tarih", "detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "The Industrial Revolution, which began in Britain in the late eighteenth century, transformed not only how goods were produced but also how people lived. As factories multiplied, millions of rural workers migrated to rapidly growing cities in search of employment, often settling in overcrowded neighborhoods with poor sanitation. While industrialization eventually raised average living standards and created new middle-class occupations, its early decades were marked by long working hours, child labor, and hazardous conditions. These conditions eventually gave rise to labor movements that demanded better wages, safer workplaces, and legal protections for workers.",
    prompt: "Parçaya göre, sanayileşmenin ilk on yılları hangi koşullarla nitelendirilmiştir?",
    options: [
      "Uzun çalışma saatleri, çocuk işçiliği ve tehlikeli koşullar",
      "Kısa çalışma saatleri ve yüksek ücretler",
      "Güvenli çalışma ortamları ve düşük iş yükü",
      "Sendikaların güçlü yasal korumaları",
    ],
    correctIndex: 0,
    explanation:
      "Parça, sanayileşmenin ilk on yıllarının 'long working hours, child labor, and hazardous conditions' (uzun çalışma saatleri, çocuk işçiliği ve tehlikeli koşullar) ile nitelendirildiğini belirtir.",
    tags: ["sosyal-reading", "tarih", "detail-question"],
    mockSetNumber: 4,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "The Industrial Revolution, which began in Britain in the late eighteenth century, transformed not only how goods were produced but also how people lived. As factories multiplied, millions of rural workers migrated to rapidly growing cities in search of employment, often settling in overcrowded neighborhoods with poor sanitation. While industrialization eventually raised average living standards and created new middle-class occupations, its early decades were marked by long working hours, child labor, and hazardous conditions. These conditions eventually gave rise to labor movements that demanded better wages, safer workplaces, and legal protections for workers.",
    prompt: "Parçaya göre, kötü çalışma koşulları nihayetinde neye yol açmıştır?",
    options: [
      "Daha iyi ücret, güvenli işyerleri ve yasal koruma talep eden işçi hareketlerine",
      "Fabrikaların tamamen kapatılmasına",
      "Kırsal bölgelere geri göçe",
      "Orta sınıfın tamamen ortadan kalkmasına",
    ],
    correctIndex: 0,
    explanation:
      "Parçanın son cümlesi, kötü koşulların 'labor movements that demanded better wages, safer workplaces, and legal protections' (daha iyi ücret, güvenli işyerleri ve yasal koruma talep eden işçi hareketlerine) yol açtığını belirtir.",
    tags: ["sosyal-reading", "tarih", "inference-question"],
    mockSetNumber: 4,
  },

  // ================================================================
  // DENEME 5 — Medya / İletişim Çalışmaları ağırlıklı
  // ================================================================

  // --- Kelime Bilgisi (8) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "The network was criticized for ---- a complex policy debate into a thirty-second soundbite.",
    options: ["reducing", "expanding", "clarifying", "prolonging"],
    correctIndex: 0,
    explanation:
      "Karmaşık bir tartışmanın otuz saniyelik bir özete indirgenmesi 'reducing' (indirgemek) ile ifade edilir. 'Expanding' (genişletmek) ve 'prolonging' (uzatmak) bu daralmayla çelişir.",
    tags: ["sosyal-vocab", "medya-calismalari", "synonym-in-context"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Journalists have an ethical obligation to ---- objectivity, even when covering controversial topics.",
    options: ["maintain", "abandon", "dismiss", "conceal"],
    correctIndex: 0,
    explanation:
      "'Maintain objectivity' (tarafsızlığı korumak) gazetecilik etiğine uygun doğru collocation'dır. 'Abandon' (terk etmek) ve 'dismiss' (bir kenara atmak) bu etik yükümlülükle çelişir.",
    tags: ["sosyal-vocab", "medya-calismalari", "collocation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The scandal ---- after a whistleblower leaked internal documents to the press.",
    options: ["came to light", "came to terms", "came to pass", "came to a halt"],
    correctIndex: 0,
    explanation:
      "'Come to light' (ortaya çıkmak, açığa çıkmak) bir sırrın ifşa edilmesini anlatan doğru deyimdir. 'Come to terms with' (bir şeyle barışmak), 'come to pass' (vuku bulmak) ve 'come to a halt' (durmak) bağlama uymaz.",
    tags: ["sosyal-vocab", "medya-calismalari", "phrasal-verb"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Critics accuse certain outlets of political ----, favoring one party over another in their coverage.",
    options: ["bias", "biased", "biasedly", "unbiased"],
    correctIndex: 0,
    explanation:
      "'Accuse someone of political bias' (bir kanalı siyasi taraflılıkla suçlamak) yapısında bir isim gerekir; doğru isim 'bias'tır. 'Biased' bir sıfat, 'biasedly' geçerli bir sözcük değildir, 'unbiased' ise tam tersi bir anlam taşır.",
    tags: ["sosyal-vocab", "medya-calismalari", "word-form"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "The documentary was praised for offering a ---- portrayal of the refugee crisis, avoiding both sensationalism and oversimplification.",
    options: ["nuanced", "simplistic", "sensational", "biased"],
    correctIndex: 0,
    explanation:
      "'Avoiding both sensationalism and oversimplification' (hem sansasyonculuktan hem aşırı basitleştirmeden kaçınmak) dengeli/incelikli bir yaklaşımı ('nuanced') gösterir. 'Simplistic' ve 'sensational' cümledeki kaçınılan özelliklerin ta kendisidir.",
    tags: ["sosyal-vocab", "medya-calismalari", "synonym-in-context"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Public relations firms are often hired to help organizations ---- their image after a controversy.",
    options: ["restore", "damage", "ignore", "publicize"],
    correctIndex: 0,
    explanation:
      "Bir tartışmadan sonra imajın 'restore' (yeniden düzeltmek/onarmak) edilmesi halkla ilişkiler firmalarının temel görevidir. 'Damage' (zarar vermek) bu amaçla doğrudan çelişir.",
    tags: ["sosyal-vocab", "medya-calismalari", "synonym-in-context"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "The spread of misinformation on social media has made it increasingly difficult for the public to ---- fact from fiction.",
    options: ["distinguish", "combine", "confuse", "resemble"],
    correctIndex: 0,
    explanation:
      "'Distinguish fact from fiction' (gerçeği kurgudan ayırt etmek) doğru collocation'dır. 'Combine' (birleştirmek) ve 'confuse' (karıştırmak) zaten yanlış bilginin yarattığı sorunu tanımlar, ayırt etme yeteneğini değil.",
    tags: ["sosyal-vocab", "medya-calismalari", "collocation"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "kelime-bilgisi",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Effective communication requires speakers to ---- their message to the specific needs and background of their audience.",
    options: ["tailor", "ignore", "standardize", "complicate"],
    correctIndex: 0,
    explanation:
      "'Tailor a message to an audience' (bir mesajı hedef kitleye göre uyarlamak) doğru collocation'dır. 'Standardize' (standartlaştırmak) hedef kitlenin özel ihtiyaçlarını göz ardı etme fikrini taşır ve bağlamla çelişir.",
    tags: ["sosyal-vocab", "medya-calismalari", "collocation"],
    mockSetNumber: 5,
  },

  // --- İngilizce'den Türkçe'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "KOLAY",
    prompt: "Studies show that prolonged exposure to sensationalized news can increase public anxiety.",
    options: [
      "Araştırmalar, sansasyonel haberlere uzun süre maruz kalmanın toplumsal kaygıyı artırabileceğini göstermektedir.",
      "Araştırmalar, sansasyonel haberlere uzun süre maruz kalmanın toplumsal kaygıyı azaltabileceğini göstermektedir.",
      "Araştırmalar, sansasyonel haberlere kısa süre maruz kalmanın toplumsal kaygıyı artırabileceğini göstermektedir.",
      "Araştırmalar, toplumsal kaygının sansasyonel haberlere maruz kalmayı artırabileceğini göstermektedir.",
    ],
    correctIndex: 0,
    explanation:
      "'Prolonged exposure' (uzun süreli maruz kalma) ve 'increase anxiety' (kaygıyı artırmak) ifadeleri yalnızca A'da doğru korunmuştur. B anlamı tersine çevirir, C 'uzun' yerine 'kısa' der, D neden-sonuç ilişkisini tersine çevirir.",
    tags: ["sosyal-vocab", "medya-calismalari"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "Advertisers increasingly rely on data analytics to target specific consumer demographics.",
    options: [
      "Reklamcılar, belirli tüketici demografilerini hedeflemek için giderek daha fazla veri analitiğine güveniyor.",
      "Reklamcılar, belirli tüketici demografilerini hedeflemekten giderek daha fazla kaçınıyor.",
      "Tüketiciler, belirli reklamcı demografilerini hedeflemek için giderek daha fazla veri analitiğine güveniyor.",
      "Reklamcılar, geçmişte belirli tüketici demografilerini hedeflemek için veri analitiğine güvenmişti.",
    ],
    correctIndex: 0,
    explanation:
      "'Increasingly rely on' (giderek daha fazla güvenmek) şimdiki zamanda süren bir eğilimi anlatır ve yalnızca A'da doğru korunmuştur. B anlamı tersine çevirir, C özne ile nesneyi yer değiştirir, D yanlış zaman (geçmiş) kullanır.",
    tags: ["sosyal-vocab", "medya-calismalari"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ORTA",
    prompt: "The rise of citizen journalism has changed the way breaking news is reported.",
    options: [
      "Vatandaş gazeteciliğinin yükselişi, son dakika haberlerinin bildirilme biçimini değiştirmiştir.",
      "Vatandaş gazeteciliğinin düşüşü, son dakika haberlerinin bildirilme biçimini değiştirmiştir.",
      "Vatandaş gazeteciliğinin yükselişi, son dakika haberlerinin bildirilme biçimini hiç değiştirmemiştir.",
      "Son dakika haberlerinin bildirilme biçimi, vatandaş gazeteciliğinin yükselişini değiştirmiştir.",
    ],
    correctIndex: 0,
    explanation:
      "'The rise of citizen journalism' (vatandaş gazeteciliğinin yükselişi) ve 'has changed' (değiştirmiştir) ifadeleri yalnızca A'da doğru korunmuştur. B 'yükseliş' yerine 'düşüş' der, C değişimi inkâr eder, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "medya-calismalari"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-en-tr",
    questionType: "TRANSLATION_EN_TR",
    difficulty: "ZOR",
    prompt: "Critics contend that certain news outlets prioritize ratings over accuracy.",
    options: [
      "Eleştirmenler, bazı haber kanallarının doğruluğu değil, reytingleri önceliklendirdiğini savunuyor.",
      "Eleştirmenler, bazı haber kanallarının reytingleri değil, doğruluğu önceliklendirdiğini savunuyor.",
      "Destekçiler, bazı haber kanallarının doğruluğu değil, reytingleri önceliklendirdiğini savunuyor.",
      "Eleştirmenler, bazı haber kanallarının gelecekte reytingleri önceliklendireceğini savunuyor.",
    ],
    correctIndex: 0,
    explanation:
      "'Prioritize ratings over accuracy' (reytingleri doğruluğun önüne koymak) ifadesindeki öncelik sırası yalnızca A'da doğru korunmuştur. B önceliği tersine çevirir, C özneyi 'eleştirmenler' yerine 'destekçiler' yapar, D yanlış zaman (gelecek) kullanır.",
    tags: ["sosyal-vocab", "medya-calismalari"],
    mockSetNumber: 5,
  },

  // --- Türkçe'den İngilizce'ye Çeviri (4) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    secondaryTopicSlugs: ["edilgen-cati"],
    questionType: "TRANSLATION_TR_EN",
    difficulty: "KOLAY",
    prompt: "Sosyal medya platformları, kullanıcı verilerini nasıl kullandıkları konusunda giderek daha fazla eleştiriliyor.",
    options: [
      "Social media platforms are increasingly criticized for how they use user data.",
      "Social media platforms are increasingly criticized for how they will use user data.",
      "Social media platforms are increasingly praised for how they use user data.",
      "User data is increasingly criticized for how it uses social media platforms.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle şimdiki zamanda edilgen çatıdadır ('eleştiriliyor' → 'are criticized'); bu yapıyı doğru veren tek seçenek A'dır. B yanlış zaman kullanır, C 'eleştiriliyor' yerine 'övülüyor' der, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "medya-calismalari", "edilgen-cati"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Kamuoyu araştırmaları, seçmenlerin çoğunluğunun ekonomik politikalardan memnun olmadığını gösteriyor.",
    options: [
      "Public opinion polls show that the majority of voters are dissatisfied with economic policies.",
      "Public opinion polls show that the majority of voters are satisfied with economic policies.",
      "Public opinion polls showed that the majority of voters were dissatisfied with economic policies in the past.",
      "Public opinion polls show that the minority of voters are dissatisfied with economic policies.",
    ],
    correctIndex: 0,
    explanation:
      "'Çoğunluğunun ... memnun olmadığını' ifadesi yalnızca A'da doğru korunmuştur. B anlamı tersine çevirir, C 'geçmişte' ekleyerek durumun artık geçerli olmadığını ima eder, D 'çoğunluk' yerine 'azınlık' der.",
    tags: ["sosyal-vocab", "siyaset-bilimi"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ORTA",
    prompt: "Gazeteciler, kaynaklarının gizliliğini korumak zorundadır.",
    options: [
      "Journalists are obliged to protect the confidentiality of their sources.",
      "Journalists are obliged to reveal the confidentiality of their sources.",
      "Journalists were obliged to protect the confidentiality of their sources.",
      "Sources are obliged to protect the confidentiality of their journalists.",
    ],
    correctIndex: 0,
    explanation:
      "'Korumak zorundadır' şimdiki zamanda bir yükümlülüğü ('are obliged to protect') ifade eder; bunu doğru veren tek seçenek A'dır. B 'korumak' yerine 'ifşa etmek' der, C yanlış zaman kullanır, D özne ile nesneyi yer değiştirir.",
    tags: ["sosyal-vocab", "medya-calismalari"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "ceviri-tr-en",
    questionType: "TRANSLATION_TR_EN",
    difficulty: "ZOR",
    prompt: "Bu kampanya, gençler arasında siyasi katılımı artırmayı hedeflemektedir.",
    options: [
      "This campaign aims to increase political participation among young people.",
      "This campaign aims to decrease political participation among young people.",
      "This campaign aimed to increase political participation among young people in the past.",
      "Young people aim to increase political participation among this campaign.",
    ],
    correctIndex: 0,
    explanation:
      "Cümle şimdiki zamanda bir amacı ('hedeflemektedir') ve artırma fikrini ('artırmayı') taşır; bunları doğru veren tek seçenek A'dır. B 'artırmayı' yerine 'azaltmayı' der, C yanlış zaman/ek ifade kullanır, D özne ile nesneyi anlamsız biçimde yer değiştirir.",
    tags: ["sosyal-vocab", "siyaset-bilimi"],
    mockSetNumber: 5,
  },

  // --- Okuma (4 — tek parça, 4 soru) ---
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "KOLAY",
    passageText:
      "Media scholars have increasingly focused on the phenomenon of the 'filter bubble,' a term describing how algorithms on social media platforms tend to show users content that aligns with their existing beliefs. By prioritizing engagement, these algorithms can inadvertently limit users' exposure to differing viewpoints, reinforcing existing opinions rather than challenging them. Some researchers argue that this dynamic has contributed to increased political polarization, as users become less accustomed to encountering perspectives that differ from their own. Others caution that the effect may be overstated, noting that people have always sought out information that confirms their preexisting views, even before the rise of digital media.",
    prompt: "Parçaya göre, 'filter bubble' (filtre balonu) terimi neyi tanımlamaktadır?",
    options: [
      "Sosyal medya algoritmalarının kullanıcılara mevcut inançlarıyla örtüşen içerikler göstermesini",
      "Kullanıcıların internet erişimini tamamen kaybetmesini",
      "Algoritmaların tüm kullanıcılara aynı içeriği göstermesini",
      "Sosyal medya şirketlerinin kâr kaybını",
    ],
    correctIndex: 0,
    explanation:
      "Parça, 'filter bubble' terimini 'algorithms on social media platforms tend to show users content that aligns with their existing beliefs' (algoritmaların kullanıcılara mevcut inançlarıyla örtüşen içerikler gösterme eğilimi) olarak tanımlar.",
    tags: ["sosyal-reading", "medya-calismalari", "main-idea-question"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Media scholars have increasingly focused on the phenomenon of the 'filter bubble,' a term describing how algorithms on social media platforms tend to show users content that aligns with their existing beliefs. By prioritizing engagement, these algorithms can inadvertently limit users' exposure to differing viewpoints, reinforcing existing opinions rather than challenging them. Some researchers argue that this dynamic has contributed to increased political polarization, as users become less accustomed to encountering perspectives that differ from their own. Others caution that the effect may be overstated, noting that people have always sought out information that confirms their preexisting views, even before the rise of digital media.",
    prompt: "Parçaya göre, bahsedilen algoritmalar neyi önceliklendirerek çalışmaktadır?",
    options: [
      "Kullanıcı etkileşimini (engagement)",
      "Haberlerin doğruluğunu",
      "İçeriğin yayın tarihini",
      "Kullanıcının yaşadığı ülkeyi",
    ],
    correctIndex: 0,
    explanation:
      "Parça, algoritmaların 'prioritizing engagement' (kullanıcı etkileşimini önceliklendirerek) çalıştığını ve bunun farklı görüşlere maruz kalmayı azalttığını belirtir.",
    tags: ["sosyal-reading", "medya-calismalari", "detail-question"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Media scholars have increasingly focused on the phenomenon of the 'filter bubble,' a term describing how algorithms on social media platforms tend to show users content that aligns with their existing beliefs. By prioritizing engagement, these algorithms can inadvertently limit users' exposure to differing viewpoints, reinforcing existing opinions rather than challenging them. Some researchers argue that this dynamic has contributed to increased political polarization, as users become less accustomed to encountering perspectives that differ from their own. Others caution that the effect may be overstated, noting that people have always sought out information that confirms their preexisting views, even before the rise of digital media.",
    prompt: "Parçaya göre, bazı araştırmacılar bu dinamiğin hangi sonuca katkıda bulunduğunu öne sürmektedir?",
    options: [
      "Artan siyasi kutuplaşmaya",
      "Siyasi kutuplaşmanın tamamen ortadan kalkmasına",
      "Kullanıcıların farklı görüşlere daha açık hale gelmesine",
      "Sosyal medya kullanımının azalmasına",
    ],
    correctIndex: 0,
    explanation:
      "Parça, bazı araştırmacıların bu dinamiğin 'increased political polarization' (artan siyasi kutuplaşma) sonucuna katkıda bulunduğunu öne sürdüğünü belirtir.",
    tags: ["sosyal-reading", "medya-calismalari", "detail-question"],
    mockSetNumber: 5,
  },
  {
    examFamily: "TRANSLATION_GRAMMAR",
    examTypeCode: "YOKDIL_SOSYAL",
    topicSlug: "okuma",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "Media scholars have increasingly focused on the phenomenon of the 'filter bubble,' a term describing how algorithms on social media platforms tend to show users content that aligns with their existing beliefs. By prioritizing engagement, these algorithms can inadvertently limit users' exposure to differing viewpoints, reinforcing existing opinions rather than challenging them. Some researchers argue that this dynamic has contributed to increased political polarization, as users become less accustomed to encountering perspectives that differ from their own. Others caution that the effect may be overstated, noting that people have always sought out information that confirms their preexisting views, even before the rise of digital media.",
    prompt: "Parçaya göre, bazı araştırmacılar 'filter bubble' etkisinin abartıldığını düşünmelerinin nedeni nedir?",
    options: [
      "İnsanların dijital medyadan önce de kendi görüşlerini doğrulayan bilgiler aradığını belirtmeleri",
      "Algoritmaların hiçbir etkisinin olmadığını kanıtlamaları",
      "Sosyal medyanın yakın zamanda ortadan kalkacağını öngörmeleri",
      "Kutuplaşmanın yalnızca dijital medyada var olduğunu savunmaları",
    ],
    correctIndex: 0,
    explanation:
      "Parça, bu araştırmacıların 'people have always sought out information that confirms their preexisting views, even before the rise of digital media' (insanların dijital medyadan önce de kendi görüşlerini doğrulayan bilgiler aradığı) gerçeğine dikkat çektiğini belirtir.",
    tags: ["sosyal-reading", "medya-calismalari", "inference-question"],
    mockSetNumber: 5,
  },
];
