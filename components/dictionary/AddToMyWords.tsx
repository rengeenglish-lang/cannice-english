"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { markWordAction } from "@/app/actions/lexicon";

/** Puts a Kelime Motoru word on the learner's "Öğreniyorum" list. */
export function AddToMyWords({ wordId, signedIn, initial = false }: { wordId: string; signedIn: boolean; initial?: boolean }) {
  const [added, setAdded] = useState(initial);
  const [pending, start] = useTransition();
  if (!signedIn) {
    return (
      <Link href="/sign-in" className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--muted)] hover:text-[color:var(--accent)]">
        <BookmarkPlus size={14} aria-hidden="true" /> Listeme ekle
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={pending || added}
      onClick={() => start(async () => setAdded((await markWordAction(wordId, "LEARNING")).ok))}
      className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--accent)] disabled:text-emerald-700"
    >
      {added ? <BookmarkCheck size={14} aria-hidden="true" /> : <BookmarkPlus size={14} aria-hidden="true" />}
      {added ? "Listende" : "Listeme ekle"}
    </button>
  );
}
