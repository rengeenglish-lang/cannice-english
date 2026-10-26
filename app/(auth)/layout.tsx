import Image from 'next/image';
import { Logo } from '@/components/brand/Logo';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-frame">
    <aside className="auth-story auth-photo-story">
      <Image src="/images/auth/auth-welcome.webp" alt="Yeşil tonlarında giyinmiş, gülümseyerek karşılayan bir kadın ve bir erkek" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover object-[center_34%]"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#083c31]/95 via-transparent to-[#083c31]/15"/>
      <div className="relative z-10"><Logo size={40} tone="dark"/></div>
      <div className="relative z-10 mt-auto"><h2>Hedefin belli.<br/>Sıradaki adımın burada.</h2><p className="mt-4 hidden text-sm leading-6 text-emerald-50 md:block">Kaynaklarını, derslerini ve ilerlemeni tek bir yerde takip et.</p></div>
    </aside>
    <div className="auth-form-panel flex flex-col justify-center">{children}</div>
  </main>;
}
