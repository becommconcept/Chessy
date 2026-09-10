"use client";

import { useState } from "react";

import { RichTextEditor } from "@/components/admin/RichTextEditor";

/**
 * Champ de texte enrichi utilisable dans un formulaire classique.
 *
 * L'éditeur alimente un champ caché : le formulaire reste un `<form action>`
 * standard, envoyé au serveur sans code client supplémentaire.
 */
export function HtmlField({
  name,
  label,
  hint,
  defaultValue = "",
  minHeight,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  minHeight?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <RichTextEditor
        label={label}
        hint={hint}
        value={value}
        onChange={setValue}
        minHeight={minHeight}
      />
    </>
  );
}
