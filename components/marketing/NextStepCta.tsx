import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { formatTRY } from "@/lib/pricing";

/**
 * End-of-page "what now?" block for content that otherwise dead-ends (blog posts, free tools,
 * grammar, coaching): the free level test as the low-friction step and the plans as the purchase.
 * Logged-out visitors go through the free sign-up for the level test, which needs an account.
 */
export async function NextStepCta({
  title = "Sıradaki adım: seviyeni öğren, planını seç.",
  copy = "Ücretsiz seviye tespitiyle eksik konularını gör; sonra sana uygun planla deneme sınavlarına, konu anlatımlarına ve pratik sorulara eriş.",
  className = "mt-12",
}: {
  title?: string;
  copy?: string;
  className?: string;
}) {
  const [session, cheapestPlan] = await Promise.all([
    auth(),
    db.product.findFirst({ where: { category: "PLAN", isPublished: true }, orderBy: { salePrice: "asc" }, select: { salePrice: true } }),
  ]);
  const signedIn = Boolean(session?.user);
  const levelTestHref = signedIn ? "/seviye-tespit" : `/register?next=${encodeURIComponent("/seviye-tespit")}`;
  return (
    <section className={`rounded-[1.75rem] bg-[#071b34] p-6 text-white sm:p-8 ${className}`} aria-label="Sıradaki adım">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{copy}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={levelTestHref} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#071b34] transition hover:-translate-y-0.5">
          Ücretsiz seviye tespiti <ArrowRight size={17} />
        </Link>
        <Link href="/planlar" className="inline-flex min-h-12 items-center rounded-xl border border-white/30 px-5 text-sm font-black transition hover:bg-white/10">
          Planları incele
        </Link>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-blue-100">
        <Check size={15} aria-hidden="true" />
        {cheapestPlan ? `${formatTRY(String(cheapestPlan.salePrice))}'den başlayan planlar · ` : ""}14 gün iade hakkı
      </p>
    </section>
  );
}
