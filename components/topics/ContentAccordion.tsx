"use client";

import { StudyContent } from "@/components/topics/StudyContent";
import { StrategyBox } from "@/components/topics/StrategyBox";
import { hasStrategyBoxes, parseStrategyBoxes } from "@/components/topics/parseStrategyBoxes";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AccordionSection } from "@/components/topics/parseAccordionSections";

export function ContentAccordion({
  sections,
  glossary = false,
}: {
  sections: AccordionSection[];
  glossary?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const open = index === openIndex;
        return (
          <div
            key={section.title}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-lg font-extrabold text-slate-900 transition hover:bg-blue-50/60 sm:text-xl"
            >
              {section.title}
              <ChevronDown
                className={`size-5 shrink-0 text-[color:var(--accent)] transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open ? (
              <div className="space-y-4 border-t border-slate-100 px-5 py-5">
                {hasStrategyBoxes(section.body) ? (
                  parseStrategyBoxes(section.body).map((segment, segmentIndex) =>
                    segment.kind === "box" ? (
                      <StrategyBox key={segmentIndex} boxType={segment.boxType} content={segment.content} />
                    ) : (
                      <StudyContent key={segmentIndex} text={segment.content} glossary={glossary} />
                    ),
                  )
                ) : (
                  <StudyContent text={section.body} glossary={glossary} />
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
