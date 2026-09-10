import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/* ----------------------------- En-tête de page ---------------------------- */

export function AdminHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Fil d'Ariane" className="mb-2.5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--texte-doux)]">
            <li>
              <Link href="/admin" className="transition-colors hover:text-azur-600 dark:hover:text-azur-200">
                Tableau de bord
              </Link>
            </li>
            {breadcrumb.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                <Icon name="ChevronRight" className="size-3 opacity-50" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-[color:var(--texte)]">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-azur-800 sm:text-[1.75rem] dark:text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[color:var(--texte-doux)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

/* --------------------------------- Panneau -------------------------------- */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  footer,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)]",
        className,
      )}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title ? <h2 className="font-display text-sm font-bold">{title}</h2> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
      {footer ? (
        <div className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3 sm:px-5">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

/* ------------------------------- Statistique ------------------------------ */

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  tone = "neutre",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  href?: string;
  tone?: "neutre" | "attente" | "succes" | "alerte";
}) {
  const tones = {
    neutre: "bg-azur-50 text-azur-600 dark:bg-azur-900/50 dark:text-azur-200",
    attente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    succes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    alerte: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  }[tone];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex size-10 items-center justify-center rounded-field", tones)}>
          <Icon name={icon} className="size-5" />
        </span>
        {href ? (
          <Icon
            name="ArrowRight"
            className="mt-2 size-4 text-[color:var(--texte-doux)]/50 transition-transform duration-300 group-hover:translate-x-1"
          />
        ) : null}
      </div>
      <p className="mt-3.5 font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm font-medium">{label}</p>
      {hint ? (
        <p className="mt-1 text-xs text-[color:var(--texte-doux)]">{hint}</p>
      ) : null}
    </>
  );

  const className =
    "group block rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-4 transition-[border-color,box-shadow,transform] duration-300 ease-douce";

  if (href) {
    return (
      <Link href={href} className={cn(className, "hover:-translate-y-1 hover:border-azur-300 hover:shadow-douce")}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

/* ------------------------------- Pastille ---------------------------------- */

const PILL_TONES = {
  neutre: "bg-[color:var(--surface-sunken)] text-[color:var(--texte-doux)]",
  brouillon: "bg-pierre-200 text-pierre-700 dark:bg-pierre-800 dark:text-pierre-100",
  publie: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100",
  attente: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100",
  encours: "bg-azur-100 text-azur-800 dark:bg-azur-900/60 dark:text-azur-100",
  refus: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function Pill({
  children,
  tone = "neutre",
  icon,
}: {
  children: ReactNode;
  tone?: PillTone;
  icon?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        PILL_TONES[tone],
      )}
    >
      {icon ? <Icon name={icon} className="size-3.5" /> : null}
      {children}
    </span>
  );
}

/* --------------------------------- Tableau -------------------------------- */

export function DataTable({
  columns,
  children,
  caption,
  empty,
}: {
  columns: Array<{ label: string; className?: string; sr?: boolean }>;
  children: ReactNode;
  caption: string;
  empty?: boolean;
}) {
  if (empty) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
            {columns.map((column, index) => (
              <th
                key={`${column.label}-${index}`}
                scope="col"
                className={cn(
                  "px-4 py-2.5 text-left text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]",
                  column.className,
                )}
              >
                {column.sr ? <span className="sr-only">{column.label}</span> : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--bordure)]">{children}</tbody>
      </table>
    </div>
  );
}

export function Cell({
  children,
  className,
  header = false,
}: {
  children: ReactNode;
  className?: string;
  header?: boolean;
}) {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      scope={header ? "row" : undefined}
      className={cn("px-4 py-3 align-middle", header && "text-left font-medium", className)}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------ Aide en ligne ----------------------------- */

export function HelpNote({
  title,
  children,
  icon = "Info",
}: {
  title?: string;
  children: ReactNode;
  icon?: string;
}) {
  return (
    <aside className="flex gap-3 rounded-card border border-azur-200 bg-azur-50/70 p-4 text-sm dark:border-azur-500/35 dark:bg-azur-900/30">
      <Icon name={icon} className="mt-0.5 size-4.5 shrink-0 text-azur-600 dark:text-azur-200" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={cn("leading-relaxed text-[color:var(--texte-doux)]", title && "mt-1")}>
          {children}
        </div>
      </div>
    </aside>
  );
}

/* ----------------------------- Barre de filtres --------------------------- */

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-2.5">
      {children}
    </div>
  );
}

export function FilterLink({
  href,
  active,
  children,
  count,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-field px-3 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "bg-azur-600 text-white"
          : "bg-[color:var(--surface)] text-[color:var(--texte-doux)] hover:text-[color:var(--texte)]",
      )}
    >
      {children}
      {typeof count === "number" ? (
        <span
          className={cn(
            "rounded-full px-1.5 text-[0.6875rem] tabular-nums",
            active ? "bg-white/20" : "bg-[color:var(--surface-sunken)]",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

/* ------------------------------- État vide -------------------------------- */

export function AdminEmpty({
  icon = "Inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-[color:var(--surface-sunken)] text-[color:var(--texte-doux)]">
        <Icon name={icon} className="size-5" />
      </div>
      <p className="font-display font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-[color:var(--texte-doux)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
