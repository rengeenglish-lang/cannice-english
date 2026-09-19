import Link from "next/link";
import { auth } from "@/auth";
import { MobileNavToggle } from "@/components/nav/MobileNavToggle";
import { signOutAction } from "@/app/actions/sign-out";
import { ChevronDown, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/exams", label: "Exams" },
  { href: "/kaynaklar", label: "Kaynaklar" },
  { href: "/tools", label: "Faydalı Araçlar" },
  { href: "/#live-groups", label: "Canlı Gruplar" },
];

const EXAM_LINKS = [
  { href: "/exams/toefl", label: "TOEFL" },
  { href: "/exams/yds", label: "YDS" },
] as const;

const YOKDIL_LINKS = [
  { href: "/exams/yokdil-sosyal-bilimler", label: "Sosyal Bilimler" },
  { href: "/exams/yokdil-saglik-bilimleri", label: "Sağlık Bilimleri" },
  { href: "/exams/yokdil-fen-bilimleri", label: "Fen Bilimleri" },
] as const;

export async function Navbar() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--brand)] text-lg font-extrabold text-white">
            C
          </span>
          <span className="whitespace-nowrap text-lg font-extrabold tracking-[-.01em] text-[color:var(--foreground)]">
            Cannice{" "}
            <span className="text-[color:var(--accent-strong)]">English</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 xl:flex xl:gap-6">
          <div className="group relative">
            <Link href="/exams" className="flex items-center gap-1 whitespace-nowrap py-6 text-sm font-bold text-[color:var(--muted)] transition hover:text-[color:var(--brand)]">Exams <ChevronDown size={15} /></Link>
            <div className="invisible absolute left-0 top-full w-60 translate-y-2 rounded-2xl border border-[color:var(--border)] bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {EXAM_LINKS.map((link) => <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-sm font-bold hover:bg-[color:var(--brand-soft)]">{link.label}</Link>)}
              <div className="group/yokdil relative">
                <Link href="/exams/yokdil" className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold hover:bg-[color:var(--brand-soft)]">YÖKDİL <ChevronRight size={15} /></Link>
                <div className="invisible absolute left-full top-0 ml-1 w-56 translate-x-2 rounded-2xl border border-[color:var(--border)] bg-white p-2 opacity-0 shadow-xl transition group-hover/yokdil:visible group-hover/yokdil:translate-x-0 group-hover/yokdil:opacity-100 group-focus-within/yokdil:visible group-focus-within/yokdil:translate-x-0 group-focus-within/yokdil:opacity-100">
                  {YOKDIL_LINKS.map((link) => <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-sm font-bold hover:bg-[color:var(--brand-soft)]">{link.label}</Link>)}
                </div>
              </div>
            </div>
          </div>
          {NAV_LINKS.filter((link) => link.href !== "/exams").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-bold text-[color:var(--muted)] transition hover:text-[color:var(--brand)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/cart"
            className="ghost-button whitespace-nowrap"
            aria-label="Sepet"
          >
            Sepet
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="secondary-button whitespace-nowrap"
              >
                Hesabım
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="ghost-button whitespace-nowrap"
                >
                  Çıkış Yap
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="ghost-button whitespace-nowrap">
                Üye Girişi
              </Link>
              <Link
                href="/#sample"
                className="primary-button whitespace-nowrap"
              >
                Örnek İçerik
              </Link>
            </>
          )}
        </div>
        <MobileNavToggle
          links={NAV_LINKS}
          isSignedIn={Boolean(session?.user)}
          examLinks={EXAM_LINKS}
          yokdilLinks={YOKDIL_LINKS}
        />
      </div>
    </header>
  );
}
