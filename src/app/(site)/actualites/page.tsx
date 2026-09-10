import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { NewsCard } from "@/components/site/cards";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Container, EmptyState, Grid, Section } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const revalidate = 120;

const PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Toute l'actualité de la commune de Chessy-les-Mines : décisions du conseil, travaux, vie associative, enfance et cadre de vie.",
  alternates: { canonical: "/actualites", types: { "application/rss+xml": "/flux.xml" } },
};

type Props = { searchParams: Promise<{ categorie?: string; page?: string }> };

export default async function ActualitesPage({ searchParams }: Props) {
  const { categorie, page: pageParam } = await searchParams;
  const currentPage = Math.max(Number(pageParam) || 1, 1);

  const categories = await prisma.newsCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      color: true,
      _count: { select: { posts: { where: { status: "PUBLIEE" } } } },
    },
  });

  const where = {
    status: "PUBLIEE" as const,
    publishedAt: { lte: new Date() },
    ...(categorie ? { category: { slug: categorie } } : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.newsPost.count({ where }),
    prisma.newsPost.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        pinned: true,
        cover: { select: { url: true, alt: true } },
        category: { select: { name: true, color: true } },
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);
  const activeCategory = categories.find((category) => category.slug === categorie);

  return (
    <>
      <Breadcrumb items={[{ label: "Actualités", href: "/actualites" }]} />
      <PageHeader
        eyebrow="Vie de la commune"
        icon="Newspaper"
        title={activeCategory ? activeCategory.name : "Actualités"}
        excerpt={
          activeCategory
            ? `Toutes les actualités de la rubrique « ${activeCategory.name} ».`
            : "Décisions du conseil, travaux, vie associative, enfance : l'essentiel de ce qui bouge à Chessy-les-Mines."
        }
      />

      <Section>
        <Container>
          {/* Filtres par rubrique */}
          <nav aria-label="Filtrer par rubrique" className="mb-8">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/actualites"
                  aria-current={!categorie ? "page" : undefined}
                  className={cn(
                    "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    !categorie
                      ? "border-azur-600 bg-azur-600 text-white"
                      : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                  )}
                >
                  Toutes ({total && !categorie ? total : categories.reduce((sum, c) => sum + c._count.posts, 0)})
                </Link>
              </li>
              {categories
                .filter((category) => category._count.posts > 0)
                .map((category) => {
                  const active = categorie === category.slug;
                  return (
                    <li key={category.slug}>
                      <Link
                        href={`/actualites?categorie=${category.slug}`}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                          active
                            ? "border-transparent text-white"
                            : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                        )}
                        style={active ? { backgroundColor: category.color } : undefined}
                      >
                        {category.name} ({category._count.posts})
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>

          {posts.length === 0 ? (
            <EmptyState
              icon="Newspaper"
              title="Aucune actualité dans cette rubrique"
              description="Choisissez une autre rubrique ou consultez toutes les actualités."
            />
          ) : (
            <Grid columns={3}>
              {posts.map((post, index) => (
                <Reveal key={post.slug} delay={index * 60} className="h-full">
                  <NewsCard post={post} priority={index < 3} />
                </Reveal>
              ))}
            </Grid>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/actualites?${new URLSearchParams({ ...(categorie ? { categorie } : {}), page: String(currentPage - 1) })}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-field border border-[color:var(--bordure)] px-3.5 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
                >
                  <Icon name="ChevronLeft" className="size-4" />
                  Précédent
                </Link>
              ) : null}

              <ul className="flex gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                  <li key={number}>
                    <Link
                      href={`/actualites?${new URLSearchParams({ ...(categorie ? { categorie } : {}), page: String(number) })}`}
                      aria-current={number === currentPage ? "page" : undefined}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-field text-sm font-semibold tabular-nums transition-colors",
                        number === currentPage
                          ? "bg-azur-600 text-white"
                          : "border border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                      )}
                    >
                      {number}
                      <span className="sr-only"> — page {number}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {currentPage < totalPages ? (
                <Link
                  href={`/actualites?${new URLSearchParams({ ...(categorie ? { categorie } : {}), page: String(currentPage + 1) })}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-field border border-[color:var(--bordure)] px-3.5 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
                >
                  Suivant
                  <Icon name="ChevronRight" className="size-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}

          <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-[color:var(--texte-doux)]">
            <Icon name="Rss" className="size-4" />
            Suivez les actualités par flux&nbsp;:
            <a href="/flux.xml" className="font-semibold text-azur-600 hover:underline dark:text-azur-200">
              flux RSS de la commune
            </a>
          </p>
        </Container>
      </Section>
    </>
  );
}
