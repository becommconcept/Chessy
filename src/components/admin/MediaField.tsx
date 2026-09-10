"use client";

import { useState } from "react";

import { MediaPicker, type MediaValue } from "@/components/admin/MediaPicker";

/**
 * Sélecteur de média utilisable dans un formulaire classique : l'identifiant
 * du fichier retenu est transmis dans un champ caché.
 */
export function MediaField({
  name,
  label,
  hint,
  defaultValue = null,
  accept = "images",
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: MediaValue;
  accept?: "images" | "documents" | "tous";
}) {
  const [value, setValue] = useState<MediaValue>(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value?.id ?? ""} />
      <MediaPicker label={label} hint={hint} value={value} onChange={setValue} accept={accept} />
    </>
  );
}
