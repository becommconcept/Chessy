import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/layout";
import { Visual } from "@/components/ui/Visual";
import { cn } from "@/lib/utils";

export type SubNavItem = { label: string; href: string; icon?: string | null };

/**
 * En-tête de page : titre, chapeau et visuel de rubrique.
 *
 * Il n'est rendu que si la page ne commence pas par un bloc « bandeau »,
 * afin de ne jamais empiler deux titres de niveau 1.
 */
export function PageHeader({
  title,
  excerpt,
  cover,
  eyebrow,
  icon,
  currentHref,
  subNav,
}: {
  title: string;
  excerpt?: string | null;
  cover?: { url: string; alt: string } | null;
  eyebrow?: string | null;
  icon?: string | null;
  currentHref?: string;
  subNav?: SubNavItem[];
}) {
  return (
    <>
      <div className="relative isolate overflow-hidden bg-azur-800 text-white dark:bg-azur-950">
        {cover?.url ? (
          <>
            <Visual
              source={cover}
              ratio="libre"
              className="absolute inset-0 -z-20 h-full w-full"
              imageClassName="h-full w-full object-cover"
              priority
              sizes="100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-linear-to-r from-azur-950/93 via-azur-950/78 to-azur-950/45"
            />
          </>
        ) : (
          <div aria-hidden className="motif-filons absolute inset-0 -z-10" />
        )}

        <Container className="relative py-12 sm:py-16">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.13em] uppercase text-dore-200">
                {icon ? <Icon name={icon} className="size-4" /> : null}
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {excerpt ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {excerpt}
              </p>
            ) : null}
          </div>
        </Container>
      </div>

      {subNav && subNav.length > 0 ? (
        <nav
          aria-label="Dans cette rubrique"
          className="sans-impression sticky top-16 z-30 border-b border-[color:var(--bordure)] bg-[color:var(--surface)]/94 backdrop-blur-lg lg:top-30"
        >
          <Container>
            <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 py-2.5">
              {subNav.map((item) => {
                const active = currentHref === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                        active
                          ? "bg-azur-600 text-white"
                          : "text-[color:var(--texte-doux)] hover:bg-[color:var(--surface-alt)] hover:text-[color:var(--texte)]",
                      )}
                    >
                      {item.icon ? <Icon name={item.icon} className="size-4" /> : null}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </nav>
      ) : null}
    </>
  );
}
