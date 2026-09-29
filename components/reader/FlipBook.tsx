"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const TURN_MS = 620;
const SOUND_KEY = "netfener-reader-sound";
/** The books are A-series, so one page is 1:√2 and an open spread is √2:1. */
const PAGE_RATIO = "893 / 1263";

type Turn = { dir: "next" | "prev"; front: number; back: number; flipped: boolean };

/**
 * The sound preference lives outside React: it is read from localStorage once and written back
 * on every toggle, so a reader who turned the sound off keeps it off on the next book.
 */
let soundOn = false;
let soundRead = false;
const soundListeners = new Set<() => void>();

function readSound() {
  if (!soundRead) {
    soundRead = true;
    try {
      soundOn = window.localStorage.getItem(SOUND_KEY) === "on";
    } catch {
      /* private mode: the toggle just starts off */
    }
  }
  return soundOn;
}

function subscribeSound(onChange: () => void) {
  soundListeners.add(onChange);
  return () => {
    soundListeners.delete(onChange);
  };
}

function storeSound(next: boolean) {
  soundOn = next;
  soundRead = true;
  try {
    window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
  } catch {
    /* nothing to persist to; the choice still holds for this session */
  }
  for (const listener of soundListeners) listener();
}

/** A phone gets one page at a time; anything wider opens the book properly. */
const NARROW = "(max-width: 900px)";
function subscribeNarrow(onChange: () => void) {
  const media = window.matchMedia(NARROW);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function readNarrow() {
  return window.matchMedia(NARROW).matches;
}

function Sheet({ src, alt, page, side, height }: {
  src: string | null;
  alt: string;
  page: number;
  side: "left" | "right";
  height: string;
}) {
  return (
    <figure
      className={`relative m-0 ${src ? "bg-white shadow-[0_18px_40px_rgba(0,0,0,.45)]" : ""} ${side === "left" ? "rounded-l-md" : "rounded-r-md"}`}
      style={{ height, aspectRatio: PAGE_RATIO }}
    >
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- entitlement-checked route, rendered per request, never publicly cached */}
          <img src={src} alt={alt} className="block h-full w-full select-none object-contain" draggable={false} />
          <figcaption className="absolute bottom-1 w-full text-center text-[10px] font-bold text-black/40">{page}</figcaption>
          {/* the shadow that falls into the gutter of an open book */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 w-10 ${side === "left" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/20 to-transparent`}
          />
        </>
      ) : null}
    </figure>
  );
}

/**
 * The online reader: a two-page spread that turns like a book.
 *
 * Pages arrive one JPEG at a time from a route that checks entitlement, so the PDF itself
 * is never handed to the browser — that separation is what the online edition sells.
 */
export function FlipBook({ slug, title, pageCount }: { slug: string; title: string; pageCount: number }) {
  // `leaf` is the left-hand page of the open spread; 0 means the cover sits alone on the right.
  const [leaf, setLeaf] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [jump, setJump] = useState("");
  const audio = useRef<HTMLAudioElement | null>(null);
  // Rendered on the server as a sound-off spread, then corrected once the browser can be asked.
  const sound = useSyncExternalStore(subscribeSound, readSound, () => false);
  const spread = !useSyncExternalStore(subscribeNarrow, readNarrow, () => false);

  const pageUrl = useCallback(
    (page: number) => (page >= 1 && page <= pageCount ? `/api/ebooks/${slug}/sayfa/${page}` : null),
    [pageCount, slug],
  );

  const step = spread ? 2 : 1;
  const atStart = leaf <= 0;
  const atEnd = leaf + step > pageCount - 1;

  const go = useCallback((dir: "next" | "prev") => {
    if (turn) return;
    const target = dir === "next" ? leaf + step : leaf - step;
    if (target < 0 || target > pageCount - 1) return;

    // The leaf carries the page being turned away on its front and the page it reveals on its back.
    // In a spread the left page is `leaf`; alone on a narrow screen the one page shown is `leaf + 1`.
    const front = dir === "next" || !spread ? leaf + 1 : leaf;
    const back = dir === "next" && spread ? target : target + 1;
    setTurn({ dir, front, back, flipped: false });
    setLeaf(target);

    if (sound && audio.current) {
      audio.current.currentTime = 0;
      void audio.current.play().catch(() => {
        /* autoplay policy: the page still turns, silently */
      });
    }
    // two frames: the leaf has to be painted flat before the transition to its turned state runs
    requestAnimationFrame(() => requestAnimationFrame(() => setTurn((t) => (t ? { ...t, flipped: true } : t))));
    window.setTimeout(() => setTurn(null), TURN_MS + 40);
  }, [leaf, pageCount, sound, spread, step, turn]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go("next");
      if (event.key === "ArrowLeft") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // keep the pages just ahead warm so a turn does not wait on the network
  useEffect(() => {
    for (const page of [leaf + step + 1, leaf + step + 2, leaf - 1]) {
      const url = pageUrl(page);
      if (url) new window.Image().src = url;
    }
  }, [leaf, pageUrl, step]);

  const toggleSound = () => storeSound(!sound);

  // Fit the spread to the window: capped by height, by width, and by a size no screen needs to exceed.
  const sheetHeight = spread
    ? "min(74dvh, 880px, (100vw - 170px) * 0.7072)"
    : "min(78dvh, 880px, (100vw - 26px) * 1.4143)";

  const right = leaf + 1;
  // Beside the book when there is room for it; over the page itself on a phone, where there is not.
  const arrow = spread
    ? "mx-2 sm:mx-4"
    : "absolute top-1/2 z-10 -translate-y-1/2 bg-black/45 backdrop-blur-sm";

  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col bg-[#14120f] text-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <p className="text-sm font-extrabold text-[color:var(--gold)]">{title}</p>
        <p className="text-xs text-white/50">
          {spread && leaf > 0 ? `${leaf}–${Math.min(right, pageCount)}` : right} / {pageCount}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const target = Number(jump);
              if (Number.isInteger(target) && target >= 1 && target <= pageCount) {
                setLeaf(spread ? Math.max(0, target - (target % 2)) : target - 1);
                setJump("");
              }
            }}
            className="flex items-center gap-2"
          >
            <label className="sr-only" htmlFor="reader-jump">Sayfaya git</label>
            <input
              id="reader-jump"
              value={jump}
              onChange={(event) => setJump(event.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="Sayfa"
              className="w-20 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-white/35"
            />
            <button type="submit" className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-bold hover:bg-white/10">Git</button>
          </form>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-bold hover:bg-white/10"
          >
            {sound ? "Ses açık" : "Ses kapalı"}
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-2 py-5 sm:px-4">
        <button type="button" onClick={() => go("prev")} disabled={atStart} aria-label="Önceki sayfa"
          className={`shrink-0 rounded-full border border-white/15 px-3 py-6 text-xl disabled:opacity-25 ${arrow} left-1`}>‹</button>

        <div style={{ perspective: 2400 }}>
          {/* With the cover alone on the right, the book slides over so it sits centred, then opens. */}
          <div
            className="relative flex"
            style={{
              transform: spread && leaf === 0 ? "translateX(-25%)" : undefined,
              transition: `transform ${TURN_MS}ms cubic-bezier(.4,.05,.3,1)`,
            }}
          >
            {spread ? (
              <Sheet src={pageUrl(leaf)} alt={`${title}, sayfa ${leaf}`} page={leaf} side="left" height={sheetHeight} />
            ) : null}
            <Sheet src={pageUrl(right)} alt={`${title}, sayfa ${right}`} page={right} side="right" height={sheetHeight} />

            {turn ? (
              <div
                aria-hidden
                className={`absolute inset-y-0 ${spread ? "w-1/2" : "w-full"}`}
                style={{
                  left: spread && turn.dir === "next" ? "50%" : 0,
                  transformStyle: "preserve-3d",
                  transformOrigin: turn.dir === "next" ? "left center" : "right center",
                  transform: turn.flipped ? `rotateY(${turn.dir === "next" ? -172 : 172}deg)` : "rotateY(0deg)",
                  transition: `transform ${TURN_MS}ms cubic-bezier(.4,.05,.3,1)`,
                  zIndex: 5,
                }}
              >
                {[turn.front, turn.back].map((page, index) => {
                  const src = pageUrl(page);
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 overflow-hidden ${src ? "bg-white shadow-[0_18px_40px_rgba(0,0,0,.5)]" : ""}`}
                      style={{ backfaceVisibility: "hidden", transform: index === 1 ? "rotateY(180deg)" : undefined }}
                    >
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element -- same entitlement-checked route
                        <img src={src} alt="" className="block h-full w-full object-contain" draggable={false} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <button type="button" onClick={() => go("next")} disabled={atEnd} aria-label="Sonraki sayfa"
          className={`shrink-0 rounded-full border border-white/15 px-3 py-6 text-xl disabled:opacity-25 ${arrow} right-1`}>›</button>
      </div>

      <footer className="border-t border-white/10 px-4 py-3 text-center text-xs text-white/40 sm:px-6">
        Ok tuşlarıyla da sayfa çevirebilirsin. Bu sürüm indirilemez; PDF sürümü ayrı satılır.
      </footer>

      <audio ref={audio} src="/reader/page-flip.wav" preload="auto" />
    </div>
  );
}
