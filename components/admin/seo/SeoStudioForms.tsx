"use client";
import { SeoForm } from "./SeoForm";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  type StudioState,
  createSeoDraftAction,
  saveStudioAction,
} from "@/app/actions/admin-seo-studio";
import { INTENT_LABELS } from "@/lib/seo/keywords";
import type { Brand, StudioBrief, DraftContent } from "@/lib/seo/studio";
const field =
  "mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 focus-ring";
const initial: StudioState = { ok: false, message: "" };
function payload(mode: string, input: unknown) {
  const f = new FormData();
  f.set("mode", mode);
  f.set("payload", JSON.stringify(input));
  return f;
}
export function CreateSeoDraftButton({ keywordId }: { keywordId: string }) {
  const [state, action, pending] = useActionState(
    createSeoDraftAction,
    initial,
  );
  return (
    <SeoForm pending={pending} onSave={action}>
      <input type="hidden" name="keywordId" value={keywordId} />
      <button disabled={pending} className="primary-button">
        {pending ? "Açılıyor…" : "Brief oluştur / aç"}
      </button>
      <p role="status">{state.message}</p>
      {state.id ? (
        <Link className="ghost-button" href={`/admin/seo/studio/${state.id}`}>
          Makale çalışma alanını aç
        </Link>
      ) : null}
    </SeoForm>
  );
}
export function SeoBrandForm({
  initial: settings,
}: {
  initial: { revision: number; brand: Brand };
}) {
  const [state, action, pending] = useActionState(saveStudioAction, initial);
  return (
    <SeoForm
      pending={pending}
      key={settings.revision}
      onSave={(f) =>
        action(
          payload("brand", {
            revision: settings.revision,
            brand: {
              audience: f.get("audience"),
              voice: f.get("voice"),
              rules: f.get("rules"),
            },
          }),
        )
      }
      className="space-y-4"
    >
      <p className="text-sm">
        Bu alanlar kopyalanabilir ChatGPT istemine eklenir. Öğrenci bilgileri
        veya gizli veriler yazmayın.
      </p>
      {(
        [
          ["audience", "Hedef kitle", 2000],
          ["voice", "Marka dili ve üslubu", 2000],
          ["rules", "Editoryal kurallar", 4000],
        ] as const
      ).map(([name, label, max]) => (
        <label className="block" key={name}>
          {label}
          <textarea
            name={name}
            rows={3}
            maxLength={max}
            required={name !== "rules"}
            minLength={name !== "rules" ? 5 : undefined}
            defaultValue={settings.brand[name]}
            className={field}
          />
        </label>
      ))}
      <button className="primary-button" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Marka profilini kaydet"}
      </button>
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}
export function SeoBriefForm({
  id,
  revision,
  brief,
  ready,
  catalogue,
}: {
  id: string;
  revision: number;
  brief: StudioBrief;
  ready: boolean;
  catalogue: { id: string; title: string; url: string; access: string }[];
}) {
  const [state, action, pending] = useActionState(saveStudioAction, initial);
  const fields = [
    ["primaryKeyword", "Ana konu / anahtar kelime", 160, 1],
    ["languageCode", "Yazı dili", 20, 1],
    ["market", "Hedef ülke kodu", 2, 1],
    ["reader", "Hedef okuyucu", 1000, 2],
    ["problem", "Öğrencinin sorunu", 1000, 2],
    ["goal", "Öğrenme hedefi", 1000, 2],
    ["title", "Çalışma başlığı", 160, 1],
    ["secondaryKeywords", "İkincil anahtar kelimeler", 1500, 2],
    ["alternativeTitles", "Alternatif başlıklar", 1500, 2],
    ["outline", "Bölüm planı (her satıra bir başlık)", 6000, 5],
    ["questions", "Yanıtlanacak sorular", 3000, 3],
    ["differentiation", "Özgün katkı ve örnekler", 2000, 3],
    ["sources", "Kaynaklar ve doğrulama notları", 5000, 4],
    ["ctaText", "Önerilen sonraki adım metni", 250, 1],
  ] as const;
  return (
    <SeoForm
      pending={pending}
      key={revision}
      onSave={(f) => {
        const values = Object.fromEntries(
          fields.map(([name]) => [name, String(f.get(name) || "")]),
        );
        action(
          payload("brief", {
            id,
            revision,
            ready: f.get("ready") === "on",
            brief: {
              ...values,
              intent: f.get("intent"),
              ctaItemId: f.get("ctaItemId"),
              minWords: Number(f.get("minWords")),
              maxWords: Number(f.get("maxWords")),
            },
          }),
        );
      }}
      className="space-y-4"
    >
      <p className="text-sm">
        Önce okuyucu ihtiyacını ve kaynakları belirleyin. Hazır işaretlemeden
        eksik briefi kaydedebilirsiniz.
      </p>
      {fields.map(([name, label, max, rows]) => (
        <label key={name} className="block">
          {label}
          {rows === 1 ? (
            <input
              className={field}
              name={name}
              maxLength={max}
              defaultValue={brief[name]}
            />
          ) : (
            <textarea
              className={field}
              name={name}
              rows={rows}
              maxLength={max}
              defaultValue={brief[name]}
            />
          )}
        </label>
      ))}
      <label className="block">
        Arama amacı
        <select aria-label="Arama amacı" name="intent" defaultValue={brief.intent} className={field}>
          {Object.entries(INTENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Mevcut Netfener sayfası (isteğe bağlı, ilk 200 kayıt)
        <select
          aria-label="Mevcut Netfener sayfası"
          name="ctaItemId"
          defaultValue={brief.ctaItemId}
          className={field}
        >
          <option value="">Bağlantı önerme</option>
          {catalogue.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} · {c.access}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          En az kelime
          <input
            className={field}
            type="number"
            min={100}
            max={5000}
            name="minWords"
            defaultValue={brief.minWords}
            required
          />
        </label>
        <label>
          En çok kelime
          <input
            className={field}
            type="number"
            min={100}
            max={10000}
            name="maxWords"
            defaultValue={brief.maxWords}
            required
          />
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="ready" defaultChecked={ready} />
        Brief tamamlandı; taslak yazmaya hazır
      </label>
      <button className="primary-button" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Briefi kaydet"}
      </button>
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}
export function SeoManualPrompt({ text }: { text: string }) {
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-3">
      <ol className="list-decimal space-y-2 pl-5">
        <li>İstemi kopyalayıp ChatGPT’ye yapıştırın.</li>
        <li>Üretilen yazıyı ve kaynakları kontrol edin.</li>
        <li>
          Yalnızca MAKALE bölümünü aşağıdaki metin alanına, diğer alanları ayrı
          kutulara yapıştırın.
        </li>
      </ol>
      <label className="block">
        ChatGPT için hazır istem
        <textarea readOnly value={text} rows={9} className={field} />
      </label>
      <button
        type="button"
        className="ghost-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setMessage("İstem kopyalandı.");
          } catch {
            setMessage("Otomatik kopyalanamadı. Metni seçip elle kopyalayın.");
          }
        }}
      >
        İstemi kopyala
      </button>
      <p role="status">{message}</p>
      <p className="text-sm">
        API çağrısı yapılmaz. ChatGPT’ye hiçbir veri otomatik gönderilmez.
      </p>
    </div>
  );
}
export function SeoArticleForm({
  id,
  revision,
  postUpdatedAt,
  post,
}: {
  id: string;
  revision: number;
  postUpdatedAt: string;
  post: DraftContent;
}) {
  const [state, action, pending] = useActionState(saveStudioAction, initial);
  const fields = [
    ["title", "Makale başlığı", 160, 1],
    ["slug", "URL kısa adı", 160, 1],
    ["excerpt", "Kısa özet", 300, 3],
    ["seoTitle", "SEO başlığı", 160, 1],
    ["seoDescription", "SEO açıklaması", 300, 3],
    ["content", "Makale metni (ChatGPT’den buraya yapıştırın)", 100000, 22],
  ] as const;
  return (
    <SeoForm
      pending={pending}
      key={`${revision}:${postUpdatedAt}`}
      onSave={(f) =>
        action(
          payload("content", {
            id,
            revision,
            postUpdatedAt,
            post: Object.fromEntries(
              fields.map(([name]) => [name, String(f.get(name) || "")]),
            ),
          }),
        )
      }
      className="space-y-4"
    >
      <p className="text-sm">
        Düz metin kullanın; başlıkları ayrı satıra yazın ve paragrafları boş
        satırla ayırın. Kaydetmek yayınlamaz.
      </p>
      {fields.map(([name, label, max, rows]) => (
        <label className="block" key={name}>
          {label}
          {rows === 1 ? (
            <input
              className={field}
              name={name}
              defaultValue={post[name]}
              maxLength={max}
              required={name === "title" || name === "slug"}
              pattern={name === "slug" ? "[a-z0-9-]{3,160}" : undefined}
            />
          ) : (
            <textarea
              className={field}
              name={name}
              rows={rows}
              maxLength={max}
              defaultValue={post[name]}
            />
          )}
        </label>
      ))}
      <button className="primary-button" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Taslağı ve metaverileri kaydet"}
      </button>
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}
export function SeoReviewForm({
  id,
  revision,
  postUpdatedAt,
  eligible,
}: {
  id: string;
  revision: number;
  postUpdatedAt: string;
  eligible: boolean;
}) {
  const [state, action, pending] = useActionState(saveStudioAction, initial);
  return (
    <SeoForm
      pending={pending}
      key={revision}
      className="space-y-3"
      onSave={(f) =>
        action(
          payload("review", {
            id,
            revision,
            postUpdatedAt,
            factsChecked: f.get("factsChecked") === "on",
          }),
        )
      }
    >
      <label className="flex items-start gap-2">
        <input type="checkbox" name="factsChecked" required className="mt-1" />
        Kaydedilmiş yazının sınav bilgilerini, örneklerini, cevaplarını ve
        kaynaklarını kontrol ettim.
      </label>
      <button className="primary-button" disabled={pending || !eligible}>
        {pending ? "Kaydediliyor…" : "Editör incelemesini kaydet"}
      </button>
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}
