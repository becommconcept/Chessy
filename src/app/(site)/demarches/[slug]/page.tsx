import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PrintButton } from "@/components/site/PrintButton";
import { DemarcheCard } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge, Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { DEMARCHE_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { safeJson, truncate } from "@/lib/utils";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const demarches = await prisma.demarche.findMany({ select: { slug: true } });
  return demarches.map((demarche) => ({ slug: demarche.slug }));
}

async function getDemarche(slug: string) {
  return prisma.demarche.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const demarche = await getDemarche(slug);
  if (!demarche) return { title: "Démarche introuvable" };

  return {
    title: demarche.title,
    description: truncate(demarche.summary, 300),
    alternates: { canonical: `/demarches/${demarche.slug}` },
  };
}

export default async function DemarchePage({ params }: Props) {
  const { slug } = await params;
  const demarche = await getDemarche(slug);
  if (!demarche) notFound();

  const related = await prisma.demarche.findMany({
    where: { category: demarche.category, slug: { not: demarche.slug } },
    orderBy: { order: "asc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      summary: true,
      icon: true,
      onlineUrl: true,
      internalPath: true,
      processTime: true,
      cost: true,
    },
  });

  const documents = safeJson<string[]>(demarche.requiredDocs, []);
  const categoryLabel = labelOf(DEMARCHE_CATEGORY_LABELS, demarche.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: demarche.title,
    description: demarche.summary,
    totalTime: demarche.processTime ?? undefined,
    estimatedCost: demarche.cost ?? undefined,
    supply: documents.map((document) => ({ "@type": "HowToSupply", name: document })),
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Démarches", href: "/demarches" },
          { label: categoryLabel, href: `/demarches?theme=${demarche.category}` },
          { label: demarche.title },
        ]}
      />

      <article>
        <Section className="pt-10 pb-0 sm:pt-12">
          <Container>
            <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-3">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-azur-600 text-white shadow-douce">
                    <Icon name={demarche.icon} fallback="ClipboardList" className="size-6" />
                  </span>
                  <div>
                    <Badge tone="azur" className="mb-2">
                      {categoryLabel}
                    </Badge>
                    <h1 className="font-display text-2xl leading-tight font-bold text-azur-800 sm:text-4xl dark:text-white">
                      {demarche.title}
                    </h1>
                  </div>
                </div>

                <p className="mt-5 text-lg leading-relaxed text-[color:var(--texte-doux)]">
                  {demarche.summary}
                </p>

                <div
                  className="contenu mt-8"
                  dangerouslySetInnerHTML={{ __html: demarche.content }}
                />

                {documents.length > 0 ? (
                  <div className="mt-9 rounded-card border-l-4 border-dore-400 bg-dore-50 p-5 dark:bg-dore-900/20">
                    <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-dore-900 dark:text-dore-100">
                      <Icon name="Paperclip" className="size-5" />
                      Pièces à fournir
                    </h2>
                    <ul className="mt-3.5 space-y-2">
                      {documents.map((document) => (
                        <li key={document} className="flex items-start gap-2.5 text-[0.9375rem]">
                          <Icon
                            name="CircleCheck"
                            className="mt-0.5 size-4.5 shrink-0 text-dore-600 dark:text-dore-300"
                          />
                          {document}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {/* Encadré d'action */}
              <aside className="lg:col-span-2">
                <div className="space-y-4 lg:sticky lg:top-32">
                  <Card className="overflow-hidden">
                    <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
                      <p className="font-display text-sm font-bold">L'essentiel</p>
                    </div>
                    <dl className="space-y-4 p-5 text-sm">
                      {demarche.audience ? (
                        <div>
                          <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                            <Icon name="Users" className="size-4" />
                            Public concerné
                          </dt>
                          <dd className="mt-1 pl-6">{demarche.audience}</dd>
                        </div>
                      ) : null}
                      {demarche.processTime ? (
                        <div>
                          <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                            <Icon name="Timer" className="size-4" />
                            Délai
                          </dt>
                          <dd className="mt-1 pl-6">{demarche.processTime}</dd>
                        </div>
                      ) : null}
                      {demarche.cost ? (
                        <div>
                          <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                            <Icon name="Coins" className="size-4" />
                            Coût
                          </dt>
                          <dd className="mt-1 pl-6">{demarche.cost}</dd>
                        </div>
                      ) : null}
                    </dl>

                    <div className="sans-impression space-y-2.5 border-t border-[color:var(--bordure)] p-5">
                      {demarche.internalPath ? (
                        <ButtonLink href={demarche.internalPath} fullWidth icon="Zap">
                          Faire ma demande en ligne
                        </ButtonLink>
                      ) : null}
                      {demarche.onlineUrl ? (
                        <ButtonLink
                          href={demarche.onlineUrl}
                          variant={demarche.internalPath ? "contour" : "principal"}
                          fullWidth
                          icon="ExternalLink"
                        >
                          {demarche.onlineLabel || "Téléservice national"}
                        </ButtonLink>
                      ) : null}
                      <ButtonLink href="/contact" variant="discret" fullWidth icon="Mail">
                        Poser une question
                      </ButtonLink>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <p className="flex items-center gap-2 font-display text-sm font-bold">
                      <Icon name="Landmark" className="size-4 text-dore-600 dark:text-dore-300" />
                      Faire la démarche sur place
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                      L'accueil de la mairie vous reçoit sans rendez-vous du lundi au vendredi.
                      Place de la Mairie, 69380 Chessy-les-Mines.
                    </p>
                    <a
                      href="tel:+33478439203"
                      className="mt-3 inline-flex items-center gap-2 font-display text-base font-bold text-azur-700 hover:underline dark:text-azur-200"
                    >
                      <Icon name="Phone" className="size-4" />
                      04 78 43 92 03
                    </a>
                  </Card>

                  <PrintButton />
                </div>
              </aside>
            </div>
          </Container>
        </Section>

        {related.length > 0 ? (
          <Section tone="clair" className="mt-14">
            <Container>
              <SectionHeader
                title="Démarches associées"
                subtitle={`Autres fiches de la rubrique « ${categoryLabel} »`}
                action={
                  <Link
                    href="/demarches"
                    className="text-sm font-semibold text-azur-600 hover:underline dark:text-azur-200"
                  >
                    Toutes les démarches
                  </Link>
                }
              />
              <Grid columns={3}>
                {related.map((item) => (
                  <DemarcheCard key={item.slug} demarche={item} />
                ))}
              </Grid>
            </Container>
          </Section>
        ) : null}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
