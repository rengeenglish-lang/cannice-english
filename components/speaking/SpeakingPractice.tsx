"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { analyseSpeaking, SPEAKING_EXAMS, type SpeakingExam } from "@/lib/speaking-practice";

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type RecognitionConstructor = new () => SpeechRecognitionLike;

type SavedAttempt = {
  exam: SpeakingExam;
  task: string;
  date: string;
  words: number;
  wpm: number;
};

const HISTORY_KEY = "cannice-speaking-history";

export function SpeakingPractice({ exam }: { exam: SpeakingExam }) {
  const config = SPEAKING_EXAMS[exam];
  const [taskIndex, setTaskIndex] = useState(0);
  const [phase, setPhase] = useState<"ready" | "preparing" | "recording" | "finished">("ready");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [audioUrl, setAudioUrl] = useState<string>();
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<SavedAttempt[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as SavedAttempt[];
    } catch {
      return [];
    }
  });
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptRef = useRef("");
  const task = config.tasks[taskIndex];

  useEffect(() => {
    if (phase !== "preparing" && phase !== "recording") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "preparing" && seconds >= task.preparationSeconds) void beginRecording();
    if (phase === "recording" && seconds >= task.responseSeconds) stopRecording();
  // beginRecording and stopRecording intentionally respond to timer thresholds.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase, task.preparationSeconds, task.responseSeconds]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  function readPrompt() {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(task.prompt);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    speechSynthesis.speak(utterance);
  }

  async function beginRecording() {
    const Recognition = (window as typeof window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    }).SpeechRecognition ?? (window as typeof window & { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;

    if (!Recognition || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMessage("Tarayıcınız canlı konuşma tanımayı desteklemiyor. Güncel Chrome, Edge veya Safari ile tekrar deneyin.");
      setPhase("ready");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setAudioUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      recorderRef.current = recorder;

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result.isFinal) finalText += `${result[0].transcript} `;
          else interimText += result[0].transcript;
        }
        if (finalText) {
          transcriptRef.current += finalText;
          setTranscript(transcriptRef.current.trim());
        }
        setInterim(interimText);
      };
      recognition.onerror = () => setMessage("Konuşma tanıma kesildi. Kaydı durdurup tekrar deneyebilirsiniz.");
      recognition.start();
      recognitionRef.current = recognition;
      setMessage("");
      setSeconds(0);
      setPhase("recording");
    } catch {
      setMessage("Pratik yapabilmek için mikrofon iznine izin verin.");
      setPhase("ready");
    }
  }

  function startPreparation() {
    setTranscript("");
    transcriptRef.current = "";
    setInterim("");
    setMessage("");
    setSeconds(0);
    if (task.preparationSeconds === 0) void beginRecording();
    else setPhase("preparing");
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null;
    setInterim("");
    setPhase("finished");
    const metrics = analyseSpeaking(transcriptRef.current, seconds);
    const attempt: SavedAttempt = {
      exam,
      task: task.title,
      date: new Date().toISOString(),
      words: metrics.wordCount,
      wpm: metrics.wordsPerMinute,
    };
    const next = [attempt, ...history].slice(0, 12);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function reset(nextIndex = taskIndex) {
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setTaskIndex(nextIndex);
    setPhase("ready");
    setSeconds(0);
    setTranscript("");
    transcriptRef.current = "";
    setInterim("");
    setMessage("");
  }

  const metrics = analyseSpeaking(transcript, Math.max(seconds, 1));
  const remaining = phase === "preparing" ? task.preparationSeconds - seconds : task.responseSeconds - seconds;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="dashboard-panel">
        <div className="relative z-10">
          <div className="mb-6 flex flex-wrap gap-2" aria-label="Konuşma görevi seçin">
            {config.tasks.map((item, index) => (
              <button key={item.id} type="button" onClick={() => reset(index)} className={`pill-tab ${index === taskIndex ? "pill-tab-active" : ""}`}>
                Görev {index + 1}
              </button>
            ))}
          </div>
          <p className="eyebrow">{task.label}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{task.title}</h1>
          <div className="mt-5 rounded-2xl bg-[color:var(--brand-soft)] p-5">
            <p className="text-base font-semibold leading-7 text-[color:var(--foreground)]">{task.prompt}</p>
            <button type="button" onClick={readPrompt} className="ghost-button mt-3 -ml-4"><Volume2 size={18} /> Soruyu dinle</button>
          </div>

          <div className="mt-6 flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] p-6 text-center">
            {phase === "ready" && <><Mic size={34} className="mb-3 text-[color:var(--accent)]" /><p className="font-bold">Hazır olduğunuzda başlayın</p><p className="mt-1 text-sm text-[color:var(--muted)]">{task.preparationSeconds} sn hazırlık · {task.responseSeconds} sn yanıt</p></>}
            {phase === "preparing" && <><p className="text-sm font-bold uppercase tracking-widest text-[color:var(--accent)]">Hazırlık</p><p className="mt-2 text-5xl font-extrabold">{Math.max(remaining, 0)}</p></>}
            {phase === "recording" && <><span className="mb-3 size-4 animate-pulse rounded-full bg-red-500" /><p className="text-sm font-bold uppercase tracking-widest text-red-600">Kayıt yapılıyor</p><p className="mt-2 text-5xl font-extrabold">{Math.max(remaining, 0)}</p></>}
            {phase === "finished" && <><p className="text-sm font-bold uppercase tracking-widest text-[color:var(--success)]">Tamamlandı</p><p className="mt-2 text-2xl font-extrabold">Yanıtınızı inceleyin</p></>}
          </div>

          {message && <p role="alert" className="mt-4 rounded-xl bg-[color:var(--danger-soft)] p-4 text-sm font-semibold text-red-700">{message}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            {phase === "ready" && <button type="button" onClick={startPreparation} className="primary-button"><Mic size={18} /> Pratiğe başla</button>}
            {phase === "recording" && <button type="button" onClick={stopRecording} className="primary-button bg-red-600 hover:bg-red-700"><Square size={17} /> Kaydı bitir</button>}
            {phase === "finished" && <button type="button" onClick={() => reset()} className="secondary-button"><RotateCcw size={18} /> Yeniden dene</button>}
          </div>

          {(transcript || interim || phase === "finished") && (
            <div className="mt-7 border-t border-[color:var(--border)] pt-6">
              <h2 className="text-lg font-extrabold">Konuşma metniniz</h2>
              <p className="mt-3 min-h-20 rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">{transcript} <span className="text-slate-400">{interim}</span>{!transcript && !interim ? "Konuşma algılanamadı." : null}</p>
              {audioUrl && <audio className="mt-4 w-full" controls src={audioUrl}><track kind="captions" /></audio>}
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="dashboard-panel">
          <h2 className="relative z-10 text-lg font-extrabold">Anlık geri bildirim</h2>
          <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
            <Metric label="Kelime" value={metrics.wordCount} />
            <Metric label="Kelime/dk" value={metrics.wordsPerMinute} />
            <Metric label="Dolgu sözcük" value={metrics.fillerCount} />
            <Metric label="Hedef" value={`${task.targetWords[0]}–${task.targetWords[1]}`} />
          </div>
          <p className="relative z-10 mt-4 text-sm leading-6 text-[color:var(--muted)]">Akıcı bir yanıt için açık bir görüş, iki destekleyici fikir ve kısa bir sonuç kullanın. Bu geri bildirim tahminidir; resmi sınav puanı değildir.</p>
        </div>
        {history.filter((item) => item.exam === exam).length > 0 && (
          <div className="dashboard-panel">
            <h2 className="relative z-10 text-lg font-extrabold">Son pratikler</h2>
            <ul className="relative z-10 mt-3 space-y-3">
              {history.filter((item) => item.exam === exam).slice(0, 4).map((item, index) => (
                <li key={`${item.date}-${index}`} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-bold">{item.task}</p><p className="mt-1 text-[color:var(--muted)]">{item.words} kelime · {item.wpm} kelime/dk</p></li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-2xl bg-[color:var(--brand)] p-5 text-white"><Play size={22} /><p className="mt-3 font-extrabold">Ücretsiz tarayıcı pratiği</p><p className="mt-1 text-sm leading-6 text-blue-100">Sesiniz sunucuya gönderilmez. Kayıt ve geçmiş bu cihazda kalır.</p></div>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-[color:var(--brand-soft)] p-3"><p className="text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs font-bold text-[color:var(--muted)]">{label}</p></div>;
}
