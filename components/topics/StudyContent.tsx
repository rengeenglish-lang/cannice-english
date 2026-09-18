/** Present lesson prose as readable study points without changing its wording. */
const sentences = new Intl.Segmenter("tr", { granularity: "sentence" });

function HighlightedText({ text }: { text: string }) {
  // Only short quoted terms and explicit rule phrases receive emphasis.
  // Apostrophes within Turkish suffixes and English contractions stay untouched.
  const parts = text.split(/("[^"\n]{1,65}"|“[^”\n]{1,65}”|tamamen farklı bir anlam|nesne almaz|mutlaka bir nesne ister|her zaman particle'dan sonra|bir formül değildir|ortalama \d+ soru)/g);
  return parts.map((part, index) =>
    index % 2 ? (
      <strong key={index} className="font-bold underline decoration-indigo-300 decoration-2 underline-offset-4">
        {part}
      </strong>
    ) : part,
  );
}

function EmphasizedText({ text }: { text: string }) {
  // Recognize short labels at the start of a line or after example separators.
  // Leave full introductory sentences, times and URL schemes as ordinary text.
  const labels = /(^|[\n(,;]\s*)([^\n():,;.!?]{1,80}):(?=\s|$)/g;
  const nodes = [];
  let cursor = 0;
  for (const match of text.matchAll(labels)) {
    const label = match[2];
    if (label.trim().split(/\s+/).length > 8 || !/\p{L}/u.test(label)) continue;
    const start = match.index + match[1].length;
    nodes.push(<HighlightedText key={`text-${cursor}`} text={text.slice(cursor, start)} />);
    nodes.push(<strong key={`label-${start}`} className="font-extrabold text-slate-950">{label}:</strong>);
    cursor = start + label.length + 1;
  }
  nodes.push(<HighlightedText key={`text-${cursor}`} text={text.slice(cursor)} />);
  return nodes;
}

export function StudyContent({ text, glossary = false }: { text: string; glossary?: boolean }) {
  // Keep glossary entries and their examples together; sentence bullets are for explanations.
  const blocks = text.split(/\n\s*\n/).filter((block) => block.trim());
  return (
    <div className="space-y-5 text-lg font-medium leading-8 text-slate-800 sm:text-xl sm:leading-9">
      {blocks.map((block, blockIndex) => {
        if (glossary) {
          return <p key={blockIndex} className="whitespace-pre-line"><EmphasizedText text={block} /></p>;
        }
        const points = block.split("\n").flatMap((line) => {
          const clean = line.trim().replace(/^[•●]\s*/, "");
          if (!clean) return [];
          // Existing bullets are already authored units, including their examples.
          return /^[•●]/.test(line.trim()) ? [clean] : Array.from(sentences.segment(clean), ({ segment }) => segment.trim()).filter(Boolean);
        });
        return (
          <ul key={blockIndex} className="list-disc space-y-4 pl-6 marker:text-indigo-500">
            {points.map((point, index) => (
              <li key={index} className="pl-2"><EmphasizedText text={point} /></li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
