import { notFound } from "next/navigation";

import { enregistrerEquipement } from "@/app/admin/actions-content";
import { MediaField } from "@/components/admin/MediaField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel } from "@/components/admin/ui";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EQUIPEMENT_CATEGORIES, EQUIPEMENT_CATEGORY_LABELS } from "@/lib/enums";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (id === "nouveau") return { title: "Nouvel équipement" };
  const equipement = await prisma.equipement.findUnique({ where: { id }, select: { name: true } });
  return { title: equipement ? `Modifier « ${equipement.name} »` : "Équipement introuvable" };
}

export default async function EditeurEquipementPage({ params }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { id } = await params;
  const creating = id === "nouveau";

  const equipement = creating
    ? null
    : await prisma.equipement.findUnique({
        where: { id },
        include: { image: { select: { id: true, url: true, alt: true } } },
      });

  if (!creating && !equipement) notFound();

  return (
    <>
      <AdminHeader
        title={creating ? "Nouvel équipement" : "Modifier l'équipement"}
        breadcrumb={[
          { label: "Équipements", href: "/admin/equipements" },
          { label: creating ? "Nouveau" : (equipement?.name ?? "") },
        ]}
      />

      <form action={enregistrerEquipement} className="grid gap-5 lg:grid-cols-3">
        <input type="hidden" name="id" value={equipement?.id ?? ""} />

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Description">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Nom" htmlFor="nom" required className="sm:col-span-2">
                <Input id="nom" name="nom" defaultValue={equipement?.name ?? ""} required maxLength={160} />
              </Field>

              <Field label="Catégorie" htmlFor="categorie" required>
                <Select id="categorie" name="categorie" defaultValue={equipement?.category ?? "MAIRIE"}>
                  {EQUIPEMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {EQUIPEMENT_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Ordre d'affichage" htmlFor="ordre">
                <Input id="ordre" name="ordre" type="number" defaultValue={String(equipement?.order ?? 0)} />
              </Field>

              <Field label="Description" htmlFor="description" className="sm:col-span-2">
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={equipement?.description ?? ""}
                  maxLength={600}
                />
              </Field>

              <div className="sm:col-span-2">
                <MediaField
                  name="image"
                  label="Photographie"
                  defaultValue={
                    equipement?.image
                      ? { id: equipement.image.id, url: equipement.image.url, alt: equipement.image.alt }
                      : null
                  }
                />
              </div>
            </div>
          </Panel>

          <Panel title="Localisation et contact">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Adresse" htmlFor="adresse" className="sm:col-span-2">
                <Input id="adresse" name="adresse" defaultValue={equipement?.address ?? ""} maxLength={200} />
              </Field>
              <Field
                label="Latitude"
                htmlFor="latitude"
                hint="Exemple : 45.8836. Relevée sur OpenStreetMap."
              >
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  defaultValue={equipement?.lat ?? ""}
                />
              </Field>
              <Field label="Longitude" htmlFor="longitude" hint="Exemple : 4.6208.">
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  defaultValue={equipement?.lng ?? ""}
                />
              </Field>
              <Field label="Téléphone" htmlFor="telephone">
                <Input id="telephone" name="telephone" type="tel" defaultValue={equipement?.phone ?? ""} />
              </Field>
              <Field label="Courriel" htmlFor="courriel">
                <Input id="courriel" name="courriel" type="email" defaultValue={equipement?.email ?? ""} />
              </Field>
              <Field
                label="Horaires ou conditions d'accès"
                htmlFor="horaires"
                className="sm:col-span-2"
              >
                <Input id="horaires" name="horaires" defaultValue={equipement?.hours ?? ""} maxLength={200} />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Accessibilité">
            <div className="space-y-4 p-4 sm:p-5">
              <Checkbox
                name="accessible"
                defaultChecked={equipement?.accessible ?? false}
                label="Accessible aux personnes à mobilité réduite"
                description="Accès de plain-pied ou rampe conforme, sanitaire adapté le cas échéant."
              />

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="Save">
                  Enregistrer
                </SubmitButton>
              </div>
            </div>
          </Panel>

          <HelpNote title="Trouver les coordonnées" icon="Locate">
            Sur openstreetmap.org, faites un clic droit sur le point exact puis « Afficher
            l'adresse » : la latitude et la longitude s'affichent dans la barre de gauche.
          </HelpNote>
        </div>
      </form>
    </>
  );
}
