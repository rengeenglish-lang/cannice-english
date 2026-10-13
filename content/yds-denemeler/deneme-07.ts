import type { Deneme } from "./types";

export const DENEME_07: Deneme = {
  no: 7,
  vocab: [
    [
      "The witness gave a ---- account of the accident, describing every detail from the colour of the car to the time on the clock.",
      ["meticulous", "careless", "reluctant", "superficial", "contradictory"],
      "Her ayrıntıyı anlatması ifadenin 'titiz, kılı kırk yaran' (meticulous) olduğunu gösterir. 'careless' ve 'superficial' tam tersini anlatır.",
    ],
    [
      "The government's decision to raise taxes on fuel ---- widespread protests across the country.",
      ["sparked", "calmed", "prevented", "suspended", "deserved"],
      "Vergi artışı kararının protestoları 'başlatması, alevlendirmesi' (spark) anlamlıdır. 'calmed' ve 'prevented' anlamı tersine çevirir.",
    ],
    [
      "Because the instructions were written in highly ---- language, most users found them impossible to understand.",
      ["technical", "simple", "friendly", "informal", "familiar"],
      "Kullanıcıların talimatları anlayamaması dilin 'teknik' (technical) olduğunu gösterir. Diğer sıfatlar anlaşılır bir dili tanımlar.",
    ],
    [
      "The two companies agreed to ---- their resources in order to develop the new vaccine more quickly.",
      ["pool", "waste", "conceal", "divide", "withdraw"],
      "Aşıyı daha hızlı geliştirmek için kaynakları 'bir araya getirmek, birleştirmek' (pool) gerekir. 'divide' ve 'withdraw' amaca ters düşer.",
    ],
    [
      "Many of the old customs have ---- as young people move away from the villages to the cities.",
      ["died out", "set in", "cropped up", "turned out", "held on"],
      "Gençlerin köyden kente göçüyle eski geleneklerin 'yok olması' 'die out' ile anlatılır. 'cropped up' (ortaya çıkmak) anlamı tersine çevirir.",
    ],
    [
      "The negotiators worked through the night in an attempt to ---- a compromise that both sides could accept.",
      ["reach", "reject", "avoid", "postpone", "ignore"],
      "'reach a compromise' (uzlaşmaya varmak) sabit eşdizimidir ve gece boyu çalışmanın amacını verir.",
    ],
  ],
  grammar: [
    [
      "The bridge ---- for nearly two years when engineers discovered a serious flaw in its design.",
      ["had been in use", "has been in use", "was being used now", "is in use", "will have been in use"],
      "Mühendislerin kusuru keşfetmesinden (discovered) önce süregelen durum past perfect gerektirir: 'had been in use'.",
    ],
    [
      "The manager suggested that the meeting ---- until all the members of the team were available.",
      ["be postponed", "is postponing", "was postponing", "will postpone", "has postponed"],
      "'suggest that' resmî yapıda yalın fiil alır; toplantı ertelendiği için edilgen 'be postponed' doğrudur.",
    ],
    [
      "---- the company's profits have fallen sharply, it is still planning to open new stores abroad.",
      ["Even though", "Because", "Since", "Unless", "Provided that"],
      "Kârların düşmesi ile yeni mağaza açma planı zıttır: 'Even though'.",
    ],
    [
      "This is the first time I ---- such a beautiful sunset.",
      ["have seen", "saw", "see", "had seen", "am seeing"],
      "'This is the first time' kalıbından sonra present perfect kullanılır: 'have seen'.",
    ],
    [
      "The students were asked to write an essay on a topic ---- they felt strongly.",
      ["about which", "which", "that about", "whose", "for that"],
      "'feel strongly about' kalıbındaki edat ilgi zamirinin önüne alınır: 'about which they felt strongly'.",
    ],
    [
      "Under no circumstances ---- to enter the laboratory without protective clothing.",
      ["are visitors allowed", "visitors are allowed", "visitors allowed", "allowed are visitors", "do visitors allowed"],
      "'Under no circumstances' olumsuz anlamlı başlangıç devrik yapı gerektirir: 'are visitors allowed'.",
    ],
    [
      "The novel ---- into more than thirty languages since it was first published.",
      ["has been translated", "was translated", "had been translated", "is translated", "translated"],
      "'since it was first published' bugüne uzanan bir süreç bildirir ve roman çevrildiği için present perfect passive gerekir.",
    ],
    [
      "He spoke so quietly that I could ---- hear what he was saying.",
      ["hardly", "nearly", "hard", "mostly", "fairly"],
      "'so quietly that' sonucu olarak 'hardly hear' (zar zor duymak) anlamlıdır. 'hard' zarf olarak 'zor' anlamında bu yapıda kullanılmaz.",
    ],
    [
      "I'd rather ---- at home tonight than go to the party.",
      ["stay", "to stay", "staying", "stayed", "have stayed"],
      "'would rather + yalın fiil + than' kalıbı: 'I'd rather stay at home than go'.",
    ],
    [
      "Scientists are concerned ---- the rapid decline of insect populations, which could have serious consequences ---- food production.",
      ["about / for", "with / at", "for / about", "in / by", "on / with"],
      "'be concerned about' (… hakkında endişeli olmak) ve 'consequences for' (… için sonuçlar) kalıpları doğrudur.",
    ],
  ],
  cloze: [
    {
      text:
        "Before the middle of the nineteenth century, surgery was a terrifying experience. Patients were fully conscious during operations, {1} surgeons had to work as quickly as possible to limit their suffering. Some patients died from shock, and many refused surgery altogether, preferring to live with their illness. This changed dramatically in 1846, {2} a dentist in Boston publicly demonstrated the use of ether to make a patient unconscious during the removal of a tumour. News of the demonstration spread rapidly, and within months ether was being used in hospitals across Europe and North America. {3} the following year, a Scottish doctor introduced chloroform, which was easier to use. Anaesthesia allowed surgeons to perform longer and more complex operations. {4}, it did not immediately make surgery safe, because doctors did not yet understand that infections were caused by germs. It was only when anaesthesia was combined with antiseptic techniques later in the century {5} surgery became truly transformed.",
      blanks: [
        ["", ["so", "although", "unless", "whereas", "if"], "Hastaların bilinçli olması, cerrahların olabildiğince hızlı çalışmak zorunda kalmasının nedenidir; sonuç bağlacı 'so' gerekir."],
        ["", ["when", "which", "where", "whose", "while"], "'1846' yılı bir zamanı belirtir ve ardından tam bir cümle gelir: 'when a dentist ... demonstrated'."],
        ["", ["In", "Since", "Until", "By", "For"], "'In the following year' (ertesi yıl) bir zaman noktası bildirir. 'By' bir son sınır, 'Since' bir başlangıç ister."],
        ["", ["However", "Therefore", "Similarly", "For example", "In other words"], "Anestezinin faydasından sonra sınırlılığına geçilir: 'However'."],
        ["", ["that", "which", "what", "when", "so"], "'It was only when ... that ...' vurgulama kalıbı 'that' ile tamamlanır."],
      ],
    },
    {
      text:
        "The anthropologist Robin Dunbar has proposed that humans can maintain stable social relationships with only about one hundred and fifty people. This figure, now known as Dunbar's number, is based on a comparison of brain size and group size in primates. Dunbar found that species with larger neocortices, the part of the brain {1} with complex thought, tend to live in larger groups. Applying this relationship to humans, he calculated that our natural group size should be around one hundred and fifty. Interestingly, this number appears in many different contexts, {2} the size of traditional villages to military units and the average number of people to whom individuals send holiday cards. {3} social media allows us to have thousands of 'friends' online, research suggests that the number of people with whom we have meaningful contact {4} roughly the same. Critics argue that the figure is too precise and that group sizes vary widely between cultures, {5} Dunbar's work has nevertheless been influential in fields ranging from business management to the design of online communities.",
      blanks: [
        ["", ["associated", "associating", "to associate", "which associates", "associates"], "'the part of the brain associated with complex thought' = 'karmaşık düşünceyle ilişkilendirilen beyin bölümü'; edilgen anlamlı kısaltılmış ilgi cümlesi V3 ister."],
        ["", ["from", "between", "such as", "including", "like"], "'from ... to ...' kalıbı bir yelpaze bildirir: köylerin büyüklüğünden askerî birliklere kadar."],
        ["", ["Although", "Because", "Since", "Unless", "Once"], "Sosyal medyanın binlerce 'arkadaş' sağlaması ile anlamlı temas kurulan kişi sayısının aynı kalması zıttır: 'Although'."],
        ["", ["remains", "remained", "had remained", "is remaining", "would remain"], "Genel bir gerçeği bildiren cümlede geniş zaman uygundur: 'remains roughly the same'."],
        ["", ["but", "so", "because", "unless", "since"], "Eleştiriler ile çalışmanın yine de etkili olması zıttır: 'but'."],
      ],
    },
  ],
  completion: [
    [
      "Many scientists believe that, ----, the world's coral reefs could largely disappear by the end of the century.",
      [
        "unless greenhouse gas emissions are reduced significantly",
        "which are home to a quarter of all marine species",
        "although coral reefs cover less than one per cent of the ocean",
        "since tourists had damaged several reefs in the past",
        "so that scientists can study them more carefully",
      ],
      "Mercan resiflerinin yok olması bir koşula bağlanır: sera gazı emisyonları önemli ölçüde azaltılmazsa. Diğerleri koşul bildirmez.",
    ],
    [
      "The school introduced a ban on mobile phones in classrooms ----.",
      [
        "after teachers complained that students were constantly distracted by them",
        "which most of the students had bought with their own pocket money",
        "although phones had never actually been used during lessons by anyone",
        "unless parents had given their written permission",
        "even though students' concentration had improved greatly",
      ],
      "Yasağın getirilme nedeni: öğretmenlerin öğrencilerin sürekli dikkatinin dağıldığından şikâyet etmesi.",
    ],
    [
      "Had the warning been issued earlier, ----.",
      [
        "many more people could have been evacuated before the hurricane arrived",
        "the hurricane will cause serious damage to homes all along the coast",
        "residents are being advised to stay indoors until the storm passes",
        "the hurricane had already reached the coast",
        "most people would leave the city tomorrow",
      ],
      "Devrik üçüncü tip koşul (Had ... been issued) 'could/would have + V3' ister.",
    ],
    [
      "Although the city has one of the best public transport systems in the world, ----.",
      [
        "traffic congestion remains a serious problem during rush hour",
        "most residents use it to travel to work every day",
        "its trains are known for being clean and punctual",
        "tourists find it easy to get around",
        "the government plans to extend it further",
      ],
      "'Although' zıtlık ister: mükemmel toplu taşımaya rağmen trafik sıkışıklığı ciddi bir sorun olmaya devam ediyor.",
    ],
    [
      "The professor encouraged her students to read widely ----.",
      [
        "so that they would be exposed to a variety of ideas and writing styles",
        "which they had already been doing regularly since the beginning of the term",
        "although most of them preferred to watch films",
        "unless they had already read the books on the list",
        "because the university library had been closed for several months for renovations",
      ],
      "Teşvikin amacı: çeşitli fikir ve yazım tarzlarıyla tanışmaları için (so that).",
    ],
    [
      "----, the explorers finally reached the South Pole.",
      [
        "After weeks of struggling through freezing temperatures and fierce winds",
        "Because the weather was mild and calm throughout the journey",
        "Unless they had brought enough supplies for the return journey",
        "So that they could be the first people to reach it",
        "Whereas other expeditions had chosen a different route",
      ],
      "'finally' (sonunda) uzun ve zorlu bir sürecin ardından ulaşıldığını gösterir: haftalarca dondurucu soğuk ve şiddetli rüzgârla mücadeleden sonra.",
    ],
    [
      "It is often said that money cannot buy happiness, ----.",
      [
        "but research suggests that it can reduce some of the causes of unhappiness",
        "because most people would like to earn a great deal more money than they do",
        "which is exactly why so many people choose to work very long hours",
        "so wealthy people are always unhappy",
        "although happiness is difficult to define",
      ],
      "'It is often said ...' yaygın bir görüşü sunar ve 'but' ile karşı bir bulguya geçilir: araştırmalar paranın mutsuzluk nedenlerinin bir kısmını azaltabildiğini gösteriyor.",
    ],
    [
      "The new law will apply only to companies ----.",
      [
        "that employ more than fifty people",
        "which it had been applied to before",
        "whose employees were always satisfied",
        "although they are located abroad",
        "unless they had been registered",
      ],
      "'companies' ismini niteleyen ve yasanın kapsamını belirleyen ilgi cümlesi gerekir: elli kişiden fazla çalıştıran şirketler.",
    ],
    [
      "Even though the experiment did not produce the expected results, ----.",
      [
        "the researchers learned a great deal from analysing what had gone wrong",
        "it was considered a complete and unexpected success by the whole research team",
        "its results confirmed the researchers' original hypothesis in every detail",
        "the researchers had expected it to fail from the start",
        "it was repeated several times with the same results",
      ],
      "'Even though' zıtlık ister: deney beklenen sonucu vermese de araştırmacılar neyin yanlış gittiğini inceleyerek çok şey öğrendi.",
    ],
    [
      "The museum's collection includes thousands of objects, ----.",
      [
        "many of which have never been displayed to the public",
        "most of them have never been displayed to the public",
        "which they have never been displayed to the public",
        "that many have never been displayed to the public",
        "whose have never been displayed to the public",
      ],
      "Virgülden sonra ana cümleye bağlanan ilgi yapısı 'many of which' ile kurulur. 'most of them' bağlaçsız ikinci bir cümle oluşturur; diğerleri yapıyı bozar.",
    ],
  ],
  enTr: [
    [
      "Not only did the reforms fail to reduce unemployment, but they also led to a sharp rise in public debt.",
      [
        "Reformlar yalnızca işsizliği azaltmakta başarısız olmakla kalmadı, aynı zamanda kamu borcunda keskin bir artışa da yol açtı.",
        "Reformlar işsizliği azaltamadı, ancak kamu borcunun düşmesini sağladı.",
        "Kamu borcundaki keskin artış, reformların işsizliği azaltmasını engelledi.",
        "Reformlar hem işsizliği hem de kamu borcunu önemli ölçüde azalttı.",
        "İşsizliği azaltmayı amaçlayan reformlar, kamu borcundaki artış nedeniyle uygulanamadı.",
      ],
      "'Not only did ... fail to ..., but they also led to ...' = 'yalnızca ... başarısız olmakla kalmadı, aynı zamanda ... yol açtı'.",
    ],
    [
      "The longer a language has been written down, the more its spelling tends to differ from the way it is pronounced.",
      [
        "Bir dil ne kadar uzun süredir yazıya geçirilmişse yazımı telaffuzundan o kadar farklılaşma eğilimindedir.",
        "Bir dilin yazımı ile telaffuzu arasındaki fark, o dilin yazıya geçirilme süresini belirler.",
        "Uzun süredir yazıya geçirilen diller, telaffuza en uygun yazım sistemine sahiptir.",
        "Bir dilin telaffuzu değiştikçe yazımının da aynı ölçüde değişmesi gerekir.",
        "Bir dil yazıya geçirildikten kısa bir süre sonra yazımı ile telaffuzu birbirinden ayrılır.",
      ],
      "'The longer ..., the more ...' = '... ne kadar uzun süredir ...sa o kadar ...'; 'tends to differ from' = '... farklılaşma eğilimindedir'.",
    ],
    [
      "There is growing evidence that the bacteria living in our gut may influence not only our digestion but also our mood.",
      [
        "Bağırsağımızda yaşayan bakterilerin yalnızca sindirimimizi değil, ruh hâlimizi de etkileyebileceğine dair kanıtlar artmaktadır.",
        "Bağırsağımızda yaşayan bakterilerin ruh hâlimizi sindirimimizden daha çok etkilediği kanıtlanmıştır.",
        "Ruh hâlimiz, bağırsağımızdaki bakterilerin sindirim üzerindeki etkisini belirlemektedir.",
        "Bağırsaktaki bakterilerin sindirimi etkilediği bilinse de ruh hâliyle ilgisi olmadığı anlaşılmıştır.",
        "Sindirim sorunları yaşayan kişilerin ruh hâlinin bakteriler nedeniyle değiştiğine dair kanıtlar azalmaktadır.",
      ],
      "'There is growing evidence that ...' = '... dair kanıtlar artmaktadır'; 'may influence not only ... but also ...' = 'yalnızca ...i değil, ...i de etkileyebilir'.",
    ],
  ],
  trEn: [
    [
      "Bu bölgedeki arkeolojik kazılar, buranın sanılandan çok daha önce yerleşim yeri olarak kullanıldığını göstermiştir.",
      [
        "Archaeological excavations in this region have shown that it was used as a settlement much earlier than had been thought.",
        "Archaeological excavations in this region have shown that it was settled much later than expected.",
        "It was thought that the region had been a settlement before archaeological excavations began.",
        "Archaeologists have been excavating in this region for much longer than people think.",
        "Archaeological excavations have shown that the region has never been used as a settlement.",
      ],
      "'sanılandan çok daha önce yerleşim yeri olarak kullanıldığını göstermiştir' = 'have shown that it was used as a settlement much earlier than had been thought'.",
    ],
    [
      "Sağlıklı bir yaşam tarzı benimseyen kişilerin bile genetik faktörler nedeniyle bazı hastalıklara yakalanma riski taşıdığı unutulmamalıdır.",
      [
        "It should not be forgotten that even people who adopt a healthy lifestyle may be at risk of some diseases because of genetic factors.",
        "People who adopt a healthy lifestyle should not forget that genetic factors cause most diseases.",
        "Genetic factors are less important than a healthy lifestyle in preventing diseases.",
        "Even people with genetic risk factors can avoid diseases by adopting a healthy lifestyle.",
        "It should be remembered that people with an unhealthy lifestyle are at greater risk of disease.",
      ],
      "'bile ... risk taşıdığı unutulmamalıdır' = 'It should not be forgotten that even ... may be at risk'; 'genetik faktörler nedeniyle' = 'because of genetic factors'.",
    ],
    [
      "Şirket, yeni ürününü piyasaya sürmeden önce kapsamlı bir pazar araştırması yapılması gerektiğine karar verdi.",
      [
        "The company decided that extensive market research should be carried out before it launched its new product.",
        "The company launched its new product without carrying out any market research.",
        "The company carried out extensive market research after its new product had been launched.",
        "Extensive market research showed that the company should not launch its new product.",
        "The company decided to launch its new product because market research had been carried out.",
      ],
      "'piyasaya sürmeden önce ... yapılması gerektiğine karar verdi' = 'decided that ... should be carried out before it launched'.",
    ],
  ],
  reading: [
    {
      text:
        "Tardigrades, also known as water bears, are microscopic animals that rarely grow longer than one millimetre. Despite their tiny size, they are among the toughest creatures on Earth. They have been found in almost every habitat imaginable, from the tops of mountains to the deep sea and the ice of Antarctica. Their most remarkable ability is a state called cryptobiosis. When their environment dries out, tardigrades curl into a ball, lose almost all the water in their bodies and reduce their metabolism to less than one hundredth of a per cent of its normal rate. In this condition, they can survive temperatures close to absolute zero, intense radiation and even the vacuum of space, as experiments on satellites have shown. When water returns, they can revive within hours. Scientists are studying the proteins that protect tardigrades' cells during this process, hoping that they could one day be used to preserve vaccines without refrigeration or to protect human cells from damage.",
      questions: [
        [
          "According to the passage, tardigrades are remarkable mainly because ----.",
          [
            "they can survive extremely harsh conditions despite being very small",
            "they are the largest microscopic animals ever discovered",
            "they live only in the ice of Antarctica",
            "they grow much larger when water is available",
            "they have been sent into space by scientists many times",
          ],
          "Metne göre su ayıları çok küçük olmalarına rağmen Dünya'daki en dayanıklı canlılar arasındadır.",
        ],
        [
          "It is stated in the passage that during cryptobiosis tardigrades ----.",
          [
            "lose most of their body water and slow their metabolism dramatically",
            "increase their metabolism considerably in order to stay warm",
            "search for new habitats with more water",
            "grow a hard protective shell around their tiny bodies",
            "produce large amounts of water inside their cells",
          ],
          "Kriptobiyoz sırasında su ayıları top şeklinde kıvrılır, vücutlarındaki suyun neredeyse tamamını kaybeder ve metabolizmalarını normal hızın yüzde birinin yüzde birinden aza düşürür.",
        ],
        [
          "The experiments on satellites mentioned in the passage showed that tardigrades ----.",
          [
            "can survive the vacuum of space in their dried-out state",
            "cannot survive outside the Earth's atmosphere",
            "reproduce more quickly in space than on Earth",
            "need radiation in order to revive",
            "lose their protective proteins in space",
          ],
          "Uydulardaki deneyler, su ayılarının bu durumdayken uzay boşluğunda bile hayatta kalabildiğini göstermiştir.",
        ],
        [
          "According to the last sentence, scientists hope that tardigrade proteins could ----.",
          [
            "help to keep vaccines stable without the need for cold storage",
            "be used to make it possible for humans to live in space",
            "replace all of the vaccines that are currently in use",
            "make tardigrades grow much larger than one millimetre",
            "be used as a source of food",
          ],
          "Son cümleye göre bilim insanları bu proteinlerin bir gün aşıları soğutma olmadan korumak ya da insan hücrelerini hasardan korumak için kullanılabileceğini umar.",
        ],
      ],
    },
    {
      text:
        "When it opened in 1869, the Suez Canal transformed global trade. By connecting the Mediterranean Sea with the Red Sea, it allowed ships travelling between Europe and Asia to avoid the long and dangerous voyage around the southern tip of Africa, shortening the journey by thousands of kilometres. The idea of linking the two seas was ancient; earlier canals had connected the Nile to the Red Sea at various times in history. The modern canal, however, was the result of a project led by the French diplomat Ferdinand de Lesseps and built over ten years by tens of thousands of workers, many of whom were forced labourers who worked in harsh conditions. The canal soon became one of the most strategically important waterways in the world, and control over it was the subject of international tension for much of the twentieth century. Today, around twelve per cent of global trade passes through it. Its importance was demonstrated in 2021, when a giant container ship became stuck across the canal for six days, holding up hundreds of vessels and disrupting supply chains worldwide.",
      questions: [
        [
          "According to the passage, the Suez Canal was important for trade because ----.",
          [
            "it greatly reduced the distance between Europe and Asia by sea",
            "it was the first canal ever built in Egypt",
            "it connected the Nile directly to the Mediterranean",
            "it allowed ships to sail around the southern tip of Africa",
            "it was built by the French government alone",
          ],
          "Kanal, Avrupa ile Asya arasındaki gemilerin Afrika'nın güney ucunu dolaşmasını gereksiz kılarak yolculuğu binlerce kilometre kısaltmıştır.",
        ],
        [
          "It can be understood from the passage that the idea of a canal between the two seas ----.",
          [
            "had existed long before the modern canal was built",
            "was first suggested by Ferdinand de Lesseps",
            "was rejected by Egyptian rulers for centuries",
            "became possible only after 1869",
            "was opposed by the workers who built it",
          ],
          "Metne göre iki denizi bağlama fikri eskidir; tarihin çeşitli dönemlerinde Nil'i Kızıldeniz'e bağlayan kanallar yapılmıştır.",
        ],
        [
          "The passage states that many of the workers who built the canal ----.",
          [
            "were made to work against their will in difficult conditions",
            "were highly paid engineers brought over from France",
            "refused to work in the hot climate",
            "later became wealthy traders in the ports along the canal",
            "worked on the project for only a few months",
          ],
          "Metne göre işçilerin çoğu ağır koşullarda çalışan zorla çalıştırılan işçilerdi.",
        ],
        [
          "The author mentions the events of 2021 in order to ----.",
          [
            "illustrate how much the world economy still depends on the canal",
            "criticise the design of modern container ships",
            "show that the canal is no longer important",
            "explain why the canal was built in the nineteenth century",
            "argue that the canal should be widened immediately",
          ],
          "Dev bir konteyner gemisinin altı gün kanalda sıkışıp küresel tedarik zincirlerini aksatması, kanalın önemini göstermek için verilmiştir.",
        ],
      ],
    },
    {
      text:
        "Carbon capture and storage, often referred to as CCS, is a technology designed to prevent carbon dioxide from reaching the atmosphere. In a typical system, the gas is separated from the emissions of power stations or factories, compressed and transported through pipelines to be stored deep underground, usually in old oil and gas fields or porous rock formations. Supporters argue that CCS is essential for reducing emissions from industries such as cement and steel production, which release carbon dioxide as part of their chemical processes and cannot easily switch to renewable energy. Some go further, suggesting that the technology could be combined with plants grown for fuel to actually remove carbon dioxide from the air. Critics, however, point out that CCS has so far been slow to develop and expensive to operate, and that only a tiny fraction of global emissions is currently captured. They also worry that promises of future carbon capture could be used by polluting industries as an excuse to delay the more difficult task of cutting emissions directly.",
      questions: [
        [
          "According to the passage, in carbon capture and storage, carbon dioxide is ----.",
          [
            "separated from emissions and stored underground",
            "converted into renewable energy in power stations",
            "released slowly into the atmosphere over many years",
            "used to produce cement and steel",
            "absorbed by plants grown near factories",
          ],
          "Metne göre gaz santrallerin ya da fabrikaların emisyonlarından ayrılır, sıkıştırılır ve yerin derinliklerinde depolanmak üzere taşınır.",
        ],
        [
          "Supporters believe that CCS is particularly important for the cement and steel industries because ----.",
          [
            "their production processes release carbon dioxide that renewable energy cannot eliminate",
            "they already use renewable energy for most stages of their production processes",
            "they are located near old oil and gas fields",
            "they produce less carbon dioxide than other industries",
            "their factories are generally too small and old to be modernised at a reasonable cost",
          ],
          "Bu sanayiler kimyasal süreçlerinin bir parçası olarak karbondioksit salar ve kolayca yenilenebilir enerjiye geçemez.",
        ],
        [
          "Which of the following is NOT one of the criticisms of CCS mentioned in the passage?",
          [
            "Stored carbon dioxide often leaks back into the air.",
            "It has developed slowly.",
            "It is costly to run.",
            "It currently captures only a very small share of emissions.",
            "It may be used as an excuse to delay cutting emissions.",
          ],
          "Metinde yavaş gelişme, yüksek maliyet, emisyonların çok küçük bir kısmının yakalanması ve emisyon azaltmayı geciktirme bahanesi geçer; depolanan gazın sızmasından söz edilmez.",
        ],
        [
          "It can be inferred from the passage that the author ----.",
          [
            "presents both the potential benefits and the limitations of CCS",
            "believes that CCS will solve climate change on its own",
            "thinks that CCS should be banned immediately",
            "works for a company that develops CCS technology",
            "has no interest in the issue of carbon emissions",
          ],
          "Yazar önce destekçilerin, sonra eleştirmenlerin görüşlerini aktararak teknolojinin hem olası faydalarını hem de sınırlılıklarını sunar.",
        ],
      ],
    },
    {
      text:
        "For many years, it was widely assumed that the key to a long life lay mainly in our genes. Studies of twins, however, have suggested that genetics accounts for only about a quarter of the variation in how long people live; the rest is determined by lifestyle and environment. Researchers have therefore turned their attention to communities where unusually large numbers of people live past one hundred. These regions, sometimes called 'blue zones', include parts of Japan, Italy, Greece and Costa Rica. Although they are geographically and culturally very different, they share several characteristics. Their inhabitants tend to eat diets based largely on plants, to be physically active as part of their daily routines rather than through formal exercise, and to maintain strong ties with family and community. Many also report having a clear sense of purpose. Some scientists caution that the data on age in certain regions may be unreliable, since birth records were not always accurate. Nevertheless, the lifestyle patterns observed are consistent with evidence from other studies of healthy ageing.",
      questions: [
        [
          "According to the twin studies mentioned in the passage, ----.",
          [
            "genes explain only a minor part of the differences in lifespan",
            "genes are the most important factor in determining how long people live",
            "twins usually live longer than other people",
            "lifestyle has no effect on how long people live",
            "people with long-lived parents always live to be one hundred",
          ],
          "İkiz çalışmaları, genetiğin insanların ne kadar yaşadığındaki farklılığın yalnızca yaklaşık dörtte birini açıkladığını göstermiştir.",
        ],
        [
          "Which of the following is NOT mentioned as a characteristic shared by blue zones?",
          [
            "Regular visits to gyms and fitness centres",
            "A diet consisting mainly of plants",
            "Physical activity built into daily life",
            "Close relationships with family and community",
            "A strong sense of purpose",
          ],
          "Metne göre bu bölgelerde fiziksel etkinlik resmî egzersizle değil günlük rutinin parçası olarak yapılır; spor salonlarına düzenli gitmekten söz edilmez, hatta bu metinle çelişir.",
        ],
        [
          "Some scientists are cautious about blue zones because ----.",
          [
            "the recorded ages of some people may not be accurate",
            "the regions are too different from one another",
            "most inhabitants do not eat healthy diets",
            "the regions have very small populations",
            "genetic factors have not been studied there",
          ],
          "Bazı bilim insanları, doğum kayıtları her zaman doğru olmadığı için bazı bölgelerdeki yaş verilerinin güvenilmez olabileceği uyarısında bulunur.",
        ],
        [
          "It can be concluded from the last sentence that ----.",
          [
            "the lifestyle habits seen in blue zones are supported by other research",
            "the data from blue zones should be ignored completely",
            "other studies have found that diet has no effect on ageing",
            "scientists have proved that blue zones do not exist",
            "people should move to blue zones in order to live longer",
          ],
          "Son cümleye göre gözlemlenen yaşam tarzı örüntüleri sağlıklı yaşlanmaya ilişkin diğer çalışmaların kanıtlarıyla tutarlıdır.",
        ],
      ],
    },
    {
      text:
        "The way we describe directions might seem universal, but languages differ in surprising ways. Speakers of English and Turkish usually describe the position of objects relative to their own bodies, using words such as 'left' and 'right'. In some languages, however, speakers rely instead on fixed geographical directions such as north, south, east and west, even for small objects nearby. A speaker of one Aboriginal language in Australia, for example, might say that there is an ant on your 'south-west leg'. To use such a system, speakers must remain constantly aware of their orientation, and research has shown that they are remarkably good at it, even in unfamiliar buildings. Some researchers argue that this demonstrates how the language we speak can shape the way we think about space. Others are more cautious, suggesting that the environment and culture of a community may influence both its language and its spatial thinking, rather than language influencing thought directly. The debate forms part of a wider discussion about the relationship between language and cognition.",
      questions: [
        [
          "According to the passage, speakers of some languages ----.",
          [
            "describe the location of objects using compass directions rather than left and right",
            "do not have any words for describing directions",
            "use the words 'left' and 'right' more often than English speakers",
            "find it difficult to know where north is",
            "describe only large objects in terms of directions",
          ],
          "Bazı dillerde konuşurlar, yakındaki küçük nesneler için bile 'sol' ve 'sağ' yerine kuzey, güney gibi sabit coğrafi yönleri kullanır.",
        ],
        [
          "The example of the ant on the 'south-west leg' is given to ----.",
          [
            "illustrate how such a system is used in everyday situations",
            "show that some languages have no word for 'leg'",
            "prove that Aboriginal languages are difficult to learn",
            "explain why ants are common in Australia",
            "compare English and Turkish directions",
          ],
          "Bu örnek, sabit coğrafi yönlere dayalı sistemin küçük ve gündelik durumlarda bile nasıl kullanıldığını göstermek için verilmiştir.",
        ],
        [
          "It is stated in the passage that speakers who use fixed directions ----.",
          [
            "are very good at keeping track of their orientation",
            "often get lost in unfamiliar buildings",
            "cannot learn languages that use left and right",
            "use maps more frequently than other people",
            "need special training to use their language",
          ],
          "Araştırmalar bu kişilerin, yabancı binalarda bile yönlerini akılda tutmada dikkat çekici derecede başarılı olduğunu göstermiştir.",
        ],
        [
          "The researchers who are 'more cautious' believe that ----.",
          [
            "culture and environment may affect both language and spatial thinking",
            "language has no connection with the way people think",
            "all languages describe directions in the same way",
            "spatial thinking is determined entirely by language",
            "the research on Aboriginal languages was carried out incorrectly",
          ],
          "Daha temkinli araştırmacılar, bir topluluğun çevresi ve kültürünün hem dilini hem uzamsal düşüncesini etkileyebileceğini, dilin düşünceyi doğrudan etkilemeyebileceğini öne sürer.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "Gizem: I've been invited to give a talk at a conference, but I'm terrified of public speaking.\nTuna: ----\nGizem: That's true, I do. Maybe I'm just nervous because the audience will be much bigger.\nTuna: Exactly. Prepare well, practise in front of a few friends, and you'll be fine.",
      [
        "But you give presentations to your team at work all the time, don't you?",
        "Why don't you just refuse the invitation then?",
        "How many people are going to attend the conference?",
        "I'd be terrified too. I hate speaking in public.",
        "When is the conference taking place?",
      ],
      "Gizem'in 'Doğru, yapıyorum. Belki sadece dinleyici daha kalabalık olacağı için gerginim' cevabı, Tuna'nın onun zaten iş yerinde sunum yaptığını hatırlattığını gösterir.",
    ],
    [
      "Passenger: Excuse me, is this the right platform for the train to Izmir?\nStaff: ----\nPassenger: Oh no! How long will I have to wait for the next one?\nStaff: Only about twenty minutes. It leaves from platform three.",
      [
        "It is, but I'm afraid the train has just left.",
        "Yes, and it's due to arrive in two minutes.",
        "The ticket office is at the end of the hall.",
        "You can buy a ticket from the machine over there.",
        "Trains to Izmir are usually very crowded.",
      ],
      "Yolcunun 'Eyvah! Bir sonrakini ne kadar bekleyeceğim?' tepkisi, trenin az önce kalktığını öğrendiğini gösterir.",
    ],
    [
      "Mother: You've been on your computer all afternoon. Have you done your homework?\nSon: ----\nMother: Really? Then why do you still have your history book open on the desk?\nSon: Well, I've done most of it. I just have one more question to answer.",
      [
        "Yes, I finished it hours ago.",
        "No, I haven't started it yet.",
        "I don't have any homework this week.",
        "Can you help me with my maths homework?",
        "I'll do it after dinner, I promise.",
      ],
      "Annenin 'Gerçekten mi? O zaman tarih kitabın neden hâlâ açık?' sorusu, oğlunun ödevini çoktan bitirdiğini iddia ettiğini gösterir.",
    ],
    [
      "Engineer: I think we should use a different material for the roof.\nArchitect: ----\nEngineer: Because the current design is too heavy for the walls to support safely.\nArchitect: I see. Let's look at some lighter options, then.",
      [
        "Why? What's wrong with the one we've chosen?",
        "Which company supplies the material we're using?",
        "How long will it take to build the roof?",
        "Have you discussed this with the client?",
        "Do you think the walls should be painted white?",
      ],
      "Mühendisin 'Çünkü mevcut tasarım duvarların güvenle taşıyamayacağı kadar ağır' cevabı, mimarın neden farklı malzeme gerektiğini sorduğunu gösterir.",
    ],
    [
      "İrem: I can't decide whether to study medicine or law.\nBora: ----\nİrem: I think medicine. I've always been fascinated by how the human body works.\nBora: Then that's your answer. You should choose what you're passionate about.",
      [
        "Which subject do you find more interesting?",
        "Which job pays a higher salary?",
        "Where are you planning to study?",
        "How long does it take to become a lawyer?",
        "What do your parents want you to do?",
      ],
      "İrem'in 'Bence tıp; insan vücudunun nasıl çalıştığı beni hep büyülemiştir' cevabı ve Bora'nın 'tutkulu olduğun şeyi seçmelisin' sonucu, hangi konunun daha ilgi çekici olduğunun sorulduğunu gösterir.",
    ],
  ],
  restatement: [
    [
      "The scientist's theory was ridiculed at first, but it eventually gained widespread acceptance.",
      [
        "Although people initially laughed at the scientist's theory, it came to be widely accepted.",
        "The scientist's theory was widely accepted at first, but it was later rejected.",
        "The scientist ridiculed the theory before eventually accepting it.",
        "The scientist's theory has never been accepted by other scientists.",
        "Because the theory was ridiculed, the scientist decided to abandon it.",
      ],
      "Kuram önce alaya alınmış, ama sonunda geniş kabul görmüştür. Diğer seçenekler sırayı, özneyi ya da sonucu değiştirir.",
    ],
    [
      "There was no need for you to bring an umbrella, as the forecast had predicted sunshine.",
      [
        "You needn't have brought an umbrella because sunny weather had been forecast.",
        "You should have brought an umbrella because rain had been forecast.",
        "You brought an umbrella although the forecast predicted rain.",
        "You couldn't bring an umbrella because the forecast was wrong.",
        "You must bring an umbrella in case the forecast is wrong.",
      ],
      "'There was no need for you to bring' = 'You needn't have brought' (getirmene gerek yoktu, ama getirdin).",
    ],
    [
      "The film was far more enjoyable than I had expected.",
      [
        "I enjoyed the film much more than I thought I would.",
        "I had expected the film to be more enjoyable than it was.",
        "The film was as enjoyable as I had expected.",
        "I didn't enjoy the film as much as I had hoped.",
        "I expected to enjoy the film, but it was disappointing.",
      ],
      "'far more enjoyable than I had expected' = 'beklediğimden çok daha keyifliydi'.",
    ],
    [
      "It is thought that the fire was started deliberately.",
      [
        "The fire is believed to have been started on purpose.",
        "The fire was started by accident, according to the police.",
        "Nobody knows how the fire started or who started it.",
        "The fire will probably be started deliberately.",
        "Someone thought about starting the fire but did not.",
      ],
      "'It is thought that the fire was started' = 'The fire is believed to have been started'; 'deliberately' = 'on purpose'.",
    ],
  ],
  paragraph: [
    [
      "The word 'robot' was first used in a play written by the Czech author Karel Čapek in 1920. ---- In the play, robots are artificial workers who eventually rebel against their human creators. Since then, the idea of machines turning against humanity has become a recurring theme in science fiction.",
      [
        "It comes from a Czech word meaning 'forced labour'.",
        "Today, robots are widely used in factories around the world.",
        "Many people fear that robots will take their jobs in the future.",
        "The first industrial robot was installed in 1961.",
        "Čapek also wrote novels and travel books.",
      ],
      "Boşluktan önce 'robot' kelimesinin ilk kullanımından söz edilir; boşluğa kelimenin kökenini açıklayan ve oyundaki 'işçi' rolüne bağlanan cümle gelir.",
    ],
    [
      "Many people believe that goldfish have a memory span of only three seconds. ---- In one experiment, goldfish were trained to push a lever to receive food, and they continued to do so for weeks. Other studies have shown that they can learn to associate particular sounds or colours with feeding time.",
      [
        "However, experiments have shown that they can actually remember things for months.",
        "Goldfish are among the most popular pets in the world.",
        "They were first bred in China more than a thousand years ago.",
        "Goldfish can grow much larger in ponds than in small bowls.",
        "Some fish species can live for more than fifty years.",
      ],
      "Boşluk yaygın bir inanç ile onu çürüten deneyler arasında yer alır; 'However, experiments have shown ...' cümlesi geçişi sağlar.",
    ],
    [
      "In the past, maps were often deliberately inaccurate. Mapmakers sometimes included 'trap streets', fictional roads that did not exist in reality. ---- If a competitor's map contained the same imaginary street, it was clear evidence that the map had been copied.",
      [
        "These were intended to help them detect when others had copied their work.",
        "Most maps at that time were drawn by hand on paper.",
        "Many travellers became lost because of these mistakes.",
        "Today, satellite images make maps much more accurate.",
        "Some cities have changed the names of their streets several times.",
      ],
      "Boşluktan sonra rakibin haritasında aynı hayalî sokağın bulunmasının kopyalama kanıtı olduğu söylenir; boşluğa bu sokakların amacını açıklayan cümle gelir.",
    ],
    [
      "Spending time outdoors in childhood may help to protect against short-sightedness. In recent decades, the proportion of children who need glasses has risen sharply in many countries, especially in East Asia. ---- As a result, some schools have started to give children more time outside during the school day.",
      [
        "Researchers believe this is partly because children spend more time indoors studying and using screens, and less time in natural light.",
        "Glasses are thought to have been invented in Italy in the thirteenth century, probably by craftsmen working with glass.",
        "Many adults also need glasses when they reach middle age.",
        "Contact lenses have become far more popular than glasses among teenagers and young adults in recent years.",
        "Eye tests are now free for children in many countries.",
      ],
      "Boşluktan sonra okulların çocuklara dışarıda daha fazla zaman tanıdığı sonucu verilir; boşluğa bunun nedenini (içeride daha çok zaman, daha az doğal ışık) açıklayan cümle gelmelidir.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "The olive tree has been cultivated in the Mediterranean region for at least six thousand years.",
        "It is extremely resilient and can survive drought, poor soil and even fire.",
        "Some olive trees are believed to be more than two thousand years old and still produce fruit.",
        "Olive oil was used not only in cooking but also as fuel for lamps and in religious ceremonies.",
        "Spain is also famous for its oranges, which are exported to many countries.",
      ],
      odd: 4,
      why: "Parça zeytin ağacının tarihini, dayanıklılığını ve kullanım alanlarını anlatır. V. cümle İspanya portakallarına geçerek konudan sapar.",
    },
    {
      sentences: [
        "Insomnia is one of the most common sleep disorders, affecting around one in ten adults.",
        "It is often linked to stress, anxiety or irregular sleeping habits.",
        "Dreams usually occur during a stage of sleep known as REM sleep.",
        "Doctors increasingly recommend a form of talking therapy rather than sleeping pills as the first treatment.",
        "This therapy helps patients change the thoughts and behaviours that keep them awake.",
      ],
      odd: 2,
      why: "Parça uykusuzluğu ve tedavisini anlatır. III. cümle rüyaların hangi uyku evresinde görüldüğüne geçerek akışı bozar.",
    },
    {
      sentences: [
        "The Hubble Space Telescope was launched in 1990 and has since become one of the most productive scientific instruments ever built.",
        "Because it orbits above the Earth's atmosphere, it can take much sharper images than telescopes on the ground.",
        "Astronauts have visited it several times to repair and upgrade its equipment.",
        "Its observations have helped scientists estimate the age of the universe more precisely.",
        "Many children dream of becoming astronauts when they grow up.",
      ],
      odd: 4,
      why: "Parça Hubble Uzay Teleskobu'nu ve katkılarını anlatır. V. cümle çocukların astronot olma hayaline geçerek konudan uzaklaşır.",
    },
    {
      sentences: [
        "Composting is a simple way to reduce household waste.",
        "Kitchen scraps such as vegetable peelings and coffee grounds can be turned into rich soil within a few months.",
        "This not only reduces the amount of rubbish sent to landfill but also provides a free fertiliser for gardens.",
        "Plastic packaging is one of the main sources of household waste.",
        "Some cities now collect food waste separately to produce compost on a large scale.",
      ],
      odd: 3,
      why: "Parça kompostlamanın faydalarını anlatır. IV. cümle plastik ambalajlara geçerek konudan sapar; V. cümle kompost konusuna geri döner.",
    },
    {
      sentences: [
        "Origami, the Japanese art of paper folding, has inspired a surprising number of engineering inventions.",
        "Engineers have used folding techniques to design solar panels that can be packed tightly for launch into space and then unfolded in orbit.",
        "Paper was invented in China around two thousand years ago.",
        "Similar principles have been applied to medical devices that can be folded to pass through blood vessels.",
        "Even airbags in cars are folded using patterns developed with the help of origami mathematics.",
      ],
      odd: 2,
      why: "Parça origaminin mühendislik buluşlarına ilham vermesini anlatır. III. cümle kâğıdın icadına geçerek akışı bozar.",
    },
  ],
};
