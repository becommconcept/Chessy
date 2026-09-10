import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-3.5 py-2.5 " +
  "text-[0.9375rem] text-[color:var(--texte)] placeholder:text-[color:var(--texte-doux)]/70 " +
  "transition-[border-color,box-shadow] duration-200 " +
  "hover:border-azur-300 focus:border-azur-500 focus:ring-4 focus:ring-azur-500/12 focus:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-red-500/15";

/** Enveloppe commune : étiquette, aide à la saisie et message d'erreur. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[color:var(--texte)]">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600 dark:text-red-400" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-[color:var(--texte-doux)]">
            (facultatif)
          </span>
        )}
      </label>
      {hint ? (
        <p id={htmlFor ? `${htmlFor}-aide` : undefined} className="text-xs text-[color:var(--texte-doux)]">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-erreur` : undefined}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-red-700 dark:text-red-400"
        >
          <Icon name="CircleAlert" className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn(CONTROL, "min-h-32 resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentPropsWithoutRef<"select">) {
  return (
    <select className={cn(CONTROL, "pr-9 appearance-none bg-no-repeat", className)} {...props}>
      {children}
    </select>
  );
}

/** Case à cocher accompagnée de son libellé cliquable. */
export function Checkbox({
  label,
  description,
  className,
  ...props
}: { label: ReactNode; description?: string } & ComponentPropsWithoutRef<"input">) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-field border border-[color:var(--bordure)] p-3.5 transition-colors hover:border-azur-300 hover:bg-[color:var(--surface-alt)] has-checked:border-azur-500 has-checked:bg-azur-50/70 dark:has-checked:bg-azur-900/30",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4.5 shrink-0 rounded border-[color:var(--bordure)] text-azur-600 accent-azur-600"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

/** Bouton radio présenté comme une carte sélectionnable. */
export function RadioCard({
  label,
  description,
  badge,
  className,
  ...props
}: {
  label: ReactNode;
  description?: string;
  badge?: ReactNode;
} & ComponentPropsWithoutRef<"input">) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-field border border-[color:var(--bordure)] p-4 transition-all duration-200 hover:border-azur-300 hover:bg-[color:var(--surface-alt)] has-checked:border-azur-500 has-checked:bg-azur-50/70 has-checked:ring-2 has-checked:ring-azur-500/20 dark:has-checked:bg-azur-900/30",
        className,
      )}
    >
      <input
        type="radio"
        className="mt-0.5 size-4.5 shrink-0 accent-azur-600"
        {...props}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          {badge}
        </span>
        {description ? (
          <span className="mt-1 block text-xs leading-relaxed text-[color:var(--texte-doux)]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

/** Message d'information, de succès ou d'erreur. */
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "succes" | "attention" | "erreur";
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const styles = {
    info: {
      box: "border-azur-200 bg-azur-50 text-azur-900 dark:border-azur-500/40 dark:bg-azur-900/40 dark:text-azur-50",
      icon: "Info",
    },
    succes: {
      box: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/35 dark:text-emerald-50",
      icon: "CircleCheck",
    },
    attention: {
      box: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-900/35 dark:text-amber-50",
      icon: "TriangleAlert",
    },
    erreur: {
      box: "border-red-200 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-900/35 dark:text-red-50",
      icon: "CircleAlert",
    },
  }[tone];

  return (
    <div
      role={tone === "erreur" ? "alert" : undefined}
      className={cn("flex gap-3 rounded-card border p-4", styles.box, className)}
    >
      <Icon name={styles.icon} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 text-sm">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-1", "leading-relaxed")}>{children}</div> : null}
      </div>
    </div>
  );
}
