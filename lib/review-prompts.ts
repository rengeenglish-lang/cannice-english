export const REVIEW_PROMPTS = [
  { category: "Okunabilirlik", choices: [
    { label: "Metinler rahat okunuyor", text: "Metinleri rahat okuyabildim; açıklamaların genel olarak anlaşılır olduğunu düşünüyorum." },
    { label: "Bazı metinleri okumak zor", text: "Bazı metinleri okurken zorlandım; daha sade bir anlatım ve daha kısa paragraflar görmek isterim." },
  ] },
  { category: "Anlama katkısı", choices: [
    { label: "Konuyu daha iyi anladım", text: "İncelediğim açıklamalar konuyu daha iyi anlamama yardımcı oldu." },
    { label: "Daha fazla açıklamaya ihtiyacım var", text: "Konuyu tam anlayabilmek için bazı bölümlerde daha ayrıntılı açıklamalara ihtiyacım var." },
  ] },
  { category: "Metin biçimi", choices: [
    { label: "Yazı biçimi iyileştirilmeli", text: "Yazı boyutu, satır aralıkları ve metin düzeninin iyileştirilmesini isterim." },
    { label: "Başlık ve örnek düzeni geliştirilmeli", text: "Başlıkların ve örneklerin daha tutarlı bir düzende sunulmasının okumayı kolaylaştıracağını düşünüyorum." },
  ] },
  { category: "İçerik", choices: [
    { label: "Örnekler yararlı", text: "İncelediğim örnek ve açıklamaları çalışmam için yararlı buldum." },
    { label: "Daha fazla örnek ve çözüm gerekli", text: "İçerikte daha fazla örnek, açıklamalı çözüm ve uygulama görmek isterim." },
  ] },
  { category: "Netfener’in genel değeri", choices: [
    { label: "Benim için yararlı bir kaynak", text: "Netfener’de incelediğim kaynakları yararlı buldum ve çalışmamda kullanmayı düşünüyorum." },
    { label: "Karar vermeden önce daha fazla denemeliyim", text: "Netfener’in benim için değerini değerlendirebilmek için daha fazla içeriği denemeye ihtiyacım var." },
  ] },
] as const;

export function toggleReviewLine(body: string, line: string, checked: boolean) {
  const lines = body.split("\n");
  return checked ? (lines.includes(line) ? body : [body.trimEnd(), line].filter(Boolean).join("\n")) : lines.filter(value => value !== line).join("\n");
}
