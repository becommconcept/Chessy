import Link from "next/link";

import { supprimerDemarche } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMARCHE_CATEGORIES, DEMARCHE_CATEGORY_LABELS, labelOf, type DemarcheCategory } from "@/lib/enums";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fiches démarches" };

type Props = { searchParams: Promise<{ categorie?: string; enregistre?: string }> };

export default async function AdminDemarchesPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { categorie, enregistre } = await searchParams;

  const [demarches, counts] = await Promise.all([
    prisma.demarche.findMany({
      where: DEMARCHE_CATEGORIES.includes(categorie as DemarcheCategory) ? { category: categorie } : undefined,
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        onlineUrl: true,
        internalPath: true,
        featured: true,
        processTime: true,
      },
    }),
    prisma.demarche.groupBy({ by: ["category"], _count: true }),
  ]);

  const countOf = (value: string) => counts.find((entry) => entry.category === value)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);

  return (
    <>
      <AdminHeader
        title="Fiches démarches"
        description="Chaque fiche explique une démarche : qui peut la faire, quelles pièces fournir, quel délai, quel coût, et par quel téléservice passer."
        breadcrumb={[{ label: "Fiches démarches" }]}
        actions={
          <ButtonLink href="/admin/demarches/nouvelle" size="sm" icon="Plus">
            Nouvelle fiche
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          La fiche a bien été enregistrée.
        </Notice>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/demarches" active={!categorie} count={total}>
          Toutes
        </FilterLink>
        {DEMARCHE_CATEGORIES.filter((category) => countOf(category) > 0).map((category) => (
          <FilterLink
            key={category}
            href={`/admin/demarches?categorie=${category}`}
            active={categorie === category}
            count={countOf(category)}
          >
            {DEMARCHE_CATEGORY_LABELS[category]}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {demarches.length === 0 ? (
          <AdminEmpty icon="ClipboardList" title="Aucune fiche démarche" />
        ) : (
          <DataTable
            caption="Liste des fiches démarches"
            columns={[
              { label: "Fiche" },
              { label: "Thème" },
              { label: "En ligne" },
              { label: "Délai" },
              { label: "Actions", sr: true },
            ]}
          >
            {demarches.map((demarche) => (
              <tr key={demarche.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell header>
                  <Link
                    href={`/admin/demarches/${demarche.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {demarche.title}
                  </Link>
                  <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                    {demarche.summary}
                  </span>
                </Cell>
                <Cell>
                  <Pill tone="neutre">{labelOf(DEMARCHE_CATEGORY_LABELS, demarche.category)}</Pill>
                </Cell>
                <Cell>
                  {demarche.internalPath ? (
                    <Pill tone="publie" icon="Zap">
                      Service interne
                    </Pill>
                  ) : demarche.onlineUrl ? (
                    <Pill tone="encours" icon="ExternalLink">
                      Téléservice
                    </Pill>
                  ) : (
                    <span className="text-xs text-[color:var(--texte-doux)]">sur place</span>
                  )}
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">
                  {demarche.processTime ?? "—"}
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/demarches/${demarche.id}`}
                    items={[
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer la fiche « ${demarche.title} » ?`,
                        action: supprimerDemarche.bind(null, demarche.id),
                      },
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <HelpNote title="La règle d'or d'une fiche démarche" icon="Lightbulb">
        Un habitant doit repartir en sachant <strong>où aller</strong>, <strong>avec quoi</strong> et{" "}
        <strong>pour combien de temps</strong>. Vérifiez chaque année les liens vers les
        téléservices nationaux et les montants réglementaires : ce sont eux qui vieillissent le plus
        vite. Un lien mort sur une fiche démarche génère immédiatement des appels à l'accueil.
      </HelpNote>
    </>
  );
}
