import Link from "next/link";

import { supprimerAssociation } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Field";
import { Visual } from "@/components/ui/Visual";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ASSOCIATION_CATEGORIES, ASSOCIATION_CATEGORY_LABELS, labelOf, type AssociationCategory } from "@/lib/enums";

export const dynamic = "force-dynamic";
export const metadata = { title: "Associations" };

type Props = { searchParams: Promise<{ categorie?: string; enregistre?: string }> };

export default async function AdminAssociationsPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { categorie, enregistre } = await searchParams;

  const [associations, counts] = await Promise.all([
    prisma.association.findMany({
      where: ASSOCIATION_CATEGORIES.includes(categorie as AssociationCategory)
        ? { category: categorie }
        : undefined,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        shortName: true,
        category: true,
        email: true,
        phone: true,
        president: true,
        active: true,
        featured: true,
        logo: { select: { url: true, alt: true } },
        _count: { select: { events: true } },
      },
    }),
    prisma.association.groupBy({ by: ["category"], _count: true }),
  ]);

  const countOf = (value: string) => counts.find((entry) => entry.category === value)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);
  const incomplete = associations.filter((entry) => !entry.email && !entry.phone && !entry.president).length;

  return (
    <>
      <AdminHeader
        title="Associations"
        description="L'annuaire présenté aux habitants. Une fiche complète — contact, créneaux, cotisation — évite bien des appels à l'accueil."
        breadcrumb={[{ label: "Associations" }]}
        actions={
          <ButtonLink href="/admin/associations/nouvelle" size="sm" icon="Plus">
            Ajouter une association
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          La fiche a bien été enregistrée.
        </Notice>
      ) : null}

      {incomplete > 0 ? (
        <Notice tone="info" title="Fiches sans coordonnées" className="mb-5">
          {incomplete} association{incomplete > 1 ? "s" : ""} n'a{incomplete > 1 ? "" : ""} ni
          courriel, ni téléphone, ni référent renseigné. Sollicitez les présidents pour compléter
          l'annuaire : c'est le renseignement le plus demandé par les habitants.
        </Notice>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/associations" active={!categorie} count={total}>
          Toutes
        </FilterLink>
        {ASSOCIATION_CATEGORIES.filter((category) => countOf(category) > 0).map((category) => (
          <FilterLink
            key={category}
            href={`/admin/associations?categorie=${category}`}
            active={categorie === category}
            count={countOf(category)}
          >
            {ASSOCIATION_CATEGORY_LABELS[category]}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {associations.length === 0 ? (
          <AdminEmpty icon="HeartHandshake" title="Aucune association" />
        ) : (
          <DataTable
            caption="Liste des associations"
            columns={[
              { label: "Logo", sr: true },
              { label: "Association" },
              { label: "Domaine" },
              { label: "Contact" },
              { label: "Agenda", className: "text-right" },
              { label: "État" },
              { label: "Actions", sr: true },
            ]}
          >
            {associations.map((association) => (
              <tr key={association.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell className="w-14">
                  <Visual
                    source={association.logo}
                    ratio="1/1"
                    className="size-10 rounded-field"
                    sizes="40px"
                    alt={`Logo de ${association.name}`}
                  />
                </Cell>
                <Cell header>
                  <Link
                    href={`/admin/associations/${association.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {association.shortName || association.name}
                  </Link>
                  {association.president ? (
                    <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                      {association.president}
                    </span>
                  ) : null}
                </Cell>
                <Cell>
                  <Pill tone="neutre">{labelOf(ASSOCIATION_CATEGORY_LABELS, association.category)}</Pill>
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">
                  {association.email || association.phone ? (
                    <>
                      {association.email ? <span className="block break-all">{association.email}</span> : null}
                      {association.phone ? <span className="block">{association.phone}</span> : null}
                    </>
                  ) : (
                    <Pill tone="attente">À compléter</Pill>
                  )}
                </Cell>
                <Cell className="text-right text-xs tabular-nums text-[color:var(--texte-doux)]">
                  {association._count.events}
                </Cell>
                <Cell>
                  {association.active ? (
                    <Pill tone="publie">Active</Pill>
                  ) : (
                    <Pill tone="brouillon">Masquée</Pill>
                  )}
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/associations/${association.id}`}
                    items={[
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer la fiche « ${association.name} » ? Ses évènements resteront dans l'agenda, sans rattachement.`,
                        action: supprimerAssociation.bind(null, association.id),
                      },
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
