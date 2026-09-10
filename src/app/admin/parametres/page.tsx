import { enregistrerParametres } from "@/app/admin/actions-config";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel } from "@/components/admin/ui";
import { Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { requireRole } from "@/lib/auth";
import { getSettings, SETTINGS_GROUP_LABELS, type SettingsGroup } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Paramètres du site" };

const GROUPS: Array<{ key: SettingsGroup; icon: string; description: string }> = [
  { key: "identity", icon: "Landmark", description: "Nom de la commune, chiffres clés, intercommunalité." },
  { key: "contact", icon: "Contact", description: "Adresse, téléphone, adresses électroniques par service." },
  { key: "hours", icon: "Clock", description: "Horaires d'ouverture de l'accueil, jour par jour." },
  { key: "social", icon: "Share2", description: "Réseaux sociaux et applications d'alerte." },
  { key: "footer", icon: "PanelLeft", description: "Texte de présentation, partenaires, liens légaux." },
  { key: "theme", icon: "Palette", description: "Couleurs et style des éléments d'interface." },
  { key: "services", icon: "Sparkles", description: "Activation des services en ligne." },
  { key: "seo", icon: "Search", description: "Titre, description et mots-clés pour les moteurs." },
];

type Props = { searchParams: Promise<{ groupe?: string; enregistre?: string }> };

export default async function AdminParametresPage({ searchParams }: Props) {
  await requireRole(["ADMIN"], "/admin/parametres");

  const { groupe, enregistre } = await searchParams;
  const settings = await getSettings();
  const active = (GROUPS.find((entry) => entry.key === groupe)?.key ?? "identity") as SettingsGroup;

  return (
    <>
      <AdminHeader
        title="Paramètres du site"
        description="Ces réglages alimentent l'en-tête, le pied de page, les pages de contact et les métadonnées du site. Une modification est visible immédiatement."
        breadcrumb={[{ label: "Paramètres" }]}
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          Les réglages ont été enregistrés et sont désormais appliqués sur le site.
        </Notice>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-4">
        {/* Navigation des groupes */}
        <nav aria-label="Groupes de réglages" className="lg:col-span-1">
          <ul className="space-y-1">
            {GROUPS.map((group) => (
              <li key={group.key}>
                <a
                  href={`/admin/parametres?groupe=${group.key}`}
                  aria-current={active === group.key ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-2.5 rounded-field p-3 transition-colors",
                    active === group.key
                      ? "bg-azur-600 text-white"
                      : "bg-[color:var(--surface)] hover:bg-[color:var(--surface-alt)]",
                  )}
                >
                  <Icon name={group.icon} className="mt-0.5 size-4.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {SETTINGS_GROUP_LABELS[group.key]}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-xs leading-snug",
                        active === group.key ? "text-white/75" : "text-[color:var(--texte-doux)]",
                      )}
                    >
                      {group.description}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <Panel title={SETTINGS_GROUP_LABELS[active]}>
            <form action={enregistrerParametres} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <input type="hidden" name="groupe" value={active} />

              {active === "identity" ? (
                <>
                  <Field label="Nom de la commune" htmlFor="nom" required>
                    <Input id="nom" name="nom" defaultValue={settings.identity.name} required />
                  </Field>
                  <Field label="Nom court" htmlFor="nomCourt">
                    <Input id="nomCourt" name="nomCourt" defaultValue={settings.identity.shortName} />
                  </Field>
                  <Field label="Accroche" htmlFor="accroche" className="sm:col-span-2">
                    <Input id="accroche" name="accroche" defaultValue={settings.identity.tagline} />
                  </Field>
                  <Field label="Gentilé" htmlFor="gentile" hint="Exemple : Cassissiennes et Cassissiens.">
                    <Input id="gentile" name="gentile" defaultValue={settings.identity.inhabitantsLabel} />
                  </Field>
                  <Field label="Nom du maire" htmlFor="maire">
                    <Input id="maire" name="maire" defaultValue={settings.identity.mayor} />
                  </Field>
                  <Field label="Département" htmlFor="departement">
                    <Input id="departement" name="departement" defaultValue={settings.identity.department} />
                  </Field>
                  <Field label="Région" htmlFor="region">
                    <Input id="region" name="region" defaultValue={settings.identity.region} />
                  </Field>
                  <Field label="Intercommunalité" htmlFor="intercommunalite" className="sm:col-span-2">
                    <Input
                      id="intercommunalite"
                      name="intercommunalite"
                      defaultValue={settings.identity.intercommunality}
                    />
                  </Field>
                  <Field label="Site de l'intercommunalité" htmlFor="intercommunaliteUrl" className="sm:col-span-2">
                    <Input
                      id="intercommunaliteUrl"
                      name="intercommunaliteUrl"
                      type="url"
                      defaultValue={settings.identity.intercommunalityUrl}
                    />
                  </Field>
                  <Field label="Code INSEE" htmlFor="insee">
                    <Input id="insee" name="insee" defaultValue={settings.identity.insee} />
                  </Field>
                  <Field label="Population" htmlFor="population">
                    <Input
                      id="population"
                      name="population"
                      type="number"
                      defaultValue={String(settings.identity.population)}
                    />
                  </Field>
                  <Field label="Superficie" htmlFor="superficie">
                    <Input id="superficie" name="superficie" defaultValue={settings.identity.area} />
                  </Field>
                  <Field label="Altitude" htmlFor="altitude">
                    <Input id="altitude" name="altitude" defaultValue={settings.identity.altitude} />
                  </Field>
                </>
              ) : null}

              {active === "contact" ? (
                <>
                  <Field label="Établissement" htmlFor="etablissement" className="sm:col-span-2">
                    <Input id="etablissement" name="etablissement" defaultValue={settings.contact.venue} />
                  </Field>
                  <Field label="Adresse" htmlFor="adresse">
                    <Input id="adresse" name="adresse" defaultValue={settings.contact.address} />
                  </Field>
                  <Field label="Code postal" htmlFor="codePostal">
                    <Input id="codePostal" name="codePostal" defaultValue={settings.contact.postalCode} />
                  </Field>
                  <Field label="Commune" htmlFor="ville">
                    <Input id="ville" name="ville" defaultValue={settings.contact.city} />
                  </Field>
                  <Field label="Téléphone" htmlFor="telephone">
                    <Input id="telephone" name="telephone" defaultValue={settings.contact.phone} />
                  </Field>
                  <Field label="Courriel de l'accueil" htmlFor="courriel">
                    <Input id="courriel" name="courriel" type="email" defaultValue={settings.contact.email} />
                  </Field>
                  <Field label="Courriel du service de l'eau" htmlFor="courrielEau">
                    <Input
                      id="courrielEau"
                      name="courrielEau"
                      type="email"
                      defaultValue={settings.contact.waterEmail}
                    />
                  </Field>
                  <Field label="Courriel des services techniques" htmlFor="courrielTechnique">
                    <Input
                      id="courrielTechnique"
                      name="courrielTechnique"
                      type="email"
                      defaultValue={settings.contact.technicalEmail}
                    />
                  </Field>
                  <Field label="Télécopie" htmlFor="fax">
                    <Input id="fax" name="fax" defaultValue={settings.contact.fax} />
                  </Field>
                  <Field label="Latitude" htmlFor="latitude" hint="Position de la mairie sur le plan.">
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      defaultValue={String(settings.contact.lat)}
                    />
                  </Field>
                  <Field label="Longitude" htmlFor="longitude">
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.000001"
                      defaultValue={String(settings.contact.lng)}
                    />
                  </Field>
                  <Field label="Note sur les urgences" htmlFor="urgences" className="sm:col-span-2">
                    <Textarea
                      id="urgences"
                      name="urgences"
                      rows={2}
                      defaultValue={settings.contact.emergencyNote}
                    />
                  </Field>
                </>
              ) : null}

              {active === "hours" ? (
                <>
                  <Field label="Phrase d'introduction" htmlFor="introduction" className="sm:col-span-2">
                    <Input id="introduction" name="introduction" defaultValue={settings.hours.intro} />
                  </Field>

                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-semibold">Horaires jour par jour</p>
                    <p className="mb-3 text-xs text-[color:var(--texte-doux)]">
                      Saisissez la ou les plages horaires, séparées par un point-virgule (exemple :
                      « 9h00 – 12h00 ; 14h30 – 18h30 »). Laissez vide pour un jour de fermeture.
                    </p>
                    <div className="space-y-2">
                      {settings.hours.slots.map((slot, index) => (
                        <div key={slot.day} className="flex items-center gap-3">
                          <label
                            htmlFor={`creneau-${index}`}
                            className="w-24 shrink-0 text-sm font-medium"
                          >
                            {slot.day}
                          </label>
                          <Input
                            id={`creneau-${index}`}
                            name={`creneau-${index}`}
                            defaultValue={slot.closed ? "" : slot.ranges.join(" ; ")}
                            placeholder="Fermé"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Field label="Note sur l'accueil téléphonique" htmlFor="noteTelephone">
                    <Input id="noteTelephone" name="noteTelephone" defaultValue={settings.hours.phoneNote} />
                  </Field>
                  <Field label="Précision complémentaire" htmlFor="note">
                    <Input id="note" name="note" defaultValue={settings.hours.note} />
                  </Field>
                </>
              ) : null}

              {active === "social" ? (
                <>
                  <Field label="Page Facebook" htmlFor="facebook">
                    <Input id="facebook" name="facebook" type="url" defaultValue={settings.social.facebook} />
                  </Field>
                  <Field label="Compte Instagram" htmlFor="instagram">
                    <Input id="instagram" name="instagram" type="url" defaultValue={settings.social.instagram} />
                  </Field>
                  <Field label="Chaîne YouTube" htmlFor="youtube">
                    <Input id="youtube" name="youtube" type="url" defaultValue={settings.social.youtube} />
                  </Field>
                  <Field label="Page LinkedIn" htmlFor="linkedin">
                    <Input id="linkedin" name="linkedin" type="url" defaultValue={settings.social.linkedin} />
                  </Field>
                  <Field
                    label="PanneauPocket"
                    htmlFor="panneauPocket"
                    hint="Lien vers la page de la commune sur l'application."
                    className="sm:col-span-2"
                  >
                    <Input
                      id="panneauPocket"
                      name="panneauPocket"
                      type="url"
                      defaultValue={settings.social.panneauPocket}
                    />
                  </Field>
                  <Field label="IntraMuros" htmlFor="intramuros" className="sm:col-span-2">
                    <Input id="intramuros" name="intramuros" type="url" defaultValue={settings.social.intramuros} />
                  </Field>
                </>
              ) : null}

              {active === "footer" ? (
                <>
                  <Field label="Texte de présentation" htmlFor="presentation" className="sm:col-span-2">
                    <Textarea id="presentation" name="presentation" rows={4} defaultValue={settings.footer.about} />
                  </Field>
                  <Field
                    label="Partenaires institutionnels"
                    htmlFor="partenaires"
                    hint="Une ligne par partenaire, au format « Nom | https://adresse »."
                    className="sm:col-span-2"
                  >
                    <Textarea
                      id="partenaires"
                      name="partenaires"
                      rows={6}
                      defaultValue={settings.footer.partners
                        .map((partner) => `${partner.label} | ${partner.href}`)
                        .join("\n")}
                      className="font-mono text-xs"
                    />
                  </Field>
                  <Field
                    label="Liens légaux"
                    htmlFor="liensLegaux"
                    hint="Une ligne par lien, au format « Libellé | /chemin »."
                    className="sm:col-span-2"
                  >
                    <Textarea
                      id="liensLegaux"
                      name="liensLegaux"
                      rows={6}
                      defaultValue={settings.footer.legalLinks
                        .map((link) => `${link.label} | ${link.href}`)
                        .join("\n")}
                      className="font-mono text-xs"
                    />
                  </Field>
                </>
              ) : null}

              {active === "theme" ? (
                <>
                  <Field
                    label="Couleur principale"
                    htmlFor="couleurPrincipale"
                    hint="Code hexadécimal, par exemple #14507f."
                  >
                    <Input
                      id="couleurPrincipale"
                      name="couleurPrincipale"
                      defaultValue={settings.theme.primary}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Couleur d'accent" htmlFor="couleurAccent">
                    <Input
                      id="couleurAccent"
                      name="couleurAccent"
                      defaultValue={settings.theme.accent}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Couleur foncée" htmlFor="couleurFoncee">
                    <Input
                      id="couleurFoncee"
                      name="couleurFoncee"
                      defaultValue={settings.theme.dark}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Arrondis" htmlFor="arrondis">
                    <Select id="arrondis" name="arrondis" defaultValue={settings.theme.radius}>
                      <option value="sobre">Sobre (angles droits)</option>
                      <option value="doux">Doux (recommandé)</option>
                      <option value="arrondi">Très arrondi</option>
                    </Select>
                  </Field>
                  <Field label="Motif des bandeaux" htmlFor="motif">
                    <Select id="motif" name="motif" defaultValue={settings.theme.heroPattern}>
                      <option value="mine">Filons de la mine</option>
                      <option value="vigne">Vignes du Beaujolais</option>
                      <option value="pierre">Pierres dorées</option>
                      <option value="aucun">Aucun motif</option>
                    </Select>
                  </Field>
                  <div className="sm:col-span-2">
                    <HelpNote title="Portée de ces réglages" icon="Info">
                      Les couleurs saisies ici sont conservées comme référence de charte. Le thème
                      appliqué au site est défini dans la feuille de style
                      <code className="mx-1 font-mono text-xs">src/styles/globals.css</code>, où les
                      teintes sont déclinées en nuances accessibles (contrastes vérifiés en thème
                      clair et sombre). Un changement de charte se répercute en modifiant ces
                      variables.
                    </HelpNote>
                  </div>
                </>
              ) : null}

              {active === "services" ? (
                <div className="space-y-2.5 sm:col-span-2">
                  <Checkbox
                    name="reservationSalle"
                    defaultChecked={settings.services.roomBooking}
                    label="Réservation de salle en ligne"
                    description="Affiche le service et les mises en avant associées."
                  />
                  <Checkbox
                    name="pretMateriel"
                    defaultChecked={settings.services.equipmentLoan}
                    label="Prêt de matériel en ligne"
                  />
                  <Checkbox
                    name="signalement"
                    defaultChecked={settings.services.reporting}
                    label="Signalement dans l'espace public"
                  />
                  <Checkbox
                    name="newsletter"
                    defaultChecked={settings.services.newsletter}
                    label="Lettre d'information"
                    description="Affiche les encarts d'inscription."
                  />
                  <Checkbox
                    name="rendezVous"
                    defaultChecked={settings.services.appointment}
                    label="Demande de rendez-vous"
                  />
                </div>
              ) : null}

              {active === "seo" ? (
                <>
                  <Field
                    label="Suffixe des titres"
                    htmlFor="suffixeTitre"
                    hint="Ajouté après le titre de chaque page dans l'onglet du navigateur."
                    className="sm:col-span-2"
                  >
                    <Input id="suffixeTitre" name="suffixeTitre" defaultValue={settings.seo.titleSuffix} />
                  </Field>
                  <Field
                    label="Description du site"
                    htmlFor="description"
                    hint="150 à 160 caractères, affichés dans les résultats de recherche."
                    className="sm:col-span-2"
                  >
                    <Textarea id="description" name="description" rows={3} defaultValue={settings.seo.description} />
                  </Field>
                  <Field
                    label="Mots-clés"
                    htmlFor="motsCles"
                    hint="Séparés par des virgules. Peu utilisés par les moteurs, mais utiles en interne."
                    className="sm:col-span-2"
                  >
                    <Textarea id="motsCles" name="motsCles" rows={2} defaultValue={settings.seo.keywords} />
                  </Field>
                </>
              ) : null}

              <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton icon="Save">Enregistrer ces réglages</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
