import Link from "next/link";
import { CATEGORY_LABELS, POS_TR, type DictEntry } from "@/lib/dictionary";
import { termSlug } from "@/lib/dictionary/text";
import { Pronounce } from "@/components/dictionary/Pronounce";
import { AddToMyWords } from "@/components/dictionary/AddToMyWords";

const href = (term: string) => `/sozluk/${encodeURIComponent(termSlug(term))}`;

/** Turkish meanings as separate links, keeping the usage notes in parentheses. */
function TurkishLinks({ tr }: { tr: string }) {
  const parts = tr.split(/(;|,)/);
  return (
    <>
      {parts.map((p, i) => {
        if (p === ";" || p === ",") return <span key={i}>{p} </span>;
        const note = p.match(/^\s*(\([^)]*\))?\s*(.*?)\s*(\([^)]*\))?\s*$/);
        const term = note?.[2]?.trim();
        if (!term) return <span key={i}>{p}</span>;
        return (
          <span key={i}>
            {note?.[1] ? <span className="text-[color:var(--muted)]">{note[1]} </span> : null}
            <Link href={href(term)} className="hover:text-[color:var(--accent)] hover:underline">{term}</Link>
            {note?.[3] ? <span className="text-[color:var(--muted)]"> {note[3]}</span> : null}
          </span>
        );
      })}
    </>
  );
}

/**
 * Tureng-style result table: # · Kategori · İngilizce · Türkçe, one row per meaning, with the
 * example sentence, usage tip and the academic synonym folded under each row.
 */
export function ResultTable({
  title,
  rows,
  direction,
  signedIn,
  learning,
  start = 1,
}: {
  title: string;
  rows: DictEntry[];
  direction: "en-tr" | "tr-en";
  signedIn: boolean;
  learning: Set<string>;
  start?: number;
}) {
  if (!rows.length) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-[color:var(--brand)] text-left text-xs font-black uppercase tracking-wide text-white">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5">#</th>
              <th scope="col" className="hidden w-32 px-3 py-2.5 sm:table-cell">Kategori</th>
              <th scope="col" className="px-3 py-2.5">{direction === "en-tr" ? "İngilizce" : "Türkçe"}</th>
              <th scope="col" className="px-3 py-2.5">{direction === "en-tr" ? "Türkçe" : "İngilizce"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e, i) => {
              const en = (
                <div>
                  <Link href={href(e.en)} className="font-bold hover:text-[color:var(--accent)] hover:underline">{e.en}</Link>{" "}
                  <span className="text-xs italic text-[color:var(--muted)]">{POS_TR[e.pos] ?? e.pos}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Pronounce text={e.en} compact />
                    {e.level ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">{e.level}</span> : null}
                    {e.lexiconId ? <AddToMyWords wordId={e.lexiconId} signedIn={signedIn} initial={learning.has(e.lexiconId)} /> : null}
                  </div>
                </div>
              );
              const tr = (
                <div>
                  <TurkishLinks tr={e.tr} />
                  {e.syn ? <p className="mt-1 text-xs text-[color:var(--muted)]">Akademik karşılığı: <Link href={href(e.syn)} className="font-bold text-[color:var(--accent)]">{e.syn}</Link></p> : null}
                </div>
              );
              return (
                <tr key={e.id} className="border-t border-[color:var(--border)] align-top odd:bg-white even:bg-slate-50/70">
                  <td className="px-3 py-3 text-xs font-bold text-[color:var(--muted)]">{start + i}</td>
                  <td className="hidden px-3 py-3 text-xs font-bold text-[color:var(--muted)] sm:table-cell">{CATEGORY_LABELS[e.category]}</td>
                  <td className="px-3 py-3 [overflow-wrap:anywhere]">
                    <span className="mb-1 block text-[10px] font-black uppercase text-[color:var(--muted)] sm:hidden">{CATEGORY_LABELS[e.category]}</span>
                    {direction === "en-tr" ? en : tr}
                  </td>
                  <td className="px-3 py-3 [overflow-wrap:anywhere]">
                    {direction === "en-tr" ? tr : en}
                    {e.exampleEn ? (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer font-bold text-[color:var(--accent)]">Örnek cümle</summary>
                        <p className="mt-1 italic">{e.exampleEn}</p>
                        {e.exampleTr ? <p className="mt-0.5 text-[color:var(--muted)]">{e.exampleTr}</p> : null}
                        {e.tip ? <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-900">İpucu: {e.tip}</p> : null}
                      </details>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
