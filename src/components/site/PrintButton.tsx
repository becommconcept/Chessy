"use client";

import { Icon } from "@/components/ui/Icon";

/** Déclenche l'impression de la page courante (feuille de style dédiée). */
export function PrintButton({ label = "Imprimer cette fiche" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="sans-impression flex w-full items-center justify-center gap-2 rounded-field border border-[color:var(--bordure)] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
    >
      <Icon name="Printer" className="size-4" />
      {label}
    </button>
  );
}
