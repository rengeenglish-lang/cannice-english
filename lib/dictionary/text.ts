/**
 * Text helpers for Netfener Sözlük: Turkish-aware normalising, splitting Turkish meanings into
 * searchable terms, English word forms back to their dictionary form, and edit distance for
 * "Bunu mu demek istediniz?".
 */

/** Lower-case and trim, folding Turkish dotted/dotless i the Turkish way. */
export function normalise(s: string) {
  return s.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR").replace(/[’'`]/g, "'");
}

/** Accent-free form so "kosmak" finds "koşmak" and "ogrenci" finds "öğrenci". */
export function fold(s: string) {
  return normalise(s)
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[âà]/g, "a")
    .replace(/[îì]/g, "i")
    .replace(/[ûù]/g, "u");
}

/** "carry out sth" → "carry out": object placeholders aren't part of the headword people type. */
export function headwordKey(en: string) {
  return normalise(en.replace(/\b(sth|sb|smth|someone|something|one's|oneself)\b/gi, "").replace(/\s+/g, " "));
}

/**
 * "(sorumluluk, iş) üstlenmek; (personel) işe almak" → ["üstlenmek", "işe almak"]. Notes in
 * parentheses explain usage and are dropped; meanings are split on commas and semicolons.
 */
export function turkishTerms(tr: string) {
  return tr
    .replace(/\([^)]*\)/g, " ")
    .split(/[;,/]/)
    .map((t) => normalise(t.replace(/[.…]+$/g, "")))
    .filter((t) => t.length >= 2);
}

const IRREGULAR: Record<string, string> = {
  am: "be", is: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
  has: "have", had: "have", having: "have", does: "do", did: "do", done: "do",
  went: "go", gone: "go", goes: "go", made: "make", took: "take", taken: "take", came: "come",
  saw: "see", seen: "see", knew: "know", known: "know", got: "get", gotten: "get", gave: "give",
  given: "give", found: "find", thought: "think", told: "tell", became: "become", left: "leave",
  felt: "feel", brought: "bring", began: "begin", begun: "begin", kept: "keep", held: "hold",
  wrote: "write", written: "write", stood: "stand", heard: "hear", let: "let", meant: "mean",
  met: "meet", ran: "run", paid: "pay", sat: "sit", spoke: "speak", spoken: "speak", lay: "lie",
  led: "lead", read: "read", grew: "grow", grown: "grow", lost: "lose", fell: "fall", fallen: "fall",
  sent: "send", built: "build", understood: "understand", drew: "draw", drawn: "draw", broke: "break",
  broken: "break", spent: "spend", cut: "cut", rose: "rise", risen: "rise", drove: "drive",
  driven: "drive", bought: "buy", wore: "wear", worn: "wear", chose: "choose", chosen: "choose",
  sought: "seek", threw: "throw", thrown: "throw", caught: "catch", dealt: "deal", won: "win",
  forgot: "forget", forgotten: "forget", sold: "sell", taught: "teach", fought: "fight", ate: "eat",
  eaten: "eat", drank: "drink", drunk: "drink", slept: "sleep", flew: "fly", flown: "fly",
  hid: "hide", hidden: "hide", shook: "shake", shaken: "shake", struck: "strike", swam: "swim",
  sang: "sing", sung: "sing", rode: "ride", ridden: "ride", bore: "bear", borne: "bear",
  arose: "arise", arisen: "arise", undertook: "undertake", undertaken: "undertake", withdrew: "withdraw",
  withdrawn: "withdraw", overcame: "overcome", forbade: "forbid", forbidden: "forbid", froze: "freeze",
  frozen: "freeze", stole: "steal", stolen: "steal", woke: "wake", woken: "wake", lent: "lend",
  bent: "bend", fed: "feed", fled: "flee", bound: "bind", wound: "wind", sank: "sink", sunk: "sink",
  shrank: "shrink", shrunk: "shrink", spun: "spin", stuck: "stick", stung: "sting", swore: "swear",
  sworn: "swear", tore: "tear", torn: "tear", wept: "weep", children: "child", people: "person",
  men: "man", women: "woman", feet: "foot", teeth: "tooth", mice: "mouse", geese: "goose",
  analyses: "analysis", hypotheses: "hypothesis", criteria: "criterion", phenomena: "phenomenon",
  data: "datum", theses: "thesis", crises: "crisis", better: "good", best: "good", worse: "bad",
  worst: "bad", further: "far", farther: "far",
};

/**
 * Possible dictionary forms of an English word form, most likely first ("studies" → study,
 * "running" → run, "taken" → take). Only forms that exist in the dictionary are used by the caller.
 */
export function lemmaCandidates(word: string): string[] {
  const w = normalise(word);
  const out: string[] = [];
  const add = (x: string) => {
    if (x && x !== w && !out.includes(x)) out.push(x);
  };
  if (IRREGULAR[w]) add(IRREGULAR[w]);
  if (/\s/.test(w)) {
    // Phrasal verbs: inflect the verb only ("took off" → "take off").
    const [first, ...rest] = w.split(" ");
    for (const l of lemmaCandidates(first)) add([l, ...rest].join(" "));
    return out;
  }
  const doubled = (stem: string) => (/([bcdfghjklmnpqrstvwz])\1$/.test(stem) ? stem.slice(0, -1) : null);
  if (w.endsWith("ies") && w.length > 4) add(`${w.slice(0, -3)}y`);
  if (w.endsWith("ied") && w.length > 4) add(`${w.slice(0, -3)}y`);
  if (w.endsWith("es") && w.length > 3) add(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) add(w.slice(0, -1));
  if (w.endsWith("ing") && w.length > 5) {
    const stem = w.slice(0, -3);
    add(stem);
    add(`${stem}e`);
    const d = doubled(stem);
    if (d) add(d);
    if (stem.endsWith("y")) add(`${stem.slice(0, -1)}ie`);
  }
  if (w.endsWith("ed") && w.length > 4) {
    const stem = w.slice(0, -2);
    add(stem);
    add(`${stem}e`);
    add(w.slice(0, -1));
    const d = doubled(stem);
    if (d) add(d);
  }
  if (w.endsWith("er") && w.length > 4) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    if (w.endsWith("ier")) add(`${w.slice(0, -3)}y`);
    const d = doubled(w.slice(0, -2));
    if (d) add(d);
  }
  if (w.endsWith("est") && w.length > 5) {
    add(w.slice(0, -3));
    add(w.slice(0, -2));
    if (w.endsWith("iest")) add(`${w.slice(0, -4)}y`);
    const d = doubled(w.slice(0, -3));
    if (d) add(d);
  }
  if (w.endsWith("ly") && w.length > 4) {
    add(w.slice(0, -2));
    if (w.endsWith("ily")) add(`${w.slice(0, -3)}y`);
  }
  return out;
}

/**
 * Edit distance counting a swap of two neighbouring letters as one edit ("recieve" → receive),
 * giving up (returning max + 1) once it can't be within `max`.
 */
export function editDistance(a: string, b: string, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

/** URL slug for a search term: kept readable ("take-off", "öğrenci"), reversible enough to search. */
export function termSlug(term: string) {
  return normalise(term).replace(/[^\p{L}\p{N}' -]+/gu, "").trim().replace(/\s+/g, "-");
}

export function slugToQuery(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, " ").trim();
}
