import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { prisma } from "@/lib/db";
import { getBreadcrumb, getSiblingPages } from "@/lib/navigation";
import { getPageOr404, pageMetadata } from "@/lib/pages";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string[] }> };

/** Pré-génère toutes les pages publiées du gestionnaire de contenu. */
export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { status: "PUBLIEE", slug: { not: "accueil" } },
    select: { slug: true },
  });
  return pages.map((page) => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata(slug.join("/"));
}

export default async function ContenuPage({ params }: Params) {
  const { slug } = await params;
  const path = slug.join("/");
  const page = await getPageOr404(path);

  const [trail, siblings] = await Promise.all([getBreadcrumb(path), getSiblingPages(path)]);

  // Le bloc « bandeau » porte déjà le titre de niveau 1 : on n'ajoute pas d'en-tête.
  const startsWithHero = page.blocks[0]?.type === "hero" && page.blocks[0]?.visible;

  return (
    <>
      <Breadcrumb items={trail} />

      {startsWithHero ? null : (
        <PageHeader
          title={page.title}
          excerpt={page.excerpt}
          cover={page.cover}
          eyebrow={page.parent ? (page.parent.navLabel ?? page.parent.title) : null}
          icon={page.icon}
          currentHref={`/${page.slug}`}
          subNav={siblings?.children}
        />
      )}

      <BlockRenderer blocks={page.blocks} />
    </>
  );
}
