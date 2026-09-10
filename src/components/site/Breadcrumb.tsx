import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/layout";

export type Crumb = { label: string; href?: string };

/**
 * Fil d'Ariane.
 *
 * Le dernier élément porte `aria-current="page"` et n'est pas un lien, comme
 * le prescrit le RGAA. Les données structurées associées aident les moteurs de
 * recherche à afficher la hiérarchie du site.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Accueil", href: "/" } as Crumb, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${item.href}` : undefined,
    })),
  };

  return (
    <nav
      aria-label="Vous êtes ici"
      className="sans-impression border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]"
    >
      <Container>
        <ol className="flex flex-wrap items-center gap-1 py-3 text-[0.8125rem]">
          <li className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded px-1 py-0.5 text-[color:var(--texte-doux)] transition-colors hover:text-azur-600 dark:hover:text-azur-200"
            >
              <Icon name="Home" className="size-3.5" />
              Accueil
            </Link>
          </li>
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.href ?? item.label}-${index}`} className="flex items-center gap-1">
                <Icon
                  name="ChevronRight"
                  className="size-3.5 shrink-0 text-[color:var(--texte-doux)]/50"
                />
                {last || !item.href ? (
                  <span aria-current="page" className="px-1 py-0.5 font-semibold text-[color:var(--texte)]">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="rounded px-1 py-0.5 text-[color:var(--texte-doux)] transition-colors hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
