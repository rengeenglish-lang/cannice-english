"use client";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Home,
  UserRound,
  ShoppingBag,
  Calculator,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Settings,
  Mic2,
  ClipboardCheck,
  ListChecks,
  TrendingUp,
  History,
  Timer,
} from "lucide-react";
import { signOutAction } from "@/app/actions/sign-out";
import type { ExamFamily } from "@/lib/generated/prisma/enums";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

/**
 * Nav adapts to the student's active exam goal: once a goal is set (either family — both
 * TRANSLATION_GRAMMAR and ACADEMIC_SKILLS now have a live diagnostic/practice/mock-exam/progress
 * system), those links lead and Konu Anlatımı moves down — not deleted, just de-emphasized, per
 * the "don't display irrelevant features" requirement. Konuşma pratiği only applies to the
 * ACADEMIC_SKILLS family (IELTS/TOEFL specifically have the AI tutor; PTE doesn't, but the link
 * itself is still harmless to show). No goal yet keeps today's generic order, since we don't yet
 * know which exam's diagnostic to link to.
 */
function learningNav(examFamily: ExamFamily | null) {
  const base = [{ href: "/dashboard", label: "Çalışma alanım", icon: Home }, { href: "/dashboard/lessons", label: "Derslerim", icon: BookOpen }, { href: "/dashboard/live-sessions", label: "Canlı ders takvimi", icon: CalendarDays }];
  const shared = [
    { href: "/tools/score-calculator", label: "Puan hesaplama", icon: Calculator },
    { href: "/packages", label: "Kaynakları keşfet", icon: ShoppingBag },
  ];
  const diagnosticJourney = [
    { href: "/seviye-tespit", label: "Seviye Tespit", icon: ClipboardCheck },
    { href: "/dashboard/mock-exam", label: "Deneme Sınavı", icon: Timer },
    { href: "/dashboard/practice", label: "Pratik Sorular", icon: ListChecks },
    { href: "/dashboard/progress", label: "İlerleme", icon: TrendingUp },
    { href: "/dashboard/history", label: "Geçmiş Sorular", icon: History },
  ];
  if (examFamily === "TRANSLATION_GRAMMAR") {
    return [...base, ...diagnosticJourney, { href: "/konu-anlatim", label: "Konu anlatımları", icon: BookOpen }, ...shared];
  }
  if (examFamily === "ACADEMIC_SKILLS") {
    return [...base, ...diagnosticJourney, { href: "/dashboard/speaking-practice", label: "Konuşma pratiği", icon: Mic2 }, { href: "/konu-anlatim", label: "Konu anlatımları", icon: BookOpen }, ...shared];
  }
  return [...base, { href: "/dashboard/speaking-practice", label: "Konuşma pratiği", icon: Mic2 }, { href: "/konu-anlatim", label: "Konu anlatımları", icon: BookOpen }, ...shared];
}
const ACCOUNT = [
  { href: "/dashboard/profile", label: "Hesap bilgilerim", icon: UserRound },
  { href: "/dashboard/orders", label: "Siparişlerim", icon: ShoppingBag },
  { href: "/faq", label: "Yardım ve sorular", icon: HelpCircle },
];
const STAFF = [
  ["/admin", "Genel bakış"],
  ["/admin/analitik", "Analitik"],
  ["/admin/students", "Öğrenciler"],
  ["/admin/orders", "Siparişler"],
  ["/admin/coupons", "Kuponlar"],
  ["/admin/products", "Ürünler"],
  ["/admin/group-availability", "Grup uygunluğu"],
  ["/admin/konu-anlatim", "Konu anlatımı"],
  ["/admin/diagnostik/konular", "Seviye tespit konuları"],
  ["/admin/diagnostik/sorular", "Seviye tespit soruları"],
  ["/admin/diagnostik/degerlendirmeler", "Seviye tespit değerlendirmeleri"],
  ["/admin/testimonials", "Katılımcı görüşleri"],
  ["/admin/blog", "Blog"],
  ["/admin/submissions", "Değerlendirmeler"],
  ["/admin/leads", "Gelen talepler"],
  ["/admin/settings", "Ödeme Ayarları"],
];

function SidebarContent({
  role,
  examFamily,
  onNavigate,
}: {
  role: Role;
  examFamily: ExamFamily | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const active = (href: string) =>
    !href.includes("#") &&
    (pathname === href ||
      (href !== "/dashboard" &&
        href !== "/admin" &&
        pathname.startsWith(href + "/")));
  return (
    <>
      <Link
        href={isAdmin ? "/admin" : "/dashboard"}
        onClick={onNavigate}
        className="mb-7 flex items-center gap-3 px-3 py-2 text-white"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-white/15 font-extrabold">
          C
        </span>
        <span className="text-sm font-extrabold">
          Cannice English
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-widest text-blue-200">
            {isAdmin ? "Yönetim paneli" : "Öğrenme alanınız"}
          </span>
        </span>
      </Link>
      <nav aria-label={isAdmin ? "Yönetim menüsü" : "Öğrenci menüsü"} className="space-y-6">
        {(isAdmin ? [] : [
          { label: "ÖĞRENME", items: learningNav(examFamily) },
          { label: "HESABINIZ", items: ACCOUNT },
        ]).map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-blue-200/80">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active(href) ? "page" : undefined}
                  className={
                    "dashboard-nav-item " +
                    (active(href) ? "dashboard-nav-item-active" : "")
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        {role !== "STUDENT" ? (
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-blue-200/80">
              YÖNETİM
            </p>
            {STAFF.filter(([href]) => role === "ADMIN" || href !== "/admin/group-availability").map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active(href) ? "page" : undefined}
                className={
                  "dashboard-nav-item " +
                  (active(href) ? "dashboard-nav-item-active" : "")
                }
              >
                <Settings size={17} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
      <form
        action={signOutAction}
        className="mt-auto border-t border-white/15 pt-5 mt-8"
      >
        <button type="submit" className="dashboard-nav-item w-full">
          <LogOut size={18} aria-hidden="true" />
          Çıkış yap
        </button>
      </form>
    </>
  );
}
export function DashboardShell({
  role,
  examFamily = null,
  children,
}: {
  role: Role;
  examFamily?: ExamFamily | null;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();
  const isAdmin = role === "ADMIN";
  const menuLabel = isAdmin ? "Yönetim menüsü" : "Öğrenci menüsü";
  return (
    <div className="dashboard-frame lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="dashboard-sidebar hidden p-4 lg:flex">
        <SidebarContent role={role} examFamily={examFamily} />
      </aside>
      <dialog
        ref={dialog}
        id="learning-menu"
        aria-label={menuLabel}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(320px,90vw)] max-w-none border-0 bg-[color:var(--brand)] p-0 text-white backdrop:bg-black/40 lg:hidden"
      >
        <div className="dashboard-sidebar relative h-full w-full p-4">
          <button
            onClick={close}
            aria-label="Menüyü kapat"
            className="mb-3 ml-auto rounded-lg p-2 text-white focus-ring"
          >
            <X size={22} />
          </button>
          <SidebarContent role={role} examFamily={examFamily} onNavigate={close} />
        </div>
      </dialog>
      <div className="flex min-w-0 flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-[color:var(--border)] bg-white px-4 lg:hidden">
          <button
            type="button"
            aria-label={`${menuLabel}nü aç`}
            aria-expanded={open}
            aria-controls="learning-menu"
            onClick={() => {
              dialog.current?.showModal();
              setOpen(true);
            }}
            className="ghost-button"
          >
            <Menu size={21} />
          </button>
          <span className="text-sm font-bold">{isAdmin ? "Yönetim Paneli" : "Çalışma alanım"}</span>
        </div>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
