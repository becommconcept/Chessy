import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { AssociationCard, EventCard } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Visual } from "@/components/ui/Visual";
import { Badge, Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { ASSOCIATION_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { stripHtml, truncate } from "@/lib/utils";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const associations = await prisma.association.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return associations.map((association) => ({ slug: association.slug }));
}

async function getAssociation(slug: string) {
  return prisma.association.findFirst({
    where: { slug, active: true },
    include: {
      logo: { select: { url: true, alt: true } },
      events: {
        where: { status: "PUBLIEE", startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 3,
        select: {
          slug: true,
          title: true,
          excerpt: true,
          startAt: true,
          endAt: true,
          allDay: true,
          place: true,
          category: true,
          priceInfo: true,
          cover: { select: { url: true, alt: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const association = await getAssociation(slug);
  if (!association) return { title: "Association introuvable" };

  return {
    title: association.name,
    description: truncate(stripHtml(association.description), 300),
    alternates: { canonical: `/associations/${association.slug}` },
  };
}

export default async function AssociationPage({ params }: Props) {
  const { slug } = await params;
  const association = await getAssociation(slug);
  if (!association) notFound();

  const others = await prisma.association.findMany({
    where: { active: true, category: association.category, slug: { not: association.slug } },
    orderBy: { order: "asc" },
    take: 3,
    select: {
      slug: true,
      name: true,
      shortName: true,
      category: true,
      description: true,
      logo: { select: { url: true, alt: true } },
    },
  });

  const contacts = [
    association.email
      ? { icon: "Mail", label: "Courriel", value: association.email, href: `mailto:${association.email}` }
      : null,
    association.phone
      ? { icon: "Phone", label: "Téléphone", value: association.phone, href: `tel:${association.phone.replace(/\s/g, "")}` }
      : null,
    association.website
      ? { icon: "Globe", label: "Site internet", value: association.website.replace(/^https?:\/\//, ""), href: association.website }
      : null,
    association.facebook
      ? { icon: "Facebook", label: "Facebook", value: "Page Facebook", href: association.facebook }
      : null,
  ].filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Les associations", href: "/associations" },
          { label: association.shortName || association.name },
        ]}
      />

      <Section className="pt-10 sm:pt-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3">
              <div className="flex items-start gap-5">
                <Visual
                  source={association.logo}
                  ratio="1/1"
                  className="size-20 shrink-0 rounded-card shadow-douce sm:size-24"
                  sizes="96px"
                  alt={`Logo de ${association.name}`}
                />
                <div className="min-w-0">
                  <Badge tone="malachite" className="mb-2">
                    {labelOf(ASSOCIATION_CATEGORY_LABELS, association.category)}
                  </Badge>
                  <h1 className="font-display text-2xl leading-tight font-bold text-azur-800 sm:text-3xl lg:text-4xl dark:text-white">
                    {association.name}
                  </h1>
                </div>
              </div>

              <div
                className="contenu mt-7"
                dangerouslySetInnerHTML={{ __html: association.description }}
              />

              {association.events.length > 0 ? (
                <div className="mt-10">
                  <h2 className="mb-4 font-display text-xl font-bold text-azur-800 dark:text-white">
                    Prochains rendez-vous de l'association
                  </h2>
                  <div className="space-y-3">
                    {association.events.map((event) => (
                      <EventCard key={event.slug} event={event} layout="liste" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="lg:col-span-2">
              <div className="space-y-4 lg:sticky lg:top-32">
                <Card className="overflow-hidden">
                  <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
                    <p className="font-display text-sm font-bold">Contact et informations</p>
                  </div>
                  <dl className="space-y-4 p-5 text-sm">
                    {association.president ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="UserCheck" className="size-4" />
                          Présidence
                        </dt>
                        <dd className="mt-1 pl-6">{association.president}</dd>
                      </div>
                    ) : null}
                    {association.schedule ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="Clock" className="size-4" />
                          Créneaux
                        </dt>
                        <dd className="mt-1 pl-6">{association.schedule}</dd>
                      </div>
                    ) : null}
                    {association.fee ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="Coins" className="size-4" />
                          Cotisation
                        </dt>
                        <dd className="mt-1 pl-6">{association.fee}</dd>
                      </div>
                    ) : null}
                    {association.address ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="MapPin" className="size-4" />
                          Adresse
                        </dt>
                        <dd className="mt-1 pl-6">{association.address}</dd>
                      </div>
                    ) : null}

                    {contacts.map((contact) => (
                      <div key={contact.label}>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name={contact.icon} className="size-4" />
                          {contact.label}
                        </dt>
                        <dd className="mt-1 pl-6">
                          <a
                            href={contact.href}
                            target={contact.href.startsWith("http") ? "_blank" : undefined}
                            rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="break-all text-azur-600 hover:underline dark:text-azur-200"
                          >
                            {contact.value}
                          </a>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {contacts.length === 0 && !association.president ? (
                    <p className="border-t border-[color:var(--bordure)] bg-dore-50 p-5 text-sm leading-relaxed text-dore-900 dark:bg-dore-900/25 dark:text-dore-100">
                      <strong>Coordonnées à compléter.</strong> Vous êtes responsable de cette
                      association ? Transmettez-nous vos coordonnées et vos horaires : nous mettrons
                      la fiche à jour.
                    </p>
                  ) : null}

                  <div className="sans-impression space-y-2.5 border-t border-[color:var(--bordure)] p-5">
                    <ButtonLink
                      href={`/contact?objet=Vie%20associative%20et%20manifestations&type=CONTACT`}
                      variant="contour"
                      fullWidth
                      icon="Mail"
                    >
                      Écrire à la mairie à ce sujet
                    </ButtonLink>
                  </div>
                </Card>

                <Card className="bg-azur-800 p-5 text-white dark:bg-azur-950">
                  <p className="flex items-center gap-2 font-display text-sm font-bold text-dore-200">
                    <Icon name="Sparkles" className="size-4" />
                    Ressources pour les associations
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {[
                      { label: "Réserver une salle", href: "/services/salle-des-fetes" },
                      { label: "Emprunter du matériel", href: "/services/pret-de-materiel" },
                      { label: "Déclarer une manifestation", href: "/demarches/organiser-une-manifestation" },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
                        >
                          <Icon name="ChevronRight" className="size-3.5 text-dore-300" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {others.length > 0 ? (
        <Section tone="clair">
          <Container>
            <SectionHeader
              title="Dans le même domaine"
              action={
                <Link
                  href="/associations"
                  className="text-sm font-semibold text-azur-600 hover:underline dark:text-azur-200"
                >
                  Annuaire complet
                </Link>
              }
            />
            <Grid columns={3}>
              {others.map((item) => (
                <AssociationCard key={item.slug} association={item} />
              ))}
            </Grid>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
