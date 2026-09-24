"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Headphones, Mic, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { analyseSpeaking, repeatAccuracy, SPEAKING_EXAMS, type SpeakingExam } from "@/lib/speaking-practice";

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: RecognitionEvent) => void) | null; onerror: (() => void) | null };
type RecognitionConstructor = new () => Recognition;
type Phase = "intro" | "ready" | "reading" | "listening" | "preparing" | "recording" | "transition" | "complete";
type Mode = "practice" | "mock";
type SavedAttempt = { exam: SpeakingExam; task: string; date: string; words: number; wpm: number };

const HISTORY_KEY = "cannice-speaking-history-v2";

export function SpeakingPractice({ exam }: { exam: SpeakingExam }) {
  const config = SPEAKING_EXAMS[exam];
  const [mode, setMode] = useState<Mode>("practice");
  const [taskIndex, setTaskIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [notes, setNotes] = useState("");
  const [audioUrl, setAudioUrl] = useState<string>();
  const [message, setMessage] = useState("");
  // "blocked" = the browser refused the microphone; the student can retry or follow the steps.
  const [mic, setMic] = useState<"unknown" | "blocked" | "asking" | "granted">("unknown");
  const [completedCount, setCompletedCount] = useState(0);
  const [history, setHistory] = useState<SavedAttempt[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as SavedAttempt[]; } catch { return []; }
  });
  const recognitionRef = useRef<Recognition | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptRef = useRef("");
  const task = config.tasks[taskIndex];

  useEffect(() => {
    if (!["reading", "preparing", "recording", "transition"].includes(phase)) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "reading" && task.reading && elapsed >= task.reading.seconds) playListeningOrPrepare();
    if (phase === "preparing" && elapsed >= task.preparationSeconds) void beginRecording();
    if (phase === "recording" && elapsed >= task.responseSeconds) finishResponse();
    if (phase === "transition" && elapsed >= 4) startTask(taskIndex + 1);
    // Phase transitions are driven by the visible exam timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    speechSynthesis.cancel();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function resetResponse() {
    setElapsed(0); setTranscript(""); transcriptRef.current = ""; setInterim(""); setNotes(""); setMessage("");
  }

  function speak(text: string, onEnd?: () => void) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\b(Man|Woman|Professor):/g, "$1 says,"));
    utterance.lang = "en-US"; utterance.rate = 0.92;
    if (onEnd) utterance.onend = onEnd;
    speechSynthesis.speak(utterance);
  }

  function startTask(index: number) {
    if (index >= config.tasks.length) { setPhase("complete"); return; }
    setTaskIndex(index); resetResponse();
    const next = config.tasks[index];
    if (next.reading) setPhase("reading");
    else if (next.listening) {
      setPhase("listening");
      window.setTimeout(() => speak(next.listening!.script, () => beginPreparation(next)), 250);
    } else beginPreparation(next);
  }

  function beginPreparation(current = task) {
    setElapsed(0);
    if (current.preparationSeconds > 0) setPhase("preparing");
    else void beginRecording();
  }

  function playListeningOrPrepare() {
    setElapsed(0);
    if (!task.listening) { beginPreparation(); return; }
    setPhase("listening");
    speak(task.listening.script, () => beginPreparation());
  }

  async function beginRecording() {
    const browserWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const RecognitionApi = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!RecognitionApi || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMessage("Canlı konuşma tanıma için güncel Chrome, Edge veya Safari kullanın."); setPhase("ready"); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start(); recorderRef.current = recorder;
      const recognition = new RecognitionApi();
      recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let finalText = "", interimText = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result.isFinal) finalText += `${result[0].transcript} `; else interimText += result[0].transcript;
        }
        if (finalText) { transcriptRef.current += finalText; setTranscript(transcriptRef.current.trim()); }
        setInterim(interimText);
      };
      recognition.onerror = () => setMessage("Konuşma tanıma kesildi; ses kaydınız devam ediyor.");
      recognition.start(); recognitionRef.current = recognition;
      setElapsed(0); setPhase("recording"); setMessage(""); setMic("unknown");
    } catch { setMic("blocked"); setMessage(""); setPhase("ready"); }
  }

  /** "Mikrofon iznini ver": asks the browser again; if it's blocked for the site, explains how to allow it. */
  async function requestMicrophone() {
    setMic("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMic("granted");
      setMessage("");
    } catch {
      setMic("blocked");
    }
  }

  function finishResponse() {
    recognitionRef.current?.stop(); recognitionRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null; setInterim("");
    const metrics = analyseSpeaking(transcriptRef.current, Math.max(elapsed, 1));
    const attempt = { exam, task: task.title, date: new Date().toISOString(), words: metrics.wordCount, wpm: metrics.wordsPerMinute };
    setHistory((current) => {
      const next = [attempt, ...current].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    setCompletedCount((value) => value + 1);
    setElapsed(0);
    setPhase(mode === "mock" ? (taskIndex === config.tasks.length - 1 ? "complete" : "transition") : "complete");
  }

  function changeMode(nextMode: Mode) {
    recognitionRef.current?.stop(); speechSynthesis.cancel();
    setMode(nextMode); setCompletedCount(0); setTaskIndex(0); resetResponse(); setPhase("intro");
  }

  const metrics = analyseSpeaking(transcript, Math.max(elapsed, 1));
  const accuracy = task.taskType === "repeat" ? repeatAccuracy(task.prompt, transcript) : null;
  const limit = phase === "reading" ? task.reading?.seconds ?? 0 : phase === "preparing" ? task.preparationSeconds : phase === "recording" ? task.responseSeconds : phase === "transition" ? 4 : 0;
  const remaining = Math.max(limit - elapsed, 0);
  const examHistory = history.filter((item) => item.exam === exam).slice(0, 4);

  if (phase === "intro") return (
    <section className="dashboard-panel mx-auto max-w-4xl">
      <div className="relative z-10">
        <p className="eyebrow">{config.formatLabel}</p><h1 className="page-title">{config.name}</h1>
        <p className="page-copy">{config.description}</p>
        <div className="mt-6 rounded-2xl bg-[color:var(--brand-soft)] p-5"><p className="font-extrabold">Bölüm yönergeleri · {config.duration}</p><ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--muted)]">{config.sectionInstructions.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[color:var(--success)]" />{item}</li>)}</ul></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => { setMode("practice"); setPhase("ready"); }} className="rounded-2xl border-2 border-[color:var(--border)] p-5 text-left transition hover:border-[color:var(--accent)]"><Mic className="text-[color:var(--accent)]" /><span className="mt-3 block text-lg font-extrabold">Tek görev pratiği</span><span className="mt-1 block text-sm leading-6 text-[color:var(--muted)]">Bir görev seçin, istediğiniz kadar tekrar edin.</span></button>
          <button type="button" onClick={() => { setMode("mock"); startTask(0); }} className="rounded-2xl bg-[color:var(--brand)] p-5 text-left text-white transition hover:bg-[color:var(--brand-strong)]"><Play /><span className="mt-3 block text-lg font-extrabold">Tam deneme modu</span><span className="mt-1 block text-sm leading-6 text-blue-100">Tüm görevleri yönergeler ve otomatik geçişlerle tamamlayın.</span></button>
        </div>
      </div>
    </section>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2"><button type="button" onClick={() => changeMode("practice")} className={`pill-tab ${mode === "practice" ? "pill-tab-active" : ""}`}>Tek görev</button><button type="button" onClick={() => changeMode("mock")} className={`pill-tab ${mode === "mock" ? "pill-tab-active" : ""}`}>Tam deneme</button></div>
        <p className="text-sm font-bold text-[color:var(--muted)]">{mode === "mock" ? `İlerleme: ${Math.min(completedCount + 1, config.tasks.length)} / ${config.tasks.length}` : config.formatLabel}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="dashboard-panel"><div className="relative z-10">
          {mode === "practice" && <div className="mb-6 flex flex-wrap gap-2" aria-label="Konuşma görevi seçin">{config.tasks.map((item, index) => <button key={item.id} type="button" onClick={() => { setTaskIndex(index); resetResponse(); setPhase("ready"); }} className={`pill-tab ${index === taskIndex ? "pill-tab-active" : ""}`}>{exam === "ielts" ? item.part.split(" · ")[0] : `Task ${index + 1}`}</button>)}</div>}
          {phase === "complete" && mode === "mock" ? <MockComplete count={completedCount} onRestart={() => { setCompletedCount(0); startTask(0); }} /> : <>
            <p className="eyebrow">{task.part}</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">{task.title}</h1><p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{task.instructions}</p>
            {phase === "reading" && task.reading ? <SourcePanel icon={<BookOpen size={20} />} label={`Okuma · ${remaining} sn`} title={task.reading.title} text={task.reading.text} /> : null}
            {phase === "listening" && task.listening ? <SourcePanel icon={<Headphones size={20} />} label="Dinleme" title={task.listening.title} text="Kayıt bir kez çalınır. Ana fikirleri ve örnekleri not alın." /> : null}
            {(!task.reading || phase !== "reading") && phase !== "listening" && task.taskType !== "repeat" ? <div className="mt-5 rounded-2xl bg-[color:var(--brand-soft)] p-5"><p className="text-base font-semibold leading-7">{task.prompt}</p>{mode === "practice" && phase === "ready" ? <button type="button" onClick={() => speak(task.prompt)} className="ghost-button mt-3 -ml-4"><Volume2 size={18} /> Soruyu dinle</button> : null}</div> : null}
            {task.taskType === "repeat" && phase === "complete" ? <div className="mt-5 rounded-2xl bg-[color:var(--brand-soft)] p-5"><p className="text-xs font-extrabold uppercase tracking-widest text-[color:var(--accent)]">Dinlediğiniz cümle</p><p className="mt-2 text-base font-semibold leading-7">{task.prompt}</p></div> : null}
            {(phase === "preparing" || phase === "listening" || phase === "reading") && <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="auth-input mt-5 min-h-24" placeholder="Notlarınızı buraya yazabilirsiniz…" aria-label="Hazırlık notları" />}
            <PhaseDisplay phase={phase} remaining={remaining} />
            {message && <p role="alert" className="mt-4 rounded-xl bg-[color:var(--danger-soft)] p-4 text-sm font-semibold text-red-700">{message}</p>}
            {mic === "blocked" || mic === "asking" ? (
              <div role="alert" className="mt-4 rounded-xl bg-[color:var(--danger-soft)] p-4 text-sm">
                <p className="font-semibold text-red-700">Pratik yapabilmek için mikrofon izni gerekiyor.</p>
                <button type="button" onClick={requestMicrophone} disabled={mic === "asking"} className="primary-button mt-3 !min-h-10 !py-2">
                  <Mic size={16} aria-hidden="true" /> {mic === "asking" ? "İzin isteniyor…" : "Mikrofon iznini ver"}
                </button>
                <p className="mt-3 leading-6 text-[color:var(--muted)]">
                  İzin penceresi açılmıyorsa mikrofon bu site için engellenmiş olabilir: adres çubuğundaki kilit (🔒) veya ayar simgesine tıkla, <strong>Mikrofon → İzin ver</strong> seç ve sayfayı yenile. Telefonda tarayıcının site ayarlarından da açabilirsin.
                </p>
              </div>
            ) : null}
            {mic === "granted" ? <p role="status" className="mt-4 rounded-xl bg-[color:var(--success-soft)] p-4 text-sm font-semibold text-[color:var(--success)]">Mikrofon hazır. Görevi başlatabilirsin.</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              {phase === "ready" && <button type="button" onClick={() => startTask(taskIndex)} className="primary-button"><Mic size={18} /> Görevi başlat</button>}
              {phase === "recording" && <button type="button" onClick={finishResponse} className="primary-button bg-red-600 hover:bg-red-700"><Square size={17} /> Yanıtı bitir</button>}
              {phase === "complete" && mode === "practice" && <button type="button" onClick={() => { resetResponse(); setPhase("ready"); }} className="secondary-button"><RotateCcw size={18} /> Yeniden dene</button>}
            </div>
            {(transcript || interim || phase === "complete") && <div className="mt-7 border-t border-[color:var(--border)] pt-6"><h2 className="text-lg font-extrabold">Konuşma metniniz</h2><p className="mt-3 min-h-20 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">{transcript} <span className="text-slate-400">{interim}</span>{!transcript && !interim ? "Konuşma algılanamadı." : null}</p>{audioUrl && <audio className="mt-4 w-full" controls src={audioUrl}><track kind="captions" /></audio>}</div>}
          </>}
        </div></section>
        <aside className="space-y-5">
          <div className="dashboard-panel"><h2 className="relative z-10 text-lg font-extrabold">Anlık geri bildirim</h2><div className="relative z-10 mt-4 grid grid-cols-2 gap-3">{accuracy === null ? <><Metric label="Kelime" value={metrics.wordCount} /><Metric label="Kelime/dk" value={metrics.wordsPerMinute} /><Metric label="Dolgu sözcük" value={metrics.fillerCount} /><Metric label="Hedef" value={`${task.targetWords[0]}–${task.targetWords[1]}`} /></> : <><Metric label="Sıralı eşleşme" value={`%${accuracy}`} /><Metric label="Söylenen" value={metrics.wordCount} /><Metric label="Hedef" value={task.targetWords[0]} /><Metric label="Süre" value={`${task.responseSeconds} sn`} /></>}</div><p className="relative z-10 mt-4 text-sm leading-6 text-[color:var(--muted)]">Bu göstergeler çalışma amaçlıdır; resmi ETS veya IELTS puanı değildir.</p></div>
          {examHistory.length > 0 && <div className="dashboard-panel"><h2 className="relative z-10 text-lg font-extrabold">Son pratikler</h2><ul className="relative z-10 mt-3 space-y-3">{examHistory.map((item, index) => <li key={`${item.date}-${index}`} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-bold">{item.task}</p><p className="mt-1 text-[color:var(--muted)]">{item.words} kelime · {item.wpm} kelime/dk</p></li>)}</ul></div>}
        </aside>
      </div>
    </div>
  );
}

function SourcePanel({ icon, label, title, text }: { icon: React.ReactNode; label: string; title: string; text: string }) { return <div className="mt-5 rounded-2xl border-2 border-[color:var(--accent)] bg-white p-5"><div className="flex items-center gap-2 text-sm font-extrabold text-[color:var(--accent)]">{icon}{label}</div><h2 className="mt-3 text-xl font-extrabold">{title}</h2><p className="mt-3 leading-7 text-slate-700">{text}</p></div>; }
function PhaseDisplay({ phase, remaining }: { phase: Phase; remaining: number }) { if (!["ready", "preparing", "recording", "transition"].includes(phase)) return null; const labels: Partial<Record<Phase, string>> = { ready: "Başlamaya hazır", preparing: "Hazırlık süresi", recording: "Yanıt kaydediliyor", transition: "Sonraki göreve geçiliyor" }; return <div className="mt-6 flex min-h-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] p-5 text-center">{phase === "recording" && <span className="mb-2 size-4 animate-pulse rounded-full bg-red-500" />}<p className="text-sm font-bold uppercase tracking-widest text-[color:var(--accent)]">{labels[phase]}</p>{phase !== "ready" && <p className="mt-2 text-5xl font-extrabold">{remaining}</p>}</div>; }
function MockComplete({ count, onRestart }: { count: number; onRestart: () => void }) { return <div className="py-12 text-center"><CheckCircle2 size={54} className="mx-auto text-[color:var(--success)]" /><p className="eyebrow mt-5">Tam deneme tamamlandı</p><h1 className="mt-2 text-3xl font-extrabold">{count} yanıt kaydedildi</h1><p className="mx-auto mt-3 max-w-lg leading-7 text-[color:var(--muted)]">Kayıtlarınızı ve akıcılık göstergelerinizi inceleyin. Düzen, açıklık ve örnek kullanımınızı değerlendirerek tekrar deneyin.</p><button type="button" onClick={onRestart} className="primary-button mt-6"><RotateCcw size={18} /> Denemeyi yeniden başlat</button></div>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-[color:var(--brand-soft)] p-3"><p className="text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs font-bold text-[color:var(--muted)]">{label}</p></div>; }
