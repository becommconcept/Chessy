"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

type ToolbarAction =
  | { kind: "commande"; commande: string; valeur?: string; icone: string; libelle: string; raccourci?: string }
  | { kind: "lien"; icone: string; libelle: string }
  | { kind: "separateur" };

const TOOLBAR: ToolbarAction[] = [
  { kind: "commande", commande: "formatBlock", valeur: "p", icone: "Type", libelle: "Paragraphe" },
  { kind: "commande", commande: "formatBlock", valeur: "h2", icone: "Heading2", libelle: "Titre de niveau 2" },
  { kind: "commande", commande: "formatBlock", valeur: "h3", icone: "Heading3", libelle: "Titre de niveau 3" },
  { kind: "separateur" },
  { kind: "commande", commande: "bold", icone: "Bold", libelle: "Gras", raccourci: "Ctrl+B" },
  { kind: "commande", commande: "italic", icone: "Italic", libelle: "Italique", raccourci: "Ctrl+I" },
  { kind: "separateur" },
  { kind: "commande", commande: "insertUnorderedList", icone: "List", libelle: "Liste à puces" },
  { kind: "commande", commande: "insertOrderedList", icone: "ListOrdered", libelle: "Liste numérotée" },
  { kind: "commande", commande: "formatBlock", valeur: "blockquote", icone: "Quote", libelle: "Citation" },
  { kind: "separateur" },
  { kind: "lien", icone: "Link2", libelle: "Insérer un lien" },
  { kind: "commande", commande: "unlink", icone: "Unlink", libelle: "Supprimer le lien" },
  { kind: "separateur" },
  { kind: "commande", commande: "removeFormat", icone: "Eraser", libelle: "Effacer la mise en forme" },
];

/**
 * Éditeur de texte enrichi.
 *
 * Volontairement construit sur `contentEditable` plutôt que sur une
 * bibliothèque tierce : le besoin d'une mairie se limite à des paragraphes,
 * des intertitres, des listes, des liens et des tableaux simples. Le HTML
 * produit est assaini à la saisie comme à l'enregistrement, et un mode
 * « source » reste accessible pour les cas particuliers.
 *
 * Le collage est intercepté : seul le texte est conservé, ce qui évite de
 * ramener la mise en forme d'un document Word ou d'une page web.
 */
export function RichTextEditor({
  value,
  onChange,
  label,
  hint,
  minHeight = 220,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  minHeight?: number;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const id = useId();
  const [source, setSource] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedRange = useRef<Range | null>(null);

  /* Le contenu n'est injecté qu'à l'initialisation et lors d'un changement
     externe : réécrire innerHTML à chaque frappe déplacerait le curseur. */
  useEffect(() => {
    const node = editor.current;
    if (!node || source) return;
    if (node.innerHTML !== value) node.innerHTML = value || "<p><br /></p>";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    const node = editor.current;
    if (!node || source) return;
    // Synchronisation uniquement si la valeur diffère franchement (annulation,
    // chargement d'un autre bloc), pas à chaque saisie.
    if (document.activeElement !== node && node.innerHTML !== value) {
      node.innerHTML = value || "<p><br /></p>";
    }
  }, [value, source]);

  const emit = useCallback(() => {
    const node = editor.current;
    if (!node) return;
    onChange(sanitizeHtml(node.innerHTML));
  }, [onChange]);

  const run = (action: Extract<ToolbarAction, { kind: "commande" }>) => {
    editor.current?.focus();
    if (action.commande === "formatBlock") {
      document.execCommand("formatBlock", false, action.valeur);
    } else {
      document.execCommand(action.commande, false);
    }
    emit();
  };

  const openLinkDialog = () => {
    const selection = window.getSelection();
    savedRange.current = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    setLinkUrl("");
    setLinkOpen(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    setLinkOpen(false);
    if (!url) return;

    // Une saisie sans schéma est interprétée comme un lien interne ou un site.
    const href = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)
      ? url
      : url.includes("@")
        ? `mailto:${url}`
        : url.startsWith("www.")
          ? `https://${url}`
          : `/${url.replace(/^\/+/, "")}`;

    editor.current?.focus();
    if (savedRange.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange.current);
    }
    document.execCommand("createLink", false, href);
    emit();
  };

  const toggleSource = () => {
    if (source) {
      const cleaned = sanitizeHtml(sourceValue);
      onChange(cleaned);
      if (editor.current) editor.current.innerHTML = cleaned || "<p><br /></p>";
      setSource(false);
    } else {
      setSourceValue(value);
      setSource(true);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
      ) : null}
      {hint ? <p className="text-xs text-[color:var(--texte-doux)]">{hint}</p> : null}

      <div className="overflow-hidden rounded-field border border-[color:var(--bordure)] focus-within:border-azur-500 focus-within:ring-4 focus-within:ring-azur-500/12">
        {/* Barre d'outils */}
        <div
          role="toolbar"
          aria-label="Mise en forme du texte"
          aria-controls={id}
          className="flex flex-wrap items-center gap-0.5 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-1.5"
        >
          {TOOLBAR.map((action, index) =>
            action.kind === "separateur" ? (
              <span
                key={`sep-${index}`}
                aria-hidden
                className="mx-1 h-5 w-px bg-[color:var(--bordure)]"
              />
            ) : (
              <button
                key={`${action.libelle}-${index}`}
                type="button"
                disabled={source}
                onClick={() => (action.kind === "lien" ? openLinkDialog() : run(action))}
                title={
                  action.kind === "commande" && action.raccourci
                    ? `${action.libelle} (${action.raccourci})`
                    : action.libelle
                }
                className="flex size-8 items-center justify-center rounded text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--texte)] disabled:opacity-40"
              >
                <Icon name={action.icone} fallback="Type" className="size-4" />
                <span className="sr-only">{action.libelle}</span>
              </button>
            ),
          )}

          <button
            type="button"
            onClick={toggleSource}
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold transition-colors",
              source
                ? "bg-azur-600 text-white"
                : "text-[color:var(--texte-doux)] hover:bg-[color:var(--surface)] hover:text-[color:var(--texte)]",
            )}
          >
            <Icon name="Code" className="size-3.5" />
            {source ? "Revenir à l'éditeur" : "Code HTML"}
          </button>
        </div>

        {/* Zone d'édition */}
        {source ? (
          <textarea
            value={sourceValue}
            onChange={(event) => setSourceValue(event.target.value)}
            spellCheck={false}
            style={{ minHeight }}
            className="w-full resize-y bg-[color:var(--surface)] p-3.5 font-mono text-xs leading-relaxed focus:outline-none"
          />
        ) : (
          <div
            id={id}
            ref={editor}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={label ?? "Contenu"}
            style={{ minHeight }}
            onInput={emit}
            onBlur={emit}
            onPaste={(event) => {
              // Collage en texte brut : on ne ramène pas la mise en forme
              // d'origine, source première des contenus HTML illisibles.
              event.preventDefault();
              const text = event.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
              emit();
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                openLinkDialog();
              }
            }}
            className="contenu max-w-none bg-[color:var(--surface)] p-3.5 text-[0.9375rem] focus:outline-none"
          />
        )}
      </div>

      {/* Boîte d'insertion de lien */}
      {linkOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Insérer un lien"
          className="fixed inset-0 z-100 flex items-center justify-center bg-azur-950/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-5 shadow-menu">
            <h3 className="font-display text-base font-bold">Insérer un lien</h3>
            <p className="mt-1 text-xs text-[color:var(--texte-doux)]">
              Adresse complète (https://…), lien interne (/demarches), courriel ou téléphone.
            </p>
            <input
              type="text"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
                if (event.key === "Escape") setLinkOpen(false);
              }}
              autoFocus
              placeholder="/demarches/acte-de-naissance"
              className="mt-4 h-11 w-full rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-3.5 text-sm focus:border-azur-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkOpen(false)}
                className="h-10 rounded-field px-4 text-sm font-semibold text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface-alt)]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="h-10 rounded-field bg-azur-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-azur-700"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
