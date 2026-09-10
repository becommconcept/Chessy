import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Badge, Card, DateChip } from "@/components/ui/layout";
import { Visual } from "@/components/ui/Visual";
import { ASSOCIATION_CATEGORY_LABELS, EVENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { cn, formatDate, formatTimeRange, truncate } from "@/lib/utils";

/* -------------------------------- Actualité ------------------------------- */

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  cover: { url: string; alt: string } | null;
  category: { name: string; color: string } | null;
  pinned?: boolean;
};

export function NewsCard({
  post,
  size = "normal",
  priority = false,
}: {
  post: NewsCardData;
  size?: "normal" | "vedette" | "compact";
  priority?: boolean;
}) {
  if (size === "compact") {
    return (
      <Card as="article" interactive className="group">
        <Link href={`/actualites/${post.slug}`} className="flex gap-4 p-3">
          <Visual
            source={post.cover}
            ratio="1/1"
            className="w-24 shrink-0 rounded-lg sm:w-28"
            imageClassName="transition-transform duration-500 ease-douce group-hover:scale-105"
            sizes="120px"
          />
          <div className="min-w-0 flex-1 py-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
              {post.category ? (
                <span
                  className="font-semibold"
                  style={{ color: post.category.color }}
                >
                  {post.category.name}
                </span>
              ) : null}
              {post.publishedAt ? (
                <time dateTime={post.publishedAt.toISOString()} className="text-[color:var(--texte-doux)]">
                  {formatDate(post.publishedAt, "d MMM yyyy")}
                </time>
              ) : null}
            </div>
            <h3 className="font-display text-[0.9375rem] leading-snug font-semibold transition-colors group-hover:text-azur-600 dark:group-hover:text-azur-200">
              {post.title}
            </h3>
          </div>
        </Link>
      </Card>
    );
  }

  const featured = size === "vedette";

  return (
    <Card as="article" interactive className="group flex h-full flex-col">
      <Link href={`/actualites/${post.slug}`} className="flex h-full flex-col">
        <div className="relative">
          <Visual
            source={post.cover}
            ratio={featured ? "16/9" : "3/2"}
            priority={priority}
            imageClassName="transition-transform duration-700 ease-douce group-hover:scale-105"
            sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {post.pinned ? (
              <Badge tone="dore" icon="Star">
                À la une
              </Badge>
            ) : null}
            {post.category ? (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-douce"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col p-5", featured && "sm:p-7")}>
          {post.publishedAt ? (
            <time
              dateTime={post.publishedAt.toISOString()}
              className="mb-2 text-xs font-medium text-[color:var(--texte-doux)]"
            >
              {formatDate(post.publishedAt)}
            </time>
          ) : null}
          <h3
            className={cn(
              "font-display leading-snug font-bold text-azur-800 transition-colors group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200",
              featured ? "text-xl sm:text-2xl" : "text-[1.0625rem]",
            )}
          >
            {post.title}
          </h3>
          <p
            className={cn(
              "mt-2.5 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]",
              featured ? "line-clamp-4" : "line-clamp-3",
            )}
          >
            {post.excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-azur-600 dark:text-azur-200">
            Lire la suite
            <Icon
              name="ArrowRight"
              className="size-4 transition-transform duration-300 ease-douce group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Card>
  );
}

/* --------------------------------- Agenda --------------------------------- */

export type EventCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  place: string | null;
  category: string | null;
  cover: { url: string; alt: string } | null;
  priceInfo?: string | null;
};

export function EventCard({ event, layout = "grille" }: { event: EventCardData; layout?: "grille" | "liste" }) {
  if (layout === "liste") {
    return (
      <Card as="article" interactive className="group">
        <Link href={`/agenda/${event.slug}`} className="flex items-start gap-4 p-4 sm:gap-5 sm:p-5">
          <DateChip date={event.startAt} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[color:var(--texte-doux)]">
              {event.category ? (
                <Badge tone="azur">{labelOf(EVENT_CATEGORY_LABELS, event.category)}</Badge>
              ) : null}
              {!event.allDay ? (
                <span className="flex items-center gap-1">
                  <Icon name="Clock" className="size-3.5" />
                  {formatTimeRange(event.startAt, event.endAt)}
                </span>
              ) : null}
              {event.place ? (
                <span className="flex items-center gap-1">
                  <Icon name="MapPin" className="size-3.5" />
                  {event.place}
                </span>
              ) : null}
            </div>
            <h3 className="font-display text-[1.0625rem] leading-snug font-semibold text-azur-800 transition-colors group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
              {event.title}
            </h3>
            {event.excerpt ? (
              <p className="mt-1.5 line-clamp-2 text-sm text-[color:var(--texte-doux)]">
                {event.excerpt}
              </p>
            ) : null}
          </div>
          <Icon
            name="ChevronRight"
            className="mt-4 hidden size-5 shrink-0 text-[color:var(--texte-doux)]/50 transition-transform duration-300 group-hover:translate-x-1 sm:block"
          />
        </Link>
      </Card>
    );
  }

  return (
    <Card as="article" interactive className="group flex h-full flex-col">
      <Link href={`/agenda/${event.slug}`} className="flex h-full flex-col">
        <div className="relative">
          <Visual
            source={event.cover}
            ratio="3/2"
            imageClassName="transition-transform duration-700 ease-douce group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          <div className="absolute -bottom-6 left-4">
            <DateChip date={event.startAt} className="ring-4 ring-[color:var(--surface)]" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 pt-9">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--texte-doux)]">
            {event.category ? (
              <Badge tone="azur">{labelOf(EVENT_CATEGORY_LABELS, event.category)}</Badge>
            ) : null}
            {!event.allDay ? <span>{formatTimeRange(event.startAt, event.endAt)}</span> : null}
          </div>
          <h3 className="font-display text-[1.0625rem] leading-snug font-bold text-azur-800 transition-colors group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
            {event.title}
          </h3>
          {event.excerpt ? (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]">
              {event.excerpt}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[color:var(--texte-doux)]">
            {event.place ? (
              <span className="flex items-center gap-1.5">
                <Icon name="MapPin" className="size-3.5" />
                {event.place}
              </span>
            ) : null}
            {event.priceInfo ? (
              <span className="flex items-center gap-1.5">
                <Icon name="Ticket" className="size-3.5" />
                {event.priceInfo}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </Card>
  );
}

/* ------------------------------- Association ------------------------------ */

export type AssociationCardData = {
  slug: string;
  name: string;
  shortName: string | null;
  category: string;
  description: string;
  logo: { url: string; alt: string } | null;
};

export function AssociationCard({ association }: { association: AssociationCardData }) {
  const summary = truncate(association.description.replace(/<[^>]+>/g, " "), 130);

  return (
    <Card as="article" interactive className="group h-full">
      <Link href={`/associations/${association.slug}`} className="flex h-full flex-col p-5">
        <div className="flex items-start gap-4">
          <Visual
            source={association.logo}
            ratio="1/1"
            className="size-14 shrink-0 rounded-field"
            sizes="56px"
            alt={`Logo de ${association.name}`}
          />
          <div className="min-w-0 flex-1">
            <Badge tone="malachite" className="mb-1.5">
              {labelOf(ASSOCIATION_CATEGORY_LABELS, association.category)}
            </Badge>
            <h3 className="font-display text-[0.9375rem] leading-snug font-bold text-azur-800 transition-colors group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
              {association.shortName || association.name}
            </h3>
          </div>
        </div>
        <p className="mt-3.5 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]">
          {summary}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-azur-600 dark:text-azur-200">
          Voir la fiche
          <Icon
            name="ArrowRight"
            className="size-3.5 transition-transform duration-300 ease-douce group-hover:translate-x-1"
          />
        </span>
      </Link>
    </Card>
  );
}

/* -------------------------------- Démarche -------------------------------- */

export type DemarcheCardData = {
  slug: string;
  title: string;
  summary: string;
  icon: string | null;
  onlineUrl: string | null;
  internalPath: string | null;
  processTime: string | null;
  cost: string | null;
};

export function DemarcheCard({ demarche }: { demarche: DemarcheCardData }) {
  return (
    <Card as="article" interactive className="group h-full">
      <Link href={`/demarches/${demarche.slug}`} className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-field bg-azur-50 text-azur-600 transition-colors duration-300 group-hover:bg-azur-500 group-hover:text-white dark:bg-azur-900/60 dark:text-azur-200">
            <Icon name={demarche.icon} fallback="ClipboardList" className="size-5" />
          </span>
          {demarche.onlineUrl || demarche.internalPath ? (
            <Badge tone="succes" icon="Zap">
              En ligne
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-4 font-display text-[1.0625rem] leading-snug font-bold text-azur-800 transition-colors group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
          {demarche.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]">
          {demarche.summary}
        </p>

        <dl className="mt-4 space-y-1.5 border-t border-[color:var(--bordure)] pt-3.5 text-xs">
          {demarche.processTime ? (
            <div className="flex items-start gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-[color:var(--texte-doux)]">
                <Icon name="Timer" className="size-3.5" />
                Délai
              </dt>
              <dd className="text-[color:var(--texte-doux)]">{demarche.processTime}</dd>
            </div>
          ) : null}
          {demarche.cost ? (
            <div className="flex items-start gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-[color:var(--texte-doux)]">
                <Icon name="Coins" className="size-3.5" />
                Coût
              </dt>
              <dd className="text-[color:var(--texte-doux)]">{demarche.cost}</dd>
            </div>
          ) : null}
        </dl>
      </Link>
    </Card>
  );
}

/* -------------------------------- Document -------------------------------- */

export function DocumentRow({
  document,
}: {
  document: {
    title: string;
    description: string | null;
    url: string;
    sizeLabel?: string | null;
    dateLabel?: string | null;
    mimeType?: string | null;
  };
}) {
  const external = document.url.startsWith("http");
  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-4 transition-[border-color,box-shadow,transform] duration-300 ease-douce hover:-translate-y-0.5 hover:border-azur-300 hover:shadow-douce dark:hover:border-azur-500/50"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-field bg-dore-50 text-dore-700 transition-colors group-hover:bg-dore-500 group-hover:text-white dark:bg-dore-900/40 dark:text-dore-200">
        <Icon name={document.mimeType === "application/pdf" ? "FileText" : "FileDown"} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[0.9375rem] leading-snug font-semibold text-azur-800 group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
          {document.title}
        </span>
        {document.description ? (
          <span className="mt-1 block text-sm leading-relaxed text-[color:var(--texte-doux)]">
            {document.description}
          </span>
        ) : null}
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--texte-doux)]">
          {document.dateLabel ? <span>{document.dateLabel}</span> : null}
          {document.sizeLabel ? <span>{document.sizeLabel}</span> : null}
          <span className="font-semibold text-azur-600 dark:text-azur-200">
            {external ? "Ouvrir le lien" : "Télécharger"}
          </span>
        </span>
        <span className="sr-only">(nouvelle fenêtre)</span>
      </span>
      <Icon
        name={external ? "ExternalLink" : "Download"}
        className="mt-3 size-4 shrink-0 text-[color:var(--texte-doux)]/60 transition-transform duration-300 group-hover:translate-y-0.5"
      />
    </a>
  );
}
