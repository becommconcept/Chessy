import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { getSettings, isOpenNow } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Contacter la mairie",
  description:
    "Écrire à la mairie de Chessy-les-Mines, demander un rendez-vous, proposer une idée. Adresse, téléphone, horaires d'ouverture et plan d'accès.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const opening = isOpenNow(settings);
  const { contact, hours } = settings;
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${contact.lat}&mlon=${contact.lng}#map=17/${contact.lat}/${contact.lng}`;

  return (
    <>
      <Breadcrumb items={[{ label: "Contact", href: "/contact" }]} />
      <PageHeader
        eyebrow="Nous joindre"
        icon="Mail"
        title="Contacter la mairie"
        excerpt="Une question, une demande de rendez-vous, une idée pour la commune : écrivez-nous. Nous répondons sous cinq jours ouvrés en moyenne."
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Coordonnées */}
            <aside className="lg:col-span-2">
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-4">
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

                  <div className="p-5">
                    <address className="text-[0.9375rem] leading-relaxed not-italic">
                      <strong className="block font-display">{contact.venue}</strong>
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
                      Plan d'accès
                      <span className="sr-only">(nouvelle fenêtre)</span>
                    </a>

                    <hr className="my-4 border-t border-[color:var(--bordure)]" />

                    <a
                      href={`tel:+33${contact.phone.replace(/\D/g, "").slice(1)}`}
                      className="flex items-center gap-2.5 font-display text-xl font-bold text-azur-700 hover:underline dark:text-azur-200"
                    >
                      <Icon name="Phone" className="size-5" />
                      {contact.phone}
                    </a>
                    <p className="mt-1 text-xs text-[color:var(--texte-doux)]">{hours.phoneNote}</p>
                  </div>

                  <dl className="border-t border-[color:var(--bordure)] px-5 py-3 text-sm">
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

                <Card className="p-5">
                  <p className="font-display text-sm font-bold">Adresses par service</p>
                  <ul className="mt-3 space-y-3 text-sm">
                    <li>
                      <a
                        href={`mailto:${contact.email}`}
                        className="break-all font-medium text-azur-600 hover:underline dark:text-azur-200"
                      >
                        {contact.email}
                      </a>
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        Accueil, état civil, urbanisme, salles
                      </span>
                    </li>
                    <li>
                      <a
                        href={`mailto:${contact.waterEmail}`}
                        className="break-all font-medium text-azur-600 hover:underline dark:text-azur-200"
                      >
                        {contact.waterEmail}
                      </a>
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        Abonnements et facturation de l'eau
                      </span>
                    </li>
                  </ul>
                </Card>

                <Card className="border-red-200 bg-red-50 p-5 dark:border-red-500/40 dark:bg-red-900/25">
                  <p className="flex items-center gap-2 font-display text-sm font-bold text-red-900 dark:text-red-100">
                    <Icon name="Megaphone" className="size-4" />
                    En cas d'urgence
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-red-900/90 dark:text-red-50/90">
                    {contact.emergencyNote}
                  </p>
                </Card>
              </div>
            </aside>

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <SectionHeader
                title="Écrire à la mairie"
                subtitle="Ce formulaire enregistre votre demande et vous remet une référence de suivi : vous savez où elle en est, sans avoir à rappeler."
              />
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse rounded-card bg-[color:var(--surface-alt)]" />
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="clair">
        <Container>
          <SectionHeader
            title="Peut-être plus rapide sans nous écrire"
            subtitle="Pour ces demandes, un service en ligne existe déjà et vous fera gagner du temps."
          />
          <Grid columns={3}>
            {[
              {
                icon: "PartyPopper",
                title: "Réserver une salle",
                text: "Disponibilités en temps réel, tarif calculé, demande instruite par le secrétariat.",
                href: "/services/salle-des-fetes",
              },
              {
                icon: "Package",
                title: "Emprunter du matériel",
                text: "Tables, chaises, barnums : vérifiez le stock aux dates voulues et déposez la demande.",
                href: "/services/pret-de-materiel",
              },
              {
                icon: "TriangleAlert",
                title: "Signaler un problème",
                text: "Voirie, éclairage, propreté : photo, localisation, transmission directe aux services techniques.",
                href: "/services/signalement",
              },
              {
                icon: "ClipboardList",
                title: "Faire une démarche",
                text: "Actes d'état civil, urbanisme, inscription scolaire : les fiches indiquent tout ce qu'il faut.",
                href: "/demarches",
              },
              {
                icon: "Search",
                title: "Suivre une demande",
                text: "Avec votre référence, consultez l'avancement de votre dossier à tout moment.",
                href: "/suivi",
              },
              {
                icon: "BellRing",
                title: "Recevoir les alertes",
                text: "Coupures d'eau, alertes météo, informations urgentes sur votre téléphone.",
                href: "/la-mairie/informations-urgentes",
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group flex h-full flex-col rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-5 transition-[border-color,transform,box-shadow] duration-300 ease-douce hover:-translate-y-1 hover:border-azur-300 hover:shadow-douce"
              >
                <span className="mb-3.5 flex size-10 items-center justify-center rounded-field bg-azur-50 text-azur-600 transition-colors group-hover:bg-azur-500 group-hover:text-white dark:bg-azur-900/60 dark:text-azur-200">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span className="font-display text-[0.9375rem] font-bold text-azur-800 dark:text-white">
                  {item.title}
                </span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                  {item.text}
                </span>
              </a>
            ))}
          </Grid>
        </Container>
      </Section>
    </>
  );
}
