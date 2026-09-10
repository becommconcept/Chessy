import type { Metadata } from "next";

import { EquipmentLoanWizard } from "@/components/services/EquipmentLoanWizard";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Container, Grid, Section, SectionHeader } from "@/components/ui/layout";
import { getEquipmentItems, MAX_LOAN_DAYS, MIN_LOAN_NOTICE_DAYS } from "@/lib/booking";
import { EQUIPMENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Emprunter du matériel communal",
  description:
    "Tables, chaises, barnums, grilles d'exposition, sonorisation, percolateurs : demandez le prêt de matériel de la commune de Chessy-les-Mines en ligne.",
  alternates: { canonical: "/services/pret-de-materiel" },
};

export default async function PretMaterielPage() {
  const items = await getEquipmentItems();
  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <>
      <Breadcrumb
        items={[{ label: "Démarches", href: "/demarches" }, { label: "Emprunter du matériel" }]}
      />
      <PageHeader
        eyebrow="Service en ligne"
        icon="Package"
        title="Emprunter du matériel communal"
        excerpt="La commune prête gratuitement son matériel aux associations et aux habitants pour leurs manifestations. Vérifiez le stock disponible aux dates voulues et déposez votre demande."
      />

      <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
        <Container>
          <ul className="grid gap-4 py-5 sm:grid-cols-3">
            {[
              { icon: "Boxes", text: `${items.length} références de matériel` },
              { icon: "CalendarCheck", text: "Stock affiché pour vos dates" },
              { icon: "Coins", text: "Prêt gratuit, caution sur certains articles" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-sm">
                <Icon name={item.icon} className="size-5 shrink-0 text-dore-600 dark:text-dore-300" />
                <span className="font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <Section>
        <Container>
          <SectionHeader
            title="Votre demande de prêt"
            subtitle="Choisissez la période, composez votre demande, complétez vos coordonnées."
          />
          <EquipmentLoanWizard items={items} />
        </Container>
      </Section>

      <Section tone="clair">
        <Container>
          <SectionHeader
            title="Le matériel disponible"
            subtitle={`${items.length} références réparties en ${categories.length} familles.`}
          />
          <Grid columns={2}>
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-5"
              >
                <h3 className="font-display text-base font-bold text-azur-800 dark:text-white">
                  {labelOf(EQUIPMENT_CATEGORY_LABELS, category)}
                </h3>
                <ul className="mt-3 space-y-2">
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <li key={item.slug} className="flex items-start justify-between gap-3 text-sm">
                        <span>
                          {item.name}
                          {item.reservedForAssociations ? (
                            <span className="ml-1.5 text-xs text-dore-700 dark:text-dore-300">
                              (associations)
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs text-[color:var(--texte-doux)] tabular-nums">
                          {item.quantityTotal} {item.unitLabel}
                          {item.quantityTotal > 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container size="lecture">
          <SectionHeader title="Les règles du prêt" />
          <div className="divide-y divide-[color:var(--bordure)] overflow-hidden rounded-card border border-[color:var(--bordure)]">
            {[
              {
                q: "Qui peut emprunter ?",
                a: "Les associations de la commune, les habitants pour un usage privé, et les organisateurs de manifestations autorisées. Certains matériels (barnums, sonorisation, remorque, friteuse) sont réservés aux associations et aux organisateurs, pour des raisons de sécurité et d'usure.",
              },
              {
                q: "Combien de temps à l'avance faut-il demander ?",
                a: `Au minimum ${MIN_LOAN_NOTICE_DAYS} jours avant le retrait, afin que les services techniques puissent organiser la sortie du matériel. Pour une grosse manifestation, prévoyez plusieurs semaines.`,
              },
              {
                q: "Quelle est la durée maximale d'un prêt ?",
                a: `${MAX_LOAN_DAYS} jours. Au-delà, contactez la mairie : un accord particulier est possible selon la nature du projet.`,
              },
              {
                q: "Le prêt est-il payant ?",
                a: "Non, le prêt est gratuit. Une caution est demandée pour les matériels les plus coûteux ou les plus fragiles ; elle est restituée après vérification du retour.",
              },
              {
                q: "Comment se passe le retrait ?",
                a: "À l'atelier des services techniques, du lundi au vendredi de 8h à 12h, sur le créneau convenu. Prévoyez un véhicule adapté et suffisamment de bras : les agents ne peuvent pas assurer le chargement de tout le matériel.",
              },
              {
                q: "Et si je casse quelque chose ?",
                a: "Signalez-le au retour : il n'y a rien de honteux à ce qu'un matériel s'abîme. La réparation ou le remplacement est facturé au demandeur, ce que couvre généralement l'assurance responsabilité civile.",
              },
              {
                q: "Puis-je demander une livraison ?",
                a: "Vous pouvez la demander : elle sera étudiée selon la disponibilité des agents et le volume concerné. La réponse est donnée au cas par cas, sans garantie.",
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
    </>
  );
}
