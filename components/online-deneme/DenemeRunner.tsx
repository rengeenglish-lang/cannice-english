"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flag, Lock, Timer } from "lucide-react";
import {
  finishOnlineDenemeAction,
  lockOnlineDenemeAction,
  saveOnlineDenemeAnswerAction,
  setOnlineDenemeModeAction,
} from "@/app/actions/online-deneme";
import { OPTION_LETTERS, type Paper, type PaperQuestion, type SavedAnswer } from "@/lib/online-denemeler/types";

type Mode = "KLASIK" | "OPTIK";
type Answers = Record<number, SavedAnswer>;

const ROMAN = ["I", "II", "III", "IV", "V"];
const BLOCKS = [1, 21, 41, 61];

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/** "----" gaps in a stem, drawn as a visible blank. */
function WithBlanks({ text }: { text: string }) {
  const parts = text.split(/(-{4})/);
  return (
    <>
      {parts.map((p, i) =>
        p === "----" ? (
          <span key={i} className="mx-0.5 inline-block min-w-12 border-b-2 border-[color:var(--foreground)] align-baseline" aria-label="boşluk">
            &nbsp;
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** A cloze passage with its numbered gaps; the gap of the active question is highlighted. */
function ClozeText({ text, active }: { text: string; active?: number }) {
  const parts = text.split(/\((\d+)\) ----/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className={`mx-0.5 inline-flex items-baseline gap-1 rounded px-1 font-bold ${Number(p) === active ? "bg-[color:var(--accent)] text-[color:var(--on-accent)]" : "bg-[color:var(--brand-soft)]"}`}
          >
            ({p}) <span className="inline-block min-w-8 border-b-2 border-current">&nbsp;</span>
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function DenemeRunner({
  attemptId,
  paper,
  initialAnswers,
  initialMode,
  deadlineAt,
  serverNow,
  resultHref,
}: {
  attemptId: string;
  paper: Paper;
  initialAnswers: Answers;
  initialMode: Mode;
  deadlineAt: string;
  serverNow: string;
  resultHref: string;
}) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  // Kept in step by every setter below, so the save queue always sends the latest value.
  const answersRef = useRef(initialAnswers);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [current, setCurrent] = useState(() => {
    const firstBlank = paper.questions.find((q) => initialAnswers[q.n]?.choice == null);
    return firstBlank?.n ?? 1;
  });
  const [locked, setLocked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");

  // ---- clock: the server's deadline, corrected for this device's clock ----
  const deadline = new Date(deadlineAt).getTime();
  // Server time minus this device's time, so a wrong device clock cannot add or remove minutes.
  const [clockOffset, setClockOffset] = useState(() => new Date(serverNow).getTime() - Date.now());
  const [remaining, setRemaining] = useState(() => deadline - new Date(serverNow).getTime());
  const lockingRef = useRef(false);

  const lock = useCallback(() => setLocked(true), []);

  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => {
      const left = deadline - (Date.now() + clockOffset);
      setRemaining(left);
      if (left <= 0 && !lockingRef.current) {
        lockingRef.current = true;
        lockOnlineDenemeAction(attemptId)
          .then((r) => {
            if (r.locked) lock();
            else {
              // This device's clock ran fast: trust the server and keep going.
              setClockOffset(deadline - r.msLeft - Date.now());
              lockingRef.current = false;
            }
          })
          .catch(() => {
            lockingRef.current = false;
          });
      }
    }, 250);
    return () => clearInterval(id);
  }, [attemptId, clockOffset, deadline, lock, locked]);

  // ---- saving: one request at a time, always sending the latest value for that question ----
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingRef = useRef(0);
  const persist = useCallback(
    (n: number) => {
      pendingRef.current++;
      setSaveState("saving");
      queueRef.current = queueRef.current.then(async () => {
        const value = answersRef.current[n] ?? { choice: null, flagged: false };
        let done = false;
        for (let tryNo = 0; tryNo < 3 && !done; tryNo++) {
          try {
            const r = await saveOnlineDenemeAnswerAction(attemptId, n, value);
            done = true;
            if (!r.ok && r.locked) lock();
            if (!r.ok && !r.locked) setSaveState("error");
          } catch {
            await new Promise((res) => setTimeout(res, 800 * (tryNo + 1)));
          }
        }
        pendingRef.current--;
        if (!done) setSaveState("error");
        else if (pendingRef.current === 0) setSaveState((s) => (s === "error" ? s : "saved"));
      });
    },
    [attemptId, lock],
  );

  const choose = useCallback(
    (n: number, choice: number) => {
      if (locked) return;
      setAnswers((prev) => {
        const old = prev[n] ?? { choice: null, flagged: false };
        const next = { ...prev, [n]: { ...old, choice: old.choice === choice ? null : choice } };
        answersRef.current = next;
        return next;
      });
      persist(n);
    },
    [locked, persist],
  );

  const toggleFlag = useCallback(
    (n: number) => {
      if (locked) return;
      setAnswers((prev) => {
        const old = prev[n] ?? { choice: null, flagged: false };
        const next = { ...prev, [n]: { ...old, flagged: !old.flagged } };
        answersRef.current = next;
        return next;
      });
      persist(n);
    },
    [locked, persist],
  );

  const switchMode = (next: Mode) => {
    setMode(next);
    void setOnlineDenemeModeAction(attemptId, next).catch(() => undefined);
  };

  const answered = paper.questions.filter((q) => answers[q.n]?.choice != null).length;
  const flagged = paper.questions.filter((q) => answers[q.n]?.flagged).length;
  const urgent = remaining < 5 * 60_000;
  const warning = remaining < 15 * 60_000;

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="sticky top-[76px] z-30 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="min-w-0">
          <p className="text-base font-extrabold text-[color:var(--foreground)]">YDS Denemesi {paper.no}</p>
          <p className="text-xs font-semibold text-[color:var(--muted)]">
            {answered}/80 cevaplandı{flagged ? ` · ${flagged} işaretli` : ""} ·{" "}
            <span aria-live="polite">{saveState === "saving" ? "Kaydediliyor…" : saveState === "error" ? "Kaydedilemedi, bağlantını kontrol et" : "Kaydedildi"}</span>
          </p>
        </div>
        <div
          role="timer"
          aria-label="Kalan süre"
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xl font-black tabular-nums ${
            urgent ? "bg-[color:var(--danger-soft)] text-[color:var(--danger)]" : warning ? "bg-[color:var(--gold-soft)] text-[color:var(--foreground)]" : "bg-[color:var(--brand-soft)] text-[color:var(--foreground)]"
          }`}
        >
          {locked ? <Lock size={18} aria-hidden="true" /> : <Timer size={18} aria-hidden="true" />}
          {formatClock(locked ? 0 : remaining)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="secondary-button text-xs"
            onClick={() => switchMode(mode === "KLASIK" ? "OPTIK" : "KLASIK")}
            disabled={locked}
          >
            {mode === "KLASIK" ? "ÖSYM cevap kâğıdına geç" : "Klasik görünüme geç"}
          </button>
          <button type="button" className="primary-button text-xs" onClick={() => setConfirming(true)} disabled={locked}>
            Testi bitir
          </button>
        </div>
      </header>

      {mode === "KLASIK" ? (
        <KlasikView paper={paper} answers={answers} current={current} setCurrent={setCurrent} choose={choose} toggleFlag={toggleFlag} locked={locked} />
      ) : (
        <OptikView paper={paper} answers={answers} current={current} setCurrent={setCurrent} choose={choose} locked={locked} />
      )}

      {confirming && !locked ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="finish-title" className="w-full max-w-md rounded-3xl bg-[color:var(--surface)] p-7 shadow-xl">
            <h2 id="finish-title" className="text-xl font-extrabold text-[color:var(--foreground)]">Testi bitirmek istiyor musun?</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {80 - answered > 0 ? `${80 - answered} soru boş. ` : "Tüm soruları cevapladın. "}
              {flagged ? `${flagged} soruyu sonra bakmak için işaretledin. ` : ""}
              Bitirdiğin anda puanın hesaplanır ve cevapların değiştirilemez. Kalan süre: {formatClock(remaining)}.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="ghost-button" onClick={() => setConfirming(false)}>
                Devam et
              </button>
              <form
                action={async () => {
                  await queueRef.current;
                  await finishOnlineDenemeAction(attemptId);
                }}
              >
                <button type="submit" className="primary-button">Bitir ve puanımı gör</button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {locked ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="lock-title" className="w-full max-w-lg rounded-3xl bg-[color:var(--surface)] p-8 text-center shadow-xl">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-[color:var(--danger-soft)] text-[color:var(--danger)]">
              <Lock size={30} aria-hidden="true" />
            </span>
            <h2 id="lock-title" className="mt-4 text-2xl font-extrabold text-[color:var(--foreground)]">Süre doldu, deneme kilitlendi</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              180 dakika sona erdi. O ana kadar işaretlediğin <strong className="text-[color:var(--foreground)]">{answered} cevap</strong> kaydedildi ve puanlandı. Bu deneme artık
              değiştirilemez; boş bıraktığın {80 - answered} soru puana katkı vermez.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[color:var(--brand-soft)] p-3">
                <p className="text-2xl font-black text-[color:var(--foreground)]">{answered}</p>
                <p className="text-xs text-[color:var(--muted)]">işaretli</p>
              </div>
              <div className="rounded-2xl bg-[color:var(--brand-soft)] p-3">
                <p className="text-2xl font-black text-[color:var(--foreground)]">{80 - answered}</p>
                <p className="text-xs text-[color:var(--muted)]">boş</p>
              </div>
            </div>
            <Link href={resultHref} className="primary-button mt-6 inline-flex w-full justify-center">
              Puanımı ve çözümleri gör
            </Link>
            <p className="mt-3 text-xs text-[color:var(--muted)]">Sayfayı yenilesen ya da başka bir cihazdan girsen de bu deneme kilitli kalır: süre sunucuda tutulur.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

type ViewProps = {
  paper: Paper;
  answers: Answers;
  current: number;
  setCurrent: (n: number) => void;
  choose: (n: number, choice: number) => void;
  locked: boolean;
};

function sectionFor(paper: Paper, n: number) {
  return paper.sections.find((s) => n >= s.from && n <= s.to) ?? paper.sections[0];
}

function OptionList({ q, answer, onChoose, locked, compact }: { q: PaperQuestion; answer?: SavedAnswer; onChoose: (i: number) => void; locked: boolean; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label={`Soru ${q.n} seçenekleri`} className={compact ? "mt-1.5 space-y-0.5" : "mt-5 space-y-2.5"}>
      {q.options.map((opt, i) => {
        const on = answer?.choice === i;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={locked}
            onClick={() => onChoose(i)}
            className={`flex w-full items-start gap-3 rounded-xl border text-left transition ${compact ? "px-2 py-1 text-[0.92rem]" : "px-4 py-3 text-base"} ${
              on ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] font-semibold" : "border-transparent hover:border-[color:var(--border-strong)] hover:bg-[color:var(--brand-soft)]"
            } text-[color:var(--foreground)] disabled:cursor-not-allowed`}
          >
            <span
              className={`grid shrink-0 place-items-center rounded-full border-2 text-xs font-black ${compact ? "size-5 text-[0.65rem]" : "size-7"} ${
                on ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--on-accent)]" : "border-[color:var(--border-strong)]"
              }`}
            >
              {OPTION_LETTERS[i]}
            </span>
            <span className="min-w-0 pt-0.5 leading-6">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function Sentences({ q }: { q: PaperQuestion }) {
  return (
    <p className="leading-7">
      {q.sentences?.map((s, i) => (
        <span key={i}>
          <strong>({ROMAN[i]})</strong> {s}{" "}
        </span>
      ))}
    </p>
  );
}

function QuestionMap({ paper, answers, current, setCurrent }: Pick<ViewProps, "paper" | "answers" | "current" | "setCurrent">) {
  return (
    <>
      <p className="mb-3 hidden text-xs font-bold text-[color:var(--muted)] lg:block">Soru haritası</p>
      <div className="grid grid-cols-8 gap-1.5 lg:grid-cols-5">
        {paper.questions.map((x) => {
          const st = answers[x.n];
          const done = st?.choice != null;
          return (
            <button
              key={x.n}
              type="button"
              onClick={() => setCurrent(x.n)}
              aria-label={`Soru ${x.n}${done ? ", cevaplandı" : ", boş"}${st?.flagged ? ", işaretli" : ""}`}
              aria-current={x.n === current ? "step" : undefined}
              className={`relative h-8 rounded-md text-xs font-bold ${
                done ? "bg-[color:var(--accent)] text-[color:var(--on-accent)]" : "bg-[color:var(--brand-soft)] text-[color:var(--foreground)]"
              } ${x.n === current ? "ring-2 ring-[color:var(--foreground)] ring-offset-1" : ""}`}
            >
              {x.n}
              {st?.flagged ? <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[color:var(--gold)]" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5 text-xs text-[color:var(--muted)]">
        <p className="flex items-center gap-2"><span className="size-3 rounded bg-[color:var(--accent)]" /> Cevaplandı</p>
        <p className="flex items-center gap-2"><span className="size-3 rounded bg-[color:var(--brand-soft)]" /> Boş</p>
        <p className="flex items-center gap-2"><span className="size-3 rounded-full bg-[color:var(--gold)]" /> Sonra bakacağım</p>
      </div>
      <p className="mt-4 hidden text-xs leading-5 text-[color:var(--muted)] lg:block">Klavye: A–E ile işaretle, ← → ile geç.</p>
    </>
  );
}

function KlasikView({ paper, answers, current, setCurrent, choose, toggleFlag, locked }: ViewProps & { toggleFlag: (n: number) => void }) {
  const q = paper.questions[current - 1];
  const section = sectionFor(paper, current);
  const passage = q.passage !== undefined ? paper.passages[q.passage] : null;
  const a = answers[q.n];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") setCurrent(Math.min(80, current + 1));
      else if (e.key === "ArrowLeft") setCurrent(Math.max(1, current - 1));
      else {
        const i = OPTION_LETTERS.indexOf(e.key.toUpperCase() as (typeof OPTION_LETTERS)[number]);
        if (i >= 0 && !e.metaKey && !e.ctrlKey && !e.altKey) choose(current, i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, setCurrent, choose]);

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <details className="dashboard-panel lg:hidden">
        <summary className="cursor-pointer text-sm font-bold text-[color:var(--foreground)]">
          Soru haritası · {paper.questions.filter((x) => answers[x.n]?.choice != null).length}/80
        </summary>
        <div className="mt-3">
          <QuestionMap paper={paper} answers={answers} current={current} setCurrent={setCurrent} />
        </div>
      </details>
      <nav aria-label="Soru haritası" className="dashboard-panel hidden h-fit lg:sticky lg:top-[180px] lg:block">
        <QuestionMap paper={paper} answers={answers} current={current} setCurrent={setCurrent} />
      </nav>

      <section className="dashboard-panel min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--accent-strong)]">{section.title}</p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{section.instruction}</p>

        <div className={`mt-5 grid gap-6 ${passage ? "xl:grid-cols-2" : ""}`}>
          {passage ? (
            <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--canvas)] p-5 font-serif text-[1.02rem] leading-8 text-[color:var(--foreground)]">
              <p className="mb-2 font-sans text-xs font-bold text-[color:var(--muted)]">
                {passage.kind === "cloze" ? "Cloze" : "Okuma parçası"} · Soru {passage.from}–{passage.to}
              </p>
              {passage.kind === "cloze" ? <ClozeText text={passage.text} active={q.n} /> : <p className="whitespace-pre-line">{passage.text}</p>}
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-black text-[color:var(--muted)]">Soru {q.n} / 80</p>
              <button
                type="button"
                onClick={() => toggleFlag(q.n)}
                disabled={locked}
                aria-pressed={Boolean(a?.flagged)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${a?.flagged ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]" : "border-[color:var(--border)]"} text-[color:var(--foreground)]`}
              >
                <Flag size={13} aria-hidden="true" /> {a?.flagged ? "İşaretli" : "Sonra bak"}
              </button>
            </div>
            <div className="mt-3 whitespace-pre-line font-serif text-lg leading-8 text-[color:var(--foreground)]">
              {q.sentences ? <Sentences q={q} /> : q.section === "cloze" ? <p>({q.n}) numaralı boşluğa uygun düşen ifadeyi bulunuz.</p> : <WithBlanks text={q.stem} />}
            </div>
            <OptionList q={q} answer={a} onChoose={(i) => choose(q.n, i)} locked={locked} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-4">
          <button type="button" className="ghost-button" onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current === 1}>
            <ChevronLeft size={16} aria-hidden="true" /> Önceki
          </button>
          <button type="button" className="secondary-button" onClick={() => setCurrent(Math.min(80, current + 1))} disabled={current === 80}>
            Sonraki <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}

function OptikView({ paper, answers, current, setCurrent, choose, locked }: ViewProps) {
  const pageOf = (n: number) => Math.max(0, paper.pages.findIndex((p) => n >= p.from && n <= p.to));
  const [page, setPage] = useState(() => pageOf(current));
  const [blockOverride, setBlockOverride] = useState<number | null>(null);
  const range = paper.pages[page];
  const visible = paper.questions.filter((q) => q.n >= range.from && q.n <= range.to);
  const autoBlock = BLOCKS.filter((b) => b <= range.from).pop() ?? 1;
  const block = blockOverride ?? autoBlock;
  const bookletRef = useRef<HTMLDivElement>(null);

  const goPage = (p: number) => {
    const next = Math.min(paper.pages.length - 1, Math.max(0, p));
    setPage(next);
    setBlockOverride(null);
    setCurrent(paper.pages[next].from);
    bookletRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  // The booklet, in order: section instructions where a section starts, passages before their questions.
  const items: React.ReactNode[] = [];
  const shownPassages = new Set<number>();
  for (const q of visible) {
    const s = sectionFor(paper, q.n);
    if (s.from === q.n) {
      items.push(
        <p key={`s${s.key}`} className="mb-3 break-inside-avoid border-y border-[color:var(--foreground)] py-1.5 text-[0.82rem] font-bold leading-5 text-[color:var(--foreground)]">
          {s.instruction}
        </p>,
      );
    }
    if (q.passage !== undefined && !shownPassages.has(q.passage)) {
      shownPassages.add(q.passage);
      const p = paper.passages[q.passage];
      items.push(
        <div key={`p${q.passage}`} className="mb-4 break-inside-avoid text-justify font-serif text-[0.98rem] leading-7">
          {p.kind === "cloze" ? <ClozeText text={p.text} /> : <p className="whitespace-pre-line">{p.text}</p>}
        </div>,
      );
    }
    items.push(
      <div key={q.n} id={`bq-${q.n}`} className="mb-5 break-inside-avoid">
        <div className="flex gap-2 font-serif text-[0.98rem] leading-7">
          <strong className="shrink-0">{q.n}.</strong>
          <div className="min-w-0 whitespace-pre-line">
            {q.sentences ? <Sentences q={q} /> : q.section === "cloze" ? null : <WithBlanks text={q.stem} />}
          </div>
        </div>
        <OptionList q={q} answer={answers[q.n]} onChoose={(i) => choose(q.n, i)} locked={locked} compact />
      </div>,
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section ref={bookletRef} aria-label="Soru kitapçığı" className="min-w-0 scroll-mt-[180px]">
        <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-raised,var(--surface))] p-5 text-[color:var(--foreground)] shadow-sm sm:p-8">
          <div className="mb-4 flex items-center justify-between border-b-2 border-[color:var(--foreground)] pb-2 text-xs font-bold">
            <span>YDS · DENEME {paper.no}</span>
            <span>
              Sayfa {page + 1} / {paper.pages.length} · Soru {range.from}–{range.to}
            </span>
          </div>
          <div className="gap-8 md:columns-2 md:[column-rule:1px_solid_var(--border)]">{items}</div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="ghost-button" onClick={() => goPage(page - 1)} disabled={page === 0}>
            <ChevronLeft size={16} aria-hidden="true" /> Önceki sayfa
          </button>
          <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
            Sayfaya git
            <select className="auth-input w-auto py-1.5" value={page} onChange={(e) => goPage(Number(e.target.value))}>
              {paper.pages.map((p, i) => (
                <option key={i} value={i}>
                  {i + 1}. sayfa ({p.from}–{p.to})
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="secondary-button" onClick={() => goPage(page + 1)} disabled={page === paper.pages.length - 1}>
            Sonraki sayfa <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      <aside aria-label="Optik cevap kâğıdı" className="h-fit lg:sticky lg:top-[180px]">
        <div className="rounded-xl border-2 border-[color:var(--foreground)] bg-[color:var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black tracking-wide text-[color:var(--foreground)]">CEVAP KÂĞIDI</p>
            <p className="text-xs font-semibold text-[color:var(--muted)]">Görünen sorular vurgulu</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {BLOCKS.map((b) => {
              const filled = paper.questions.filter((q) => q.n >= b && q.n < b + 20 && answers[q.n]?.choice != null).length;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBlockOverride(b)}
                  aria-pressed={block === b}
                  className={`rounded-lg px-1 py-1.5 text-center text-xs font-bold ${block === b ? "bg-[color:var(--foreground)] text-[color:var(--surface)]" : "bg-[color:var(--brand-soft)] text-[color:var(--foreground)]"}`}
                >
                  {b}–{b + 19}
                  <span className="block text-[0.68rem] font-semibold opacity-80">{filled}/20</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 pl-9 text-[0.7rem] font-black text-[color:var(--muted)]">
            {OPTION_LETTERS.map((l) => (
              <span key={l} className="w-7 text-center">{l}</span>
            ))}
          </div>
          <ol className="mt-1 space-y-0.5">
            {Array.from({ length: 20 }, (_, i) => block + i).map((n) => {
              const onPage = n >= range.from && n <= range.to;
              const a = answers[n];
              return (
                <li key={n} className={`flex items-center gap-2 rounded-md px-1 py-0.5 ${onPage ? "bg-[color:var(--accent-soft)]" : ""}`}>
                  <button
                    type="button"
                    onClick={() => {
                      const p = pageOf(n);
                      if (p !== page) goPage(p);
                      document.getElementById(`bq-${n}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
                    }}
                    className="w-7 text-right text-xs font-bold tabular-nums text-[color:var(--foreground)] underline-offset-2 hover:underline"
                    aria-label={`Soru ${n}'e git`}
                  >
                    {n}
                  </button>
                  {OPTION_LETTERS.map((l, i) => {
                    const on = a?.choice === i;
                    return (
                      <button
                        key={l}
                        type="button"
                        disabled={locked}
                        onClick={() => choose(n, i)}
                        aria-label={`Soru ${n}, ${l} şıkkı`}
                        aria-pressed={on}
                        className={`grid size-7 place-items-center rounded-full border text-[0.66rem] font-bold ${
                          on ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--surface)]" : "border-[color:var(--border-strong)] text-[color:var(--muted)] hover:border-[color:var(--foreground)]"
                        }`}
                      >
                        {l}
                      </button>
                    );
                  })}
                  {a?.flagged ? <Flag size={12} className="text-[color:var(--gold)]" aria-label="işaretli" /> : null}
                </li>
              );
            })}
          </ol>
        </div>
        <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">Kitapçıktaki şıkka ya da buradaki daireye dokunman yeterli; ikisi aynı cevabı işaretler. İşaretli daireye tekrar dokunursan silinir.</p>
      </aside>
    </div>
  );
}
