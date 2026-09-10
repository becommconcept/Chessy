import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "principal"
  | "secondaire"
  | "contour"
  | "discret"
  | "danger"
  | "clair";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  principal:
    "bg-azur-600 text-white hover:bg-azur-700 active:bg-azur-800 shadow-douce dark:bg-azur-500 dark:hover:bg-azur-400 dark:text-azur-950",
  secondaire:
    "bg-dore-500 text-white hover:bg-dore-600 active:bg-dore-700 shadow-douce dark:bg-dore-400 dark:text-dore-900 dark:hover:bg-dore-300",
  contour:
    "border border-azur-600/30 bg-transparent text-azur-700 hover:border-azur-600 hover:bg-azur-50 dark:text-azur-200 dark:border-azur-200/30 dark:hover:bg-azur-900/40 dark:hover:border-azur-200/60",
  discret:
    "bg-transparent text-[color:var(--texte-doux)] hover:bg-[color:var(--surface-alt)] hover:text-[color:var(--texte)]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-douce",
  clair:
    "bg-white/12 text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm hover:bg-white/22",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-11 gap-2 px-5 text-[0.9375rem]",
  lg: "h-13 gap-2.5 px-7 text-base",
};

const BASE =
  "inline-flex shrink-0 items-center justify-center rounded-field font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-55";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  className?: string;
  children?: ReactNode;
  fullWidth?: boolean;
};

/** Bouton d'action (élément `button`). */
export function Button({
  variant = "principal",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  fullWidth,
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {icon ? <Icon name={icon} className="size-[1.125em]" /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} className="size-[1.125em]" /> : null}
    </button>
  );
}

/** Bouton de navigation : rend un lien interne ou externe selon l'URL. */
export function ButtonLink({
  href,
  variant = "principal",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  fullWidth,
  ...props
}: CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const external = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
  const content = (
    <>
      {icon ? <Icon name={icon} className="size-[1.125em]" /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} className="size-[1.125em]" /> : null}
      {external ? <span className="sr-only"> (nouvelle fenêtre)</span> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
