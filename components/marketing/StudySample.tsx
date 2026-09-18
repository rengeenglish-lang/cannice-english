"use client";

import { useState } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import styles from "./MaterialsHome.module.css";

const EXERCISES = [
  {
    label: "Dil bilgisi",
    topic: "Zamanın ipucunu yakalayın.",
    question: "She ____ at this school since 2020.",
    options: ["works", "has worked", "worked"],
    correct: 1,
    explanation:
      "“Since 2020” geçmişte başlayıp bugüne uzanan bir süreyi gösterir. Bu cümlede present perfect kullanırız: has + worked.",
    takeaway: "İpucu → zaman ilişkisi → doğru yapı",
  },
  {
    label: "Kelime",
    topic: "Kelimeyi bağlamıyla öğrenin.",
    question:
      "The new method significantly reduced costs. “Significantly” is closest in meaning to:",
    options: ["considerably", "rarely", "accidentally"],
    correct: 0,
    explanation:
      "“Significantly”, “önemli ölçüde” demektir. “Considerably” aynı anlamı taşır. Cümle, yeni yöntemin maliyetleri önemli ölçüde düşürdüğünü söyler.",
    takeaway: "Tek kelime yerine, cümledeki anlamı düşünün.",
  },
  {
    label: "Okuma",
    topic: "Cümlenin asıl mesajını bulun.",
    question:
      "Although the journey was long, the students arrived on time. What does the sentence tell us?",
    options: [
      "The students were late.",
      "The journey was short.",
      "The students were punctual despite a long journey.",
    ],
    correct: 2,
    explanation:
      "“Although” zıtlık kurar: yolculuk uzundur ama öğrenciler zamanında varmıştır. “On time” ve “punctual” burada aynı fikri anlatır.",
    takeaway: "Bağlacı görün, iki fikir arasındaki ilişkiyi kurun.",
  },
];

export function StudySample() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const exercise = EXERCISES[active];

  function changeExercise(index: number) {
    setActive(index);
    setSelected(null);
    setChecked(false);
  }

  return (
    <div className={styles.exercise}>
      <div
        className={styles.sampleTabs}
        role="group"
        aria-label="Alıştırma konusu"
      >
        {EXERCISES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={active === index}
            onClick={() => changeExercise(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.exerciseBody}>
        <p className={styles.overline}>
          Tanıtım alıştırması · {String(active + 1).padStart(2, "0")} / 03
        </p>
        <h3>{exercise.topic}</h3>
        <fieldset>
          <legend lang="en">{exercise.question}</legend>
          <div className={styles.answers}>
            {exercise.options.map((option, index) => (
              <label
                key={option}
                className={
                  selected === index ? styles.selectedAnswer : undefined
                }
              >
                <input
                  type="radio"
                  name="sample-answer"
                  value={index}
                  checked={selected === index}
                  disabled={checked}
                  onChange={() => setSelected(index)}
                />
                <span className={styles.answerLetter} aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span lang="en">{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div role="status" aria-live="polite" aria-atomic="true">
          {checked && (
            <div className={styles.explanation}>
              <strong>
                {selected === exercise.correct
                  ? "Doğru cevap!"
                  : "Birlikte bakalım."}{" "}
                {String.fromCharCode(65 + exercise.correct)} —{" "}
                <span lang="en">{exercise.options[exercise.correct]}</span>
              </strong>
              <p>{exercise.explanation}</p>
              <small>{exercise.takeaway}</small>
            </div>
          )}
        </div>
        <div className={styles.exerciseActions}>
          {!checked ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={() => setChecked(true)}
              className={styles.buttonDark}
            >
              Cevabı kontrol et <Check size={17} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => changeExercise((active + 1) % EXERCISES.length)}
              className={styles.buttonDark}
            >
              {active === EXERCISES.length - 1
                ? "Başa dön"
                : "Sıradaki alıştırma"}
              {active === EXERCISES.length - 1 ? (
                <RotateCcw size={17} aria-hidden="true" />
              ) : (
                <ArrowRight size={17} aria-hidden="true" />
              )}
            </button>
          )}
          <span>Üyelik gerektirmez</span>
        </div>
      </div>
    </div>
  );
}
