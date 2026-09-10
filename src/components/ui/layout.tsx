import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/* -------------------------------- Conteneur ------------------------------- */

export function Container({
  children,
  className,
  size = "large",
}: {
  children: ReactNode;
  className?: string;
  size?: "large" | "lecture" | "etroit";
}) {
  return (
    <div
      className={cn(
        "conteneur",
        size === "lecture" && "max-w-4xl",
        size === "etroit" && "max-w-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* --------------------------------- Section -------------------------------- */

const TONES = {
  blanc: "bg-[color:var(--surface)]",
  clair: "bg-[color:var(--surface-alt)]",
  sable: "bg-dore-50 dark:bg-azur-950/60",
  azur: "bg-azur-800 text-white dark:bg-azur-950",
} as const;

export type Tone = keyof typeof TONES;

export function Section({
  children,
  tone = "blanc",
  className,
  id,
  pattern,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
  pattern?: "filons" | "pierre";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-14 sm:py-18",
        TONES[tone] ?? TONES.blanc,
        pattern === "filons" && "motif-filons",
        pattern === "pierre" && "motif-pierre",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ------------------------------ Titre de section -------------------------- */

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  inverse = false,
  action,
  level = 2,
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "left" | "center";
  inverse?: boolean;
  action?: ReactNode;
  level?: 2 | 3;
  className?: string;
}) {
  if (!title && !subtitle && !eyebrow && !action) return null;
  const Heading = level === 2 ? "h2" : "h3";

  return (
    <div
      className={cn(
        "mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-2.5 flex items-center gap-2 text-xs font-bold tracking-[0.13em] uppercase",
              align === "center" && "justify-center",
              inverse ? "text-dore-300" : "text-dore-600 dark:text-dore-300",
            )}
          >
            <span
              aria-hidden
              className={cn("h-px w-6", inverse ? "bg-dore-300/60" : "bg-dore-500/50")}
            />
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <Heading
            className={cn(
              "text-2xl sm:text-[1.75rem] lg:text-4xl",
              inverse ? "text-white" : "text-azur-800 dark:text-white",
            )}
          >
            {title}
          </Heading>
        ) : null}
        {subtitle ? (
          <p
            className={cn(
              "mt-3 text-[1.0313rem] leading-relaxed",
              inverse ? "text-white/78" : "text-[color:var(--texte-doux)]",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------- Carte --------------------------------- */

export function Card({
  children,
  className,
  as: Tag = "div",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)]",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-douce hover:-translate-y-1 hover:border-azur-300 hover:shadow-relief dark:hover:border-azur-500/50",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------- Étiquette ------------------------------ */

const BADGE_TONES = {
  neutre: "bg-[color:var(--surface-sunken)] text-[color:var(--texte-doux)]",
  azur: "bg-azur-100 text-azur-700 dark:bg-azur-900/60 dark:text-azur-200",
  dore: "bg-dore-100 text-dore-800 dark:bg-dore-900/50 dark:text-dore-200",
  malachite: "bg-malachite-100 text-malachite-700 dark:bg-malachite-700/40 dark:text-malachite-100",
  succes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  attente: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  clair: "bg-white/15 text-white ring-1 ring-inset ring-white/25",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  children,
  tone = "neutre",
  icon,
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: string | null;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        BADGE_TONES[tone] ?? BADGE_TONES.neutre,
        className,
      )}
    >
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {icon ? <Icon name={icon} className="size-3.5" /> : null}
      {children}
    </span>
  );
}

/* ------------------------------- État vide -------------------------------- */

export function EmptyState({
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
    <div className="rounded-card border border-dashed border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[color:var(--surface)] text-azur-500 shadow-douce">
        <Icon name={icon} className="size-6" />
      </div>
      <p className="font-display text-lg font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--texte-doux)]">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* --------------------------- Lien « voir plus » --------------------------- */

export function MoreLink({
  href,
  children,
  inverse = false,
}: {
  href: string;
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-semibold transition-colors",
        inverse ? "text-dore-200 hover:text-white" : "text-azur-600 hover:text-dore-600 dark:text-azur-200 dark:hover:text-dore-300",
      )}
    >
      {children}
      <Icon
        name="ArrowRight"
        className="size-4 transition-transform duration-300 ease-douce group-hover:translate-x-1"
      />
    </Link>
  );
}

/* ------------------------------ Grille fluide ----------------------------- */

export function Grid({
  columns = 3,
  children,
  className,
}: {
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-5 sm:gap-6",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------- Pastille de date (agenda) ---------------------- */

export function DateChip({ date, className }: { date: Date; className?: string }) {
  const day = date.toLocaleDateString("fr-FR", { day: "2-digit" });
  const month = date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 flex-col items-center justify-center rounded-field bg-azur-600 text-white shadow-douce sm:size-16",
        className,
      )}
    >
      <span className="font-display text-xl leading-none font-bold sm:text-2xl">{day}</span>
      <span className="mt-0.5 text-[0.625rem] font-semibold tracking-wider uppercase opacity-90">
        {month}
      </span>
    </div>
  );
}
