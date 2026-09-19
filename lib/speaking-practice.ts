export type SpeakingExam = "ielts" | "toefl";

export type SpeakingTask = {
  id: string;
  label: string;
  title: string;
  prompt: string;
  preparationSeconds: number;
  responseSeconds: number;
  targetWords: [number, number];
};

export const SPEAKING_EXAMS: Record<
  SpeakingExam,
  { name: string; description: string; tasks: SpeakingTask[] }
> = {
  ielts: {
    name: "IELTS Speaking",
    description: "Part 1, cue card ve tartışma sorularıyla sınav temposunda pratik yapın.",
    tasks: [
      {
        id: "ielts-part-1-home",
        label: "Part 1 · Interview",
        title: "Your hometown",
        prompt: "Tell me about the place where you live. What do you like most about it, and is there anything you would like to change?",
        preparationSeconds: 5,
        responseSeconds: 60,
        targetWords: [55, 100],
      },
      {
        id: "ielts-part-2-skill",
        label: "Part 2 · Cue card",
        title: "A skill you want to learn",
        prompt: "Describe a skill you would like to learn. Say what the skill is, why you want to learn it, how you would learn it, and explain how it would help you.",
        preparationSeconds: 60,
        responseSeconds: 120,
        targetWords: [120, 220],
      },
      {
        id: "ielts-part-3-learning",
        label: "Part 3 · Discussion",
        title: "Technology and learning",
        prompt: "How has technology changed the way people learn? Do you think online learning can completely replace classroom education? Why or why not?",
        preparationSeconds: 10,
        responseSeconds: 90,
        targetWords: [90, 170],
      },
    ],
  },
  toefl: {
    name: "TOEFL Speaking",
    description: "Bağımsız ve entegre görevlerle planlı, süreli yanıtlar oluşturun.",
    tasks: [
      {
        id: "toefl-task-1-study",
        label: "Task 1 · Independent",
        title: "Studying alone or together",
        prompt: "Some students prefer to study alone, while others prefer to study with a group. Which do you prefer? Use reasons and examples to support your answer.",
        preparationSeconds: 15,
        responseSeconds: 45,
        targetWords: [65, 100],
      },
      {
        id: "toefl-task-2-campus",
        label: "Task 2 · Campus situation",
        title: "A later library closing time",
        prompt: "The university plans to keep the library open two hours later on weekdays. A student supports the plan because quiet evening study space is limited and many students work during the day. Summarize the student's opinion and explain the reasons given.",
        preparationSeconds: 30,
        responseSeconds: 60,
        targetWords: [85, 130],
      },
      {
        id: "toefl-task-4-academic",
        label: "Task 4 · Academic summary",
        title: "The spacing effect",
        prompt: "The spacing effect means people remember information better when study sessions are spread over time instead of completed in one long session. Explain the concept and give an example of how a student could use it.",
        preparationSeconds: 20,
        responseSeconds: 60,
        targetWords: [85, 130],
      },
    ],
  },
};

export function isSpeakingExam(value: string): value is SpeakingExam {
  return value === "ielts" || value === "toefl";
}

export function analyseSpeaking(transcript: string, seconds: number) {
  const words = transcript.trim().match(/[A-Za-zÀ-ÖØ-öø-ÿ'-]+/g) ?? [];
  const fillers = transcript.match(/\b(um+|uh+|erm|like|you know)\b/gi) ?? [];
  const minutes = Math.max(seconds, 1) / 60;
  return {
    wordCount: words.length,
    wordsPerMinute: Math.round(words.length / minutes),
    fillerCount: fillers.length,
  };
}
