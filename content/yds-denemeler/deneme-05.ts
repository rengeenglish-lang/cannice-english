import type { Deneme } from "./types";

export const DENEME_05: Deneme = {
  no: 5,
  vocab: [
    [
      "The novel's plot is so ---- that readers often need to go back several chapters to remember who is related to whom.",
      ["intricate", "predictable", "shallow", "brief", "repetitive"],
      "Okurların kimin kiminle akraba olduğunu hatırlamak için geri dönmesi, olay örgüsünün 'karmaşık' (intricate) olduğunu gösterir. 'predictable' ve 'shallow' bu güçlüğü açıklamaz.",
    ],
    [
      "The charity relies on public donations to ---- its programmes, as it receives no money from the government.",
      ["sustain", "restrict", "abandon", "undermine", "dismiss"],
      "Devletten para almayan bir yardım kuruluşu programlarını 'sürdürmek' (sustain) için bağışlara güvenir. Diğer fiiller bağışların amacıyla çelişir.",
    ],
    [
      "Although the evidence against him was largely ----, the jury found the defendant guilty.",
      ["circumstantial", "conclusive", "overwhelming", "irrefutable", "documented"],
      "'Although' zıtlık ister: kanıtlar büyük ölçüde 'dolaylı' (circumstantial) olmasına rağmen jüri suçlu buldu. 'conclusive', 'overwhelming' ve 'irrefutable' güçlü kanıtı anlatır ve zıtlığı ortadan kaldırır.",
    ],
    [
      "The rapid growth of the city has put enormous ---- on its water supply, which was designed for a much smaller population.",
      ["strain", "relief", "value", "credit", "favour"],
      "'put strain on' (… üzerinde baskı/yük oluşturmak) kalıbıdır ve suyun çok daha küçük bir nüfus için tasarlanmış olmasıyla uyumludur.",
    ],
    [
      "The talks ---- after the two sides failed to agree on the timetable for withdrawing troops.",
      ["broke down", "made up", "set off", "came across", "looked after"],
      "Tarafların anlaşamaması görüşmelerin 'çökmesine' (break down) yol açar. 'made up' (barışmak, uydurmak) ve 'came across' (rastlamak) bağlama uymaz.",
    ],
    [
      "Several local businesses have ---- the campaign to keep the historic market open, donating money and putting up posters.",
      ["backed", "opposed", "ignored", "postponed", "replaced"],
      "Para bağışlamak ve afiş asmak kampanyayı 'desteklemek' (back) demektir. 'opposed' ve 'ignored' bu eylemlerle çelişir.",
    ],
  ],
  grammar: [
    [
      "When the paramedics arrived, the injured driver ---- by passers-by for nearly twenty minutes.",
      ["had been helped", "was helping", "has been helped", "had helped", "helped"],
      "Sağlık görevlilerinin gelişinden önce yirmi dakika süren ve sürücünün yardım aldığı durum past perfect passive gerektirir: 'had been helped'.",
    ],
    [
      "The company is considering ---- its headquarters to a smaller city in order to reduce costs.",
      ["moving", "to move", "move", "to moving", "moved"],
      "'consider' fiili -ing biçimi alır: 'considering moving'.",
    ],
    [
      "---- in the eighteenth century, the palace is now one of the most visited museums in the country.",
      ["Completed", "Completing", "Having completed", "To complete", "Being completing"],
      "Saray tamamlandığı için edilgen anlamlı ortaç yapısı gerekir: 'Completed in the eighteenth century'. 'Having completed' etken anlam verir.",
    ],
    [
      "You can borrow my laptop ---- you promise to return it by Friday.",
      ["as long as", "unless", "even though", "in case", "whereas"],
      "Ödünç verme bir koşula bağlıdır: 'as long as' (… -dığı sürece). 'unless' anlamı tersine çevirir.",
    ],
    [
      "The professor, ---- lectures are always popular, has been invited to speak at an international conference.",
      ["whose", "who", "whom", "which", "that"],
      "Boşluktan sonraki 'lectures' profesöre aittir; iyelik bildiren 'whose' gerekir.",
    ],
    [
      "Little ---- that the small experiment would eventually change the course of medical history.",
      ["did the researchers know", "the researchers knew", "knew the researchers", "the researchers did know", "had known the researchers"],
      "Olumsuz anlamlı 'Little' cümle başına geldiğinde devrik yapı gerekir: 'did the researchers know'.",
    ],
    [
      "The new airport is twice ---- the old one and can handle up to fifty million passengers a year.",
      ["as large as", "larger than", "so large as", "the largest of", "large as"],
      "Kat bildiren karşılaştırma 'twice as + sıfat + as' ile kurulur: 'twice as large as'.",
    ],
    [
      "I wish I ---- more attention to my teachers' advice when I was at school.",
      ["had paid", "paid", "have paid", "would pay", "was paying"],
      "Geçmişe yönelik pişmanlık 'wish + past perfect' ile anlatılır: 'had paid'.",
    ],
    [
      "The documents must be submitted ---- the end of the month, or the application will be rejected.",
      ["by", "until", "since", "during", "within to"],
      "Bir son tarih bildirmek için 'by the end of the month' (ay sonuna kadar) kullanılır. 'until' süreklilik bildirir ve 'submit' gibi anlık bir eylemle uygun değildir.",
    ],
    [
      "Many of the problems ---- the city faces today are the result of decisions ---- several decades ago.",
      ["that / made", "what / making", "which / were made", "whose / make", "where / had made"],
      "İlk boşluk 'the problems' ismini niteleyen ve 'faces' fiilinin nesnesi olan ilgi zamiridir: 'that'. İkinci boşluk 'decisions' ismini edilgen anlamla niteleyen kısaltılmış ilgi cümlesidir: 'made'.",
    ],
  ],
  cloze: [
    {
      text:
        "Of the roughly seven thousand languages spoken in the world today, linguists estimate that around half could disappear by the end of this century. A language is considered endangered when children no longer learn it {1} their parents. This often happens when a community comes into contact with a more powerful language that offers better access to education and jobs. Parents may decide, {2} understandable reasons, that their children's future lies in the dominant language. The loss of a language is more than the loss of words. {3} each language contains unique ways of describing the world, including knowledge of local plants, animals and traditions, its disappearance can erase information that exists nowhere else. Efforts to revive endangered languages have had some notable successes. Hebrew, for example, was revived as an everyday spoken language in the late nineteenth and twentieth centuries, and Welsh is now spoken by more young people than it {4} a few decades ago. Such cases show that decline is not inevitable, {5} strong community support and government policy are essential.",
      blanks: [
        ["", ["from", "by", "with", "for", "over"], "Bir dili ebeveynlerinden 'öğrenmek' 'learn it from their parents' biçiminde kurulur."],
        ["", ["for", "with", "on", "by", "under"], "'for understandable reasons' (anlaşılır nedenlerle) sabit bir ifadedir."],
        ["", ["Since", "Unless", "Although", "Until", "Whereas"], "Her dilin dünyayı tanımlamanın eşsiz yollarını içermesi, kaybolmasının başka hiçbir yerde olmayan bilgiyi silmesinin nedenidir: 'Since' (… -dığı için)."],
        ["", ["was", "did", "has", "had been", "is"], "'Welsh is now spoken by more young people than it was a few decades ago' = 'birkaç on yıl önce konuşulduğundan daha fazla'. Edilgen 'is spoken' yapısının geçmişteki karşılığı 'was' olur."],
        ["", ["although", "because", "so that", "unless", "as if"], "Düşüşün kaçınılmaz olmadığı, ancak güçlü topluluk desteği ve devlet politikasının gerekli olduğu söylenir; çekince bildiren 'although' gerekir."],
      ],
    },
    {
      text:
        "Few foods have had as great an impact on European history as the potato. Native to the Andes of South America, it was brought to Europe by Spanish explorers in the sixteenth century. At first, however, it was met with suspicion. Some people believed that it caused disease, {1} others simply considered it food fit only for animals. It was not until the eighteenth century that the potato became widely accepted, partly {2} governments actively encouraged farmers to grow it. The potato had important advantages: it produced more calories per hectare than grain and could be grown in poor soil. {3}, it helped to support rapid population growth in many parts of northern Europe. Dependence on a single crop, however, proved dangerous. In the 1840s, a plant disease destroyed potato harvests across Ireland, {4} the population relied heavily on potatoes for food. Around a million people died, and a similar number emigrated, {5} the country's population by roughly a quarter.",
      blanks: [
        ["", ["while", "because", "unless", "so", "since"], "Bazılarının bir görüşü, diğerlerinin başka bir görüşü karşılaştırılır: 'while' (… -iken)."],
        ["", ["because", "although", "unless", "whereas", "so that"], "'partly because' = 'kısmen ... olduğu için'; kabul görmenin nedenlerinden birini verir."],
        ["", ["As a result", "In contrast", "Even so", "On the other hand", "Instead"], "Patatesin avantajları, hızlı nüfus artışını desteklemesinin nedenidir; sonuç bağlacı 'As a result' gerekir."],
        ["", ["where", "which", "when", "what", "whose"], "Boşluk 'Ireland' yer adını niteler ve ardından tam bir cümle gelir: 'where the population relied heavily on potatoes'."],
        ["", ["reducing", "reduced", "to have reduced", "having been reduced", "reduce"], "Önceki cümlenin sonucunu bildiren etken anlamlı ortaç yapısı gerekir: 'reducing the country's population' (nüfusu azaltarak)."],
      ],
    },
  ],
  completion: [
    [
      "Unless the deadline is extended, ----.",
      [
        "many students will not be able to submit their projects on time",
        "most students had already submitted their projects last week",
        "the teachers would have marked all the projects by now",
        "students were allowed to work on their projects in groups",
        "the projects have always been marked by two teachers",
      ],
      "'Unless' + geniş zaman, ana cümlede gelecek zaman ister: süre uzatılmazsa birçok öğrenci projesini zamanında teslim edemeyecek.",
    ],
    [
      "----, the scientists were unable to reach any firm conclusions.",
      [
        "Because the sample used in the study was extremely small",
        "Because the data clearly supported their original hypothesis",
        "Since the results were published in a respected journal",
        "As soon as the experiment had been successfully repeated",
        "So that other researchers could check their methods",
      ],
      "Kesin sonuca ulaşamamanın nedeni: örneklemin çok küçük olması. Verilerin hipotezi açıkça desteklemesi ya da sonuçların saygın bir dergide yayımlanması, sonuca ulaşamamayı açıklamaz.",
    ],
    [
      "The city's population has nearly doubled over the past twenty years, ----.",
      [
        "which has placed great pressure on housing and public services",
        "although most of its residents had moved there in the 1950s",
        "so that the city council had to close several schools",
        "unless more people decide to move to the countryside",
        "whose historic centre was rebuilt after the earthquake",
      ],
      "Nüfus artışının sonucu verilir: konut ve kamu hizmetleri üzerinde büyük baskı yarattı. 'which' burada önceki cümlenin tamamına gönderme yapar.",
    ],
    [
      "Not until the patient's symptoms became severe ----.",
      [
        "did she realise that she needed to see a specialist",
        "she had decided to go to the nearest hospital",
        "that the doctors diagnosed her with a rare illness",
        "her family insisted that she should rest at home",
        "when she was finally given the correct treatment",
      ],
      "'Not until ...' ile başlayan cümlede ana cümle devrik olur: 'did she realise'.",
    ],
    [
      "While some critics praised the film for its stunning visual effects, ----.",
      [
        "others complained that the story was confusing and too long",
        "it won several awards at international film festivals",
        "the director had worked on it for more than five years",
        "most audiences enjoyed it more than the original novel",
        "it was filmed in several different countries",
      ],
      "'While' iki farklı görüşü karşılaştırır: bazıları görsel efektleri överken, diğerleri hikâyenin karmaşık ve uzun olduğundan yakındı.",
    ],
    [
      "The museum has introduced free entry on Sundays ----.",
      [
        "in order to attract visitors who cannot afford the ticket price",
        "although most of its visitors come from other countries",
        "which had been built in the late nineteenth century",
        "unless the government had increased its funding",
        "even though entry had always been free on Sundays",
      ],
      "Ücretsiz girişin amacı: bilet fiyatını karşılayamayan ziyaretçileri çekmek. 'even though entry had always been free' çelişkilidir.",
    ],
    [
      "If the volcano had erupted during the day, ----.",
      [
        "far more people would have been able to escape in time",
        "many residents will be evacuated to safer areas",
        "scientists are monitoring its activity very closely",
        "the nearby villages had already been abandoned",
        "tourists visit the area to see the crater",
      ],
      "Üçüncü tip koşul (had erupted) ana cümlede 'would have + V3' ister: çok daha fazla kişi zamanında kaçabilirdi.",
    ],
    [
      "Considering that the team had only three months to prepare, ----.",
      [
        "their performance in the competition was remarkably good",
        "they decided not to take part in the competition",
        "the competition had been postponed several times",
        "most of the players were injured during training",
        "the coach had been working with them for years",
      ],
      "'Considering that' (… göz önüne alındığında) beklenenden iyi bir sonucu vurgular: yalnızca üç aylık hazırlığa göre performansları dikkat çekici derecede iyiydi.",
    ],
    [
      "Many coastal cities are investing in flood barriers ----.",
      [
        "as rising sea levels increase the risk of serious flooding",
        "which were first built by the Romans two thousand years ago",
        "even though floods have never occurred in these cities",
        "unless the cost of construction becomes much lower",
        "so that tourists could enjoy the beaches safely",
      ],
      "Sel bariyerlerine yatırımın nedeni: yükselen deniz seviyelerinin ciddi sel riskini artırması.",
    ],
    [
      "The more information people are given about a product, ----.",
      [
        "the more confident they tend to feel about buying it",
        "they would have bought it much earlier",
        "most of them prefer to shop online",
        "the most expensive it becomes in the shops",
        "it was advertised more widely on television",
      ],
      "'The more ..., the more ...' karşılaştırma kalıbı tamamlanmalıdır: ne kadar çok bilgi verilirse satın alma konusunda o kadar emin hissederler.",
    ],
  ],
  enTr: [
    [
      "It was not until the nineteenth century that scientists realised that many diseases are caused by microorganisms.",
      [
        "Bilim insanları, birçok hastalığa mikroorganizmaların neden olduğunu ancak on dokuzuncu yüzyılda fark etti.",
        "On dokuzuncu yüzyılda bilim insanları, mikroorganizmaların hastalıklara neden olmadığını kanıtladı.",
        "Bilim insanları on dokuzuncu yüzyıldan çok önce birçok hastalığın mikroorganizmalardan kaynaklandığını biliyordu.",
        "On dokuzuncu yüzyıla kadar birçok hastalık, bilim insanlarınca bilinmeyen mikroorganizmalar tarafından yayıldı.",
        "Mikroorganizmaların neden olduğu hastalıklar, on dokuzuncu yüzyılda bilim insanlarının ilgisini çekmeye başladı.",
      ],
      "'It was not until ... that scientists realised' = 'bilim insanları ... ancak on dokuzuncu yüzyılda fark etti'. Diğer seçenekler fark etme zamanını ya da içeriği değiştirir.",
    ],
    [
      "Given the high cost of living in large cities, it is hardly surprising that many young people choose to live with their parents for longer.",
      [
        "Büyük şehirlerdeki yüksek yaşam maliyeti göz önüne alındığında, birçok gencin ailesiyle daha uzun süre yaşamayı seçmesi pek şaşırtıcı değildir.",
        "Büyük şehirlerde yaşam maliyeti yüksek olsa da gençlerin çoğu ailesinden erken ayrılmayı tercih etmektedir.",
        "Birçok genç ailesiyle uzun süre yaşadığı için büyük şehirlerde yaşam maliyeti giderek artmaktadır.",
        "Büyük şehirlerde yaşayan gençlerin ailelerinden ayrılmak istememesi, yaşam maliyetinden çok kültürel nedenlere bağlıdır.",
        "Yaşam maliyetinin yüksek olduğu büyük şehirlerde gençlerin ailelerinden ayrılması şaşırtıcı biçimde kolaylaşmıştır.",
      ],
      "'Given the high cost of living' = 'yüksek yaşam maliyeti göz önüne alındığında'; 'it is hardly surprising that ...' = '... pek şaşırtıcı değildir'. Diğerleri neden-sonuç yönünü ya da anlamı değiştirir.",
    ],
    [
      "The new species of frog was discovered in a remote mountain forest that had never been explored by scientists.",
      [
        "Yeni kurbağa türü, daha önce bilim insanlarınca hiç keşfedilmemiş, ulaşılması güç bir dağ ormanında bulundu.",
        "Bilim insanları, yeni kurbağa türünü bulmak için uzak bir dağ ormanını yıllarca araştırdı.",
        "Yeni kurbağa türü, bilim insanlarının sık sık ziyaret ettiği bir dağ ormanında keşfedildi.",
        "Uzak bir dağ ormanında yaşayan kurbağa türlerinin çoğu henüz bilim insanlarınca keşfedilmemiştir.",
        "Uzak dağ ormanlarının keşfedilmemiş olması, yeni kurbağa türlerinin bulunmasını zorlaştırmaktadır.",
      ],
      "'was discovered in a remote mountain forest that had never been explored by scientists' = 'daha önce bilim insanlarınca hiç keşfedilmemiş uzak bir dağ ormanında bulundu'.",
    ],
  ],
  trEn: [
    [
      "Yeni ilacın etkili olduğu kanıtlanmış olsa da yüksek maliyeti nedeniyle pek çok hastanın ona erişimi sınırlı kalmaktadır.",
      [
        "Although the new drug has been proven to be effective, many patients' access to it remains limited because of its high cost.",
        "Because the new drug is so effective, its cost has risen and fewer patients can now afford it.",
        "The new drug would be more effective if more patients could afford its high cost.",
        "Many patients have access to the new drug, although its effectiveness has not yet been proven.",
        "The high cost of the new drug has been reduced so that more patients can have access to it.",
      ],
      "'kanıtlanmış olsa da' = 'Although ... has been proven'; 'yüksek maliyeti nedeniyle ... erişimi sınırlı kalmaktadır' = 'access to it remains limited because of its high cost'.",
    ],
    [
      "Tarihçiler, antik kentin neden aniden terk edildiği konusunda henüz bir uzlaşıya varamamıştır.",
      [
        "Historians have not yet reached an agreement on why the ancient city was suddenly abandoned.",
        "Historians have agreed that the ancient city was abandoned suddenly because of an earthquake.",
        "The ancient city was abandoned so suddenly that historians could not study it.",
        "Historians are still trying to find out when the ancient city was built.",
        "Historians disagree about whether the ancient city was ever abandoned.",
      ],
      "'neden aniden terk edildiği konusunda henüz bir uzlaşıya varamamıştır' = 'have not yet reached an agreement on why ... was suddenly abandoned'. Son seçenek terk edilip edilmediğini tartışmaya açar.",
    ],
    [
      "Uzun süreli stres, bağışıklık sistemini zayıflatarak vücudu enfeksiyonlara karşı daha savunmasız hâle getirebilir.",
      [
        "Long-term stress can make the body more vulnerable to infections by weakening the immune system.",
        "Infections weaken the immune system and cause long-term stress in many people.",
        "Long-term stress strengthens the immune system and protects the body from infections.",
        "The body becomes more vulnerable to stress when the immune system is fighting infections.",
        "A weak immune system is the main cause of long-term stress.",
      ],
      "'bağışıklık sistemini zayıflatarak' = 'by weakening the immune system'; 'daha savunmasız hâle getirebilir' = 'can make ... more vulnerable'. Diğerleri neden-sonuç ilişkisini tersine çevirir.",
    ],
  ],
  reading: [
    {
      text:
        "Many populations around the world are ageing rapidly. In Japan, more than a quarter of the population is already over sixty-five, and several European countries are not far behind. This shift is the result of two positive trends: people are living longer thanks to better healthcare, and couples are having fewer children. Nevertheless, it presents serious economic challenges. As the proportion of older people rises, there are fewer workers paying taxes to support pensions and healthcare for retirees. Governments have responded in various ways. Some have raised the retirement age, arguing that people who live longer can also work longer. Others are encouraging immigration to fill gaps in the workforce, or investing in robots and automation, particularly in care for the elderly. Some economists, however, argue that the challenges are often exaggerated. Older people today are generally healthier than previous generations, and many continue to contribute to society through part-time work, volunteering and caring for grandchildren.",
      questions: [
        [
          "According to the passage, the ageing of populations is caused by ----.",
          [
            "longer life expectancy combined with lower birth rates",
            "a sudden increase in the number of older immigrants",
            "governments raising the retirement age in many countries",
            "the poor quality of healthcare in many countries",
            "the growing use of robots in the care of the elderly",
          ],
          "Metne göre bu değişim iki olumlu eğilimin sonucudur: insanlar daha uzun yaşıyor ve çiftler daha az çocuk sahibi oluyor.",
        ],
        [
          "It is stated in the passage that an ageing population creates economic difficulties because ----.",
          [
            "fewer working people pay the taxes that support older people",
            "older people refuse to pay taxes after they retire",
            "most older people continue to work full-time",
            "immigration has reduced the number of jobs available",
            "robots have replaced most workers in many sectors",
          ],
          "Yaşlıların oranı arttıkça emeklilik ve sağlık hizmetlerini desteklemek için vergi ödeyen çalışan sayısı azalır.",
        ],
        [
          "Which of the following is NOT mentioned as a government response to ageing populations?",
          [
            "Offering financial rewards to families with more children",
            "Raising the age at which people retire",
            "Encouraging people from other countries to come and work",
            "Investing in automation and robots",
            "Using technology in care for older people",
          ],
          "Metinde emeklilik yaşının yükseltilmesi, göçün teşvik edilmesi ve robot/otomasyon yatırımı geçer; çok çocuklu ailelere maddi ödül verilmesinden söz edilmez.",
        ],
        [
          "The economists mentioned at the end of the passage believe that ----.",
          [
            "the problems of ageing populations are sometimes overstated",
            "older people should be required to work full-time",
            "governments have not done enough to solve the problem",
            "volunteering is more important than paid work",
            "previous generations were healthier than today's",
          ],
          "Bu ekonomistler, zorlukların çoğu zaman abartıldığını savunur; bugünün yaşlıları daha sağlıklıdır ve topluma çeşitli yollarla katkıda bulunur.",
        ],
      ],
    },
    {
      text:
        "Bioluminescence, the ability of living organisms to produce light, is surprisingly common in nature. It is found in fireflies, certain fungi and, above all, in the ocean, where an estimated three-quarters of animals living in the open sea can produce some form of light. The light results from a chemical reaction in which a substance called luciferin reacts with oxygen, usually with the help of an enzyme. Unlike a light bulb, the process releases almost no heat, which is why it is sometimes described as 'cold light'. Marine animals use bioluminescence for a wide range of purposes. Some deep-sea fish have glowing lures that attract prey towards their jaws, while certain shrimp release clouds of luminous fluid to confuse predators. Other animals use light for camouflage: by glowing faintly on their undersides, they match the dim light coming from above and become almost invisible to predators looking up from below. Scientists have also learned to use the genes responsible for bioluminescence as tools in medical research.",
      questions: [
        [
          "According to the passage, bioluminescence is ----.",
          [
            "especially widespread among animals living in the open sea",
            "found only in insects such as fireflies",
            "a process that produces a great deal of heat",
            "rare in nature and difficult to study",
            "used by animals only to attract partners",
          ],
          "Metne göre biyolüminesans doğada şaşırtıcı ölçüde yaygındır ve özellikle açık denizde yaşayan hayvanların yaklaşık dörtte üçü ışık üretebilir.",
        ],
        [
          "Bioluminescence is described as 'cold light' because ----.",
          [
            "the chemical reaction that produces it gives off very little heat",
            "it is found mainly in the cold waters of the deep ocean",
            "it is produced only at night when temperatures are low",
            "it is blue rather than red or yellow",
            "it was first discovered in polar regions",
          ],
          "Ampulden farklı olarak süreç neredeyse hiç ısı yaymadığı için 'soğuk ışık' olarak adlandırılır.",
        ],
        [
          "Animals that glow faintly on their undersides do so in order to ----.",
          [
            "blend in with the light from above and hide from predators",
            "attract prey towards their mouths",
            "communicate with other members of their species",
            "confuse predators with clouds of glowing fluid",
            "keep themselves warm in deep water",
          ],
          "Bu hayvanlar alt taraflarında hafifçe parlayarak yukarıdan gelen loş ışıkla uyum sağlar ve aşağıdan bakan yırtıcılara neredeyse görünmez olur; yani kamuflaj amaçlıdır.",
        ],
        [
          "It can be understood from the last sentence that bioluminescence ----.",
          [
            "has practical applications outside the natural world",
            "is harmful to humans who study it",
            "can be used to cure most diseases",
            "is no longer of interest to scientists",
            "exists only in marine animals",
          ],
          "Son cümleye göre bilim insanları biyolüminesanstan sorumlu genleri tıbbi araştırmalarda araç olarak kullanmayı öğrenmiştir; yani doğa dışında da pratik uygulamaları vardır.",
        ],
      ],
    },
    {
      text:
        "Open-source software is software whose source code is made freely available, allowing anyone to study, modify and share it. At first glance, the model seems economically puzzling. Why would thousands of skilled programmers contribute their time to projects for which they receive no direct payment? Research suggests several motivations. Some developers contribute because they need the software themselves and benefit from improvements made by others. Others are motivated by the enjoyment of solving problems or by the desire to build a reputation that can lead to better job offers. In addition, many large technology companies now pay employees to work on open-source projects, because they rely on this software and want to influence its development. The results have been remarkable: open-source programs power much of the internet, including most web servers and the operating systems of many smartphones. Nevertheless, the model has weaknesses. Some widely used projects are maintained by only a handful of unpaid volunteers, and when security flaws are discovered, there may be nobody available to fix them quickly.",
      questions: [
        [
          "According to the passage, open-source software ----.",
          [
            "can be freely studied, changed and distributed by anyone",
            "is always written by programmers who receive no payment",
            "is used only by small technology companies",
            "has had little influence on the development of the internet",
            "is protected from all security problems",
          ],
          "Tanıma göre açık kaynak yazılımın kaynak kodu serbestçe erişilebilirdir ve herkes onu inceleyebilir, değiştirebilir ve paylaşabilir.",
        ],
        [
          "The author describes the model as \"economically puzzling\" because ----.",
          [
            "many skilled people contribute to it without being paid directly",
            "open-source software is more expensive than other software",
            "large companies refuse to use open-source programs",
            "it is difficult to calculate how much the software is worth",
            "programmers are paid more for open-source work",
          ],
          "Yazar bir sonraki cümlede açıklar: binlerce yetenekli programcı doğrudan ödeme almadıkları projelere neden zaman ayırır?",
        ],
        [
          "Which of the following is NOT given as a reason why people contribute to open-source projects?",
          [
            "They are required to do so by law.",
            "They need the software for their own use.",
            "They enjoy solving technical problems.",
            "They hope to improve their career prospects.",
            "Their employers pay them to do it.",
          ],
          "Metinde yazılıma kendileri için ihtiyaç duymak, problem çözmekten keyif almak, itibar kazanmak ve işverenlerin ödeme yapması geçer; yasal zorunluluktan söz edilmez.",
        ],
        [
          "According to the passage, one weakness of the open-source model is that ----.",
          [
            "important projects may depend on very few volunteers",
            "most open-source programs do not work on smartphones",
            "companies are not allowed to influence its development",
            "the source code is kept secret from most users",
            "volunteers usually charge high fees for their work",
          ],
          "Metne göre yaygın kullanılan bazı projeler yalnızca birkaç ücretsiz gönüllü tarafından sürdürülür ve güvenlik açıkları hızla düzeltilemeyebilir.",
        ],
      ],
    },
    {
      text:
        "The ability to delay gratification, to resist an immediate reward in favour of a larger one later, has long been linked to success in life. In a series of famous experiments begun in the 1960s, young children were offered a choice: they could eat one marshmallow immediately, or wait alone for several minutes and receive two. Follow-up studies years later reported that the children who had waited longer tended to achieve better academic results. These findings were widely interpreted as evidence that self-control is a stable personality trait that predicts future success. More recent research, however, has complicated this picture. When the experiment was repeated with a larger and more diverse group of children, the link with later achievement was much weaker, and it largely disappeared once factors such as family income were taken into account. Other studies found that children were more willing to wait when the adult running the experiment had previously kept a promise. This suggests that waiting may reflect a rational judgement about whether the environment is reliable rather than self-control alone.",
      questions: [
        [
          "According to the passage, the original follow-up studies suggested that ----.",
          [
            "children who waited longer later tended to do better at school",
            "most children chose to eat the marshmallow immediately",
            "self-control can easily be taught to young children",
            "family income has no effect on academic results",
            "children perform better when adults are present",
          ],
          "Metne göre ilk takip çalışmaları, daha uzun bekleyen çocukların daha iyi akademik sonuçlar elde etme eğiliminde olduğunu bildirmiştir.",
        ],
        [
          "The phrase \"complicated this picture\" means that more recent research ----.",
          [
            "made the original conclusions seem less simple and certain",
            "confirmed that self-control predicts success",
            "proved that the original experiments were never carried out",
            "showed that marshmallows are harmful to children",
            "made the experiments easier to repeat",
          ],
          "Yeni araştırmalar, öz denetimin başarıyı öngören sabit bir özellik olduğu yönündeki basit yorumu sorgulatmış, tabloyu daha karmaşık hâle getirmiştir.",
        ],
        [
          "It is stated in the passage that when the experiment was repeated with a larger group, ----.",
          [
            "the connection with later achievement became much weaker",
            "the children waited much longer than in the 1960s",
            "family income turned out to be unimportant",
            "the results were exactly the same as before",
            "fewer children agreed to take part",
          ],
          "Daha geniş ve çeşitli bir grupla tekrarlandığında sonraki başarıyla bağlantı çok zayıfladı ve aile geliri gibi etkenler hesaba katılınca büyük ölçüde ortadan kalktı.",
        ],
        [
          "The finding about adults who kept a promise suggests that ----.",
          [
            "children's decisions to wait may depend on how trustworthy their situation seems",
            "children always trust adults whom they do not know",
            "self-control is the only reason why children wait",
            "adults should never make promises to children",
            "children prefer one reward to two",
          ],
          "Son cümleye göre beklemek, öz denetimden çok, ortamın güvenilir olup olmadığına dair rasyonel bir yargıyı yansıtabilir.",
        ],
      ],
    },
    {
      text:
        "In 1799, French soldiers rebuilding a fort near the Egyptian town of Rosetta discovered a broken slab of dark stone covered in writing. The stone carried the same text in three scripts: ancient Greek, a cursive Egyptian script known as Demotic, and hieroglyphs. Because scholars could still read ancient Greek, they realised that the stone might provide the key to understanding hieroglyphs, which nobody had been able to read for more than a thousand years. The task nevertheless proved extremely difficult. Many scholars assumed that hieroglyphs were purely symbolic, each sign representing an idea rather than a sound. The breakthrough came in the 1820s, when the French scholar Jean-François Champollion showed that hieroglyphs combined both: some signs represented sounds, while others represented whole words or ideas. Champollion's knowledge of Coptic, a later form of the Egyptian language, was crucial to his success. His work opened up thousands of years of Egyptian history, allowing scholars to read inscriptions on temples, tombs and papyri for the first time.",
      questions: [
        [
          "According to the passage, the Rosetta Stone was important because ----.",
          [
            "it contained the same text in a script that scholars could already read",
            "it was the only surviving example of Demotic writing",
            "it was discovered by Champollion himself",
            "it explained the history of the Egyptian kings",
            "it was written entirely in hieroglyphs",
          ],
          "Taş aynı metni üç yazıyla taşıyordu ve bilim insanları antik Yunancayı okuyabildiği için hiyerogliflerin anahtarı olabileceğini fark ettiler.",
        ],
        [
          "It can be understood from the passage that many scholars failed to read hieroglyphs because ----.",
          [
            "they wrongly believed that the signs stood only for ideas",
            "they could not read ancient Greek",
            "the Rosetta Stone was badly damaged",
            "they did not have access to the stone",
            "they thought hieroglyphs were a form of Coptic",
          ],
          "Birçok bilgin hiyerogliflerin yalnızca sembolik olduğunu, her işaretin bir sesi değil bir fikri temsil ettiğini varsaymıştı; bu varsayım yanlıştı.",
        ],
        [
          "According to the passage, Champollion's success depended partly on ----.",
          [
            "his knowledge of a later stage of the Egyptian language",
            "his work as a soldier in Egypt",
            "the discovery of a second stone",
            "his belief that hieroglyphs were purely symbolic",
            "the help of the French army",
          ],
          "Metne göre Champollion'un Mısır dilinin sonraki bir biçimi olan Kıpticeyi bilmesi başarısında belirleyici olmuştur.",
        ],
        [
          "The passage is mainly about ----.",
          [
            "how a discovery made it possible to read an ancient writing system",
            "the military campaigns of the French army in Egypt",
            "the differences between ancient Greek and Coptic",
            "why hieroglyphs were no longer used after a thousand years",
            "the construction of temples and tombs in ancient Egypt",
          ],
          "Metin Rosetta Taşı'nın bulunmasından Champollion'un hiyeroglifleri çözmesine kadar, bir keşfin eski bir yazı sistemini okumayı nasıl mümkün kıldığını anlatır.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "Melis: I'm thinking of buying an electric car, but I'm worried about the range.\nHakan: ----\nMelis: Only about forty kilometres a day, to work and back.\nHakan: Then you've got nothing to worry about. Most models can go at least three hundred kilometres on a single charge.",
      [
        "How far do you usually drive on a normal day?",
        "Have you compared the prices of different models?",
        "Do you have a garage where you could charge it?",
        "Which colour are you thinking of getting?",
        "Why don't you take the bus to work instead?",
      ],
      "Melis'in 'Günde yalnızca kırk kilometre kadar' cevabı, Hakan'ın günlük ne kadar yol yaptığını sorduğunu gösterir.",
    ],
    [
      "Journalist: Your company has just announced record profits. To what do you owe this success?\nDirector: ----\nJournalist: Many of your competitors have done the same. What makes your approach different?\nDirector: We involve our customers in the design process from the very beginning.",
      [
        "Mainly to our decision to invest heavily in new product development.",
        "I'm afraid I can't comment on our profits at this stage.",
        "We expect next year to be even more difficult for us.",
        "Most of our employees have been with us for many years.",
        "The figures will be published on our website tomorrow.",
      ],
      "Gazetecinin 'Rakiplerinizin çoğu da aynısını yaptı' yorumu, direktörün belirli bir stratejiden (yeni ürün geliştirmeye yatırım) söz ettiğini gösterir.",
    ],
    [
      "Cem: The forecast says it's going to rain all weekend.\nNil: ----\nCem: We could, but the museum will be packed if everyone has the same idea.\nNil: True. Maybe we should just stay in and watch a film.",
      [
        "What a shame! Shall we visit the new museum instead of going hiking?",
        "Great, we'll be able to go to the beach on Saturday.",
        "I've never trusted the weather forecast anyway.",
        "Did you remember to bring your umbrella today?",
        "It rained all last weekend too, didn't it?",
      ],
      "Cem'in 'Yapabiliriz ama müze çok kalabalık olur' cevabı, Nil'in müzeye gitmeyi önerdiğini gösterir.",
    ],
    [
      "Patient: I've been having trouble sleeping for the past few weeks.\nDoctor: ----\nPatient: Yes, actually. I started a new job last month, and I've been very anxious about it.\nDoctor: That could well be the cause. Let's talk about some ways to manage that stress.",
      [
        "Has anything changed in your life recently?",
        "How many hours do you usually sleep?",
        "Do you drink coffee in the evenings?",
        "Have you tried taking sleeping pills?",
        "Does anyone in your family have the same problem?",
      ],
      "Hastanın 'Evet, aslında. Geçen ay yeni bir işe başladım' cevabı, doktorun hayatında son zamanlarda bir değişiklik olup olmadığını sorduğunu gösterir.",
    ],
    [
      "Student: Excuse me, I'd like to join the photography club.\nClub secretary: Great! ----\nStudent: Not really. I've only ever taken photos with my phone.\nClub secretary: That's no problem. We run beginners' workshops every Thursday evening.",
      [
        "Do you have any experience with professional cameras?",
        "Have you paid the membership fee already?",
        "Which department are you studying in?",
        "Did you see our exhibition last month?",
        "Would you like to see some of our photos?",
      ],
      "Öğrencinin 'Pek değil, yalnızca telefonumla fotoğraf çektim' cevabı, sekreterin profesyonel kamera deneyimini sorduğunu gösterir.",
    ],
  ],
  restatement: [
    [
      "The museum attracts far fewer visitors in winter than it does in summer.",
      [
        "Many more people visit the museum in summer than in winter.",
        "The museum is equally popular in summer and winter.",
        "Fewer people visit the museum in summer than in winter.",
        "The museum is closed in winter because there are few visitors.",
        "The number of visitors to the museum has fallen this winter.",
      ],
      "Kışın yazdan çok daha az ziyaretçi olması, yazın kıştan çok daha fazla kişinin ziyaret etmesiyle aynı anlamdadır.",
    ],
    [
      "No matter how hard he tried, he could not persuade the committee to change its decision.",
      [
        "Despite all his efforts, he failed to convince the committee to alter its decision.",
        "He did not try very hard to change the committee's decision.",
        "The committee changed its decision because he tried so hard.",
        "He persuaded the committee to change its decision after several attempts.",
        "The committee persuaded him not to try to change its decision.",
      ],
      "'No matter how hard he tried, he could not persuade' = 'tüm çabalarına rağmen ikna edemedi'.",
    ],
    [
      "It is unlikely that the new road will be completed before the end of next year.",
      [
        "The new road will probably not be finished until after the end of next year.",
        "The new road is certain to be completed by the end of next year.",
        "Work on the new road will begin at the end of next year.",
        "The new road was supposed to be completed last year.",
        "Nobody knows whether the new road will ever be built.",
      ],
      "'It is unlikely that ... before the end of next year' = 'yol muhtemelen gelecek yılın sonundan önce bitmeyecek'.",
    ],
    [
      "The author's second novel was not nearly as successful as her first.",
      [
        "The author's first novel was far more successful than her second.",
        "The author's second novel was slightly more successful than her first.",
        "Both of the author's novels were equally successful.",
        "The author wrote her second novel because the first was successful.",
        "Neither of the author's novels was successful.",
      ],
      "'not nearly as successful as' = 'çok daha az başarılı'; yani ilk roman ikincisinden çok daha başarılıydı.",
    ],
  ],
  paragraph: [
    [
      "In many countries, the four-wheeled shopping trolley is so familiar that it is hard to imagine supermarkets without it. Yet when it was introduced in the United States in the 1930s, customers were reluctant to use it. ---- To overcome this resistance, the inventor hired models to push trolleys around his stores, showing shoppers how convenient they were. Within a few years, the trolley had become standard.",
      [
        "Men felt it made them look weak, while women thought it looked too much like a baby's pram.",
        "Supermarkets at that time sold a much smaller range of products than they do today.",
        "Most shoppers in the 1930s travelled to the supermarket by bus or on foot.",
        "Today, many supermarkets require customers to insert a coin to use a trolley.",
        "The first supermarkets appeared in the United States in the early twentieth century.",
      ],
      "Boşluktan önce müşterilerin arabayı kullanmaya isteksiz olduğu, sonra 'this resistance' ifadesiyle bu direnç anlatılır; boşluğa direncin nedenini açıklayan cümle gelmelidir.",
    ],
    [
      "Some scientists believe that dogs were the first animals to be domesticated, possibly more than fifteen thousand years ago. ---- Wolves that were less fearful of humans may have begun scavenging near human camps, gaining access to food. Over many generations, these animals became tamer and gradually evolved into the dogs we know today.",
      [
        "According to one widely accepted theory, the process began not through deliberate breeding but through a natural association.",
        "Today, there are more than three hundred recognised dog breeds around the world.",
        "Dogs have a much better sense of smell than humans.",
        "Many people consider dogs to be loyal and intelligent companions.",
        "Cats were domesticated much later, probably in the Middle East.",
      ],
      "Boşluktan sonra evcilleşme sürecinin kurtların insan kamplarının yakınında yiyecek araması gibi doğal bir ilişkiyle başladığı anlatılır; boşluğa bu kuramı tanıtan cümle gelmelidir.",
    ],
    [
      "Ancient Roman concrete has survived for two thousand years in harbours and buildings, while much modern concrete begins to crumble after a few decades. ---- When seawater seeps into cracks in the concrete, it reacts with volcanic ash in the mixture to form new minerals that fill the cracks and strengthen the structure. Engineers are now studying this process to develop more durable materials.",
      [
        "Researchers have discovered that the secret lies partly in the materials the Romans used.",
        "Concrete is one of the most widely used building materials in the world today.",
        "The Romans also built an impressive network of roads across their empire.",
        "Modern buildings are usually designed to last for around fifty years.",
        "Many Roman buildings were destroyed during earthquakes.",
      ],
      "Boşluktan sonra deniz suyunun volkanik külle tepkimesi açıklanır; boşluğa sırrın Romalıların kullandığı malzemelerde yattığını söyleyen cümle gelerek geçişi sağlar.",
    ],
    [
      "Most people check their phones dozens of times a day, often without any clear reason. Psychologists explain that this behaviour is driven partly by the unpredictable nature of the rewards involved. ---- This uncertainty makes the habit particularly hard to break, in the same way that the unpredictable rewards of gambling keep people playing.",
      [
        "Sometimes there is an interesting message or notification, but often there is nothing at all.",
        "Smartphones were first introduced to the mass market in the early 2000s.",
        "Many people use their phones as alarm clocks in the morning.",
        "Some phones have batteries that last for several days.",
        "Children are increasingly given phones at a young age.",
      ],
      "Boşluktan sonraki 'This uncertainty' ifadesi, boşluğa ödüllerin öngörülemezliğini somutlaştıran cümlenin geldiğini gösterir: bazen ilginç bir mesaj vardır, çoğu zaman hiçbir şey yoktur.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "The giant panda was once considered one of the world's most endangered animals.",
        "Thanks to decades of conservation efforts, including the creation of protected reserves, its population has slowly increased.",
        "Pandas spend up to fourteen hours a day eating bamboo.",
        "In 2016, its status was officially changed from 'endangered' to 'vulnerable'.",
        "Experts warn, however, that climate change could destroy much of the bamboo forest on which the species depends.",
      ],
      odd: 2,
      why: "Parça pandaların korunma başarısını ve geleceğe yönelik tehdidi anlatır. III. cümle pandaların günde kaç saat bambu yediğine geçerek akışı bozar; IV. cümle nüfus artışının sonucunu (statü değişikliği) verir.",
    },
    {
      sentences: [
        "Recycling paper saves energy and reduces the need to cut down trees.",
        "However, paper cannot be recycled indefinitely, because its fibres become shorter each time it is processed.",
        "After five to seven cycles, the fibres are too short to bind together and must be mixed with new material.",
        "Many offices have reduced their use of paper by storing documents digitally.",
        "This is why most recycled paper products still contain a proportion of fresh wood pulp.",
      ],
      odd: 3,
      why: "Parça kâğıdın neden sınırsız geri dönüştürülemediğini anlatır. IV. cümle ofislerin dijitalleşmesine geçer; V. cümledeki 'This is why' III. cümleye bağlanır.",
    },
    {
      sentences: [
        "The first successful powered flight took place in 1903, when the Wright brothers flew for twelve seconds.",
        "Bicycles were very popular in the United States at that time.",
        "Within just over sixty years, humans had developed jet aircraft and sent astronauts into space.",
        "In 1969, only sixty-six years after that first short flight, astronauts walked on the moon.",
        "Few technologies in history have advanced so rapidly.",
      ],
      odd: 1,
      why: "Parça havacılığın ilk uçuştan Ay'a inişe kadar hızlı gelişimini anlatır. II. cümle o dönemde bisikletin popülerliğine geçerek akışı bozar.",
    },
    {
      sentences: [
        "Sharks have existed for more than four hundred million years, long before the dinosaurs.",
        "Despite their fearsome reputation, they kill fewer than ten people a year on average.",
        "Humans, by contrast, kill tens of millions of sharks every year, mainly for their fins.",
        "As a result, many shark species are now threatened with extinction.",
        "Dolphins are known for their intelligence and playful behaviour.",
      ],
      odd: 4,
      why: "Parça köpekbalıklarının insanlardan çok insanlar tarafından tehdit edildiğini anlatır. V. cümle yunusların zekâsına geçerek konudan sapar.",
    },
    {
      sentences: [
        "Learning to play a musical instrument has benefits that extend beyond music itself.",
        "Studies have found that children who receive music lessons often show improvements in memory and attention.",
        "Playing an instrument requires the brain to coordinate vision, hearing and movement at the same time.",
        "The piano was invented in Italy around the year 1700.",
        "This kind of complex activity may strengthen connections between different areas of the brain.",
      ],
      odd: 3,
      why: "Parça enstrüman çalmanın bilişsel faydalarını anlatır. IV. cümle piyanonun icadına geçerek akışı bozar; V. cümledeki 'This kind of complex activity' III. cümleye bağlanır.",
    },
  ],
};
