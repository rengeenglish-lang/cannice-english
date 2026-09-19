"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";

const QUESTIONS = [
  {
    exam: "YDS",
    color: "#f5590b",
    area: "Dil bilgisi",
    prompt: "She ____ at this school since 2020.",
    instruction: "Boşluğu anlam ve zaman bakımından en doğru seçenekle tamamlayın.",
    options: ["works", "has worked", "worked", "is working"],
    correct: 1,
    explanation: "“Since 2020” geçmişte başlayıp bugüne uzanan bir zamanı gösterir. Bu nedenle present perfect kullanılır: has worked.",
  },
  {
    exam: "TOEFL",
    color: "#3b6fed",
    area: "Academic Reading",
    passage: "Urban trees reduce surface temperatures by providing shade and releasing moisture into the air. Their effect is especially valuable in densely built neighborhoods.",
    prompt: "According to the passage, why are urban trees particularly useful in densely built areas?",
    options: ["They create more building space.", "They help lower local temperatures.", "They prevent all air pollution.", "They require very little moisture."],
    correct: 1,
    explanation: "The passage directly states that trees reduce surface temperatures through shade and moisture.",
  },
  {
    exam: "IELTS",
    color: "#0f9b8e",
    area: "Reading",
    passage: "The library introduced evening opening hours in response to requests from students who worked during the day.",
    prompt: "The library extended its hours because students asked for greater access.",
    options: ["True", "False", "Not Given"],
    correct: 0,
    explanation: "The passage says the change was made in response to student requests, so the statement is True.",
  },
  {
    exam: "YÖKDİL",
    color: "#5b4fe0",
    area: "Akademik kelime",
    prompt: "The findings provide ____ evidence that regular exercise improves cardiovascular health.",
    instruction: "Cümleyi akademik bağlama en uygun kelimeyle tamamlayın.",
    options: ["compelling", "temporary", "irrelevant", "accidental"],
    correct: 0,
    explanation: "“Compelling evidence” güçlü ve ikna edici kanıt anlamına gelen yerleşik bir akademik kullanımdır.",
  },
] as const;

export function StudySample() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const question = QUESTIONS[active];

  function go(index: number) {
    setActive((index + QUESTIONS.length) % QUESTIONS.length);
    setSelected(null);
    setChecked(false);
  }

  return <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-white text-[#071b34] shadow-2xl">
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Sınav sorusu</p><p className="mt-1 text-sm font-black" style={{ color: question.color }}>{question.exam} · {question.area}</p></div>
      <span className="text-xs font-extrabold text-slate-500">{active + 1} / {QUESTIONS.length}</span>
    </div>

    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-5 py-3" role="tablist" aria-label="Sınav sorusu seçin">
      {QUESTIONS.map((item, index) => <button key={item.exam} type="button" role="tab" aria-selected={active === index} onClick={() => go(index)} className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-black transition ${active === index ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} style={active === index ? { background: item.color } : undefined}>{item.exam}</button>)}
    </div>

    <div className="p-5 sm:p-7">
      {"instruction" in question ? <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">{question.instruction}</p> : null}
      {"passage" in question ? <div className="mb-5 rounded-2xl bg-slate-100 p-4 text-sm leading-7 text-slate-700">{question.passage}</div> : null}
      <fieldset>
        <legend className="text-lg font-black leading-7 text-[#071b34]" lang="en">{question.prompt}</legend>
        <div className="mt-5 grid gap-2.5">
          {question.options.map((option, index) => {
            const selectedOption = selected === index;
            const correctOption = checked && index === question.correct;
            const wrongOption = checked && selectedOption && index !== question.correct;
            return <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${correctOption ? "border-emerald-500 bg-emerald-50 text-emerald-900" : wrongOption ? "border-rose-400 bg-rose-50 text-rose-900" : selectedOption ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}>
              <input type="radio" name="homepage-exam-question" checked={selectedOption} disabled={checked} onChange={() => setSelected(index)} className="size-4" />
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-black">{String.fromCharCode(65 + index)}</span>
              <span lang="en">{option}</span>
            </label>;
          })}
        </div>
      </fieldset>

      {checked ? <div role="status" className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700"><strong className="text-[#071b34]">{selected === question.correct ? "Doğru cevap!" : "Birlikte bakalım."}</strong> {question.explanation}</div> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2"><button type="button" onClick={() => go(active - 1)} className="grid size-11 place-items-center rounded-xl border border-slate-200" aria-label="Önceki soru"><ArrowLeft size={18}/></button><button type="button" onClick={() => go(active + 1)} className="grid size-11 place-items-center rounded-xl border border-slate-200" aria-label="Sonraki soru"><ArrowRight size={18}/></button></div>
        {!checked ? <button type="button" disabled={selected === null} onClick={() => setChecked(true)} className="primary-button disabled:opacity-40">Cevabı kontrol et <Check size={17}/></button> : <button type="button" onClick={() => go(active + 1)} className="primary-button">{active === QUESTIONS.length - 1 ? "Başa dön" : "Sıradaki soru"} {active === QUESTIONS.length - 1 ? <RotateCcw size={17}/> : <ArrowRight size={17}/>}</button>}
      </div>
    </div>
  </div>;
}
