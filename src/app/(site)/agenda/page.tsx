import type { Metadata } from "next";
import Link from "next/link";

import { AgendaCalendar } from "@/components/site/AgendaCalendar";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { EventCard } from "@/components/site/cards";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Container, EmptyState, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { EVENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { cn } from "@/lib/utils";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "Toutes les manifestations à Chessy-les-Mines : conseil municipal, fêtes, spectacles, permanences, animations associatives.",
  alternates: { canonical: "/agenda" },
};

type Props = { searchParams: Promise<{ categorie?: string; passe?: string }> };

export default async function AgendaPage({ searchParams }: Props) {
  const { categorie, passe } = await searchParams;
  const showPast = passe === "1";
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

  const [upcoming, past, calendarEvents] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: "PUBLIEE",
        startAt: { gte: startOfToday },
        ...(categorie ? { category: categorie } : {}),
      },
      orderBy: { startAt: "asc" },
      take: 40,
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
    }),
    showPast
      ? prisma.event.findMany({
          where: { status: "PUBLIEE", startAt: { lt: startOfToday } },
          orderBy: { startAt: "desc" },
          take: 12,
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
        })
      : Promise.resolve([]),
    prisma.event.findMany({
      where: { status: "PUBLIEE" },
      orderBy: { startAt: "asc" },
      select: {
        slug: true,
        title: true,
        startAt: true,
        endAt: true,
        allDay: true,
        place: true,
        category: true,
      },
    }),
  ]);

  const categories = [...new Set(calendarEvents.map((event) => event.category).filter(Boolean))] as string[];

  return (
    <>
      <Breadcrumb items={[{ label: "Agenda", href: "/agenda" }]} />
      <PageHeader
        eyebrow="Sortir à Chessy"
        icon="CalendarDays"
        title="Agenda des manifestations"
        excerpt="Conseil municipal, fêtes de village, spectacles, permanences, animations associatives : tous les rendez-vous de la commune."
      />

      <Section>
        <Container>
          <SectionHeader
            title="Le mois en un coup d'œil"
            subtitle="Cliquez sur une date pour afficher les manifestations du jour."
            action={
              <a
                href="/agenda.ics"
                className="inline-flex items-center gap-2 rounded-field border border-azur-600/30 px-3.5 py-2 text-sm font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
              >
                <Icon name="CalendarPlus" className="size-4" />
                Ajouter à mon agenda
              </a>
            }
          />
          <AgendaCalendar
            events={calendarEvents.map((event) => ({
              ...event,
              startAt: event.startAt.toISOString(),
              endAt: event.endAt?.toISOString() ?? null,
            }))}
          />
        </Container>
      </Section>

      <Section tone="clair">
        <Container>
          <SectionHeader title="Les prochains rendez-vous" />

          {categories.length > 0 ? (
            <nav aria-label="Filtrer par type de manifestation" className="mb-7">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href="/agenda"
                    aria-current={!categorie ? "page" : undefined}
                    className={cn(
                      "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                      !categorie
                        ? "border-azur-600 bg-azur-600 text-white"
                        : "border-[color:var(--bordure)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-alt)]",
                    )}
                  >
                    Tout
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/agenda?categorie=${category}`}
                      aria-current={categorie === category ? "page" : undefined}
                      className={cn(
                        "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                        categorie === category
                          ? "border-azur-600 bg-azur-600 text-white"
                          : "border-[color:var(--bordure)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-alt)]",
                      )}
                    >
                      {labelOf(EVENT_CATEGORY_LABELS, category)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {upcoming.length === 0 ? (
            <EmptyState
              icon="CalendarX"
              title="Aucune manifestation à venir"
              description="L'agenda est mis à jour dès qu'une nouvelle date est annoncée. Vous organisez un évènement ? Signalez-le à la mairie."
            />
          ) : (
            <Grid columns={3}>
              {upcoming.map((event, index) => (
                <Reveal key={event.slug} delay={index * 50} className="h-full">
                  <EventCard event={event} />
                </Reveal>
              ))}
            </Grid>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={showPast ? "/agenda" : "/agenda?passe=1"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-azur-600 hover:underline dark:text-azur-200"
            >
              <Icon name={showPast ? "ChevronUp" : "History"} className="size-4" />
              {showPast ? "Masquer les manifestations passées" : "Voir les manifestations passées"}
            </Link>
          </div>

          {showPast && past.length > 0 ? (
            <div className="mt-9">
              <h3 className="mb-5 font-display text-lg font-bold text-azur-800 dark:text-white">
                Manifestations passées
              </h3>
              <div className="space-y-3">
                {past.map((event) => (
                  <div key={event.slug} className="opacity-75">
                    <EventCard event={event} layout="liste" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container size="lecture">
          <div className="rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-azur-800 dark:text-white">
              <Icon name="Megaphone" className="size-5 text-dore-600 dark:text-dore-300" />
              Vous organisez une manifestation ?
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
              Faites-la connaître : transmettez-nous la date, le lieu, l'affiche et les informations
              pratiques, et nous la publierons dans cet agenda ainsi que dans le bulletin municipal.
              Pensez également à déclarer votre manifestation en mairie au moins deux mois avant, et
              à réserver la salle et le matériel dont vous avez besoin.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/contact?objet=Vie%20associative%20et%20manifestations"
                className="inline-flex h-11 items-center gap-2 rounded-field bg-azur-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azur-700"
              >
                <Icon name="Send" className="size-4" />
                Annoncer un évènement
              </Link>
              <Link
                href="/demarches/organiser-une-manifestation"
                className="inline-flex h-11 items-center gap-2 rounded-field border border-azur-600/30 px-5 text-[0.9375rem] font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
              >
                <Icon name="ClipboardList" className="size-4" />
                Les démarches à prévoir
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
