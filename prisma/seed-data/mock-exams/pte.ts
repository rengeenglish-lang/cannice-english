import type { DiagnosticQuestionSeed } from "../diagnostic-questions";

export const MOCK_PTE: DiagnosticQuestionSeed[] = [
  // ============================================================
  // DENEME 1
  // ============================================================
  // --- mcq-single (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "KOLAY",
    passageText:
      "Urban beekeeping has grown rapidly in major cities over the past decade. Rooftop hives now supply local restaurants with honey while also helping pollinate nearby parks and gardens. City councils have started offering small grants to residents who wish to install hives, viewing the practice as a low-cost way to support biodiversity.",
    prompt: "Why have city councils begun offering grants for rooftop hives?",
    options: [
      "To reduce the cost of restaurant honey supplies",
      "To support biodiversity at a low cost",
      "To limit the number of hives in cities",
      "To train residents in commercial beekeeping",
    ],
    correctIndex: 1,
    explanation:
      "Parçanın son cümlesi, konseylerin bu uygulamayı biyoçeşitliliği düşük maliyetle desteklemenin bir yolu olarak gördüğünü söyler.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "A recent workplace survey found that employees who were given the freedom to choose their own working hours reported higher job satisfaction than those on fixed schedules. Interestingly, productivity levels between the two groups were nearly identical, suggesting that flexibility affects morale more than output.",
    prompt: "What does the survey suggest about flexible working hours?",
    options: [
      "They significantly increase productivity",
      "They mainly influence morale rather than output",
      "They have no effect on job satisfaction",
      "They are less effective than fixed schedules",
    ],
    correctIndex: 1,
    explanation:
      "Parça, üretkenliğin iki grupta da neredeyse aynı olduğunu, esnekliğin ise daha çok morali etkilediğini belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "Coral bleaching occurs when rising sea temperatures cause corals to expel the algae living in their tissues. Without these algae, the coral loses its color and its main food source, leaving it vulnerable to starvation. If temperatures return to normal quickly, some corals can recover, but prolonged heat stress often leads to permanent damage.",
    prompt: "According to the passage, what allows some corals to recover after bleaching?",
    options: [
      "A quick return to normal sea temperatures",
      "The complete absence of algae",
      "Permanent damage to coral tissue",
      "An increase in coral food sources",
    ],
    correctIndex: 0,
    explanation:
      "Metin, sıcaklıkların hızla normale dönmesi durumunda bazı mercanların toparlanabileceğini açıkça belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ZOR",
    passageText:
      "Historians long assumed that the printing press single-handedly triggered the spread of literacy across Europe. More recent scholarship complicates this view, showing that literacy rates had already begun rising in several regions before the press became widespread, driven instead by expanding trade networks that created demand for record-keeping and correspondence.",
    prompt: "What is the main point the passage makes about the printing press?",
    options: [
      "It was the sole cause of rising literacy in Europe",
      "It had no measurable effect on literacy rates",
      "Its role in rising literacy has been overstated by earlier views",
      "It emerged only after trade networks had collapsed",
    ],
    correctIndex: 2,
    explanation:
      "Parça, matbaanın tek başına okuryazarlığı tetiklediği görüşünün yeni araştırmalarla sorgulandığını, okuryazarlığın matbaadan önce de ticaret ağları sayesinde arttığını gösterir; bu da eski görüşün abartılı olduğunu ima eder.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 1,
  },
  // --- mcq-multi (3) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A three-year trial of a four-day work week found that employees took fewer sick days and reported lower stress levels. However, the same trial found no significant change in overall company revenue, and client response times actually slowed slightly during the transition period.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Revenue increased significantly  2) Sick days decreased  3) Stress levels decreased  4) Client response times improved",
    options: ["1 and 4", "2 and 3", "1 and 2", "3 and 4"],
    correctIndex: 1,
    explanation:
      "Parça, hastalık izinlerinin azaldığını ve stres seviyelerinin düştüğünü belirtir; gelirde anlamlı bir değişim olmadığını ve müşteri yanıt sürelerinin biraz yavaşladığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "Museums that introduced free admission on weekends saw a sharp rise in visitor numbers among local residents, particularly families. Ticket revenue naturally declined, but gift shop and cafe sales rose enough to offset roughly half of that loss. Visitor numbers among international tourists remained largely unchanged.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Local visitor numbers rose  2) International tourist numbers rose sharply  3) Ticket revenue declined  4) Gift shop sales fully offset the revenue loss",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, yerel ziyaretçi sayısının arttığını ve bilet gelirinin düştüğünü açıkça belirtir; uluslararası turist sayısının değişmediğini ve hediyelik eşya gelirinin kaybı yalnızca yarı yarıya karşıladığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "Researchers studying deep-sea vents discovered ecosystems that rely entirely on chemical energy rather than sunlight. These communities support species found nowhere else on Earth, yet they remain highly sensitive to disturbances such as mining exploration, which can permanently destroy the mineral structures the organisms depend on.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) The ecosystems depend on sunlight  2) The species are found nowhere else  3) Mining can permanently damage the ecosystems  4) The ecosystems are resistant to disturbance",
    options: ["1 and 4", "2 and 3", "1 and 3", "2 and 4"],
    correctIndex: 1,
    explanation:
      "Parça, bu türlerin başka hiçbir yerde bulunmadığını ve madencilik gibi müdahalelerin bu ekosistemlere kalıcı zarar verebileceğini belirtir; ekosistemlerin güneş ışığına değil kimyasal enerjiye dayandığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 1,
  },
  // --- reorder (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. As a result, the company launched an internal recycling program across all its factories.\n2. Within a year, waste sent to landfills had dropped by nearly forty percent.\n3. A routine audit revealed that the firm was producing far more packaging waste than its competitors.\n4. Encouraged by this outcome, management extended the program to its overseas branches.",
    options: ["3, 1, 2, 4", "1, 3, 2, 4", "3, 2, 1, 4", "4, 1, 3, 2"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: rutin denetim aşırı ambalaj atığını ortaya çıkardı (3) → şirket geri dönüşüm programı başlattı (1) → atık miktarı düştü (2) → bu sonuç yönetimi programı yurt dışına genişletmeye teşvik etti (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Doctors began recommending short walking breaks every hour to counter this trend.\n2. Studies in the early 2000s showed a steady rise in sedentary office work.\n3. Early results indicated that even brief activity improved circulation and focus.\n4. Prolonged sitting was later linked to a higher risk of several chronic illnesses.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "1, 2, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: masa başı işlerin artışı gözlemlendi (2) → uzun süre oturmanın kronik hastalık riskiyle bağlantısı bulundu (4) → doktorlar saatlik yürüyüş molaları önermeye başladı (1) → erken sonuçlar bunun faydalı olduğunu gösterdi (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Consequently, several airlines began redesigning cabins to reduce overall weight.\n2. Fuel prices rose sharply following global supply disruptions in the sector.\n3. Lighter cabins allowed airlines to cut fuel consumption by a measurable margin.\n4. Airlines faced mounting pressure to lower operating costs without raising ticket prices.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "1, 4, 2, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: yakıt fiyatları arttı (2) → havayolları bilet fiyatlarını yükseltmeden maliyetleri düşürme baskısıyla karşılaştı (4) → kabinleri hafifletmeye başladılar (1) → bu da yakıt tüketimini ölçülebilir biçimde azalttı (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Nevertheless, a small number of independent bookstores reported rising sales during the same period.\n2. Many analysts attributed this to the stores' emphasis on curated selections and community events.\n3. The rise of e-readers was widely predicted to end physical book sales entirely.\n4. Publishers took note and began partnering with these stores on exclusive releases.",
    options: ["3, 1, 2, 4", "1, 3, 2, 4", "3, 2, 1, 4", "3, 1, 4, 2"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: e-okuyucuların fiziksel kitap satışını bitireceği öngörüldü (3) → buna rağmen bazı bağımsız kitapçılar satış artışı bildirdi (1) → analistler bunu özenle seçilmiş kitaplara ve etkinliklere bağladı (2) → yayıncılar bu kitapçılarla özel iş birliklerine başladı (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 1,
  },
  // --- fill-blanks (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "KOLAY",
    prompt: "The new policy will ____ into effect at the beginning of next month.",
    options: ["come", "make", "take", "turn"],
    correctIndex: 0,
    explanation: "'Come into effect' (yürürlüğe girmek) doğru collocation'dır.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The committee decided to ____ the proposal until further evidence became available.",
    options: ["defer", "differ", "deter", "detain",
    ],
    correctIndex: 0,
    explanation: "'Defer' (ertelemek) bağlama uyar; 'differ' farklı olmak, 'deter' caydırmak, 'detain' alıkoymak anlamına gelir ve cümleye uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The researchers were unable to ____ a clear pattern from the scattered data points.",
    options: ["discern", "disperse", "discard", "disrupt"],
    correctIndex: 0,
    explanation: "'Discern a pattern' (bir örüntüyü ayırt etmek) doğru collocation'dır; diğer seçenekler anlam olarak uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 1,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ZOR",
    prompt: "Her argument, though persuasive on the surface, was ultimately ____ by a lack of supporting evidence.",
    options: ["undermined", "underlined", "underlying", "undertaken"],
    correctIndex: 0,
    explanation: "'Undermined by a lack of evidence' (kanıt eksikliğiyle zayıflatılmak) anlam olarak doğrudur; diğer seçenekler bu bağlamda kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 1,
  },

  // ============================================================
  // DENEME 2
  // ============================================================
  // --- mcq-single (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "KOLAY",
    passageText:
      "Electric scooters have become a common sight in many downtown areas, offering a quick alternative to short car trips. City officials note that while the scooters reduce local traffic congestion, they have also led to a rise in minor injuries, prompting several cities to introduce mandatory helmet rules for riders.",
    prompt: "Why did several cities introduce mandatory helmet rules?",
    options: [
      "To reduce traffic congestion further",
      "Because of a rise in minor injuries",
      "To encourage more car trips",
      "Because scooters were being banned",
    ],
    correctIndex: 1,
    explanation:
      "Parça, küçük yaralanmaların artmasının şehirleri zorunlu kask kuralları getirmeye yönelttiğini açıkça belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "A children's hospital introduced a program allowing young patients to interact with therapy dogs before minor procedures. Nurses reported that patients who spent time with the dogs showed measurably lower heart rates and required less sedation than those who did not, though the effect was less pronounced in patients over twelve.",
    prompt: "What did nurses observe about patients who interacted with the therapy dogs?",
    options: [
      "They required more sedation than other patients",
      "They showed lower heart rates and needed less sedation",
      "The effect was strongest in patients over twelve",
      "They avoided minor procedures entirely",
    ],
    correctIndex: 1,
    explanation:
      "Parça, terapi köpekleriyle vakit geçiren hastaların daha düşük kalp atış hızı gösterdiğini ve daha az sedasyona ihtiyaç duyduğunu belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "Archaeologists excavating a coastal settlement found tools made from obsidian that did not originate locally. Chemical analysis traced the material to a volcanic source over three hundred kilometers away, suggesting the community either traveled long distances to acquire it or participated in an extensive trade network with distant groups.",
    prompt: "What does the discovery of the obsidian tools suggest about the settlement?",
    options: [
      "The community had no contact with other groups",
      "The obsidian was formed locally by volcanic activity",
      "The community may have traded over long distances",
      "The tools were made after the settlement was abandoned",
    ],
    correctIndex: 2,
    explanation:
      "Metin, obsidyenin üç yüz kilometre öteden geldiğini ve bunun uzun mesafeli seyahat ya da geniş bir ticaret ağına işaret ettiğini belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ZOR",
    passageText:
      "Economists have traditionally treated consumer confidence as a reliable predictor of spending behavior. Yet a recent longitudinal study found that confidence surveys often lag behind actual spending changes by several weeks, implying that consumers frequently adjust their habits before they consciously report feeling more or less confident.",
    prompt: "What does the longitudinal study imply about consumer confidence surveys?",
    options: [
      "They accurately predict spending changes in real time",
      "They tend to lag behind actual changes in spending behavior",
      "They are unrelated to consumer spending habits",
      "They are conducted only after major economic events",
    ],
    correctIndex: 1,
    explanation:
      "Parça, güven anketlerinin gerçek harcama değişikliklerinin haftalarca gerisinde kaldığını, yani tüketicilerin bilinçli olarak rapor etmeden önce davranışlarını değiştirdiğini ima eder.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 2,
  },
  // --- mcq-multi (3) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A pilot program introducing solar-powered streetlights in rural villages reduced electricity costs for local governments and extended evening hours for small businesses. However, the program faced criticism for its high initial installation cost, and maintenance crews reported that the lights required more frequent servicing than traditional ones.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Electricity costs decreased  2) Installation costs were low  3) Evening hours for businesses extended  4) Maintenance needs decreased",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, elektrik maliyetlerinin düştüğünü ve akşam saatlerinin işletmeler için uzadığını belirtir; kurulum maliyetinin yüksek olduğunu ve bakım ihtiyacının arttığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "A longitudinal study of bilingual children found that they consistently outperformed monolingual peers on tasks requiring cognitive flexibility, such as switching between rules mid-task. The same study found no significant difference between the two groups in vocabulary size within either language, and reading speed was also comparable across groups.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Bilingual children showed greater cognitive flexibility  2) Vocabulary size differed significantly between groups  3) Reading speed was comparable between groups  4) Bilingual children read significantly faster",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, iki dilli çocukların bilişsel esneklikte daha başarılı olduğunu ve okuma hızının gruplar arasında benzer olduğunu belirtir; kelime dağarcığında anlamlı bir fark olmadığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A city's decision to convert an unused rail line into a pedestrian greenway led to a noticeable increase in nearby property values and daily foot traffic through the area. Local crime reports, however, showed no meaningful change, and air quality measurements along the corridor remained essentially the same as before the conversion.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Property values increased  2) Crime rates fell sharply  3) Foot traffic increased  4) Air quality improved significantly",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, mülk değerlerinin ve yaya trafiğinin arttığını belirtir; suç oranlarında anlamlı bir değişim olmadığını ve hava kalitesinin de büyük ölçüde aynı kaldığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 2,
  },
  // --- reorder (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. To address this, the library extended its opening hours and added more study rooms.\n2. Student surveys later confirmed that satisfaction with library services had risen noticeably.\n3. During exam season, students frequently complained about the lack of available seating.\n4. The additional rooms filled quickly, showing that demand had been underestimated.",
    options: ["3, 1, 4, 2", "1, 3, 4, 2", "3, 4, 1, 2", "3, 1, 2, 4"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: öğrenciler oturma yeri eksikliğinden şikayet etti (3) → kütüphane saatlerini uzatıp yeni çalışma odaları ekledi (1) → yeni odalar hızla doldu (4) → sonraki anketler memnuniyetin arttığını doğruladı (2).",
    tags: ["pte-reorder"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Farmers in the region began rotating crops to restore nutrients to the soil.\n2. Continuous planting of the same crop had gradually depleted the soil's nutrients.\n3. Within a few growing seasons, yields had returned to their earlier levels.\n4. Neighboring farms soon adopted the same rotation methods after seeing the results.",
    options: ["2, 1, 3, 4", "1, 2, 3, 4", "2, 3, 1, 4", "2, 1, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: aynı ürünün sürekli ekilmesi toprağı yoksullaştırdı (2) → çiftçiler ürün rotasyonuna başladı (1) → birkaç sezon içinde verim eski seviyesine döndü (3) → komşu çiftlikler de bu yöntemi benimsedi (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Engineers therefore redesigned the bridge's joints to allow slight movement.\n2. A structural review found that temperature swings were causing the bridge's joints to crack.\n3. The redesigned joints showed no cracking after two full years of monitoring.\n4. The cracks had gone unnoticed for months because they were hidden beneath the roadway.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "1, 2, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: yapısal inceleme sıcaklık değişimlerinin eklemleri çatlattığını ortaya çıkardı (2) → çatlaklar aylarca fark edilmedi çünkü yol yüzeyinin altında gizliydi (4) → mühendisler eklemleri yeniden tasarladı (1) → yeni eklemlerde iki yıl boyunca çatlak görülmedi (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Sales of the device fell sharply once reviewers began pointing this out publicly.\n2. The manufacturer had advertised the device as having a ten-hour battery life.\n3. In response, the company issued a software update that genuinely extended battery life.\n4. Independent testing later revealed that the actual battery life was closer to six hours.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "2, 4, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: üretici cihazın on saat pil ömrü olduğunu iddia etti (2) → bağımsız testler gerçek sürenin altı saate yakın olduğunu ortaya çıkardı (4) → eleştirmenler bunu kamuoyuna duyurunca satışlar düştü (1) → şirket pil ömrünü gerçekten uzatan bir güncelleme yayınladı (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 2,
  },
  // --- fill-blanks (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "KOLAY",
    prompt: "The manager asked her team to ____ a brief summary of the meeting by Friday.",
    options: ["prepare", "repair", "compare", "impair"],
    correctIndex: 0,
    explanation: "'Prepare a summary' (özet hazırlamak) doğru collocation'dır; diğer seçenekler anlam olarak uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The new evidence appears to ____ the earlier findings rather than contradict them.",
    options: ["corroborate", "collaborate", "cooperate", "correlate"],
    correctIndex: 0,
    explanation: "'Corroborate' (doğrulamak, desteklemek) 'contradict' ile zıt anlamlı olup bağlama uyar; diğerleri farklı anlamlar taşır.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The negotiations broke down after both sides refused to ____ on the key terms.",
    options: ["compromise", "comprise", "compress", "complicate"],
    correctIndex: 0,
    explanation: "'Refuse to compromise' (taviz vermeyi reddetmek) anlam olarak doğrudur; diğer seçenekler bu bağlamda kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 2,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ZOR",
    prompt: "The committee's report was criticized for being ____ vague to guide any real policy change.",
    options: ["prohibitively", "probably", "profoundly", "predictably"],
    correctIndex: 0,
    explanation: "'Prohibitively vague' (herhangi bir eylemi engelleyecek kadar belirsiz) anlamıyla bağlama uyar; diğer zarflar bu yapıda kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 2,
  },

  // ============================================================
  // DENEME 3
  // ============================================================
  // --- mcq-single (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "KOLAY",
    passageText:
      "Community gardens have spread across many neighborhoods as residents look for ways to grow their own produce. Beyond providing fresh vegetables, organizers say the gardens have become informal meeting spaces where neighbors who rarely spoke before now exchange gardening tips and, increasingly, become friends.",
    prompt: "According to organizers, what unexpected benefit have community gardens provided?",
    options: [
      "A reliable source of income for residents",
      "A way to reduce the price of vegetables",
      "An informal space that builds neighborly relationships",
      "A method of training professional farmers",
    ],
    correctIndex: 2,
    explanation:
      "Parça, bahçelerin komşular arasında gayri resmi bir buluşma alanı haline geldiğini ve arkadaşlıkların oluştuğunu belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "A software company switched its internal documentation from lengthy manuals to short video tutorials. Employee surveys showed that new hires completed onboarding tasks faster, though several long-tenured staff reported preferring the searchable text format for quickly locating specific details.",
    prompt: "What did long-tenured staff report preferring about the text format?",
    options: [
      "It was faster for completing onboarding tasks",
      "It made specific details easier to locate quickly",
      "It required less time to produce than videos",
      "It was preferred by new hires as well",
    ],
    correctIndex: 1,
    explanation:
      "Parça, kıdemli çalışanların metin formatını belirli ayrıntıları hızla bulmak için tercih ettiklerini belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "Glaciologists tracking a large ice shelf noted that its rate of retreat had slowed unexpectedly over the past two years. Closer analysis revealed that a shift in ocean currents had brought cooler water beneath the shelf, temporarily offsetting the warming effects observed in the surrounding atmosphere.",
    prompt: "What explains the slowdown in the ice shelf's retreat?",
    options: [
      "A permanent drop in atmospheric temperatures",
      "A shift in ocean currents bringing cooler water",
      "A reduction in the shelf's overall size",
      "An increase in surrounding atmospheric warming",
    ],
    correctIndex: 1,
    explanation:
      "Metin, okyanus akıntılarındaki değişimin buzun altına daha soğuk su getirdiğini ve bunun atmosferik ısınmanın etkisini geçici olarak dengelediğini belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ZOR",
    passageText:
      "It is often assumed that standardized testing provides the most objective measure of student ability. Critics counter that such tests primarily reward familiarity with the test format itself, pointing to studies showing that scores rise significantly after short coaching sessions focused solely on test-taking strategy rather than subject knowledge.",
    prompt: "What point do the critics mentioned in the passage make?",
    options: [
      "Standardized tests measure subject knowledge more accurately than any other method",
      "Coaching sessions have no effect on standardized test scores",
      "Test scores can rise mainly due to familiarity with the test format, not subject mastery",
      "Standardized tests should be replaced with coaching sessions",
    ],
    correctIndex: 2,
    explanation:
      "Eleştirmenler, kısa koçluk seanslarının yalnızca test stratejisine odaklanmasına rağmen puanları önemli ölçüde artırdığını, yani testlerin asıl olarak formata aşinalığı ödüllendirdiğini savunur.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 3,
  },
  // --- mcq-multi (3) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A hospital that switched to a paperless record system reported faster access to patient histories and fewer transcription errors. Staff training took longer than expected, however, and the initial software rollout caused several days of scheduling disruptions before technicians resolved the underlying issues.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Access to patient histories became faster  2) Transcription errors increased  3) Staff training took longer than expected  4) Scheduling was unaffected during rollout",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, hasta geçmişine erişimin hızlandığını ve personel eğitiminin beklenenden uzun sürdüğünü belirtir; transkripsiyon hatalarının azaldığını ve ilk günlerde çizelgeleme aksaklıkları yaşandığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "A wildlife corridor built to connect two fragmented forest reserves led to a documented increase in genetic diversity among the region's deer population within a decade. Camera traps also recorded several large predator species using the corridor, though researchers found no measurable change in local plant biodiversity along the route.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Genetic diversity among deer increased  2) Plant biodiversity increased significantly  3) Predator species were recorded using the corridor  4) The corridor connected only farmland areas",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, geyik popülasyonunda genetik çeşitliliğin arttığını ve büyük yırtıcı türlerin koridoru kullandığının kaydedildiğini belirtir; bitki biyoçeşitliliğinde ölçülebilir bir değişim olmadığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A retail chain that introduced self-checkout kiosks in all its stores saw average checkout times drop noticeably during peak hours. Customer satisfaction scores, however, showed a slight decline, largely attributed to frequent technical errors, while theft-related losses rose modestly compared to the previous year.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Checkout times dropped  2) Customer satisfaction improved  3) Theft-related losses rose  4) Technical errors were rare",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, ödeme sürelerinin kısaldığını ve hırsızlık kaynaklı kayıpların arttığını belirtir; müşteri memnuniyetinin hafifçe düştüğünü ve teknik hataların sık yaşandığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 3,
  },
  // --- reorder (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. The startup consequently pivoted its product toward small business clients instead.\n2. Early market research suggested strong demand for the product among large corporations.\n3. Within months, revenue from small business clients had exceeded initial projections.\n4. Actual sales to large corporations, however, fell far short of expectations.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "2, 4, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: pazar araştırması büyük şirketlerde talep olduğunu gösterdi (2) → ancak gerçek satışlar beklentilerin gerisinde kaldı (4) → şirket ürününü küçük işletmelere yönlendirdi (1) → birkaç ay içinde gelir başlangıç tahminlerini aştı (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. The clinic therefore introduced an online booking system to simplify scheduling.\n2. Patients had long complained about the difficulty of reaching the clinic by phone.\n3. Missed appointments dropped noticeably once the new system was in place.\n4. Staff were then able to spend more time on patient care rather than phone calls.",
    options: ["2, 1, 3, 4", "1, 2, 3, 4", "2, 3, 1, 4", "2, 1, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: hastalar telefonla ulaşmanın zorluğundan şikayet etti (2) → klinik çevrimiçi randevu sistemi getirdi (1) → kaçırılan randevular azaldı (3) → personel telefon yerine hasta bakımına daha çok zaman ayırabildi (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Investigators eventually traced the outage to a single faulty transformer.\n2. A sudden power outage left much of the city without electricity for hours.\n3. Replacing the transformer restored power to all affected neighborhoods within a day.\n4. Emergency crews were dispatched immediately to assess the scope of the damage.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "2, 4, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: ani bir elektrik kesintisi şehri saatlerce karanlıkta bıraktı (2) → acil ekipler hasarın boyutunu değerlendirmek için gönderildi (4) → yetkililer kesintiyi tek bir arızalı trafoya bağladı (1) → trafonun değiştirilmesi elektriği geri getirdi (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. This inconsistency prompted the journal to require raw data submission for all future papers.\n2. Several laboratories attempted to replicate the results of a widely cited psychology paper.\n3. The original researchers welcomed the new policy as a way to strengthen the field's credibility.\n4. Only two of the five attempts produced results resembling the original findings.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "2, 4, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: birkaç laboratuvar yaygın olarak alıntılanan bir psikoloji makalesini tekrarlamaya çalıştı (2) → beş denemeden yalnızca ikisi orijinal bulgulara benzer sonuç verdi (4) → bu tutarsızlık dergiyi ham veri talep etmeye yöneltti (1) → orijinal araştırmacılar bu yeni politikayı alanın güvenilirliğini güçlendirmenin bir yolu olarak memnuniyetle karşıladı (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 3,
  },
  // --- fill-blanks (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "KOLAY",
    prompt: "The board decided to ____ the decision until more information became available.",
    options: ["postpone", "prevent", "propose", "protect"],
    correctIndex: 0,
    explanation: "'Postpone a decision' (bir kararı ertelemek) bağlama uyan doğru collocation'dır.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The new regulations are designed to ____ small businesses from unfair competition.",
    options: ["safeguard", "safekeep", "safen", "safely"],
    correctIndex: 0,
    explanation: "'Safeguard from' (korumak) doğru fiil-edat kalıbıdır; diğer seçenekler geçerli veya bağlama uygun değildir.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The professor's explanation only served to ____ confusion among the students.",
    options: ["compound", "compose", "compute", "compress"],
    correctIndex: 0,
    explanation: "'Compound confusion' (kafa karışıklığını artırmak) doğru collocation'dır; diğer fiiller bu bağlamda kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 3,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ZOR",
    prompt: "The findings were considered ____ enough to warrant a full-scale follow-up study.",
    options: ["compelling", "compelled", "compulsion", "compulsory"],
    correctIndex: 0,
    explanation: "'Compelling enough' (yeterince ikna edici) yapısında bir sıfat gerekir; 'compelled' edilgen ortaçtır, 'compulsion' bir isimdir, 'compulsory' ise 'zorunlu' anlamına gelir ve bağlama uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 3,
  },

  // ============================================================
  // DENEME 4
  // ============================================================
  // --- mcq-single (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "KOLAY",
    passageText:
      "A regional airport introduced a fast-track security lane for passengers traveling with only carry-on luggage. Within months, average wait times for all passengers had dropped, since fewer people were competing for space in the standard lanes. Airport staff say the change required no additional hiring.",
    prompt: "What happened after the fast-track lane was introduced?",
    options: [
      "Wait times increased for all passengers",
      "Average wait times dropped for all passengers",
      "The airport had to hire additional staff",
      "Only fast-track passengers benefited from shorter waits",
    ],
    correctIndex: 1,
    explanation:
      "Parça, standart hatlardaki rekabetin azalması sayesinde tüm yolcular için ortalama bekleme sürelerinin düştüğünü belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "A study of remote workers found that those who maintained a dedicated home office space reported fewer interruptions during the workday than those who worked from shared living areas. Interestingly, self-reported overall job satisfaction did not differ significantly between the two groups.",
    prompt: "What did the study find regarding job satisfaction?",
    options: [
      "It was significantly higher for those with a dedicated office",
      "It did not differ significantly between the two groups",
      "It was lower for those with fewer interruptions",
      "It was not measured in the study",
    ],
    correctIndex: 1,
    explanation:
      "Parça, iş memnuniyetinin iki grup arasında anlamlı bir fark göstermediğini açıkça belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "Volcanic ash from a major eruption can temporarily lower global temperatures by reflecting sunlight back into space. This cooling effect typically lasts only a few years, as the fine particles gradually settle out of the atmosphere, after which temperatures tend to return to their pre-eruption trend.",
    prompt: "Why does the cooling effect of volcanic ash eventually end?",
    options: [
      "The sun stops producing enough sunlight to reflect",
      "The fine particles gradually settle out of the atmosphere",
      "Global temperatures permanently stabilize at a lower level",
      "New eruptions counteract the cooling effect",
    ],
    correctIndex: 1,
    explanation:
      "Metin, ince parçacıkların zamanla atmosferden çökmesiyle soğutma etkisinin sona erdiğini belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ZOR",
    passageText:
      "Conventional wisdom holds that specialization boosts productivity by allowing workers to master a narrow set of tasks. Yet a study of manufacturing teams found that moderate task rotation, rather than strict specialization, produced higher long-term output, largely because rotation reduced repetitive-strain injuries and workplace boredom, both of which had been quietly eroding productivity.",
    prompt: "What does the study suggest about strict specialization compared to moderate task rotation?",
    options: [
      "Strict specialization always produces higher long-term output",
      "Moderate task rotation reduced injuries and boredom, ultimately boosting output",
      "Task rotation has no effect on productivity over time",
      "Specialization eliminates workplace boredom entirely",
    ],
    correctIndex: 1,
    explanation:
      "Parça, ılımlı görev rotasyonunun tekrarlayan zorlanma yaralanmalarını ve sıkılmayı azaltarak uzun vadede daha yüksek üretim sağladığını, bunun da geleneksel uzmanlaşma görüşünü sorguladığını belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 4,
  },
  // --- mcq-multi (3) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A university that switched several large lecture courses to a flipped-classroom format, where students watch recorded lectures at home and do problem-solving in class, reported higher average exam scores. Attendance rates, however, declined slightly, and faculty noted a substantial increase in preparation time needed for each class session.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Exam scores rose  2) Attendance rates rose  3) Faculty preparation time increased  4) The university reverted to traditional lectures the following year",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, sınav puanlarının yükseldiğini ve öğretim üyelerinin ders hazırlığına ayırdığı sürenin önemli ölçüde arttığını belirtir; devam oranlarının arttığına değil hafifçe düştüğüne işaret eder ve üniversitenin geleneksel derslere geri döndüğüne dair hiçbir bilgi yoktur.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "A river restoration project that removed an aging dam led to the return of native fish species within two years, according to monitoring reports. Sediment that had built up behind the dam initially clouded the water downstream, but water clarity later improved beyond pre-dam levels. Local flooding frequency remained unchanged.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Native fish species returned  2) Flooding frequency increased  3) Water clarity eventually improved  4) Sediment had no effect on the river",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, yerli balık türlerinin geri döndüğünü ve su berraklığının sonunda iyileştiğini belirtir; taşkın sıklığının değişmediğini ve tortunun başlangıçta suyu bulandırdığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A company that introduced a four-tier feedback system for employee reviews found that turnover among junior staff decreased noticeably. Managers, however, reported spending significantly more time preparing reviews, and the system had little measurable effect on turnover among senior staff.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Junior staff turnover decreased  2) Senior staff turnover decreased significantly  3) Managers spent more time preparing reviews  4) The system reduced managers' workload",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, genç personelin işten ayrılma oranının azaldığını ve yöneticilerin değerlendirme hazırlığına daha çok zaman harcadığını belirtir; kıdemli personel üzerinde ölçülebilir bir etki olmadığını söyler.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 4,
  },
  // --- reorder (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. The museum responded by digitizing its most fragile manuscripts for public viewing.\n2. Conservators had grown concerned that frequent handling was damaging rare manuscripts.\n3. Visitor numbers to the digital archive soon surpassed those of the physical reading room.\n4. This success led the museum to expand the digitization project to its entire collection.",
    options: ["2, 1, 3, 4", "1, 2, 3, 4", "2, 3, 1, 4", "2, 1, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: koruma uzmanları sık kullanımın nadir el yazmalarına zarar verdiğinden endişelendi (2) → müze bu yazmaları dijitalleştirdi (1) → dijital arşiv ziyaretçi sayısı fiziksel okuma salonunu geçti (3) → bu başarı projeyi tüm koleksiyona genişletmeye yol açtı (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. The town council then installed speed bumps along the busiest stretch of the road.\n2. Residents had reported a sharp rise in near-miss accidents near the school.\n3. Complaints about the road dropped sharply within the following months.\n4. Traffic speeds near the school fell noticeably after the bumps were installed.",
    options: ["2, 1, 4, 3", "1, 2, 4, 3", "2, 4, 1, 3", "2, 1, 3, 4"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: sakinler okul yakınında ramak kala kazaların arttığını bildirdi (2) → belediye hız kesiciler yerleştirdi (1) → okul çevresinde trafik hızı belirgin şekilde düştü (4) → şikayetler sonraki aylarda keskin biçimde azaldı (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Demand for the new items quickly outpaced what the small kitchen could produce.\n2. The bakery consequently began offering a limited gluten-free menu each morning.\n3. The owners eventually expanded the kitchen to keep up with orders.\n4. A growing number of customers had started asking about gluten-free options.",
    options: ["4, 2, 1, 3", "2, 4, 1, 3", "4, 1, 2, 3", "4, 2, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: giderek daha fazla müşteri glütensiz seçenek sormaya başladı (4) → fırın sınırlı bir glütensiz menü sunmaya başladı (2) → yeni ürünlere talep küçük mutfağın kapasitesini aştı (1) → sahipler mutfağı genişletti (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Regulators subsequently required all manufacturers to disclose full ingredient lists.\n2. A investigative report found that several supplements contained undeclared substances.\n3. Compliance costs rose for smaller manufacturers unable to afford additional testing.\n4. Some of these substances were later linked to adverse reactions in consumers.",
    options: ["2, 4, 1, 3", "4, 2, 1, 3", "2, 1, 4, 3", "2, 4, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: bir araştırma raporu bazı takviyelerde beyan edilmemiş maddeler bulundu (2) → bu maddelerin tüketicilerde yan etkilerle bağlantılı olduğu ortaya çıktı (4) → düzenleyiciler tüm üreticilerden tam içerik listesi istemeye başladı (1) → bu da küçük üreticiler için uyum maliyetlerini artırdı (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 4,
  },
  // --- fill-blanks (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "KOLAY",
    prompt: "The engineers had to ____ several design flaws before the product could be released.",
    options: ["address", "attend", "assign", "assist"],
    correctIndex: 0,
    explanation: "'Address a flaw' (bir sorunu ele almak/gidermek) doğru collocation'dır; diğer fiiller bu bağlamda kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "Critics argue that the new tax policy will disproportionately ____ low-income households.",
    options: ["burden", "border", "burnish", "bundle"],
    correctIndex: 0,
    explanation: "'Burden a household' (bir haneye yük getirmek) bağlama uyan doğru fiildir; diğerleri anlam olarak uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The negotiators reached a ____ that satisfied both parties after weeks of talks.",
    options: ["compromise", "comprehension", "component", "complaint"],
    correctIndex: 0,
    explanation: "'Reach a compromise' (uzlaşmaya varmak) doğru collocation'dır; diğer isimler bu fiille birlikte kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 4,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ZOR",
    prompt: "The report's conclusions were later found to be ____ by a significant coding error in the analysis.",
    options: ["invalidated", "invaluable", "invasive", "inventive"],
    correctIndex: 0,
    explanation: "'Invalidated by an error' (bir hata nedeniyle geçersiz kılınmak) anlam olarak doğrudur; diğer sözcükler cümleye uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 4,
  },

  // ============================================================
  // DENEME 5
  // ============================================================
  // --- mcq-single (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "KOLAY",
    passageText:
      "A local theater began offering pay-what-you-can tickets for its Wednesday matinee performances. Attendance on those days rose significantly, drawing many first-time visitors who said the standard ticket price had previously kept them away. The theater reports that overall revenue for the week has stayed roughly stable.",
    prompt: "What effect did the pay-what-you-can policy have on the theater?",
    options: [
      "It significantly reduced overall weekly revenue",
      "It attracted many first-time visitors and kept weekly revenue stable",
      "It discouraged first-time visitors from attending",
      "It was limited only to weekend performances",
    ],
    correctIndex: 1,
    explanation:
      "Parça, politikanın birçok ilk kez gelen izleyiciyi çektiğini ve haftalık gelirin kabaca sabit kaldığını belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "A study comparing two methods of teaching foreign vocabulary found that students who learned new words through short stories retained significantly more of them after one month than students who memorized word lists. Immediate post-lesson recall, however, was nearly identical between the two groups.",
    prompt: "What did the study find about immediate post-lesson recall?",
    options: [
      "It was significantly higher for the story-based group",
      "It was nearly identical between the two groups",
      "It was not measured in the study",
      "It was significantly higher for the word-list group",
    ],
    correctIndex: 1,
    explanation:
      "Parça, ders sonrası hemen yapılan hatırlama testinde iki grup arasında neredeyse hiç fark olmadığını belirtir; fark bir ay sonra ortaya çıkmıştır.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ORTA",
    passageText:
      "Engineers designing a new pedestrian bridge chose a curved structure over a straight one, partly for aesthetic reasons but mainly because the curve distributes wind pressure more evenly across the span. Wind tunnel tests confirmed that the curved design experienced roughly thirty percent less structural stress in high winds.",
    prompt: "Why did the engineers primarily choose a curved structure?",
    options: [
      "It was cheaper to construct than a straight bridge",
      "It distributed wind pressure more evenly, reducing structural stress",
      "It was the only design approved by wind tunnel tests",
      "It required no aesthetic considerations",
    ],
    correctIndex: 1,
    explanation:
      "Metin, kavisli tasarımın rüzgar basıncını daha eşit dağıttığını ve yapısal stresi yaklaşık yüzde otuz azalttığını, bunun asıl seçim nedeni olduğunu belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-single",
    questionType: "MCQ",
    difficulty: "ZOR",
    passageText:
      "It has long been assumed that larger teams generate more creative solutions because they draw on a wider range of perspectives. A meta-analysis of workplace studies complicates this assumption, finding that beyond a certain team size, coordination costs begin to outweigh the benefits of added perspectives, causing creative output to plateau or even decline.",
    prompt: "What does the meta-analysis suggest about team size and creativity?",
    options: [
      "Larger teams always produce more creative output",
      "Beyond a certain size, coordination costs can outweigh the benefits of more perspectives",
      "Team size has no relationship to creative output",
      "Smaller teams never produce creative solutions",
    ],
    correctIndex: 1,
    explanation:
      "Parça, belirli bir takım büyüklüğünün ötesinde koordinasyon maliyetlerinin, ek bakış açılarının faydasını aşmaya başladığını ve yaratıcı çıktının düzleştiğini veya azaldığını belirtir.",
    tags: ["pte-reading-mcq"],
    mockSetNumber: 5,
  },
  // --- mcq-multi (3) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A city that introduced a bike-share program reported a modest drop in short car trips within the first year. Air quality readings near the busiest bike-share stations showed no significant improvement, though the city noted a measurable rise in the number of registered cyclists overall.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Short car trips decreased  2) Air quality improved significantly  3) Registered cyclists increased  4) The bike-share program was suspended after its first year",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, kısa araba yolculuklarının azaldığını ve kayıtlı bisikletçi sayısının arttığını belirtir; hava kalitesinde anlamlı bir iyileşme olmadığını söyler ve programın ilk yılın ardından askıya alındığına dair hiçbir bilgi yoktur.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ZOR",
    passageText:
      "A field trial testing drought-resistant wheat varieties found that crop yields remained stable even during a season of below-average rainfall. Soil nutrient levels in the trial fields, however, declined faster than in fields planted with conventional wheat, and the drought-resistant variety required a longer growing season to reach maturity.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Yields remained stable in low rainfall  2) Soil nutrients declined more slowly  3) The variety needed a longer growing season  4) The drought-resistant variety matured faster than conventional wheat",
    options: ["1 and 3", "2 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, verimin düşük yağışta bile sabit kaldığını ve çeşidin olgunlaşmak için daha uzun bir büyüme mevsimine ihtiyaç duyduğunu belirtir; bu nedenle konvansiyonel buğdaydan daha hızlı olgunlaştığı doğru değildir, toprak besin maddelerinin de daha yavaş değil daha hızlı azaldığı belirtilmiştir.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-mcq-multi",
    questionType: "READING_COMPREHENSION",
    difficulty: "ORTA",
    passageText:
      "A publisher that began releasing audiobook versions of its bestsellers simultaneously with print editions saw overall sales rise, driven largely by audiobook purchases among commuters. Print sales alone showed a slight decline, while e-book sales for the same titles remained essentially flat compared to the previous year.",
    prompt:
      "Which TWO of the following are supported by the passage? 1) Overall sales rose  2) Print sales alone declined slightly  3) E-book sales rose sharply  4) E-book sales also declined compared to the previous year",
    options: ["1 and 2", "3 and 4", "1 and 4", "2 and 3"],
    correctIndex: 0,
    explanation:
      "Parça, toplam satışların arttığını ve yalnızca basılı kitap satışlarının hafifçe düştüğünü belirtir; e-kitap satışlarının ise bir önceki yıla göre değişmeden kaldığını, yani ne keskin bir artış ne de bir düşüş yaşamadığını belirtir.",
    tags: ["pte-mcq-multi"],
    mockSetNumber: 5,
  },
  // --- reorder (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Management then introduced a mentorship program pairing new hires with veteran staff.\n2. Exit interviews revealed that many new employees felt unsupported during their first months.\n3. Turnover among first-year employees fell by nearly a third the following year.\n4. Veteran staff reported that mentoring also improved their own job satisfaction.",
    options: ["2, 1, 3, 4", "1, 2, 3, 4", "2, 3, 1, 4", "2, 1, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: çıkış görüşmeleri yeni çalışanların ilk aylarda desteksiz hissettiğini ortaya çıkardı (2) → yönetim mentorluk programı başlattı (1) → ilk yıl personel devir hızı düştü (3) → kıdemli personel de iş memnuniyetinin arttığını bildirdi (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "KOLAY",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. Litter levels dropped noticeably within the first month after the change.\n2. Park officials responded by adding more waste bins along the main trails.\n3. Encouraged by the results, officials expanded the bin placement to secondary trails.\n4. Visitors to the national park had been leaving increasing amounts of litter behind.",
    options: ["4, 2, 1, 3", "2, 4, 1, 3", "4, 1, 2, 3", "4, 2, 3, 1"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: ziyaretçiler giderek daha fazla çöp bırakmaya başladı (4) → park yetkilileri ana patikalara daha fazla çöp kutusu ekledi (2) → çöp miktarı ilk ay içinde belirgin şekilde azaldı (1) → sonuçlardan cesaret alan yetkililer bunu ikincil patikalara da genişletti (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ORTA",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. The factory subsequently installed noise-dampening panels around the loudest machines.\n2. A hearing-safety audit found that noise levels on the factory floor exceeded recommended limits.\n3. Follow-up measurements showed noise levels had fallen well within safe limits.\n4. Workers had reported persistent ringing in their ears after long shifts.",
    options: ["4, 2, 1, 3", "2, 4, 1, 3", "4, 1, 2, 3", "2, 1, 4, 3"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: işçiler uzun vardiyalardan sonra kulak çınlaması bildirdi (4) → işitme güvenliği denetimi gürültü seviyelerinin sınırları aştığını buldu (2) → fabrika en gürültülü makinelerin etrafına ses yalıtım panelleri taktı (1) → takip ölçümleri gürültü seviyelerinin güvenli sınırlara düştüğünü gösterdi (3).",
    tags: ["pte-reorder"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-reorder",
    questionType: "MCQ",
    difficulty: "ZOR",
    prompt:
      "Arrange the sentences in the correct logical order.\n1. The city then piloted a congestion charge in its most gridlocked district.\n2. Average commute times in the district fell by nearly twenty percent within six months.\n3. Traffic congestion in the city center had worsened steadily for several years.\n4. Business owners in the district, initially opposed, later reported no drop in customer visits.",
    options: ["3, 1, 2, 4", "1, 3, 2, 4", "3, 2, 1, 4", "3, 1, 4, 2"],
    correctIndex: 0,
    explanation:
      "Mantıksal sıra: şehir merkezindeki trafik sıkışıklığı yıllar içinde kötüleşti (3) → şehir en sıkışık bölgede trafik sıkışıklığı ücreti uyguladı (1) → bölgedeki ortalama işe gidiş süreleri altı ay içinde yaklaşık yüzde yirmi azaldı (2) → başlangıçta karşı çıkan işletme sahipleri müşteri ziyaretlerinde düşüş olmadığını bildirdi (4).",
    tags: ["pte-reorder"],
    mockSetNumber: 5,
  },
  // --- fill-blanks (4) ---
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "KOLAY",
    prompt: "The city plans to ____ the old warehouse into a public library next year.",
    options: ["convert", "conserve", "convey", "convince"],
    correctIndex: 0,
    explanation: "'Convert into' (dönüştürmek) doğru fiil-edat kalıbıdır; diğer seçenekler bu bağlamda kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The board's decision was met with ____ opposition from shareholders who felt uninformed.",
    options: ["considerable", "considerate", "considering", "considered"],
    correctIndex: 0,
    explanation: "'Considerable opposition' (önemli ölçüde muhalefet) doğru sıfat-isim eşleşmesidir; diğer biçimler farklı anlamlar taşır veya dilbilgisel olarak uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ORTA",
    prompt: "The company's earnings report failed to ____ investor expectations for the third consecutive quarter.",
    options: ["meet", "match", "mean", "measure"],
    correctIndex: 0,
    explanation: "'Meet expectations' (beklentileri karşılamak) yerleşik bir collocation'dır; diğer fiiller bu isimle birlikte doğal biçimde kullanılmaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 5,
  },
  {
    examFamily: "ACADEMIC_SKILLS",
    examTypeCode: "PTE",
    topicSlug: "pte-reading-fill-blanks",
    questionType: "CLOZE",
    difficulty: "ZOR",
    prompt: "The scandal left the minister's credibility so ____ that few colleagues were willing to defend her publicly.",
    options: ["tarnished", "tarnishing", "tarnish", "tarnishes"],
    correctIndex: 0,
    explanation: "'So + sıfat' yapısı gerektiği için 'tarnished' (lekelenmiş, zedelenmiş) burada geçmiş zaman ortacı/sıfat olarak doğru biçimdir; diğer seçenekler dilbilgisel olarak bu kalıba uymaz.",
    tags: ["pte-fill-blanks"],
    mockSetNumber: 5,
  },
];
