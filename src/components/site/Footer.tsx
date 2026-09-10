import Link from "next/link";

import { LogoMark } from "@/components/site/Logo";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/layout";
import type { NavNode } from "@/lib/navigation";
import { formatFullAddress, type SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type FooterProps = {
  settings: SiteSettings;
  columns: Array<{ title: string; items: NavNode[] }>;
};

const SOCIAL_ICONS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "Youtube",
  linkedin: "Linkedin",
};

export function Footer({ settings, columns }: FooterProps) {
  const { identity, contact, hours, social, footer, services } = settings;
  const year = new Date().getFullYear();

  const socialLinks = Object.entries(SOCIAL_ICONS)
    .map(([key, icon]) => ({ icon, href: (social as Record<string, string>)[key] }))
    .filter((entry) => Boolean(entry.href));

  return (
    <footer className="sans-impression mt-auto bg-azur-900 text-white dark:bg-azur-950">
      {/* Lettre d'information */}
      {services.newsletter ? (
        <div className="border-b border-white/10">
          <Container>
            <div className="flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-[0.13em] uppercase text-dore-300">
                  <Icon name="Send" className="size-3.5" />
                  Lettre d'information
                </p>
                <h2 className="font-display text-xl font-bold sm:text-2xl">
                  L'essentiel de Chessy, une fois par mois
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Décisions du conseil, travaux, agenda des associations. Désinscription en un clic,
                  et jamais de transmission de votre adresse à un tiers.
                </p>
              </div>
              <div className="w-full lg:max-w-md">
                <NewsletterForm inverse />
              </div>
            </div>
          </Container>
        </div>
      ) : null}

      {/* Corps du pied de page */}
      <Container>
        <div className="grid gap-10 py-14 lg:grid-cols-12">
          {/* Identité */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <LogoMark className="size-12" />
              <div>
                <p className="font-display text-lg leading-tight font-bold">{identity.name}</p>
                <p className="text-[0.6875rem] font-semibold tracking-[0.11em] uppercase text-dore-300">
                  {identity.department} · {identity.region}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">{footer.about}</p>

            <address className="mt-6 space-y-2.5 text-sm not-italic">
              <p className="flex items-start gap-2.5 text-white/85">
                <Icon name="MapPin" className="mt-0.5 size-4 shrink-0 text-dore-300" />
                <span>
                  {contact.venue}
                  <br />
                  {formatFullAddress(settings)}
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Icon name="Phone" className="size-4 shrink-0 text-dore-300" />
                <a
                  href={`tel:+33${contact.phone.replace(/\D/g, "").slice(1)}`}
                  className="text-white/85 transition-colors hover:text-white hover:underline"
                >
                  {contact.phone}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Icon name="Mail" className="size-4 shrink-0 text-dore-300" />
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all text-white/85 transition-colors hover:text-white hover:underline"
                >
                  {contact.email}
                </a>
              </p>
            </address>

            {socialLinks.length > 0 || social.panneauPocket ? (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.icon}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-dore-500"
                  >
                    <Icon name={link.icon} className="size-4" />
                    <span className="sr-only">{link.icon} (nouvelle fenêtre)</span>
                  </a>
                ))}
                {social.panneauPocket ? (
                  <a
                    href={social.panneauPocket}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-dore-500"
                  >
                    <Icon name="BellRing" className="size-3.5" />
                    PanneauPocket
                    <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Colonnes de liens */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="mb-3.5 font-display text-sm font-bold text-dore-300">{column.title}</p>
                <ul className="space-y-2">
                  {column.items.map((item) => (
                    <li key={item.id}>
                      <FooterLink href={item.href}>{item.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Horaires */}
          <div className="lg:col-span-3">
            <p className="mb-3.5 flex items-center gap-2 font-display text-sm font-bold text-dore-300">
              <Icon name="Clock" className="size-4" />
              Horaires d'ouverture
            </p>
            <dl className="overflow-hidden rounded-card bg-white/6 text-sm ring-1 ring-inset ring-white/10">
              {hours.slots.map((slot) => (
                <div
                  key={slot.day}
                  className="flex items-baseline justify-between gap-3 border-b border-white/8 px-3.5 py-2 last:border-0"
                >
                  <dt className="text-white/70">{slot.day}</dt>
                  <dd className={cn("text-right text-[0.8125rem] font-medium", slot.closed && "text-white/35")}>
                    {slot.closed || slot.ranges.length === 0 ? "Fermé" : slot.ranges.join(" · ")}
                  </dd>
                </div>
              ))}
            </dl>
            {hours.note ? (
              <p className="mt-3 text-xs leading-relaxed text-white/55">{hours.note}</p>
            ) : null}
          </div>
        </div>

        {/* Partenaires */}
        {footer.partners.length > 0 ? (
          <div className="border-t border-white/10 py-7">
            <p className="mb-3.5 text-xs font-bold tracking-[0.13em] uppercase text-white/45">
              Nos partenaires institutionnels
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
              {footer.partners.map((partner) => (
                <li key={partner.href}>
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {partner.label}
                    <Icon
                      name="ExternalLink"
                      className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>

      {/* Barre légale */}
      <div className="border-t border-white/10 bg-azur-950/60">
        <Container>
          <div className="flex flex-col gap-4 py-5 text-[0.8125rem] md:flex-row md:items-center md:justify-between">
            <p className="text-white/55">
              © {year} Commune de {identity.name} — Tous droits réservés
            </p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {footer.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/65 transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-white/45 transition-colors hover:text-white"
                >
                  <Icon name="Lock" className="size-3" />
                  Espace mairie
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:\/\//.test(href);
  const className =
    "group inline-flex items-start gap-1.5 text-sm text-white/70 transition-colors hover:text-white";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <Icon name="ExternalLink" className="mt-1 size-3 shrink-0 opacity-50" />
        <span className="sr-only">(nouvelle fenêtre)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span
        aria-hidden
        className="mt-2 h-px w-0 bg-dore-300 transition-all duration-300 ease-douce group-hover:w-3"
      />
      {children}
    </Link>
  );
}
