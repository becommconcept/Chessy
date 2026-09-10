import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { getPageOr404, pageMetadata } from "@/lib/pages";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("demarches");
}

/**
 * La page « Démarches » est une page du gestionnaire de contenu : son
 * introduction, ses accès rapides et ses encadrés restent modifiables par la
 * mairie, tandis que la liste des fiches est alimentée automatiquement par le
 * bloc « Liste de démarches ».
 */
export default async function DemarchesPage() {
  const page = await getPageOr404("demarches");
  const startsWithHero = page.blocks[0]?.type === "hero" && page.blocks[0]?.visible;

  return (
    <>
      <Breadcrumb items={[{ label: "Démarches", href: "/demarches" }]} />
      {startsWithHero ? null : (
        <PageHeader
          eyebrow="La mairie à votre service"
          icon="ClipboardList"
          title={page.title}
          excerpt={page.excerpt}
          cover={page.cover}
        />
      )}
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}
