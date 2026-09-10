"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ComfortMenu } from "@/components/site/ComfortMenu";
import { Logo } from "@/components/site/Logo";
import { SearchDialog } from "@/components/site/SearchDialog";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { NavNode } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type HeaderProps = {
  menu: NavNode[];
  services: NavNode[];
  siteName: string;
  tagline: string;
  phone: string;
  openLabel: string;
  openNow: boolean;
  nextOpenLabel?: string;
};

export function Header({
  menu,
  services,
  siteName,
  tagline,
  phone,
  openLabel,
  openNow,
  nextOpenLabel,
}: HeaderProps) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /* En-tête condensé au défilement */
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Fermeture de tout à chaque changement de page */
  useEffect(() => {
    setOpenIndex(null);
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* Échap ferme le mégamenu ou le panneau mobile */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenIndex(null);
      setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* Blocage du défilement derrière le panneau mobile */
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  /* Raccourci clavier de la recherche */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* Clic en dehors du mégamenu */
  useEffect(() => {
    if (openIndex === null) return;
    const onClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenIndex(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openIndex]);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIndex(null), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const isActive = (href: string) =>
    href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <a href="#contenu-principal" className="lien-evitement">
        Aller au contenu principal
      </a>

      <header className="sans-impression sticky top-0 z-50">
        {/* Bandeau de service : horaires, téléphone, confort de lecture */}
        <div className="hidden bg-azur-900 text-white lg:block dark:bg-azur-950">
          <div className="conteneur flex h-10 items-center justify-between gap-6 text-[0.8125rem]">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    openNow ? "animate-pulsation bg-emerald-400" : "bg-dore-400",
                  )}
                />
                <span className="font-medium">{openLabel}</span>
                {nextOpenLabel ? (
                  <span className="text-white/60">· {nextOpenLabel}</span>
                ) : null}
              </span>
              <a
                href={`tel:+33${phone.replace(/\D/g, "").slice(1)}`}
                className="flex items-center gap-1.5 text-white/85 transition-colors hover:text-dore-200"
              >
                <Icon name="Phone" className="size-3.5" />
                {phone}
              </a>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/suivi"
                className="flex items-center gap-1.5 rounded px-2 py-1 text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name="Search" className="size-3.5" />
                Suivre une demande
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 rounded px-2 py-1 text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name="Mail" className="size-3.5" />
                Contact
              </Link>
              <span aria-hidden className="mx-1 h-4 w-px bg-white/20" />
              <ComfortMenu />
            </div>
          </div>
        </div>

        {/* Barre principale */}
        <div
          className={cn(
            "border-b border-[color:var(--bordure)] bg-[color:var(--surface)]/92 backdrop-blur-xl transition-shadow duration-300",
            condensed && "shadow-douce",
          )}
        >
          <div
            ref={navRef}
            className={cn(
              "conteneur flex items-center justify-between gap-4 transition-[height] duration-300 ease-douce",
              condensed ? "h-16" : "h-18 lg:h-20",
            )}
          >
            <Logo name={siteName} tagline={tagline} compact={condensed} />

            {/* Navigation principale — écrans larges */}
            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center gap-0.5">
                {menu.map((entry, index) => {
                  const hasChildren = entry.children.length > 0;
                  const expanded = openIndex === index;
                  return (
                    <li
                      key={entry.id}
                      className="relative"
                      onMouseEnter={() => {
                        cancelClose();
                        if (hasChildren) setOpenIndex(index);
                      }}
                      onMouseLeave={scheduleClose}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`megamenu-${entry.id}`}
                          onClick={() => setOpenIndex(expanded ? null : index)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-field px-3.5 py-2.5 text-[0.9375rem] font-semibold transition-colors",
                            expanded || isActive(entry.href)
                              ? "bg-azur-50 text-azur-700 dark:bg-azur-900/50 dark:text-white"
                              : "text-[color:var(--texte)] hover:bg-[color:var(--surface-alt)]",
                          )}
                        >
                          {entry.label}
                          <Icon
                            name="ChevronDown"
                            className={cn(
                              "size-3.5 transition-transform duration-300",
                              expanded && "rotate-180",
                            )}
                          />
                        </button>
                      ) : (
                        <Link
                          href={entry.href}
                          className={cn(
                            "flex items-center rounded-field px-3.5 py-2.5 text-[0.9375rem] font-semibold transition-colors",
                            isActive(entry.href)
                              ? "bg-azur-50 text-azur-700 dark:bg-azur-900/50 dark:text-white"
                              : "text-[color:var(--texte)] hover:bg-[color:var(--surface-alt)]",
                          )}
                        >
                          {entry.label}
                        </Link>
                      )}

                      {hasChildren && expanded ? (
                        <div
                          id={`megamenu-${entry.id}`}
                          className="animate-glisse-bas absolute top-full left-1/2 z-50 w-[min(46rem,88vw)] -translate-x-1/2 pt-3"
                          onMouseEnter={cancelClose}
                          onMouseLeave={scheduleClose}
                        >
                          <div className="overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] shadow-menu">
                            <div className="flex items-start justify-between gap-4 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
                              <div>
                                <p className="font-display text-sm font-bold text-azur-800 dark:text-white">
                                  {entry.label}
                                </p>
                                {entry.description ? (
                                  <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">
                                    {entry.description}
                                  </p>
                                ) : null}
                              </div>
                              <Link
                                href={entry.href}
                                className="shrink-0 text-xs font-semibold text-azur-600 hover:underline dark:text-azur-200"
                              >
                                Voir la rubrique
                              </Link>
                            </div>
                            <ul className="grid gap-0.5 p-3 sm:grid-cols-2">
                              {entry.children.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      "group flex items-start gap-3 rounded-field p-3 transition-colors",
                                      child.highlight
                                        ? "bg-dore-50 hover:bg-dore-100 dark:bg-dore-900/25 dark:hover:bg-dore-900/40"
                                        : "hover:bg-[color:var(--surface-alt)]",
                                    )}
                                  >
                                    {child.icon ? (
                                      <span
                                        className={cn(
                                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                          child.highlight
                                            ? "bg-dore-500 text-white"
                                            : "bg-azur-50 text-azur-600 group-hover:bg-azur-500 group-hover:text-white dark:bg-azur-900/60 dark:text-azur-200",
                                        )}
                                      >
                                        <Icon name={child.icon} className="size-4" />
                                      </span>
                                    ) : null}
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold">
                                        {child.label}
                                      </span>
                                      {child.description ? (
                                        <span className="mt-0.5 block text-xs leading-snug text-[color:var(--texte-doux)]">
                                          {child.description}
                                        </span>
                                      ) : null}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex size-10 items-center justify-center rounded-field text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface-alt)] hover:text-[color:var(--texte)]"
              >
                <Icon name="Search" className="size-5" />
                <span className="sr-only">Rechercher sur le site</span>
              </button>

              <ButtonLink
                href="/services/salle-des-fetes"
                size="sm"
                className="hidden xl:inline-flex"
                icon="Sparkles"
              >
                Services en ligne
              </ButtonLink>

              <div className="lg:hidden">
                <ComfortMenu compact />
              </div>

              <button
                type="button"
                aria-expanded={drawerOpen}
                aria-controls="menu-mobile"
                onClick={() => setDrawerOpen((open) => !open)}
                className="flex size-10 items-center justify-center rounded-field border border-[color:var(--bordure)] text-[color:var(--texte)] transition-colors hover:bg-[color:var(--surface-alt)] lg:hidden"
              >
                <Icon name={drawerOpen ? "X" : "Menu"} className="size-5" />
                <span className="sr-only">{drawerOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Panneau de navigation mobile */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-45 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setDrawerOpen(false)}
            className="animate-apparition absolute inset-0 bg-azur-950/55 backdrop-blur-sm"
          />
          <nav
            id="menu-mobile"
            aria-label="Navigation principale"
            className="animate-glisse-bas absolute inset-x-0 top-0 max-h-[92dvh] overflow-y-auto rounded-b-card bg-[color:var(--surface)] pt-20 pb-8 shadow-menu"
          >
            <div className="conteneur">
              <ul className="space-y-1">
                {menu.map((entry) => (
                  <li key={entry.id}>
                    {entry.children.length > 0 ? (
                      <details className="group rounded-field border border-[color:var(--bordure)] open:bg-[color:var(--surface-alt)]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold">
                          <span className="flex items-center gap-2.5">
                            {entry.icon ? (
                              <Icon name={entry.icon} className="size-4.5 text-azur-600 dark:text-azur-200" />
                            ) : null}
                            {entry.label}
                          </span>
                          <Icon
                            name="ChevronDown"
                            className="size-4 shrink-0 transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <ul className="space-y-0.5 border-t border-[color:var(--bordure)] p-2">
                          <li>
                            <Link
                              href={entry.href}
                              className="block rounded px-3 py-2.5 text-sm font-semibold text-azur-600 dark:text-azur-200"
                            >
                              Vue d'ensemble de la rubrique
                            </Link>
                          </li>
                          {entry.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-2.5 rounded px-3 py-2.5 text-sm",
                                  child.highlight
                                    ? "font-semibold text-dore-700 dark:text-dore-300"
                                    : "text-[color:var(--texte)]",
                                )}
                              >
                                {child.icon ? <Icon name={child.icon} className="size-4 shrink-0 opacity-70" /> : null}
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <Link
                        href={entry.href}
                        className="flex items-center gap-2.5 rounded-field border border-[color:var(--bordure)] px-4 py-3.5 font-semibold"
                      >
                        {entry.icon ? <Icon name={entry.icon} className="size-4.5" /> : null}
                        {entry.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {services.length > 0 ? (
                <div className="mt-6 rounded-card bg-azur-800 p-4 text-white dark:bg-azur-950">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.12em] uppercase text-dore-200">
                    <Icon name="Sparkles" className="size-3.5" />
                    Services en ligne
                  </p>
                  <ul className="space-y-1">
                    {services.map((service) => (
                      <li key={service.id}>
                        <Link
                          href={service.href}
                          className="flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                        >
                          {service.icon ? <Icon name={service.icon} className="size-4.5 shrink-0 text-dore-200" /> : null}
                          <span>
                            {service.label}
                            {service.description ? (
                              <span className="block text-xs text-white/60">{service.description}</span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-2 rounded-card border border-[color:var(--bordure)] p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <span
                    aria-hidden
                    className={cn("size-2 rounded-full", openNow ? "bg-emerald-500" : "bg-dore-500")}
                  />
                  {openLabel}
                </p>
                {nextOpenLabel ? (
                  <p className="text-[color:var(--texte-doux)]">{nextOpenLabel}</p>
                ) : null}
                <a
                  href={`tel:+33${phone.replace(/\D/g, "").slice(1)}`}
                  className="mt-1 flex items-center gap-2 font-semibold text-azur-600 dark:text-azur-200"
                >
                  <Icon name="Phone" className="size-4" />
                  {phone}
                </a>
              </div>
            </div>
          </nav>
        </div>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
