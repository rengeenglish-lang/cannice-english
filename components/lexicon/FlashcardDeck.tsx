"use client";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, NotebookPen, RefreshCw, RotateCcw, Volume2, ListChecks, Lightbulb } from "lucide-react";
import { markWordAction, saveNoteAction } from "@/app/actions/lexicon";
import { POS_LABELS } from "@/lib/vocabulary/levels";

export type DeckWord = { id: string; word: string; pos: string; tr: string; exampleEn: string; exampleTr: string; tip: string | null };
type Status = "KNOWN" | "LEARNING" | null;

function highlight(sentence: string, word: string) {
  const core = word.replace(/\s*\(.*?\)\s*/g, "").trim();
  const i = core ? sentence.toLowerCase().indexOf(core.toLowerCase()) : -1;
  if (i < 0) return sentence;
  return (
    <>
      {sentence.slice(0, i)}
      <strong className="rounded bg-[color:var(--accent-soft)] px-1 font-bold text-[color:var(--accent-strong)]">{sentence.slice(i, i + core.length)}</strong>
      {sentence.slice(i + core.length)}
    </>
  );
}

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text.replace(/\s*\(.*?\)\s*/g, " "));
    u.lang = "en-GB";
    u.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {}
}

/**
 * Flashcards for one set: drag or use the arrows to slide between cards, tap to flip for the
 * meaning and usage, mark "Biliyorum" / "Tekrar çalışacağım", and keep a personal note per word.
 */
export function FlashcardDeck({ level, words, initialStates, testHref, levelHref }: { level: string; words: DeckWord[]; initialStates: Record<string, { status: Status; note: string | null }>; testHref: string; levelHref: string }) {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => Object.fromEntries(words.map((w) => [w.id, initialStates[w.id]?.status ?? null])));
  const [notes, setNotes] = useState<Record<string, string>>(() => Object.fromEntries(words.map((w) => [w.id, initialStates[w.id]?.note ?? ""])));
  const [onlyLearning, setOnlyLearning] = useState(false);
  const deck = useMemo(() => (onlyLearning ? words.filter((w) => statuses[w.id] === "LEARNING") : words), [onlyLearning, words, statuses]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [enter, setEnter] = useState<"lex-in-right" | "lex-in-left" | "">("");
  const [drag, setDrag] = useState(0);
  const [noteState, setNoteState] = useState<"idle" | "saving" | "saved">("idle");
  const [, start] = useTransition();
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const dragRef = useRef(0);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = index >= deck.length;
  const card = done ? null : deck[index];

  const go = useCallback((dir: 1 | -1) => {
    setFlipped(false);
    setDrag(0);
    setIndex((i) => Math.max(0, Math.min(deck.length, i + dir)));
    setEnter(dir === 1 ? "lex-in-right" : "lex-in-left");
  }, [deck.length]);

  const mark = (status: Status) => {
    if (!card) return;
    const next = statuses[card.id] === status ? null : status;
    setStatuses((s) => ({ ...s, [card.id]: next }));
    start(async () => { await markWordAction(card.id, next); });
    if (next) setTimeout(() => go(1), 250);
  };

  const onNote = (value: string) => {
    if (!card) return;
    const id = card.id;
    setNotes((n) => ({ ...n, [id]: value }));
    setNoteState("saving");
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      start(async () => {
        await saveNoteAction(id, value);
        setNoteState("saved");
      });
    }, 700);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const known = words.filter((w) => statuses[w.id] === "KNOWN").length;
  const learning = words.filter((w) => statuses[w.id] === "LEARNING").length;

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* progress */}
      <div className="flex items-center justify-between text-sm font-semibold text-[color:var(--muted)]">
        <span>{done ? deck.length : index + 1} / {deck.length}{onlyLearning ? " · tekrar listesi" : ""}</span>
        <span className="flex gap-3"><span className="text-emerald-700">✓ {known}</span><span className="text-amber-800">↺ {learning}</span></span>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {deck.map((w, i) => (
          <span key={w.id} className={`h-1.5 flex-1 rounded-full transition ${i === index ? "bg-[color:var(--accent)]" : statuses[w.id] === "KNOWN" ? "bg-emerald-500" : statuses[w.id] === "LEARNING" ? "bg-amber-400" : "bg-[color:var(--border)]"}`} />
        ))}
      </div>

      {card ? (
        <>
          {/* card stack */}
          <div className="relative mt-6 h-[380px] select-none sm:h-[400px]">
            <div className="absolute inset-x-6 top-4 bottom-[-12px] rotate-[-3deg] rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] opacity-60" aria-hidden="true" />
            <div className="absolute inset-x-3 top-2 bottom-[-6px] rotate-[2deg] rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] opacity-80" aria-hidden="true" />
            <div
              key={`${card.id}-${index}`}
              className={`lex-scene absolute inset-0 touch-pan-y ${enter}`}
              style={{ transform: drag ? `translateX(${drag}px) rotate(${drag / 18}deg)` : undefined, transition: drag ? "none" : "transform .25s" }}
              onPointerDown={(e) => { startX.current = e.clientX; dragRef.current = 0; moved.current = false; e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => {
                if (startX.current === null) return;
                const dx = e.clientX - startX.current;
                if (Math.abs(dx) > 6) moved.current = true;
                dragRef.current = dx;
                setDrag(dx);
              }}
              onPointerUp={() => {
                const dx = dragRef.current;
                startX.current = null;
                dragRef.current = 0;
                if (dx < -80) go(1); else if (dx > 80) go(-1); else { setDrag(0); if (!moved.current) setFlipped((f) => !f); }
              }}
              onPointerCancel={() => { startX.current = null; dragRef.current = 0; setDrag(0); }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={flipped ? `${card.word}: ${card.tr}. Kartı çevir` : `${card.word}. Anlamını görmek için çevir`}
                className={`lex-card h-full cursor-pointer ${flipped ? "is-flipped" : ""}`}
              >
                {/* front */}
                <div className="lex-face flex flex-col items-center justify-center border-2 border-[color:var(--accent)] bg-[color:var(--surface)] p-6 text-center shadow-[0_18px_40px_rgba(12,46,30,.12)]">
                  <span className="absolute left-5 top-5 rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-bold text-[color:var(--accent-strong)]">{level}</span>
                  <span className="absolute right-5 top-5 text-xs font-semibold text-[color:var(--muted)]">{POS_LABELS[card.pos] ?? card.pos}</span>
                  <p lang="en" className="text-4xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-5xl">{card.word}</p>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); speak(card.word); }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--muted)] hover:border-[color:var(--accent)]"
                    aria-label={`${card.word} kelimesini dinle`}
                  >
                    <Volume2 size={16} aria-hidden="true" /> Dinle
                  </button>
                  <p className="absolute bottom-5 text-xs text-[color:var(--muted)]">Çevirmek için dokun · kaydırarak geç</p>
                </div>
                {/* back */}
                <div className="lex-face lex-back flex flex-col overflow-y-auto bg-[color:var(--night)] p-6 text-white shadow-[0_18px_40px_rgba(12,46,30,.25)]">
                  <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold)]">{POS_LABELS[card.pos] ?? card.pos}</p>
                  <p className="mt-2 text-3xl font-bold leading-tight">{card.tr}</p>
                  <div className="mt-5 rounded-2xl bg-white/[.06] p-4">
                    <p lang="en" className="text-lg leading-7 [&_strong]:bg-[color:var(--gold)]/20 [&_strong]:text-[color:var(--gold)]">{highlight(card.exampleEn, card.word)}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{card.exampleTr}</p>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); speak(card.exampleEn); }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--gold)]"
                    >
                      <Volume2 size={14} aria-hidden="true" /> Cümleyi dinle
                    </button>
                  </div>
                  {card.tip ? (
                    <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-white/85"><Lightbulb size={16} className="mt-1 shrink-0 text-[color:var(--gold)]" aria-hidden="true" /> {card.tip}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* controls */}
          <div className="mt-8 flex items-center justify-between gap-2">
            <button type="button" className="ghost-button" onClick={() => go(-1)} disabled={index === 0} aria-label="Önceki kart"><ArrowLeft size={18} aria-hidden="true" /></button>
            <button type="button" className="secondary-button !min-h-11 flex-1" onClick={() => setFlipped((f) => !f)}><RefreshCw size={16} aria-hidden="true" /> Çevir</button>
            <button type="button" className="ghost-button" onClick={() => go(1)} aria-label="Sonraki kart"><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => mark("LEARNING")} aria-pressed={statuses[card.id] === "LEARNING"} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition ${statuses[card.id] === "LEARNING" ? "border-amber-400 bg-amber-50 text-amber-900" : "border-[color:var(--border)] text-[color:var(--muted)] hover:border-amber-400"}`}>
              <RotateCcw size={16} aria-hidden="true" /> Tekrar çalışacağım
            </button>
            <button type="button" onClick={() => mark("KNOWN")} aria-pressed={statuses[card.id] === "KNOWN"} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition ${statuses[card.id] === "KNOWN" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-[color:var(--border)] text-[color:var(--muted)] hover:border-emerald-500"}`}>
              <Check size={16} aria-hidden="true" /> Biliyorum
            </button>
          </div>

          {/* note */}
          <label className="mt-6 block rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <span className="flex items-center justify-between text-sm font-bold">
              <span className="inline-flex items-center gap-2"><NotebookPen size={16} className="text-[color:var(--accent-strong)]" aria-hidden="true" /> Notum: <span lang="en" className="text-[color:var(--accent-strong)]">{card.word}</span></span>
              <span className="text-xs font-medium text-[color:var(--muted)]" role="status">{noteState === "saving" ? "Kaydediliyor…" : noteState === "saved" ? "Kaydedildi" : ""}</span>
            </span>
            <textarea
              value={notes[card.id] ?? ""}
              onChange={(e) => onNote(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Kendi cümleni, çağrışımını ya da ipucunu yaz…"
              className="mt-2 w-full resize-y rounded-xl border border-[color:var(--border)] bg-transparent p-3 text-sm outline-none focus:border-[color:var(--accent)]"
            />
          </label>
          <p className="mt-3 text-center text-xs text-[color:var(--muted)]">Klavye: ← → geç · boşluk çevir</p>
        </>
      ) : (
        /* end of deck */
        <div className="lex-pop mt-6 rounded-[1.75rem] bg-[color:var(--night)] p-8 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--gold)]">Set tamamlandı</p>
          <p className="mt-3 text-3xl font-bold">Harika! {deck.length} kartın hepsine baktın.</p>
          <p className="mt-2 text-white/75">{known} kelimeyi biliyorum dedin, {learning} kelimeyi tekrar listene aldın.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={testHref} className="primary-button"><ListChecks size={18} aria-hidden="true" /> Teste başla</Link>
            {learning ? (
              <button type="button" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-bold hover:bg-white/10" onClick={() => { setOnlyLearning(true); setIndex(0); setEnter("lex-in-right"); }}>
                Tekrar listesini çalış ({learning})
              </button>
            ) : null}
            <button type="button" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-bold hover:bg-white/10" onClick={() => { setOnlyLearning(false); setIndex(0); setEnter("lex-in-right"); }}>
              Baştan başla
            </button>
          </div>
          <Link href={levelHref} className="mt-5 inline-block text-sm font-semibold text-white/70 underline">Setlere dön</Link>
        </div>
      )}
    </div>
  );
}
