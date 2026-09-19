import { Compass, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react";
import { HighlightedText } from "@/components/topics/StudyContent";
import type { StrategyBoxType } from "@/components/topics/parseStrategyBoxes";

const BOX_META: Record<
  StrategyBoxType,
  { label: string; icon: LucideIcon; border: string; headerBg: string; headerText: string; bodyBg: string }
> = {
  strateji: {
    label: "STRATEJİ",
    icon: Compass,
    border: "border-sky-400",
    headerBg: "bg-sky-100",
    headerText: "text-sky-900",
    bodyBg: "bg-sky-50/50",
  },
  "ornek-soru": {
    label: "ÖRNEK",
    icon: Lightbulb,
    border: "border-emerald-400",
    headerBg: "bg-emerald-100",
    headerText: "text-emerald-900",
    bodyBg: "bg-emerald-50/50",
  },
  dikkat: {
    label: "DİKKAT",
    icon: TriangleAlert,
    border: "border-amber-400",
    headerBg: "bg-amber-100",
    headerText: "text-amber-900",
    bodyBg: "bg-amber-50/50",
  },
};

/** Mirrors the source grammar book's own "► STRATEJİ ◄" / "ÖRNEK SORU" callout boxes. */
export function StrategyBox({ boxType, content }: { boxType: StrategyBoxType; content: string }) {
  const meta = BOX_META[boxType];
  const Icon = meta.icon;
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${meta.border} ${meta.bodyBg} shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)]`}>
      <div className={`flex items-center justify-center gap-2 border-b-2 ${meta.border} ${meta.headerBg} px-4 py-2.5`}>
        <Icon className={`size-5 ${meta.headerText}`} />
        <span className={`text-sm font-black uppercase tracking-wider ${meta.headerText}`}>
          ► {meta.label} ◄
        </span>
      </div>
      <div className="space-y-2.5 px-5 py-4 text-lg font-semibold leading-8 text-slate-800 sm:text-xl sm:leading-9">
        {lines.map((line, index) => {
          const isBullet = /^[•●]/.test(line);
          const clean = line.replace(/^[•●]\s*/, "");
          return (
            <p key={index} className={isBullet ? "pl-5" : undefined}>
              {isBullet ? "• " : ""}
              <HighlightedText text={clean} />
            </p>
          );
        })}
      </div>
    </div>
  );
}
