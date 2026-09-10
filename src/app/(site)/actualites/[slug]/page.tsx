import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { NewsCard } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Visual } from "@/components/ui/Visual";
import { Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { formatDate, stripHtml, truncate } from "@/lib/utils";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await prisma.newsPost.findMany({
    where: { status: "PUBLIEE" },
    select: { slug: true },
    take: 100,
  });
  return posts.map((post) => ({ slug: post.slug }));
}

async function getPost(slug: string) {
  return prisma.newsPost.findFirst({
    where: { slug, status: "PUBLIEE" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      updatedAt: true,
      cover: { select: { url: true, alt: true, credit: true } },
      category: { select: { slug: true, name: true, color: true } },
      author: { select: { name: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Actualité introuvable" };

  return {
    title: post.title,
    description: truncate(post.excerpt, 300),
    alternates: { canonical: `/actualites/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: truncate(post.excerpt, 300),
      publishedTime: post.publishedAt?.toISOString(),
      images: post.cover?.url ? [{ url: post.cover.url }] : undefined,
    },
  };
}

export default async function ActualitePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await prisma.newsPost.findMany({
    where: {
      status: "PUBLIEE",
      id: { not: post.id },
      ...(post.category ? { category: { slug: post.category.slug } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      cover: { select: { url: true, alt: true } },
      category: { select: { name: true, color: true } },
    },
  });

  const words = stripHtml(post.content).split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.round(words / 220));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Mairie de Chessy-les-Mines" },
    publisher: { "@type": "Organization", name: "Mairie de Chessy-les-Mines" },
    image: post.cover?.url ? [post.cover.url] : undefined,
  };

  return (
    <>
      <ReadingProgress />
      <Breadcrumb
        items={[
          { label: "Actualités", href: "/actualites" },
          { label: post.title },
        ]}
      />

      <article>
        <header className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
          <Container size="lecture" className="py-10 sm:py-14">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {post.category ? (
                <Link
                  href={`/actualites?categorie=${post.category.slug}`}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: post.category.color }}
                >
                  {post.category.name}
                </Link>
              ) : null}
              {post.publishedAt ? (
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="text-[color:var(--texte-doux)]"
                >
                  {formatDate(post.publishedAt)}
                </time>
              ) : null}
              <span className="flex items-center gap-1.5 text-[color:var(--texte-doux)]">
                <Icon name="Timer" className="size-3.5" />
                {readingMinutes} min de lecture
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-azur-800 sm:text-4xl lg:text-5xl dark:text-white">
              {post.title}
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-[color:var(--texte-doux)]">
              {post.excerpt}
            </p>
          </Container>
        </header>

        {post.cover?.url ? (
          <Container size="lecture" className="-mt-0 pt-8">
            <figure>
              <Visual
                source={post.cover}
                ratio="16/9"
                className="rounded-card shadow-relief"
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
              {post.cover.credit ? (
                <figcaption className="mt-2 text-xs text-[color:var(--texte-doux)]">
                  {post.cover.credit}
                </figcaption>
              ) : null}
            </figure>
          </Container>
        ) : null}

        <Container size="lecture" className="py-10 sm:py-12">
          <div className="contenu" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="sans-impression mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--bordure)] pt-6">
            <ButtonLink href="/actualites" variant="contour" icon="ArrowLeft" size="sm">
              Toutes les actualités
            </ButtonLink>
            <p className="text-xs text-[color:var(--texte-doux)]">
              Publié par la mairie de Chessy-les-Mines
              {post.author ? ` — ${post.author.name}` : ""}
            </p>
          </div>
        </Container>
      </article>

      {related.length > 0 ? (
        <Section tone="clair">
          <Container>
            <SectionHeader
              title="À lire également"
              subtitle={post.category ? `Dans la rubrique « ${post.category.name} »` : undefined}
            />
            <Grid columns={3}>
              {related.map((item) => (
                <NewsCard key={item.slug} post={item} />
              ))}
            </Grid>
          </Container>
        </Section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
