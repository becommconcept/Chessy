import { notFound } from "next/navigation";

import { enregistrerEvenement } from "@/app/admin/actions-content";
import { HtmlField } from "@/components/admin/HtmlField";
import { MediaField } from "@/components/admin/MediaField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from "@/lib/enums";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** Convertit une date en valeur d'un champ `datetime-local`. */
function toLocalInput(date: Date | null | undefined): string {
  if (!date) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (id === "nouveau") return { title: "Nouvel évènement" };
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  return { title: event ? `Modifier « ${event.title} »` : "Évènement introuvable" };
}

export default async function EditeurEvenementPage({ params }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { id } = await params;
  const creating = id === "nouveau";

  const [event, associations] = await Promise.all([
    creating
      ? Promise.resolve(null)
      : prisma.event.findUnique({
          where: { id },
          include: { cover: { select: { id: true, url: true, alt: true } } },
        }),
    prisma.association.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, shortName: true },
    }),
  ]);

  if (!creating && !event) notFound();

  return (
    <>
      <AdminHeader
        title={creating ? "Nouvel évènement" : "Modifier l'évènement"}
        breadcrumb={[
          { label: "Agenda", href: "/admin/agenda" },
          { label: creating ? "Nouveau" : (event?.title ?? "") },
        ]}
        actions={
          event ? (
            <ButtonLink href={`/agenda/${event.slug}`} variant="contour" size="sm" icon="Eye" target="_blank">
              Voir sur le site
            </ButtonLink>
          ) : null
        }
      />

      <form action={enregistrerEvenement} className="grid gap-5 lg:grid-cols-3">
        <input type="hidden" name="id" value={event?.id ?? ""} />

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Description de l'évènement">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Titre" htmlFor="titre" required>
                <Input id="titre" name="titre" defaultValue={event?.title ?? ""} required maxLength={200} />
              </Field>

              <Field
                label="Accroche"
                htmlFor="chapeau"
                hint="Une phrase, affichée dans le calendrier et les listes."
              >
                <Textarea id="chapeau" name="chapeau" rows={2} defaultValue={event?.excerpt ?? ""} maxLength={300} />
              </Field>

              <HtmlField
                name="description"
                label="Descriptif complet"
                defaultValue={event?.description ?? "<p></p>"}
                minHeight={240}
              />

              <MediaField
                name="image"
                label="Affiche ou photographie"
                defaultValue={
                  event?.cover ? { id: event.cover.id, url: event.cover.url, alt: event.cover.alt } : null
                }
              />
            </div>
          </Panel>

          <Panel title="Lieu et informations pratiques">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Lieu" htmlFor="lieu" hint="Exemple : salle des fêtes, place du village.">
                <Input id="lieu" name="lieu" defaultValue={event?.place ?? ""} maxLength={160} />
              </Field>
              <Field label="Adresse" htmlFor="adresse">
                <Input id="adresse" name="adresse" defaultValue={event?.address ?? ""} maxLength={200} />
              </Field>
              <Field label="Organisateur" htmlFor="organisateur">
                <Input
                  id="organisateur"
                  name="organisateur"
                  defaultValue={event?.organizer ?? ""}
                  maxLength={160}
                />
              </Field>
              <Field label="Association organisatrice" htmlFor="association">
                <Select id="association" name="association" defaultValue={event?.associationId ?? ""}>
                  <option value="">Aucune / organisé par la commune</option>
                  {associations.map((association) => (
                    <option key={association.id} value={association.id}>
                      {association.shortName ?? association.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tarif" htmlFor="tarif" hint="Exemple : entrée libre, 5 € sur place.">
                <Input id="tarif" name="tarif" defaultValue={event?.priceInfo ?? ""} maxLength={160} />
              </Field>
              <Field label="Public visé" htmlFor="public">
                <Select id="public" name="public" defaultValue={event?.audience ?? ""}>
                  <option value="">Non précisé</option>
                  <option value="TOUT_PUBLIC">Tout public</option>
                  <option value="FAMILLE">Familles</option>
                  <option value="SENIORS">Aînés</option>
                  <option value="JEUNESSE">Jeunesse</option>
                </Select>
              </Field>
              <Field label="Lien d'inscription" htmlFor="inscription">
                <Input
                  id="inscription"
                  name="inscription"
                  type="url"
                  defaultValue={event?.registrationUrl ?? ""}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Courriel de contact" htmlFor="courriel">
                <Input
                  id="courriel"
                  name="courriel"
                  type="email"
                  defaultValue={event?.contactEmail ?? ""}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Dates">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Début" htmlFor="debut" required>
                <Input
                  id="debut"
                  name="debut"
                  type="datetime-local"
                  defaultValue={toLocalInput(event?.startAt)}
                  required
                />
              </Field>
              <Field label="Fin" htmlFor="fin" hint="Laissez vide pour un évènement ponctuel.">
                <Input
                  id="fin"
                  name="fin"
                  type="datetime-local"
                  defaultValue={toLocalInput(event?.endAt)}
                />
              </Field>
              <Checkbox
                name="journeeEntiere"
                defaultChecked={event?.allDay ?? false}
                label="Toute la journée"
                description="Masque les horaires à l'affichage."
              />
            </div>
          </Panel>

          <Panel title="Classement et publication">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Type de manifestation" htmlFor="categorie">
                <Select id="categorie" name="categorie" defaultValue={event?.category ?? ""}>
                  <option value="">Non classé</option>
                  {EVENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {EVENT_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="État" htmlFor="statut">
                <Select id="statut" name="statut" defaultValue={event?.status ?? "PUBLIEE"}>
                  <option value="PUBLIEE">Publié</option>
                  <option value="BROUILLON">Brouillon (non visible)</option>
                </Select>
              </Field>

              <Checkbox
                name="vedette"
                defaultChecked={event?.featured ?? false}
                label="Mettre en avant"
                description="Signale l'évènement comme temps fort de la commune."
              />

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="Save">
                  Enregistrer
                </SubmitButton>
              </div>
            </div>
          </Panel>

          <HelpNote title="Le calendrier des habitants" icon="CalendarPlus">
            Chaque évènement publié devient téléchargeable au format iCalendar : les habitants
            peuvent l'ajouter à l'agenda de leur téléphone en un clic.
          </HelpNote>
        </div>
      </form>
    </>
  );
}
