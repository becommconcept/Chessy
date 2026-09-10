import { enregistrerElu, supprimerElu } from "@/app/admin/actions-content";
import { MediaField } from "@/components/admin/MediaField";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminEmpty, AdminHeader, Cell, DataTable, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { Visual } from "@/components/ui/Visual";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ELU_ROLES, ELU_ROLE_LABELS, labelOf } from "@/lib/enums";

export const dynamic = "force-dynamic";
export const metadata = { title: "Élus" };

type Props = { searchParams: Promise<{ modifier?: string; enregistre?: string }> };

export default async function AdminElusPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { modifier, enregistre } = await searchParams;
  const editing = modifier && modifier !== "nouveau" ? modifier : null;

  const [elus, current] = await Promise.all([
    prisma.elu.findMany({
      orderBy: { order: "asc" },
      include: { photo: { select: { id: true, url: true, alt: true } } },
    }),
    editing
      ? prisma.elu.findUnique({
          where: { id: editing },
          include: { photo: { select: { id: true, url: true, alt: true } } },
        })
      : Promise.resolve(null),
  ]);

  const toComplete = elus.filter((elu) => elu.name.includes("compléter")).length;

  return (
    <>
      <AdminHeader
        title="Élus"
        description="Le maire, les adjoints et les conseillers municipaux, tels qu'ils apparaissent dans le trombinoscope du site."
        breadcrumb={[{ label: "Élus" }]}
        actions={
          <ButtonLink href="/admin/elus?modifier=nouveau" size="sm" icon="Plus">
            Ajouter un élu
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          La fiche a bien été enregistrée.
        </Notice>
      ) : null}

      {toComplete > 0 ? (
        <Notice tone="attention" title="Fiches à compléter" className="mb-5">
          {toComplete} fiche{toComplete > 1 ? "s" : ""} porte{toComplete > 1 ? "nt" : ""} encore la
          mention « Élu·e à compléter ». Renseignez les noms réels avant la mise en ligne du site :
          le contenu livré ne comporte volontairement aucun nom inventé.
        </Notice>
      ) : null}

      {modifier ? (
        <Panel
          className="mb-6"
          title={current ? `Modifier « ${current.name} »` : "Ajouter un élu"}
          actions={
            <ButtonLink href="/admin/elus" variant="discret" size="sm" icon="X">
              Fermer
            </ButtonLink>
          }
        >
          <form action={enregistrerElu} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <input type="hidden" name="id" value={current?.id ?? ""} />

            <Field label="Nom et prénom" htmlFor="nom" required>
              <Input id="nom" name="nom" defaultValue={current?.name ?? ""} required maxLength={120} />
            </Field>

            <Field label="Fonction" htmlFor="fonction" required>
              <Select id="fonction" name="fonction" defaultValue={current?.role ?? "CONSEILLER"}>
                {ELU_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ELU_ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Intitulé précis"
              htmlFor="intitule"
              hint="Exemple : 1re adjointe, conseiller délégué au patrimoine."
            >
              <Input id="intitule" name="intitule" defaultValue={current?.title ?? ""} maxLength={120} />
            </Field>

            <Field label="Ordre d'affichage" htmlFor="ordre" hint="Le maire en 0, puis les adjoints.">
              <Input id="ordre" name="ordre" type="number" defaultValue={String(current?.order ?? elus.length)} />
            </Field>

            <Field
              label="Délégations"
              htmlFor="delegations"
              hint="Domaines suivis, séparés par des virgules."
              className="sm:col-span-2"
            >
              <Textarea
                id="delegations"
                name="delegations"
                rows={2}
                defaultValue={current?.delegations ?? ""}
                maxLength={300}
              />
            </Field>

            <Field
              label="Courriel"
              htmlFor="courriel"
              hint="Facultatif. Préférez une adresse de fonction à une adresse personnelle."
            >
              <Input id="courriel" name="courriel" type="email" defaultValue={current?.email ?? ""} />
            </Field>

            <div className="sm:col-span-2">
              <MediaField
                name="photo"
                label="Portrait"
                hint="Format carré recommandé. L'accord de la personne est nécessaire avant publication."
                defaultValue={
                  current?.photo
                    ? { id: current.photo.id, url: current.photo.url, alt: current.photo.alt }
                    : null
                }
              />
            </div>

            <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
              <SubmitButton icon="Save">Enregistrer la fiche</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel>
        {elus.length === 0 ? (
          <AdminEmpty icon="UserSquare2" title="Aucun élu enregistré" />
        ) : (
          <DataTable
            caption="Liste des élus"
            columns={[
              { label: "Portrait", sr: true },
              { label: "Élu" },
              { label: "Fonction" },
              { label: "Délégations" },
              { label: "Ordre", className: "text-right" },
              { label: "Actions", sr: true },
            ]}
          >
            {elus.map((elu) => (
              <tr key={elu.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell className="w-14">
                  <Visual
                    source={elu.photo}
                    ratio="1/1"
                    className="size-10 rounded-full"
                    sizes="40px"
                    alt={`Portrait de ${elu.name}`}
                  />
                </Cell>
                <Cell header>
                  <span className="font-semibold">{elu.name}</span>
                  {elu.email ? (
                    <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">{elu.email}</span>
                  ) : null}
                </Cell>
                <Cell>
                  <Pill tone={elu.role === "MAIRE" ? "attente" : "neutre"}>
                    {elu.title || labelOf(ELU_ROLE_LABELS, elu.role)}
                  </Pill>
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">{elu.delegations ?? "—"}</Cell>
                <Cell className="text-right text-xs tabular-nums text-[color:var(--texte-doux)]">
                  {elu.order}
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/elus?modifier=${elu.id}`}
                    items={[
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer la fiche de ${elu.name} ?`,
                        action: supprimerElu.bind(null, elu.id),
                      },
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <HelpNote title="Données personnelles des élus" icon="ShieldCheck">
        Ne publiez que ce qui relève de la fonction : nom, intitulé, délégations, adresse de
        fonction. Les coordonnées personnelles (téléphone privé, adresse du domicile) n'ont pas à
        figurer sur le site.
      </HelpNote>
    </>
  );
}
