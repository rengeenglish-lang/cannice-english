import Link from "next/link";
import { after } from "next/server";
import { auth } from "@/auth";
import { cartItemCount } from "@/server/services/cart.service";
import { favoriteProductIds } from "@/server/services/favorites.service";
import { recordVisit } from "@/server/services/visits.service";
import { MobileNavToggle } from "@/components/nav/MobileNavToggle";
import { signOutAction } from "@/app/actions/sign-out";
import { ChevronDown, Heart, ShoppingCart } from "lucide-react";
import { PLATFORM_EXAMS, examGroupHref, examLearningHref, examMaterialHref } from "@/lib/platform";
import { Logo } from "@/components/brand/Logo";

const NAV_LINKS = [
  { href: "/exams", label: "Sınavlar" },
  { href: "/konu-anlatim", label: "Konu Anlatımları" },
  { href: "/group-lessons", label: "Grup Dersleri" },
  { href: "/planlar", label: "Planlar" },
  { href: "/kocluk", label: "Ücretsiz Koçluk" },
  { href: "/kaynaklar", label: "Kaynaklar" },
];

const YOKDIL_LINKS = [
  { href: "/exams/yokdil-sosyal-bilimler", label: "Sosyal Bilimler" },
  { href: "/exams/yokdil-saglik-bilimleri", label: "Sağlık Bilimleri" },
  { href: "/exams/yokdil-fen-bilimleri", label: "Fen Bilimleri" },
] as const;

export async function Navbar() {
  const session = await auth();
  const userId = session?.user?.id;
  const cartCount = await cartItemCount(userId).catch(() => 0);
  const favoriteCount = (await favoriteProductIds(userId).catch(() => new Set<string>())).size;
  // Every signed-in page view counts toward İlerleme Raporu → Site Ziyaret Sıklığı.
  if (userId) after(() => recordVisit(userId));
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Netfener ana sayfa">
          <Logo size={40} />
        </Link>
        <nav className="hidden items-center gap-4 xl:flex xl:gap-6">
          <div className="group relative">
            <Link href="/exams" className="nav-link flex items-center gap-1 whitespace-nowrap py-6 text-sm font-bold">Sınavlar <ChevronDown size={15} /></Link>
            <div className="invisible absolute left-1/2 top-full w-[760px] -translate-x-1/2 translate-y-2 rounded-2xl border border-[color:var(--border)] bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="grid w-[720px] grid-cols-5 gap-2 p-2">
                {PLATFORM_EXAMS.map((exam) => <div key={exam.slug} className="rounded-2xl p-3" style={{ background: exam.soft }}>
                  <Link href={`/exams/${exam.slug}`} className="text-base font-black" style={{ color: exam.color }}>{exam.name}</Link>
                  <div className="mt-3 space-y-1 text-xs font-bold text-slate-600">
                    <Link className="block rounded-lg px-2 py-2 hover:bg-white/80" href={examLearningHref(exam.slug)}>Konu anlatımları</Link>
                    <Link className="block rounded-lg px-2 py-2 hover:bg-white/80" href="/dashboard/practice">Pratik</Link>
                    <Link className="block rounded-lg px-2 py-2 hover:bg-white/80" href={examGroupHref(exam.slug)}>Grup dersleri</Link>
                    <Link className="block rounded-lg px-2 py-2 hover:bg-white/80" href={examMaterialHref(exam.slug)}>Paketler</Link>
                  </div>
                </div>)}
              </div>
            </div>
          </div>
          {NAV_LINKS.filter((link) => link.href !== "/exams").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link whitespace-nowrap py-6 text-sm font-bold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/dashboard/favoriler"
            className="ghost-button relative gap-2 whitespace-nowrap px-2.5"
            aria-label={favoriteCount ? `Favorilerim (${favoriteCount} ürün)` : "Favorilerim"}
          >
            <Heart size={18} aria-hidden="true" />
            {favoriteCount ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-black leading-5 text-white">
                {favoriteCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/cart"
            className="ghost-button relative gap-2 whitespace-nowrap"
            aria-label={cartCount ? `Sepet (${cartCount} ürün)` : "Sepet"}
          >
            <ShoppingCart size={18} aria-hidden="true" />
            Sepet
            {cartCount ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-black leading-5 text-white">
                {cartCount}
              </span>
            ) : null}
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
                href="/register"
                className="primary-button whitespace-nowrap"
              >
                Üye Ol
              </Link>
            </>
          )}
        </div>
        <MobileNavToggle
          links={NAV_LINKS}
          isSignedIn={Boolean(session?.user)}
          cartCount={cartCount}
          favoriteCount={favoriteCount}
          examLinks={PLATFORM_EXAMS.map((exam) => ({ href: `/exams/${exam.slug}`, label: exam.name }))}
          yokdilLinks={YOKDIL_LINKS}
        />
      </div>
    </header>
  );
}
