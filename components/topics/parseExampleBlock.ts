export type ParsedOption = { letter: string; text: string };

export type ParsedExample =
  | {
      kind: "mcq";
      index: number;
      question: string;
      options: ParsedOption[];
      correctLetter: string;
      explanation: string;
      distractorNotes?: ParsedOption[];
    }
  | { kind: "prose"; index: number; text: string };

const OPTIONS_RE_4 =
  /\(A\)\s*([^\n(]+?)\s*\(B\)\s*([^\n(]+?)\s*\(C\)\s*([^\n(]+?)\s*\(D\)\s*([^\n]+?)(?=\n|Doğru cevap|$)/;
const OPTIONS_RE_3 =
  /\(A\)\s*([^\n(]+?)\s*\(B\)\s*([^\n(]+?)\s*\(C\)\s*([^\n]+?)(?=\n|Doğru cevap|$)/;
const CORRECT_RE = /Doğru cevap[:\s]*\(([A-D])\)/;
const LABEL_LINE_RE = /^(?:Örnek(?:\s+\w+){0,2}|Soru)\s*:\s*/i;

function stripLeadingLabel(text: string): string {
  return text.replace(/^Örnek[^:]{0,30}:\s*/i, "").trim();
}

function cleanQuestionText(raw: string): string {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(LABEL_LINE_RE, ""))
    .join("\n")
    .trim();
}

/**
 * Splits a lesson's contentBody (produced by formatExamples() in prisma/seed.ts,
 * "Örnek 1: ...\n\nÖrnek 2: ...") into individual examples, and best-effort
 * parses each one into a lettered multiple-choice question when the text
 * actually contains "(A)...(D)..." options and a "Doğru cevap (X)" verdict.
 * Everything else (the majority of speaking/writing/translation examples,
 * which have no lettered options) falls back to a plain prose block —
 * never fabricated options or explanations.
 */
export function parseExampleBlocks(contentBody: string): ParsedExample[] {
  const blocks = contentBody
    .split(/\n\nÖrnek\s+\d+:\s*/)
    .map((block) => block.replace(/^Örnek\s+\d+:\s*/, "").trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const correctMatch = block.match(CORRECT_RE);
    const match4 = block.match(OPTIONS_RE_4);
    const match3 = !match4 ? block.match(OPTIONS_RE_3) : null;
    const optionsMatch = match4 ?? match3;

    if (!optionsMatch || !correctMatch || optionsMatch.index === undefined) {
      return { kind: "prose", index, text: stripLeadingLabel(block) };
    }

    const letters = match4 ? ["A", "B", "C", "D"] : ["A", "B", "C"];
    const options: ParsedOption[] = letters.map((letter, i) => ({
      letter,
      text: optionsMatch[i + 1].trim(),
    }));
    const correctLetter = correctMatch[1];
    if (!letters.includes(correctLetter)) {
      return { kind: "prose", index, text: stripLeadingLabel(block) };
    }

    const question = cleanQuestionText(block.slice(0, optionsMatch.index));
    const rawExplanation = block.slice(block.indexOf("Doğru cevap", optionsMatch.index));
    const explanation = rawExplanation
      .replace(/^Doğru cevap\s*\([A-D]\)\s*(?:'[^']*'|"[^"]*")?\s*(?:\([^)]*\))?\s*[—-]?\s*/, "")
      .replace(/\s*\n\s*/g, " ")
      .trim();

    let distractorNotes: ParsedOption[] | undefined;
    const distractorClauseMatch = rawExplanation.match(
      /diğer[^.;]*?seçenek(?:ler)?[^.;]*?((?:'[^']+'|"[^"]+")(?:[^.;]*?(?:'[^']+'|"[^"]+"))*)/i
    );
    if (distractorClauseMatch) {
      const quoted = distractorClauseMatch[1].match(/'[^']+'|"[^"]+"/g);
      const otherLetters = options.map((option) => option.letter).filter((letter) => letter !== correctLetter);
      if (quoted && quoted.length === otherLetters.length) {
        distractorNotes = otherLetters.map((letter, i) => ({
          letter,
          text: quoted[i].slice(1, -1),
        }));
      }
    }

    return {
      kind: "mcq",
      index,
      question: question || stripLeadingLabel(block.slice(0, optionsMatch.index)),
      options,
      correctLetter,
      explanation: explanation || rawExplanation,
      distractorNotes,
    };
  });
}
