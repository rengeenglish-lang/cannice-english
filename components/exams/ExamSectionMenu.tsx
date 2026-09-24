"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Calculator, ChevronDown, CircleDollarSign, ClipboardCheck, FilePenLine, Headphones, Home, Info, LayoutList, Mail, Menu, MessageSquareText, Mic2, Newspaper, NotebookTabs, Send, Sparkles, Timer, TrendingUp, X } from "lucide-react";
import type { ExamFamily } from "@/lib/generated/prisma/enums";
import { examLearningHref } from "@/lib/platform";

type MenuProps = { examName: string; slug: string; speakingHref?: string; examFamily?: ExamFamily };

export function ExamSectionMenu(props: MenuProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();

  return <>
    <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] overflow-y-auto bg-[#061f3f] px-4 py-6 text-white lg:block"><MenuContent {...props} /></aside>
    <button type="button" onClick={() => { dialog.current?.showModal(); setOpen(true); }} className="fixed bottom-5 left-5 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#061f3f] px-5 py-3 text-sm font-extrabold text-white shadow-xl lg:hidden" aria-expanded={open} aria-controls="exam-section-menu"><Menu size={19} /> Exam Menu</button>
    <dialog ref={dialog} id="exam-section-menu" aria-label={`${props.examName} menüsü`} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) close(); }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(320px,88vw)] max-w-none border-0 bg-[#061f3f] p-0 text-white backdrop:bg-black/45 lg:hidden">
      <div className="flex min-h-full flex-col px-4 py-5"><button type="button" onClick={close} aria-label="Menüyü kapat" className="mb-3 ml-auto grid size-11 place-items-center rounded-xl text-white hover:bg-white/10"><X /></button><MenuContent {...props} onNavigate={close} /></div>
    </dialog>
  </>;
}

function MenuContent({ examName, slug, speakingHref, examFamily = "ACADEMIC_SKILLS", onNavigate }: MenuProps & { onNavigate?: () => void }) {
  const overview = `/exams/${slug}`;
  const isTranslationGrammar = examFamily === "TRANSLATION_GRAMMAR";

  const groups = isTranslationGrammar
    ? [
        { label: "Denemeler", icon: Send, href: `/packages?exam=${slug}`, child: "Deneme ve paketler" },
        { label: "Seviye Tespit", icon: ClipboardCheck, href: "/seviye-tespit", child: "Eksiklerini bul" },
        { label: "Pratik Sorular", icon: LayoutList, href: "/dashboard/practice", child: "Konu bazlı pratik" },
        { label: "Konu Anlatımı", icon: NotebookTabs, href: examLearningHref(slug), child: "Gramer ve çeviri konuları" },
      ]
    : [
        { label: "Seviye Tespit", icon: ClipboardCheck, href: "/seviye-tespit", child: "Reading eksiğini bul" },
        { label: "Pratik Sorular", icon: LayoutList, href: "/dashboard/practice", child: "Reading pratiği" },
        { label: "Deneme Sınavı", icon: Timer, href: "/dashboard/mock-exam", child: "Reading bölümü denemesi" },
        { label: "Full Test", icon: Send, href: `/packages?exam=${slug}`, child: "Deneme ve paketler" },
        { label: "Reading", icon: BookOpen, href: overview, child: "Bölüm yapısı" },
        { label: "Listening", icon: Headphones, href: overview, child: "Bölüm yapısı" },
        { label: "Writing", icon: FilePenLine, href: overview, child: "Bölüm yapısı" },
        { label: "Speaking", icon: Mic2, href: speakingHref ?? overview, child: speakingHref ? "Speaking pratiği" : "Bölüm yapısı" },
      ];

  const links = [
    ...(isTranslationGrammar ? [] : [{ label: "Study Course", icon: NotebookTabs, href: examLearningHref(slug) }]),
    ...(isTranslationGrammar || !speakingHref ? [] : [{ label: "AI Speaking Tutor", icon: Mic2, href: speakingHref, badge: "NEW" }]),
    { label: "İlerleme", icon: TrendingUp, href: "/dashboard/history" },
    { label: "Score Calculator", icon: Calculator, href: "/tools/score-calculator" },
    { label: "About Us", icon: Info, href: "/about" },
    { label: "Contact Us", icon: Mail, href: "/about" },
    { label: "Blog", icon: Newspaper, href: "/blog" },
    { label: "Pricing", icon: CircleDollarSign, href: "/packages" },
    { label: "Partnership Enquiries", icon: MessageSquareText, href: "/about" },
  ];
  return <nav aria-label={`${examName} çalışma menüsü`}>
    <div className="mb-5 border-b border-white/10 px-3 pb-5"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-cyan-300">Netfener Exams</p><p className="mt-2 font-black text-white">{examName}</p></div>
    <Link href="/" onClick={onNavigate} className="exam-workspace-link"><Home size={18} /> Home</Link>
    {groups.map(({ label, icon: Icon, href, child }) => <details key={label} className="group/menu"><summary className="exam-workspace-link cursor-pointer list-none"><Icon size={18} /> <span className="flex-1">{label}</span><ChevronDown size={15} className="transition group-open/menu:rotate-180" /></summary><Link href={href} onClick={onNavigate} className="mx-3 mb-1 block rounded-lg border-l border-cyan-300/40 py-2 pl-7 text-xs font-semibold text-blue-200 hover:text-white">{child}</Link></details>)}
    <div className="my-3 border-t border-white/10" />
    {links.map(({ label, icon: Icon, href, badge }) => <Link key={label} href={href} onClick={onNavigate} className="exam-workspace-link"><Icon size={18} /><span className="flex-1">{label}</span>{badge ? <span className="rounded-md bg-cyan-400 px-2 py-1 text-[11px] font-black text-[#061f3f]">{badge}</span> : null}</Link>)}
    <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-xs text-blue-200"><Sparkles size={16} className="text-cyan-300" /> Sınavınıza özel çalışma alanı</div>
  </nav>;
}
