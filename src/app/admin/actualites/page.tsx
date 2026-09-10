import Link from "next/link";

import { basculerPublicationActualite, supprimerActualite } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Actualités" };

type Props = { searchParams: Promise<{ statut?: string; enregistre?: string }> };

export default async function AdminActualitesPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { statut, enregistre } = await searchParams;

  const [posts, counts] = await Promise.all([
    prisma.newsPost.findMany({
      where: statut === "PUBLIEE" || statut === "BROUILLON" ? { status: statut } : undefined,
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        featured: true,
        pinned: true,
        publishedAt: true,
        updatedAt: true,
        views: true,
        category: { select: { name: true, color: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.newsPost.groupBy({ by: ["status"], _count: true }),
  ]);

  const countOf = (status: string) =>
    counts.find((entry) => entry.status === status)?._count ?? 0;

  return (
    <>
      <AdminHeader
        title="Actualités"
        description="Les articles publiés alimentent la page d'accueil, la rubrique Actualités et le flux RSS."
        breadcrumb={[{ label: "Actualités" }]}
        actions={
          <ButtonLink href="/admin/actualites/nouvelle" size="sm" icon="Plus">
            Nouvelle actualité
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          L'actualité a bien été enregistrée.
        </Notice>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/actualites" active={!statut} count={countOf("PUBLIEE") + countOf("BROUILLON")}>
          Toutes
        </FilterLink>
        <FilterLink
          href="/admin/actualites?statut=PUBLIEE"
          active={statut === "PUBLIEE"}
          count={countOf("PUBLIEE")}
        >
          Publiées
        </FilterLink>
        <FilterLink
          href="/admin/actualites?statut=BROUILLON"
          active={statut === "BROUILLON"}
          count={countOf("BROUILLON")}
        >
          Brouillons
        </FilterLink>
      </FilterBar>

      <Panel>
        {posts.length === 0 ? (
          <AdminEmpty
            icon="Newspaper"
            title="Aucune actualité"
            description="Publiez une première actualité pour informer les habitants."
            action={
              <ButtonLink href="/admin/actualites/nouvelle" icon="Plus">
                Rédiger une actualité
              </ButtonLink>
            }
          />
        ) : (
          <DataTable
            caption="Liste des actualités"
            columns={[
              { label: "Titre" },
              { label: "Rubrique" },
              { label: "Publication" },
              { label: "Vues", className: "text-right" },
              { label: "État" },
              { label: "Actions", sr: true },
            ]}
          >
            {posts.map((post) => (
              <tr key={post.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell header>
                  <Link
                    href={`/admin/actualites/${post.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {post.title}
                  </Link>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--texte-doux)]">
                    {post.pinned ? <Pill tone="attente" icon="Star">À la une</Pill> : null}
                    {post.featured ? <Pill tone="neutre">Mise en avant</Pill> : null}
                    <span>modifiée {formatRelative(post.updatedAt)}</span>
                    {post.author ? <span>· {post.author.name}</span> : null}
                  </span>
                </Cell>
                <Cell>
                  {post.category ? (
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-[color:var(--texte-doux)]">—</span>
                  )}
                </Cell>
                <Cell className="text-xs whitespace-nowrap text-[color:var(--texte-doux)]">
                  {post.publishedAt ? formatDate(post.publishedAt, "d MMM yyyy") : "non publiée"}
                </Cell>
                <Cell className="text-right text-xs tabular-nums text-[color:var(--texte-doux)]">
                  {post.views}
                </Cell>
                <Cell>
                  <Pill tone={post.status === "PUBLIEE" ? "publie" : "brouillon"}>
                    {post.status === "PUBLIEE" ? "Publiée" : "Brouillon"}
                  </Pill>
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/actualites/${post.id}`}
                    items={[
                      {
                        label: post.status === "PUBLIEE" ? "Dépublier" : "Publier",
                        icon: post.status === "PUBLIEE" ? "EyeOff" : "CheckCheck",
                        action: basculerPublicationActualite.bind(null, post.id),
                      },
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer définitivement l'actualité « ${post.title} » ?`,
                        action: supprimerActualite.bind(null, post.id),
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
