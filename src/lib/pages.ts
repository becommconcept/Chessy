import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { truncate } from "@/lib/utils";

/** Charge une page publiée avec ses blocs ordonnés. */
export async function getPage(slug: string) {
  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLIEE" },
    select: {
      id: true,
      slug: true,
      title: true,
      navLabel: true,
      excerpt: true,
      template: true,
      icon: true,
      noIndex: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      cover: { select: { url: true, alt: true } },
      parent: { select: { slug: true, title: true, navLabel: true } },
      blocks: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, data: true, visible: true },
      },
    },
  });

  return page;
}

export async function getPageOr404(slug: string) {
  const page = await getPage(slug);
  if (!page) notFound();
  return page;
}

/** Métadonnées d'une page du gestionnaire de contenu. */
export async function pageMetadata(slug: string): Promise<Metadata> {
  const page = await getPage(slug);
  if (!page) return { title: "Page introuvable" };

  const description = page.seoDescription ?? (page.excerpt ? truncate(page.excerpt, 300) : undefined);

  return {
    title: page.seoTitle ?? page.title,
    description,
    robots: page.noIndex ? { index: false, follow: false } : undefined,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.seoTitle ?? page.title,
      description,
      type: "article",
      images: page.cover?.url ? [{ url: page.cover.url }] : undefined,
    },
  };
}

/** Toutes les pages publiées : sitemap et plan du site. */
export async function getPublishedPages() {
  return prisma.page.findMany({
    where: { status: "PUBLIEE", noIndex: false },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: {
      slug: true,
      title: true,
      navLabel: true,
      excerpt: true,
      icon: true,
      updatedAt: true,
      parentId: true,
      showInNav: true,
      parent: { select: { slug: true, title: true, navLabel: true } },
    },
  });
}
