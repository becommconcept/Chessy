import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { AssociationCard } from "@/components/site/cards";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Container, EmptyState, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { ASSOCIATION_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Annuaire des associations",
  description:
    "Sport, culture, musique, patrimoine, solidarité, jeunesse : toutes les associations de Chessy-les-Mines et leurs coordonnées.",
  alternates: { canonical: "/associations" },
};

type Props = { searchParams: Promise<{ categorie?: string }> };

export default async function AssociationsPage({ searchParams }: Props) {
  const { categorie } = await searchParams;

  const all = await prisma.association.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      shortName: true,
      category: true,
      description: true,
      logo: { select: { url: true, alt: true } },
    },
  });

  const categories = [...new Set(all.map((association) => association.category))];
  const visible = categorie ? all.filter((association) => association.category === categorie) : all;

  return (
    <>
      <Breadcrumb items={[{ label: "Les associations", href: "/associations" }]} />
      <PageHeader
        eyebrow="Vie associative"
        icon="HeartHandshake"
        title="Les associations de Chessy"
        excerpt={`${all.length} associations font vivre le village toute l'année : sport, musique, danse, patrimoine minier, entraide, écoles. Une envie, une compétence, un peu de temps ? Elles vous attendent.`}
      />

      <Section>
        <Container>
          <nav aria-label="Filtrer par domaine" className="mb-8">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/associations"
                  aria-current={!categorie ? "page" : undefined}
                  className={cn(
                    "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    !categorie
                      ? "border-azur-600 bg-azur-600 text-white"
                      : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                  )}
                >
                  Toutes ({all.length})
                </Link>
              </li>
              {categories.map((category) => {
                const count = all.filter((association) => association.category === category).length;
                const active = categorie === category;
                return (
                  <li key={category}>
                    <Link
                      href={`/associations?categorie=${category}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                        active
                          ? "border-azur-600 bg-azur-600 text-white"
                          : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                      )}
                    >
                      {labelOf(ASSOCIATION_CATEGORY_LABELS, category)} ({count})
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {visible.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Aucune association dans ce domaine"
              description="Choisissez un autre domaine ou consultez l'annuaire complet."
            />
          ) : (
            <Grid columns={3}>
              {visible.map((association, index) => (
                <Reveal key={association.slug} delay={index * 45} className="h-full">
                  <AssociationCard association={association} />
                </Reveal>
              ))}
            </Grid>
          )}
        </Container>
      </Section>

      <Section tone="sable">
        <Container>
          <SectionHeader
            eyebrow="Vous animez une association ?"
            title="La commune est à vos côtés"
            subtitle="Salles, matériel, subventions, communication : voici ce que la mairie met à votre disposition."
          />
          <Grid columns={2}>
            {[
              {
                icon: "PartyPopper",
                title: "Réserver une salle",
                text: "La salle des fêtes est gratuite pour les associations de Chessy à but non lucratif. Réservation en ligne, disponibilités en temps réel.",
                href: "/services/salle-des-fetes",
                cta: "Voir les disponibilités",
              },
              {
                icon: "Package",
                title: "Emprunter du matériel",
                text: "Tables, chaises, barnums, grilles d'exposition, sonorisation, percolateurs : le matériel communal est prêté gratuitement.",
                href: "/services/pret-de-materiel",
                cta: "Voir le matériel",
              },
              {
                icon: "ClipboardList",
                title: "Déclarer une manifestation",
                text: "Débit de boissons temporaire, occupation du domaine public, sécurité : le dossier à déposer deux mois avant.",
                href: "/demarches/organiser-une-manifestation",
                cta: "La procédure",
              },
              {
                icon: "Megaphone",
                title: "Faire connaître vos activités",
                text: "Publication dans l'agenda du site, dans le bulletin municipal Chessy Info et sur PanneauPocket.",
                href: "/contact?objet=Vie%20associative%20et%20manifestations",
                cta: "Nous transmettre une information",
              },
              {
                icon: "Coins",
                title: "Demander une subvention",
                text: "Un dossier annuel comprenant bilan, budget prévisionnel et projet est examiné par la commission vie associative.",
                href: "/la-mairie/budget",
                cta: "Comprendre le calendrier",
              },
              {
                icon: "Users",
                title: "Mettre à jour votre fiche",
                text: "Changement de président, de coordonnées, d'horaires : signalez-le pour que l'annuaire reste juste.",
                href: "/contact?objet=Vie%20associative%20et%20manifestations",
                cta: "Corriger ma fiche",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 60} className="h-full">
                <div className="flex h-full flex-col rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-5 sm:p-6">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-field bg-azur-50 text-azur-600 dark:bg-azur-900/60 dark:text-azur-200">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <h3 className="font-display text-[1.0625rem] font-bold text-azur-800 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                    {item.text}
                  </p>
                  <Link
                    href={item.href}
                    className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-azur-600 dark:text-azur-200"
                  >
                    {item.cta}
                    <Icon
                      name="ArrowRight"
                      className="size-4 transition-transform duration-300 ease-douce group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </Reveal>
            ))}
          </Grid>
        </Container>
      </Section>
    </>
  );
}
