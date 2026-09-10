import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { EventCard } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Visual } from "@/components/ui/Visual";
import { Badge, Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import { EVENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { formatDate, formatDateRange, formatTimeRange, truncate } from "@/lib/utils";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLIEE" },
    select: { slug: true },
    take: 100,
  });
  return events.map((event) => ({ slug: event.slug }));
}

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: "PUBLIEE" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      description: true,
      startAt: true,
      endAt: true,
      allDay: true,
      place: true,
      address: true,
      lat: true,
      lng: true,
      organizer: true,
      priceInfo: true,
      audience: true,
      category: true,
      registrationUrl: true,
      contactEmail: true,
      cover: { select: { url: true, alt: true } },
      association: { select: { slug: true, name: true, shortName: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Évènement introuvable" };

  return {
    title: event.title,
    description: truncate(event.excerpt ?? event.description.replace(/<[^>]+>/g, " "), 300),
    alternates: { canonical: `/agenda/${event.slug}` },
    openGraph: {
      type: "article",
      title: event.title,
      images: event.cover?.url ? [{ url: event.cover.url }] : undefined,
    },
  };
}

export default async function EvenementPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const others = await prisma.event.findMany({
    where: { status: "PUBLIEE", id: { not: event.id }, startAt: { gte: new Date() } },
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
  });

  const past = event.startAt < new Date(new Date().setHours(0, 0, 0, 0));

  /* Lien d'ajout au calendrier personnel (fichier iCalendar par évènement). */
  const icsHref = `/agenda/${event.slug}/evenement.ics`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startAt.toISOString(),
    endDate: (event.endAt ?? event.startAt).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.place ?? "Chessy-les-Mines",
      address: event.address ?? "69380 Chessy-les-Mines, France",
    },
    organizer: { "@type": "Organization", name: event.organizer ?? "Mairie de Chessy-les-Mines" },
    description: truncate(event.description.replace(/<[^>]+>/g, " "), 400),
    image: event.cover?.url ? [event.cover.url] : undefined,
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Agenda", href: "/agenda" }, { label: event.title }]} />

      <article>
        <Section className="pt-10 pb-0 sm:pt-12">
          <Container>
            <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {event.category ? (
                    <Badge tone="azur">{labelOf(EVENT_CATEGORY_LABELS, event.category)}</Badge>
                  ) : null}
                  {past ? <Badge tone="neutre" icon="History">Manifestation passée</Badge> : null}
                  {event.audience ? <Badge tone="dore">{event.audience.replace(/_/g, " ").toLowerCase()}</Badge> : null}
                </div>

                <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-azur-800 sm:text-4xl lg:text-5xl dark:text-white">
                  {event.title}
                </h1>

                {event.excerpt ? (
                  <p className="mt-4 text-lg leading-relaxed text-[color:var(--texte-doux)]">
                    {event.excerpt}
                  </p>
                ) : null}

                <Visual
                  source={event.cover}
                  ratio="16/9"
                  className="mt-7 rounded-card shadow-relief"
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />

                <div
                  className="contenu mt-8"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>

              {/* Encadré pratique */}
              <aside className="lg:col-span-2">
                <Card className="lg:sticky lg:top-32">
                  <div className="border-b border-[color:var(--bordure)] bg-azur-800 p-5 text-white dark:bg-azur-950">
                    <p className="text-xs font-bold tracking-[0.13em] uppercase text-dore-300">
                      Informations pratiques
                    </p>
                    <p className="mt-2 font-display text-xl font-bold capitalize">
                      {formatDateRange(event.startAt, event.endAt)}
                    </p>
                    {!event.allDay ? (
                      <p className="mt-1 text-sm text-white/80">
                        {formatTimeRange(event.startAt, event.endAt)}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-white/80">Toute la journée</p>
                    )}
                  </div>

                  <dl className="space-y-4 p-5 text-sm">
                    {event.place ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="MapPin" className="size-4" />
                          Lieu
                        </dt>
                        <dd className="mt-1 pl-6">
                          {event.place}
                          {event.address ? (
                            <span className="block text-[color:var(--texte-doux)]">{event.address}</span>
                          ) : null}
                        </dd>
                      </div>
                    ) : null}

                    {event.organizer ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="Users" className="size-4" />
                          Organisateur
                        </dt>
                        <dd className="mt-1 pl-6">
                          {event.association ? (
                            <Link
                              href={`/associations/${event.association.slug}`}
                              className="font-semibold text-azur-600 hover:underline dark:text-azur-200"
                            >
                              {event.organizer}
                            </Link>
                          ) : (
                            event.organizer
                          )}
                        </dd>
                      </div>
                    ) : null}

                    {event.priceInfo ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="Ticket" className="size-4" />
                          Tarif
                        </dt>
                        <dd className="mt-1 pl-6">{event.priceInfo}</dd>
                      </div>
                    ) : null}

                    {event.contactEmail ? (
                      <div>
                        <dt className="flex items-center gap-2 font-semibold text-[color:var(--texte-doux)]">
                          <Icon name="Mail" className="size-4" />
                          Contact
                        </dt>
                        <dd className="mt-1 pl-6">
                          <a
                            href={`mailto:${event.contactEmail}`}
                            className="break-all text-azur-600 hover:underline dark:text-azur-200"
                          >
                            {event.contactEmail}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {!past ? (
                    <div className="sans-impression space-y-2.5 border-t border-[color:var(--bordure)] p-5">
                      {event.registrationUrl ? (
                        <ButtonLink href={event.registrationUrl} fullWidth icon="Ticket">
                          S'inscrire
                        </ButtonLink>
                      ) : null}
                      <ButtonLink href={icsHref} variant="contour" fullWidth icon="CalendarPlus">
                        Ajouter à mon agenda
                      </ButtonLink>
                      {event.lat && event.lng ? (
                        <ButtonLink
                          href={`https://www.openstreetmap.org/?mlat=${event.lat}&mlon=${event.lng}#map=18/${event.lat}/${event.lng}`}
                          variant="discret"
                          fullWidth
                          icon="Locate"
                        >
                          Voir sur le plan
                        </ButtonLink>
                      ) : null}
                    </div>
                  ) : (
                    <p className="border-t border-[color:var(--bordure)] p-5 text-sm text-[color:var(--texte-doux)]">
                      Cette manifestation a eu lieu le {formatDate(event.startAt)}.
                    </p>
                  )}
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        {others.length > 0 ? (
          <Section tone="clair" className="mt-14">
            <Container>
              <SectionHeader title="Les prochains rendez-vous" />
              <Grid columns={3}>
                {others.map((item) => (
                  <EventCard key={item.slug} event={item} />
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
