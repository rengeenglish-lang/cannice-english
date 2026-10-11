"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { resendVerificationAction, type ResendVerificationState } from "@/app/actions/email-verification";

const MESSAGES: Record<ResendVerificationState["status"], string | null> = {
  idle: null,
  sent: "Yeni doğrulama bağlantısı gönderildi. Gelen kutunu (ve Spam klasörünü) kontrol et.",
  verified: "E-posta adresin zaten doğrulanmış. Sayfayı yenileyebilirsin.",
  limited: "Son bir saatte birkaç bağlantı gönderdik. Lütfen biraz sonra tekrar dene.",
  failed: "E-posta şu an gönderilemedi. Lütfen biraz sonra tekrar dene.",
};

/** Shown in the dashboard until the student opens the link from their welcome email. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, { status: "idle" } as ResendVerificationState);
  const message = MESSAGES[state.status];
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="region" aria-label="E-posta doğrulama">
      <MailCheck size={20} aria-hidden="true" className="shrink-0 text-amber-700" />
      <p className="min-w-0 flex-1">
        <strong>E-posta adresini doğrula.</strong> {email} adresine gönderdiğimiz bağlantıya tıkla; şifreni unutursan hesabına bu adresle geri dönebilirsin.
        {message ? <span className="mt-1 block font-semibold" role="status">{message}</span> : null}
      </p>
      {state.status !== "sent" && state.status !== "verified" ? (
        <form action={formAction}>
          <button type="submit" disabled={pending} className="secondary-button text-xs">
            {pending ? "Gönderiliyor…" : "Bağlantıyı tekrar gönder"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
