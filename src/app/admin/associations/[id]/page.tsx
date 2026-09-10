import { notFound } from "next/navigation";

import { enregistrerAssociation } from "@/app/admin/actions-content";
import { HtmlField } from "@/components/admin/HtmlField";
import { MediaField } from "@/components/admin/MediaField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ASSOCIATION_CATEGORIES, ASSOCIATION_CATEGORY_LABELS } from "@/lib/enums";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (id === "nouvelle") return { title: "Nouvelle association" };
  const association = await prisma.association.findUnique({ where: { id }, select: { name: true } });
  return { title: association ? `Modifier « ${association.name} »` : "Association introuvable" };
}

export default async function EditeurAssociationPage({ params }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { id } = await params;
  const creating = id === "nouvelle";

  const association = creating
    ? null
    : await prisma.association.findUnique({
        where: { id },
        include: { logo: { select: { id: true, url: true, alt: true } } },
      });

  if (!creating && !association) notFound();

  const count = await prisma.association.count();

  return (
    <>
      <AdminHeader
        title={creating ? "Nouvelle association" : "Modifier l'association"}
        breadcrumb={[
          { label: "Associations", href: "/admin/associations" },
          { label: creating ? "Nouvelle" : (association?.name ?? "") },
        ]}
        actions={
          association ? (
            <ButtonLink
              href={`/associations/${association.slug}`}
              variant="contour"
              size="sm"
              icon="Eye"
              target="_blank"
            >
              Voir sur le site
            </ButtonLink>
          ) : null
        }
      />

      <form action={enregistrerAssociation} className="grid gap-5 lg:grid-cols-3">
        <input type="hidden" name="id" value={association?.id ?? ""} />

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Identité">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Nom complet" htmlFor="nom" required className="sm:col-span-2">
                <Input id="nom" name="nom" defaultValue={association?.name ?? ""} required maxLength={200} />
              </Field>
              <Field label="Nom court" htmlFor="nomCourt" hint="Utilisé dans les listes et les cartes.">
                <Input id="nomCourt" name="nomCourt" defaultValue={association?.shortName ?? ""} maxLength={80} />
              </Field>
              <Field label="Domaine" htmlFor="categorie" required>
                <Select id="categorie" name="categorie" defaultValue={association?.category ?? "LOISIRS"}>
                  {ASSOCIATION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {ASSOCIATION_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <HtmlField
                  name="description"
                  label="Présentation"
                  hint="Ce que fait l'association, pour qui, et ce qui donnerait envie de la rejoindre."
                  defaultValue={association?.description ?? "<p></p>"}
                  minHeight={200}
                />
              </div>
              <div className="sm:col-span-2">
                <MediaField
                  name="logo"
                  label="Logo"
                  hint="Format carré de préférence."
                  defaultValue={
                    association?.logo
                      ? { id: association.logo.id, url: association.logo.url, alt: association.logo.alt }
                      : null
                  }
                />
              </div>
            </div>
          </Panel>

          <Panel title="Contact et pratique">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Présidence" htmlFor="president">
                <Input id="president" name="president" defaultValue={association?.president ?? ""} maxLength={120} />
              </Field>
              <Field label="Personne à contacter" htmlFor="contact">
                <Input id="contact" name="contact" defaultValue={association?.contactName ?? ""} maxLength={120} />
              </Field>
              <Field label="Courriel" htmlFor="courriel">
                <Input id="courriel" name="courriel" type="email" defaultValue={association?.email ?? ""} />
              </Field>
              <Field label="Téléphone" htmlFor="telephone">
                <Input id="telephone" name="telephone" type="tel" defaultValue={association?.phone ?? ""} />
              </Field>
              <Field label="Site internet" htmlFor="siteInternet">
                <Input
                  id="siteInternet"
                  name="siteInternet"
                  type="url"
                  defaultValue={association?.website ?? ""}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Page Facebook" htmlFor="facebook">
                <Input id="facebook" name="facebook" type="url" defaultValue={association?.facebook ?? ""} />
              </Field>
              <Field label="Adresse ou lieu d'activité" htmlFor="adresse" className="sm:col-span-2">
                <Input id="adresse" name="adresse" defaultValue={association?.address ?? ""} maxLength={200} />
              </Field>
              <Field
                label="Créneaux"
                htmlFor="creneaux"
                hint="Exemple : mardi 18h-20h, salle des associations."
              >
                <Input id="creneaux" name="creneaux" defaultValue={association?.schedule ?? ""} maxLength={200} />
              </Field>
              <Field label="Cotisation" htmlFor="cotisation" hint="Exemple : 45 € l'année, 30 € pour les moins de 18 ans.">
                <Input id="cotisation" name="cotisation" defaultValue={association?.fee ?? ""} maxLength={200} />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Affichage">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Ordre" htmlFor="ordre" hint="Plus le nombre est petit, plus la fiche remonte.">
                <Input id="ordre" name="ordre" type="number" defaultValue={String(association?.order ?? count)} />
              </Field>

              <Checkbox
                name="active"
                defaultChecked={association?.active ?? true}
                label="Fiche visible dans l'annuaire"
                description="Décochez pour une association en sommeil."
              />
              <Checkbox
                name="vedette"
                defaultChecked={association?.featured ?? false}
                label="Mettre en avant"
                description="Remonte la fiche en tête de l'annuaire."
              />

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="Save">
                  Enregistrer
                </SubmitButton>
              </div>
            </div>
          </Panel>

          <HelpNote title="Faire remplir la fiche par l'association" icon="Users">
            Le plus efficace : envoyer à chaque président un courriel avec la liste des champs, et
            saisir sa réponse ici. Les habitants cherchent d'abord un contact et un créneau
            d'activité.
          </HelpNote>
        </div>
      </form>
    </>
  );
}
