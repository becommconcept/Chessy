import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Marque de la commune.
 *
 * Le symbole reprend le motif du cristal d'azurite — la « chessylite » — et se
 * décline sur fond clair comme sur fond foncé. La mairie peut évidemment y
 * substituer son blason depuis les paramètres du back-office.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-11", className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="chessy-azurite" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4d8ec5" />
          <stop offset="55%" stopColor="#14507f" />
          <stop offset="100%" stopColor="#0b2e4f" />
        </linearGradient>
        <linearGradient id="chessy-dore" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a86f22" />
          <stop offset="100%" stopColor="#e9c887" />
        </linearGradient>
      </defs>
      {/* Cristal principal */}
      <path d="M24 3 43 15v18L24 45 5 33V15Z" fill="url(#chessy-azurite)" />
      {/* Facettes claires */}
      <path d="M24 3 43 15 24 24Z" fill="#7fb2dc" opacity="0.85" />
      <path d="M24 24 43 15v18Z" fill="#2a7bb8" opacity="0.55" />
      <path d="M24 24 5 33V15Z" fill="#071f36" opacity="0.35" />
      {/* Filon doré */}
      <path d="M24 24 5 33l19 12Z" fill="url(#chessy-dore)" opacity="0.92" />
      <path d="M24 3v21" stroke="#d8e9f6" strokeWidth="0.9" opacity="0.5" />
    </svg>
  );
}

export function Logo({
  name = "Chessy-les-Mines",
  tagline,
  inverse = false,
  href = "/",
  compact = false,
}: {
  name?: string;
  tagline?: string;
  inverse?: boolean;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-field py-1 transition-opacity hover:opacity-90"
    >
      <LogoMark className={cn("shrink-0 transition-transform duration-500 ease-douce group-hover:rotate-6", compact ? "size-9" : "size-11")} />
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-display leading-tight font-bold",
            compact ? "text-[0.9375rem]" : "text-base sm:text-[1.0625rem]",
            inverse ? "text-white" : "text-azur-800 dark:text-white",
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            "block truncate text-[0.6875rem] font-semibold tracking-[0.11em] uppercase",
            inverse ? "text-dore-200" : "text-dore-600 dark:text-dore-300",
          )}
        >
          {tagline ?? "Mairie · Rhône"}
        </span>
      </span>
      <span className="sr-only">— retour à l'accueil</span>
    </Link>
  );
}
