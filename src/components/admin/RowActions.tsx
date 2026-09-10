"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type RowAction = {
  label: string;
  icon: string;
  action: () => Promise<void>;
  danger?: boolean;
  /** Message de confirmation affiché avant exécution. */
  confirm?: string;
};

/**
 * Menu d'actions d'une ligne de tableau.
 *
 * Les actions destructrices demandent une confirmation explicite, avec un
 * message qui nomme l'élément concerné plutôt qu'un « Êtes-vous sûr ? » sans
 * contexte.
 */
export function RowActions({
  editHref,
  items,
}: {
  editHref?: string;
  items: RowAction[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<RowAction | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = async (item: RowAction) => {
    setOpen(false);
    setPending(item.label);
    try {
      await item.action();
    } finally {
      setPending(null);
      setConfirming(null);
    }
  };

  return (
    <div ref={container} className="relative inline-flex items-center gap-1">
      {editHref ? (
        <Link
          href={editHref}
          className="inline-flex items-center gap-1 rounded-field border border-[color:var(--bordure)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:var(--surface)]"
        >
          <Icon name="SquarePen" className="size-3.5" />
          Modifier
        </Link>
      ) : null}

      {items.length > 0 ? (
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((value) => !value)}
          className="flex size-8 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface)]"
        >
          <Icon name={pending ? "Loader2" : "Sliders"} className={cn("size-3.5", pending && "animate-spin")} />
          <span className="sr-only">Autres actions</span>
        </button>
      ) : null}

      {open ? (
        <div
          role="menu"
          className="animate-glisse-bas absolute top-full right-0 z-40 mt-1 w-52 overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] py-1 shadow-menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => (item.confirm ? setConfirming(item) : void run(item))}
              className={cn(
                "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors",
                item.danger
                  ? "text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                  : "hover:bg-[color:var(--surface-alt)]",
              )}
            >
              <Icon name={item.icon} className="size-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmation"
          className="fixed inset-0 z-100 flex items-center justify-center bg-azur-950/55 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-5 text-left shadow-menu">
            <div className="flex gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
                <Icon name="TriangleAlert" className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold">{confirming.label}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                  {confirming.confirm}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="h-10 rounded-field px-4 text-sm font-semibold text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface-alt)]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void run(confirming)}
                className="inline-flex h-10 items-center gap-2 rounded-field bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Icon name={confirming.icon} className="size-4" />
                {confirming.label}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
