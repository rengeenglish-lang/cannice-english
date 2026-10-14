import type { Deneme } from "./types";

export const DENEME_50: Deneme = {
  no: 50,
  vocab: [
    [
      "The music in the café was so ---- that conversation at our table was almost impossible.",
      ["loud", "faint", "soft", "gentle", "quiet"],
      "Masada sohbetin neredeyse imkânsız olmasının nedeni müziğin 'yüksek sesli' (loud) olmasıdır. Diğer sıfatlar sesin alçak olduğunu anlatır.",
    ],
    [
      "The concert hall was designed to ---- sound evenly, so that the music can be heard clearly from every seat.",
      ["distribute", "absorb", "block", "silence", "muffle"],
      "Her koltuğa müziğin net ulaşması için salonun sesi eşit biçimde 'dağıtması' (distribute) gerekir. 'absorb', 'block', 'silence' ve 'muffle' sesi azaltmak anlamındadır.",
    ],
    [
      "Although she had never had a lesson, she could ---- almost any tune on the piano after hearing it once.",
      ["pick out", "turn down", "put off", "give away", "break up"],
      "Bir melodiyi kulaktan bulup çalmak 'pick out' ile anlatılır. Diğer öbek fiiller bu anlamı vermez.",
    ],
    [
      "Exposure to very loud noise over many years can cause ---- damage to hearing.",
      ["permanent", "temporary", "slight", "brief", "occasional"],
      "Yıllarca çok yüksek gürültüye maruz kalmanın işitmede 'kalıcı' (permanent) hasara yol açabileceği anlatılır; 'over many years' bu anlamı destekler.",
    ],
    [
      "The band's first album was a huge success, but their second was ---- by critics as dull and unoriginal.",
      ["dismissed", "praised", "admired", "applauded", "welcomed"],
      "'dull and unoriginal' (sıkıcı ve özgün olmayan) ifadesi eleştirmenlerin albümü 'küçümseyip geçtiğini' (dismissed) gösterir. Diğer fiiller olumlu tepki bildirir.",
    ],
    [
      "Street musicians must ---- a licence from the council before they can perform in the city centre.",
      ["obtain", "refuse", "cancel", "ignore", "lose"],
      "Sokak müzisyenlerinin şehir merkezinde çalabilmek için belediyeden izin 'alması' (obtain) gerekir.",
    ],
  ],
  grammar: [
    [
      "The theatre ---- so well that actors who whisper are audible from every seat.",
      ["was built", "built", "has built", "is building", "had built"],
      "Tiyatro inşa eden değil, inşa edilen şeydir; edilgen yapı 'was built' gerekir.",
    ],
    [
      "She ---- the violin for ten years before she gave her first public concert.",
      ["had been playing", "has been playing", "is playing", "will have played", "plays"],
      "İlk konserden (geçmiş) önce on yıl süren bir eylem anlatılır; past perfect continuous gerekir.",
    ],
    [
      "I wish I ---- to the concert last night; everyone says it was wonderful.",
      ["had gone", "went", "would go", "have gone", "go"],
      "'last night' geçmişe dair bir pişmanlığı gösterir; 'wish' ile geçmiş için past perfect (had gone) kullanılır.",
    ],
    [
      "---- the orchestra had finished playing, the audience rose to their feet and applauded.",
      ["As soon as", "Unless", "Although", "In case", "So that"],
      "Orkestranın çalmayı bitirmesi ile seyircilerin ayağa kalkması art arda gerçekleşir; 'As soon as' (-ır -mez) gerekir.",
    ],
    [
      "The song, ---- was written in just twenty minutes, became the band's biggest hit.",
      ["which", "that", "who", "what", "where"],
      "Virgüllerle ayrılan ve 'the song' ismini niteleyen ilgi cümlesinde 'which' gerekir; 'that' virgüllü yapıda kullanılmaz.",
    ],
    [
      "If you listen to music while you are studying, you ---- find it harder to concentrate.",
      ["may", "must have", "would have", "had to", "should have"],
      "Birinci tip, genel bir olasılık bildiren cümledir; şimdiki/gelecek bir olasılık için 'may' gerekir. Diğer seçenekler geçmişe ya da zorunluluğa işaret eder.",
    ],
    [
      "The singer is said ---- her first song at the age of nine.",
      ["to have written", "to write", "writing", "having written", "to be written"],
      "'is said' + geçmişteki bir eylem için 'to have + V3' gerekir; dokuz yaşında yazdığı söylenir.",
    ],
    [
      "Neither the musicians nor the conductor ---- aware that the microphone was still switched on.",
      ["was", "were being", "have been", "are", "be"],
      "'Neither ... nor' yapısında fiil kendisine en yakın özneye (the conductor, tekil) uyar ve olay geçmişte yaşanmıştır; 'was' gerekir.",
    ],
    [
      "It was ---- a beautiful performance that nobody wanted it to end.",
      ["such", "so", "too", "very", "enough"],
      "'a + sıfat + isim' öbeğinden önce 'such' gelir: 'such a beautiful performance that ...'. 'so' doğrudan sıfattan önce kullanılır.",
    ],
    [
      "The hall has been closed ---- the roof was damaged in a storm last winter.",
      ["since", "for", "during", "until", "while"],
      "Present perfect ile birlikte bir başlangıç noktası (çatının geçen kış zarar görmesi) bildiren 'since' gerekir; 'for' bir süre ister.",
    ],
  ],
  cloze: [
    {
      text:
        "The theremin is probably the only musical instrument that is played without being touched. It was invented in 1920 by the Russian physicist Leon Theremin, who was originally working on a device to measure the density of gases. He noticed that the machine produced a sound that changed in pitch {1} he moved his hand near it, and he soon realised that it could be used to make music. The instrument has two metal antennas. Moving one hand towards the vertical antenna makes the note higher, {2} moving the other hand near the horizontal one controls the volume. Because there are no keys or strings to guide the player, the theremin is extremely difficult to play well, and even small movements of the body can change the note. Theremin travelled to the United States, {3} he performed in concert halls and gave demonstrations to large audiences. The instrument never became widely popular, {4} its eerie, wavering sound became familiar to millions through the soundtracks of science-fiction films in the 1950s. Today, there are only a few professional thereminists in the world, but the instrument still has a devoted following, and modern versions are sold {5} a fraction of the price of the early models.",
      blanks: [
        [
          "(17) ----",
          ["whenever", "unless", "although", "before", "until"],
          "Makinenin sesi elini 'her yaklaştırdığında' değişiyordu; 'whenever' gerekir.",
        ],
        [
          "(18) ----",
          ["while", "because", "so", "unless", "if only"],
          "Bir elin notayı, diğer elin ses düzeyini kontrol etmesi iki karşılaştırılan durumdur; 'while' (-ken, oysa) gerekir.",
        ],
        [
          "(19) ----",
          ["where", "which", "when", "whose", "what"],
          "Virgülden sonra 'the United States' yer ismini niteleyen ilgi zarfı gerekir; 'where' kullanılır.",
        ],
        [
          "(20) ----",
          ["but", "so", "because", "and", "or"],
          "Enstrümanın yaygınlaşmaması ile sesinin milyonlarca kişiye tanıdık gelmesi zıt iki durumdur; 'but' gerekir.",
        ],
        [
          "(21) ----",
          ["for", "with", "by", "at all", "on"],
          "Fiyat bildirirken 'be sold for + price' kalıbı kullanılır: 'sold for a fraction of the price'.",
        ],
      ],
    },
    {
      text:
        "The didgeridoo is a wind instrument traditionally played by Aboriginal people in northern Australia. It is usually made from a branch of a eucalyptus tree {1} has been hollowed out by termites. The player cuts the branch, cleans out the inside and often decorates the outside with painted designs. To play the instrument, the musician vibrates their lips against one end to produce a deep, continuous drone. Skilled players use a technique called circular breathing, {2} allows them to keep the sound going for many minutes without stopping. They breathe in quickly through the nose while pushing air out of the mouth with the cheeks. The didgeridoo has traditionally been played {3} ceremonies, often accompanied by singing and clapping sticks. In some communities, there are customs about who may play it, and these are respected by many musicians today. In recent decades, the instrument has become popular {4} the world, and it is now heard in rock, jazz and electronic music. Interestingly, a small study published in 2006 suggested that regularly playing the didgeridoo might help to reduce snoring, {5} the muscles of the throat become stronger with practice.",
      blanks: [
        [
          "(22) ----",
          ["that", "who", "what", "where", "whose"],
          "Boşluk 'a branch of a eucalyptus tree' ismini niteleyen ve özne görevindeki ilgi zamiridir; 'that' gerekir.",
        ],
        [
          "(23) ----",
          ["which", "who", "what", "where", "it"],
          "Virgülden sonra 'circular breathing' tekniğini niteleyen ilgi zamiri 'which' gerekir.",
        ],
        [
          "(24) ----",
          ["at", "of", "from", "under", "among"],
          "Bir etkinlikte, törende bulunmayı anlatırken 'at ceremonies' kullanılır.",
        ],
        [
          "(25) ----",
          ["around", "through", "between", "along", "across from"],
          "'around the world' = 'dünyanın dört bir yanında' kalıplaşmış ifadedir.",
        ],
        [
          "(26) ----",
          ["perhaps because", "even though", "unless", "in order that", "as long as"],
          "Horlamanın azalmasının olası nedeni boğaz kaslarının pratikle güçlenmesidir; 'perhaps because' gerekir.",
        ],
      ],
    },
  ],
  completion: [
    [
      "The concert had to be cancelled at the last minute ----.",
      [
        "because the lead singer had lost her voice",
        "so that more people could buy tickets for the show",
        "although the band was ready to play that evening",
        "unless the weather becomes much better by the evening",
        "even though thousands of fans were extremely disappointed",
      ],
      "Konserin son anda iptal edilmesinin mantıklı nedeni solistin sesinin kısılmasıdır.",
    ],
    [
      "While some people find it easier to work with music in the background, ----.",
      [
        "others find that it makes concentrating on their work harder",
        "they usually listen to music that has no words at all",
        "music has always been popular among students and workers",
        "it is often played in shops and restaurants during the day",
        "most of them prefer to listen to it through their headphones",
      ],
      "'While' iki karşıt durumu karşılaştırır: bazıları müzikle daha kolay çalışırken başkalarının dikkati dağılır.",
    ],
    [
      "If you play your music at full volume through headphones every day, ----.",
      [
        "you may gradually damage your hearing over the years",
        "you would have been able to hear it much more clearly",
        "your neighbours had complained about the noise many times",
        "the batteries were going to run out much more slowly",
        "you hardly ever listened to the same song more than once",
      ],
      "Birinci tip koşul ana cümlede şimdiki/gelecek bir sonuç ister; mantıklı sonuç zamanla işitmenin zarar görebilmesidir.",
    ],
    [
      "The old cinema was turned into a concert hall ----.",
      [
        "after it had stood empty for nearly ten years",
        "so that it could continue to show films every evening",
        "although local people wanted to have a place for concerts",
        "unless the town council agrees to provide some of the money",
        "because nobody in the town was interested in music at all",
      ],
      "Eski sinemanın konser salonuna dönüştürülmesi, yaklaşık on yıl boş kaldıktan sonra gerçekleşmiştir; zaman ilişkisi anlamlıdır.",
    ],
    [
      "Many musicians practise for hours every day ----.",
      [
        "in order to keep their skills at a high level",
        "even though they never want to improve their playing",
        "unless they have already learned how to play an instrument",
        "because they have no interest in performing in public",
        "so that they will soon forget the pieces they have learned",
      ],
      "Müzisyenlerin her gün saatlerce çalışmasının amacı becerilerini yüksek düzeyde tutmaktır.",
    ],
    [
      "So many people wanted tickets for the festival ----.",
      [
        "that the website crashed within minutes of the sale opening",
        "because the organisers had decided not to sell any tickets",
        "although it was the first time the festival had been held",
        "so the festival was moved to a smaller field outside town",
        "unless the organisers decide to add another day of music",
      ],
      "'So many ... that' sonuç bildiren bir yapıdır; ikinci kısım 'that' ile başlamalıdır.",
    ],
    [
      "Scientists have found that babies can recognise songs ----.",
      [
        "that were played to them before they were born",
        "who had heard them on the radio many years later",
        "where most of them were sung by their grandparents",
        "which they will never be able to hear again in future",
        "whose words they had learned to write by themselves",
      ],
      "'songs' ismini niteleyen ve anlamlı bir bilgi veren ilgi cümlesi gerekir: doğmadan önce kendilerine çalınan şarkılar.",
    ],
    [
      "Even though the singer could not read music, ----.",
      [
        "she went on to write dozens of very successful songs",
        "she had never had any music lessons as a child",
        "she found it very difficult to read the notes on the page",
        "she was unable to learn any new songs for the concert",
        "most of her fans had no idea that she couldn't read music",
      ],
      "'Even though' zıtlık bildirir: nota okuyamamasına rağmen düzinelerce başarılı şarkı yazmıştır.",
    ],
    [
      "The neighbours complained about the noise, ----.",
      [
        "so the band agreed to stop practising after ten o'clock",
        "because the band had moved to a quieter part of the town",
        "although they had been asked to make as much noise as possible",
        "unless the band decides to play their instruments more loudly",
        "where they had heard the band play their new songs in the park",
      ],
      "Komşuların gürültüden şikâyet etmesinin mantıklı sonucu grubun saat ondan sonra prova yapmamayı kabul etmesidir; 'so' sonuç bildirir.",
    ],
    [
      "Had the hall not been designed so carefully, ----.",
      [
        "the sound in the back rows would have been much poorer",
        "the audience will be able to hear the music very clearly",
        "the architects had been asked to make the stage larger",
        "the musicians were not going to play there any more",
        "the concerts are usually held in the open air in summer",
      ],
      "'Had the hall not been designed' devrik üçüncü tip koşul cümlesidir; ana cümlede 'would have + V3' gerekir.",
    ],
  ],
  enTr: [
    [
      "Listening to music you enjoy can lift your mood and help you cope with stress.",
      [
        "Sevdiğiniz müziği dinlemek ruh hâlinizi iyileştirip stresle başa çıkmanıza yardımcı olabilir.",
        "Stresli olduğunuzda sevdiğiniz müziği dinlemek ruh hâlinizi daha da kötüleştirebilir.",
        "Ruh hâliniz iyi olduğunda sevdiğiniz müziği dinlemek stresinizi artırabilir.",
        "Stresle başa çıkmanın en iyi yolu her gün aynı müziği dinlemektir.",
        "Müzik dinlemekten hoşlanan insanlar, stresli dönemlerde genellikle ruh hâllerini daha kolay iyileştirir.",
      ],
      "'Listening to music you enjoy' = 'sevdiğiniz müziği dinlemek'; 'lift your mood' = 'ruh hâlinizi iyileştirmek'; 'cope with stress' = 'stresle başa çıkmak'.",
    ],
    [
      "The festival, which was first held in a small village, now draws music lovers from dozens of countries.",
      [
        "İlk kez küçük bir köyde düzenlenen festival, artık onlarca ülkeden müzikseverleri çekiyor.",
        "Festival, dünyanın her yerinden gelen ziyaretçiler nedeniyle küçük bir köye taşındı.",
        "Küçük bir köyde düzenlenen festivale dünyanın her yerinden ziyaretçi gelmesi bekleniyor.",
        "Dünyanın her yerinden gelen ziyaretçiler, festivali ilk kez küçük bir köyde gördü.",
        "Festival artık küçük bir köyde düzenlenmiyor, çünkü çok fazla ziyaretçi çekiyor.",
      ],
      "'which was first held in a small village' = 'ilk kez küçük bir köyde düzenlenen'; 'now attracts visitors from all over the world' = 'artık dünyanın her yerinden ziyaretçi çekiyor'.",
    ],
    [
      "It is not clear why some songs get stuck in our heads while others are quickly forgotten.",
      [
        "Bazı şarkıların neden aklımıza takılıp kaldığı, diğerlerinin ise çabucak unutulduğu açık değildir.",
        "Bazı şarkılar aklımıza takılıp kaldığı için diğer şarkıları da genellikle çok çabuk unuturuz.",
        "Aklımıza takılıp kalan şarkıları çabucak unutmanın en etkili yolu henüz açık değildir.",
        "Çabucak unutulan şarkılar genellikle aklımıza takılan şarkılardan daha kısadır.",
        "Bazı şarkıların aklımıza takılıp kaldığı ve hiçbir zaman unutulmadığı açıktır.",
      ],
      "'It is not clear why' = '... neden ... açık değildir'; 'get stuck in our heads' = 'aklımıza takılıp kalmak'; 'while others are quickly forgotten' = 'diğerleri ise çabucak unutulur'.",
    ],
  ],
  trEn: [
    [
      "Konser salonundaki her koltuk, sahneden gelen sesi eşit derecede iyi duyabilecek şekilde tasarlandı.",
      [
        "Every seat in the concert hall was designed so that the sound from the stage could be heard equally well.",
        "The seats nearest the stage were designed so that the sound could be heard better than at the back.",
        "The sound from the stage was designed to be much louder in some seats of the concert hall than in others.",
        "Every seat in the concert hall was replaced because the sound from the stage could not be heard well.",
        "The concert hall was designed with fewer seats so that the sound from the stage would be clearer.",
      ],
      "'her koltuk ... eşit derecede iyi duyabilecek şekilde tasarlandı' = every seat was designed so that the sound could be heard equally well.",
    ],
    [
      "Pek çok müzisyen, sahneye çıkmadan önce hâlâ heyecanlandığını itiraf ediyor.",
      [
        "Many musicians admit that they still feel nervous before going on stage.",
        "Many musicians say that they no longer feel nervous before going on stage.",
        "Most musicians feel nervous only after they have left the stage.",
        "Musicians who feel nervous before going on stage rarely admit it to others.",
        "Many musicians stopped going on stage because they always felt very nervous.",
      ],
      "'hâlâ heyecanlandığını itiraf ediyor' = admit that they still feel nervous; 'sahneye çıkmadan önce' = before going on stage.",
    ],
    [
      "Araştırmacılara göre, bir enstrüman çalmayı öğrenmek çocukların hafızasını güçlendirebilir.",
      [
        "According to researchers, learning to play an instrument may strengthen children's memory.",
        "Researchers say that children with a strong memory learn to play instruments more quickly.",
        "According to researchers, children should learn to play an instrument before they start school.",
        "Researchers have found that playing an instrument has no effect on children's memory.",
        "Learning to play an instrument is the best way for researchers to test children's memory.",
      ],
      "'Araştırmacılara göre' = according to researchers; 'hafızasını güçlendirebilir' = may strengthen children's memory.",
    ],
  ],
  reading: [
    {
      text:
        "Almost everyone has had the experience of a short piece of music repeating itself over and over in their mind, often for hours. Psychologists call this phenomenon 'involuntary musical imagery', but it is more commonly known as an earworm. Surveys suggest that more than ninety per cent of people experience earworms at least once a week. Usually the tune is one that the person has heard recently or many times, and it is often only a fragment, such as the chorus of a song, rather than the whole piece. Researchers have found that songs that become earworms tend to share certain features. They are usually fairly fast, and their melodies follow a common pattern but contain an unusual jump or repetition that makes them stand out. Earworms seem to appear most often when the mind is not fully occupied, for example during routine tasks such as walking or washing up. For most people they are harmless, if sometimes irritating. Several studies have tested ways of getting rid of them. Interestingly, chewing gum appears to help, possibly because it interferes with the parts of the brain involved in imagining speech and singing. Another approach is simply to listen to the whole song, since some researchers believe that an unfinished tune is more likely to keep repeating.",
      questions: [
        [
          "According to the passage, earworms ----.",
          [
            "are experienced by the great majority of people",
            "are mostly caused by songs that people have never heard before",
            "usually consist of the whole song from beginning to end",
            "happen only to people who have studied music for many years",
            "are a serious medical problem that needs to be treated",
          ],
          "Metne göre anketler insanların yüzde doksanından fazlasının en az haftada bir kez kulak kurdu yaşadığını göstermektedir.",
        ],
        [
          "Songs that become earworms often ----.",
          [
            "have a familiar shape with a surprising feature",
            "are very slow and have no repeated parts in them",
            "are sung without any instruments playing in the background",
            "are much longer than most other popular songs",
            "have melodies that are very difficult to remember",
          ],
          "Metinde bu şarkıların melodilerinin yaygın bir kalıbı izlediği ama öne çıkmalarını sağlayan alışılmadık bir sıçrama ya da tekrar içerdiği belirtilir.",
        ],
        [
          "Earworms seem to be most common when people ----.",
          [
            "are doing something that requires little thought",
            "are concentrating hard on a difficult piece of work",
            "are listening carefully to a new piece of music",
            "are trying to fall asleep at the end of a busy day",
            "are talking to a group of friends or colleagues",
          ],
          "Metne göre kulak kurtları zihin tam meşgul değilken, örneğin yürüme ya da bulaşık yıkama gibi rutin işler sırasında ortaya çıkar.",
        ],
        [
          "It can be inferred from the passage that chewing gum may help because ----.",
          [
            "it keeps busy the brain areas used to imagine singing",
            "it makes people stop listening to music completely",
            "it helps people to remember the end of the song",
            "it makes people more relaxed while they are working",
            "it improves people's ability to concentrate on tasks",
          ],
          "Metinde sakızın beyinde konuşma ve şarkı söylemeyi hayal etmekle ilgili bölümlere müdahale ettiği için işe yarayabileceği belirtilir.",
        ],
      ],
    },
    {
      text:
        "Evelyn Glennie is one of the most successful solo percussionists in the world. She has performed with leading orchestras, won several major awards and inspired composers to write hundreds of new pieces for percussion. What makes her career especially remarkable is that she has been profoundly deaf since the age of twelve. As a child in Scotland, she gradually lost most of her hearing, and doctors advised her parents that she should attend a school for deaf children. Glennie, however, was determined to continue studying music. With the help of a teacher, she learned to sense the different notes of a drum through vibrations in her hands, arms and other parts of her body. She often performs barefoot so that she can feel the music through the floor. Glennie has argued that hearing is simply a specialised form of touch and that everyone, whether deaf or not, can learn to listen with the whole body. When she first applied to a leading music academy in London, she was nearly turned away because of her deafness. Her success there led the academy to change its admissions policy, and she has since campaigned for better music education for all children, including those with disabilities.",
      questions: [
        [
          "According to the passage, Glennie's doctors believed that she ----.",
          [
            "should be educated at a school for deaf children",
            "would soon recover her hearing if she stopped playing music",
            "ought to learn to play the drums rather than the piano",
            "was not musical enough to become a professional performer",
            "should study music at a famous academy in London",
          ],
          "Metne göre doktorlar ailesine onun işitme engelli çocuklar için bir okula gitmesi gerektiğini söylemiştir.",
        ],
        [
          "Glennie often performs without shoes ----.",
          [
            "in order to feel the vibrations through the floor",
            "because she finds it more comfortable on large stages",
            "so that the audience can see her moving around easily",
            "because her teacher told her to do so when she was a child",
            "since shoes make too much noise on a wooden stage",
          ],
          "Metinde müziği zeminden hissedebilmek için sık sık yalınayak çaldığı belirtilir.",
        ],
        [
          "Glennie believes that ----.",
          [
            "hearing is closely related to the body's sense of touch",
            "only deaf people are able to feel music with their bodies",
            "percussion is the easiest instrument for deaf people to learn",
            "music schools should only accept the most talented children",
            "children should start to learn music at the age of twelve",
          ],
          "Metne göre Glennie işitmenin özelleşmiş bir dokunma biçimi olduğunu savunur.",
        ],
        [
          "It can be inferred from the passage that the music academy in London ----.",
          [
            "had once made it difficult for deaf students to be accepted",
            "was the first school to teach percussion to deaf students",
            "advised Glennie's parents to send her to a special school",
            "asked Glennie to teach its students how to play the drums",
            "refused to change its rules even after Glennie's success",
          ],
          "Metinde Glennie'nin sağırlığı nedeniyle neredeyse geri çevrildiği ve onun başarısının akademiyi kabul politikasını değiştirmeye yönelttiği anlatılır; demek ki eskiden işitme engelli öğrencilerin kabulü zordu.",
        ],
      ],
    },
    {
      text:
        "The ancient theatre at Epidaurus in southern Greece was built in the fourth century BC and could hold around 14,000 spectators. It is famous not only for its beauty but also for its remarkable acoustics. Visitors who sit in the highest rows, more than fifty metres from the stage, report that they can hear an actor drop a coin or strike a match. For centuries, people wondered how the ancient builders had achieved this. Some believed that the wind usually blew from the stage towards the audience and carried the sound, while others pointed to the shape of the theatre, which is a semicircle built into the side of a hill. In 2007, a team of researchers in the United States suggested a further explanation. Using computer models, they found that the rows of limestone seats act as a kind of filter. The steps reduce low-frequency sounds, such as the murmuring of the crowd and the noise of the wind, while reflecting the higher frequencies of the actors' voices back towards the audience. The human brain, they argued, can then fill in the missing low notes of the voices. It is unlikely that the builders understood these physical principles, but they may have improved their designs over many generations by trial and error.",
      questions: [
        [
          "According to the passage, visitors in the highest rows ----.",
          [
            "can hear very quiet sounds made on the stage",
            "find it difficult to hear what the actors are saying",
            "must use special equipment to hear the performance",
            "are usually disturbed by the noise of the wind",
            "can see the stage clearly but cannot hear anything",
          ],
          "Metne göre en üst sıralarda oturan ziyaretçiler bir oyuncunun yere bozuk para düşürdüğünü ya da kibrit çaktığını duyabildiklerini söyler.",
        ],
        [
          "The researchers in 2007 found that the seats ----.",
          [
            "weaken background noise and reflect the actors' voices",
            "make all sounds in the theatre much louder than before",
            "were built from a type of stone that absorbs all sound",
            "allow the wind to carry the sound towards the stage",
            "make it possible for the audience to hear low notes clearly",
          ],
          "Metinde basamakların kalabalığın mırıltısı ve rüzgâr gibi düşük frekanslı sesleri azalttığı, oyuncuların seslerindeki yüksek frekansları ise seyirciye geri yansıttığı belirtilir.",
        ],
        [
          "According to the researchers, the human brain ----.",
          [
            "completes the low notes that the seats remove",
            "cannot understand voices without their low notes",
            "is easily confused by the echoes in the theatre",
            "pays more attention to noise than to voices",
            "hears higher sounds better in the open air",
          ],
          "Metne göre araştırmacılar beynin seslerdeki eksik düşük notaları tamamlayabildiğini öne sürmüştür.",
        ],
        [
          "The writer suggests that the builders of the theatre ----.",
          [
            "probably learned from experience over a long period",
            "had a detailed scientific knowledge of how sound travels",
            "used computer models similar to those of modern researchers",
            "built the theatre in a single year without any plans",
            "did not care about how well the audience could hear",
          ],
          "Metnin sonunda inşaatçıların bu fiziksel ilkeleri muhtemelen bilmediği ama tasarımlarını nesiller boyunca deneme yanılma yoluyla geliştirmiş olabilecekleri belirtilir.",
        ],
      ],
    },
    {
      text:
        "In a small number of laboratories around the world, there are rooms so quiet that most people cannot bear to stay in them for long. These are known as anechoic chambers, which means 'without echoes'. Their walls, floors and ceilings are covered with thick wedges of foam or fibreglass that absorb almost all sound, and the rooms are often built on springs or separated from the rest of the building to block out vibrations. Engineers use them to test products such as microphones, loudspeakers and mobile phones, and to measure how much noise machines make. Inside, the silence is so complete that visitors begin to notice sounds that are normally hidden, such as their own heartbeat, the movement of air in their lungs and even a faint high-pitched noise produced by the nervous system. Many people find the experience disturbing. Without the echoes that normally help us to judge the size of a space, some visitors feel disoriented, and a few even lose their balance. Some laboratories have offered challenges to see how long visitors can sit alone in the dark in their chambers, and most give up within an hour. Yet for some engineers who work in them every day, the rooms are simply a peaceful place to concentrate.",
      questions: [
        [
          "According to the passage, anechoic chambers are mainly used ----.",
          [
            "for testing equipment and measuring noise",
            "to help people relax after a stressful day at work",
            "to treat patients who suffer from hearing problems",
            "as recording studios for musicians and singers",
            "to train astronauts to live alone for long periods",
          ],
          "Metne göre mühendisler bu odaları mikrofon, hoparlör ve cep telefonu gibi ürünleri test etmek ve makinelerin gürültüsünü ölçmek için kullanır.",
        ],
        [
          "The rooms are built on springs or separated from the building in order to ----.",
          [
            "prevent vibrations from entering",
            "make the rooms easier to move to another building",
            "allow visitors to feel more comfortable inside",
            "reduce the cost of building the laboratory",
            "help visitors to keep their balance",
          ],
          "Metinde odaların titreşimleri engellemek için yaylar üzerine inşa edildiği ya da binanın geri kalanından ayrıldığı belirtilir.",
        ],
        [
          "Some visitors lose their sense of direction in the chambers because ----.",
          [
            "echoes that usually help them judge space are missing",
            "the rooms are kept completely dark at all times",
            "the foam on the walls produces a strange smell",
            "they cannot hear their own heartbeat any more",
            "the floor moves slightly whenever they walk",
          ],
          "Metne göre bir alanın büyüklüğünü değerlendirmemize normalde yardımcı olan yankılar olmadığı için bazı ziyaretçiler yönünü kaybeder.",
        ],
        [
          "It can be understood from the passage that ----.",
          [
            "not everyone reacts to the silence in the same way",
            "nobody has ever stayed in an anechoic chamber for an hour",
            "engineers dislike working in the chambers every day",
            "the chambers are completely silent for every visitor",
            "the nervous system stops working in total silence",
          ],
          "Metinde pek çok kişinin deneyimi rahatsız edici bulduğu, bazı mühendislerin ise odaları huzurlu bir çalışma yeri olarak gördüğü anlatılır; demek ki herkes sessizliğe aynı tepkiyi vermez.",
        ],
      ],
    },
    {
      text:
        "Tinnitus is the experience of hearing a sound, such as ringing, buzzing or hissing, when there is no external source of that sound. It is surprisingly common: studies estimate that between ten and fifteen per cent of adults have it to some degree. For most, it is mild and only noticeable in quiet surroundings, but for a minority it is loud and constant enough to affect sleep, concentration and mood. Tinnitus is not a disease in itself but a symptom of something else. The most common cause is damage to the tiny hair cells in the inner ear, which can result from ageing or from exposure to loud noise. Many people notice a ringing in their ears after a loud concert, and although this usually disappears within a day or two, repeated exposure can lead to permanent tinnitus. Scientists now believe that the sound is often produced by the brain rather than the ear. When the ear sends fewer signals to the brain, the brain may try to compensate by increasing its own activity, and this extra activity is experienced as sound. There is currently no cure for most types of tinnitus, but treatments such as sound therapy and counselling can help people to notice it less and to live with it more comfortably.",
      questions: [
        [
          "According to the passage, tinnitus ----.",
          [
            "is a sound heard without any source outside the body",
            "is a rare disease that affects only very old people",
            "can only be heard by other people standing nearby",
            "is always loud enough to stop people from sleeping",
            "is caused by an infection in the outer part of the ear",
          ],
          "Metne göre kulak çınlaması, dışarıda o sesin hiçbir kaynağı yokken çınlama, vızıltı ya da tıslama gibi bir ses duymaktır.",
        ],
        [
          "The writer mentions loud concerts in order to show that ----.",
          [
            "repeated exposure to loud noise can lead to tinnitus",
            "most musicians suffer from permanent tinnitus",
            "concerts should be banned in residential areas",
            "tinnitus always disappears within a few hours",
            "young people are not interested in their health",
          ],
          "Yazar konserden sonra kulak çınlamasının yaygın olduğunu ve tekrarlanan maruziyetin kalıcı çınlamaya yol açabileceğini göstermek için konserlerden söz eder.",
        ],
        [
          "Scientists now think that tinnitus often results from ----.",
          [
            "the brain's response to receiving fewer signals",
            "the hair cells in the ear producing too many signals",
            "people paying too much attention to quiet sounds",
            "the brain becoming less active as people get older",
            "a lack of sleep and poor concentration at work",
          ],
          "Metinde kulak beyne daha az sinyal gönderdiğinde beynin kendi etkinliğini artırarak bunu telafi etmeye çalışabileceği ve bu etkinliğin ses olarak algılandığı anlatılır.",
        ],
        [
          "It can be inferred from the passage that current treatments for tinnitus ----.",
          [
            "aim to make the condition easier to live with",
            "remove the cause of the sound in most cases",
            "involve replacing the damaged hair cells",
            "are only available to people with mild symptoms",
            "have been shown to make the problem worse",
          ],
          "Metne göre çoğu tür için tedavi yoktur, ancak ses terapisi ve danışmanlık insanların onu daha az fark etmesine ve onunla daha rahat yaşamasına yardımcı olur.",
        ],
      ],
    },
  ],
  dialogue: [
    [
      "Melis: I've got two tickets for the jazz concert on Saturday.\nArda: ----\nMelis: Don't worry, it doesn't start until nine, so you'll have plenty of time.",
      [
        "I'd love to come, but I work until eight on Saturdays.",
        "I've never really liked jazz, to be honest.",
        "How much did you pay for the tickets?",
        "Who else is coming to the jazz concert with us on Saturday?",
        "Is the concert hall far from where you live, or can we walk?",
      ],
      "Melis 'Endişelenme, dokuzda başlıyor, bolca vaktin olacak' der; demek ki Arda cumartesi sekize kadar çalıştığını söylemiştir.",
    ],
    [
      "Customer: I'd like to return these headphones, please.\nAssistant: ----\nCustomer: Yes, the sound only comes out of the left side.",
      [
        "Of course. Is there something wrong with them?",
        "I'm sorry, we don't sell headphones here.",
        "Would you like to try a more expensive pair?",
        "Do you have the receipt with you today?",
        "These are the most popular ones we sell.",
      ],
      "Müşteri sesin yalnızca sol taraftan geldiğini söyler; demek ki satış görevlisi kulaklıklarda bir sorun olup olmadığını sormuştur.",
    ],
    [
      "Teacher: You played that piece beautifully, Ece.\nEce: ----\nTeacher: Don't worry. Everyone makes mistakes, and nobody in the audience noticed.",
      [
        "Thank you, but I got the notes wrong in the middle.",
        "Thank you. I've been playing it for years.",
        "Could I play it again at the next concert?",
        "I'd like to learn a more difficult piece.",
        "My parents bought me a new piano last week.",
      ],
      "Öğretmen 'Endişelenme, herkes hata yapar' der; demek ki Ece parçanın ortasında notaları yanlış çaldığını söylemiştir.",
    ],
    [
      "Neighbour: Could you turn your music down a little, please? My baby is trying to sleep.\nStudent: ----\nNeighbour: Thanks, I really appreciate it.",
      [
        "Oh, I'm so sorry. I didn't realise it was that loud.",
        "I'm afraid I can't. I'm having a party tonight.",
        "Why don't you close your windows instead?",
        "Babies usually sleep better with some music.",
        "It's only nine o'clock, so it isn't late yet.",
      ],
      "Komşu 'Teşekkürler, gerçekten minnettarım' der; demek ki öğrenci özür dileyip müziği kısmayı kabul etmiştir.",
    ],
    [
      "Interviewer: How did you first get into sound engineering?\nEngineer: ----\nInterviewer: So it was your interest in music that came first?",
      [
        "I played in a band at school and wanted to know how recordings were made.",
        "I studied engineering at university and then worked for a car company.",
        "Sound engineers usually work long hours in recording studios.",
        "The job is much more difficult than most people think it is.",
        "I've been working in this studio for more than fifteen years.",
      ],
      "Görüşmeci 'Yani önce müziğe olan ilginiz geldi?' diye sorar; demek ki mühendis okulda bir grupta çaldığını ve kayıtların nasıl yapıldığını merak ettiğini söylemiştir.",
    ],
  ],
  restatement: [
    [
      "The song was so popular that it stayed at number one for twelve weeks.",
      [
        "Such was the song's popularity that it remained at number one for twelve weeks.",
        "The song became popular only after it had been at number one for twelve weeks.",
        "Although the song was at number one for twelve weeks, it was not very popular.",
        "The song would have been more popular if it had stayed at number one longer.",
        "Twelve weeks after the song was released, it finally reached number one.",
      ],
      "'so popular that' = 'Such was the song's popularity that'; ilk seçenek aynı anlamı verir.",
    ],
    [
      "You needn't have bought tickets in advance; there were plenty of seats left.",
      [
        "It wasn't necessary to buy tickets in advance, as many seats were still available.",
        "You should have bought tickets in advance because all the seats were sold.",
        "You were right to buy tickets in advance, since there were very few seats left.",
        "You couldn't buy tickets in advance, so you had to wait for a seat.",
        "You will need to buy tickets in advance next time because seats are limited.",
      ],
      "'needn't have bought' = yapılması gerekmeyen ama yapılmış bir eylem; ilk seçenek aynı anlamı verir.",
    ],
    [
      "The concert was not as long as we had expected.",
      [
        "The concert turned out to be shorter than we had expected.",
        "The concert lasted much longer than we had expected.",
        "We had expected the concert to be shorter than it was.",
        "The concert was exactly as long as we had expected.",
        "We didn't know how long the concert was going to be.",
      ],
      "'not as long as we had expected' = beklediğimizden daha kısa; ilk seçenek aynı anlamı verir.",
    ],
    [
      "It's a long time since I last played the guitar.",
      [
        "I haven't played the guitar for a long time.",
        "I have been playing the guitar for a long time.",
        "I last played the guitar only a short time ago.",
        "It took me a long time to learn to play the guitar.",
        "I played the guitar for a long time when I was young.",
      ],
      "'It's a long time since I last played' = 'I haven't played ... for a long time'; ilk seçenek aynı anlamı verir.",
    ],
  ],
  paragraph: [
    [
      "In the early 1970s, a Japanese drummer named Daisuke Inoue was often asked by businessmen to play along while they sang in bars. ---- He built a machine that played backing music when customers put in a coin, and he rented it to bars in the city of Kobe. The idea quickly spread, and karaoke, which means 'empty orchestra' in Japanese, is now enjoyed all over the world.",
      [
        "Realising that he could not always be there, he came up with a solution.",
        "Many Japanese businessmen worked very long hours in the 1970s and 1980s.",
        "Drummers are often thought to be the most important members of a band.",
        "Kobe is a large port city in the west of Japan, famous for its beef.",
        "Some people are too shy to sing in front of their friends and colleagues.",
      ],
      "Boşluktan sonra Inoue'nun bir makine yaptığı anlatılır; boşluğa her zaman orada olamayacağını fark edip bir çözüm bulduğunu söyleyen cümle gelmelidir.",
    ],
    [
      "Busking, or performing music in public places for money, has a long history. In medieval Europe, travelling musicians moved from town to town, playing at markets and fairs. ---- Some even require buskers to audition before they can perform in the most popular spots, such as busy squares and underground stations.",
      [
        "Today, many cities have rules about where and when buskers may play.",
        "Medieval markets sold food, cloth and animals from the surrounding farms.",
        "Some famous singers started their careers as street musicians in big cities.",
        "Many people prefer to listen to live music rather than recorded music.",
        "Underground stations can be very crowded during the morning rush hour.",
      ],
      "Boşluktan sonra 'Some even require ...' (hatta bazıları ... ister) ifadesi bir önceki cümlede kurallardan söz edildiğini gösterir; boşluğa pek çok şehrin sokak müzisyenleri için kurallarının olduğunu söyleyen cümle gelmelidir.",
    ],
    [
      "Absolute pitch is the rare ability to name or sing a musical note without hearing a reference note first. It is thought to occur in fewer than one in ten thousand people in Europe and North America. ---- Researchers believe this may be because the languages spoken there are tonal, meaning that the pitch of a word can change its meaning, so children learn to pay close attention to pitch from an early age.",
      [
        "However, it is far more common among speakers of languages like Mandarin.",
        "Many famous composers, such as Mozart, are said to have had absolute pitch.",
        "Musical notes are usually named using the letters A to G in English.",
        "Learning to play a musical instrument takes many years of practice.",
        "Some children start to have piano lessons at the age of four or five.",
      ],
      "Boşluktan sonra 'there' (orada) ve 'tonal languages' ifadeleri belirli dillerin konuşulduğu bir yerden söz edildiğini gösterir; boşluğa yeteneğin Mandarin gibi dilleri konuşanlarda çok daha yaygın olduğunu söyleyen cümle gelmelidir.",
    ],
    [
      "The bagpipes are most closely associated with Scotland, but similar instruments have been played for centuries across Europe, North Africa and the Middle East. ---- The player blows air into the bag through a pipe and then squeezes it with the arm, which pushes the air out through the other pipes and produces a continuous sound. Because of this, there is no pause in the music when the player takes a breath.",
      [
        "All of them consist of a bag, usually made of animal skin, and several pipes.",
        "Scotland attracts many tourists who come to see its castles and Highlands.",
        "Many people find the sound of the bagpipes too loud to enjoy indoors.",
        "Bagpipes are often played at weddings, funerals and other ceremonies.",
        "Learning to play the bagpipes can take many years of hard practice.",
      ],
      "Boşluktan sonra çalgıcının torbaya nasıl hava üflediği anlatılır; boşluğa bu çalgıların hepsinin genellikle hayvan derisinden yapılan bir torba ve birkaç borudan oluştuğunu söyleyen cümle gelmelidir.",
    ],
  ],
  irrelevant: [
    {
      sentences: [
        "Before radio and recorded music, most people heard music only when it was performed live.",
        "In the late nineteenth century, inventors developed machines that could record and play back sound.",
        "Early recordings were made on cylinders and later on flat discs, which were easier to produce in large numbers.",
        "Many people today prefer to listen to music on their phones while travelling.",
        "Within a few decades, the gramophone had made it possible to hear famous singers in ordinary living rooms.",
      ],
      odd: 3,
      why: "Parça ses kaydının ilk dönemlerini ve gramofonun yayılmasını anlatır. Bugün insanların müziği telefonda dinlemeyi tercih ettiğini söyleyen IV. cümle akışı bozar.",
    },
    {
      sentences: [
        "The saz, also called the bağlama, is one of the most important instruments in Turkish folk music.",
        "It has a long neck and a pear-shaped body, which is usually carved from mulberry or walnut wood.",
        "Mulberry trees are also grown in some regions to feed silkworms.",
        "The instrument is played with a small plectrum or with the fingers, a technique known as şelpe.",
        "For centuries, wandering poets known as âşıklar used the saz to accompany their songs.",
      ],
      odd: 2,
      why: "Parça sazı ve çalınışını anlatır. Dut ağaçlarının ipek böceklerini beslemek için yetiştirildiğini söyleyen III. cümle konudan sapar.",
    },
    {
      sentences: [
        "Sound is measured in decibels, and the scale increases very quickly.",
        "An increase of ten decibels means that a sound is ten times more intense.",
        "Normal conversation is around sixty decibels, while a rock concert can reach well over one hundred.",
        "Health experts warn that listening to sounds above eighty-five decibels for long periods can damage hearing.",
        "Many young people today spend several hours a day on social media.",
      ],
      odd: 4,
      why: "Parça desibel ölçeğini ve yüksek sesin işitmeye etkisini anlatır. Gençlerin sosyal medyada saatler geçirdiğini söyleyen V. cümle konudan sapar.",
    },
    {
      sentences: [
        "The metronome, a device that produces a regular beat, helps musicians to play at a steady speed.",
        "It was patented in 1815 by Johann Maelzel, although the idea had been developed by others before him.",
        "Composers soon began to write metronome markings on their music to show how fast it should be played.",
        "Some musicians, however, argue that practising too much with a metronome can make their playing sound mechanical.",
        "Vienna, where Maelzel lived for many years, has many famous concert halls.",
      ],
      odd: 4,
      why: "Parça metronomu ve müzisyenlerin onu nasıl kullandığını anlatır. Viyana'daki konser salonlarından söz eden V. cümle konudan sapar.",
    },
    {
      sentences: [
        "Shops and restaurants often think carefully about the music they play.",
        "Studies have found that slow music can encourage customers to stay longer and spend more in restaurants.",
        "Many people prefer to cook at home rather than eat out during the week.",
        "In one experiment, a wine shop sold more expensive bottles when it played classical music.",
        "Fast music, on the other hand, may make people eat or shop more quickly.",
      ],
      odd: 2,
      why: "Parça mağaza ve restoranlarda çalınan müziğin müşteri davranışına etkisini anlatır. İnsanların hafta içi evde yemek yapmayı tercih ettiğini söyleyen III. cümle konudan sapar.",
    },
  ],
};
