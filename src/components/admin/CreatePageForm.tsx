"use client";

import { useState } from "react";

import { creerPage } from "@/app/admin/actions-pages";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

/** Création d'une page, dans une boîte de dialogue légère. */
export function CreatePageForm({ parents }: { parents: Array<{ id: string; title: string }> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" icon="Plus" onClick={() => setOpen(true)}>
        Nouvelle page
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Créer une page"
          className="fixed inset-0 z-100 flex items-center justify-center bg-azur-950/55 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] shadow-menu">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
              <h2 className="font-display text-base font-bold">Créer une page</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded transition-colors hover:bg-[color:var(--surface)]"
              >
                <Icon name="X" className="size-4" />
                <span className="sr-only">Fermer</span>
              </button>
            </div>

            <form action={creerPage} className="space-y-4 p-5">
              <Field
                label="Titre de la page"
                htmlFor="nouvelle-page-titre"
                required
                hint="L'adresse de la page en sera déduite ; vous pourrez la modifier ensuite."
              >
                <Input
                  id="nouvelle-page-titre"
                  name="titre"
                  required
                  autoFocus
                  placeholder="Marché hebdomadaire"
                />
              </Field>

              <Field
                label="Rubrique parente"
                htmlFor="nouvelle-page-parent"
                hint="Laissez vide pour créer une rubrique de premier niveau."
              >
                <Select id="nouvelle-page-parent" name="parent" defaultValue="">
                  <option value="">Aucune (premier niveau)</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.title}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="flex justify-end gap-2 border-t border-[color:var(--bordure)] pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-field px-4 text-sm font-semibold text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface-alt)]"
                >
                  Annuler
                </button>
                <Button type="submit" icon="Plus">
                  Créer et ouvrir l'éditeur
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
