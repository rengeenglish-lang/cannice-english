export type SpeakingExam = "ielts" | "toefl";

export type SpeakingTask = {
  id: string; part: string; title: string; prompt: string; instructions: string;
  preparationSeconds: number; responseSeconds: number; targetWords: [number, number];
  reading?: { title: string; text: string; seconds: number };
  listening?: { title: string; script: string };
  taskType?: "repeat" | "interview";
};

export type SpeakingExamConfig = {
  name: string; formatLabel: string; duration: string; description: string;
  sectionInstructions: string[]; tasks: SpeakingTask[];
};

const ieltsTask = (id: string, part: string, title: string, prompt: string, instructions: string, preparationSeconds: number, responseSeconds: number, targetWords: [number, number]): SpeakingTask => ({ id, part, title, prompt, instructions, preparationSeconds, responseSeconds, targetWords });

export const SPEAKING_EXAMS: Record<SpeakingExam, SpeakingExamConfig> = {
  ielts: {
    name: "IELTS Speaking", formatLabel: "Güncel 3 bölümlü sınav formatı", duration: "Yaklaşık 11–14 dakika",
    description: "Mülakat, iki dakikalık uzun konuşma ve bağlantılı tartışma sorularıyla tam akışı deneyin.",
    sectionInstructions: [
      "Part 1: Günlük konularda kısa ve doğal yanıtlar verin.",
      "Part 2: Bir dakikalık hazırlıkta not alın, ardından iki dakikaya kadar konuşun.",
      "Part 3: Part 2 konusunu daha genel ve soyut açıdan tartışın.",
    ],
    tasks: [
      ieltsTask("ielts-p1-home", "Part 1 · Introduction and interview", "Home", "Let's talk about your home. What kind of place do you live in?", "Soruyu doğrudan yanıtlayın ve bir veya iki doğal ayrıntı ekleyin.", 0, 40, [35, 70]),
      ieltsTask("ielts-p1-area", "Part 1 · Introduction and interview", "Your area", "What do you like most about the area where you live?", "Kısa bir neden veya örnekle yanıtınızı geliştirin.", 0, 40, [35, 70]),
      ieltsTask("ielts-p1-study", "Part 1 · Introduction and interview", "Work or study", "Do you work or are you a student? What do you enjoy about it?", "Kişisel deneyiminizden söz edin; ezberlenmiş bir konuşma kullanmayın.", 0, 45, [40, 80]),
      ieltsTask("ielts-p1-free-time", "Part 1 · Introduction and interview", "Free time", "How do you usually spend your free time?", "Bir alışkanlığı açıklayın ve neden sevdiğinizi söyleyin.", 0, 45, [40, 80]),
      ieltsTask("ielts-p2-skill", "Part 2 · Long turn", "A skill you want to learn", "Describe a skill you would like to learn. You should say: what the skill is; why you want to learn it; how you would learn it; and explain how it would help you.", "Hazırlık sırasında not alabilirsiniz. Süre başladığında kesintisiz ve düzenli biçimde konuşun.", 60, 120, [150, 240]),
      ieltsTask("ielts-p3-change", "Part 3 · Discussion", "Learning and society", "How has the way people learn new skills changed in recent years?", "Genel eğilimleri açıklayın, nedenleri analiz edin ve örnek verin.", 0, 60, [70, 130]),
      ieltsTask("ielts-p3-school", "Part 3 · Discussion", "Schools and practical skills", "Should schools spend more time teaching practical skills? Why or why not?", "Görüşünüzü gerekçelendirin ve karşı görüşü de değerlendirin.", 0, 60, [70, 130]),
      ieltsTask("ielts-p3-age", "Part 3 · Discussion", "Learning at different ages", "Do adults and children learn skills in different ways?", "Karşılaştırın, çıkarım yapın ve uygun örnekler kullanın.", 0, 60, [70, 130]),
      ieltsTask("ielts-p3-future", "Part 3 · Discussion", "Skills of the future", "Which skills will become most important in the future, and why?", "Tahminde bulunun ve görüşünüzü açıkça destekleyin.", 0, 60, [70, 130]),
    ],
  },
  toefl: {
    name: "TOEFL iBT Speaking", formatLabel: "Güncel format · 21 Ocak 2026'dan itibaren", duration: "Yaklaşık 8 dakika · 11 soru",
    description: "Yedi Listen and Repeat ve dört Take an Interview sorusuyla güncel TOEFL iBT akışını uygulayın.",
    sectionInstructions: [
      "Listen and Repeat: Her cümleyi yalnızca bir kez dinleyin ve duyduğunuz biçimde tekrarlayın.",
      "Take an Interview: Önceden kaydedilmiş görüşmecinin dört sorusuna 45'er saniyede yanıt verin.",
      "İlk görüşme soruları deneyimlerinize, sonraki sorular görüş ve gerekçelerinize odaklanır.",
    ],
    tasks: [
      { id: "toefl-r1", part: "Listen and Repeat · 1 of 7", title: "Campus orientation", prompt: "Welcome to the student center.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [6, 6], taskType: "repeat", listening: { title: "Listen once", script: "Welcome to the student center." } },
      { id: "toefl-r2", part: "Listen and Repeat · 2 of 7", title: "Campus orientation", prompt: "The information desk is located near the main entrance.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [9, 9], taskType: "repeat", listening: { title: "Listen once", script: "The information desk is located near the main entrance." } },
      { id: "toefl-r3", part: "Listen and Repeat · 3 of 7", title: "Campus orientation", prompt: "You can collect your student identification card upstairs.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [8, 8], taskType: "repeat", listening: { title: "Listen once", script: "You can collect your student identification card upstairs." } },
      { id: "toefl-r4", part: "Listen and Repeat · 4 of 7", title: "Campus orientation", prompt: "Please bring your registration documents with you.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [7, 7], taskType: "repeat", listening: { title: "Listen once", script: "Please bring your registration documents with you." } },
      { id: "toefl-r5", part: "Listen and Repeat · 5 of 7", title: "Campus orientation", prompt: "Academic advisers are available by appointment throughout the week.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [9, 9], taskType: "repeat", listening: { title: "Listen once", script: "Academic advisers are available by appointment throughout the week." } },
      { id: "toefl-r6", part: "Listen and Repeat · 6 of 7", title: "Campus orientation", prompt: "If you need technical assistance, visit the support office beside the library.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [12, 12], taskType: "repeat", listening: { title: "Listen once", script: "If you need technical assistance, visit the support office beside the library." } },
      { id: "toefl-r7", part: "Listen and Repeat · 7 of 7", title: "Campus orientation", prompt: "Students who join an orientation tour often find it easier to locate important campus services.", instructions: "Cümleyi bir kez dinleyin ve aynen tekrar edin.", preparationSeconds: 0, responseSeconds: 8, targetWords: [14, 14], taskType: "repeat", listening: { title: "Listen once", script: "Students who join an orientation tour often find it easier to locate important campus services." } },
      { id: "toefl-i1", part: "Take an Interview · 1 of 4", title: "Student learning research", prompt: "First, tell me about a place where you usually study and explain why you choose that place.", instructions: "Kişisel deneyiminizi açık ve doğal biçimde anlatın.", preparationSeconds: 0, responseSeconds: 45, targetWords: [55, 90], taskType: "interview", listening: { title: "Interviewer", script: "First, tell me about a place where you usually study and explain why you choose that place." } },
      { id: "toefl-i2", part: "Take an Interview · 2 of 4", title: "Student learning research", prompt: "Describe one study habit that has helped you learn more effectively.", instructions: "Alışkanlığı açıklayın ve nasıl yardımcı olduğuna dair ayrıntı verin.", preparationSeconds: 0, responseSeconds: 45, targetWords: [55, 90], taskType: "interview", listening: { title: "Interviewer", script: "Describe one study habit that has helped you learn more effectively." } },
      { id: "toefl-i3", part: "Take an Interview · 3 of 4", title: "Student learning research", prompt: "Some universities require students to take courses outside their main field of study. Do you think this is beneficial? Why or why not?", instructions: "Görüşünüzü belirtin ve uygun gerekçelerle geliştirin.", preparationSeconds: 0, responseSeconds: 45, targetWords: [60, 95], taskType: "interview", listening: { title: "Interviewer", script: "Some universities require students to take courses outside their main field of study. Do you think this is beneficial? Why or why not?" } },
      { id: "toefl-i4", part: "Take an Interview · 4 of 4", title: "Student learning research", prompt: "In the future, do you think technology will make students more independent learners? Explain your opinion.", instructions: "Daha geniş bir görüşü açıkça savunun ve örnekle destekleyin.", preparationSeconds: 0, responseSeconds: 45, targetWords: [60, 95], taskType: "interview", listening: { title: "Interviewer", script: "In the future, do you think technology will make students more independent learners? Explain your opinion." } },
    ],
  },
};

export function isSpeakingExam(value: string): value is SpeakingExam { return value === "ielts" || value === "toefl"; }

export function analyseSpeaking(transcript: string, seconds: number) {
  const words = transcript.trim().match(/[A-Za-zÀ-ÖØ-öø-ÿ'-]+/g) ?? [];
  const fillers = transcript.match(/\b(um+|uh+|erm|like|you know)\b/gi) ?? [];
  return { wordCount: words.length, wordsPerMinute: Math.round(words.length / (Math.max(seconds, 1) / 60)), fillerCount: fillers.length };
}

export function repeatAccuracy(target: string, transcript: string) {
  const normalize = (value: string) => value.toLowerCase().match(/[a-z'-]+/g) ?? [];
  const expected = normalize(target);
  const actual = normalize(transcript);
  if (!expected.length) return 0;
  const matches = expected.reduce((total, word, index) => total + (actual[index] === word ? 1 : 0), 0);
  return Math.round((matches / expected.length) * 100);
}
