import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { getPublishedPages } from "@/lib/pages";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Plan du site",
  description:
    "L'arborescence complète du site de la mairie de Chessy-les-Mines : rubriques, pages, démarches et services en ligne.",
  alternates: { canonical: "/plan-du-site" },
};

const SERVICES = [
  { label: "Réserver la salle des fêtes", href: "/services/salle-des-fetes", icon: "PartyPopper" },
  { label: "Emprunter du matériel", href: "/services/pret-de-materiel", icon: "Package" },
  { label: "Signaler un problème", href: "/services/signalement", icon: "TriangleAlert" },
  { label: "Suivre une demande", href: "/suivi", icon: "Search" },
  { label: "Contacter la mairie", href: "/contact", icon: "Mail" },
];

const EDITORIAL = [
  { label: "Actualités", href: "/actualites", icon: "Newspaper" },
  { label: "Agenda", href: "/agenda", icon: "CalendarDays" },
  { label: "Annuaire des associations", href: "/associations", icon: "HeartHandshake" },
  { label: "Recherche", href: "/recherche", icon: "Search" },
  { label: "Flux RSS des actualités", href: "/flux.xml", icon: "Rss" },
  { label: "Agenda au format iCalendar", href: "/agenda.ics", icon: "CalendarPlus" },
];

export default async function PlanDuSitePage() {
  const [pages, demarches] = await Promise.all([
    getPublishedPages(),
    prisma.demarche.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { slug: true, title: true, category: true },
    }),
  ]);

  const roots = pages.filter((page) => !page.parentId && page.slug !== "accueil");
  const childrenOf = (slug: string) => pages.filter((page) => page.parent?.slug === slug);
  const legal = pages.filter((page) => !page.showInNav && !page.parentId && page.slug !== "accueil");

  return (
    <>
      <Breadcrumb items={[{ label: "Plan du site" }]} />
      <PageHeader
        eyebrow="Navigation"
        icon="LayoutList"
        title="Plan du site"
        excerpt="Toutes les pages du site, présentées par rubrique. Cette page est aussi utile si vous naviguez au clavier ou avec un lecteur d'écran."
      />

      <Section>
        <Container>
          <Grid columns={2}>
            {roots
              .filter((page) => page.showInNav)
              .map((page) => {
                const children = childrenOf(page.slug);
                return (
                  <Card key={page.slug} className="p-5 sm:p-6">
                    <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-azur-800 dark:text-white">
                      {page.icon ? (
                        <Icon name={page.icon} className="size-5 text-dore-600 dark:text-dore-300" />
                      ) : null}
                      <Link href={`/${page.slug}`} className="hover:underline">
                        {page.navLabel ?? page.title}
                      </Link>
                    </h2>
                    {page.excerpt ? (
                      <p className="mt-1.5 text-sm text-[color:var(--texte-doux)]">{page.excerpt}</p>
                    ) : null}
                    {children.length > 0 ? (
                      <ul className="mt-4 space-y-1.5 border-t border-[color:var(--bordure)] pt-4">
                        {children.map((child) => (
                          <li key={child.slug}>
                            <Link
                              href={`/${child.slug}`}
                              className="group flex items-start gap-2 text-sm transition-colors hover:text-azur-600 dark:hover:text-azur-200"
                            >
                              <Icon
                                name="ChevronRight"
                                className="mt-1 size-3.5 shrink-0 text-[color:var(--texte-doux)]/50 transition-transform group-hover:translate-x-0.5"
                              />
                              {child.navLabel ?? child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Card>
                );
              })}

            <Card className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-azur-800 dark:text-white">
                <Icon name="Sparkles" className="size-5 text-dore-600 dark:text-dore-300" />
                Services en ligne
              </h2>
              <ul className="mt-4 space-y-1.5 border-t border-[color:var(--bordure)] pt-4">
                {SERVICES.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-sm transition-colors hover:text-azur-600 dark:hover:text-azur-200"
                    >
                      <Icon name={item.icon} className="size-4 shrink-0 opacity-60" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-azur-800 dark:text-white">
                <Icon name="Newspaper" className="size-5 text-dore-600 dark:text-dore-300" />
                Information et annuaires
              </h2>
              <ul className="mt-4 space-y-1.5 border-t border-[color:var(--bordure)] pt-4">
                {EDITORIAL.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-sm transition-colors hover:text-azur-600 dark:hover:text-azur-200"
                    >
                      <Icon name={item.icon} className="size-4 shrink-0 opacity-60" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section tone="clair">
        <Container>
          <SectionHeader
            title="Toutes les fiches démarches"
            subtitle={`${demarches.length} fiches pratiques, classées par thème.`}
          />
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {demarches.map((demarche) => (
              <li key={demarche.slug}>
                <Link
                  href={`/demarches/${demarche.slug}`}
                  className="group flex items-start gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-[color:var(--surface)] hover:text-azur-600 dark:hover:text-azur-200"
                >
                  <Icon
                    name="ChevronRight"
                    className="mt-1 size-3.5 shrink-0 text-[color:var(--texte-doux)]/50 transition-transform group-hover:translate-x-0.5"
                  />
                  {demarche.title}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {legal.length > 0 ? (
        <Section>
          <Container size="lecture">
            <SectionHeader title="Informations légales" level={2} />
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legal.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/${page.slug}`}
                    className="text-sm text-azur-600 hover:underline dark:text-azur-200"
                  >
                    {page.navLabel ?? page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
