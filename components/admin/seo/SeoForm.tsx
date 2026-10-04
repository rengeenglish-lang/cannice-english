"use client";
import { startTransition, type ReactNode } from "react";
/** Keep pasted work on validation failure; reset only when the server revision changes. */
export function SeoForm({
  onSave,
  children,
  className,
  pending,
}: {
  onSave: (data: FormData) => void;
  children: ReactNode;
  className?: string;
  pending: boolean;
}) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => onSave(data));
      }}
    >
      <fieldset disabled={pending} className="min-w-0 space-y-4">
        {children}
      </fieldset>
    </form>
  );
}
