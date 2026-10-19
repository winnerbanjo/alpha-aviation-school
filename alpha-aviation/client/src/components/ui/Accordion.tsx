import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  allowMultiple?: boolean;
}

export function Accordion({ items, className, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(items.length > 0 ? [items[0].id] : []);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("divide-y divide-[#DCE2EB] border-y border-[#DCE2EB]", className)}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const controlId = `accordion-control-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="group">
            <h3>
              <button
                id={controlId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => toggle(item.id)}
                className="flex w-full items-start gap-5 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8] focus-visible:ring-offset-4"
              >
                <span className={cn("mt-1 w-7 shrink-0 text-xs font-semibold tabular-nums transition-colors", isOpen ? "text-[#1246C8]" : "text-[#53647C]/60")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={cn("flex-1 text-lg font-semibold leading-snug tracking-tight transition-colors sm:text-xl", isOpen ? "text-[#1246C8]" : "text-[#10264B] group-hover:text-[#1246C8]")}>
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-out-expo",
                    isOpen ? "rotate-180 border-[#1246C8] bg-[#1246C8] text-white" : "border-[#DCE2EB] text-[#10264B] group-hover:border-[#1246C8]"
                  )}
                >
                  <span className="absolute h-[2px] w-3 rounded bg-current" />
                  <span className={cn("absolute h-3 w-[2px] rounded bg-current transition-transform duration-500", isOpen && "scale-y-0")} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={controlId}
              hidden={!isOpen}
              className={cn("pb-6 pl-12 pr-4 sm:pr-12 motion-safe:animate-[riseIn_0.5s_cubic-bezier(.16,1,.3,1)_both]", !isOpen && "hidden")}
            >
              <div>
                <p className="max-w-2xl text-base leading-[1.75] text-[#53647C]">{item.answer}</p>
                {item.category && (
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1246C8]">{item.category}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
