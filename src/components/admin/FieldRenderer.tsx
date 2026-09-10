"use client";

import { useId } from "react";

import { MediaPicker, type MediaValue } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { FieldDef } from "@/lib/blocks";
import { cn } from "@/lib/utils";

type Values = Record<string, unknown>;

/**
 * Construit le formulaire d'un bloc à partir de la description de ses champs.
 *
 * Un seul composant sert tous les types de blocs : ajouter un bloc au site
 * revient donc à décrire ses champs dans `src/lib/blocks.ts`, sans écrire de
 * formulaire d'administration.
 */
export function FieldsForm({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef[];
  values: Values;
  onChange: (values: Values) => void;
}) {
  const set = (name: string, value: unknown) => onChange({ ...values, [name]: value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.name}
          className={cn(
            field.type === "repeater" || field.type === "richtext" || field.width !== "half"
              ? "sm:col-span-2"
              : "",
          )}
        >
          <FieldControl field={field} value={values[field.name]} onChange={(value) => set(field.name, value)} />
        </div>
      ))}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = useId();
  const controlId = `${id}-${field.name}`;

  switch (field.type) {
    case "text":
    case "url":
    case "date":
      return (
        <Field label={field.label} htmlFor={controlId} hint={field.help} required={field.required}>
          <Input
            id={controlId}
            type={field.type === "date" ? "date" : "text"}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case "color":
      return (
        <Field label={field.label} htmlFor={controlId} hint={field.help}>
          <div className="flex gap-2">
            <input
              id={controlId}
              type="color"
              value={typeof value === "string" && value ? value : "#14507f"}
              onChange={(event) => onChange(event.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] p-1"
            />
            <Input
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
              placeholder="#14507f"
              className="font-mono"
            />
          </div>
        </Field>
      );

    case "textarea":
      return (
        <Field label={field.label} htmlFor={controlId} hint={field.help} required={field.required}>
          <Textarea
            id={controlId}
            rows={3}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case "richtext":
      return (
        <RichTextEditor
          label={field.label}
          hint={field.help}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          minHeight={180}
        />
      );

    case "number":
      return (
        <Field label={field.label} htmlFor={controlId} hint={field.help}>
          <Input
            id={controlId}
            type="number"
            min={field.min}
            max={field.max}
            value={typeof value === "number" || typeof value === "string" ? String(value) : ""}
            onChange={(event) =>
              onChange(event.target.value === "" ? "" : Number(event.target.value))
            }
          />
        </Field>
      );

    case "boolean":
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          label={field.label}
          description={field.help}
        />
      );

    case "select":
      return (
        <Field label={field.label} htmlFor={controlId} hint={field.help}>
          <Select
            id={controlId}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      );

    case "media":
      return (
        <MediaPicker
          label={field.label}
          hint={field.help}
          value={(value as MediaValue) ?? null}
          onChange={onChange}
        />
      );

    case "repeater":
      return <Repeater field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />;

    default:
      return null;
  }
}

/* -------------------------------- Répéteur -------------------------------- */

function Repeater({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { type: "repeater" }>;
  value: unknown[];
  onChange: (value: unknown[]) => void;
}) {
  const items = value as Array<Record<string, unknown>>;
  const atMax = typeof field.max === "number" && items.length >= field.max;

  const update = (index: number, next: Record<string, unknown>) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };

  const add = () => {
    const blank: Record<string, unknown> = {};
    for (const nested of field.fields) {
      blank[nested.name] =
        nested.type === "boolean"
          ? false
          : nested.type === "number"
            ? 0
            : nested.type === "media"
              ? null
              : nested.type === "repeater"
                ? []
                : "";
    }
    onChange([...items, blank]);
  };

  const summaryOf = (item: Record<string, unknown>, index: number): string => {
    for (const key of ["label", "title", "question", "name", "date"]) {
      const candidate = item[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    return `${field.itemLabel} ${index + 1}`;
  };

  return (
    <fieldset>
      <legend className="text-sm font-semibold">{field.label}</legend>
      {field.help ? (
        <p className="mt-1 text-xs text-[color:var(--texte-doux)]">{field.help}</p>
      ) : null}

      <div className="mt-2.5 space-y-2.5">
        {items.length === 0 ? (
          <p className="rounded-field border border-dashed border-[color:var(--bordure)] px-4 py-6 text-center text-sm text-[color:var(--texte-doux)]">
            Aucun élément. Ajoutez-en un ci-dessous.
          </p>
        ) : null}

        {items.map((item, index) => (
          <details
            key={index}
            className="group overflow-hidden rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface-alt)]"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5">
              <Icon
                name="ChevronDown"
                className="size-4 shrink-0 text-[color:var(--texte-doux)] transition-transform group-open:rotate-180"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {summaryOf(item, index)}
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    move(index, -1);
                  }}
                  disabled={index === 0}
                  className="flex size-7 items-center justify-center rounded text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface)] disabled:opacity-30"
                >
                  <Icon name="MoveUp" className="size-3.5" />
                  <span className="sr-only">Déplacer vers le haut</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    move(index, 1);
                  }}
                  disabled={index === items.length - 1}
                  className="flex size-7 items-center justify-center rounded text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface)] disabled:opacity-30"
                >
                  <Icon name="MoveDown" className="size-3.5" />
                  <span className="sr-only">Déplacer vers le bas</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    onChange(items.filter((_, position) => position !== index));
                  }}
                  className="flex size-7 items-center justify-center rounded text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  <Icon name="Trash2" className="size-3.5" />
                  <span className="sr-only">Supprimer {summaryOf(item, index)}</span>
                </button>
              </span>
            </summary>
            <div className="border-t border-[color:var(--bordure)] bg-[color:var(--surface)] p-3.5">
              <FieldsForm
                fields={field.fields}
                values={item}
                onChange={(next) => update(index, next)}
              />
            </div>
          </details>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={atMax}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-field border border-azur-600/30 px-3.5 py-2 text-sm font-semibold text-azur-700 transition-colors hover:bg-azur-50 disabled:opacity-45 dark:text-azur-200 dark:hover:bg-azur-900/40"
      >
        <Icon name="Plus" className="size-4" />
        Ajouter {field.itemLabel.toLowerCase()}
        {atMax ? ` (maximum ${field.max} atteint)` : ""}
      </button>
    </fieldset>
  );
}
