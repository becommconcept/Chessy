"use client";

import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TabItem = { label: string; html: string };

/**
 * Onglets conformes au motif ARIA « tabs » : navigation aux flèches,
 * `aria-selected` et association panneau/onglet.
 */
export function Tabs({ items }: { items: TabItem[] }) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  if (items.length === 0) return null;

  const move = (direction: 1 | -1) => {
    const next = (active + direction + items.length) % items.length;
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Sections"
        className="-mx-1 flex gap-1 overflow-x-auto border-b border-[color:var(--bordure)] px-1 pb-px"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {items.map((item, index) => (
          <button
            key={`${baseId}-onglet-${index}`}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${baseId}-onglet-${index}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panneau-${index}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors",
              active === index
                ? "border-dore-500 text-azur-800 dark:text-white"
                : "border-transparent text-[color:var(--texte-doux)] hover:border-[color:var(--bordure)] hover:text-[color:var(--texte)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {items.map((item, index) => (
        <div
          key={`${baseId}-panneau-${index}`}
          id={`${baseId}-panneau-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-onglet-${index}`}
          hidden={active !== index}
          tabIndex={0}
          className="contenu animate-apparition pt-7"
          dangerouslySetInnerHTML={{ __html: item.html }}
        />
      ))}
    </div>
  );
}
