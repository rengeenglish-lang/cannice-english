/**
 * Genel İngilizce Seviye Testi — the short placement test that groups learners for Speaking Club.
 * Original items, five per CEFR band, easiest first. Answers stay on the server: the page renders
 * prompts and options only, and grading happens in the server action.
 */
export type PlacementBand = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type PlacementQuestion = { id: string; band: PlacementBand; prompt: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3 };

export const PLACEMENT_BANDS: PlacementBand[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1
  { id: "a1-1", band: "A1", prompt: "My sister ___ a teacher.", options: ["am", "is", "are", "be"], answer: 1 },
  { id: "a1-2", band: "A1", prompt: "There ___ two cats in the garden.", options: ["is", "am", "are", "be"], answer: 2 },
  { id: "a1-3", band: "A1", prompt: "I ___ coffee every morning.", options: ["drinks", "drinking", "drink", "am drink"], answer: 2 },
  { id: "a1-4", band: "A1", prompt: "— Where are you from? — ___", options: ["I'm fine, thanks.", "I'm from Izmir.", "I'm twenty.", "I'm a student."], answer: 1 },
  { id: "a1-5", band: "A1", prompt: "We go to the beach ___ summer.", options: ["on", "at", "in", "to"], answer: 2 },
  // A2
  { id: "a2-1", band: "A2", prompt: "Yesterday we ___ to the cinema.", options: ["go", "went", "gone", "were go"], answer: 1 },
  { id: "a2-2", band: "A2", prompt: "This bag is ___ than that one.", options: ["heavy", "more heavy", "heavier", "heaviest"], answer: 2 },
  { id: "a2-3", band: "A2", prompt: "Look at those clouds! It ___ rain.", options: ["is going to", "goes to", "will to", "is raining to"], answer: 0 },
  { id: "a2-4", band: "A2", prompt: "How ___ money do you have with you?", options: ["many", "much", "lot", "few"], answer: 1 },
  { id: "a2-5", band: "A2", prompt: "I was watching TV when the phone ___.", options: ["rang", "was ringing", "rings", "has rung"], answer: 0 },
  // B1
  { id: "b1-1", band: "B1", prompt: "I ___ in this city since 2019.", options: ["live", "am living", "have lived", "lived"], answer: 2 },
  { id: "b1-2", band: "B1", prompt: "If it rains tomorrow, we ___ the picnic.", options: ["cancel", "will cancel", "would cancel", "cancelled"], answer: 1 },
  { id: "b1-3", band: "B1", prompt: "The book ___ I borrowed from you was excellent.", options: ["who", "what", "which", "whose"], answer: 2 },
  { id: "b1-4", band: "B1", prompt: "You ___ wear a seat belt in a car. It's the law.", options: ["must", "might", "needn't", "could"], answer: 0 },
  { id: "b1-5", band: "B1", prompt: "She is really interested ___ learning Spanish.", options: ["on", "about", "in", "for"], answer: 2 },
  // B2
  { id: "b2-1", band: "B2", prompt: "If I had known about the meeting, I ___ it.", options: ["would attend", "will attend", "would have attended", "had attended"], answer: 2 },
  { id: "b2-2", band: "B2", prompt: "The new bridge ___ by the end of next year.", options: ["will have been completed", "will complete", "is completing", "has been completed"], answer: 0 },
  { id: "b2-3", band: "B2", prompt: "He denied ___ the window.", options: ["to break", "breaking", "break", "to have break"], answer: 1 },
  { id: "b2-4", band: "B2", prompt: "___ the heavy traffic, we arrived on time.", options: ["Although", "Despite", "However", "Because of"], answer: 1 },
  { id: "b2-5", band: "B2", prompt: "I'd rather you ___ my phone without asking.", options: ["don't use", "won't use", "didn't use", "not use"], answer: 2 },
  // C1
  { id: "c1-1", band: "C1", prompt: "Not only ___ the exam, but she also got the highest mark.", options: ["she passed", "did she pass", "she did pass", "passed she"], answer: 1 },
  { id: "c1-2", band: "C1", prompt: "The proposal was rejected on the ___ that it was too expensive.", options: ["reason", "basis", "grounds", "cause"], answer: 2 },
  { id: "c1-3", band: "C1", prompt: "Had they left earlier, they ___ the train.", options: ["would catch", "would have caught", "had caught", "caught"], answer: 1 },
  { id: "c1-4", band: "C1", prompt: "The government has pledged to ___ down on tax evasion.", options: ["crack", "break", "cut", "turn"], answer: 0 },
  { id: "c1-5", band: "C1", prompt: "Her argument was so ___ that nobody could find a flaw in it.", options: ["compelling", "compulsive", "competing", "complying"], answer: 0 },
  // C2
  { id: "c2-1", band: "C2", prompt: "The minister's remarks were deliberately ___, leaving journalists unsure of his position.", options: ["equivocal", "unequivocal", "eloquent", "explicit"], answer: 0 },
  { id: "c2-2", band: "C2", prompt: "Little ___ that the decision would cost him his career.", options: ["he realised", "did he realise", "he did realise", "realised he"], answer: 1 },
  { id: "c2-3", band: "C2", prompt: "The study's findings ___ the long-held assumption that diet alone determines weight.", options: ["call into question", "call off", "call for", "call up"], answer: 0 },
  { id: "c2-4", band: "C2", prompt: "Were the committee ___ the plan, construction would begin next spring.", options: ["approving", "to approve", "approved", "having approved"], answer: 1 },
  { id: "c2-5", band: "C2", prompt: "His apology sounded rather ___; few believed he really meant it.", options: ["perfunctory", "profound", "prolific", "pertinent"], answer: 0 },
];
