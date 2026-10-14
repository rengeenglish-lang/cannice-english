import type { Deneme } from "./types";

export const DENEME_42: Deneme = {
  no: 42,
  vocab: [
    [
      "The company had to ---- several hundred workers when demand for its products fell sharply.",
      ["lay off", "take on", "put up", "look after", "turn up"],
      "Talep düştüğünde işçileri 'işten çıkarmak' 'lay off' ile anlatılır. 'take on' (işe almak) tersini anlatır; diğerleri uymaz.",
    ],
    [
      "Prices rose so ---- that shops had to change the labels on their goods several times a day.",
      ["rapidly", "gradually", "slightly", "rarely", "steadily"],
      "Etiketlerin günde birkaç kez değiştirilmesi fiyatların 'çok hızlı' (rapidly) arttığını gösterir. 'gradually', 'slightly' ve 'steadily' yavaş bir artışı anlatır.",
    ],
    [
      "Small businesses often find it difficult to ---- loans from banks, because they have little to offer as security.",
      ["obtain", "repay", "refuse", "forgive", "cancel"],
      "Teminat gösterecek az şeyleri olduğu için küçük işletmelerin bankalardan kredi 'almakta' (obtain) zorlandığı anlatılır.",
    ],
    [
      "The government's decision to raise taxes was deeply ---- and led to protests in several cities.",
      ["unpopular", "welcome", "generous", "popular", "harmless"],
      "Kararın protestolara yol açması 'hiç sevilmediğini' (unpopular) gösterir. Diğer sıfatlar tepkiyle çelişir.",
    ],
    [
      "Investors who ---- their money across many different companies are less likely to lose everything.",
      ["spread", "hide", "waste", "gather", "lend"],
      "Parayı farklı şirketlere 'yaymak, dağıtmak' (spread) riski azaltır; bu yüzden her şeyi kaybetme olasılıkları düşer.",
    ],
    [
      "The new factory will ---- hundreds of jobs in a region where unemployment is very high.",
      ["create", "destroy", "reduce", "replace", "avoid"],
      "İşsizliğin yüksek olduğu bir bölgede yeni fabrikanın yüzlerce iş 'yaratması' (create) beklenir.",
    ],
  ],
  grammar: [
    [
      "The new coins ---- into circulation next year.",
      ["will be introduced", "will introduce", "are introducing", "have introduced", "introduced"],
      "Madeni paralar dolaşıma 'sokulacak' nesnelerdir; gelecek zamanda edilgen 'will be introduced' gerekir.",
    ],
    [
      "If people saved more money, they ---- less worried about losing their jobs.",
      ["would be", "will be", "had been", "are", "would have been"],
      "İkinci tip koşul (If + saved) ana cümlede 'would + yalın fiil' ister.",
    ],
    [
      "The bank ---- I opened my first account has now closed all its branches in the town.",
      ["where", "which", "what", "whose", "who"],
      "'The bank' ismini niteleyen ve yer bildiren ilgi zarfı gerekir; 'opened' fiilinin nesnesi 'my first account' olduğundan 'where' kullanılır.",
    ],
    [
      "Seldom ---- such a sudden fall in the value of the currency.",
      ["have economists seen", "economists have seen", "economists saw it", "saw economists", "had seen economists"],
      "'Seldom' cümle başında olumsuz anlamlı bir zarf olarak devrik yapı ister: 'have economists seen'.",
    ],
    [
      "The company is said ---- more than a million euros on advertising last year.",
      ["to have spent", "to spend", "spending", "having spent", "that it spent"],
      "'is said' yapısından sonra 'to + fiil' gelir; harcama geçmişte gerçekleştiği için 'to have spent' gerekir.",
    ],
    [
      "By the end of the decade, the city's population ---- by almost a third.",
      ["will have grown", "will grow", "has grown", "is growing", "grew"],
      "'By the end of the decade' gelecekteki bir noktaya kadar tamamlanmış olacak bir değişimi bildirir; future perfect 'will have grown' gerekir.",
    ],
    [
      "You ---- pay in cash; most shops accept cards.",
      ["don't have to", "mustn't", "can't", "shouldn't have", "couldn't"],
      "Nakit ödemek gerekli değildir; gereklilik olmadığını 'don't have to' bildirir. 'mustn't' yasak anlamı verir.",
    ],
    [
      "The entrepreneur, ---- first business failed within a year, later became a millionaire.",
      ["whose", "who", "which", "that", "his"],
      "'first business' girişimciye aittir; iyelik bildiren ilgi zamiri 'whose' gerekir.",
    ],
    [
      "---- the high cost of living, many young people are moving to the city.",
      ["Despite", "Although", "Because", "Unless", "Even though"],
      "Yüksek yaşam maliyetine 'rağmen' gençlerin şehre taşınması zıtlık bildirir; isim öbeğinden önce 'Despite' gerekir.",
    ],
    [
      "The more a product is advertised, ---- people tend to buy it.",
      ["the more", "more", "the most", "so many", "as much"],
      "'The more ..., the more ...' kalıbında ikinci kısım 'the + karşılaştırma' ile kurulur.",
    ],
  ],
  cloze: [
    {
      text:
        "In 1923, Germany experienced one of the most extreme cases of hyperinflation in history. After the First World War, the country was required to pay huge sums to the victorious Allies, and the government responded by printing more and more money. When Germany fell behind with its payments, French and Belgian troops occupied the Ruhr, the country's main industrial region, {1} made the economic situation even worse. Prices began to rise at a staggering rate. A loaf of bread that cost 250 marks in January 1923 cost around 200 billion marks by November. Workers were paid twice a day and rushed to spend their wages before {2} lost their value. Banknotes became so worthless that children used bundles of them as building blocks, and some people burned them for heat, {3} it was cheaper than buying firewood. People who had saved money all their lives found that their savings could not buy even a stamp. The crisis was finally ended by the introduction of a new currency, the Rentenmark, {4} was carefully limited in supply. However, the experience left a deep mark on German society, and many historians believe that the anger and insecurity it caused helped extremist parties to gain support {5} the following decade.",
      blanks: [
        [
          "(17) ----",
          ["which", "what", "who", "it", "where"],
          "Virgülden sonra önceki cümlenin bütününe (Ruhr'un işgali) gönderme yapan, özne görevindeki ilgi zamiri 'which' gerekir.",
        ],
        [
          "(18) ----",
          ["they", "it", "which", "them", "those"],
          "'before' ile başlayan yan cümlenin öznesi olarak 'their wages' (çoğul) ismine gönderme yapan 'they' gerekir.",
        ],
        [
          "(19) ----",
          ["as", "unless", "although", "so that", "until"],
          "Paraları yakmalarının nedeni bunun odun almaktan ucuz olmasıdır; neden bildiren 'as' gerekir.",
        ],
        [
          "(20) ----",
          ["which", "who", "what", "where", "that"],
          "Virgülden sonra 'the Rentenmark' ismini niteleyen ve özne görevindeki ilgi zamiri 'which' gerekir; 'that' virgülden sonra kullanılmaz.",
        ],
        [
          "(21) ----",
          ["during", "while", "since", "until", "among"],
          "Aşırı partilerin sonraki on yıl 'boyunca' destek kazandığı anlatılır; isim öbeğinden önce 'during' gerekir. 'while' cümle ister.",
        ],
      ],
    },
    {
      text:
        "On the small island of Yap, in the western Pacific, people once used one of the most unusual forms of money ever known. It consisted of large discs of limestone, called rai, with a hole in the centre. Some were small enough to carry, {1} the largest were more than three metres across and weighed several tonnes. The stone did not come from Yap itself. It was quarried on the island of Palau, around four hundred kilometres away, and carried back across the open ocean on rafts and canoes, a journey {2} many people lost their lives. Because the stones were so heavy, they were rarely moved. Instead, when one changed hands, everyone in the community simply remembered who the new owner was. According to one famous story, a stone being brought from Palau fell into the sea and sank, but people agreed that it still had value, {3} its owner continued to use it to make payments even though nobody had seen it for years. Economists have used the rai stones to illustrate the idea that money is essentially a shared agreement about value {4} the physical object itself. Today, the stones are no longer used for everyday purchases, {5} they are still exchanged on important occasions such as weddings.",
      blanks: [
        [
          "(22) ----",
          ["while", "because", "so", "unless", "since"],
          "Bazı taşların taşınacak kadar küçük olması ile en büyüklerinin üç metreden geniş olması karşılaştırılır; 'while' gerekir.",
        ],
        [
          "(23) ----",
          ["on which", "which", "where on", "that on", "whose"],
          "Pek çok kişinin hayatını kaybettiği yolculuk 'on which' ile ifade edilir; edat ilgi zamirinden önce gelir.",
        ],
        [
          "(24) ----",
          ["so", "because", "although", "unless", "or"],
          "İnsanların taşın değerli olduğu konusunda anlaşmasının sonucu sahibinin onu ödeme yapmak için kullanmaya devam etmesidir; 'so' gerekir.",
        ],
        [
          "(25) ----",
          ["rather than", "as well as", "such as", "because of", "in addition to"],
          "Paranın fiziksel nesnenin 'kendisinden çok' ortak bir anlaşma olduğu anlatılır; 'rather than' gerekir.",
        ],
        [
          "(26) ----",
          ["but", "so", "because", "or", "unless"],
          "Taşların artık günlük alışverişte kullanılmaması ile önemli günlerde hâlâ değiş tokuş edilmesi arasında zıtlık vardır; 'but' gerekir.",
        ],
      ],
    },
  ],
  completion: [
    [
      "The factory was forced to close ----.",
      [
        "after it lost its biggest customer",
        "because it had more orders than ever",
        "so that it could hire more workers",
        "although its profits were falling",
        "unless the workers agree to lower wages",
      ],
      "Fabrikanın kapanmasının mantıklı nedeni en büyük müşterisini kaybetmesidir.",
    ],
    [
      "Only when the crisis was over ----.",
      [
        "did people start spending again",
        "people started spending again",
        "people had started spending again",
        "started people spending again",
        "people will start spending again",
      ],
      "'Only when ...' cümle başında yer aldığında ana cümle devrik olur; geçmiş zamanda 'did' kullanılır.",
    ],
    [
      "----, the couple decided to buy a smaller flat.",
      [
        "Worried about rising interest rates",
        "Having just won a large lottery prize",
        "Because their family was growing",
        "Unless they can find a bigger one",
        "So that they would have more space",
      ],
      "Daha küçük bir daire alma kararının mantıklı nedeni yükselen faiz oranlarından endişe duymalarıdır.",
    ],
    [
      "If the price of oil rises again, ----.",
      [
        "transport costs will go up",
        "transport costs would have gone up",
        "transport costs went up last year",
        "transport costs had fallen",
        "transport costs are falling",
      ],
      "Birinci tip koşul (If + şimdiki zaman) ana cümlede 'will + yalın fiil' ister.",
    ],
    [
      "Many shops offer discounts in January ----.",
      [
        "to attract customers after the holidays",
        "because people spend most then",
        "although they want to sell less",
        "unless prices rise in December",
        "so that fewer people would come",
      ],
      "Ocak ayında indirim yapmanın mantıklı amacı tatillerden sonra müşteri çekmektir.",
    ],
    [
      "The company's profits have doubled; ----.",
      [
        "as a result, it plans to hire two hundred new staff",
        "for example, it has closed several factories",
        "however, it is making more money than ever",
        "in contrast, it earned twice as much",
        "otherwise, its profits would have doubled",
      ],
      "Şirketin kârı iki katına çıkmıştır; sonuç bildiren 'as a result' ile yeni personel alma planı eklenir.",
    ],
    [
      "The economist, ----, has warned of a coming recession.",
      [
        "whose predictions are usually accurate",
        "that predictions are usually accurate",
        "which predictions are usually accurate",
        "who her predictions are usually accurate",
        "where her predictions are accurate",
      ],
      "Virgüllerle ayrılmış, ekonomisti niteleyen ve 'predictions' ile iyelik bildiren 'whose' doğru yapıdır.",
    ],
    [
      "No sooner had the auction begun ----.",
      [
        "than someone offered a huge sum for the painting",
        "when someone offered a huge sum for the painting",
        "someone had offered a huge sum for the painting",
        "so someone offered a huge sum for the painting",
        "and someone will offer a huge sum for the painting",
      ],
      "'No sooner had ...' kalıbı 'than' ile tamamlanır.",
    ],
    [
      "Although the restaurant's prices are high, ----.",
      [
        "it is fully booked almost every night",
        "its food is very expensive",
        "few people can afford it",
        "the portions are quite small",
        "it is in an expensive area",
      ],
      "'Although' beklentiye ters bir durum ister: fiyatlar yüksek olmasına rağmen restoran neredeyse her gece dolu. Diğer seçenekler pahalılıkla uyumludur.",
    ],
    [
      "The new phone was so expensive ----.",
      [
        "that few people could afford it",
        "because it had a large screen",
        "although it sold very well",
        "which was made in Korea",
        "unless the price falls",
      ],
      "'so ... that' yapısı sonuç ister: yeni telefon o kadar pahalıydı ki pek az kişi alabildi.",
    ],
  ],
  enTr: [
    [
      "The rise in interest rates has made it more difficult for young people to buy their first home.",
      [
        "Faiz oranlarındaki artış, gençlerin ilk evlerini almasını zorlaştırdı.",
        "Faiz oranları düştüğü için gençler ilk evlerini daha kolay alabiliyor.",
        "Gençler ilk evlerini aldıktan sonra faiz oranları arttı.",
        "Gençlerin ev alması faiz oranlarının artmasına yol açtı.",
        "Faiz oranları arttığı hâlde gençlerin ev alması kolaylaştı.",
      ],
      "'The rise in interest rates' = 'Faiz oranlarındaki artış'; 'has made it more difficult ... to buy their first home' = 'ilk evlerini almasını zorlaştırdı'. Diğer seçenekler anlamı değiştirir.",
    ],
    [
      "Had the bank lent them the money, they would have expanded their business.",
      [
        "Banka onlara borç verseydi, işlerini büyütürlerdi.",
        "Banka onlara borç verdiği için işlerini büyüttüler.",
        "İşlerini büyütmeden önce bankadan borç aldılar.",
        "Banka borç vermese bile işlerini büyüteceklerdi.",
        "Bankanın borç vermesi işlerinin küçülmesine neden oldu.",
      ],
      "'Had the bank lent them the money' devrik üçüncü tip koşuldur = 'borç verseydi'; 'would have expanded' = 'büyütürlerdi'.",
    ],
    [
      "What worries economists is not the amount of debt itself but how quickly it is growing.",
      [
        "Ekonomistleri endişelendiren şey borcun miktarı değil, ne kadar hızlı arttığıdır.",
        "Ekonomistler yalnızca borcun miktarından endişe duyuyor.",
        "Borcun hızla artması ekonomistleri hiç endişelendirmiyor.",
        "Ekonomistler borcun azaldığını görünce endişelendi.",
        "Borç miktarı ekonomistlerin tahmin ettiğinden daha az.",
      ],
      "'not the amount of debt itself but how quickly it is growing' = 'borcun miktarı değil, ne kadar hızlı arttığı'.",
    ],
  ],
  trEn: [
    [
      "Şirket, gelecek yıl yurt dışında üç yeni mağaza açmayı planlıyor.",
      [
        "The company plans to open three new shops abroad next year.",
        "The company opened three new shops abroad last year.",
        "The company is closing three of its shops abroad.",
        "Three foreign companies will open shops here next year.",
        "The company has decided not to open any shops abroad.",
      ],
      "'gelecek yıl yurt dışında üç yeni mağaza açmayı planlıyor' = plans to open three new shops abroad next year.",
    ],
    [
      "Ekonomistlerin çoğu, enflasyonun önümüzdeki aylarda düşmesini bekliyor.",
      [
        "Most economists expect inflation to fall in the coming months.",
        "Most economists expect inflation to rise in the coming months.",
        "Few economists believe that inflation will change.",
        "Inflation fell in the past few months, as economists expected.",
        "Economists have stopped trying to predict inflation.",
      ],
      "'Ekonomistlerin çoğu' = most economists; 'enflasyonun önümüzdeki aylarda düşmesini bekliyor' = expect inflation to fall in the coming months.",
    ],
    [
      "Bu ürün, rakiplerinden daha ucuz olmasına rağmen iyi satmadı.",
      [
        "Although this product was cheaper than its rivals, it did not sell well.",
        "This product sold well because it was cheaper than its rivals.",
        "This product was more expensive than its rivals, so it didn't sell.",
        "Its rivals sold better because this product was too cheap.",
        "This product will be cheaper than its rivals next year.",
      ],
      "'rakiplerinden daha ucuz olmasına rağmen' = although it was cheaper than its rivals; 'iyi satmadı' = did not sell well.",
    ],
  ],
  reading: [
    {
      text:
        "In 1976, the Bangladeshi economist Muhammad Yunus lent twenty-seven dollars of his own money to a group of forty-two women in a village near the university where he taught. The women made bamboo stools and baskets, but because they had no money, they were forced to borrow from moneylenders at extremely high rates of interest, leaving them almost no profit. Yunus's small loan allowed them to buy their materials directly, and all of them repaid him. Encouraged by this result, he founded the Grameen Bank, which provides small loans, known as microcredit, to poor people who cannot borrow from ordinary banks because they have no property to offer as security. Instead of security, borrowers join small groups whose members support each other and are responsible for encouraging repayment. Most of the bank's borrowers are women, who Yunus found were more likely to spend the money on their families. In 2006, Yunus and the Grameen Bank were jointly awarded the Nobel Peace Prize. Microfinance spread rapidly around the world, but its results have been debated. Some studies have found that small loans improve living standards less than had been hoped, and in some countries, commercial lenders have charged very high interest rates to poor borrowers.",
      questions: [
        [
          "According to the passage, before Yunus's loan, the women in the village ----.",
          [
            "earned very little because of expensive borrowing",
            "had already saved enough to buy materials",
            "sold their products in the city market",
            "worked at the university as cleaners",
            "refused to borrow money from anyone",
          ],
          "Metne göre kadınlar tefecilerden çok yüksek faizle borç almak zorunda kaldıkları için neredeyse hiç kâr edemiyordu.",
        ],
        [
          "How does the Grameen Bank deal with borrowers who have no security?",
          [
            "It relies on groups whose members support repayment.",
            "It asks them to give their houses to the bank.",
            "It lends only to people with steady jobs.",
            "It charges them much higher interest.",
            "It refuses to lend them money.",
          ],
          "Metinde teminat yerine borçluların, üyeleri birbirini destekleyen ve geri ödemeyi teşvik eden küçük gruplara katıldığı belirtilir.",
        ],
        [
          "Why does the Grameen Bank lend mainly to women?",
          [
            "They tend to use the money for their families.",
            "A government rule forces the bank to choose women.",
            "They earn more than men in Bangladesh.",
            "They usually own more property.",
            "They borrow larger amounts than men.",
          ],
          "Metne göre Yunus kadınların parayı aileleri için harcama olasılığının daha yüksek olduğunu bulmuştur.",
        ],
        [
          "The author's attitude towards microfinance in the last two sentences is ----.",
          [
            "balanced, pointing out some limitations",
            "completely enthusiastic",
            "entirely hostile",
            "indifferent and uninterested",
            "humorous and light-hearted",
          ],
          "Yazar mikrofinansın yaygınlaştığını söyledikten sonra sonuçlarının tartışıldığını ve bazı sorunlarını belirtir; tutumu dengelidir.",
        ],
      ],
    },
    {
      text:
        "In 1711, the British government created the South Sea Company, which was given the exclusive right to trade with Spain's colonies in South America. In return, the company agreed to take over a large part of the national debt. Although its trade was in fact very limited, the company's directors spread exaggerated stories about the fortunes to be made, and in 1720 the price of its shares rose from around one hundred pounds to nearly one thousand pounds in just a few months. People from every class of society rushed to invest, and many new companies, some with absurd purposes, were created to take advantage of the excitement. One advertised itself as 'a company for carrying on an undertaking of great advantage, but nobody to know what it is'. By the autumn, the bubble had burst, and the share price collapsed, ruining thousands of investors. Among the victims was the scientist Isaac Newton, who is said to have lost around twenty thousand pounds, an enormous sum at the time. He reportedly remarked that he could calculate the motions of the heavenly bodies, but not the madness of people. An investigation later revealed that several government ministers had accepted bribes from the company.",
      questions: [
        [
          "According to the passage, the South Sea Company ----.",
          [
            "made much less from trade than people believed",
            "was the most profitable company in Britain",
            "was owned by the Spanish government",
            "refused to take over any national debt",
            "was created by Isaac Newton",
          ],
          "Metne göre şirketin ticareti aslında çok sınırlıydı, ancak yöneticiler kazanılacak servetler hakkında abartılı hikâyeler yaydı.",
        ],
        [
          "The example of the company that did not explain its purpose shows ----.",
          [
            "how irrational investors had become",
            "how successful new companies were",
            "why the government created the bubble",
            "how the South Sea Company traded",
            "why Newton invested his money",
          ],
          "Ne iş yapacağını kimsenin bilmeyeceğini söyleyen bir şirketin kurulması yatırımcıların ne kadar mantıksız davrandığını gösterir.",
        ],
        [
          "Newton's comment suggests that ----.",
          [
            "human behaviour is harder to predict than physics",
            "he had expected the share price to fall",
            "he was not interested in money",
            "the stars influence the stock market",
            "he blamed the government for his losses",
          ],
          "Newton'un gök cisimlerinin hareketlerini hesaplayabildiğini ama insanların çılgınlığını hesaplayamadığını söylemesi, insan davranışının fizikten daha zor tahmin edildiğini ima eder.",
        ],
        [
          "What did the investigation reveal?",
          [
            "Some ministers had taken bribes.",
            "Newton had broken the law.",
            "The company had traded honestly.",
            "Spain had caused the collapse.",
            "Most investors had made a profit.",
          ],
          "Metinde soruşturmanın bazı hükümet bakanlarının şirketten rüşvet aldığını ortaya çıkardığı belirtilir.",
        ],
      ],
    },
    {
      text:
        "In some European countries, more than ninety per cent of people are registered as organ donors, while in neighbouring countries with similar cultures the figure is below twenty per cent. A famous study published in 2003 suggested that the main reason is surprisingly simple. In the countries with high rates, people are automatically treated as donors unless they choose to opt out, whereas in the countries with low rates, people must actively opt in by filling out a form. Because most people never get round to changing the default option, the way the choice is presented has a huge effect on the outcome. Behavioural economists call this the power of defaults, and it has been observed in many other areas, such as pension schemes: when employees are automatically enrolled and must opt out if they do not want to save, far more of them end up saving. Some governments have used such 'nudges' to encourage people to make choices that are good for themselves or for society, without forcing them. Critics, however, argue that nudging can be manipulative, especially if people are not aware of how their choices are being shaped. Others point out that in the case of organ donation, families are often still asked for permission, so the default alone may not increase the number of transplants as much as the statistics suggest.",
      questions: [
        [
          "According to the 2003 study, high donor rates are mainly linked to ----.",
          [
            "systems in which people must opt out",
            "stronger religious beliefs",
            "better hospitals and doctors",
            "higher levels of education",
            "larger populations",
          ],
          "Metne göre yüksek oranlı ülkelerde insanlar vazgeçmeyi seçmedikçe otomatik olarak bağışçı kabul edilir.",
        ],
        [
          "The example of pension schemes is used to show that ----.",
          [
            "the default option also affects other decisions",
            "most employees refuse to save money",
            "pensions are more important than organ donation",
            "governments should force people to save",
            "people always read forms carefully",
          ],
          "Emeklilik planları örneği, varsayılan seçeneğin gücünün başka alanlarda da gözlemlendiğini göstermek için verilir.",
        ],
        [
          "Critics of nudging argue that it ----.",
          [
            "may influence people without their knowledge",
            "forces people to donate their organs",
            "has no effect on people's choices",
            "is too expensive for governments",
            "only works in pension schemes",
          ],
          "Metne göre eleştirmenler, insanlar seçimlerinin nasıl şekillendirildiğinin farkında değilse yönlendirmenin manipülatif olabileceğini savunur.",
        ],
        [
          "It can be inferred from the last sentence that ----.",
          [
            "high registration rates may not lead to many more transplants",
            "families are never asked about organ donation",
            "opt-out systems always double the number of transplants",
            "doctors refuse to perform transplants",
            "statistics about donation are always accurate",
          ],
          "Son cümleye göre ailelerden hâlâ izin istendiği için varsayılan seçenek tek başına nakil sayısını istatistiklerin gösterdiği kadar artırmayabilir.",
        ],
      ],
    },
    {
      text:
        "In 1902, the French colonial authorities in Hanoi, in what is now Vietnam, faced a serious problem. The city's new sewer system had become home to millions of rats, which spread disease, including the plague. To reduce their numbers, the authorities offered a reward for every rat killed. Because officials did not want to handle dead rats, people only had to bring in the tail as proof. At first, the scheme seemed to work, and thousands of tails were handed in every day. Soon, however, officials began to notice rats running around the city without tails. People were catching rats, cutting off their tails and releasing them so that they could breed and produce more rewards. Some people even started farming rats on the edge of the city. Eventually, the scheme was abandoned. Situations like this, in which an attempt to solve a problem makes it worse, are sometimes described as examples of the 'cobra effect', after a similar, though less well-documented, story about a reward for dead cobras in colonial India. Economists see them as a warning about incentives. A related idea, known as Goodhart's law, states that when a measure becomes a target, it ceases to be a good measure, because people find ways to improve the number without improving the reality it was supposed to represent.",
      questions: [
        [
          "According to the passage, the authorities in Hanoi offered a reward because ----.",
          [
            "they wanted to reduce the number of rats in the city",
            "they needed rats for scientific research",
            "people were selling rat tails abroad",
            "the sewers were being damaged by people",
            "rats were eating the city's food supplies",
          ],
          "Metne göre kanalizasyon sisteminde milyonlarca fare yaşıyor ve hastalık yayıyordu; yetkililer sayılarını azaltmak için ödül teklif etti.",
        ],
        [
          "Why did people release rats after cutting off their tails?",
          [
            "So that the rats would breed and produce more tails",
            "Because they felt sorry for the animals",
            "Because the officials told them to do so",
            "So that the rats would leave the city",
            "Because the rats were too heavy to carry",
          ],
          "Metinde insanların fareleri yakalayıp kuyruklarını kestikten sonra üreyip daha fazla ödül getirmeleri için serbest bıraktığı belirtilir.",
        ],
        [
          "The story about cobras in India is described as ----.",
          [
            "less well supported by evidence than the Hanoi case",
            "the origin of the scheme in Hanoi",
            "a complete success",
            "a story invented by economists in 1902",
            "more reliable than the story about rats",
          ],
          "Metinde Hindistan'daki kobra hikâyesinin 'daha az belgelenmiş' olduğu belirtilir.",
        ],
        [
          "Goodhart's law suggests that ----.",
          [
            "turning a measurement into a goal can make it misleading",
            "people always tell the truth about numbers",
            "rewards are the best way to solve problems",
            "governments should never measure anything",
            "targets make people work more honestly",
          ],
          "Goodhart yasasına göre bir ölçüt hedef hâline geldiğinde iyi bir ölçüt olmaktan çıkar, çünkü insanlar gerçeği değil sayıyı iyileştirmenin yollarını bulur.",
        ],
      ],
    },
    {
      text:
        "Normally, when the price of something rises, people buy less of it. In 1899, however, the American economist Thorstein Veblen described a group of goods for which the opposite can be true. These are luxury products, such as designer handbags, expensive watches and sports cars, which people buy partly to show others how wealthy they are. For such goods, a higher price can actually make them more attractive, because it makes them more exclusive. Veblen called this behaviour 'conspicuous consumption'. Modern research has found some support for his ideas. In one experiment, people who were told that a wine was expensive not only said that it tasted better but also showed more activity in the parts of the brain associated with pleasure, even though they were drinking the same wine as others who had been told it was cheap. Companies that sell luxury goods are well aware of these effects. Some deliberately limit production or destroy unsold items rather than selling them at a discount, in order to protect the image of their brand. Critics argue that this is wasteful, and in 2022 France introduced a law that prevents companies from destroying unsold goods that are not food.",
      questions: [
        [
          "According to the passage, Veblen goods are different from ordinary goods because ----.",
          [
            "demand for them may rise when they become more expensive",
            "they are always cheaper than other products",
            "nobody wants to buy them",
            "their prices never change",
            "they are only sold in France",
          ],
          "Metne göre normalde fiyat arttığında talep düşer, ancak Veblen mallarında daha yüksek fiyat onları daha çekici yapabilir.",
        ],
        [
          "The term 'conspicuous consumption' refers to ----.",
          [
            "buying things in order to display one's wealth",
            "buying only what one really needs",
            "saving money for the future",
            "buying products at a discount",
            "producing luxury goods in factories",
          ],
          "Metinde insanların bu ürünleri kısmen başkalarına ne kadar zengin olduklarını göstermek için aldığı belirtilir.",
        ],
        [
          "The wine experiment suggests that ----.",
          [
            "the price of a product can change how much people enjoy it",
            "expensive wine always tastes better",
            "people cannot tell the difference between wines",
            "cheap wine is better for the brain",
            "most people prefer cheap wine",
          ],
          "Deneyde pahalı olduğu söylenen şarabı içenler aynı şarabı içmelerine rağmen tadının daha iyi olduğunu söylemiş ve beyinlerinin haz bölgelerinde daha fazla etkinlik göstermiştir.",
        ],
        [
          "Why do some luxury companies destroy unsold products?",
          [
            "To protect the exclusive image of their brand",
            "Because the products are damaged",
            "To make room for cheaper products",
            "Because the law requires them to",
            "To reduce their taxes",
          ],
          "Metne göre bazı şirketler markalarının imajını korumak için satılmayan ürünleri indirimle satmak yerine yok eder.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "Customer: I'd like to send some money to my son, who's studying in Germany.\nBank clerk: ----\nCustomer: About five hundred euros, please.",
      [
        "Certainly. How much would you like to send?",
        "Germany has some excellent universities.",
        "The bank closes at five today.",
        "Would you like to open a savings account?",
        "Our exchange rates are updated every hour.",
      ],
      "Müşteri 'Yaklaşık beş yüz avro' der; demek ki görevli ne kadar göndermek istediğini sormuştur.",
    ],
    [
      "Selin: I'm thinking of starting my own small business.\nAli: ----\nSelin: Handmade jewellery. I've been making it as a hobby for years.",
      [
        "That's exciting! What kind of business?",
        "Most new businesses fail within a few years.",
        "My uncle has owned a shop for twenty years.",
        "You'll need to pay quite a lot of tax.",
        "Have you ever worked in a bank?",
      ],
      "Selin 'El yapımı takı' der; demek ki Ali ne tür bir iş olduğunu sormuştur.",
    ],
    [
      "Tourist: Can I pay in dollars here?\nShop assistant: ----\nTourist: That's fine. Is there a cash machine nearby?",
      [
        "I'm afraid we only accept the local currency or cards.",
        "Yes, and we also accept euros and pounds.",
        "This shop has been open for fifty years.",
        "Our prices are lower than in the city centre.",
        "Would you like a bag for that?",
      ],
      "Turist 'Sorun değil, yakınlarda bir bankamatik var mı?' der; demek ki görevli dolar kabul etmediklerini söylemiştir.",
    ],
    [
      "Kerem: I can never save any money at the end of the month.\nAyça: ----\nKerem: I've never tried that. Maybe I'll set up an automatic transfer.",
      [
        "Why not move some money into savings as soon as you're paid?",
        "Prices have gone up a lot this year.",
        "I'm saving for a holiday in Spain.",
        "Banks pay very little interest these days.",
        "Do you want to go shopping on Saturday?",
      ],
      "Kerem 'Bunu hiç denemedim, belki otomatik bir aktarım kurarım' der; demek ki Ayça maaşı yatar yatmaz bir kısmını birikime aktarmasını önermiştir.",
    ],
    [
      "Investor: How has the company performed this year?\nManager: ----\nInvestor: That's impressive, especially in such a difficult economy.",
      [
        "Our sales have risen by twenty per cent.",
        "We have offices in five countries.",
        "The company was founded in 1985.",
        "Our new headquarters will open next year.",
        "We employ more than two thousand people.",
      ],
      "Yatırımcı 'Bu etkileyici, özellikle bu kadar zor bir ekonomide' der; demek ki müdür satışların yüzde yirmi arttığını söylemiştir.",
    ],
  ],
  restatement: [
    [
      "Prices have risen so much that many families can no longer afford meat.",
      [
        "Because of the sharp rise in prices, meat has become too expensive for many families.",
        "Many families have stopped eating meat for health reasons.",
        "The price of meat has fallen, so more families buy it.",
        "Many families buy more meat now that prices have risen.",
        "Meat has always been too expensive for most families.",
      ],
      "'so much that many families can no longer afford meat' = 'o kadar arttı ki pek çok aile artık et alamıyor'; ilk seçenek aynı neden-sonuç ilişkisini kurar.",
    ],
    [
      "The company could not have survived without the government's support.",
      [
        "The government's support was what kept the company going.",
        "The company survived without any help from the government.",
        "The government refused to support the company.",
        "The company supported the government during the crisis.",
        "The company closed despite the government's support.",
      ],
      "'could not have survived without the government's support' = 'devlet desteği olmadan ayakta kalamazdı'; yani şirketi ayakta tutan devlet desteğiydi.",
    ],
    [
      "It's not worth buying a new car; your old one is still in good condition.",
      [
        "There is no point in getting a new car, as yours is still fine.",
        "You should buy a new car because yours is very old.",
        "Your old car needs to be repaired urgently.",
        "New cars are not as reliable as old ones.",
        "Your old car is worth a lot of money.",
      ],
      "'It's not worth buying' = 'There is no point in getting'; ilk seçenek aynı anlamı verir.",
    ],
    [
      "Unemployment is lower now than it has been for twenty years.",
      [
        "Unemployment has not been this low for two decades.",
        "Unemployment has risen steadily for twenty years.",
        "Unemployment was lower twenty years ago.",
        "Unemployment has stayed the same for twenty years.",
        "Twenty years ago, there was no unemployment.",
      ],
      "'lower now than it has been for twenty years' = 'yirmi yıldır olmadığı kadar düşük'; ilk seçenek aynı anlamı verir.",
    ],
  ],
  paragraph: [
    [
      "In the early 1920s, the Italian-born swindler Charles Ponzi promised investors in Boston that he could double their money in ninety days by trading international postal coupons. ---- For a while, the scheme appeared to work, and thousands of people invested. When newspapers began to investigate, however, it collapsed, and Ponzi was arrested. Today, any fraud of this kind is called a 'Ponzi scheme'.",
      [
        "In reality, he paid early investors with money from newer ones.",
        "Boston is one of the oldest cities in the United States.",
        "Many people collect stamps as a hobby.",
        "Italy has a long tradition of banking.",
        "Newspapers were very popular at that time.",
      ],
      "Boşluktan sonra planın bir süre işe yarar göründüğü ve sonra çöktüğü anlatılır; boşluğa aslında eski yatırımcılara yeni yatırımcıların parasıyla ödeme yaptığını söyleyen cümle gelmelidir.",
    ],
    [
      "For more than two thousand years, the small white shells of a sea snail called the cowrie were used as money in parts of Africa and Asia. ---- They were also difficult to fake. In West Africa, they remained in use until the early twentieth century, and the word for money in some local languages still comes from the word for these shells.",
      [
        "They were durable, easy to count and too small to break into pieces.",
        "Sea snails live in warm, shallow waters.",
        "Many beaches are covered with shells after a storm.",
        "Africa is the second largest continent in the world.",
        "Some people make jewellery from shells.",
      ],
      "Boşluktan sonraki 'They were also difficult to fake' ifadesi kabukların para olarak kullanışlı başka özelliklerinin önceden sayılmasını gerektirir.",
    ],
    [
      "Between 2017 and 2018, Finland carried out an experiment in which two thousand unemployed people received a monthly payment of 560 euros, with no conditions attached. ---- At the end of the trial, the participants were not significantly more likely to find work than people in a comparison group. However, they reported being less stressed and more confident about the future.",
      [
        "They continued to receive it even if they found a job.",
        "Finland is famous for its excellent education system.",
        "Many countries have high levels of unemployment.",
        "The euro was introduced in Finland in 2002.",
        "Winters in Finland are long and very cold.",
      ],
      "Boşluktan önce koşulsuz bir ödeme anlatılır; boşluğa bu ödemenin iş bulsalar bile devam ettiğini söyleyen cümle gelmelidir.",
    ],
    [
      "Before money was invented, people often obtained goods by barter, exchanging one item directly for another. ---- A farmer who wanted shoes, for example, would need to find a shoemaker who wanted grain at exactly the same time. Money solved this problem by providing something that everyone would accept in exchange for anything.",
      [
        "The system had a serious weakness, however.",
        "Shoes were made by hand until the nineteenth century.",
        "Most farmers today use modern machines.",
        "Grain can be stored for many months.",
        "Some people still use barter today.",
      ],
      "Boşluktan sonra takas sisteminin bir sorunu örneklenir; boşluğa sistemin ciddi bir zayıflığı olduğunu söyleyen cümle gelmelidir.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "Bitcoin was created in 2009 by an unknown person or group using the name Satoshi Nakamoto.",
        "It is a digital currency that is not controlled by any government or bank.",
        "Transactions are recorded on a public digital ledger called a blockchain.",
        "Many banks have closed branches as more people use online banking.",
        "The value of Bitcoin has changed dramatically, rising and falling by thousands of dollars in a single day.",
      ],
      odd: 3,
      why: "Parça Bitcoin'i anlatır. Bankaların şubelerini kapattığını söyleyen IV. cümle konudan sapar.",
    },
    {
      sentences: [
        "Economists use the term 'Giffen good' for a product that people buy more of when its price rises.",
        "This can happen with basic foods eaten by very poor families.",
        "If the price of rice rises, such families may not be able to afford meat at all and buy more rice instead.",
        "Rice is grown on every continent except Antarctica.",
        "Real examples are rare, but a study in China in 2008 found evidence of this effect.",
      ],
      odd: 3,
      why: "Parça Giffen mallarını anlatır. Pirincin Antarktika dışında her kıtada yetiştirildiğini söyleyen IV. cümle konudan sapar.",
    },
    {
      sentences: [
        "A 'free rider' is someone who benefits from something without paying for it.",
        "Public television, for example, is watched by many people who do not contribute to its costs.",
        "Television sets have become much thinner in recent years.",
        "If too many people behave in this way, the service may not survive.",
        "This is one reason why governments often pay for such services through taxes.",
      ],
      odd: 2,
      why: "Parça 'bedavacı' kavramını anlatır. Televizyonların inceldiğini söyleyen III. cümle konudan sapar.",
    },
    {
      sentences: [
        "Crowdfunding websites allow people to raise money for a project by collecting small amounts from a large number of supporters.",
        "In return, supporters often receive a reward, such as an early copy of the product.",
        "Some projects have raised millions of dollars in just a few days.",
        "However, many funded projects are delayed, and some are never completed.",
        "Most people now shop online at least once a week.",
      ],
      odd: 4,
      why: "Parça kitlesel fonlamayı anlatır. İnsanların haftada en az bir kez internetten alışveriş yaptığını söyleyen V. cümle konudan sapar.",
    },
    {
      sentences: [
        "Many young people today hope to start their own businesses.",
        "In a pyramid scheme, members are recruited with promises of high earnings.",
        "They must pay to join and are encouraged to recruit others, who also pay.",
        "Most of the money flows upwards to the people at the top.",
        "Because the number of new recruits cannot grow forever, the scheme eventually collapses, and most members lose their money.",
      ],
      odd: 0,
      why: "Parça piramit şemalarını anlatır. Pek çok gencin kendi işini kurmayı umduğunu söyleyen I. cümle konuyla ilgisizdir; II. cümle konuyu başlatır.",
    },
  ],
};
