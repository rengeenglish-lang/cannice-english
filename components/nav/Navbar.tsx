import Link from "next/link";
import { auth } from "@/auth";
import { MobileNavToggle } from "@/components/nav/MobileNavToggle";
import { signOutAction } from "@/app/actions/sign-out";

const NAV_LINKS = [
  { href: "/packages", label: "Materyaller" },
  { href: "/konu-anlatim", label: "Konu Anlatım" },
  { href: "/books", label: "Kitaplar ve Kaynaklar" },
  { href: "/tools", label: "Faydalı Araçlar" },
  { href: "/#live-groups", label: "Canlı Gruplar" },
];

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
          {NAV_LINKS.map((link) => (
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
        />
      </div>
    </header>
  );
}
