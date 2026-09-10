import Link from "next/link";

import { supprimerEquipement } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { AdminEmpty, AdminHeader, Cell, DataTable, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EQUIPEMENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";

export const dynamic = "force-dynamic";
export const metadata = { title: "Équipements" };

type Props = { searchParams: Promise<{ enregistre?: string }> };

export default async function AdminEquipementsPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { enregistre } = await searchParams;

  const equipements = await prisma.equipement.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      address: true,
      lat: true,
      lng: true,
      accessible: true,
      hours: true,
    },
  });

  const missingCoords = equipements.filter((entry) => !entry.lat || !entry.lng).length;

  return (
    <>
      <AdminHeader
        title="Équipements communaux"
        description="Les lieux publics de la commune, affichés sur le plan interactif et dans les fiches pratiques."
        breadcrumb={[{ label: "Équipements" }]}
        actions={
          <ButtonLink href="/admin/equipements/nouveau" size="sm" icon="Plus">
            Ajouter un équipement
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          L'équipement a bien été enregistré.
        </Notice>
      ) : null}

      {missingCoords > 0 ? (
        <Notice tone="info" title="Coordonnées manquantes" className="mb-5">
          {missingCoords} équipement{missingCoords > 1 ? "s" : ""} n'a pas de latitude et longitude :
          il n'apparaît donc pas sur le plan. Relevez les coordonnées sur{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            openstreetmap.org
          </a>{" "}
          (clic droit sur le point, « Afficher l'adresse »).
        </Notice>
      ) : null}

      <Panel>
        {equipements.length === 0 ? (
          <AdminEmpty icon="MapPin" title="Aucun équipement" />
        ) : (
          <DataTable
            caption="Liste des équipements communaux"
            columns={[
              { label: "Équipement" },
              { label: "Catégorie" },
              { label: "Adresse" },
              { label: "Plan" },
              { label: "Accessibilité" },
              { label: "Actions", sr: true },
            ]}
          >
            {equipements.map((equipement) => (
              <tr key={equipement.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell header>
                  <Link
                    href={`/admin/equipements/${equipement.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {equipement.name}
                  </Link>
                  {equipement.hours ? (
                    <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                      {equipement.hours}
                    </span>
                  ) : null}
                </Cell>
                <Cell>
                  <Pill tone="neutre">{labelOf(EQUIPEMENT_CATEGORY_LABELS, equipement.category)}</Pill>
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">{equipement.address ?? "—"}</Cell>
                <Cell>
                  {equipement.lat && equipement.lng ? (
                    <Pill tone="publie" icon="MapPin">
                      Localisé
                    </Pill>
                  ) : (
                    <Pill tone="attente">Sans coordonnées</Pill>
                  )}
                </Cell>
                <Cell>
                  {equipement.accessible ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <Icon name="Accessibility" className="size-3.5" />
                      Accessible PMR
                    </span>
                  ) : (
                    <span className="text-xs text-[color:var(--texte-doux)]">non renseigné</span>
                  )}
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/equipements/${equipement.id}`}
                    items={[
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer l'équipement « ${equipement.name} » ?`,
                        action: supprimerEquipement.bind(null, equipement.id),
                      },
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <HelpNote title="Renseigner l'accessibilité" icon="Accessibility">
        L'information est très recherchée par les personnes concernées. Ne cochez la case que si
        l'accès est réellement de plain-pied ou équipé d'une rampe conforme, et précisez au besoin
        les conditions dans la description.
      </HelpNote>
    </>
  );
}
