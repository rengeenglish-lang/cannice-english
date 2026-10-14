import type { Deneme } from "./types";

export const DENEME_64: Deneme = {
  no: 64,
  vocab: [
    [
      "His manager described the proposal as 'vague but exciting', and allowed him to ---- it in his spare time.",
      ["pursue", "abandon", "forbid", "conceal", "postpone"],
      "Yöneticinin öneriyi ilginç bulup boş zamanında 'peşinden gitmesine, üzerinde çalışmasına' (pursue) izin verdiği anlatılır.",
    ],
    [
      "Many experts warned that the computer problem could cause ---- failures in banks, airports and power stations.",
      ["widespread", "minor", "rare", "harmless", "local"],
      "Bilgisayar sorununun bankalarda, havalimanlarında ve santrallerde 'yaygın' (widespread) arızalara yol açabileceği uyarısı yapılmıştır.",
    ],
    [
      "Anyone can ---- an article in the online encyclopedia, which is both its strength and its weakness.",
      ["edit", "ban", "hide", "sell", "lock"],
      "Herkesin çevrimiçi ansiklopedide bir maddeyi 'düzenleyebildiği' (edit) anlatılır.",
    ],
    [
      "The game is so ---- that many players find it difficult to stop.",
      ["addictive", "boring", "expensive", "confusing", "rare"],
      "Pek çok oyuncunun bırakmakta zorlanması oyunun çok 'bağımlılık yapıcı' (addictive) olduğunu gösterir.",
    ],
    [
      "The website uses a simple test to ---- between human users and automated programs.",
      ["distinguish", "communicate", "travel", "compete", "choose"],
      "Testin insan kullanıcılar ile otomatik programları 'ayırt etmek' (distinguish between) için kullanıldığı anlatılır.",
    ],
    [
      "The system ---- after only two letters had been sent, so the first message was simply 'LO'.",
      ["broke down", "set up", "took off", "came round", "gave up on"],
      "Sistemin yalnızca iki harf gönderildikten sonra 'çöktüğü, bozulduğu' (broke down) anlatılır.",
    ],
  ],
  grammar: [
    [
      "The software that made the web possible ---- free to everyone in 1993.",
      ["was made", "made", "has made", "was making", "had made"],
      "Yazılım ücretsiz hâle getiren değil getirilen şeydir; edilgen 'was made' gerekir.",
    ],
    [
      "If he had patented his invention, he ---- one of the richest people in the world.",
      ["might have become", "might become", "will become", "became", "had become"],
      "Üçüncü tip koşul (If + had patented) ana cümlede 'might/would have + V3' ister.",
    ],
    [
      "By the time the new year arrived, companies ---- billions of dollars fixing their systems.",
      ["had spent", "have spent", "spend", "will have spent", "were spent"],
      "Yeni yılın gelmesinden (geçmiş) önce tamamlanmış bir eylem anlatılır; past perfect gerekir.",
    ],
    [
      "The programmer, ---- game became one of the best-selling of all time, received no money from it for years.",
      ["whose", "who", "which", "whom", "that"],
      "Oyun programcıya aittir; iyelik bildiren ilgi zamiri 'whose' gerekir.",
    ],
    [
      "Only after the problem had been fixed ---- to relax.",
      ["were engineers able", "engineers were able", "engineers could", "able were engineers", "did engineers able"],
      "Cümle başındaki 'Only after ...' yapısı ana cümlede devrik yapı ister: 'were engineers able'.",
    ],
    [
      "Users are asked to type the letters they see ---- prove that they are human.",
      ["in order to", "so that", "because of", "in case", "as long"],
      "Kullanıcılardan harfleri yazmalarının amacı insan olduklarını kanıtlamaktır; 'in order to + yalın fiil' gerekir.",
    ],
    [
      "The symbol was suggested so that readers ---- which messages were meant as jokes.",
      ["would know", "know", "had known", "will have known", "knowing"],
      "Geçmişteki 'so that' amaç yapısında 'would/could + yalın fiil' gerekir.",
    ],
    [
      "The encyclopedia, ---- articles are written by volunteers, has become one of the most visited websites.",
      ["whose", "which", "that", "who", "where"],
      "Maddeler ansiklopediye aittir; iyelik bildiren 'whose' gerekir.",
    ],
    [
      "Many people doubt that machines will ever ---- to think like humans.",
      ["be able", "can", "could", "able", "be capable"],
      "'will' yardımcı fiilinden sonra 'can' kullanılamaz; 'will be able to' gerekir.",
    ],
    [
      "The more emails are sent, ---- likely it is that some of them are unwanted.",
      ["the more", "more", "the most", "most", "much"],
      "'The more ..., the more ...' karşılaştırma yapısı gerekir: 'the more likely'.",
    ],
  ],
  cloze: [
    {
      text:
        "On 19 September 1982, a computer scientist named Scott Fahlman posted a short message on an online bulletin board at his American university. A few days earlier, a joking message about a fake safety incident had been misunderstood by some readers, {1} took it seriously. Fahlman suggested that writers should mark jokes with a simple combination of characters: a colon, a hyphen and a closing bracket. {2} viewed sideways, it looked like a smiling face. For messages that were not meant as jokes, he proposed using a frowning face instead. The idea spread quickly, first to other universities and then {3} the wider world as email and the internet grew. Fahlman later said that he had simply been trying to solve a practical problem and had not expected the symbol to become so popular. Similar symbols had been used before, {4} his message is generally regarded as the moment when the modern emoticon was born. Today, smiling faces are often replaced by colourful emoji, {5} were first developed for Japanese mobile phones in the late 1990s.",
      blanks: [
        [
          "(17) ----",
          ["who", "which", "whom", "whose", "where"],
          "Virgülden sonra 'some readers' kişilerini niteleyen ve özne görevindeki ilgi zamiri 'who' gerekir.",
        ],
        [
          "(18) ----",
          ["When", "Unless", "Although", "Until", "So that"],
          "Yandan bakıldığında gülen bir yüz gibi göründüğü anlatılır; 'When (it was) viewed' gerekir.",
        ],
        [
          "(19) ----",
          ["to", "at", "on", "with", "by"],
          "'spread ... to the wider world' yapısında yön bildiren 'to' gerekir.",
        ],
        [
          "(20) ----",
          ["but", "so", "because", "and so", "or"],
          "Benzer simgelerin daha önce kullanılmış olması ile onun mesajının doğuş anı sayılması zıttır; 'but' gerekir.",
        ],
        [
          "(21) ----",
          ["which", "who", "what", "where", "when"],
          "Virgülden sonra 'colourful emoji' ismini niteleyen ve özne görevindeki ilgi zamiri 'which' gerekir.",
        ],
      ],
    },
    {
      text:
        "In 1978, a marketing manager at an American computer company sent a message advertising new products to around four hundred users of an early computer network. Many recipients were annoyed, {1} the message is now often described as the first spam email. The name itself comes from a comedy sketch {2} a group of customers in a café try to order food while others keep repeating the name of a tinned meat product, drowning out the conversation. Early internet users adopted the word to describe unwanted messages that filled up their inboxes in the same way. As email became more widely used in the 1990s, spam grew rapidly, {3} sending millions of messages cost almost nothing. Today, estimates suggest that close to half of all emails sent worldwide are spam. Most of them never reach users, {4} email providers use sophisticated filters to detect and block them. However, spam remains a serious problem. Some messages are used to trick people into revealing passwords or bank details, and many countries have passed laws {5} to limit unsolicited advertising.",
      blanks: [
        [
          "(22) ----",
          ["and", "but", "or", "unless", "although"],
          "Alıcıların rahatsız olması ile mesajın ilk spam olarak anılması birbirini izleyen iki bilgidir; 'and' gerekir.",
        ],
        [
          "(23) ----",
          ["in which", "which", "who", "whom", "whose"],
          "'a comedy sketch' ismini niteleyen ve 'içinde' anlamı veren 'in which' gerekir.",
        ],
        [
          "(24) ----",
          ["because", "although", "unless", "so that", "whereas"],
          "Spamın hızla artmasının nedeni milyonlarca mesaj göndermenin neredeyse hiç maliyeti olmamasıdır; 'because' gerekir.",
        ],
        [
          "(25) ----",
          ["since", "although", "unless", "so that", "whereas"],
          "Çoğunun kullanıcılara ulaşmamasının nedeni e-posta sağlayıcılarının filtre kullanmasıdır; 'since' gerekir.",
        ],
        [
          "(26) ----",
          ["designed", "designing", "to design", "designs", "having designed"],
          "'laws (which are) designed to limit ...' edilgen anlamlı kısaltılmış ilgi cümlesidir; 'designed' gerekir.",
        ],
      ],
    },
  ],
  completion: [
    [
      "The website was unavailable for several hours ----.",
      [
        "after its servers were overwhelmed by a sudden rise in visitors",
        "so that more people could visit it during the busy afternoon",
        "although very few people tried to use it on that day",
        "unless the company decides to buy more powerful computers",
        "because it had become the least popular site on the internet",
      ],
      "Web sitesinin saatlerce erişilemez olmasının mantıklı nedeni sunucuların ani ziyaretçi artışıyla aşırı yüklenmesidir.",
    ],
    [
      "Although many people feared disaster at midnight, ----.",
      [
        "very few serious problems were actually reported",
        "computers stored years using only two digits",
        "billions had been spent on preparing for it",
        "banks had tested their systems many times",
        "the new year was celebrated around the world",
      ],
      "'Although' zıtlık bildirir: pek çok kişi gece yarısı felaketten korksa da aslında çok az ciddi sorun bildirilmiştir.",
    ],
    [
      "If computers had stored years with four digits from the start, ----.",
      [
        "the problem would never have arisen",
        "the new year will cause many problems",
        "companies had spent less on their systems",
        "most computers were very expensive then",
        "programmers would save a lot of memory",
      ],
      "Üçüncü tip koşul (If + had stored) ana cümlede 'would have + V3' ister.",
    ],
    [
      "Early programmers saved space by using only two digits for the year ----.",
      [
        "because computer memory was very expensive at the time",
        "so that the year 2000 would cause serious problems",
        "although memory was cheap and widely available",
        "unless the computers were used after the year 2000",
        "even though they had plenty of space to spare",
      ],
      "İlk programcıların yıl için yalnızca iki hane kullanmasının mantıklı nedeni bilgisayar belleğinin o dönemde çok pahalı olmasıdır.",
    ],
    [
      "Since anyone can change the articles, ----.",
      [
        "errors sometimes appear before they are corrected",
        "the encyclopedia would have been written by experts",
        "most of the articles were never read by anyone",
        "the website had been closed for many years",
        "volunteers were not allowed to write articles",
      ],
      "'Since' neden bildirir; maddeleri herkes değiştirebildiği için hatalar bazen düzeltilmeden önce ortaya çıkar.",
    ],
    [
      "So many copies of the game were made and shared ----.",
      [
        "that it spread across the country within months",
        "because the game was very difficult to copy",
        "although nobody was interested in playing it",
        "so the programmer decided to delete it",
        "unless the government allowed people to buy it",
      ],
      "'So many ... that' sonuç bildiren yapıdır; ikinci kısım 'that' ile başlamalıdır.",
    ],
    [
      "Once the test had been solved by millions of users, ----.",
      [
        "thousands of old books had been turned into digital text",
        "the books will be printed again on paper",
        "computers would have been unable to read the words",
        "most users found the test very difficult",
        "the test was used only by banks",
      ],
      "'Once' (-dıktan sonra) geçmişte tamamlanmış bir olayın sonucunu bildirir: binlerce eski kitap dijital metne dönüştürülmüştü.",
    ],
    [
      "The robot vacuum cleaner was designed ----.",
      [
        "to clean floors without anyone having to control it",
        "because people wanted to spend more time cleaning",
        "although most homes had no floors to clean",
        "so that it would need constant attention",
        "unless the owners were at home all day",
      ],
      "Robot süpürgenin tasarlanma amacı kimsenin kontrol etmesine gerek kalmadan zemini temizlemektir.",
    ],
    [
      "Unless people use stronger passwords, ----.",
      [
        "their accounts will remain easy to break into",
        "they would have been safer in the past",
        "most websites had already been attacked",
        "hackers were not interested in their data",
        "the internet was invented in the 1960s",
      ],
      "'Unless' (-medikçe) koşul bildirir; ana cümlede gelecekte olası bir sonuç gerekir: hesaplarına girmek kolay kalır.",
    ],
    [
      "The first message sent between two computers was cut short ----.",
      [
        "when the system crashed after only two letters",
        "because the scientists had nothing to say",
        "although the system worked perfectly",
        "so that it could be sent more quickly",
        "unless the computers were in the same room",
      ],
      "İki bilgisayar arasında gönderilen ilk mesajın yarıda kalmasının nedeni sistemin yalnızca iki harften sonra çökmesidir.",
    ],
  ],
  enTr: [
    [
      "He chose not to patent his invention, so that anyone could use it without paying.",
      [
        "Herkes ücret ödemeden kullanabilsin diye icadının patentini almamayı seçti.",
        "İcadının patentini aldı, böylece herkes ondan para kazanabildi.",
        "Herkes ücret ödediği için icadının patentini almaya gerek görmedi.",
        "İcadını kimsenin ücretsiz kullanmasına izin vermedi.",
        "Patentini aldıktan sonra icadını ücretsiz dağıtmaya karar verdi.",
      ],
      "'He chose not to patent his invention' = 'icadının patentini almamayı seçti'; 'so that anyone could use it without paying' = 'herkes ücret ödemeden kullanabilsin diye'.",
    ],
    [
      "Experts still disagree about whether the danger was exaggerated or whether it was avoided thanks to careful preparation.",
      [
        "Uzmanlar, tehlikenin abartılıp abartılmadığı ya da dikkatli hazırlık sayesinde önlenip önlenmediği konusunda hâlâ anlaşamıyor.",
        "Uzmanlar, tehlikenin dikkatli hazırlık nedeniyle abartıldığı konusunda hemfikir.",
        "Dikkatli hazırlık yapılmasına rağmen uzmanlar tehlikeyi önleyemedi.",
        "Uzmanlar, tehlikenin hiçbir zaman var olmadığını kanıtladı.",
        "Tehlike abartıldığı için uzmanlar hazırlık yapmaya gerek görmedi.",
      ],
      "'still disagree about whether ... or whether ...' = '... olup olmadığı ya da ... olup olmadığı konusunda hâlâ anlaşamıyor'.",
    ],
    [
      "Every time users solved the puzzle, they were unknowingly helping to digitise old books.",
      [
        "Kullanıcılar bulmacayı her çözdüklerinde, farkında olmadan eski kitapların dijitalleştirilmesine yardım ediyordu.",
        "Kullanıcılar eski kitapları dijitalleştirmek için bilerek bulmaca çözüyordu.",
        "Eski kitaplar, kullanıcıların bulmacaları çözmesini zorlaştırıyordu.",
        "Kullanıcılar bulmacaları çözemediği için kitaplar dijitalleştirilemedi.",
        "Bulmacalar, eski kitaplardan alınan resimlerle hazırlandı.",
      ],
      "'Every time users solved the puzzle' = 'kullanıcılar bulmacayı her çözdüklerinde'; 'unknowingly helping to digitise old books' = 'farkında olmadan eski kitapların dijitalleştirilmesine yardım ediyordu'.",
    ],
  ],
  trEn: [
    [
      "Oyun, bilgisayarlar arasında kopyalanarak hızla yayıldı.",
      [
        "Copied from computer to computer, the game spread fast.",
        "The game was difficult to copy, so it spread very slowly.",
        "Computers were used to stop the game from spreading.",
        "The game was sold in shops before it was copied.",
        "Copying the game damaged many computers.",
      ],
      "'bilgisayarlar arasında kopyalanarak' = as it was copied from computer to computer; 'hızla yayıldı' = spread quickly.",
    ],
    [
      "Ansiklopedideki maddeler, gönüllüler tarafından yazılıp düzenleniyor.",
      [
        "The articles in the encyclopedia are written and edited by volunteers.",
        "Volunteers are not allowed to edit the articles in the encyclopedia.",
        "The encyclopedia pays experts to write all of its articles.",
        "Volunteers read the articles but do not write them.",
        "The articles were written by volunteers but edited by computers.",
      ],
      "'gönüllüler tarafından yazılıp düzenleniyor' = are written and edited by volunteers.",
    ],
    [
      "Çoğu spam mesaj, kullanıcılara ulaşmadan önce filtrelerce engelleniyor.",
      [
        "Most spam messages are blocked by filters before they reach users.",
        "Most spam messages reach users because filters do not work.",
        "Users block most spam messages after reading them.",
        "Filters send most spam messages directly to users.",
        "Spam messages are used to test filters before they reach users.",
      ],
      "'Çoğu spam mesaj ... filtrelerce engelleniyor' = most spam messages are blocked by filters; 'kullanıcılara ulaşmadan önce' = before they reach users.",
    ],
  ],
  reading: [
    {
      text:
        "In March 1989, a British scientist named Tim Berners-Lee, working at a large physics laboratory in Switzerland, wrote a proposal for a new way of managing information. Scientists at the laboratory came from many countries and used different types of computers, and sharing documents between them was difficult. Berners-Lee suggested a system of documents linked together by 'hypertext', which users could move between simply by clicking. His manager wrote on the proposal that it was 'vague but exciting' and allowed him to work on it. By the end of 1990, Berners-Lee had created the first web browser, the first web server and the first website, which explained what the World Wide Web was and how to use it. The server ran on a single computer, which carried a handwritten label warning people not to switch it off. The web was opened to the public in 1991. In 1993, the laboratory made a crucial decision: it released the software free of charge, so that anyone could use it and build on it without paying any fees. Many historians believe that this decision was one of the main reasons for the web's explosive growth. Berners-Lee himself never sought to profit directly from his invention and has since campaigned for the web to remain open and accessible to all.",
      questions: [
        [
          "According to the passage, Berners-Lee's proposal was intended to ----.",
          [
            "make it easier for scientists to share information",
            "allow people to buy goods online",
            "connect the laboratory to the telephone network",
            "replace the computers used in the laboratory",
            "help physicists carry out new experiments",
          ],
          "Metne göre laboratuvardaki bilim insanları farklı bilgisayarlar kullanıyordu ve belge paylaşmak zordu; öneri bunu kolaylaştırmayı amaçlıyordu.",
        ],
        [
          "His manager's comment suggests that the proposal ----.",
          [
            "was unclear in places but promising",
            "was too detailed to be useful",
            "would be very expensive to develop",
            "had already been tried elsewhere",
            "was of no interest to the laboratory",
          ],
          "'Belirsiz ama heyecan verici' yorumu önerinin yer yer net olmadığını ama umut vaat ettiğini gösterir.",
        ],
        [
          "The handwritten label on the computer shows that ----.",
          [
            "the whole web once depended on a single machine",
            "the computer was very old and unreliable",
            "Berners-Lee did not trust his colleagues",
            "the laboratory had many web servers",
            "the computer was used only at night",
          ],
          "Sunucunun tek bir bilgisayarda çalışması ve kapatılmaması uyarısı, bir zamanlar tüm webin tek bir makineye bağlı olduğunu gösterir.",
        ],
        [
          "According to the passage, the decision made in 1993 ----.",
          [
            "helped the web to grow very rapidly",
            "made Berners-Lee extremely wealthy",
            "limited the web to scientific use",
            "required users to pay small fees",
            "closed the web to the public",
          ],
          "Metne göre pek çok tarihçi yazılımın ücretsiz sunulmasının webin hızla büyümesinin başlıca nedenlerinden biri olduğuna inanır.",
        ],
      ],
    },
    {
      text:
        "In the 1960s and 1970s, computer memory was extremely expensive, and programmers looked for every possible way to save space. One common method was to record years using only their last two digits, so that 1975, for example, was stored simply as '75'. At the time, few people imagined that the programs they were writing would still be in use decades later. By the 1990s, however, it became clear that many systems would face a problem when the year 2000 arrived. A computer reading '00' might assume that it meant 1900 rather than 2000, which could cause errors in calculations involving dates, such as interest payments, flight schedules or the expiry dates of medicines. Governments and companies around the world launched huge programmes to check and correct their software, spending an estimated three hundred billion dollars or more. As midnight approached on 31 December 1999, many people stocked up on food and cash, and some feared that power stations and aircraft would fail. In the end, very few serious problems were reported. This has led to a lasting debate. Some argue that the danger had been greatly exaggerated, while others insist that the problems were avoided precisely because so much work had been done in advance.",
      questions: [
        [
          "According to the passage, programmers used two digits for years because ----.",
          [
            "they wanted to save expensive memory",
            "they did not know how to store four digits",
            "they planned to replace the programs by 2000",
            "governments had asked them to do so",
            "it made calculations much faster",
          ],
          "Metne göre bilgisayar belleği çok pahalıydı ve programcılar yer kazanmanın her yolunu arıyordu.",
        ],
        [
          "The problem in 2000 was that computers might ----.",
          [
            "confuse the year 2000 with the year 1900",
            "stop working completely at midnight",
            "be unable to store any new information",
            "delete all the dates in their memory",
            "use too much electricity",
          ],
          "Metinde '00' okuyan bir bilgisayarın bunun 2000 yerine 1900 olduğunu varsayabileceği belirtilir.",
        ],
        [
          "Some people stocked up on food and cash because ----.",
          [
            "they feared that important systems might fail",
            "prices were expected to rise in the new year",
            "banks had announced that they would close",
            "the government had told them to do so",
            "they wanted to celebrate the new year",
          ],
          "Metne göre bazıları santrallerin ve uçakların arıza yapacağından korkuyordu.",
        ],
        [
          "The debate mentioned at the end of the passage concerns ----.",
          [
            "whether the lack of problems was due to preparation",
            "how much the preparations should have cost",
            "who was responsible for causing the problem",
            "whether computers should store years at all",
            "which countries spent the most money",
          ],
          "Metnin sonunda bazılarının tehlikenin abartıldığını, bazılarının ise sorunların yapılan hazırlık sayesinde önlendiğini savunduğu belirtilir.",
        ],
      ],
    },
    {
      text:
        "When it was launched in January 2001, Wikipedia was not intended to be the main project of its founders. They had already started an online encyclopedia written by experts, with every article checked carefully before publication. The process was so slow that after a year only a handful of articles had been completed. Wikipedia was set up as a side project in which anyone could write and edit articles, with the idea that some of them might later be passed on to the expert encyclopedia. To the founders' surprise, it grew at an astonishing rate. Within a few years, it contained hundreds of thousands of articles, and it has since become one of the most visited websites in the world, with tens of millions of articles in more than three hundred languages. Critics have long questioned whether an encyclopedia that anyone can edit can be trusted. Vandalism and errors do occur, and some articles have been the subject of long disputes. However, a study published in 2005 in a leading science journal compared a selection of scientific articles with those in a well-known traditional encyclopedia and found a broadly similar number of errors, a finding that the traditional encyclopedia strongly disputed. Today, most teachers advise students to use Wikipedia as a starting point but to check important facts in other sources.",
      questions: [
        [
          "According to the passage, the founders' original encyclopedia ----.",
          [
            "produced few articles because of its slow process",
            "was written entirely by volunteers",
            "grew much faster than Wikipedia",
            "was launched after Wikipedia",
            "allowed anyone to edit its articles",
          ],
          "Metne göre süreç o kadar yavaştı ki bir yılın sonunda yalnızca birkaç madde tamamlanmıştı.",
        ],
        [
          "Wikipedia was originally intended to ----.",
          [
            "support the expert encyclopedia",
            "replace all printed encyclopedias",
            "be used only by scientists",
            "become the founders' main project",
            "make money from advertising",
          ],
          "Metinde Wikipedia'nın bazı maddelerin uzman ansiklopediye aktarılabileceği bir yan proje olarak kurulduğu belirtilir.",
        ],
        [
          "The study published in 2005 suggested that ----.",
          [
            "Wikipedia was about as accurate as a traditional encyclopedia",
            "Wikipedia contained far more errors than other encyclopedias",
            "traditional encyclopedias had no errors at all",
            "scientific articles on Wikipedia were never edited",
            "students should not use Wikipedia",
          ],
          "Metne göre çalışma geleneksel ansiklopedidekilere kabaca benzer sayıda hata bulmuştur.",
        ],
        [
          "It can be inferred from the passage that teachers today ----.",
          [
            "accept Wikipedia but recommend checking it",
            "forbid students from using Wikipedia",
            "prefer Wikipedia to all other sources",
            "believe Wikipedia contains no errors",
            "write most of the articles on Wikipedia",
          ],
          "Metnin sonunda öğretmenlerin Wikipedia'yı başlangıç noktası olarak kullanmayı ama önemli bilgileri başka kaynaklardan kontrol etmeyi önerdiği belirtilir.",
        ],
      ],
    },
    {
      text:
        "Most internet users have at some point been asked to type a series of distorted letters or to click on all the pictures containing traffic lights. These tests, known as CAPTCHAs, were developed around 2000 by researchers at an American university to help websites distinguish between human users and automated programs. At the time, computers found it very difficult to read distorted text, while humans could do so fairly easily. This made the tests useful for preventing programs from, for example, creating thousands of fake email accounts. One of the researchers later realised that the time people spent solving these puzzles, around ten seconds each, added up to millions of hours every day. He wondered whether this effort could be put to good use. In 2007, he launched a new version in which one of the words shown came from old books and newspapers that were being scanned and that computers had failed to read. By typing the word, users were unknowingly helping to turn millions of pages into digital text. The system was later bought by a large technology company. More recently, the image-based tests have been used to help train computer systems to recognise objects. Ironically, as machines have become better at solving the puzzles, the tests have had to become more difficult, sometimes even for humans.",
      questions: [
        [
          "According to the passage, CAPTCHAs were originally designed to ----.",
          [
            "stop automated programs from misusing websites",
            "teach computers to read old books",
            "help people improve their typing skills",
            "collect information about internet users",
            "test people's knowledge of traffic rules",
          ],
          "Metne göre testler web sitelerinin insan kullanıcılar ile otomatik programları ayırt etmesine yardımcı olmak için geliştirilmiştir.",
        ],
        [
          "The tests worked because ----.",
          [
            "humans read distorted text better than machines",
            "computers could solve them faster than humans",
            "they took only a few seconds to create",
            "they were used only by email companies",
            "they contained words from old books",
          ],
          "Metinde bilgisayarların bozulmuş metni okumakta çok zorlandığı, insanların ise oldukça kolay okuyabildiği belirtilir.",
        ],
        [
          "The researcher's idea in 2007 was to ----.",
          [
            "use people's effort to digitise printed texts",
            "make the tests shorter and easier to solve",
            "pay users for every puzzle they solved",
            "replace text with pictures of traffic lights",
            "stop people from scanning old newspapers",
          ],
          "Metne göre yeni sürümde kullanıcılar kelimeleri yazarak farkında olmadan milyonlarca sayfanın dijital metne dönüştürülmesine yardım ediyordu.",
        ],
        [
          "The word 'ironically' in the last sentence refers to the fact that ----.",
          [
            "better machines have made the tests harder",
            "humans have become worse at reading text",
            "the tests are no longer used on any website",
            "computers now design the tests themselves",
            "the tests have become much easier to solve",
          ],
          "'Ironically' makinelerin bulmacaları çözmede gelişmesiyle testlerin insanlar için bile zorlaşması durumunu vurgular.",
        ],
      ],
    },
    {
      text:
        "In 1984, Alexey Pajitnov, a researcher at a computer centre in Moscow, created a simple game in his spare time. Shapes made of four squares fell from the top of the screen, and the player had to rotate and move them to form complete lines, which then disappeared. He called the game Tetris, combining the Greek word for 'four' with the name of his favourite sport, tennis. The game was copied onto floppy disks and passed from one computer to another, spreading rapidly across the Soviet Union and then into Eastern Europe. Because the Soviet Union did not allow private companies, the game officially belonged to the state, and the question of who had the right to sell it in the West led to a complicated legal battle involving several companies. Eventually, a version was released for a new handheld games console in 1989, and it became one of the best-selling games of all time, selling tens of millions of copies. Pajitnov himself received no money from the game for many years. It was not until 1996, after he had moved to the United States, that he gained the rights and began earning royalties. Psychologists have studied the game's effects, and some research suggests that playing it may help to reduce unwanted memories and cravings.",
      questions: [
        [
          "According to the passage, the name Tetris ----.",
          [
            "was formed from a Greek word and the name of a sport",
            "was chosen by the company that sold the game",
            "means 'falling shapes' in Russian",
            "came from the name of a Moscow computer centre",
            "was suggested by players in Eastern Europe",
          ],
          "Metne göre Pajitnov Yunanca 'dört' sözcüğünü en sevdiği spor olan tenisin adıyla birleştirmiştir.",
        ],
        [
          "The game spread quickly at first because ----.",
          [
            "people copied it and passed it on",
            "it was advertised on television",
            "it was sold in shops across the country",
            "the government encouraged people to play it",
            "it was released on a handheld console",
          ],
          "Metinde oyunun disketlere kopyalanıp bilgisayardan bilgisayara aktarılarak hızla yayıldığı belirtilir.",
        ],
        [
          "The legal battle over the game arose because ----.",
          [
            "it was unclear who could sell it abroad",
            "Pajitnov refused to allow anyone to sell it",
            "the game was copied from an American product",
            "several programmers claimed to have invented it",
            "the Soviet government wanted to ban the game",
          ],
          "Metne göre oyun resmî olarak devlete aitti ve Batı'da kimin satma hakkına sahip olduğu sorusu karmaşık bir hukuk mücadelesine yol açtı.",
        ],
        [
          "It can be understood from the passage that Pajitnov ----.",
          [
            "only began to profit from the game years after its success",
            "earned a great deal of money from the game in 1989",
            "sold the rights to the game to the Soviet government",
            "was not interested in receiving any money for the game",
            "designed the handheld console on which it was sold",
          ],
          "Metinde oyunun başarısından yıllar sonra, 1996'da hakları kazanıp telif almaya başladığı belirtilir.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "User: I can't log in to my account. It keeps saying my password is wrong.\nTechnician: ----\nUser: Oh, you're right. I'd left it on. Let me try again.",
      [
        "Have you checked whether the caps lock key is on?",
        "You should buy a new computer.",
        "When did you create your account?",
        "Is this your first time using our website?",
        "Your account has been closed, I'm afraid.",
      ],
      "Kullanıcı 'Haklısınız, açık bırakmışım' der; demek ki teknisyen büyük harf kilidinin açık olup olmadığını sormuştur.",
    ],
    [
      "Student: Can I use Wikipedia for my history essay?\nTeacher: ----\nStudent: OK, so I should find the original sources it refers to.",
      [
        "Yes, but check the facts elsewhere.",
        "No, you must never use the internet for essays.",
        "Wikipedia doesn't have any history articles.",
        "Your essay should be at least two thousand words.",
        "The library closes at five o'clock today.",
      ],
      "Öğrenci 'Yani başvurduğu özgün kaynakları bulmalıyım' der; demek ki öğretmen başlangıç noktası olarak uygun olduğunu ama bilgilerin başka yerden kontrol edilmesi gerektiğini söylemiştir.",
    ],
    [
      "Ali: I keep getting emails saying I've won a prize.\nZeynep: ----\nAli: You're right. I'll delete them without opening them.",
      [
        "Be careful. They're almost certainly scams.",
        "Congratulations! What have you won?",
        "Which competition did you enter?",
        "I never check my emails, actually.",
        "Maybe you should reply and ask for details.",
      ],
      "Ali 'Haklısın, açmadan sileceğim' der; demek ki Zeynep bunların neredeyse kesinlikle dolandırıcılık olduğu konusunda uyarmıştır.",
    ],
    [
      "Grandson: Did you play video games when you were young, Grandma?\nGrandmother: ----\nGrandson: Wow, so the games were very simple back then?",
      [
        "Only a few. They had very basic graphics and sound.",
        "No, I've never been interested in games.",
        "I still play games on my phone every day.",
        "Video games are bad for your eyes, you know.",
        "We used to play football in the street.",
      ],
      "Torun 'Vay, o zamanlar oyunlar çok basitti yani?' der; demek ki büyükanne yalnızca birkaç oyun oynadığını ve grafik ile seslerinin çok basit olduğunu söylemiştir.",
    ],
    [
      "Customer: Why do I have to click on pictures of buses to buy a ticket?\nAssistant: ----\nCustomer: I see. So it's to stop automated programs from buying all the tickets.",
      [
        "It's a test to check that you're a real person.",
        "The pictures show you which bus to take.",
        "It's a game to help you pass the time.",
        "Our website is having technical problems.",
        "Tickets are cheaper if you choose the right bus.",
      ],
      "Müşteri 'Yani otomatik programların tüm biletleri almasını önlemek için' der; demek ki görevli bunun gerçek bir insan olup olmadığını kontrol eden bir test olduğunu söylemiştir.",
    ],
  ],
  restatement: [
    [
      "Had the software not been released for free, the web might not have grown so quickly.",
      [
        "Making the software free helped the web to grow rapidly.",
        "The web grew quickly even though the software was expensive.",
        "The software was released for free after the web had grown.",
        "The web would have grown faster if the software had cost money.",
        "The free software slowed the growth of the web.",
      ],
      "Devrik üçüncü tip koşul: yazılım ücretsiz sunulmasaydı web bu kadar hızlı büyümeyebilirdi; yani ücretsiz yazılım webin hızla büyümesine yardım etti.",
    ],
    [
      "No sooner had the game been copied than it spread across the country.",
      [
        "Once copied, the game spread nationwide at once.",
        "The game was copied long after it had spread.",
        "The game spread slowly despite being copied.",
        "The game was copied because it had spread.",
        "Nobody copied the game until it had spread.",
      ],
      "'No sooner ... than' = 'as soon as'; oyun kopyalanır kopyalanmaz ülke geneline yayıldı.",
    ],
    [
      "He never tried to make money directly from his invention.",
      [
        "He made no attempt to profit directly from what he had invented.",
        "He became rich by selling his invention.",
        "He tried hard to earn money from his invention.",
        "Other people prevented him from profiting from his invention.",
        "He invented it only in order to make money.",
      ],
      "'never tried to make money directly' = 'made no attempt to profit directly'; ilk seçenek aynı anlamı verir.",
    ],
    [
      "It was not until 1996 that the programmer began earning money from the game.",
      [
        "Only in 1996 did the programmer start earning from it.",
        "The programmer stopped earning money from the game in 1996.",
        "The programmer earned most of his money before 1996.",
        "The game stopped selling in 1996.",
        "The programmer created the game in 1996.",
      ],
      "'It was not until 1996 that' = 'Only in 1996 did ...'; ilk seçenek aynı anlamı verir.",
    ],
  ],
  paragraph: [
    [
      "On 29 October 1969, scientists in California attempted to send the first message between two computers on a new network. The word they wanted to send was 'LOGIN'. ---- An hour later, after the problem had been fixed, the full word was sent successfully. The network they were using later developed into the internet.",
      [
        "However, the system crashed after the first two letters had been transmitted.",
        "California has become home to many of the world's largest technology companies.",
        "Computers at that time were large enough to fill entire rooms.",
        "Many people today send hundreds of messages every day.",
        "The scientists worked at two universities hundreds of kilometres apart.",
      ],
      "Boşluktan sonra bir saat sonra sorun giderildiği ve kelimenin tamamının gönderildiği anlatılır; boşluğa sistemin ilk iki harften sonra çöktüğünü söyleyen cümle gelmelidir.",
    ],
    [
      "In 1942, the science-fiction writer Isaac Asimov published a short story in which robots had to obey three laws. ---- These rules, which Asimov used as the basis for many of his stories, have influenced discussions about the ethics of artificial intelligence ever since, although experts point out that real machines cannot be controlled so simply.",
      [
        "Above all, a robot must not harm a human being or allow one to come to harm.",
        "Magazines publishing science fiction multiplied during the 1940s.",
        "Many robots today are used in factories to build cars.",
        "Asimov wrote or edited more than four hundred books.",
        "Some people are afraid that robots will take their jobs.",
      ],
      "Boşluktan sonra 'These rules' ifadesiyle kurallardan söz edilir; boşluğa robotun her şeyden önce bir insana zarar vermemesi gerektiğini söyleyen cümle gelmelidir.",
    ],
    [
      "The first robot vacuum cleaners went on sale in the early 2000s. ---- They use sensors to detect walls, furniture and stairs, and many can now return to their charging stations by themselves when their batteries run low.",
      [
        "Cleaning floors unaided, they soon caught on.",
        "Vacuum cleaners were first invented more than a century ago.",
        "Many people find housework boring and tiring.",
        "Some robots are used to explore other planets.",
        "Batteries have become much more powerful in recent years.",
      ],
      "Boşluktan sonra 'They' zamiriyle robot süpürgelerin özellikleri anlatılır; boşluğa insan yardımı olmadan zemin temizlemek için tasarlanıp hızla popüler olduklarını söyleyen cümle gelmelidir.",
    ],
    [
      "3D printers build objects layer by layer from materials such as plastic, metal or even concrete. ---- Doctors have used them to produce replacement bones and models of patients' organs to plan operations, and engineers have printed entire small houses in a matter of days.",
      [
        "Their uses have expanded far beyond simple plastic models.",
        "Printing was invented in Europe in the fifteenth century.",
        "Plastic waste is a serious environmental problem.",
        "Many people still prefer to print documents on paper.",
        "Concrete takes several weeks to reach its full strength.",
      ],
      "Boşluktan sonra doktorların ve mühendislerin 3B yazıcıları çeşitli alanlarda kullandığı anlatılır; boşluğa kullanım alanlarının basit plastik modellerin çok ötesine geçtiğini söyleyen cümle gelmelidir.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "Many people use the same password for several different websites.",
        "This is risky, because if one site is hacked, criminals can use the password to access the others.",
        "Experts recommend using a password manager, which creates and stores a different strong password for each site.",
        "Many websites now display advertisements based on what users search for.",
        "Adding a second step, such as a code sent to a phone, makes accounts even more secure.",
      ],
      odd: 3,
      why: "Parça parola güvenliğini anlatır. Web sitelerinin kullanıcıların aramalarına göre reklam gösterdiğini söyleyen IV. cümle konudan sapar.",
    },
    {
      sentences: [
        "The designer of a famous arcade game said that its main character was inspired by a pizza with one slice missing.",
        "He wanted to create a game that would appeal to women as well as men.",
        "At the time, most arcade games involved shooting at enemies.",
        "Pizza was first made in Naples, in southern Italy.",
        "Instead, his character simply moved around a maze eating dots and avoiding ghosts.",
      ],
      odd: 3,
      why: "Parça ünlü bir atari oyununun tasarım öyküsünü anlatır. Pizzanın Napoli'de yapıldığını söyleyen IV. cümle konudan sapar.",
    },
    {
      sentences: [
        "Many apps and websites now offer a 'dark mode', which shows light text on a dark background.",
        "Users often say that it is more comfortable for their eyes, especially at night.",
        "On some types of screen, it can also reduce the amount of battery power used.",
        "Most people spend several hours a day looking at screens.",
        "However, some studies suggest that dark text on a light background is easier to read for long periods.",
      ],
      odd: 3,
      why: "Parça 'karanlık mod'un artılarını ve eksilerini anlatır. İnsanların günde saatlerce ekrana baktığını söyleyen IV. cümle akışı bozar.",
    },
    {
      sentences: [
        "QR codes were invented in Japan in 1994 to track car parts in factories.",
        "Unlike ordinary barcodes, they can store information both horizontally and vertically.",
        "Japan is famous for its car industry.",
        "This allows them to hold much more data in a small space.",
        "They became widely used in restaurants and shops during the pandemic, when people avoided touching shared menus.",
      ],
      odd: 2,
      why: "Parça karekodların icadını ve kullanımını anlatır. Japonya'nın otomobil endüstrisiyle ünlü olduğunu söyleyen III. cümle konudan sapar.",
    },
    {
      sentences: [
        "Some online services allow users to download a copy of all the data a company holds about them.",
        "People who do this are often surprised by how much information has been collected.",
        "The files can include every search, message and location recorded over many years.",
        "Privacy laws in some regions give people the right to request this information.",
        "Many people enjoy sharing photographs of their meals online.",
      ],
      odd: 4,
      why: "Parça şirketlerin kullanıcılar hakkında topladığı verileri indirme hakkını anlatır. İnsanların yemek fotoğrafı paylaşmayı sevdiğini söyleyen V. cümle konudan sapar.",
    },
  ],
};
