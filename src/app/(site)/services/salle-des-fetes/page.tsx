import type { Metadata } from "next";

import { RoomBookingWizard } from "@/components/services/RoomBookingWizard";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Visual } from "@/components/ui/Visual";
import { Badge, Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { getRooms } from "@/lib/booking";
import { AUDIENCE_LABELS, type Audience } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Réserver une salle communale",
  description:
    "Réservez la salle des fêtes ou la salle des associations de Chessy-les-Mines en ligne : disponibilités en temps réel, tarifs, règlement et dépôt de la demande.",
  alternates: { canonical: "/services/salle-des-fetes" },
};

export default async function SalleDesFetesPage() {
  const rooms = await getRooms();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Démarches", href: "/demarches" },
          { label: "Réserver une salle" },
        ]}
      />
      <PageHeader
        eyebrow="Service en ligne"
        icon="PartyPopper"
        title="Réserver une salle communale"
        excerpt="Consultez les disponibilités réelles, découvrez votre tarif en un clic et déposez votre demande. Le secrétariat l'instruit et vous confirme la réservation."
        cover={rooms[0]?.image ?? null}
      />

      {/* Bandeau de réassurance */}
      <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
        <Container>
          <ul className="grid gap-4 py-5 sm:grid-cols-3">
            {[
              { icon: "CalendarCheck", text: "Disponibilités mises à jour en direct" },
              { icon: "Coins", text: "Tarif et caution calculés automatiquement" },
              { icon: "Search", text: "Référence de suivi remise immédiatement" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-sm">
                <Icon
                  name={item.icon}
                  className="size-5 shrink-0 text-dore-600 dark:text-dore-300"
                />
                <span className="font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* Tunnel de réservation */}
      <Section>
        <Container>
          <SectionHeader
            title="Votre demande de réservation"
            subtitle="Comptez cinq minutes. Aucun compte à créer."
          />
          <RoomBookingWizard rooms={rooms} />
        </Container>
      </Section>

      {/* Fiches des salles */}
      <Section tone="clair">
        <Container>
          <SectionHeader
            title="Les salles disponibles"
            subtitle="Capacité, équipements et grille tarifaire de chaque salle."
          />
          <div className="space-y-8">
            {rooms.map((room) => (
              <Card key={room.slug} className="overflow-hidden">
                <div className="grid lg:grid-cols-5">
                  <Visual
                    source={room.image}
                    ratio="4/3"
                    className="lg:col-span-2 lg:h-full"
                    imageClassName="lg:h-full"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                  <div className="p-6 lg:col-span-3 sm:p-8">
                    <h3 className="font-display text-xl font-bold text-azur-800 sm:text-2xl dark:text-white">
                      {room.name}
                    </h3>
                    {room.subtitle ? (
                      <p className="mt-1 text-sm text-[color:var(--texte-doux)]">{room.subtitle}</p>
                    ) : null}

                    <ul className="mt-4 flex flex-wrap gap-2">
                      {room.capacitySeated ? (
                        <li>
                          <Badge tone="azur" icon="Users">
                            {room.capacitySeated} places assises
                          </Badge>
                        </li>
                      ) : null}
                      {room.capacityStanding ? (
                        <li>
                          <Badge tone="neutre">{room.capacityStanding} debout</Badge>
                        </li>
                      ) : null}
                      {room.surface ? (
                        <li>
                          <Badge tone="neutre">{room.surface} m²</Badge>
                        </li>
                      ) : null}
                      <li>
                        <Badge tone="succes" icon="Accessibility">
                          Accès PMR
                        </Badge>
                      </li>
                    </ul>

                    <div
                      className="contenu mt-5 text-[0.9375rem]"
                      dangerouslySetInnerHTML={{ __html: room.description }}
                    />

                    {room.equipments.length > 0 ? (
                      <div className="mt-6">
                        <p className="mb-2.5 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                          Équipements inclus
                        </p>
                        <ul className="grid gap-1.5 sm:grid-cols-2">
                          {room.equipments.map((equipment) => (
                            <li key={equipment} className="flex items-start gap-2 text-sm">
                              <Icon
                                name="CircleCheck"
                                className="mt-0.5 size-4 shrink-0 text-malachite-500"
                              />
                              {equipment}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Grille tarifaire */}
                    <div className="mt-7 overflow-x-auto">
                      <p className="mb-2.5 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                        Grille tarifaire
                      </p>
                      <table className="w-full min-w-[26rem] text-sm">
                        <caption className="sr-only">Tarifs de la {room.name}</caption>
                        <thead>
                          <tr className="border-b-2 border-[color:var(--bordure)]">
                            <th scope="col" className="py-2 pr-3 text-left font-semibold">
                              Situation
                            </th>
                            {room.slots.map((slot) => (
                              <th
                                key={slot.key}
                                scope="col"
                                className="px-3 py-2 text-right font-semibold whitespace-nowrap"
                              >
                                {slot.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(["ASSO_LOCALE", "HABITANT", "ASSO_EXTERIEURE", "ENTREPRISE"] as Audience[]).map(
                            (audience) => (
                              <tr
                                key={audience}
                                className="border-b border-[color:var(--bordure)] last:border-0"
                              >
                                <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                                  {AUDIENCE_LABELS[audience]}
                                </th>
                                {room.slots.map((slot) => {
                                  const tariff = room.tariffs.find(
                                    (entry) =>
                                      entry.audience === audience && entry.slotKey === slot.key,
                                  );
                                  return (
                                    <td
                                      key={slot.key}
                                      className="px-3 py-2.5 text-right font-semibold whitespace-nowrap tabular-nums"
                                    >
                                      {tariff ? (
                                        <>
                                          <span
                                            className={
                                              tariff.amountCents === 0
                                                ? "text-malachite-600 dark:text-malachite-300"
                                                : "text-azur-700 dark:text-azur-200"
                                            }
                                          >
                                            {formatPrice(tariff.amountCents)}
                                          </span>
                                          {tariff.depositCents > 0 ? (
                                            <span className="mt-0.5 block text-[0.6875rem] font-normal text-[color:var(--texte-doux)]">
                                              caution {formatPrice(tariff.depositCents)}
                                            </span>
                                          ) : null}
                                        </>
                                      ) : (
                                        <span className="text-[color:var(--texte-doux)]">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>

                    <p className="mt-3 text-xs text-[color:var(--texte-doux)]">
                      Réservation possible jusqu'à {room.bookingWindowDays} jours à l'avance, au plus
                      tard {room.minNoticeDays} jours avant la date souhaitée.
                    </p>

                    {room.rules ? (
                      <details className="mt-5 rounded-field border border-[color:var(--bordure)]">
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">
                          <span className="flex items-center justify-between gap-3">
                            Règlement d'utilisation
                            <Icon name="ChevronDown" className="size-4" />
                          </span>
                        </summary>
                        <div
                          className="contenu border-t border-[color:var(--bordure)] px-4 py-4 text-sm"
                          dangerouslySetInnerHTML={{ __html: room.rules }}
                        />
                      </details>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Questions fréquentes */}
      <Section>
        <Container size="lecture">
          <SectionHeader
            title="Questions fréquentes"
            subtitle="Ce que les usagers demandent le plus souvent au secrétariat."
          />
          <div className="divide-y divide-[color:var(--bordure)] overflow-hidden rounded-card border border-[color:var(--bordure)]">
            {[
              {
                q: "Ma demande en ligne vaut-elle réservation ?",
                a: "Non. Le dépôt pose une option sur le créneau, ce qui empêche qu'un autre usager le demande en même temps. La réservation devient ferme après validation par le secrétariat, qui vous le confirme par courriel.",
              },
              {
                q: "Quels justificatifs vais-je devoir fournir ?",
                a: "Systématiquement une attestation d'assurance responsabilité civile couvrant la manifestation. Selon votre situation : un justificatif de domicile pour le tarif habitant, ou les statuts et le récépissé de déclaration en préfecture pour une association.",
              },
              {
                q: "Comment se passe la remise des clés ?",
                a: "Les clés sont remises à l'accueil de la mairie avant le début du créneau, après signature de la convention, remise de la caution et état des lieux d'entrée. Elles sont rendues à l'issue du créneau, avec l'état des lieux de sortie.",
              },
              {
                q: "Quand la caution est-elle rendue ?",
                a: "Après l'état des lieux de sortie, si les locaux sont restitués propres et sans dégradation. Dans le cas contraire, les frais de remise en état sont déduits du montant.",
              },
              {
                q: "Puis-je annuler ma réservation ?",
                a: "Oui, en prévenant le secrétariat le plus tôt possible : le créneau libéré profitera à un autre usager. Les conditions d'annulation tardive figurent dans le règlement d'utilisation.",
              },
              {
                q: "J'ai aussi besoin de tables et de barnums pour l'extérieur",
                a: "Le matériel communal se demande séparément, via le service de prêt de matériel. Vous pouvez déposer les deux demandes le même jour : elles seront instruites ensemble.",
              },
            ].map((item) => (
              <details key={item.q} className="group bg-[color:var(--surface)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold">
                  {item.q}
                  <Icon
                    name="ChevronDown"
                    className="size-4 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-4 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sable">
        <Container>
          <Grid columns={3}>
            {[
              {
                icon: "Package",
                title: "Emprunter du matériel",
                text: "Tables, chaises, barnums, sonorisation, percolateurs, grilles d'exposition.",
                href: "/services/pret-de-materiel",
              },
              {
                icon: "ClipboardList",
                title: "Déclarer la manifestation",
                text: "Débit de boissons, occupation du domaine public, sécurité : le dossier à déposer.",
                href: "/demarches/organiser-une-manifestation",
              },
              {
                icon: "Mail",
                title: "Une question ?",
                text: "Le secrétariat général vous répond au 04 78 43 92 03 ou par courriel.",
                href: "/contact?objet=R%C3%A9servation%20de%20salle%20ou%20de%20mat%C3%A9riel",
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
