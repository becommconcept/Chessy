import Link from "next/link";

import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Icon } from "@/components/ui/Icon";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { Tabs } from "@/components/ui/Tabs";
import { Visual } from "@/components/ui/Visual";
import {
  Badge,
  Card,
  Container,
  Grid,
  Section,
  SectionHeader,
  type Tone,
} from "@/components/ui/layout";
import { cn } from "@/lib/utils";

/* --------------------------------- Outils --------------------------------- */

export type BlockData = Record<string, unknown>;

export const str = (data: BlockData, key: string, fallback = ""): string => {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
};

export const num = (data: BlockData, key: string, fallback = 0): number => {
  const value = data[key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const bool = (data: BlockData, key: string, fallback = false): boolean => {
  const value = data[key];
  return typeof value === "boolean" ? value : fallback;
};

export const list = <T,>(data: BlockData, key: string): T[] => {
  const value = data[key];
  return Array.isArray(value) ? (value as T[]) : [];
};

export const mediaOf = (data: BlockData, key = "image") => {
  const value = data[key];
  if (value && typeof value === "object" && "url" in value) {
    const media = value as { url?: unknown; alt?: unknown };
    if (typeof media.url === "string" && media.url) {
      return { url: media.url, alt: typeof media.alt === "string" ? media.alt : "" };
    }
  }
  return null;
};

export const toneOf = (data: BlockData, key = "tone", fallback: Tone = "blanc"): Tone => {
  const value = str(data, key, fallback);
  return (["blanc", "clair", "sable", "azur"] as const).includes(value as Tone)
    ? (value as Tone)
    : fallback;
};

export type LinkItem = {
  label?: string;
  href?: string;
  description?: string;
  icon?: string;
};

const columnsOf = (data: BlockData, fallback: 2 | 3 | 4 = 3): 2 | 3 | 4 => {
  const value = num(data, "columns", fallback);
  return value === 2 || value === 4 ? value : value === 3 ? 3 : fallback;
};

/* ------------------------------- Bandeau hero ----------------------------- */

export function HeroBlock({ data, first }: { data: BlockData; first: boolean }) {
  const image = mediaOf(data);
  const height = str(data, "height", "moyenne");
  const centered = str(data, "align", "left") === "center";
  const actions = list<LinkItem>(data, "actions");
  const title = str(data, "title");

  return (
    <section
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-azur-800 text-white dark:bg-azur-950",
        height === "compact" && "min-h-[15rem] py-14 sm:min-h-[17rem]",
        height === "moyenne" && "min-h-[21rem] py-16 sm:min-h-[26rem]",
        height === "grande" && "min-h-[30rem] py-20 sm:min-h-[38rem] lg:min-h-[42rem]",
      )}
    >
      {image ? (
        <>
          <Visual
            source={image}
            ratio="libre"
            className="absolute inset-0 -z-20 h-full w-full"
            imageClassName="h-full w-full object-cover"
            priority={first}
            sizes="100vw"
          />
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10",
              centered
                ? "bg-azur-950/72"
                : "bg-linear-to-r from-azur-950/92 via-azur-950/72 to-azur-950/28",
            )}
          />
        </>
      ) : (
        <div aria-hidden className="motif-filons absolute inset-0 -z-10 opacity-90" />
      )}

      <Container className={cn("relative", centered && "text-center")}>
        <div className={cn("max-w-3xl", centered && "mx-auto")}>
          {str(data, "eyebrow") ? (
            <Reveal direction="haut">
              <p
                className={cn(
                  "mb-4 inline-flex items-center gap-2.5 rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-bold tracking-[0.13em] uppercase text-dore-200 ring-1 ring-inset ring-white/20 backdrop-blur-sm",
                )}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-dore-300" />
                {str(data, "eyebrow")}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={60}>
            {first ? (
              <h1 className="font-display text-3xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">
                {title}
              </h1>
            ) : (
              <h2 className="font-display text-2xl leading-tight font-bold sm:text-4xl">{title}</h2>
            )}
          </Reveal>

          {str(data, "subtitle") ? (
            <Reveal delay={120}>
              <p
                className={cn(
                  "mt-5 text-base leading-relaxed text-white/82 sm:text-lg",
                  centered ? "mx-auto max-w-2xl" : "max-w-2xl",
                )}
              >
                {str(data, "subtitle")}
              </p>
            </Reveal>
          ) : null}

          {bool(data, "showSearch") ? (
            <Reveal delay={170}>
              <form
                action="/recherche"
                method="get"
                role="search"
                className={cn("mt-7 flex max-w-xl gap-2", centered && "mx-auto")}
              >
                <label htmlFor="hero-recherche" className="sr-only">
                  Rechercher sur le site
                </label>
                <div className="relative flex-1">
                  <Icon
                    name="Search"
                    className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-azur-800/50"
                  />
                  <input
                    id="hero-recherche"
                    type="search"
                    name="q"
                    placeholder="Une démarche, une information…"
                    className="h-12 w-full rounded-field bg-white pr-3.5 pl-11 text-[0.9375rem] text-azur-900 shadow-relief placeholder:text-azur-800/45 focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-dore-400"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-field bg-dore-500 px-5 font-semibold text-white transition-colors hover:bg-dore-600"
                >
                  Rechercher
                </button>
              </form>
            </Reveal>
          ) : null}

          {actions.length > 0 ? (
            <Reveal delay={220}>
              <div className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center")}>
                {actions.map((action, index) =>
                  action.href && action.label ? (
                    <ButtonLink
                      key={`${action.href}-${index}`}
                      href={action.href}
                      variant={index === 0 ? "secondaire" : "clair"}
                      size="lg"
                      icon={action.icon}
                    >
                      {action.label}
                    </ButtonLink>
                  ) : null,
                )}
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------ Texte enrichi ----------------------------- */

export function RichTextBlock({ data }: { data: BlockData }) {
  const wide = str(data, "width", "lecture") === "large";
  return (
    <Section>
      <Container size={wide ? "large" : "lecture"}>
        {str(data, "title") ? (
          <h2 className="mb-6 font-display text-2xl font-bold text-azur-800 sm:text-3xl dark:text-white">
            {str(data, "title")}
          </h2>
        ) : null}
        <Reveal>
          <div className="contenu" dangerouslySetInnerHTML={{ __html: str(data, "html") }} />
        </Reveal>
      </Container>
    </Section>
  );
}

/* ----------------------------- Image et texte ----------------------------- */

export function ImageTextBlock({ data }: { data: BlockData }) {
  const image = mediaOf(data);
  const imageLeft = str(data, "position", "right") === "left";
  const tone = toneOf(data);
  const inverse = tone === "azur";
  const actions = list<LinkItem>(data, "actions");

  return (
    <Section tone={tone}>
      <Container>
        <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
          <Reveal
            direction={imageLeft ? "droite" : "gauche"}
            className={cn(imageLeft && "lg:order-2")}
          >
            {str(data, "eyebrow") ? (
              <p
                className={cn(
                  "mb-2.5 flex items-center gap-2 text-xs font-bold tracking-[0.13em] uppercase",
                  inverse ? "text-dore-300" : "text-dore-600 dark:text-dore-300",
                )}
              >
                <span aria-hidden className="h-px w-6 bg-current opacity-50" />
                {str(data, "eyebrow")}
              </p>
            ) : null}
            {str(data, "title") ? (
              <h2
                className={cn(
                  "font-display text-2xl font-bold sm:text-3xl",
                  inverse ? "text-white" : "text-azur-800 dark:text-white",
                )}
              >
                {str(data, "title")}
              </h2>
            ) : null}
            <div
              className={cn("contenu mt-5", inverse && "contenu-inverse")}
              dangerouslySetInnerHTML={{ __html: str(data, "html") }}
            />
            {actions.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-3">
                {actions.map((action, index) =>
                  action.href && action.label ? (
                    <ButtonLink
                      key={`${action.href}-${index}`}
                      href={action.href}
                      variant={inverse ? "secondaire" : index === 0 ? "principal" : "contour"}
                      icon={action.icon}
                    >
                      {action.label}
                    </ButtonLink>
                  ) : null,
                )}
              </div>
            ) : null}
          </Reveal>

          <Reveal
            direction={imageLeft ? "gauche" : "droite"}
            delay={100}
            className={cn("relative", imageLeft && "lg:order-1")}
          >
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-[1.6rem] bg-linear-135 from-dore-200/45 to-azur-200/35 dark:from-dore-500/15 dark:to-azur-500/15"
            />
            <Visual source={image} ratio="4/3" className="rounded-card shadow-relief" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------- Colonnes de contenu -------------------------- */

export function ColumnsBlock({ data }: { data: BlockData }) {
  const items = list<{ title?: string; icon?: string; html?: string }>(data, "items");
  if (items.length === 0) return null;
  const columns = items.length >= 4 ? 4 : items.length === 2 ? 2 : 3;

  return (
    <Section tone="clair">
      <Container>
        <SectionHeader title={str(data, "title") || null} />
        <Grid columns={columns as 2 | 3 | 4}>
          {items.map((item, index) => (
            <Reveal key={`${item.title}-${index}`} delay={index * 80}>
              <Card className="h-full p-6">
                {item.icon ? (
                  <span className="mb-4 flex size-11 items-center justify-center rounded-field bg-azur-50 text-azur-600 dark:bg-azur-900/60 dark:text-azur-200">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                ) : null}
                {item.title ? (
                  <h3 className="font-display text-lg font-bold text-azur-800 dark:text-white">
                    {item.title}
                  </h3>
                ) : null}
                <div
                  className="contenu mt-2.5 text-[0.9375rem]"
                  dangerouslySetInnerHTML={{ __html: item.html ?? "" }}
                />
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

/* ------------------------------ Accès rapides ----------------------------- */

export function QuickLinksBlock({ data }: { data: BlockData }) {
  const links = list<LinkItem>(data, "links").filter((link) => link.label && link.href);
  if (links.length === 0) return null;

  return (
    <Section tone="clair">
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <ul className={cn("grid gap-3.5 sm:grid-cols-2", columnsOf(data, 4) === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {links.map((link, index) => (
            <Reveal as="li" key={`${link.href}-${index}`} delay={index * 45}>
              <Link
                href={link.href!}
                className="group flex h-full items-start gap-3.5 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-4 transition-[border-color,box-shadow,transform] duration-300 ease-douce hover:-translate-y-1 hover:border-azur-300 hover:shadow-relief dark:hover:border-azur-500/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-field bg-azur-50 text-azur-600 transition-colors duration-300 group-hover:bg-azur-500 group-hover:text-white dark:bg-azur-900/60 dark:text-azur-200">
                  <Icon name={link.icon} fallback="ArrowRight" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] leading-snug font-semibold text-azur-800 dark:text-white">
                    {link.label}
                  </span>
                  {link.description ? (
                    <span className="mt-1 block text-xs leading-snug text-[color:var(--texte-doux)]">
                      {link.description}
                    </span>
                  ) : null}
                </span>
                <Icon
                  name="ArrowRight"
                  className="mt-2.5 size-4 shrink-0 text-[color:var(--texte-doux)]/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-azur-500"
                />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/* ------------------------------ Grille de cartes -------------------------- */

export function CardGridBlock({ data }: { data: BlockData }) {
  const cards = list<{
    title?: string;
    text?: string;
    image?: { url?: string; alt?: string };
    icon?: string;
    href?: string;
    badge?: string;
  }>(data, "cards");
  if (cards.length === 0) return null;

  const variant = str(data, "variant", "image");

  return (
    <Section>
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <Grid columns={columnsOf(data)}>
          {cards.map((card, index) => {
            const inner = (
              <>
                {variant === "image" ? (
                  <div className="relative">
                    <Visual
                      source={card.image?.url ? { url: card.image.url, alt: card.image.alt ?? "" } : null}
                      ratio="3/2"
                      imageClassName="transition-transform duration-700 ease-douce group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      fallbackLabel={card.title}
                    />
                    {card.badge ? (
                      <span className="absolute top-3 left-3">
                        <Badge tone="dore">{card.badge}</Badge>
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {variant === "icone" ? (
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="flex size-11 items-center justify-center rounded-field bg-azur-50 text-azur-600 transition-colors duration-300 group-hover:bg-azur-500 group-hover:text-white dark:bg-azur-900/60 dark:text-azur-200">
                        <Icon name={card.icon} fallback="Sparkles" className="size-5" />
                      </span>
                      {card.badge ? <Badge tone="dore">{card.badge}</Badge> : null}
                    </div>
                  ) : null}
                  {variant === "sobre" && card.badge ? (
                    <Badge tone="azur" className="mb-3 self-start">
                      {card.badge}
                    </Badge>
                  ) : null}
                  {card.title ? (
                    <h3 className="font-display text-[1.0625rem] leading-snug font-bold text-azur-800 transition-colors group-hover:text-azur-600 dark:text-white dark:group-hover:text-azur-200">
                      {card.title}
                    </h3>
                  ) : null}
                  {card.text ? (
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                      {card.text}
                    </p>
                  ) : null}
                  {card.href ? (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-azur-600 dark:text-azur-200">
                      En savoir plus
                      <Icon
                        name="ArrowRight"
                        className="size-4 transition-transform duration-300 ease-douce group-hover:translate-x-1"
                      />
                    </span>
                  ) : null}
                </div>
              </>
            );

            return (
              <Reveal key={`${card.title}-${index}`} delay={index * 70} className="h-full">
                <Card as="article" interactive={Boolean(card.href)} className="group flex h-full flex-col">
                  {card.href ? (
                    /^https?:\/\//.test(card.href) ? (
                      <a
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full flex-col"
                      >
                        {inner}
                        <span className="sr-only">(nouvelle fenêtre)</span>
                      </a>
                    ) : (
                      <Link href={card.href} className="flex h-full flex-col">
                        {inner}
                      </Link>
                    )
                  ) : (
                    <div className="flex h-full flex-col">{inner}</div>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}

/* ------------------------------- Chiffres clés ---------------------------- */

export function StatsBlock({ data }: { data: BlockData }) {
  const items = list<{ value?: number; suffix?: string; label?: string; icon?: string }>(data, "items");
  if (items.length === 0) return null;
  const tone = toneOf(data, "tone", "azur");
  const inverse = tone === "azur";

  return (
    <Section tone={tone} pattern={inverse ? "filons" : undefined}>
      <Container>
        <SectionHeader
          title={str(data, "title") || null}
          subtitle={str(data, "subtitle") || null}
          inverse={inverse}
          align="center"
        />
        <dl
          className={cn(
            "grid gap-6 text-center sm:gap-8",
            items.length === 2 && "sm:grid-cols-2",
            items.length === 3 && "sm:grid-cols-3",
            items.length >= 4 && "grid-cols-2 lg:grid-cols-4",
          )}
        >
          {items.map((item, index) => (
            <Reveal key={`${item.label}-${index}`} delay={index * 90}>
              <div>
                {item.icon ? (
                  <span
                    className={cn(
                      "mx-auto mb-3.5 flex size-12 items-center justify-center rounded-full",
                      inverse ? "bg-white/12 text-dore-200" : "bg-azur-50 text-azur-600 dark:bg-azur-900/60 dark:text-azur-200",
                    )}
                  >
                    <Icon name={item.icon} className="size-6" />
                  </span>
                ) : null}
                <dd
                  className={cn(
                    "font-display text-3xl font-bold tabular-nums sm:text-5xl",
                    inverse ? "text-white" : "text-azur-700 dark:text-white",
                  )}
                >
                  <Counter value={Number(item.value) || 0} />
                  <span className={cn("text-xl sm:text-2xl", inverse ? "text-dore-300" : "text-dore-600 dark:text-dore-300")}>
                    {item.suffix}
                  </span>
                </dd>
                <dt
                  className={cn(
                    "mx-auto mt-2 max-w-[16rem] text-sm leading-snug",
                    inverse ? "text-white/72" : "text-[color:var(--texte-doux)]",
                  )}
                >
                  {item.label}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

/* ----------------------------- Frise et étapes ---------------------------- */

export function TimelineBlock({ data }: { data: BlockData }) {
  const items = list<{ date?: string; title?: string; text?: string }>(data, "items");
  if (items.length === 0) return null;

  return (
    <Section tone="clair">
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <ol className="relative space-y-8 border-l-2 border-dashed border-azur-200 pl-8 dark:border-azur-800">
          {items.map((item, index) => (
            <Reveal as="li" key={`${item.title}-${index}`} delay={index * 70} className="relative">
              <span
                aria-hidden
                className="absolute top-1.5 -left-[2.4rem] flex size-5 items-center justify-center rounded-full border-2 border-[color:var(--surface-alt)] bg-dore-500"
              >
                <span className="size-1.5 rounded-full bg-white" />
              </span>
              {item.date ? (
                <p className="mb-1 text-xs font-bold tracking-[0.1em] uppercase text-dore-600 dark:text-dore-300">
                  {item.date}
                </p>
              ) : null}
              <h3 className="font-display text-lg font-bold text-azur-800 dark:text-white">
                {item.title}
              </h3>
              {item.text ? (
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
                  {item.text}
                </p>
              ) : null}
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function StepsBlock({ data }: { data: BlockData }) {
  const items = list<{ title?: string; text?: string }>(data, "items");
  if (items.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal as="li" key={`${item.title}-${index}`} delay={index * 70} className="h-full">
              <Card className="relative h-full p-6 pt-7">
                <span
                  aria-hidden
                  className="absolute -top-4 left-6 flex size-9 items-center justify-center rounded-full bg-azur-600 font-display text-sm font-bold text-white shadow-douce"
                >
                  {index + 1}
                </span>
                <h3 className="font-display text-[1.0625rem] leading-snug font-bold text-azur-800 dark:text-white">
                  {item.title}
                </h3>
                {item.text ? (
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                    {item.text}
                  </p>
                ) : null}
              </Card>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* --------------------------------- Galerie -------------------------------- */

export function GalleryBlock({ data }: { data: BlockData }) {
  const images = list<{ image?: { url?: string; alt?: string }; caption?: string }>(data, "images")
    .filter((entry) => entry.image?.url)
    .map((entry) => ({
      url: entry.image!.url!,
      alt: entry.image!.alt || entry.caption || "Photographie de la commune",
      caption: entry.caption,
    }));
  if (images.length === 0) return null;

  const layout = str(data, "layout", "mosaique") as "mosaique" | "grille" | "bande";

  return (
    <Section tone="clair">
      <Container>
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <Lightbox images={images} layout={layout} />
      </Container>
    </Section>
  );
}

/* ------------------------- Accordéon, onglets, tarifs --------------------- */

export function AccordionBlock({ data }: { data: BlockData }) {
  const items = list<{ question?: string; answer?: string }>(data, "items")
    .filter((item) => item.question)
    .map((item) => ({ question: item.question!, answer: item.answer ?? "" }));
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.replace(/<[^>]+>/g, " ").trim() },
    })),
  };

  return (
    <Section>
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <Accordion items={items} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Container>
    </Section>
  );
}

export function TabsBlock({ data }: { data: BlockData }) {
  const items = list<{ label?: string; html?: string }>(data, "items")
    .filter((item) => item.label)
    .map((item) => ({ label: item.label!, html: item.html ?? "" }));
  if (items.length === 0) return null;

  return (
    <Section>
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} />
        <Tabs items={items} />
      </Container>
    </Section>
  );
}

export function PricingTableBlock({ data }: { data: BlockData }) {
  const rows = list<{ label?: string; value?: string; note?: string }>(data, "rows").filter(
    (row) => row.label,
  );
  if (rows.length === 0) return null;

  return (
    <Section tone="clair">
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} subtitle={str(data, "subtitle") || null} />
        <div className="overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)]">
          <table className="w-full text-sm">
            <caption className="sr-only">{str(data, "title") || "Tarifs"}</caption>
            <thead>
              <tr className="bg-[color:var(--surface-alt)]">
                <th scope="col" className="px-4 py-3 text-left font-semibold sm:px-5">
                  {str(data, "colLabel", "Prestation")}
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold whitespace-nowrap sm:px-5">
                  {str(data, "colValue", "Tarif")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.label}-${index}`} className="border-t border-[color:var(--bordure)]">
                  <th scope="row" className="px-4 py-3.5 text-left font-medium sm:px-5">
                    {row.label}
                    {row.note ? (
                      <span className="mt-0.5 block text-xs font-normal text-[color:var(--texte-doux)]">
                        {row.note}
                      </span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3.5 text-right font-display font-bold whitespace-nowrap text-azur-700 tabular-nums sm:px-5 dark:text-azur-200">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------- Appel à l'action, encadrés -------------------- */

export function CtaBlock({ data }: { data: BlockData }) {
  const actions = list<LinkItem>(data, "actions").filter((action) => action.label && action.href);
  const tone = toneOf(data, "tone", "azur");
  const inverse = tone === "azur";

  return (
    <Section tone={tone} className="py-12 sm:py-14">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2
                className={cn(
                  "font-display text-xl font-bold sm:text-2xl",
                  inverse ? "text-white" : "text-azur-800 dark:text-white",
                )}
              >
                {str(data, "title")}
              </h2>
              {str(data, "text") ? (
                <p
                  className={cn(
                    "mt-2.5 text-[0.9375rem] leading-relaxed",
                    inverse ? "text-white/75" : "text-[color:var(--texte-doux)]",
                  )}
                >
                  {str(data, "text")}
                </p>
              ) : null}
            </div>
            {actions.length > 0 ? (
              <div className="flex shrink-0 flex-wrap gap-3">
                {actions.map((action, index) => (
                  <ButtonLink
                    key={`${action.href}-${index}`}
                    href={action.href!}
                    variant={inverse ? (index === 0 ? "secondaire" : "clair") : index === 0 ? "principal" : "contour"}
                    icon={action.icon}
                  >
                    {action.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function AlertBoxBlock({ data }: { data: BlockData }) {
  const level = str(data, "level", "INFO");
  const styles = {
    INFO: { box: "border-azur-300 bg-azur-50 dark:border-azur-500/40 dark:bg-azur-900/35", icon: "Info", accent: "text-azur-700 dark:text-azur-200" },
    VIGILANCE: { box: "border-dore-400 bg-dore-50 dark:border-dore-500/40 dark:bg-dore-900/25", icon: "TriangleAlert", accent: "text-dore-800 dark:text-dore-200" },
    URGENCE: { box: "border-red-400 bg-red-50 dark:border-red-500/40 dark:bg-red-900/30", icon: "Megaphone", accent: "text-red-800 dark:text-red-200" },
  }[level] ?? { box: "border-azur-300 bg-azur-50", icon: "Info", accent: "text-azur-700" };

  return (
    <Section className="py-8">
      <Container size="lecture">
        <Reveal>
          <div className={cn("flex gap-4 rounded-card border-l-4 p-5", styles.box)}>
            <Icon name={styles.icon} className={cn("mt-0.5 size-5.5 shrink-0", styles.accent)} />
            <div className="min-w-0 flex-1">
              <p className={cn("font-display font-bold", styles.accent)}>{str(data, "title")}</p>
              <div
                className="contenu mt-1.5 text-[0.9375rem]"
                dangerouslySetInnerHTML={{ __html: str(data, "html") }}
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ---------------------------------- Vidéo --------------------------------- */

/** Transforme l'adresse d'une plateforme en URL d'intégration. */
function embedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed${parsed.pathname}`;
    }
    if (host === "vimeo.com") {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    if (host === "dailymotion.com") {
      const id = parsed.pathname.split("/").pop();
      return id ? `https://www.dailymotion.com/embed/video/${id}` : null;
    }
    // PeerTube et autres lecteurs auto-hébergés exposent directement /videos/embed
    if (parsed.pathname.includes("/videos/watch/")) {
      return url.replace("/videos/watch/", "/videos/embed/");
    }
    return url;
  } catch {
    return null;
  }
}

export function VideoBlock({ data }: { data: BlockData }) {
  const source = embedUrl(str(data, "url"));
  if (!source) return null;

  return (
    <Section>
      <Container size="lecture">
        <SectionHeader title={str(data, "title") || null} />
        <figure>
          <div className="aspect-video overflow-hidden rounded-card bg-azur-950 shadow-relief">
            <iframe
              src={source}
              title={str(data, "title") || "Vidéo"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
          {str(data, "caption") ? (
            <figcaption className="mt-3 text-center text-sm text-[color:var(--texte-doux)]">
              {str(data, "caption")}
            </figcaption>
          ) : null}
        </figure>
      </Container>
    </Section>
  );
}

/* ------------------------------- Séparateur ------------------------------- */

export function SeparatorBlock({ data }: { data: BlockData }) {
  const size = str(data, "size", "m");
  return (
    <div className={cn(size === "s" && "py-4", size === "m" && "py-8", size === "l" && "py-14")}>
      {bool(data, "rule") ? (
        <Container>
          <hr className="border-t border-[color:var(--bordure)]" />
        </Container>
      ) : null}
    </div>
  );
}
