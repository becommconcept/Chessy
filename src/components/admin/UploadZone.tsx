"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * Zone de téléversement par glisser-déposer.
 *
 * Les fichiers sont envoyés un par un afin de pouvoir signaler précisément
 * lequel a été refusé et pourquoi, plutôt qu'un échec global.
 */
export function UploadZone({ folder, folders }: { folder: string; folders: string[] }) {
  const router = useRouter();
  const [target, setTarget] = useState(folder);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const upload = async (files: FileList | File[]) => {
    setBusy(true);
    setErrors([]);
    setDone(null);
    let success = 0;
    const problems: string[] = [];

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("fichier", file);
      body.append("dossier", target);
      body.append("alt", "");
      try {
        const response = await fetch("/api/televersement", { method: "POST", body });
        const data = (await response.json()) as { ok: boolean; error?: string };
        if (data.ok) success += 1;
        else problems.push(`${file.name} : ${data.error ?? "refusé"}`);
      } catch {
        problems.push(`${file.name} : envoi interrompu`);
      }
    }

    setBusy(false);
    setDone(success);
    setErrors(problems);
    if (success > 0) router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="upload-dossier" className="text-sm font-semibold">
          Dossier de destination
        </label>
        <select
          id="upload-dossier"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="h-9 rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-2.5 text-sm focus:border-azur-500 focus:outline-none"
        >
          {folders.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length > 0) void upload(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-10 text-center transition-colors",
          dragging
            ? "border-azur-500 bg-azur-50 dark:bg-azur-900/30"
            : "border-[color:var(--bordure)] bg-[color:var(--surface)] hover:border-azur-400 hover:bg-[color:var(--surface-alt)]",
          busy && "pointer-events-none opacity-70",
        )}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
          }}
          className="sr-only"
        />
        <Icon
          name={busy ? "Loader2" : "Upload"}
          className={cn("size-7 text-azur-500", busy && "animate-spin")}
        />
        <span className="text-sm font-semibold">
          {busy ? "Téléversement en cours…" : "Glissez vos fichiers ici, ou cliquez pour les choisir"}
        </span>
        <span className="text-xs text-[color:var(--texte-doux)]">
          Images JPEG, PNG, WebP, GIF (6 Mo maximum) et documents PDF (20 Mo)
        </span>
      </label>

      {done !== null && done > 0 ? (
        <Notice tone="succes">
          {done} fichier{done > 1 ? "s" : ""} ajouté{done > 1 ? "s" : ""} au dossier « {target} ».
          Pensez à renseigner le texte alternatif des images.
        </Notice>
      ) : null}

      {errors.length > 0 ? (
        <Notice tone="erreur" title="Fichiers refusés">
          <ul className="mt-1 space-y-0.5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Notice>
      ) : null}
    </div>
  );
}
