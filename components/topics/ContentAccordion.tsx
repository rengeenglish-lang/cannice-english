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
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left text-xl font-bold text-slate-950 transition hover:bg-slate-50 sm:px-8"
            >
              {section.title}
              <ChevronDown
                className={`size-5 shrink-0 text-[color:var(--accent)] transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open ? (
              <div className="space-y-6 border-t border-slate-200 px-6 py-6 sm:px-8 sm:py-7">
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
