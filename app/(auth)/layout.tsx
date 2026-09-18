import { BookOpen, CheckCircle2 } from "lucide-react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-frame">
      <aside className="auth-story">
        <div className="flex items-center gap-3 text-sm font-bold">
          <BookOpen aria-hidden="true" /> CANNICE ENGLISH
        </div>
        <div>
          <h2>
            Hedefiniz belli.
            <br />
            Sıradaki adımınız burada.
          </h2>
          <p className="mt-5 text-base leading-7 text-blue-100">
            Kaynaklarınızı, derslerinizi ve ilerlemenizi tek bir yerde takip
            edin.
          </p>
        </div>
        <div className="space-y-4 text-sm text-blue-100">
          {[
            "Kendi temponuzda çalışma",
            "Canlı grup dersleri",
            "Düzenli ilerleme takibi",
          ].map((text) => (
            <p key={text} className="flex items-center gap-3">
              <CheckCircle2 size={18} aria-hidden="true" />
              {text}
            </p>
          ))}
        </div>
      </aside>
      <div className="auth-form-panel flex flex-col justify-center">
        {children}
      </div>
    </main>
  );
}
