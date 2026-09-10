import {
  bool,
  num,
  str,
  toneOf,
  type BlockData,
} from "@/components/blocks/StaticBlocks";
import { ContactForm } from "@/components/site/ContactForm";
import { EquipementsMap } from "@/components/site/EquipementsMap";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import {
  AssociationCard,
  DemarcheCard,
  DocumentRow,
  EventCard,
  NewsCard,
} from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Visual } from "@/components/ui/Visual";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  Grid,
  MoreLink,
  Section,
  SectionHeader,
} from "@/components/ui/layout";
import { prisma } from "@/lib/db";
import {
  DEMARCHE_CATEGORY_LABELS,
  DOCUMENT_CATEGORY_LABELS,
  ELU_ROLE_LABELS,
  labelOf,
} from "@/lib/enums";
import { getSettings, isOpenNow, type SiteSettings } from "@/lib/settings";
import { cn, formatDate, formatFileSize } from "@/lib/utils";

/* ------------------------------- Actualités -------------------------------- */

export async function NewsListBlock({ data }: { data: BlockData }) {
  const limit = Math.min(Math.max(num(data, "limit", 4), 1), 12);
  const layout = str(data, "layout", "vedette");

  const posts = await prisma.newsPost.findMany({
    where: { status: "PUBLIEE", publishedAt: { lte: new Date() } },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      pinned: true,
      cover: { select: { url: true, alt: true } },
      category: { select: { name: true, color: true } },
    },
  });

  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <Section tone="blanc">
      <Container>
        <SectionHeader
          title={str(data, "title") || null}
          subtitle={str(data, "subtitle") || null}
          action={
            bool(data, "showMore", true) ? (
              <MoreLink href="/actualites">Toutes les actualités</MoreLink>
            ) : null
          }
        />

        {layout === "vedette" && posts.length > 1 ? (
          <div className="grid gap-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <NewsCard post={featured} size="vedette" />
            </Reveal>
            <div className="space-y-3.5 lg:col-span-2">
              {rest.map((post, index) => (
                <Reveal key={post.slug} delay={80 + index * 70}>
                  <NewsCard post={post} size="compact" />
                </Reveal>
              ))}
            </div>
          </div>
        ) : layout === "liste" ? (
          <div className="space-y-3.5">
            {posts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 60}>
                <NewsCard post={post} size="compact" />
              </Reveal>
            ))}
          </div>
        ) : (
          <Grid columns={3}>
            {posts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 70} className="h-full">
                <NewsCard post={post} />
              </Reveal>
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
}

/* ---------------------------------- Agenda --------------------------------- */

export async function AgendaListBlock({ data }: { data: BlockData }) {
  const limit = Math.min(Math.max(num(data, "limit", 4), 1), 12);
  const layout = str(data, "layout", "liste");

  const events = await prisma.event.findMany({
    where: { status: "PUBLIEE", startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    orderBy: { startAt: "asc" },
    take: limit,
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

  return (
    <Section tone="clair">
      <Container>
        <SectionHeader
          title={str(data, "title") || null}
          subtitle={str(data, "subtitle") || null}
          action={bool(data, "showMore", true) ? <MoreLink href="/agenda">Tout l'agenda</MoreLink> : null}
        />

        {events.length === 0 ? (
          <EmptyState
            icon="CalendarX"
            title="Aucun rendez-vous programmé pour le moment"
            description="L'agenda est mis à jour dès qu'une nouvelle manifestation est annoncée."
          />
        ) : layout === "grille" ? (
          <Grid columns={3}>
            {events.map((event, index) => (
              <Reveal key={event.slug} delay={index * 70} className="h-full">
                <EventCard event={event} />
              </Reveal>
            ))}
          </Grid>
        ) : (
          <div className="space-y-3.5">
            {events.map((event, index) => (
              <Reveal key={event.slug} delay={index * 60}>
                <EventCard event={event} layout="liste" />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

/* -------------------------------- Documents -------------------------------- */

export async function DocumentsBlock({ data }: { data: BlockData }) {
  const category = str(data, "category");
  const limit = Math.min(Math.max(num(data, "limit", 12), 1), 60);

  const documents = await prisma.document.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ publishedAt: "desc" }, { order: "asc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      year: true,
      meetingDate: true,
      publishedAt: true,
      href: true,
      file: { select: { url: true, size: true, mimeType: true } },
    },
  });

  const available = documents.filter((document) => document.file?.url || document.href);
  if (available.length === 0) {
    return (
      <Section tone="clair">
        <Container size="lecture">
          <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
          <EmptyState
            icon="FolderOpen"
            title="Aucun document en ligne pour le moment"
            description="Les documents sont publiés au fur et à mesure. Vous pouvez aussi les consulter à l'accueil de la mairie."
          />
        </Container>
      </Section>
    );
  }

  const groupByYear = bool(data, "groupByYear", true);
  const groups = new Map<string, typeof available>();
  for (const document of available) {
    const key = groupByYear
      ? String(document.year ?? document.publishedAt.getFullYear())
      : labelOf(DOCUMENT_CATEGORY_LABELS, document.category);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(document);
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => b.localeCompare(a, "fr", { numeric: true }));

  return (
    <Section tone="clair">
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <div className="space-y-8">
          {sortedKeys.map((key) => (
            <div key={key}>
              {groups.size > 1 ? (
                <h3 className="mb-3.5 flex items-center gap-3 font-display text-sm font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  {key}
                  <span aria-hidden className="h-px flex-1 bg-[color:var(--bordure)]" />
                </h3>
              ) : null}
              <div className="space-y-2.5">
                {groups.get(key)!.map((document, index) => (
                  <Reveal key={document.id} delay={index * 45}>
                    <DocumentRow
                      document={{
                        title: document.title,
                        description: document.description,
                        url: document.file?.url ?? document.href!,
                        mimeType: document.file?.mimeType,
                        sizeLabel: document.file?.size ? formatFileSize(document.file.size) : null,
                        dateLabel: document.meetingDate
                          ? `Séance du ${formatDate(document.meetingDate)}`
                          : formatDate(document.publishedAt),
                      }}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Associations ------------------------------- */

export async function AssociationsListBlock({ data }: { data: BlockData }) {
  const category = str(data, "category");
  const limit = Math.min(Math.max(num(data, "limit", 60), 1), 120);

  const associations = await prisma.association.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
    take: limit,
    select: {
      slug: true,
      name: true,
      shortName: true,
      category: true,
      description: true,
      logo: { select: { url: true, alt: true } },
    },
  });

  if (associations.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeader
          title={str(data, "title") || null}
          subtitle={str(data, "subtitle") || null}
          action={<MoreLink href="/associations">Annuaire complet</MoreLink>}
        />
        <Grid columns={3}>
          {associations.map((association, index) => (
            <Reveal key={association.slug} delay={index * 50} className="h-full">
              <AssociationCard association={association} />
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

/* -------------------------------- Démarches -------------------------------- */

export async function DemarchesListBlock({ data }: { data: BlockData }) {
  const category = str(data, "category");

  const demarches = await prisma.demarche.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      slug: true,
      title: true,
      summary: true,
      icon: true,
      category: true,
      onlineUrl: true,
      internalPath: true,
      processTime: true,
      cost: true,
    },
  });

  if (demarches.length === 0) return null;

  if (!bool(data, "groupByCategory", true) || category) {
    return (
      <Section>
        <Container>
          <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
          <Grid columns={3}>
            {demarches.map((demarche, index) => (
              <Reveal key={demarche.slug} delay={index * 50} className="h-full">
                <DemarcheCard demarche={demarche} />
              </Reveal>
            ))}
          </Grid>
        </Container>
      </Section>
    );
  }

  const groups = new Map<string, typeof demarches>();
  for (const demarche of demarches) {
    if (!groups.has(demarche.category)) groups.set(demarche.category, []);
    groups.get(demarche.category)!.push(demarche);
  }

  return (
    <Section>
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <div className="space-y-12">
          {[...groups.entries()].map(([key, items]) => (
            <div key={key} id={`theme-${key.toLowerCase()}`} className="scroll-mt-28">
              <h3 className="mb-5 flex items-center gap-3 font-display text-lg font-bold text-azur-800 dark:text-white">
                {labelOf(DEMARCHE_CATEGORY_LABELS, key)}
                <Badge tone="neutre">{items.length}</Badge>
                <span aria-hidden className="h-px flex-1 bg-[color:var(--bordure)]" />
              </h3>
              <Grid columns={3}>
                {items.map((demarche, index) => (
                  <Reveal key={demarche.slug} delay={index * 50} className="h-full">
                    <DemarcheCard demarche={demarche} />
                  </Reveal>
                ))}
              </Grid>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Élus (trombinoscope) ---------------------- */

export async function PersonGridBlock({ data }: { data: BlockData }) {
  const role = str(data, "role");

  const elus = await prisma.elu.findMany({
    where: role ? (role === "CONSEILLER" ? { role: { in: ["CONSEILLER", "CONSEILLER_DELEGUE"] } } : { role }) : undefined,
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
      title: true,
      delegations: true,
      email: true,
      photo: { select: { url: true, alt: true } },
    },
  });

  if (elus.length === 0) return null;

  const showDelegations = bool(data, "showDelegations", true);
  const maire = elus.filter((elu) => elu.role === "MAIRE");
  const adjoints = elus.filter((elu) => elu.role === "ADJOINT");
  const autres = elus.filter((elu) => elu.role !== "MAIRE" && elu.role !== "ADJOINT");

  const renderElu = (elu: (typeof elus)[number], size: "grand" | "normal") => (
    <Card interactive className="group h-full">
      <div className="flex h-full flex-col">
        <Visual
          source={elu.photo}
          ratio={size === "grand" ? "4/3" : "1/1"}
          imageClassName="transition-transform duration-700 ease-douce group-hover:scale-105"
          sizes={size === "grand" ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          alt={`Portrait de ${elu.name}`}
        />
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <Badge tone={elu.role === "MAIRE" ? "dore" : "azur"} className="mb-2 self-start">
            {elu.title || labelOf(ELU_ROLE_LABELS, elu.role)}
          </Badge>
          <p
            className={cn(
              "font-display leading-snug font-bold text-azur-800 dark:text-white",
              size === "grand" ? "text-lg" : "text-[0.9375rem]",
            )}
          >
            {elu.name}
          </p>
          {showDelegations && elu.delegations ? (
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[color:var(--texte-doux)]">
              {elu.delegations}
            </p>
          ) : null}
          {elu.email ? (
            <a
              href={`mailto:${elu.email}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-azur-600 hover:underline dark:text-azur-200"
            >
              <Icon name="Mail" className="size-3.5" />
              Écrire
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );

  return (
    <Section tone="clair">
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />

        {maire.length > 0 ? (
          <div className="mb-9 grid gap-6 lg:grid-cols-3">
            <Reveal>{renderElu(maire[0], "grand")}</Reveal>
            <div className="lg:col-span-2">
              <Reveal delay={90}>
                <Card className="h-full p-6 sm:p-8">
                  <Icon name="Quote" className="mb-4 size-8 text-dore-400" />
                  <p className="font-display text-lg leading-relaxed text-azur-800 sm:text-xl dark:text-white">
                    « Une commune de 2 000 habitants n'a pas les moyens d'une grande ville, mais elle
                    a mieux : la proximité. Notre ambition est simple — que chaque démarche soit
                    plus simple demain qu'aujourd'hui, et que chacun trouve une réponse. »
                  </p>
                  <p className="mt-5 text-sm font-semibold text-[color:var(--texte-doux)]">
                    {maire[0].name}, {maire[0].title || "maire"}
                  </p>
                  <p className="mt-4 rounded-field bg-dore-50 p-3 text-xs text-dore-900 dark:bg-dore-900/25 dark:text-dore-100">
                    <strong>À personnaliser :</strong> ce texte d'accueil est un exemple, modifiable
                    depuis le back-office. Les noms des élus autres que le maire restent également à
                    compléter.
                  </p>
                </Card>
              </Reveal>
            </div>
          </div>
        ) : null}

        {adjoints.length > 0 ? (
          <div className="mb-9">
            <h3 className="mb-4 font-display text-sm font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
              Les adjoints au maire
            </h3>
            <Grid columns={4}>
              {adjoints.map((elu, index) => (
                <Reveal key={elu.id} delay={index * 60} className="h-full">
                  {renderElu(elu, "normal")}
                </Reveal>
              ))}
            </Grid>
          </div>
        ) : null}

        {autres.length > 0 ? (
          <div>
            <h3 className="mb-4 font-display text-sm font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
              Les conseillers municipaux
            </h3>
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {autres.map((elu, index) => (
                <Reveal as="li" key={elu.id} delay={index * 35}>
                  <div className="flex items-center gap-3 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-3">
                    <Visual
                      source={elu.photo}
                      ratio="1/1"
                      className="size-11 shrink-0 rounded-full"
                      sizes="44px"
                      alt={`Portrait de ${elu.name}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{elu.name}</p>
                      <p className="truncate text-xs text-[color:var(--texte-doux)]">
                        {elu.delegations || elu.title || labelOf(ELU_ROLE_LABELS, elu.role)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

/* ------------------------------- Équipements ------------------------------- */

export async function EquipementsMapBlock({ data }: { data: BlockData }) {
  const category = str(data, "category");

  const equipements = await prisma.equipement.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      address: true,
      lat: true,
      lng: true,
      phone: true,
      email: true,
      hours: true,
      accessible: true,
      image: { select: { url: true, alt: true } },
    },
  });

  if (equipements.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <EquipementsMap equipements={equipements} />
      </Container>
    </Section>
  );
}

/* ---------------------------- Coordonnées mairie -------------------------- */

export async function ContactCardBlock({ data }: { data: BlockData }) {
  const settings = await getSettings();
  return <ContactCard data={data} settings={settings} />;
}

function ContactCard({ data, settings }: { data: BlockData; settings: SiteSettings }) {
  const { contact, hours } = settings;
  const opening = isOpenNow(settings);
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${contact.lat}&mlon=${contact.lng}#map=17/${contact.lat}/${contact.lng}`;

  return (
    <Section tone="clair">
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "intro") || null} />
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card className="h-full p-6 sm:p-8">
              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3.5 flex items-center gap-2 font-display text-sm font-bold tracking-wide uppercase text-dore-600 dark:text-dore-300">
                    <Icon name="MapPin" className="size-4" />
                    Adresse
                  </h3>
                  <address className="text-[0.9375rem] leading-relaxed not-italic">
                    <strong className="block">{contact.venue}</strong>
                    {contact.address}
                    <br />
                    {contact.postalCode} {contact.city}
                  </address>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-azur-600 hover:underline dark:text-azur-200"
                  >
                    <Icon name="Locate" className="size-4" />
                    Voir le plan d'accès
                    <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </div>

                <div>
                  <h3 className="mb-3.5 flex items-center gap-2 font-display text-sm font-bold tracking-wide uppercase text-dore-600 dark:text-dore-300">
                    <Icon name="Phone" className="size-4" />
                    Nous joindre
                  </h3>
                  <ul className="space-y-2.5 text-[0.9375rem]">
                    <li>
                      <a
                        href={`tel:+33${contact.phone.replace(/\D/g, "").slice(1)}`}
                        className="font-display text-lg font-bold text-azur-700 hover:underline dark:text-azur-200"
                      >
                        {contact.phone}
                      </a>
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        {hours.phoneNote}
                      </span>
                    </li>
                    <li>
                      <a
                        href={`mailto:${contact.email}`}
                        className="break-all text-azur-600 hover:underline dark:text-azur-200"
                      >
                        {contact.email}
                      </a>
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        Accueil et état civil
                      </span>
                    </li>
                    <li>
                      <a
                        href={`mailto:${contact.waterEmail}`}
                        className="break-all text-azur-600 hover:underline dark:text-azur-200"
                      >
                        {contact.waterEmail}
                      </a>
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        Service de l'eau
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {contact.emergencyNote ? (
                <p className="mt-7 flex items-start gap-3 rounded-field bg-red-50 p-3.5 text-sm text-red-900 dark:bg-red-900/30 dark:text-red-100">
                  <Icon name="Megaphone" className="mt-0.5 size-4.5 shrink-0" />
                  {contact.emergencyNote}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/contact" icon="Mail">
                  Écrire à la mairie
                </ButtonLink>
                <ButtonLink href="/contact?type=RENDEZ_VOUS" variant="contour" icon="CalendarClock">
                  Demander un rendez-vous
                </ButtonLink>
              </div>
            </Card>
          </Reveal>

          {bool(data, "showHours", true) ? (
            <Reveal delay={100}>
              <Card className="h-full overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-4">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2.5 rounded-full",
                      opening.open ? "animate-pulsation bg-emerald-500" : "bg-dore-500",
                    )}
                  />
                  <div>
                    <p className="font-display text-sm font-bold">{opening.label}</p>
                    {opening.nextLabel ? (
                      <p className="text-xs text-[color:var(--texte-doux)]">{opening.nextLabel}</p>
                    ) : null}
                  </div>
                </div>
                <dl className="px-5 py-3 text-sm">
                  {hours.slots.map((slot) => (
                    <div
                      key={slot.day}
                      className="flex items-baseline justify-between gap-3 border-b border-[color:var(--bordure)] py-2 last:border-0"
                    >
                      <dt className="text-[color:var(--texte-doux)]">{slot.day}</dt>
                      <dd
                        className={cn(
                          "text-right text-[0.8125rem] font-medium",
                          slot.closed && "text-[color:var(--texte-doux)]/60",
                        )}
                      >
                        {slot.closed || slot.ranges.length === 0 ? "Fermé" : slot.ranges.join(" · ")}
                      </dd>
                    </div>
                  ))}
                </dl>
                {hours.note ? (
                  <p className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5 text-xs leading-relaxed text-[color:var(--texte-doux)]">
                    {hours.note}
                  </p>
                ) : null}
              </Card>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Formulaire contact ------------------------- */

export function ContactFormBlock({ data }: { data: BlockData }) {
  return (
    <Section tone="clair">
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "intro") || null} />
        <ContactForm
          defaultType={str(data, "requestType", "CONTACT")}
          defaultSubject={str(data, "subjectPreset")}
        />
      </Container>
    </Section>
  );
}

/* --------------------------- Mise en avant service ------------------------ */

const SERVICES = {
  salle: {
    href: "/services/salle-des-fetes",
    title: "Réserver une salle communale",
    text: "Consultez les disponibilités en temps réel et déposez votre demande en ligne.",
    cta: "Voir les disponibilités",
    icon: "PartyPopper",
    points: [
      "Calendrier des créneaux réellement libres",
      "Tarif et caution calculés automatiquement",
      "Référence de suivi immédiate",
    ],
  },
  materiel: {
    href: "/services/pret-de-materiel",
    title: "Emprunter du matériel communal",
    text: "Tables, chaises, barnums, sonorisation : composez votre demande en quelques clics.",
    cta: "Voir le matériel disponible",
    icon: "Package",
    points: [
      "Stock disponible affiché aux dates choisies",
      "Panier de matériel et caution calculée",
      "Retrait et restitution planifiés",
    ],
  },
  signalement: {
    href: "/services/signalement",
    title: "Signaler un problème dans l'espace public",
    text: "Voirie, éclairage, propreté : décrivez, photographiez, localisez.",
    cta: "Faire un signalement",
    icon: "TriangleAlert",
    points: [
      "Photo et localisation sur un plan",
      "Transmission directe aux services techniques",
      "Suivi de l'avancement avec votre référence",
    ],
  },
} as const;

export function ServiceTeaserBlock({ data }: { data: BlockData }) {
  const key = str(data, "service", "salle") as keyof typeof SERVICES;
  const service = SERVICES[key] ?? SERVICES.salle;
  const image = data.image as { url?: string; alt?: string } | null | undefined;

  return (
    <Section tone="blanc">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-card bg-azur-800 text-white dark:bg-azur-950">
            <div aria-hidden className="motif-filons absolute inset-0 opacity-70" />
            <div className="relative grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:gap-12">
              <div>
                <Badge tone="clair" icon={service.icon} className="mb-4">
                  Service en ligne
                </Badge>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  {str(data, "title") || service.title}
                </h2>
                <p className="mt-3.5 text-[1.0313rem] leading-relaxed text-white/78">
                  {str(data, "text") || service.text}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-white/85">
                      <Icon name="CircleCheck" className="mt-0.5 size-4.5 shrink-0 text-dore-300" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <ButtonLink href={service.href} variant="secondaire" size="lg" iconRight="ArrowRight">
                    {str(data, "ctaLabel") || service.cta}
                  </ButtonLink>
                </div>
              </div>

              <div className="relative">
                <Visual
                  source={image?.url ? { url: image.url, alt: image.alt ?? "" } : null}
                  ratio="4/3"
                  className="rounded-card ring-1 ring-white/15"
                  fallbackLabel={service.title}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ------------------------------- Newsletter ------------------------------- */

export function NewsletterBlock({ data }: { data: BlockData }) {
  const tone = toneOf(data, "tone", "sable");
  return (
    <Section tone={tone} className="py-12">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-azur-800 sm:text-2xl dark:text-white">
                <Icon name="Send" className="size-5 text-dore-600 dark:text-dore-300" />
                {str(data, "title", "Restez informé")}
              </h2>
              {str(data, "text") ? (
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
                  {str(data, "text")}
                </p>
              ) : null}
            </div>
            <div className="w-full lg:max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
