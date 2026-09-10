"use client";

import { useCallback, useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn, formatFileSize } from "@/lib/utils";

export type MediaEntry = {
  id: string;
  url: string;
  filename: string;
  alt: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: string;
  credit: string | null;
};

export type MediaValue = { id?: string | null; url: string; alt?: string } | null;

/**
 * Sélecteur de média.
 *
 * Affiche la valeur courante, ouvre la médiathèque pour en choisir une autre,
 * et permet de téléverser un fichier sans quitter le formulaire. Le texte
 * alternatif est éditable sur place : c'est le moment où l'on sait ce que
 * l'image montre, donc le bon moment pour le renseigner.
 */
export function MediaPicker({
  value,
  onChange,
  label,
  hint,
  accept = "images",
}: {
  value: MediaValue;
  onChange: (value: MediaValue) => void;
  label: string;
  hint?: string;
  accept?: "images" | "documents" | "tous";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {hint ? <p className="text-xs text-[color:var(--texte-doux)]">{hint}</p> : null}

      {value?.url ? (
        <div className="flex gap-3 rounded-field border border-[color:var(--bordure)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt=""
            className="size-20 shrink-0 rounded bg-[color:var(--surface-sunken)] object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              type="text"
              value={value.alt ?? ""}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              placeholder="Texte alternatif (ce que montre l'image)"
              className="h-9 w-full rounded border border-[color:var(--bordure)] bg-[color:var(--surface)] px-2.5 text-xs focus:border-azur-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded border border-[color:var(--bordure)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
              >
                <Icon name="Images" className="size-3.5" />
                Remplacer
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1.5 rounded border border-[color:var(--bordure)] px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                <Icon name="Trash2" className="size-3.5" />
                Retirer
              </button>
            </div>
            <p className="truncate text-[0.6875rem] text-[color:var(--texte-doux)]">{value.url}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 rounded-field border-2 border-dashed border-[color:var(--bordure)] px-4 py-6 text-sm font-semibold text-[color:var(--texte-doux)] transition-colors hover:border-azur-400 hover:bg-[color:var(--surface-alt)] hover:text-[color:var(--texte)]"
        >
          <Icon name="ImagePlus" className="size-5" />
          Choisir dans la médiathèque
        </button>
      )}

      {open ? (
        <MediaLibraryDialog
          accept={accept}
          onClose={() => setOpen(false)}
          onSelect={(media) => {
            onChange({ id: media.id, url: media.url, alt: media.alt });
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

/* ------------------------- Boîte de dialogue ----------------------------- */

const FOLDERS = [
  { value: "", label: "Tous les dossiers" },
  { value: "general", label: "Général" },
  { value: "pages", label: "Pages" },
  { value: "actualites", label: "Actualités" },
  { value: "agenda", label: "Agenda" },
  { value: "associations", label: "Associations" },
  { value: "elus", label: "Élus" },
  { value: "equipements", label: "Équipements" },
  { value: "salles", label: "Salles" },
  { value: "materiel", label: "Matériel" },
  { value: "documents", label: "Documents" },
  { value: "signalements", label: "Signalements" },
];

export function MediaLibraryDialog({
  onClose,
  onSelect,
  accept = "images",
}: {
  onClose: () => void;
  onSelect: (media: MediaEntry) => void;
  accept?: "images" | "documents" | "tous";
}) {
  const [items, setItems] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder) params.set("dossier", folder);
      if (query) params.set("q", query);
      params.set("type", accept);
      const response = await fetch(`/api/admin/medias?${params.toString()}`);
      const data = (await response.json()) as { medias?: MediaEntry[] };
      setItems(data.medias ?? []);
    } catch {
      setError("La médiathèque n'a pas pu être chargée.");
    } finally {
      setLoading(false);
    }
  }, [folder, query, accept]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const upload = async (files: FileList) => {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("fichier", file);
        body.append("dossier", folder || "general");
        body.append("alt", "");
        const response = await fetch("/api/televersement", { method: "POST", body });
        const data = (await response.json()) as { ok: boolean; error?: string };
        if (!data.ok) {
          setError(`${file.name} : ${data.error}`);
          break;
        }
      }
      await load();
    } catch {
      setError("Le téléversement a échoué.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Médiathèque"
      className="fixed inset-0 z-100 flex items-center justify-center bg-azur-950/55 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] shadow-menu">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
          <h2 className="font-display text-base font-bold">Médiathèque</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-field transition-colors hover:bg-[color:var(--surface)]"
          >
            <Icon name="X" className="size-4.5" />
            <span className="sr-only">Fermer</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--bordure)] p-3">
          <label className="sr-only" htmlFor="media-recherche">
            Rechercher un fichier
          </label>
          <div className="relative min-w-48 flex-1">
            <Icon
              name="Search"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color:var(--texte-doux)]"
            />
            <input
              id="media-recherche"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom de fichier ou description…"
              className="h-9 w-full rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] pr-3 pl-9 text-sm focus:border-azur-500 focus:outline-none"
            />
          </div>

          <label className="sr-only" htmlFor="media-dossier">
            Dossier
          </label>
          <select
            id="media-dossier"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="h-9 rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-2.5 text-sm focus:border-azur-500 focus:outline-none"
          >
            {FOLDERS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>

          <label
            className={cn(
              "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-field bg-azur-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-azur-700",
              uploading && "pointer-events-none opacity-70",
            )}
          >
            <input
              type="file"
              multiple
              accept={
                accept === "documents"
                  ? "application/pdf"
                  : accept === "tous"
                    ? "image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    : "image/jpeg,image/png,image/webp,image/gif"
              }
              onChange={(event) => {
                if (event.target.files?.length) void upload(event.target.files);
              }}
              className="sr-only"
            />
            <Icon name={uploading ? "Loader2" : "Upload"} className={cn("size-4", uploading && "animate-spin")} />
            {uploading ? "Envoi…" : "Téléverser"}
          </label>
        </div>

        {error ? (
          <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-2.5 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-100">
            {error}
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-field bg-[color:var(--surface-alt)]"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="Images" className="mx-auto mb-3 size-8 text-[color:var(--texte-doux)]/50" />
              <p className="font-semibold">Aucun fichier</p>
              <p className="mt-1 text-sm text-[color:var(--texte-doux)]">
                Téléversez une image ou changez de dossier.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {items.map((media) => (
                <li key={media.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(media)}
                    className="group block w-full overflow-hidden rounded-field border border-[color:var(--bordure)] text-left transition-[border-color,box-shadow] hover:border-azur-400 hover:shadow-douce"
                  >
                    {media.mimeType === "application/pdf" ? (
                      <span className="flex aspect-square items-center justify-center bg-dore-50 text-dore-700 dark:bg-dore-900/40 dark:text-dore-200">
                        <Icon name="FileText" className="size-8" />
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.url}
                        alt=""
                        loading="lazy"
                        className="aspect-square w-full bg-[color:var(--surface-sunken)] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <span className="block p-2">
                      <span className="block truncate text-xs font-medium">{media.filename}</span>
                      <span className="mt-0.5 block text-[0.625rem] text-[color:var(--texte-doux)]">
                        {media.width && media.height ? `${media.width}×${media.height} · ` : ""}
                        {formatFileSize(media.size)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-2.5 text-xs text-[color:var(--texte-doux)]">
          Formats acceptés : JPEG, PNG, WebP, GIF (6 Mo maximum) et PDF (20 Mo). Pensez à saisir un
          texte alternatif : il est lu par les personnes utilisant un lecteur d'écran.
        </div>
      </div>
    </div>
  );
}
