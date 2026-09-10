import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Badge, Container, EmptyState, Section } from "@/components/ui/layout";
import { SEARCH_TYPE_LABELS, search, type SearchResult } from "@/lib/search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string; type?: string }> };

export default async function RecherchePage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length >= 2 ? await search(query, 60) : [];

  const counts = new Map<string, number>();
  for (const result of results) {
    counts.set(result.type, (counts.get(result.type) ?? 0) + 1);
  }

  const filtered = type ? results.filter((result) => result.type === type) : results;

  return (
    <>
      <Breadcrumb items={[{ label: "Recherche" }]} />
      <PageHeader
        eyebrow="Recherche"
        icon="Search"
        title={query ? `Résultats pour « ${query} »` : "Rechercher sur le site"}
        excerpt={
          query
            ? `${results.length} résultat${results.length > 1 ? "s" : ""} dans les pages, démarches, actualités, agenda, associations et documents.`
            : "Saisissez un mot ou une expression : la recherche porte sur l'ensemble des contenus du site."
        }
      />

      <Section>
        <Container size="lecture">
          <form action="/recherche" method="get" role="search" className="flex gap-2">
            <label htmlFor="recherche-q" className="sr-only">
              Votre recherche
            </label>
            <div className="relative flex-1">
              <Icon
                name="Search"
                className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-[color:var(--texte-doux)]"
              />
              <input
                id="recherche-q"
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Une démarche, une page, une actualité…"
                className="h-12 w-full rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] pr-3.5 pl-11 text-[0.9375rem] focus:border-azur-500 focus:ring-4 focus:ring-azur-500/12 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-12 shrink-0 rounded-field bg-azur-600 px-5 font-semibold text-white transition-colors hover:bg-azur-700"
            >
              Rechercher
            </button>
          </form>

          {query.length >= 2 && results.length > 0 ? (
            <nav aria-label="Filtrer les résultats" className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/recherche?q=${encodeURIComponent(query)}`}
                aria-current={!type ? "page" : undefined}
                className={
                  !type
                    ? "inline-flex rounded-full bg-azur-600 px-3.5 py-1.5 text-sm font-semibold text-white"
                    : "inline-flex rounded-full border border-[color:var(--bordure)] px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
                }
              >
                Tout ({results.length})
              </Link>
              {[...counts.entries()].map(([key, count]) => (
                <Link
                  key={key}
                  href={`/recherche?q=${encodeURIComponent(query)}&type=${key}`}
                  aria-current={type === key ? "page" : undefined}
                  className={
                    type === key
                      ? "inline-flex rounded-full bg-azur-600 px-3.5 py-1.5 text-sm font-semibold text-white"
                      : "inline-flex rounded-full border border-[color:var(--bordure)] px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
                  }
                >
                  {SEARCH_TYPE_LABELS[key as SearchResult["type"]]} ({count})
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="mt-8">
            {query.length < 2 ? (
              <div className="rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-6">
                <p className="font-display font-semibold">Suggestions de recherche</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {[
                    "salle des fêtes",
                    "acte de naissance",
                    "urbanisme",
                    "cantine",
                    "azurite",
                    "déchets",
                    "conseil municipal",
                    "eau",
                  ].map((suggestion) => (
                    <li key={suggestion}>
                      <Link
                        href={`/recherche?q=${encodeURIComponent(suggestion)}`}
                        className="inline-flex rounded-full border border-[color:var(--bordure)] bg-[color:var(--surface)] px-3.5 py-1.5 text-sm transition-colors hover:border-azur-300 hover:text-azur-600 dark:hover:text-azur-200"
                      >
                        {suggestion}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="Search"
                title={`Aucun résultat pour « ${query} »`}
                description="Essayez avec un autre mot, une orthographe différente, ou parcourez le plan du site. L'accueil de la mairie peut aussi vous orienter directement."
                action={
                  <Link
                    href="/plan-du-site"
                    className="inline-flex h-11 items-center gap-2 rounded-field border border-azur-600/30 px-5 text-sm font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
                  >
                    <Icon name="LayoutList" className="size-4" />
                    Voir le plan du site
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {filtered.map((result, index) => {
                  const external = result.href.startsWith("http") || result.href.startsWith("/uploads");
                  const content = (
                    <>
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-field bg-[color:var(--surface-sunken)] text-azur-600 dark:text-azur-200">
                        <Icon name={result.icon} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-[1.0625rem] font-semibold text-azur-800 group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
                            {result.title}
                          </span>
                          <Badge tone="neutre">{SEARCH_TYPE_LABELS[result.type]}</Badge>
                          {result.category ? (
                            <span className="text-xs text-[color:var(--texte-doux)]">
                              {result.category}
                            </span>
                          ) : null}
                        </span>
                        {result.excerpt ? (
                          <span className="mt-1.5 block text-sm leading-relaxed text-[color:var(--texte-doux)]">
                            {result.excerpt}
                          </span>
                        ) : null}
                      </span>
                      <Icon
                        name={external ? "ExternalLink" : "ArrowRight"}
                        className="mt-3 size-4 shrink-0 text-[color:var(--texte-doux)]/50 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  );

                  const className =
                    "group flex items-start gap-4 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-4 transition-[border-color,box-shadow] duration-300 hover:border-azur-300 hover:shadow-douce dark:hover:border-azur-500/50";

                  return (
                    <li key={`${result.href}-${index}`}>
                      {external ? (
                        <a href={result.href} target="_blank" rel="noopener noreferrer" className={className}>
                          {content}
                        </a>
                      ) : (
                        <Link href={result.href} className={className}>
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
