export const STUDY_QUOTES = [
  "Mükemmel olmak için değil, kendine güvenmek için pratik yap.",
  "Küçük adımlar, zamanla büyük sonuçlar getirir.",
  "Her tamamladığın ders, hedefine bir adım daha yaklaştırır.",
  "Düzenli çalışma, yetenekten daha güçlüdür.",
  "Bugün öğrendiğin her kelime, sınav gününde işine yarayacak.",
  "İlerleme çizgisel değildir; devam etmek en önemlisidir.",
] as const;

export function pickStudyQuote(seed: number) {
  const index = ((seed % STUDY_QUOTES.length) + STUDY_QUOTES.length) % STUDY_QUOTES.length;
  return STUDY_QUOTES[index];
}
