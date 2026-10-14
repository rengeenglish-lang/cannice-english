import type { Deneme } from "./types";

export const DENEME_44: Deneme = {
  no: 44,
  vocab: [
    [
      "The launch was ---- at the last minute because of strong winds over the launch site.",
      ["scrubbed", "celebrated", "accelerated", "approved", "broadcast"],
      "Fırlatma alanındaki şiddetli rüzgârlar fırlatmanın son anda 'iptal edildiğini, ertelendiğini' (scrubbed) gösterir. Diğer fiiller bu sonucu anlatmaz.",
    ],
    [
      "The telescope's images were so ---- that astronomers could see individual stars in a distant galaxy.",
      ["sharp", "blurred", "faint", "dull", "vague"],
      "Uzak bir galaksideki tek tek yıldızların görülebilmesi görüntülerin çok 'net' (sharp) olduğunu gösterir. Diğer sıfatlar tersini anlatır.",
    ],
    [
      "The spacecraft will ---- the planet for two years, sending back data about its atmosphere.",
      ["orbit", "abandon", "ignore", "destroy", "avoid"],
      "Uzay aracının iki yıl boyunca gezegenin 'yörüngesinde dönmesi' (orbit) ve atmosferi hakkında veri göndermesi beklenir.",
    ],
    [
      "Astronauts must ---- months of intensive training before they are allowed to go into space.",
      ["undergo", "undertake", "underline", "undermine", "underestimate"],
      "'undergo training' = 'eğitimden geçmek' doğru eşdizimdir. Diğer fiiller biçimce benzer ama anlamca uymaz.",
    ],
    [
      "The mission was ---- after the rocket's engine failed during the first test.",
      ["called off", "taken up", "put on", "looked up", "brought in"],
      "Motor arızası üzerine görevin 'iptal edilmesi' 'call off' ile anlatılır.",
    ],
    [
      "Scientists remain ---- about the possibility of finding life on Mars, but they continue to search.",
      ["cautious", "certain", "careless", "reckless", "indifferent"],
      "'but they continue to search' ifadesi bilim insanlarının 'temkinli' (cautious) olduğunu ama aramayı sürdürdüğünü gösterir. 'certain' kesinlik, 'indifferent' ilgisizlik bildirir.",
    ],
  ],
  grammar: [
    [
      "The first images from the new telescope ---- next week.",
      ["will be released", "will release", "are releasing", "have released", "released"],
      "Görüntüler 'yayımlanacak' nesnelerdir; gelecek zamanda edilgen 'will be released' gerekir.",
    ],
    [
      "If the rocket had not exploded, the satellite ---- in orbit now.",
      ["would be", "will be", "had been", "is", "would have been being"],
      "Karma koşul: geçmişteki bir olay (roket patlamasaydı) şimdiki bir durumu (uydu şu an yörüngede olurdu) etkiler: 'would be'.",
    ],
    [
      "The observatory ---- the comet was first seen is high in the Andes.",
      ["where", "which", "what", "whose", "who"],
      "'The observatory' ismini niteleyen ve yer bildiren ilgi zarfı gerekir; edilgen 'was seen' nesne almadığından 'where' kullanılır.",
    ],
    [
      "Never before ---- so close to the surface of the Sun.",
      ["had a spacecraft flown", "a spacecraft had flown", "a spacecraft flew", "flew a spacecraft", "has flown a spacecraft"],
      "'Never before' cümle başında devrik yapı ister: 'had a spacecraft flown'.",
    ],
    [
      "The meteorite is believed ---- from Mars millions of years ago.",
      ["to have come", "to come", "coming", "having come", "that it came"],
      "'is believed' yapısından sonra 'to + fiil' gelir; olay geçmişte gerçekleştiği için 'to have come' gerekir.",
    ],
    [
      "By the time the probe reaches Pluto, it ---- for almost ten years.",
      ["will have been travelling", "will travel", "has been travelling", "travelled", "is travelling"],
      "Gelecekteki bir noktaya kadar süregelen bir eylem future perfect continuous ile anlatılır: 'will have been travelling'.",
    ],
    [
      "Astronauts ---- exercise for two hours every day to prevent their muscles from weakening.",
      ["have to", "needn't", "mightn't", "wouldn't", "couldn't"],
      "Kaslarının zayıflamasını önlemek için günde iki saat egzersiz yapmak bir zorunluluktur: 'have to'.",
    ],
    [
      "The astronomer, ---- discovery changed our view of the universe, was largely ignored during her lifetime.",
      ["whose", "who", "which", "that", "her"],
      "'discovery' gökbilimciye aittir; iyelik bildiren ilgi zamiri 'whose' gerekir.",
    ],
    [
      "---- the planet is very far away, astronomers have been able to study its atmosphere.",
      ["Although", "Because", "Despite", "Unless", "Due to"],
      "Gezegenin çok uzak olmasına 'rağmen' atmosferinin incelenebilmesi zıtlık bildirir; 'Although' gerekir.",
    ],
    [
      "The further a galaxy is from us, ---- it appears to be moving away.",
      ["the faster", "faster", "the fastest", "so fast", "as fast"],
      "'The ..., the ...' kalıbında ikinci kısım 'the + karşılaştırma' ile kurulur: 'the faster'.",
    ],
  ],
  cloze: [
    {
      text:
        "On 16 June 1963, the Soviet cosmonaut Valentina Tereshkova became the first woman to travel into space. She was not a pilot or an engineer but a textile factory worker {1} hobby was parachuting. In the early 1960s, the Soviet space programme decided to recruit women, partly to beat the United States to yet another space 'first'. More than four hundred women applied, and Tereshkova was one of five who were selected for training. Parachuting experience was essential, {2} cosmonauts at that time had to eject from their capsules and land separately. During her flight in Vostok 6, Tereshkova orbited the Earth forty-eight times in almost three days, {3} was longer than the total flight time of all the American astronauts who had flown until then. The mission was not without problems: she felt sick for much of the flight, and an error in the spacecraft's programming at first set it on a course that would have taken it further away from the Earth, {4} she noticed it and the controllers corrected it. Remarkably, it was almost twenty years before another woman went into space. Tereshkova later became a politician, and in 2013 she said that she would be willing to go on a one-way mission to Mars {5} the opportunity arose.",
      blanks: [
        [
          "(17) ----",
          ["whose", "who", "which", "that", "her"],
          "'hobby' işçiye aittir; iyelik bildiren ilgi zamiri 'whose' gerekir.",
        ],
        [
          "(18) ----",
          ["because", "although", "unless", "so that", "whereas"],
          "Paraşüt deneyiminin gerekli olmasının nedeni kozmonotların kapsülden fırlayıp ayrı inmesidir; 'because' gerekir.",
        ],
        [
          "(19) ----",
          ["which", "what", "who", "it", "where"],
          "Virgülden sonra önceki cümlenin bütününe (yaklaşık üç günlük uçuş) gönderme yapan ilgi zamiri 'which' gerekir.",
        ],
        [
          "(20) ----",
          ["but", "so", "because", "or", "unless"],
          "Programlama hatasının aracı uzaklaştıracak olması ile onun bunu fark edip düzeltilmesi arasında zıtlık vardır; 'but' gerekir.",
        ],
        [
          "(21) ----",
          ["if", "unless", "although", "until", "whereas"],
          "Fırsat 'olursa' Mars'a tek yönlü bir göreve gitmeye istekli olduğu anlatılır; koşul bildiren 'if' gerekir.",
        ],
      ],
    },
    {
      text:
        "Early on the morning of 1 September 1859, the English astronomer Richard Carrington was drawing sunspots when he saw two brilliant patches of white light suddenly appear on the Sun's surface. He had witnessed the first recorded solar flare. About seventeen hours later, a huge cloud of charged particles thrown out by the Sun struck the Earth, causing the most powerful geomagnetic storm in recorded history. Auroras, {1} are normally seen only near the poles, appeared as far south as Cuba and Hawaii. In some places, the sky was so bright {2} people could read newspapers in the middle of the night, and birds began singing, thinking that dawn had arrived. The storm also affected the telegraph system, the most advanced technology of the time. Operators received electric shocks, sparks flew from the equipment, and some telegraph paper caught fire. Remarkably, some operators found that they could disconnect their batteries and still send messages, {3} the storm itself was producing electric currents in the wires. Scientists warn that if a storm of similar strength struck today, it could cause enormous damage to satellites, power grids and communication networks, {4} much of modern society depends on electricity. Such an event is not just a theoretical possibility: in 2012, a powerful burst of solar material crossed the Earth's orbit, missing our planet {5} only about a week.",
      blanks: [
        [
          "(22) ----",
          ["which", "who", "where", "what", "that"],
          "Virgüllerle ayrılmış, 'Auroras' ismini niteleyen ve özne görevindeki ilgi zamiri 'which' gerekir; 'that' virgüllü yapıda kullanılmaz.",
        ],
        [
          "(23) ----",
          ["that", "which", "as", "than", "so"],
          "'so bright that' yapısı sonuç bildirir: gökyüzü o kadar parlaktı ki insanlar gece gazete okuyabildi.",
        ],
        [
          "(24) ----",
          ["because", "although", "unless", "so that", "until"],
          "Pilleri sökülmüş hâlde bile mesaj gönderilebilmesinin nedeni fırtınanın tellerde akım üretmesidir; 'because' gerekir.",
        ],
        [
          "(25) ----",
          ["since", "unless", "although", "until", "whereas"],
          "Büyük zarar görülmesinin nedeni modern toplumun büyük ölçüde elektriğe bağlı olmasıdır; neden bildiren 'since' gerekir.",
        ],
        [
          "(26) ----",
          ["by", "for", "at", "in", "with"],
          "'miss something by + miktar' = 'bir şeyi ... farkla ıskalamak' yapısında 'by' gerekir.",
        ],
      ],
    },
  ],
  completion: [
    [
      "The astronauts had to return to Earth earlier than planned ----.",
      [
        "after a leak was found in the spacecraft's cooling system",
        "because the mission had been a complete success",
        "so that they could spend more time in space",
        "although their supplies were running low",
        "unless the engineers solve the problem",
      ],
      "Planlanandan erken dönmenin mantıklı nedeni soğutma sisteminde sızıntı bulunmasıdır.",
    ],
    [
      "Only after years of observation ----.",
      [
        "did astronomers confirm the planet's existence",
        "astronomers confirmed the planet's existence",
        "astronomers had confirmed the planet's existence",
        "confirmed astronomers the planet's existence",
        "astronomers will confirm the planet's existence",
      ],
      "'Only after ...' cümle başında yer aldığında ana cümle devrik olur; geçmiş zamanda 'did' kullanılır.",
    ],
    [
      "----, the engineers decided to delay the launch.",
      [
        "Concerned about a crack in one of the fuel tanks",
        "Having tested every part successfully",
        "Because the weather was perfect",
        "Unless the rocket is ready in time",
        "So that the launch could happen sooner",
      ],
      "Fırlatmayı erteleme kararının mantıklı nedeni yakıt tanklarından birindeki çatlaktan endişe duymalarıdır.",
    ],
    [
      "If we find water on Mars, ----.",
      [
        "it will be easier to set up a base there",
        "it would have been easier to set up a base",
        "it was easier to set up a base there",
        "it had been easy to set up a base",
        "it is being easier to set up a base",
      ],
      "Birinci tip koşul (If + şimdiki zaman) ana cümlede 'will + yalın fiil' ister.",
    ],
    [
      "Telescopes are often built on high mountains ----.",
      [
        "to get above the clouds and the thick lower atmosphere",
        "because the air there is thicker and wetter",
        "although the views are worse from there",
        "unless the mountains are covered in snow",
        "so that they would be closer to cities",
      ],
      "Teleskopların yüksek dağlara kurulmasının mantıklı amacı bulutların ve kalın alt atmosferin üstüne çıkmaktır.",
    ],
    [
      "The Moon has no atmosphere; ----.",
      [
        "as a result, its sky always looks black",
        "for example, it rains there every day",
        "however, its sky is bright blue",
        "in other words, it has a thick atmosphere",
        "similarly, it has strong winds",
      ],
      "Ay'ın atmosferi olmadığı söylenir; sonuç olarak gökyüzü hep siyah görünür.",
    ],
    [
      "The rover, ----, has travelled more than twenty kilometres.",
      [
        "which landed on Mars in 2021",
        "that landed on Mars in 2021",
        "who landed on Mars in 2021",
        "it landed on Mars in 2021",
        "whose landed on Mars in 2021",
      ],
      "Virgüllerle ayrılmış, gezgini niteleyen ve özne görevindeki ilgi zamiri 'which' olmalıdır.",
    ],
    [
      "No sooner had the rocket left the launch pad ----.",
      [
        "than one of its engines shut down",
        "when one of its engines shut down",
        "one of its engines had shut down",
        "so one of its engines shut down",
        "and one of its engines will shut down",
      ],
      "'No sooner had ...' kalıbı 'than' ile tamamlanır.",
    ],
    [
      "Although Venus is further from the Sun than Mercury, ----.",
      [
        "it is hotter than any other planet",
        "it is about the same size as the Earth",
        "it can be seen without a telescope",
        "it has no moons of its own",
        "it spins very slowly",
      ],
      "'Although' beklentiye ters bir durum ister: Venüs Güneş'e Merkür'den uzak olmasına rağmen güneş sisteminin en sıcak gezegenidir.",
    ],
    [
      "The night sky in the desert was so clear ----.",
      [
        "that we could see the Milky Way with our own eyes",
        "because there were no clouds at all",
        "although the Moon was very bright",
        "which we photographed for hours",
        "unless the wind blows the sand",
      ],
      "'so ... that' yapısı sonuç ister: çölde gece gökyüzü o kadar açıktı ki Samanyolu'nu çıplak gözle görebildik.",
    ],
  ],
  enTr: [
    [
      "The space agency has announced that it will send a crewed mission to the Moon within the next five years.",
      [
        "Uzay ajansı, beş yıl içinde Ay'a insanlı görev göndereceğini açıkladı.",
        "Uzay ajansı, beş yıl önce Ay'a insanlı bir görev gönderdi.",
        "Uzay ajansı, Ay'a insanlı bir görev gönderme planından tamamen vazgeçtiğini açıkladı.",
        "Ay'a insansız bir araç beş yıl içinde ulaşacak.",
        "Uzay ajansı, Ay'a gidecek astronotları beş yıldır eğitiyor.",
      ],
      "'has announced that it will send a crewed mission to the Moon within the next five years' = 'önümüzdeki beş yıl içinde Ay'a insanlı bir görev göndereceğini açıkladı'.",
    ],
    [
      "Had the engineers not noticed the fault, the satellite would have been lost.",
      [
        "Mühendisler arızayı fark etmeseydi, uydu kaybolurdu.",
        "Mühendisler arızayı fark ettiği hâlde uydu kayboldu.",
        "Uydu kaybolduktan sonra mühendisler arızayı fark etti.",
        "Mühendisler arızayı fark etmediği için uydu kayboldu.",
        "Mühendisler uyduyu kaybetmemek için arıza çıkardı.",
      ],
      "'Had the engineers not noticed' devrik üçüncü tip koşuldur = 'fark etmeseydi'; 'would have been lost' = 'kaybolurdu'.",
    ],
    [
      "It is not the size of a planet but its distance from its star that determines whether it could support life.",
      [
        "Gezegende yaşam olup olamayacağını boyutu değil, yıldızına uzaklığı belirler.",
        "Bir gezegenin yaşamı desteklemesi için hem büyük hem de yıldızına yakın olması gerekir.",
        "Yıldızlarına çok uzak olan gezegenler her zaman ve her koşulda yaşamı destekler.",
        "Bir gezegenin boyutu, yıldızına olan uzaklığını belirler.",
        "Büyük gezegenlerde yaşam olması daha olasıdır.",
      ],
      "'It is not the size ... but its distance from its star that determines ...' = 'belirleyen şey boyutu değil, yıldızına olan uzaklığıdır'.",
    ],
  ],
  trEn: [
    [
      "Bu teleskop, şimdiye kadar yapılmış en büyük teleskoplardan biridir.",
      [
        "This telescope is one of the largest ever built.",
        "This telescope is the smallest ever built.",
        "This telescope will be the largest ever built.",
        "Several larger telescopes have been built in recent years.",
        "This telescope was built to replace a larger one.",
      ],
      "'şimdiye kadar yapılmış en büyük teleskoplardan biri' = one of the largest ever built.",
    ],
    [
      "Astronotlar, uzay istasyonunda altı ay geçirdikten sonra Dünya'ya döndü.",
      [
        "After six months on the space station, the astronauts came home.",
        "The astronauts will spend six months on the space station.",
        "The astronauts left the space station to return to Earth six months ago.",
        "The space station returned to Earth after six months.",
        "The astronauts stayed on the space station for six days.",
      ],
      "'altı ay geçirdikten sonra Dünya'ya döndü' = returned to Earth after spending six months.",
    ],
    [
      "Bilim insanları, bu yıldızın birkaç milyon yıl içinde patlayacağını tahmin ediyor.",
      [
        "Scientists predict that this star will explode within a few million years.",
        "Scientists say that this star exploded a few million years ago.",
        "This star is too small to explode, according to scientists.",
        "Scientists have been watching this star explode for millions of years.",
        "Scientists doubt that this star will ever change.",
      ],
      "'birkaç milyon yıl içinde patlayacağını tahmin ediyor' = predict that this star will explode within a few million years.",
    ],
  ],
  reading: [
    {
      text:
        "On 20 July 1969, as the lunar module of Apollo 11 descended towards the surface of the Moon, alarms suddenly began to sound. The guidance computer was reporting an error known as '1202', and neither Neil Armstrong nor Buzz Aldrin knew what it meant. In Mission Control in Houston, a young engineer named Jack Garman, who had studied the computer's software in detail, quickly recognised that the alarm meant the computer was overloaded but was still performing its most important tasks. The mission was allowed to continue. The computer had been designed by a team at the Massachusetts Institute of Technology led by Margaret Hamilton, who insisted that it should be able to drop less important jobs when it had too much to do. This feature probably saved the landing. Meanwhile, Armstrong saw that the computer was taking them towards a field of large boulders. He took manual control and flew the module further, searching for a safe place to land. When they finally touched down, they had only about twenty-five seconds of fuel left before they would have had to abort. A few hours later, Armstrong became the first person to walk on the Moon. The guidance computer, by modern standards, had less memory than a simple pocket calculator.",
      questions: [
        [
          "According to the passage, the '1202' alarm meant that ----.",
          [
            "the computer had too much work but was still functioning",
            "the lunar module was running out of fuel",
            "the astronauts had made a serious mistake",
            "the computer had stopped working completely",
            "the module had landed on a boulder",
          ],
          "Metne göre alarm bilgisayarın aşırı yüklendiğini ama hâlâ en önemli görevlerini yerine getirdiğini gösteriyordu.",
        ],
        [
          "Margaret Hamilton's design was important because the computer ----.",
          [
            "could give up minor tasks when overloaded",
            "had more memory than any other computer",
            "could land the module without the astronauts",
            "never produced any alarms",
            "was built entirely by hand",
          ],
          "Metne göre Hamilton bilgisayarın çok işi olduğunda daha az önemli işleri bırakabilmesinde ısrar etmişti; bu özellik muhtemelen inişi kurtardı.",
        ],
        [
          "Why did Armstrong take manual control of the module?",
          [
            "It was heading for an area covered with large rocks.",
            "The computer had stopped working.",
            "Mission Control ordered him to do so.",
            "He wanted to land closer to the base.",
            "The fuel tank had started to leak.",
          ],
          "Metinde Armstrong'un bilgisayarın onları büyük kayalarla dolu bir alana götürdüğünü görünce manuel kontrolü aldığı belirtilir.",
        ],
        [
          "The comparison with a pocket calculator emphasises ----.",
          [
            "how weak the computer was by modern standards",
            "how expensive the computer was to design and build",
            "how easy the computer was to use",
            "why the computer produced so many alarms",
            "that calculators were used on the Moon",
          ],
          "Rehber bilgisayarının basit bir cep hesap makinesinden daha az belleğe sahip olması, bugünün ölçülerine göre gücünün ne kadar sınırlı olduğunu vurgular.",
        ],
      ],
    },
    {
      text:
        "Betelgeuse, the bright red star that marks the shoulder of the constellation Orion, is one of the largest stars visible to the naked eye. If it were placed at the centre of our solar system, its outer layers would extend beyond the orbit of Mars. It is also near the end of its life, and astronomers expect it eventually to explode as a supernova. In late 2019 and early 2020, Betelgeuse suddenly became much dimmer, losing more than half of its usual brightness. The change was so noticeable that even amateur stargazers saw it, and many people wondered whether the explosion was about to happen. If it did, the supernova would be visible in daylight for weeks and as bright as the half Moon at night. However, observations with large telescopes later showed that the dimming had a less dramatic cause. The star had thrown off a huge cloud of gas, which cooled and formed dust that temporarily blocked part of its light. By the middle of 2020, Betelgeuse had returned to its normal brightness. Astronomers now think that the explosion is unlikely to happen for perhaps another hundred thousand years, although there is no way to be completely sure. Because the star is about seven hundred light years away, the explosion would pose no danger to the Earth.",
      questions: [
        [
          "The reference to the orbit of Mars is used to show ----.",
          [
            "how enormous Betelgeuse is",
            "how close Betelgeuse is to us",
            "where Betelgeuse is located",
            "how hot Betelgeuse is",
            "when Betelgeuse will explode",
          ],
          "Betelgeuse güneş sisteminin merkezine konsaydı dış katmanlarının Mars'ın yörüngesini aşması yıldızın ne kadar büyük olduğunu gösterir.",
        ],
        [
          "Why did many people wonder whether Betelgeuse was about to explode?",
          [
            "It suddenly lost much of its brightness.",
            "It became much brighter than usual.",
            "It moved to a different part of the sky.",
            "Astronomers announced the date of the explosion.",
            "It changed from red to blue.",
          ],
          "Metne göre yıldız aniden normal parlaklığının yarısından fazlasını kaybetti ve pek çok kişi patlamanın yakın olup olmadığını merak etti.",
        ],
        [
          "According to the passage, the dimming was caused by ----.",
          [
            "dust formed from gas that the star had ejected",
            "the beginning of a supernova explosion",
            "a planet passing in front of the star",
            "a fault in the telescopes",
            "clouds in the Earth's atmosphere",
          ],
          "Metne göre yıldız büyük bir gaz bulutu fırlatmış, bu gaz soğuyup ışığının bir kısmını geçici olarak engelleyen toz oluşturmuştur.",
        ],
        [
          "It can be inferred from the last sentence that ----.",
          [
            "a Betelgeuse supernova would be safe to watch",
            "the explosion would destroy the Earth",
            "Betelgeuse is the closest star to the Sun",
            "the explosion will happen next year",
            "people should prepare for the explosion",
          ],
          "Son cümleye göre yıldız yaklaşık yedi yüz ışık yılı uzakta olduğu için patlama Dünya için tehlike oluşturmaz.",
        ],
      ],
    },
    {
      text:
        "In 1950, while having lunch with colleagues at the Los Alamos laboratory in New Mexico, the physicist Enrico Fermi is said to have asked a simple question: 'Where is everybody?' His point was this. The Milky Way galaxy contains hundreds of billions of stars, many of them billions of years older than the Sun. Even if only a tiny fraction of them have planets where intelligent life developed, there should be many civilisations, and some of them should have had plenty of time to spread across the galaxy. Yet we have found no evidence of them at all. This contradiction became known as the Fermi paradox. Scientists have proposed many possible explanations. Perhaps intelligent life is far rarer than we think, because the conditions needed for it are extremely unusual. Perhaps civilisations tend to destroy themselves before they can travel between stars. Perhaps the distances are simply too great, or other civilisations communicate in ways we cannot detect. Some have even suggested that advanced aliens may deliberately avoid contact with us, as we might avoid disturbing animals in a nature reserve. None of these ideas can yet be tested, and the question remains one of the great unsolved puzzles of science.",
      questions: [
        [
          "According to the passage, Fermi's question arose because ----.",
          [
            "there should be many civilisations, but we see no sign of them",
            "scientists had just discovered alien radio signals",
            "the galaxy contains very few stars",
            "life on Earth is very young",
            "his colleagues had seen a strange object",
          ],
          "Metne göre galakside pek çok uygarlık olması gerekir, ama hiçbirine dair kanıt bulunamamıştır; bu çelişki Fermi'nin sorusunun temelidir.",
        ],
        [
          "Which of the following is NOT given as a possible explanation?",
          [
            "Aliens have already visited the Earth in secret.",
            "Intelligent life may be very rare.",
            "Civilisations may destroy themselves.",
            "The distances between stars may be too great.",
            "Aliens may communicate in ways we cannot detect.",
          ],
          "Metinde uzaylıların Dünya'yı gizlice ziyaret ettiği bir açıklama olarak sunulmaz.",
        ],
        [
          "The comparison with a nature reserve suggests that aliens might ----.",
          [
            "choose not to interfere with us",
            "want to study us in a zoo",
            "be afraid of human beings",
            "live in the forests of the Earth",
            "try to protect our animals",
          ],
          "Doğa koruma alanındaki hayvanları rahatsız etmemek benzetmesi, gelişmiş uzaylıların bizimle temastan bilinçli olarak kaçınabileceğini ima eder.",
        ],
        [
          "The author's conclusion is that the Fermi paradox ----.",
          [
            "has not yet been resolved",
            "has been completely explained",
            "is based on a mistake",
            "was solved by Fermi himself",
            "is no longer of interest to scientists",
          ],
          "Son cümlede bu fikirlerin henüz test edilemediği ve sorunun bilimin çözülmemiş büyük bulmacalarından biri olduğu belirtilir.",
        ],
      ],
    },
    {
      text:
        "On 16 November 1974, the giant radio telescope at Arecibo in Puerto Rico sent a short message into space. It was aimed at a cluster of stars called M13, about twenty-five thousand light years away. The message, designed by the astronomer Frank Drake with help from Carl Sagan and others, consisted of 1,679 binary digits. This number was chosen deliberately: it can only be divided by 23 and 73, so if the digits were arranged in a grid of 73 rows and 23 columns, they would form a simple picture. The picture included the numbers one to ten, the chemical elements that make up DNA, a stick figure of a human, a diagram of the solar system and a sketch of the telescope itself. The broadcast lasted less than three minutes. In fact, the message was intended less as a serious attempt to contact aliens than as a demonstration of what the telescope could do. Since the stars of M13 will have moved by the time the signal arrives, it will probably miss its target. Even if someone did receive it and reply, the answer would take another fifty thousand years to reach us. Sadly, the Arecibo telescope collapsed in 2020 after several of its support cables broke.",
      questions: [
        [
          "Why was the number 1,679 chosen for the message?",
          [
            "It could be arranged into a grid to form a picture.",
            "It was the number of stars in M13.",
            "It was Frank Drake's favourite number.",
            "It was the distance to M13 in light years.",
            "It was the largest number the telescope could send.",
          ],
          "Metne göre 1.679 yalnızca 23 ve 73'e bölünebilir; bu yüzden rakamlar 73 satır ve 23 sütunluk bir ızgaraya dizilince basit bir resim oluşur.",
        ],
        [
          "Which of the following was NOT included in the picture?",
          [
            "A map of the Earth's continents",
            "The numbers one to ten",
            "The elements that make up DNA",
            "A simple human figure",
            "A diagram of the solar system",
          ],
          "Metinde resimde bir ila on arası sayılar, DNA'yı oluşturan elementler, bir insan figürü, güneş sistemi diyagramı ve teleskopun çizimi sayılır; kıtaların haritasından söz edilmez.",
        ],
        [
          "According to the passage, the main purpose of the message was to ----.",
          [
            "show the abilities of the telescope",
            "start a conversation with aliens",
            "test a new type of computer",
            "measure the distance to M13",
            "celebrate Carl Sagan's birthday",
          ],
          "Metinde mesajın uzaylılarla temas kurmaktan çok teleskopun neler yapabileceğini gösterme amacı taşıdığı belirtilir.",
        ],
        [
          "It can be inferred from the passage that a reply to the message ----.",
          [
            "is very unlikely to arrive in our lifetimes",
            "has already been received",
            "will arrive in about twenty-five years",
            "would be sent to Puerto Rico",
            "was blocked by the telescope's collapse",
          ],
          "Cevap gelse bile bize ulaşması elli bin yıl daha alacağı için yaşamlarımız boyunca gelmesi son derece olasılık dışıdır.",
        ],
      ],
    },
    {
      text:
        "In 2005, the Cassini spacecraft, which had been orbiting Saturn for about a year, made a surprising discovery. As it flew past Enceladus, a small, icy moon only about five hundred kilometres across, its instruments detected jets of water vapour and ice shooting out from cracks near the moon's south pole. Scientists later concluded that beneath the frozen surface lies a global ocean of salty liquid water, heated by tidal forces from Saturn. In 2015, Cassini flew directly through one of the plumes and found molecules that, on Earth, are associated with hot springs on the ocean floor, environments where life is abundant. This made Enceladus one of the most promising places to search for life beyond Earth. By 2017, Cassini was running out of fuel. Rather than leave it to drift and risk it crashing into Enceladus or another moon that might contain life, and contaminating it with bacteria from Earth, scientists decided to end the mission deliberately. In its 'Grand Finale', the spacecraft made a series of daring dives between Saturn and its rings before plunging into the planet's atmosphere, sending back data until the very last moment.",
      questions: [
        [
          "What did Cassini first detect at Enceladus?",
          [
            "Jets of vapour and ice from its surface",
            "Living bacteria in the moon's ocean",
            "A thick atmosphere made mostly of nitrogen gas",
            "Volcanoes erupting hot lava",
            "Rings similar to those of Saturn",
          ],
          "Metne göre Cassini uydunun güney kutbu yakınındaki çatlaklardan fışkıran su buharı ve buz jetleri tespit etmiştir.",
        ],
        [
          "According to the passage, the ocean beneath Enceladus's surface ----.",
          [
            "is kept liquid by Saturn's gravity",
            "is made of fresh water with no salt in it at all",
            "is heated by sunlight",
            "is frozen solid",
            "is shallower than a lake",
          ],
          "Metinde okyanusun Satürn'ün kütle çekiminin neden olduğu esneme ve sıkışma sayesinde sıcak tutulduğu belirtilir.",
        ],
        [
          "Why did scientists decide to crash Cassini into Saturn?",
          [
            "To avoid contaminating a moon that might support life",
            "Because Saturn's rings were blocking its signals",
            "To study the inside of Enceladus",
            "Because it had found life on Saturn",
            "To save money on fuel for another mission",
          ],
          "Metne göre bilim insanları aracın yaşam barındırabilecek bir uyduya çarpıp onu Dünya bakterileriyle kirletmesini önlemek için görevi bilinçli olarak sonlandırdı.",
        ],
        [
          "The molecules found in 2015 were important because ----.",
          [
            "on Earth they are linked to places full of life",
            "they proved that life exists on Enceladus",
            "they could be used as fuel for Cassini",
            "they showed that Enceladus has no ocean",
            "they are found only on Saturn",
          ],
          "Metinde bulunan moleküllerin Dünya'da yaşamın bol olduğu okyanus tabanındaki sıcak su kaynaklarıyla ilişkili olduğu belirtilir.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "Child: Why can't we see the stars during the day?\nTeacher: ----\nChild: So they're still there, even in the morning?",
      [
        "Because the Sun is so bright that it hides their light.",
        "Stars are much bigger than our planet.",
        "Some stars are millions of years old.",
        "The Moon is the closest object to the Earth.",
        "We'll visit the planetarium next month.",
      ],
      "Çocuk 'Yani sabah bile hâlâ oradalar mı?' der; demek ki öğretmen Güneş'in ışığının onları gizlediğini söylemiştir.",
    ],
    [
      "Leyla: I'd love to see the Northern Lights one day.\nBurak: ----\nLeyla: Then maybe I'll plan a trip to Norway next February.",
      [
        "Winter is the best time, when the nights are longest.",
        "I've never been to Norway in my life.",
        "Norway is a very expensive country.",
        "The lights are caused by particles from the Sun.",
        "My cousin lives in the south of Spain.",
      ],
      "Leyla 'O zaman belki gelecek şubat Norveç'e bir gezi planlarım' der; demek ki Burak en iyi zamanın gecelerin en uzun olduğu kış olduğunu söylemiştir.",
    ],
    [
      "Visitor: Can I look through the big telescope tonight?\nGuide: ----\nVisitor: What a pity. I'll come back another evening, then.",
      [
        "I'm afraid it's too cloudy to see anything tonight.",
        "This telescope was built more than a century ago.",
        "Our observatory is open every day of the week.",
        "You can buy postcards in the gift shop.",
        "The telescope weighs about forty tonnes.",
      ],
      "Ziyaretçi 'Ne yazık, o zaman başka bir akşam gelirim' der; demek ki rehber bu gece çok bulutlu olduğu için bir şey görülemeyeceğini söylemiştir.",
    ],
    [
      "Reporter: What will be the biggest challenge for astronauts travelling to Mars?\nScientist: ----\nReporter: So the journey itself could be more dangerous than the landing?",
      [
        "Probably radiation during the long trip.",
        "Mars is about half the size of the Earth.",
        "We have been studying Mars closely for several decades now.",
        "The first rovers landed there in the 1990s.",
        "Mars has two small moons.",
      ],
      "Muhabir 'Yani yolculuğun kendisi inişten daha tehlikeli olabilir mi?' der; demek ki bilim insanı uzun yolculuk sırasındaki radyasyonu en büyük zorluk olarak göstermiştir.",
    ],
    [
      "Emre: I read that there's a meteor shower tonight.\nNazlı: ----\nEmre: Let's drive out of the city, then, where it's darker.",
      [
        "Really? But we won't see much with all the city lights.",
        "Meteors are small pieces of rock from space.",
        "I saw a shooting star when I was a child.",
        "The weather has been very warm this week.",
        "Do you know what time the shops close?",
      ],
      "Emre 'O zaman daha karanlık olan şehir dışına çıkalım' der; demek ki Nazlı şehir ışıkları yüzünden pek bir şey göremeyeceklerini söylemiştir.",
    ],
  ],
  restatement: [
    [
      "The rocket was too heavy to be launched from that site.",
      [
        "The rocket was so heavy it couldn't be launched there.",
        "The rocket was light enough to be launched there.",
        "The rocket was launched from that site easily.",
        "The site was built especially for heavy rockets.",
        "The rocket became much heavier after it was launched from the site.",
      ],
      "'too heavy to be launched' = 'fırlatılamayacak kadar ağır'; ilk seçenek aynı anlamı verir.",
    ],
    [
      "It's the first time a spacecraft has landed on a comet.",
      [
        "No spacecraft had ever landed on a comet before.",
        "Many spacecraft have landed on comets.",
        "The spacecraft failed to land on the comet.",
        "The comet was discovered by a spacecraft.",
        "A spacecraft will land on a comet next year.",
      ],
      "'It's the first time ... has landed' = 'ilk kez iniyor'; yani daha önce hiçbir araç inmemişti.",
    ],
    [
      "The astronaut must have been exhausted after the six-hour spacewalk.",
      [
        "The astronaut was almost certainly very tired after the long spacewalk.",
        "The astronaut can't have been tired after the spacewalk.",
        "The astronaut should rest before the spacewalk.",
        "The astronaut refused to go on the spacewalk.",
        "The spacewalk lasted less than six hours.",
      ],
      "'must have been exhausted' = geçmişe dönük güçlü çıkarım; ilk seçenek aynı kesinliği verir.",
    ],
    [
      "No other planet has as many moons as Saturn.",
      [
        "Saturn has more moons than any other planet.",
        "Saturn has fewer moons than Jupiter.",
        "Saturn has no moons at all.",
        "All the planets have the same number of moons.",
        "Saturn's moons are the largest in the solar system.",
      ],
      "'No other planet has as many moons as Saturn' = 'Hiçbir gezegenin Satürn kadar uydusu yok'; yani en çok uydu Satürn'dedir.",
    ],
  ],
  paragraph: [
    [
      "In April 2021, a small helicopter called Ingenuity made the first powered, controlled flight on another planet when it rose about three metres above the surface of Mars. ---- To generate enough lift, its blades had to spin at more than two thousand revolutions per minute, much faster than those of a helicopter on Earth. Although it was designed to make only five flights, it eventually completed more than seventy.",
      [
        "This was extremely difficult because the Martian air is very thin.",
        "Mars is often called the Red Planet.",
        "Helicopters were first developed in the 1930s.",
        "The rover that carried it is about the size of a car.",
        "Many people watched the landing online.",
      ],
      "Boşluktan sonraki 'To generate enough lift, its blades had to spin ... much faster' ifadesi önceden bir zorluğun belirtilmesini gerektirir; boşluğa Mars havasının çok ince olduğunu söyleyen cümle gelmelidir.",
    ],
    [
      "For most of the history of spaceflight, rockets were used only once and then fell into the ocean or burned up in the atmosphere. ---- In 2015, the company SpaceX landed the first stage of one of its rockets upright after a launch, and it has since reused boosters dozens of times.",
      [
        "This made each launch extremely expensive.",
        "The first rockets were developed in China centuries ago.",
        "Many people dream of travelling into space.",
        "The ocean covers about seventy per cent of the Earth.",
        "Astronauts train for many years before a mission.",
      ],
      "Boşluktan önce roketlerin yalnızca bir kez kullanıldığı söylenir, sonra yeniden kullanılabilir roketler anlatılır; boşluğa bunun her fırlatmayı çok pahalı yaptığını söyleyen cümle gelmelidir.",
    ],
    [
      "Every August, people in the northern hemisphere can see the Perseid meteor shower, when dozens of shooting stars may cross the sky every hour. ---- As these fragments hit the atmosphere at about sixty kilometres per second, they burn up and produce streaks of light.",
      [
        "It happens when the Earth passes through dust left behind by a comet.",
        "August is usually a hot month in the northern hemisphere.",
        "Many people make a wish when they see a shooting star.",
        "Meteorites are sometimes found in deserts.",
        "The Moon can make the shower difficult to see.",
      ],
      "Boşluktan sonraki 'these fragments' ifadesi parçacıklardan önceden söz edilmesini gerektirir; boşluğa Dünya'nın bir kuyruklu yıldızın bıraktığı tozdan geçtiğini söyleyen cümle gelmelidir.",
    ],
    [
      "In August 1977, a radio telescope in Ohio picked up a strong, narrow signal from space that lasted seventy-two seconds. ---- The astronomer Jerry Ehman was so excited when he saw it on the printout that he circled it and wrote 'Wow!' beside it. Despite many searches, the signal has never been detected again.",
      [
        "It looked just like a possible alien message.",
        "Ohio is a state in the north-east of the United States.",
        "Radio telescopes can work during the day.",
        "Many radio stations in Ohio played music all through the night in the 1970s.",
        "Telescopes became much more powerful in the 1990s.",
      ],
      "Boşluktan sonra gökbilimcinin sinyali görünce çok heyecanlandığı anlatılır; boşluğa sinyalin bilim insanlarının bir uzaylı iletişiminden bekleyeceği şeye benzediğini söyleyen cümle gelmelidir.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "Since 2019, thousands of small satellites have been launched to provide internet access around the world.",
        "Astronomers have complained that their bright trails appear in photographs of the night sky.",
        "Many people now work from home using the internet.",
        "Some companies have tried to reduce the problem by painting the satellites darker.",
        "However, scientists warn that as more satellites are launched, the problem will grow.",
      ],
      odd: 2,
      why: "Parça internet uydularının astronomlar için yarattığı sorunu anlatır. İnsanların evden çalıştığını söyleyen III. cümle konudan sapar.",
    },
    {
      sentences: [
        "Artificial light now hides the Milky Way from about one in three people on Earth.",
        "To protect the night sky, some places have been officially recognised as 'dark sky reserves'.",
        "In these areas, street lights are shielded so that they shine downwards.",
        "Street lights were first powered by gas in the nineteenth century.",
        "Such reserves have also become popular with tourists who want to see the stars.",
      ],
      odd: 3,
      why: "Parça ışık kirliliğini ve karanlık gökyüzü alanlarını anlatır. Sokak lambalarının on dokuzuncu yüzyılda gazla çalıştığını söyleyen IV. cümle konudan sapar.",
    },
    {
      sentences: [
        "In 2016, astronomers discovered a planet orbiting Proxima Centauri, the closest star to the Sun.",
        "The planet, known as Proxima b, lies in the zone where liquid water could exist on its surface.",
        "However, its star often produces powerful flares that may have stripped away its atmosphere.",
        "Even at the speed of our fastest spacecraft, it would take thousands of years to reach it.",
        "Most stars in the night sky are much larger than the Sun.",
      ],
      odd: 4,
      why: "Parça Proxima b gezegenini anlatır. Gece gökyüzündeki çoğu yıldızın Güneş'ten büyük olduğunu söyleyen V. cümle konudan sapar.",
    },
    {
      sentences: [
        "In 1961, the astronomer Frank Drake wrote an equation to estimate the number of civilisations in our galaxy that might be able to communicate with us.",
        "It multiplies together factors such as the number of stars that have planets and the fraction of planets where life develops.",
        "Drake also worked at the Arecibo telescope in Puerto Rico.",
        "Because most of these factors are unknown, estimates range from less than one to many millions.",
        "The equation is useful mainly as a way of organising our ignorance.",
      ],
      odd: 2,
      why: "Parça Drake denklemini anlatır. Drake'in Arecibo teleskobunda çalıştığını söyleyen III. cümle konudan sapar.",
    },
    {
      sentences: [
        "Many tourists visit national parks in the United States every summer.",
        "Mount Rushmore in South Dakota features the faces of four American presidents carved into granite.",
        "Each face is about eighteen metres high.",
        "The work took fourteen years and was completed in 1941.",
        "Around four hundred workers used dynamite to remove most of the rock.",
      ],
      odd: 0,
      why: "Parça Rushmore Dağı'nı anlatır. Turistlerin milli parkları ziyaret ettiğini söyleyen I. cümle konuyla ilgisizdir; II. cümle konuyu başlatır.",
    },
  ],
};
