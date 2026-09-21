"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import type { ReviewFormState } from "@/app/actions/reviews";

const initialState: ReviewFormState = { status: "idle" };

export function ReviewForm({
  action,
  existingRating,
  existingComment,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  existingRating?: number;
  existingComment?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hovered, setHovered] = useState(0);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Puan">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${value} yıldız`}
            aria-pressed={rating === value}
            className="p-0.5"
          >
            <Star
              size={22}
              className={(hovered || rating) >= value ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-[color:var(--border-strong)]"}
            />
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={3}
        defaultValue={existingComment ?? ""}
        placeholder="Bu kurs/materyal hakkında ne düşünüyorsunuz? (opsiyonel)"
        className="auth-input"
      />
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "idle" && state.message ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}
      <button type="submit" disabled={pending || rating === 0} className="primary-button">
        {pending ? "Kaydediliyor…" : "Yorumu Kaydet"}
      </button>
    </form>
  );
}
