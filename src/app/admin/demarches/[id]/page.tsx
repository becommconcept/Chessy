import { notFound } from "next/navigation";

import { enregistrerDemarche } from "@/app/admin/actions-content";
import { HtmlField } from "@/components/admin/HtmlField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMARCHE_CATEGORIES, DEMARCHE_CATEGORY_LABELS } from "@/lib/enums";
import { safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (id === "nouvelle") return { title: "Nouvelle fiche démarche" };
  const demarche = await prisma.demarche.findUnique({ where: { id }, select: { title: true } });
  return { title: demarche ? `Modifier « ${demarche.title} »` : "Fiche introuvable" };
}

export default async function EditeurDemarchePage({ params }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { id } = await params;
  const creating = id === "nouvelle";

  const demarche = creating ? null : await prisma.demarche.findUnique({ where: { id } });
  if (!creating && !demarche) notFound();

  const docs = safeJson<string[]>(demarche?.requiredDocs, []);

  return (
    <>
      <AdminHeader
        title={creating ? "Nouvelle fiche démarche" : "Modifier la fiche"}
        breadcrumb={[
          { label: "Fiches démarches", href: "/admin/demarches" },
          { label: creating ? "Nouvelle" : (demarche?.title ?? "") },
        ]}
        actions={
          demarche ? (
            <ButtonLink
              href={`/demarches/${demarche.slug}`}
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

      <form action={enregistrerDemarche} className="grid gap-5 lg:grid-cols-3">
        <input type="hidden" name="id" value={demarche?.id ?? ""} />

        <div className="space-y-5 lg:col-span-2">
          <Panel title="La démarche">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Titre" htmlFor="titre" required className="sm:col-span-2">
                <Input id="titre" name="titre" defaultValue={demarche?.title ?? ""} required maxLength={200} />
              </Field>

              <Field
                label="Résumé"
                htmlFor="resume"
                required
                hint="Une phrase qui dit à quoi sert la démarche. Affichée dans les listes."
                className="sm:col-span-2"
              >
                <Textarea id="resume" name="resume" rows={2} defaultValue={demarche?.summary ?? ""} required maxLength={400} />
              </Field>

              <div className="sm:col-span-2">
                <HtmlField
                  name="contenu"
                  label="Explication détaillée"
                  hint="Structurez avec des intertitres : « Qui peut faire la démarche ? », « Comment procéder ? », « Bon à savoir »."
                  defaultValue={demarche?.content ?? "<p></p>"}
                  minHeight={300}
                />
              </div>

              <Field
                label="Pièces à fournir"
                htmlFor="pieces"
                hint="Une pièce par ligne. Affichées sous forme de liste à cocher."
                className="sm:col-span-2"
              >
                <Textarea id="pieces" name="pieces" rows={6} defaultValue={docs.join("\n")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Où effectuer la démarche">
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field
                label="Téléservice national"
                htmlFor="teleservice"
                hint="Lien vers service-public.fr, l'ANTS, impots.gouv.fr…"
              >
                <Input
                  id="teleservice"
                  name="teleservice"
                  type="url"
                  defaultValue={demarche?.onlineUrl ?? ""}
                  placeholder="https://www.service-public.fr/…"
                />
              </Field>
              <Field label="Libellé du bouton" htmlFor="libelleTeleservice">
                <Input
                  id="libelleTeleservice"
                  name="libelleTeleservice"
                  defaultValue={demarche?.onlineLabel ?? ""}
                  placeholder="Faire ma demande en ligne"
                  maxLength={120}
                />
              </Field>
              <Field
                label="Service en ligne de la commune"
                htmlFor="serviceInterne"
                hint="Chemin interne, par exemple /services/salle-des-fetes."
                className="sm:col-span-2"
              >
                <Input
                  id="serviceInterne"
                  name="serviceInterne"
                  defaultValue={demarche?.internalPath ?? ""}
                  placeholder="/services/signalement"
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Classement et repères">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Thème" htmlFor="categorie" required>
                <Select id="categorie" name="categorie" defaultValue={demarche?.category ?? "AUTRE"}>
                  {DEMARCHE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {DEMARCHE_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Public concerné" htmlFor="public">
                <Input
                  id="public"
                  name="public"
                  defaultValue={demarche?.audience ?? ""}
                  placeholder="Particuliers"
                  maxLength={120}
                />
              </Field>

              <Field label="Délai" htmlFor="delai">
                <Input
                  id="delai"
                  name="delai"
                  defaultValue={demarche?.processTime ?? ""}
                  placeholder="1 mois"
                  maxLength={160}
                />
              </Field>

              <Field label="Coût" htmlFor="cout">
                <Input
                  id="cout"
                  name="cout"
                  defaultValue={demarche?.cost ?? ""}
                  placeholder="Gratuit"
                  maxLength={160}
                />
              </Field>

              <Field label="Icône" htmlFor="icone" hint="Nom d'icône, par exemple IdCard ou Hammer.">
                <Input id="icone" name="icone" defaultValue={demarche?.icon ?? ""} maxLength={60} />
              </Field>

              <Field label="Ordre" htmlFor="ordre">
                <Input id="ordre" name="ordre" type="number" defaultValue={String(demarche?.order ?? 0)} />
              </Field>

              <Checkbox
                name="vedette"
                defaultChecked={demarche?.featured ?? false}
                label="Démarche fréquente"
                description="Remonte la fiche dans les accès rapides."
              />

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="Save">
                  Enregistrer
                </SubmitButton>
              </div>
            </div>
          </Panel>

          <HelpNote title="Écrire en langage clair" icon="Type">
            Préférez « vous devez apporter » à « le requérant produira », et donnez le nom exact du
            formulaire quand il existe. Une fiche comprise du premier coup, c'est un déplacement
            inutile évité.
          </HelpNote>
        </div>
      </form>
    </>
  );
}
