import type { Metadata } from "next";

import { ReportForm } from "@/components/services/ReportForm";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Card, Container, Grid, Section, SectionHeader } from "@/components/ui/layout";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Signaler un problème",
  description:
    "Nid-de-poule, éclairage en panne, dépôt sauvage, fuite d'eau : signalez un problème dans l'espace public de Chessy-les-Mines avec photo et localisation.",
  alternates: { canonical: "/services/signalement" },
};

export default function SignalementPage() {
  return (
    <>
      <Breadcrumb
        items={[{ label: "Démarches", href: "/demarches" }, { label: "Signaler un problème" }]}
      />
      <PageHeader
        eyebrow="Service en ligne"
        icon="TriangleAlert"
        title="Signaler un problème dans l'espace public"
        excerpt="Deux minutes suffisent : décrivez ce que vous constatez, joignez une photo, placez le point sur le plan. Les services techniques reçoivent l'information immédiatement."
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3">
              <SectionHeader title="Votre signalement" />
              <ReportForm />
            </div>

            <aside className="lg:col-span-2">
              <div className="space-y-4 lg:sticky lg:top-32">
                <Card className="overflow-hidden">
                  <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
                    <p className="font-display text-sm font-bold">Comment votre signalement est traité</p>
                  </div>
                  <ol className="space-y-4 p-5 text-sm">
                    {[
                      {
                        title: "Réception",
                        text: "Votre signalement arrive directement dans l'outil de suivi de la mairie, avec la photo et la localisation.",
                      },
                      {
                        title: "Qualification",
                        text: "Un agent vérifie de quel gestionnaire relève le problème : commune, Département, intercommunalité ou concessionnaire de réseau.",
                      },
                      {
                        title: "Intervention",
                        text: "Les services techniques planifient l'intervention selon l'urgence : un danger immédiat passe avant une gêne d'usage.",
                      },
                      {
                        title: "Information",
                        text: "Vous êtes informé de l'avancement et de la résolution, avec votre référence de suivi.",
                      },
                    ].map((item, index) => (
                      <li key={item.title} className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-azur-600 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span>
                          <span className="block font-semibold">{item.title}</span>
                          <span className="mt-0.5 block text-[color:var(--texte-doux)]">
                            {item.text}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </Card>

                <Card className="border-red-200 bg-red-50 p-5 dark:border-red-500/40 dark:bg-red-900/25">
                  <p className="flex items-center gap-2 font-display text-sm font-bold text-red-900 dark:text-red-100">
                    <Icon name="Megaphone" className="size-4" />
                    Ce formulaire n'est pas un numéro d'urgence
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-red-900/90 dark:text-red-50/90">
                    En cas de <strong>danger immédiat</strong> — fuite de gaz, câble électrique à
                    terre, arbre sur la chaussée, inondation, accident — appelez le{" "}
                    <strong>112</strong>, le <strong>17</strong> ou le <strong>18</strong>. Aux
                    heures d'ouverture, vous pouvez aussi joindre la mairie au 04 78 43 92 03.
                  </p>
                </Card>

                <Card className="p-5">
                  <p className="flex items-center gap-2 font-display text-sm font-bold">
                    <Icon name="Info" className="size-4 text-dore-600 dark:text-dore-300" />
                    Ce qui ne relève pas de ce formulaire
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[color:var(--texte-doux)]">
                    {[
                      "Les litiges entre voisins : ils relèvent du conciliateur de justice.",
                      "Les problèmes à l'intérieur d'un logement privé : voyez avec votre propriétaire.",
                      "Les nuisances sonores en cours : appelez la gendarmerie.",
                      "Les pannes de compteur électrique ou de box internet : contactez votre fournisseur.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Icon name="Minus" className="mt-1.5 size-3 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="clair">
        <Container>
          <SectionHeader
            title="Les signalements les plus fréquents"
            subtitle="Pour vous donner une idée de ce qui peut être remonté."
          />
          <Grid columns={4}>
            {[
              { icon: "Hammer", title: "Voirie", text: "Nid-de-poule, trottoir descellé, marquage effacé, avaloir bouché." },
              { icon: "Lightbulb", title: "Éclairage public", text: "Lampadaire éteint, clignotant, allumé en pleine journée." },
              { icon: "Trash2", title: "Propreté", text: "Dépôt sauvage, point de collecte débordant, tags." },
              { icon: "Trees", title: "Espaces verts", text: "Branche menaçante, haie empiétant sur le trottoir, arbre malade." },
              { icon: "Droplets", title: "Eau", text: "Fuite sur la voie publique, bouche à clé descellée, écoulement anormal." },
              { icon: "Building2", title: "Bâtiments communaux", text: "Porte, sanitaire, chauffage, dégradation." },
              { icon: "Dog", title: "Animaux", text: "Chien errant, nid de guêpes sur un bâtiment public, nuisibles." },
              { icon: "CircleHelp", title: "Autre", text: "Mobilier urbain cassé, panneau tombé, aire de jeux abîmée." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] p-4"
              >
                <span className="mb-3 flex size-9 items-center justify-center rounded-field bg-azur-50 text-azur-600 dark:bg-azur-900/60 dark:text-azur-200">
                  <Icon name={item.icon} className="size-4.5" />
                </span>
                <p className="font-display text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[color:var(--texte-doux)]">
                  {item.text}
                </p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>
    </>
  );
}
