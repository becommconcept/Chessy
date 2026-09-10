"use client";

import { useId, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type AccordionItem = { question: string; answer: string };

/**
 * Accordéon accessible : chaque en-tête est un bouton portant
 * `aria-expanded` et `aria-controls`, navigable au clavier.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="divide-y divide-[color:var(--bordure)] overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)]">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={`${baseId}-${index}`}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`${baseId}-panneau-${index}`}
                id={`${baseId}-entete-${index}`}
                onClick={() => setOpen(expanded ? null : index)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left transition-colors sm:px-6",
                  expanded
                    ? "bg-azur-50/70 dark:bg-azur-900/30"
                    : "hover:bg-[color:var(--surface-alt)]",
                )}
              >
                <span className="font-display text-[1.0625rem] font-semibold text-azur-800 dark:text-white">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-douce",
                    expanded
                      ? "rotate-180 border-azur-500 bg-azur-500 text-white"
                      : "border-[color:var(--bordure)] text-azur-600 dark:text-azur-200",
                  )}
                >
                  <Icon name="ChevronDown" className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={`${baseId}-panneau-${index}`}
              role="region"
              aria-labelledby={`${baseId}-entete-${index}`}
              hidden={!expanded}
              className="animate-glisse-bas px-5 pb-5.5 sm:px-6"
            >
              <div
                className="contenu max-w-2xl text-[0.9688rem]"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
