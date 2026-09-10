"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { deconnexionAction } from "@/app/admin/actions-auth";
import { LogoMark } from "@/components/site/Logo";
import { ComfortMenu } from "@/components/site/ComfortMenu";
import { Icon } from "@/components/ui/Icon";
import { ROLE_LABELS, type Role } from "@/lib/enums";
import { cn, initials } from "@/lib/utils";

export type AdminNavGroup = {
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: string;
    badge?: number;
    exact?: boolean;
  }>;
};

/**
 * Navigation latérale du back-office.
 *
 * Repliable sur grand écran, remplacée par un panneau coulissant sur mobile.
 * Les compteurs affichés à droite de certaines entrées signalent les demandes
 * en attente de traitement.
 */
export function AdminSidebar({
  groups,
  user,
}: {
  groups: AdminNavGroup[];
  user: { name: string; email: string; role: Role };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("chessy-admin-menu") === "replie");
    } catch {
      setCollapsed(false);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem("chessy-admin-menu", next ? "replie" : "deploye");
      } catch {
        // Stockage indisponible : le réglage reste valable pour la session.
      }
      return next;
    });
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const totalPending = groups
    .flatMap((group) => group.items)
    .reduce((sum, item) => sum + (item.badge ?? 0), 0);

  const content = (
    <nav aria-label="Navigation de l'espace mairie" className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/10 px-4 py-4",
          collapsed && "lg:justify-center lg:px-2",
        )}
      >
        <Link href="/admin" className="flex items-center gap-3">
          <LogoMark className="size-9 shrink-0" />
          {!collapsed ? (
            <span className="min-w-0 lg:block">
              <span className="block truncate font-display text-sm leading-tight font-bold text-white">
                Chessy-les-Mines
              </span>
              <span className="block text-[0.625rem] font-semibold tracking-[0.11em] uppercase text-dore-300">
                Espace mairie
              </span>
            </span>
          ) : null}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            {!collapsed ? (
              <p className="mb-1.5 px-2.5 text-[0.625rem] font-bold tracking-[0.12em] uppercase text-white/35">
                {group.title}
              </p>
            ) : (
              <hr className="mx-2 mb-2 border-t border-white/10 first:hidden" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-field px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-white/12 font-semibold text-white"
                          : "text-white/70 hover:bg-white/8 hover:text-white",
                        collapsed && "lg:justify-center lg:px-2",
                      )}
                    >
                      <Icon name={item.icon} className="size-4.5 shrink-0" />
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge ? (
                            <span className="shrink-0 rounded-full bg-dore-500 px-1.5 py-0.5 text-[0.625rem] font-bold text-white tabular-nums">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : item.badge ? (
                        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-dore-400" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-2.5">
        <div
          className={cn(
            "mb-2 flex items-center gap-2.5 rounded-field px-2.5 py-2",
            collapsed && "lg:justify-center lg:px-0",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-dore-500 text-xs font-bold text-white">
            {initials(user.name)}
          </span>
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-white">{user.name}</span>
              <span className="block truncate text-[0.6875rem] text-white/50">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
          ) : null}
        </div>

        <ul className="space-y-0.5">
          <li>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2.5 rounded-field px-2.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white",
                collapsed && "lg:justify-center lg:px-2",
              )}
              title={collapsed ? "Voir le site" : undefined}
            >
              <Icon name="ExternalLink" className="size-4.5 shrink-0" />
              {!collapsed ? "Voir le site" : null}
            </Link>
          </li>
          <li>
            <form action={deconnexionAction}>
              <button
                type="submit"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-field px-2.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white",
                  collapsed && "lg:justify-center lg:px-2",
                )}
                title={collapsed ? "Se déconnecter" : undefined}
              >
                <Icon name="LogOut" className="size-4.5 shrink-0" />
                {!collapsed ? "Se déconnecter" : null}
              </button>
            </form>
          </li>
        </ul>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="mt-2 hidden w-full items-center justify-center gap-2 rounded-field border border-white/12 px-2.5 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/8 hover:text-white lg:flex"
        >
          <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} className="size-3.5" />
          {!collapsed ? "Replier le menu" : null}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Barre supérieure mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface)] px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoMark className="size-8" />
          <span className="font-display text-sm font-bold">Espace mairie</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ComfortMenu compact />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-admin"
            onClick={() => setOpen((value) => !value)}
            className="relative flex size-10 items-center justify-center rounded-field border border-[color:var(--bordure)]"
          >
            <Icon name={open ? "X" : "Menu"} className="size-5" />
            {totalPending > 0 && !open ? (
              <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-dore-500 text-[0.5625rem] font-bold text-white">
                {totalPending}
              </span>
            ) : null}
            <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
          </button>
        </div>
      </div>

      {/* Panneau mobile */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-azur-950/60 backdrop-blur-sm"
          />
          <div
            id="menu-admin"
            className="animate-glisse-bas absolute inset-y-0 left-0 w-72 max-w-[86vw] bg-azur-900 shadow-menu dark:bg-azur-950"
          >
            {content}
          </div>
        </div>
      ) : null}

      {/* Colonne fixe sur grand écran */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 bg-azur-900 lg:block dark:bg-azur-950",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {content}
      </aside>
    </>
  );
}
