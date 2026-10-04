"use client";
import { useActionState, useState } from "react";
import {
  saveSeoSettingsAction,
  type SeoActionState,
} from "@/app/actions/admin-seo";
import {
  seoSettingsSchema,
  type SeoSettingsEnvelope,
} from "@/lib/seo/settings";
export function SeoSettingsForm({
  initial,
  exams,
}: {
  initial: SeoSettingsEnvelope;
  exams: { id: string; name: string }[];
}) {
  const [settings, setSettings] = useState(initial.settings);
  const [state, action, pending] = useActionState(saveSeoSettingsAction, {
    status: "idle",
    revision: initial.revision,
  } as SeoActionState);
  const validation = seoSettingsSchema.safeParse(settings);
  const inputClass =
    "mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 focus-ring";
  return (
    <form action={action} className="space-y-6">
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify({
          revision: state.revision ?? initial.revision,
          settings,
        })}
      />
      <fieldset disabled={pending} className="dashboard-panel space-y-5 p-5">
        <legend className="px-2 text-lg font-bold">Çalışma tercihleri</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            Mod
            <select
              className={inputClass}
              value={settings.mode}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  mode: e.target.value as typeof settings.mode,
                })
              }
            >
              <option value="ASSISTED">Yardımlı — insan onayı gerekir</option>
              <option value="MANUAL">Manuel</option>
            </select>
          </label>
          <label>
            Dil / bölge kodu
            <input
              required
              maxLength={20}
              className={inputClass}
              value={settings.languageCode}
              onChange={(e) =>
                setSettings({ ...settings, languageCode: e.target.value })
              }
              placeholder="tr-TR"
            />
          </label>
          <label>
            Hedef pazarlar (TR, GB)
            <input
              required
              className={inputClass}
              value={settings.targetMarkets.join(",")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  targetMarkets: e.target.value.toUpperCase().split(","),
                })
              }
            />
            <span className="text-xs">
              İki harfli ülke kodları; virgülle ayırın.
            </span>
          </label>
        </div>
        <fieldset>
          <legend className="font-bold">Etkin sınavlar</legend>
          <p className="my-2 text-sm">
            Canlı veritabanındaki etkin sınav kataloğundan alınır. Seçim olmadan
            sınav hedeflenmez.
          </p>
          <div className="flex flex-wrap gap-4">
            {exams.length ? (
              exams.map((exam) => (
                <label
                  key={exam.id}
                  className="flex min-h-11 items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={settings.enabledExamIds.includes(exam.id)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        enabledExamIds: e.target.checked
                          ? [...settings.enabledExamIds, exam.id]
                          : settings.enabledExamIds.filter(
                              (id) => id !== exam.id,
                            ),
                      })
                    }
                  />
                  {exam.name}
                </label>
              ))
            ) : (
              <p>Etkin sınav bulunamadı.</p>
            )}
          </div>
        </fieldset>
      </fieldset>
      <fieldset disabled={pending} className="dashboard-panel space-y-5 p-5">
        <legend className="px-2 text-lg font-bold">
          AI tercihleri ve gelecekteki sınırlar
        </legend>
        <p className="text-sm">
          Bu seçimler yalnızca kaydedilir. Faz 1 hiçbir AI çağrısı yapmaz;
          sağlayıcı adaptörleri ve bütçe muhasebesi sonraki fazda bağlanır. API
          anahtarı girmeyin.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            Sağlayıcı tercihi
            <select
              className={inputClass}
              value={settings.provider}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  provider: e.target.value as typeof settings.provider,
                })
              }
            >
              {["NONE", "OPENAI", "ANTHROPIC", "GOOGLE"].map((value) => (
                <option key={value} value={value}>
                  {value === "NONE" ? "Yapılandırılmadı" : value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Model adı
            <input
              maxLength={100}
              className={inputClass}
              value={settings.model}
              onChange={(e) =>
                setSettings({ ...settings, model: e.target.value })
              }
            />
          </label>
          {(
            [
              ["monthlyBudgetUsd", "Aylık bütçe (USD)", 10000],
              ["dailyArticleLimit", "Günlük yayın üst sınırı", 20],
              ["weeklyArticleLimit", "Haftalık yayın üst sınırı", 100],
              ["minimumQualityScore", "Asgari kalite puanı", 100],
              ["minimumRelevanceScore", "Asgari uygunluk puanı", 100],
            ] as const
          ).map(([key, label, max]) => (
            <label key={key}>
              {label}
              <input
                required
                type="number"
                min={0}
                max={max}
                step={key === "monthlyBudgetUsd" ? "0.01" : "1"}
                className={inputClass}
                value={settings[key]}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
        </div>
        <p className="text-sm">
          Tam autopilot, otomatik yayın, görsel üretimi ve otomatik bağlantı
          ekleme: <strong>kapalı / henüz kullanılamıyor.</strong>
        </p>
      </fieldset>
      <fieldset
        disabled={pending}
        className="dashboard-panel grid gap-5 p-5 sm:grid-cols-2"
      >
        <legend className="px-2 text-lg font-bold">Hariç tutulanlar</legend>
        {(
          [
            ["excludedKeywords", "Anahtar kelimeler"],
            ["excludedTopics", "Konular"],
          ] as const
        ).map(([key, label]) => (
          <label key={key}>
            {label} (virgülle ayırın)
            <textarea
              rows={4}
              maxLength={12000}
              className={inputClass}
              value={settings[key].join(",")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [key]: e.target.value ? e.target.value.split(",") : [],
                })
              }
            />
          </label>
        ))}
      </fieldset>
      {!validation.success ? (
        <p role="alert" className="text-sm text-red-700">
          {validation.error.issues[0]?.message}
        </p>
      ) : null}
      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
      <button
        disabled={pending || !validation.success}
        className="primary-button"
      >
        {pending ? "Kaydediliyor…" : "Ayarları kaydet"}
      </button>
    </form>
  );
}
