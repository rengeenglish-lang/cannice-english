import type { Deneme } from "./types";

export const DENEME_09: Deneme = {
  no: 9,
  vocab: [
    [
      "The company's latest report paints a ---- picture of its finances, with profits falling for the third year in a row.",
      ["gloomy", "promising", "cheerful", "flattering", "vibrant"],
      "Kârların üç yıl üst üste düşmesi raporun 'kasvetli, karamsar' (gloomy) bir tablo çizdiğini gösterir. Diğer sıfatlar olumlu bir tablo anlatır.",
    ],
    [
      "Without regular maintenance, even the most advanced machines will eventually ----.",
      ["deteriorate", "flourish", "accelerate", "multiply", "recover"],
      "Düzenli bakım yapılmazsa makineler 'bozulur, kötüleşir' (deteriorate). 'flourish' (gelişmek) ve 'recover' (iyileşmek) anlamı tersine çevirir.",
    ],
    [
      "The professor's lectures were so ---- that students often stayed behind afterwards to continue the discussion.",
      ["stimulating", "tedious", "repetitive", "confusing", "monotonous"],
      "Öğrencilerin tartışmaya devam etmek için kalması derslerin 'ufuk açıcı, teşvik edici' (stimulating) olduğunu gösterir. Diğerleri sıkıcılık ya da karışıklık bildirir.",
    ],
    [
      "The agreement was reached only after both sides had made significant ----.",
      ["concessions", "accusations", "threats", "errors", "complaints"],
      "Anlaşmaya ancak tarafların önemli 'tavizler' (concessions) vermesiyle varılır. 'accusations' ve 'threats' anlaşmayı zorlaştırır.",
    ],
    [
      "The fire spread so quickly that the residents had no time to ---- any of their belongings.",
      ["save", "waste", "destroy", "examine", "abandon"],
      "Yangının hızla yayılması, sakinlerin eşyalarını 'kurtarmaya' (save) zaman bulamadığını gösterir.",
    ],
    [
      "The government has ---- plans to build a new airport after strong opposition from local residents.",
      ["shelved", "announced", "approved", "accelerated", "finalised"],
      "Yerel halkın güçlü muhalefetinden sonra planların 'rafa kaldırılması' (shelve) anlamlıdır. 'approved' ve 'accelerated' muhalefetin sonucuyla çelişir.",
    ],
  ],
  grammar: [
    [
      "The new hospital ---- by the time the old one closes next spring.",
      ["will have been completed", "has been completed", "is completed", "had been completed", "completes"],
      "Gelecekteki bir zamandan (next spring) önce tamamlanmış olacak edilgen bir eylem: future perfect passive 'will have been completed'.",
    ],
    [
      "I remember ---- this film when I was a child, but I can't recall how it ends.",
      ["watching", "to watch", "watch", "to have watched it", "watched"],
      "'remember + -ing' geçmişte yapılan bir şeyi hatırlamayı anlatır: 'remember watching'.",
    ],
    [
      "The athlete, ---- won three gold medals at the last Olympics, has announced her retirement.",
      ["who", "whose", "which", "whom", "that"],
      "Virgüllü ilgi cümlesinde insanı niteleyen ve özne görevindeki ilgi zamiri 'who' olur.",
    ],
    [
      "---- the road had been repaired, traffic moved much more smoothly.",
      ["Now that", "Unless", "Even if", "In case", "As though"],
      "'Now that' (artık … olduğuna göre, … olunca) yolun onarılmasının sonucunu bağlar. 'Unless' ve 'Even if' koşul/zıtlık bildirir.",
    ],
    [
      "Seldom ---- a politician admit so openly that he had made a mistake.",
      ["has the public heard", "the public has heard", "heard the public", "the public heard", "did the public heard"],
      "'Seldom' cümle başında devrik yapı gerektirir: 'has the public heard'.",
    ],
    [
      "The report, ---- in several languages, will be distributed to all member states.",
      ["published", "publishing", "which publishes", "to have published", "is published"],
      "Rapor yayımlandığı için edilgen anlamlı kısaltılmış ilgi cümlesi gerekir: 'published in several languages'.",
    ],
    [
      "If it ---- for the volunteers, the festival could not have taken place.",
      ["hadn't been", "wasn't", "isn't", "wouldn't be", "hasn't been"],
      "'If it hadn't been for ...' (… olmasaydı) üçüncü tip koşul kalıbıdır ve 'could not have taken place' ile uyumludur.",
    ],
    [
      "The more we learn about the universe, ---- we realise how little we know.",
      ["the more", "more", "the most", "so more", "much more"],
      "'The more ..., the more ...' karşılaştırma kalıbı.",
    ],
    [
      "She has been working at the company ---- 2015, when she joined as an intern.",
      ["since", "for", "from", "during", "until"],
      "Bir başlangıç noktası (2015) ve present perfect continuous ile 'since' kullanılır.",
    ],
    [
      "The committee was divided ---- the proposal, with half of its members voting ---- it.",
      ["over / against", "in / with", "by / for", "on / to", "from / on"],
      "'be divided over' (… konusunda bölünmek) ve 'vote against' (… aleyhine oy vermek) kalıpları doğrudur.",
    ],
  ],
  cloze: [
    {
      text:
        "Deep beneath the surface of Antarctica lie layers of ice that have built up over hundreds of thousands of years. As snow falls and is compressed into ice, it traps tiny bubbles of air. {1} scientists drill out long cylinders of this ice, known as ice cores, they can analyse the air inside these bubbles to learn about the composition of the atmosphere in the distant past. The oldest continuous ice core recovered so far covers about eight hundred thousand years. It shows that levels of carbon dioxide have risen and fallen in step with temperature over that period, {2} never exceeding a certain level until the industrial era. Today's concentrations are far higher than any recorded in the ice. Ice cores also contain traces of volcanic ash and dust, {3} allows researchers to identify major eruptions and periods of drought. Scientists are now searching for a site where they hope to recover ice up to one and a half million years old, {4} could help explain why the rhythm of ice ages changed around a million years ago. Such research is difficult and expensive, {5} it offers one of the most reliable records of Earth's past climate.",
      blanks: [
        ["", ["When", "Unless", "Although", "Whereas", "Until"], "Buz karotları çıkarıldığında içlerindeki havanın analiz edilebileceği anlatılır: zaman bildiren 'When'."],
        ["", ["while", "because", "unless", "so that", "if"], "Karbondioksitin sıcaklıkla birlikte inip çıktığı, 'ama/iken' sanayi çağına kadar belli bir düzeyi hiç aşmadığı söylenir: 'while never exceeding'."],
        ["", ["which", "who", "what", "where", "whose"], "Virgülden sonra önceki bilgiye (kül ve toz izleri) gönderme yapan ve özne olan ilgi zamiri 'which' olur."],
        ["", ["which", "where", "when", "who", "whose"], "Boşluk 'ice up to one and a half million years old' ifadesini niteler ve 'could help explain' fiilinin öznesidir: 'which'."],
        ["", ["but", "so", "because", "unless", "as"], "Araştırmanın zor ve pahalı olması ile çok güvenilir bir kayıt sunması zıttır: 'but'."],
      ],
    },
    {
      text:
        "In several countries, cash is rapidly disappearing from everyday life. In Sweden, for example, fewer than one in ten purchases is now paid for with notes and coins, and many shops no longer accept cash at all. Supporters of this trend argue that digital payments are faster, safer and more convenient. They also make it harder for criminals to hide money, {1} every transaction leaves an electronic record. Critics, however, warn that a cashless society carries significant risks. Older people and those {2} limited access to the internet or bank accounts may find themselves excluded from basic services. There are also concerns about privacy, as digital payments allow banks and governments to track people's spending in detail. {3}, a society that depends entirely on electronic systems could be paralysed by a power cut or cyberattack. For these reasons, some governments that once encouraged the move away from cash have begun to require banks to continue {4} cash services. The debate is not so much about whether digital payments will grow {5} about how to protect those who are left behind.",
      blanks: [
        ["", ["since", "although", "unless", "whereas", "until"], "Her işlemin elektronik kayıt bırakması, suçluların parayı saklamasını zorlaştırmasının nedenidir: 'since'."],
        ["", ["with", "for", "from", "by", "of"], "'those with limited access' = 'erişimi sınırlı olanlar'; 'with' sahip olmayı bildirir."],
        ["", ["Moreover", "Instead", "Otherwise", "In contrast", "Nonetheless"], "Gizlilik kaygısından sonra yeni bir risk eklenir: 'Moreover' (ayrıca)."],
        ["", ["providing", "to providing", "provided", "provide of", "having provide"], "'continue + -ing' ya da 'continue to' yapılabilir; seçeneklerde doğru olan 'continue providing'dir."],
        ["", ["as", "than", "but", "so", "that"], "'not so much about A as about B' (A'dan çok B ile ilgili) kalıbı 'as' ile tamamlanır."],
      ],
    },
  ],
  completion: [
    [
      "----, the number of bookshops in the city has actually increased in recent years.",
      [
        "Despite predictions that online retailers would put them out of business",
        "Because most people now prefer to read books on electronic devices",
        "Since the price of printed books has risen sharply over the past decade",
        "As long as publishers continue to reduce the number of printed copies",
        "So that readers could find a wider range of books in their neighbourhood",
      ],
      "'actually increased' (aslında arttı) beklentinin tersine bir durumu gösterir: çevrimiçi satıcıların kitapçıları işsiz bırakacağı tahminlerine rağmen. Diğerleri artışı açıklamaz ya da onunla çelişir.",
    ],
    [
      "The team would have won the match ----.",
      [
        "if their best player had not been injured in the first half",
        "because they had trained harder than their opponents all season",
        "unless the referee makes any serious mistakes in the second half",
        "although most of their supporters had left the stadium early",
        "whereas the other team had scored two goals before half-time",
      ],
      "'would have won' üçüncü tip koşul sonucudur ve 'if + past perfect' ister.",
    ],
    [
      "Children who read for pleasure tend to do better at school ----.",
      [
        "not only in language subjects but also in mathematics",
        "which their parents had bought for them as presents",
        "unless their teachers give them too much homework",
        "although most of them prefer playing computer games",
        "so that they had been able to enter good universities",
      ],
      "Okul başarısının kapsamı 'not only ... but also' ile verilir: yalnızca dil derslerinde değil matematikte de.",
    ],
    [
      "Although the medicine relieved her pain, ----.",
      [
        "it also caused side effects that made her feel extremely tired",
        "she felt much better within a few hours of taking it",
        "her doctor was pleased with how well she had recovered",
        "it was the most effective treatment she had ever received",
        "she was able to return to work the next morning",
      ],
      "'Although' zıtlık ister: ilaç ağrısını hafifletse de aşırı yorgunluk veren yan etkilere yol açtı. Diğerleri olumlu bilgiyi sürdürür.",
    ],
    [
      "The city council has banned cars from the historic centre ----.",
      [
        "in an attempt to reduce pollution and protect its ancient buildings",
        "which had been closed to visitors for most of the previous year",
        "although residents had asked for more parking spaces near their homes",
        "unless drivers had been given special permits by the police",
        "even though air quality had improved dramatically over the decade",
      ],
      "Yasağın amacı: kirliliği azaltmak ve tarihî binaları korumak. 'which had been closed' öncülüne bağlanamaz; diğerleri amaç bildirmez.",
    ],
    [
      "It was not until she moved abroad ----.",
      [
        "that she realised how much she had taken her family for granted",
        "when she had learned to speak three foreign languages fluently",
        "because she wanted to find a better job in another country",
        "which was the most difficult decision she had ever made",
        "although her friends had advised her not to leave home",
      ],
      "'It was not until ... that ...' kalıbı 'that' ile tamamlanır.",
    ],
    [
      "Many economists believe that the recession could have been avoided ----.",
      [
        "had the central bank raised interest rates more gradually",
        "because unemployment had fallen to its lowest level in years",
        "unless the government reduces public spending next year",
        "which most companies had predicted several months earlier",
        "even though the economy had been growing very quickly",
      ],
      "'could have been avoided' üçüncü tip koşul sonucudur; devrik koşul 'had the central bank raised' uyumludur.",
    ],
    [
      "As more and more people move to cities, ----.",
      [
        "the demand for affordable housing in urban areas continues to grow",
        "most villages had been abandoned by the end of the last century",
        "the countryside would have become much more crowded than before",
        "farmers were encouraged to grow crops for export",
        "cities were designed mainly for cars rather than people",
      ],
      "'As' burada 'giderek … oldukça' anlamında paralel bir değişim bildirir ve geniş zamanla uyum ister: kentlerde uygun fiyatlı konut talebi artmaya devam ediyor.",
    ],
    [
      "The novel is set in a small fishing village ----.",
      [
        "where the author spent the summers of her childhood",
        "which the author had visited it many times before",
        "whose the author spent her childhood summers",
        "that the author spent her childhood summers there",
        "when the author had written most of her books",
      ],
      "'village' yer ismini niteleyen ve ardından tam cümle alan ilgi zamiri 'where' olur. Diğerleri yapıyı bozar.",
    ],
    [
      "No sooner had the concert started ----.",
      [
        "than the power went off and the hall was plunged into darkness",
        "when the audience had already begun to leave the hall",
        "because the singer had arrived more than an hour late",
        "so that the organisers decided to refund all the tickets",
        "while the musicians were still tuning their instruments",
      ],
      "'No sooner ... than' sabit kalıbı 'than' ile tamamlanır.",
    ],
  ],
  enTr: [
    [
      "The discovery has forced scientists to reconsider long-held assumptions about how the earliest humans spread across the continents.",
      [
        "Bu keşif, bilim insanlarını ilk insanların kıtalara nasıl yayıldığına ilişkin uzun süredir benimsenen varsayımları yeniden gözden geçirmeye zorlamıştır.",
        "Bilim insanları, ilk insanların kıtalara nasıl yayıldığına ilişkin varsayımlarını kanıtlamak için bu keşfi yapmıştır.",
        "Bu keşif, ilk insanların kıtalara yayılma biçimiyle ilgili uzun süredir bilinen gerçekleri doğrulamıştır.",
        "İlk insanların kıtalara nasıl yayıldığına dair varsayımlar, bilim insanlarını yeni keşifler yapmaya zorlamıştır.",
        "Bilim insanları, bu keşfe rağmen ilk insanların kıtalara yayılmasıyla ilgili varsayımlarını değiştirmemiştir.",
      ],
      "'has forced scientists to reconsider long-held assumptions' = 'bilim insanlarını uzun süredir benimsenen varsayımları yeniden gözden geçirmeye zorlamıştır'. Diğerleri neden-sonuç ilişkisini tersine çevirir ya da değişikliği inkâr eder.",
    ],
    [
      "Unless urgent measures are taken, the number of people without access to clean drinking water is expected to double within the next twenty years.",
      [
        "Acil önlemler alınmazsa temiz içme suyuna erişimi olmayan insan sayısının önümüzdeki yirmi yıl içinde iki katına çıkması beklenmektedir.",
        "Acil önlemler alındığı için temiz içme suyuna erişimi olmayan insan sayısı yirmi yıl içinde yarıya inecektir.",
        "Temiz içme suyuna erişimi olmayan insan sayısı son yirmi yılda iki katına çıktığı için acil önlemler alınmaktadır.",
        "Önümüzdeki yirmi yıl içinde acil önlemler alınsa bile temiz suya erişimi olmayanların sayısı artmaya devam edecektir.",
        "Temiz içme suyu sorununun çözülmesi için önümüzdeki yirmi yıl içinde iki kat daha fazla önlem alınması gerekmektedir.",
      ],
      "'Unless urgent measures are taken' = 'acil önlemler alınmazsa'; 'is expected to double within the next twenty years' = 'önümüzdeki yirmi yıl içinde iki katına çıkması beklenmektedir'.",
    ],
    [
      "It is no coincidence that the regions with the highest rates of literacy are also those with the strongest economies.",
      [
        "Okuryazarlık oranlarının en yüksek olduğu bölgelerin aynı zamanda en güçlü ekonomilere sahip bölgeler olması bir tesadüf değildir.",
        "Okuryazarlık oranları yüksek bölgelerin güçlü ekonomilere sahip olması büyük ölçüde tesadüflere bağlıdır.",
        "En güçlü ekonomilere sahip bölgeler, okuryazarlık oranlarını artırmak için büyük yatırımlar yapmaktadır.",
        "Okuryazarlık oranlarının yükselmesi, ekonomisi güçlü bölgelerde bile tesadüfen gerçekleşmiştir.",
        "Ekonomisi zayıf bölgelerde okuryazarlık oranlarının düşük olmasının nedeni henüz bilinmemektedir.",
      ],
      "'It is no coincidence that ...' = '... bir tesadüf değildir'; 'those with the strongest economies' = 'en güçlü ekonomilere sahip olanlar'.",
    ],
  ],
  trEn: [
    [
      "Yeni yasa, işverenlerin çalışanlarına esnek çalışma saatleri sunmasını zorunlu hâle getirmektedir.",
      [
        "The new law makes it compulsory for employers to offer their employees flexible working hours.",
        "The new law prevents employers from offering their employees flexible working hours.",
        "Under the new law, employees can choose whether to work flexible hours or not.",
        "The new law encourages employees to ask their employers for flexible working hours.",
        "Employers have asked for a new law that would make flexible working hours compulsory.",
      ],
      "'esnek çalışma saatleri sunmasını zorunlu hâle getirmektedir' = 'makes it compulsory for employers to offer ... flexible working hours'.",
    ],
    [
      "Bazı bilim insanları, dinozorların yok oluşunun tek bir olaydan değil, birkaç etkenin bir araya gelmesinden kaynaklandığını öne sürmektedir.",
      [
        "Some scientists suggest that the extinction of the dinosaurs resulted not from a single event but from a combination of several factors.",
        "Some scientists suggest that a single event was responsible for the extinction of the dinosaurs.",
        "Some scientists claim that several factors helped the dinosaurs to survive a single catastrophic event.",
        "According to most scientists, the dinosaurs became extinct because of several separate events.",
        "Some scientists have proved that the extinction of the dinosaurs had nothing to do with a single event.",
      ],
      "'tek bir olaydan değil, birkaç etkenin bir araya gelmesinden kaynaklandığını öne sürmektedir' = 'suggest that ... resulted not from a single event but from a combination of several factors'.",
    ],
    [
      "Ziyaretçi sayısındaki ani artış, adanın kırılgan ekosistemi üzerinde ciddi bir baskı oluşturmuştur.",
      [
        "The sudden increase in the number of visitors has put serious pressure on the island's fragile ecosystem.",
        "The island's fragile ecosystem has caused a sudden increase in the number of visitors.",
        "The number of visitors to the island has fallen because its ecosystem is fragile.",
        "Visitors have been banned from the island in order to protect its fragile ecosystem.",
        "The island's ecosystem has become stronger despite the increase in visitors.",
      ],
      "'Ziyaretçi sayısındaki ani artış' = 'The sudden increase in the number of visitors'; 'ciddi bir baskı oluşturmuştur' = 'has put serious pressure on'.",
    ],
  ],
  reading: [
    {
      text:
        "Humans are the only animals that cook their food, and some researchers believe that this habit has played a central role in our evolution. According to one influential theory, our ancestors began to control fire and cook food at least a million years ago. Cooking makes food softer and easier to digest, allowing the body to extract far more energy from the same amount of food. Supporters of the theory argue that this extra energy made it possible for the human brain, which consumes around a fifth of the body's energy, to grow larger. They also point out that cooking may explain why humans have smaller teeth, jaws and digestive systems than other primates; we simply do not need them to process raw food. Critics accept that cooking was important but question the timing. Clear evidence of the regular use of fire, such as hearths, appears in the archaeological record much later than one million years ago, although traces of fire that early have been found at a few sites.",
      questions: [
        [
          "According to the theory described in the passage, cooking ----.",
          [
            "may have provided the extra energy needed for the brain to grow",
            "was first practised by humans only a few thousand years ago",
            "made food much harder for early humans to digest",
            "caused humans to develop larger teeth and jaws",
            "was used mainly to protect food from animals",
          ],
          "Kurama göre pişirme, yiyeceklerden çok daha fazla enerji elde edilmesini sağlamış ve bu ek enerji beynin büyümesini mümkün kılmıştır.",
        ],
        [
          "It is stated in the passage that the human brain ----.",
          [
            "uses about twenty per cent of the body's energy",
            "is smaller than the brains of other primates",
            "requires raw food in order to develop properly",
            "stopped growing when humans began to cook",
            "uses very little energy compared with other organs",
          ],
          "Metne göre insan beyni vücut enerjisinin yaklaşık beşte birini tüketir.",
        ],
        [
          "Supporters of the theory use the size of human teeth and digestive systems as evidence that ----.",
          [
            "humans adapted to eating food that had been softened by cooking",
            "early humans ate mainly raw meat and plants",
            "humans are closely related to all other primates",
            "cooking was invented only very recently",
            "fire was used mainly for warmth rather than cooking",
          ],
          "Daha küçük diş, çene ve sindirim sistemi, pişmiş yumuşak yiyeceklerle beslenmeye uyum sağlandığının ve çiğ yiyecekleri işlemek için bunlara ihtiyaç kalmadığının kanıtı olarak sunulur.",
        ],
        [
          "The critics mentioned in the passage mainly question ----.",
          [
            "when humans began to use fire and cook regularly",
            "whether cooking was important for human evolution at all",
            "whether early humans had larger brains than other primates",
            "why cooking makes food easier to digest",
            "how much energy the human brain consumes",
          ],
          "Eleştirmenler pişirmenin önemini kabul eder ama zamanlamasını sorgular: ateşin düzenli kullanımına dair açık kanıtlar çok daha geç ortaya çıkar.",
        ],
      ],
    },
    {
      text:
        "Most people assume that having more choices makes them happier. In a well-known experiment, however, researchers set up a tasting stand in a supermarket that offered either six or twenty-four varieties of jam. The larger display attracted more visitors, but shoppers who saw only six varieties were around ten times more likely to buy a jar. The researchers concluded that too many options can overwhelm people, a phenomenon now known as 'choice overload'. When faced with a large number of alternatives, people may delay their decision, choose nothing at all or feel less satisfied with the option they eventually select, since they wonder whether one of the others might have been better. Later studies have shown that the effect is not universal. It is strongest when people are unfamiliar with the products, when options are difficult to compare and when the decision feels important. Experts in a particular field, by contrast, often welcome a wide range of choices because they know exactly what they are looking for.",
      questions: [
        [
          "The jam experiment showed that ----.",
          [
            "fewer options led to more purchases even though the larger display attracted more people",
            "shoppers preferred the stand with twenty-four varieties and bought more jam there",
            "most shoppers did not like any of the varieties of jam on offer",
            "the number of options had no effect on whether people bought jam",
            "people bought more jam when the stand was placed near the entrance",
          ],
          "Büyük vitrin daha çok ziyaretçi çekmiş, ama yalnızca altı çeşit gören alışverişçilerin kavanoz satın alma olasılığı yaklaşık on kat daha yüksek olmuştur.",
        ],
        [
          "According to the passage, people faced with too many choices may ----.",
          [
            "be less happy with their final decision",
            "always choose the most expensive option",
            "make their decision more quickly",
            "feel more confident about what they buy",
            "prefer to shop in larger supermarkets",
          ],
          "Çok sayıda seçenekle karşılaşan insanlar kararı erteleyebilir, hiçbir şey seçmeyebilir ya da sonunda seçtikleri seçenekten daha az memnun kalabilir.",
        ],
        [
          "It can be understood from the passage that choice overload is most likely to occur when ----.",
          [
            "people do not know much about the products and find them hard to compare",
            "people are experts who know exactly what they want",
            "the decision is unimportant and the products are familiar",
            "only a small number of options are available",
            "shoppers have plenty of time to make their decision",
          ],
          "Metne göre etki, insanlar ürünlere yabancı olduğunda, seçenekleri karşılaştırmak zor olduğunda ve karar önemli hissedildiğinde en güçlüdür.",
        ],
        [
          "The author mentions experts in the last sentence in order to ----.",
          [
            "show that a large number of choices is not a problem for everyone",
            "argue that experts should help shoppers make decisions",
            "prove that the jam experiment was carried out incorrectly",
            "explain why supermarkets offer so many products",
            "suggest that experts are rarely satisfied with their choices",
          ],
          "Uzmanların geniş seçenek yelpazesini memnuniyetle karşılaması, aşırı seçenek etkisinin evrensel olmadığını gösterir.",
        ],
      ],
    },
    {
      text:
        "The Library of Alexandria, founded in Egypt in the third century BC, is often remembered as the greatest library of the ancient world. It is said to have contained hundreds of thousands of scrolls and attracted scholars from across the Mediterranean, who made important advances in mathematics, astronomy and medicine. Its destruction is frequently presented as a single catastrophic event, usually a fire, in which much of ancient knowledge was lost in a day. Historians now believe that the reality was more gradual. The library suffered damage on several occasions, including a fire during a war in 48 BC, but it seems to have continued operating for centuries afterwards. Its decline was probably caused mainly by a lack of funding and political support, as successive rulers showed less interest in scholarship and scholars moved elsewhere. Moreover, many of its texts had been copied and existed in other libraries. The popular story of a single dramatic fire, historians argue, says more about our desire for simple explanations than about what actually happened.",
      questions: [
        [
          "According to the passage, the destruction of the Library of Alexandria is often described as ----.",
          [
            "a sudden event in which a great deal of knowledge was lost at once",
            "a slow process that took several centuries to complete",
            "the result of scholars moving to other cities",
            "a decision made by rulers who disliked scholarship",
            "an accident caused by scholars working with fire",
          ],
          "Yıkımı sıklıkla tek bir felaket olayı, genellikle bir yangın olarak ve antik bilginin çoğunun bir günde kaybolduğu biçimde sunulur.",
        ],
        [
          "Historians now believe that the library ----.",
          [
            "continued to function for a long time after it was first damaged",
            "was destroyed completely in a fire in 48 BC",
            "never contained as many scrolls as was claimed",
            "was closed because its scholars were unpopular",
            "was rebuilt in another city after the war",
          ],
          "Kütüphane birkaç kez hasar görmüş, ancak MÖ 48'deki yangından sonra da yüzyıllarca faaliyetini sürdürmüş görünmektedir.",
        ],
        [
          "According to the passage, the main cause of the library's decline was probably ----.",
          [
            "a gradual loss of money and political interest",
            "a single fire during a war",
            "an earthquake that damaged the building",
            "the theft of its most valuable scrolls",
            "competition from libraries in Rome",
          ],
          "Düşüşün muhtemelen esas nedeni, birbirini izleyen yöneticilerin bilime daha az ilgi göstermesiyle finansman ve siyasi destek eksikliğidir.",
        ],
        [
          "The author suggests in the last sentence that the popular story of the fire ----.",
          [
            "reflects people's preference for simple explanations",
            "has been confirmed by recent archaeological evidence",
            "was invented by scholars working in the library",
            "is the most accurate account of what happened",
            "explains why ancient texts were copied",
          ],
          "Tarihçilere göre tek bir dramatik yangın hikâyesi, gerçekte ne olduğundan çok bizim basit açıklamalara duyduğumuz istek hakkında bilgi verir.",
        ],
      ],
    },
    {
      text:
        "Coral reefs are not the only underwater ecosystems under threat. Seagrass meadows, which grow in shallow coastal waters around the world, are disappearing at a rate of around seven per cent a year, according to some estimates. This loss receives far less attention than the decline of coral reefs, perhaps because seagrass looks less spectacular, yet its ecological value is enormous. Seagrass meadows provide nurseries for many species of fish, including some that are important for commercial fishing. Their roots stabilise sediments on the seabed, protecting coastlines from erosion, and their leaves slow down waves. Perhaps most surprisingly, seagrass is extremely effective at storing carbon. Although meadows cover only a tiny fraction of the ocean floor, they are estimated to account for around ten per cent of the carbon buried in ocean sediments each year. The main threats include pollution from farms, which reduces the clarity of the water, coastal construction and damage from boat anchors. Encouragingly, restoration projects in several countries have shown that seagrass can recover quickly when conditions improve.",
      questions: [
        [
          "According to the passage, the loss of seagrass receives less attention than that of coral reefs, possibly because ----.",
          [
            "seagrass is less visually impressive than coral",
            "seagrass is disappearing more slowly than coral",
            "seagrass has little ecological importance",
            "seagrass grows only in a few countries",
            "seagrass cannot be restored once it is lost",
          ],
          "Metne göre bu kayıp, belki deniz çayırları daha az gösterişli göründüğü için mercan resiflerinin azalmasından çok daha az ilgi görür.",
        ],
        [
          "Which of the following is NOT mentioned as a benefit of seagrass meadows?",
          [
            "They provide a source of food for coastal communities.",
            "They offer a safe place for young fish to grow.",
            "They help to prevent coastal erosion.",
            "They reduce the force of waves.",
            "They store large amounts of carbon.",
          ],
          "Metinde yavru balıklar için yuva, kıyı erozyonunu önleme, dalgaları yavaşlatma ve karbon depolama geçer; kıyı toplulukları için doğrudan besin kaynağı olmasından söz edilmez.",
        ],
        [
          "The author describes seagrass's ability to store carbon as surprising because ----.",
          [
            "meadows cover a very small area but store a large share of buried carbon",
            "seagrass grows only in shallow water",
            "most plants in the ocean release carbon",
            "seagrass meadows are disappearing quickly",
            "carbon is harmful to marine life",
          ],
          "Çayırlar okyanus tabanının yalnızca küçük bir kısmını kaplamasına rağmen her yıl okyanus tortullarına gömülen karbonun yaklaşık yüzde onunu oluşturur.",
        ],
        [
          "It can be understood from the last sentence that ----.",
          [
            "efforts to restore seagrass can be successful in suitable conditions",
            "seagrass cannot survive in polluted water at all",
            "restoration projects have failed in most countries",
            "boat anchors are no longer a threat to seagrass",
            "seagrass recovers only after several centuries",
          ],
          "Son cümleye göre birkaç ülkedeki restorasyon projeleri, koşullar iyileştiğinde deniz çayırlarının hızla toparlanabildiğini göstermiştir.",
        ],
      ],
    },
    {
      text:
        "Volunteer computing is a method of carrying out large scientific calculations by using the spare processing power of ordinary people's computers. Participants download a small program that runs in the background or when their computer is idle, analysing pieces of data and sending the results back to a central server. One of the earliest and best-known projects searched radio signals from space for signs of intelligent life; millions of people around the world took part. Since then, volunteer computing has been used to model the shape of proteins, simulate climate change and search for new prime numbers. The combined power of these networks can rival that of the world's largest supercomputers, at a fraction of the cost. However, the approach is not suitable for every problem. It works best when a task can be divided into many small, independent pieces that do not need to communicate with one another. Researchers must also take care to check results, since a small number of participants may return incorrect data, whether by accident or deliberately.",
      questions: [
        [
          "According to the passage, volunteer computing uses ----.",
          [
            "the unused processing capacity of private individuals' computers",
            "supercomputers that are owned by large universities",
            "computers that have been donated to scientific institutions",
            "radio signals from space to carry out calculations",
            "special computers designed only for scientific work",
          ],
          "Gönüllü bilgi işlem, sıradan insanların bilgisayarlarının boş işlem gücünü kullanarak büyük bilimsel hesaplamalar yapma yöntemidir.",
        ],
        [
          "The project that searched radio signals from space is mentioned as ----.",
          [
            "one of the first and most famous examples of volunteer computing",
            "the only project that has used volunteer computing successfully",
            "proof that intelligent life exists elsewhere in the universe",
            "an example of a project that failed to attract participants",
            "a project carried out by a single supercomputer",
          ],
          "Bu proje, en eski ve en bilinen gönüllü bilgi işlem projelerinden biri olarak verilir; dünya çapında milyonlarca kişi katılmıştır.",
        ],
        [
          "According to the passage, volunteer computing is most suitable for tasks that ----.",
          [
            "can be split into many separate parts that do not depend on each other",
            "require constant communication between different computers",
            "must be completed in a single step by one powerful machine",
            "involve only a small amount of data",
            "can be carried out without any central server",
          ],
          "Yöntem en iyi, bir görevin birbiriyle iletişim kurması gerekmeyen çok sayıda küçük ve bağımsız parçaya bölünebildiği durumlarda işe yarar.",
        ],
        [
          "Researchers need to check the results of volunteer computing because ----.",
          [
            "some participants may send back data that is wrong",
            "most volunteers' computers are too slow",
            "the central server often loses data",
            "volunteers are not allowed to see the results",
            "the programs damage participants' computers",
          ],
          "Az sayıda katılımcı, kazara ya da kasıtlı olarak yanlış veri gönderebilir; bu yüzden sonuçlar kontrol edilmelidir.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "Kaan: I've been offered two jobs and I can't decide which one to accept.\nSude: ----\nKaan: The first pays more, but the second is with a company I've always admired.\nSude: In that case, think about where you'd like to be in five years' time.",
      [
        "What's the main difference between the two of them?",
        "When do you have to give them your final answer?",
        "Have you told your current employer about this yet?",
        "Are both of the companies located in this city?",
        "How many interviews did you have for each job?",
      ],
      "Kaan'ın iki iş arasındaki farkı (biri daha çok para veriyor, diğeri hayran olduğu bir şirket) açıklaması, Sude'nin aralarındaki temel farkı sorduğunu gösterir.",
    ],
    [
      "Patient: Doctor, I've been getting headaches almost every afternoon.\nDoctor: ----\nPatient: Quite a lot, actually. I work on a computer for about nine hours a day.\nDoctor: That could be the cause. Try taking regular breaks and having your eyes tested.",
      [
        "How much time do you spend looking at a screen each day?",
        "Have you been sleeping well over the past few weeks?",
        "Do you drink enough water during the working day?",
        "Is there anyone in your family who gets headaches?",
        "Have you taken any medicine for the pain so far?",
      ],
      "Hastanın 'Aslında oldukça fazla; günde dokuz saat bilgisayar başındayım' cevabı, doktorun ekrana ne kadar baktığını sorduğunu gösterir.",
    ],
    [
      "Merve: I can't believe how expensive concert tickets have become.\nOnur: I know. ----\nMerve: That's a good idea. The atmosphere at small venues is often better anyway.\nOnur: Exactly, and the tickets are a fraction of the price.",
      [
        "Why don't we go and see some local bands at smaller venues instead?",
        "I paid more than a hundred euros for my last ticket.",
        "Most of the big concerts sell out within minutes now.",
        "I think the singer is planning a world tour next year.",
        "Have you ever been to a music festival abroad?",
      ],
      "Merve'nin 'İyi fikir; küçük mekânlarda atmosfer zaten daha iyi olur' cevabı, Onur'un küçük mekânlarda yerel grupları izlemeyi önerdiğini gösterir.",
    ],
    [
      "Interviewer: Why do you want to work for our company?\nApplicant: ----\nInterviewer: That's good to hear. Sustainability is a key part of our strategy.\nApplicant: Yes, I read your latest environmental report with great interest.",
      [
        "Mainly because I admire your commitment to reducing environmental impact.",
        "Because your office is very close to where I live.",
        "I've heard that your salaries are higher than average.",
        "A friend of mine works here and recommended the company.",
        "I'd like to gain some experience before starting my own business.",
      ],
      "Görüşmecinin 'Sürdürülebilirlik stratejimizin önemli bir parçası' cevabı, adayın şirketin çevresel taahhüdünden söz ettiğini gösterir.",
    ],
    [
      "Arda: Did you finish the report for the meeting?\nZehra: ----\nArda: Don't worry. The meeting has been moved to Thursday, so you have an extra day.\nZehra: What a relief! I'll have it ready by tomorrow evening.",
      [
        "Not yet, I'm afraid. I still need to add the latest figures.",
        "Yes, I sent it to everyone this morning.",
        "Which meeting are you talking about?",
        "Yes, and I've already printed copies for everyone.",
        "Yes, it's on your desk, next to the coffee machine.",
      ],
      "Arda'nın 'Merak etme, toplantı perşembeye ertelendi; bir günün daha var' cevabı ve Zehra'nın rahatlayıp raporu yarın akşama hazır edeceğini söylemesi, raporun henüz bitmediğini gösterir. Raporun bittiğini söyleyen seçenekler bu akışla çelişir.",
    ],
  ],
  restatement: [
    [
      "The hotel was not nearly as comfortable as the brochure had suggested.",
      [
        "The hotel was far less comfortable than the brochure had made it seem.",
        "The hotel was even more comfortable than the brochure had suggested.",
        "The brochure did not say anything about how comfortable the hotel was.",
        "The hotel was just as comfortable as the brochure had promised.",
        "The brochure was changed because the hotel was so comfortable.",
      ],
      "'not nearly as comfortable as' = 'çok daha az rahat'.",
    ],
    [
      "On no account should passengers leave their luggage unattended.",
      [
        "Passengers must never leave their luggage without anyone watching it.",
        "Passengers may leave their luggage unattended for a short time.",
        "Unattended luggage will be returned to passengers on request.",
        "Passengers should report any luggage that has been left unattended.",
        "Passengers are not responsible for luggage that is unattended.",
      ],
      "'On no account should ...' = 'hiçbir koşulda ... yapmamalı', yani asla.",
    ],
    [
      "The museum is so popular that visitors are advised to book their tickets well in advance.",
      [
        "Because the museum attracts so many people, it is recommended that tickets be booked early.",
        "Visitors to the museum can buy their tickets at the entrance on the day of their visit.",
        "The museum has become less popular since visitors were asked to book tickets.",
        "Tickets for the museum are cheaper if they are booked in advance.",
        "Few people visit the museum because tickets must be booked in advance.",
      ],
      "'so popular that visitors are advised to book well in advance' = 'çok popüler olduğu için biletlerin erkenden alınması önerilir'.",
    ],
    [
      "Much as I admire her work, I cannot agree with her latest conclusions.",
      [
        "Although I greatly respect her work, I do not accept her most recent conclusions.",
        "I admire her latest conclusions more than her earlier work.",
        "I agree with her conclusions because I admire her work so much.",
        "I have never admired her work or agreed with her conclusions.",
        "Her latest conclusions have made me admire her work even more.",
      ],
      "'Much as I admire ...' = 'ne kadar takdir etsem de' (Although I greatly respect ...).",
    ],
  ],
  paragraph: [
    [
      "The bicycle helmet is one of the simplest and most effective pieces of safety equipment ever designed. ---- Despite this evidence, however, many cyclists still choose not to wear one, often because they find helmets uncomfortable or believe that short journeys are not dangerous.",
      [
        "Studies have shown that wearing a helmet can reduce the risk of serious head injury by more than half.",
        "The first bicycles were made of wood and had no pedals at all.",
        "Many cities have built separate lanes for cyclists in recent years.",
        "Cycling is a cheap and healthy way of getting around the city.",
        "Helmets are now available in a wide range of colours and styles.",
      ],
      "Boşluktan sonraki 'Despite this evidence' ifadesi, boşluğa kaskın etkililiğine dair bir kanıt cümlesinin gelmesini gerektirir.",
    ],
    [
      "For centuries, the town's economy depended almost entirely on coal mining. When the last mine closed in the 1990s, unemployment rose sharply and many young people left in search of work. ---- Old mining buildings have been turned into museums and art centres, and the surrounding hills now attract walkers and cyclists from across the country.",
      [
        "In recent years, however, the town has begun to reinvent itself as a destination for tourists.",
        "Coal was one of the main sources of energy during the industrial revolution.",
        "Mining has always been one of the most dangerous occupations in the world.",
        "Many former miners suffered from lung diseases later in life.",
        "The closure of the mine was opposed by the local trade unions.",
      ],
      "Boşluktan sonra madencilik binalarının müzeye dönüştürülmesi ve turistlerin gelmesi anlatılır; boşluğa kasabanın turizm merkezi olarak yeniden doğuşunu tanıtan 'In recent years, however, ...' cümlesi gelmelidir.",
    ],
    [
      "Octopuses, squid and cuttlefish can change the colour of their skin in a fraction of a second. ---- Each of these cells contains a sac of pigment surrounded by muscles; when the muscles contract, the sac is stretched and the colour becomes visible. This ability allows the animals to hide from predators, attract mates and even communicate with one another.",
      [
        "They do this using thousands of special cells in their skin called chromatophores.",
        "These animals are found in oceans all over the world.",
        "Some species of squid can grow to more than ten metres in length.",
        "Cuttlefish are often confused with fish, although they are molluscs.",
        "Many people enjoy eating squid, especially when it is fried.",
      ],
      "Boşluktan sonraki 'Each of these cells' ifadesi, boşluğa bu hücreleri (kromatoforlar) tanıtan cümlenin gelmesini gerektirir.",
    ],
    [
      "When people imagine scientific discoveries, they often picture a lone genius having a sudden moment of inspiration. ---- Most important discoveries are the result of years of work by large teams, building on the findings of many earlier researchers. Even famous breakthroughs usually depended on the efforts of colleagues whose names are rarely remembered.",
      [
        "In reality, however, science rarely works this way.",
        "Isaac Newton is said to have been inspired by a falling apple.",
        "Many scientists work in universities or government laboratories.",
        "Scientific journals publish thousands of articles every year.",
        "Some discoveries have been made completely by accident.",
      ],
      "Boşluk yaygın bir imge (yalnız deha) ile gerçeği (büyük ekipler) karşılaştıran cümleler arasındadır; 'In reality, however, science rarely works this way' geçişi sağlar.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "The Sahara Desert was not always a desert.",
        "Between around eleven thousand and five thousand years ago, it was covered with grasslands, lakes and rivers.",
        "Rock paintings from this period show people herding cattle and hunting animals such as giraffes and elephants.",
        "The Nile is the longest river in Africa.",
        "Changes in the Earth's orbit gradually reduced the rainfall, and the region turned into the desert we know today.",
      ],
      odd: 3,
      why: "Parça Sahra'nın geçmişte yeşil olduğunu ve nasıl çöle dönüştüğünü anlatır. IV. cümle Nil'in uzunluğuna geçerek akışı bozar.",
    },
    {
      sentences: [
        "Many people believe that eating late at night leads to weight gain.",
        "Breakfast is often described as the most important meal of the day.",
        "Research suggests, however, that the total number of calories consumed matters more than the time at which they are eaten.",
        "Nevertheless, eating large meals late in the evening may disturb sleep for some people.",
        "Poor sleep, in turn, has been linked to increased appetite the following day.",
      ],
      odd: 1,
      why: "Parça gece geç yemek yemenin kilo üzerindeki etkisini anlatır. II. cümle kahvaltının önemine geçerek akışı bozar; III. cümledeki 'however' I. cümledeki inanca bağlanır.",
    },
    {
      sentences: [
        "The Eiffel Tower was built for the 1889 World's Fair in Paris.",
        "Many artists and writers of the time criticised it as ugly and argued that it would spoil the city.",
        "It was originally intended to stand for only twenty years before being taken down.",
        "However, it proved useful as a radio transmission tower and was allowed to remain.",
        "Paris has one of the oldest underground railway systems in the world.",
      ],
      odd: 4,
      why: "Parça Eyfel Kulesi'nin yapılışını ve korunmasını anlatır. V. cümle Paris metrosuna geçerek konudan sapar.",
    },
    {
      sentences: [
        "Elephants are known for their remarkable memories.",
        "Older females, who usually lead family groups, can remember the locations of water sources across vast areas.",
        "During droughts, groups led by older females are more likely to survive because they know where to find water.",
        "Elephant ivory has been traded illegally for centuries.",
        "This knowledge is passed on to younger members of the group over many years.",
      ],
      odd: 3,
      why: "Parça fillerin belleğini ve bu bilginin hayatta kalmadaki rolünü anlatır. IV. cümle fildişi kaçakçılığına geçer; V. cümledeki 'This knowledge' III. cümleye bağlanır.",
    },
    {
      sentences: [
        "Daylight saving time, the practice of moving clocks forward in summer, was introduced in many countries during the First World War.",
        "Its aim was to make better use of daylight and save fuel.",
        "Today, however, its benefits are widely debated.",
        "Some studies suggest that the change disrupts sleep and may even increase the risk of accidents in the days that follow.",
        "Many people use the alarm on their phones to wake up in the morning.",
      ],
      odd: 4,
      why: "Parça yaz saati uygulamasını ve tartışmalı faydalarını anlatır. V. cümle insanların telefon alarmı kullanmasına geçerek konudan sapar.",
    },
  ],
};
